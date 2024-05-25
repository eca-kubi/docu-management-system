import os
from datetime import datetime

from flask import Blueprint
from flask import request
from flask_cors import cross_origin
from tinydb import Query
from werkzeug.utils import secure_filename


from helpers import compute_file_hash
from library.python.Database import Database

db = Database().get_db()

search_bp = Blueprint('search', __name__)
upload_file_bp = Blueprint('upload_file', __name__)


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


@upload_file_bp.route('/upload', methods=['POST'])
@cross_origin()  # This enables CORS for this specific route
def upload_file():
    from app import app
    # check if the post request has the file part
    if 'file' not in request.files:
        return {'message': 'No file part in the request'}, 400

    user_id = request.args.get('userId')
    user = db.table('users').get(doc_id=user_id)
    file = request.files['file']
    title = request.args.get('title')
    categories = request.args.get('categories')

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

            # Check if a document with the same hash value already exists
            Document = Query()
            documents_table = db.table('documents')
            existing_document = documents_table.get(Document.hashValue == file_hash)

            if existing_document:
                return {
                    'message': 'A file with the same content already exists',
                    'existing_document': {
                        'title': existing_document['title'],
                        'uploadDate': existing_document['uploadDate'],
                        'categories': existing_document['categories']
                    }
                }, 400
            else:
                # Create a new document
                # Create a new document
                new_document = {
                    'id': Database.generate_id(),
                    'userId': user_id,
                    'author': user['firstName'] + ' ' + user['lastName'],
                    'title': title,
                    'hashValue': file_hash,
                    'fileExt': file_extension,
                    'fileType': file_extension,
                    'uploadDate': datetime.now().isoformat(),
                    'uploadDateReadable': datetime.now().strftime('%Y-%mm-%dd %H:%M:%S'),
                    'categories': categories.split(',')
                }
                documents_table.insert(new_document)
                # insert the document into the trie
                from app import trieUsersMap
                trie_user = trieUsersMap.get(user_id)
                trie_user.trie.insert(new_document)
                # Save the file
                file_name = f"{new_document['hashValue']}{new_document['fileExt']}"
                # Reset the file stream position again before saving
                file.stream.seek(0)  # Move the stream pointer back to the beginning
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], file_name))  # Save with new file name
                return {'message': 'File successfully uploaded', 'hash': file_hash}, 200
    except Exception as e:
        return {'message': str(e)}, 500
