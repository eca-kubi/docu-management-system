import os
from datetime import datetime

from flask import Blueprint, send_file, jsonify
from flask import request
from flask_cors import cross_origin
from tinydb import Query
from werkzeug.utils import secure_filename

from helpers import compute_file_hash
from library.python.Database import Database
from library.python.Document import Document as TrieDocument

db = Database().get_db()

search_bp = Blueprint('search', __name__)
upload_file_bp = Blueprint('upload_file', __name__)
download_bp = Blueprint('download', __name__)
delete_bp = Blueprint('delete', __name__)


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
    existing_document = documents_table.get((Document.userId == user_id) & (Document.title == title))

    if existing_document:
        return {'exists': True, 'message': 'Title already exists'}, 200
    else:
        return {'exists': False, 'message': 'Title does not exist'}, 200


@upload_file_bp.route('/documents/upload', methods=['POST'])
@cross_origin()  # This enables CORS for this specific route
def upload_file():
    from app import app
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
                    'categories': categories.split(',')
                }
                documents_table.insert(new_document)
                # insert the document into the trie
                from app import trieUsersMap
                trie_user = trieUsersMap.get(user_id)
                document = TrieDocument(new_document['id'], new_document['title'], new_document['hashValue'],
                                        new_document['fileExt'])
                trie_user.trie.insert(document)
                # Save the file
                file_name = f"{new_document['hashValue']}{new_document['fileExt']}"
                # Reset the file stream position again before saving
                file.stream.seek(0)  # Move the stream pointer back to the beginning
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], file_name))  # Save with new file name
                return {'message': 'File successfully uploaded', 'document': new_document}, 200
    except Exception as e:
        return {'message': str(e)}, 500


@download_bp.route('/download/<file_id>', methods=['GET'])
def download_file(file_id):
    from app import UPLOAD_FOLDER

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
    from app import UPLOAD_FOLDER

    Document = Query()
    documents_table = db.table('documents')
    document = documents_table.get(Document.id == file_id)

    if not document:
        return jsonify({'message': 'File not found'}), 404

    file_path = os.path.join(UPLOAD_FOLDER, f"{document['hashValue']}{document['fileExt']}")

    if os.path.exists(file_path):
        os.remove(file_path)

    documents_table.remove(Document.id == file_id)

    return jsonify({'message': 'File successfully deleted'}), 200
