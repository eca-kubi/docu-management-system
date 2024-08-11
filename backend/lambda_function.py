import logging
import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_restful import Api

# from helpers import initialize_trie_users
from resources.Categories import Categories
from resources.Document import Document
from resources.Documents import Documents
from resources.User import User
from resources.UserDocument import UserDocument
from resources.UserDocuments import UserDocuments
from resources.Users import Users
from routes import search_bp, download_bp, delete_bp, add_dummy_documents_bp, upload_file_bp

# Module-level global variable
# trieUsersMap = None


logger = logging.getLogger()
logger.setLevel(logging.INFO)


def setup_logging():
    # Remove any existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)

    # Add a StreamHandler
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.info("Logging configured.")


# noinspection PyShadowingNames
def create_app():
    load_dotenv()

    app = Flask(__name__)
    frontend_url = os.environ.get('FRONTEND_URL')
    if not frontend_url:
        logging.error("FRONTEND_URL environment variable is not set!")
        raise ValueError("FRONTEND_URL environment variable is not set!")

    CORS(app, resources={r"/*": {"origins": frontend_url}})

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

    return app


# Create Flask app
app = create_app()


# AWS Lambda handler function
def lambda_handler(event, context):
    import json
    from awsgi import response

    # Setup logging
    setup_logging()
    logger.info("Lambda function invoked.")

    logging.info("Received event: %s", json.dumps(event))

    try:
        if 'httpMethod' not in event:
            # This might be an HTTP API event
            http_method = event['requestContext']['http']['method']
            event['httpMethod'] = http_method

            # If path is missing, add it
            if 'path' not in event:
                event['path'] = event['requestContext']['http']['path']

            # Handle query string parameters
            if 'queryStringParameters' not in event or event['queryStringParameters'] is None:
                event['queryStringParameters'] = {}

            # Handle multi-value query string parameters (if needed)
            if 'multiValueQueryStringParameters' not in event or event['multiValueQueryStringParameters'] is None:
                event['multiValueQueryStringParameters'] = {}

        return response(app, event, context)
    except Exception as e:
        logging.error(f"Error processing request: {e}", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
