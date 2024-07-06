import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_restful import Api

from helpers import initialize_trie_users
from resources.Categories import Categories
from resources.Document import Document
from resources.Documents import Documents
from resources.User import User
from resources.UserDocument import UserDocument
from resources.UserDocuments import UserDocuments
from resources.Users import Users
from routes import search_bp, download_bp, delete_bp, add_dummy_documents_bp
from routes import upload_file_bp

# AWS Lambda requires this to be global
load_dotenv()
app = Flask(__name__)
CORS(app)

# Initialize other global variables
trieUsersMap = initialize_trie_users()

# Absolute Path Configuration
UPLOAD_FOLDER = '/tmp'  # Lambda function's writable directory
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the Directory Exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

api = Api(app)
api.add_resource(Categories, '/categories')
api.add_resource(Users, '/users')
api.add_resource(User, '/users/<string:user_id>')
api.add_resource(Documents, '/documents')
api.add_resource(Document, '/documents/<string:document_id>')
api.add_resource(UserDocument, '/users/<string:user_id>/documents/<string:doc_id>')
api.add_resource(UserDocuments, '/users/<string:user_id>/documents')
app.register_blueprint(search_bp)
app.register_blueprint(upload_file_bp)
app.register_blueprint(download_bp)
app.register_blueprint(delete_bp)
app.register_blueprint(add_dummy_documents_bp)


@app.route('/')
def hello_world():
    return "Hello DMS Backend!"


# Lambda handler function
def lambda_handler(event, context):
    from awsgi import response
    return response(app, event, context)
