# File: resources/UserDocuments.py
from flask_restful import Resource
from tinydb import Query

from library.python.Database import Database

db = Database().get_db()


class UserDocuments(Resource):

    @staticmethod
    def get(user_id):
        try:
            Document = Query()
            documents_table = db.table('documents')
            documents = documents_table.search(Document.userId == user_id)
            return documents, 200
        except Exception as e:
            return {'error': str(e), 'message': 'Failed to retrieve documents'}, 500
