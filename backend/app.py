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

load_dotenv()  # take environment variables from .env.

app = Flask(__name__)

trieUsersMap = initialize_trie_users()

CORS(app)

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
def hello_world():  # put application's code here
    temp = "Hello DMS Backend!"
    return temp


if __name__ == '__main__':
    try:
        port = int(os.getenv('PORT', 5000))  # Get port from environment variable, default to 5000 if not set
        app.run(port=port, debug=True, use_reloader=True)
    except Exception as e:
        print(e)
        print("Failed to start server")
