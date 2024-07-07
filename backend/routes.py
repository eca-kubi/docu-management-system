import hashlib
import os
import random
from datetime import datetime

import requests
from flask import Blueprint, send_file, jsonify, request
from flask_cors import cross_origin
from tinydb import Query
from werkzeug.utils import secure_filename

from helpers import compute_file_hash
from library.python.Database import Database
from library.python.Document import Document as TrieDocument

# Upload Path Configuration
UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') if os.environ.get('UPLOAD_FOLDER') else './uploads'
# Ensure the Directory Exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


db = Database().get_db()

search_bp = Blueprint('search', __name__)
upload_file_bp = Blueprint('upload_file', __name__)
download_bp = Blueprint('download', __name__)
delete_bp = Blueprint('delete', __name__)

add_dummy_documents_bp = Blueprint('add_dummy_documents', __name__)


@search_bp.route('/search', methods=['GET'])
def search():
    from app import trieUsersMap  # Lazy import

    # Get the user id and document title from the query parameters
    user_id = request.args.get('user_id')
    title = request.args.get('title')

    # Fetch the TrieNode for the corresponding user id
    trie_user = trieUsersMap.get(user_id)

    if not trie_user:
        return {'message': 'User not found'}, 404

    # Search the TrieNode for the document using the title
    documents = trie_user.trie.search(title)

    # Convert the documents to a list of dictionaries for the response
    documents_dict = [document.__dict__ for document in documents]

    return documents_dict, 200


def case_insensitive_equals(field_value, comparison_value):
    return field_value.lower().strip() == comparison_value.lower().strip()


@search_bp.route('/validate_title', methods=['GET'])
def validate_title():
    # Get the user id and document title from the query parameters
    user_id = request.args.get('user_id')
    title = request.args.get('title')

    # Check if user_id and title are provided
    if not user_id or not title:
        return {'message': 'User ID and title are required'}, 400

    # Query the documents table for the given title and user_id
    Document = Query()
    documents_table = db.table('documents')
    existing_document = documents_table.get(
        (Document.userId == user_id) & (Document.title.test(case_insensitive_equals, title)))

    if existing_document:
        return {'exists': True, 'message': 'Title already exists'}, 200
    else:
        return {'exists': False, 'message': 'Title does not exist'}, 200


@upload_file_bp.route('/documents/upload', methods=['POST'])
@cross_origin()  # This enables CORS for this specific route
def upload_file():
    # check if the post request has the file part
    if 'file' not in request.files:
        return {'message': 'No file part in the request'}, 400

    user_id = request.form.get('userId')
    file = request.files['file']
    title = request.form.get('title').strip()
    categories = request.form.get('categories')

    if not title:
        return {'message': 'Title is required'}, 400

    if not categories:
        return {'message': 'Categories are required'}, 400

    # if user does not select file, browser submits an empty part without filename
    if file.filename == '':
        return {'message': 'No selected file'}, 400
    try:
        if file:
            filename = secure_filename(file.filename)
            file_extension = os.path.splitext(filename)[1]

            # Calculate the hash
            file_hash = compute_file_hash(file.stream)

            # Get the user from the database
            User = Query()
            users_table = db.table('users')
            user = users_table.get(User.id == user_id)
            author = user['firstName'] + ' ' + user['lastName'] if user else 'Anonymous'

            # Check if a document with the same hash value already exists
            Document = Query()
            documents_table = db.table('documents')
            existing_document = documents_table.get(Document.hashValue == file_hash)

            if existing_document:
                return {
                    'message': 'This file already exists',
                    'error': 'duplicate file',
                    'existing_document': {
                        'title': existing_document['title'],
                        'uploadDate': existing_document['uploadDateReadable'],
                        'categories': existing_document['categories']
                    }
                }, 400
            else:
                new_categories = categories.split(',')
                # Create a new document
                new_document = {
                    'id': Database.generate_id(),
                    'userId': user_id,
                    'author': author,
                    'title': title,
                    'hashValue': file_hash,
                    'fileExt': file_extension,
                    'fileType': file_extension,
                    'uploadDate': datetime.now().isoformat(),
                    'uploadDateReadable': datetime.now().strftime('%d-%b-%Y %H:%M'),
                    'categories': new_categories
                }

                # Save the file
                file_name = f"{new_document['hashValue']}{new_document['fileExt']}"
                # Reset the file stream position again before saving
                file.stream.seek(0)  # Move the stream pointer back to the beginning
                file.save(os.path.join(UPLOAD_FOLDER, file_name))  # Save with new file name

                # insert the document into the database
                documents_table.insert(new_document)
                # insert the document into the trie
                from app import trieUsersMap
                trie_user = trieUsersMap.get(user_id)
                document = TrieDocument(new_document['id'], new_document['title'], new_document['hashValue'],
                                        new_document['fileExt'])
                trie_user.trie.insert(document)

                # update categories
                existing_categories = db.table('categories').get(doc_id=1)['data']
                existing_categories.extend(new_categories)
                updated_categories = list(set(existing_categories))  # remove duplicates
                db.table('categories').update({'data': updated_categories}, doc_ids=[1])

                return {'message': 'File successfully uploaded', 'document': new_document}, 200
    except Exception as e:
        return {'message': str(e)}, 500


@download_bp.route('/download/<file_id>', methods=['GET'])
def download_file(file_id):

    Document = Query()
    documents_table = db.table('documents')
    document = documents_table.get(Document.id == file_id)

    if not document:
        return jsonify({'message': 'File not found'}), 404

    file_path = os.path.join(UPLOAD_FOLDER, f"{document['hashValue']}{document['fileExt']}")

    if not os.path.exists(file_path):
        return jsonify({'message': 'File not found on server'}), 404

    return send_file(file_path, as_attachment=True, download_name=document['title'] + document['fileExt'])


@delete_bp.route('/delete/<file_id>', methods=['DELETE'])
def delete_file(file_id):

    Document = Query()
    documents_table = db.table('documents')
    document = documents_table.get(Document.id == file_id)

    if not document:
        return jsonify({'message': 'File not found'}), 404

    file_path = os.path.join(UPLOAD_FOLDER, f"{document['hashValue']}{document['fileExt']}")

    if os.path.exists(file_path):
        os.remove(file_path)

    documents_table.remove(Document.id == file_id)

    # remove the document from the trie
    from app import trieUsersMap
    trie_user = trieUsersMap.get(document['userId'])
    trie_user.trie.remove(TrieDocument(document['id'], document['title'], document['hashValue'], document['fileExt']))

    return jsonify({'message': 'File successfully deleted'}), 200


@add_dummy_documents_bp.route('/add_dummy_documents', methods=['POST'])
def add_dummy_documents():
    data = request.get_json()
    document_set_size = data.get('document_set_size')
    user_id = data.get('user_id')

    if not document_set_size or not user_id:
        return jsonify({'error': 'document_set_size and user_id are required'}), 400

    documents = db.table('documents')
    users = db.table('users')
    if not users.contains(Query().id == user_id):
        return jsonify({'error': 'User ID does not exist'}), 400

    for _ in range(document_set_size):
        document = generate_random_document(user_id)
        documents.insert(document)
        # Trie update logic exists
        from app import trieUsersMap
        trie_user = trieUsersMap.get(user_id)
        document = TrieDocument(document['id'], document['title'], document['hashValue'],
                                document['fileExt'])
        trie_user.trie.insert(document)

    return jsonify({'message': f'{document_set_size} documents added for user {user_id}'}), 201


# Helper function to generate a unique and meaningful document title
def generate_unique_title():
    title_length = random.randint(10, 50)
    words = []

    while len(' '.join(words)) < title_length:
        response = requests.get('https://random-word-api.herokuapp.com/word?number=10')
        if response.status_code == 200:
            words.extend(response.json())
        else:
            break  # Break the loop if the API call fails

    title = ' '.join(words)
    return title[:title_length]  # Ensure the title is exactly the desired length


# Helper function to generate a random document
# noinspection PyDeprecation
def generate_random_document(user_id):
    categories = db.table('categories').all()[0]['data']
    random_category = random.choice(categories)

    # Create a random document with a unique title
    document = {
        'id': Database.generate_id(),
        'userId': user_id,
        'author': db.table('users').get(Query().id == user_id)['name'],
        'title': generate_unique_title(),
        'hashValue': hashlib.sha256(str(random.random()).encode('utf-8')).hexdigest(),
        'fileExt': '.txt',
        'fileType': '.txt',
        'uploadDate': datetime.utcnow().isoformat(),
        'uploadDateReadable': datetime.utcnow().strftime('%d-%b-%Y %H:%M'),
        'categories': [random_category]
    }

    return document
