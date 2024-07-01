# File: resources/UserDocument.py
from flask import request
from flask_restful import Resource
from tinydb import Query
from library.python.Database import Database

db = Database().get_db()


class UserDocument(Resource):

    @staticmethod
    def get(user_id, doc_id):
        Document = Query()
        documents_table = db.table('documents')
        document = documents_table.search((Document.id == doc_id) & (Document.userId == user_id))
        if document:
            return document[0], 200
        else:
            return {"error": "Document not found"}, 404

    @staticmethod
    def put(user_id, doc_id):
        updated_document = request.get_json()
        Document = Query()
        documents_table = db.table('documents')
        documents_table.update(updated_document, (Document.id == doc_id) & (Document.userId == user_id))
        return updated_document, 200

    @staticmethod
    def patch(user_id, doc_id):
        updated_document = request.get_json()
        Document = Query()
        documents_table = db.table('documents')
        documents_table.update(updated_document, (Document.id == doc_id) & (Document.userId == user_id))
        return updated_document, 200

    @staticmethod
    def delete(user_id, doc_id):
        Document = Query()
        documents_table = db.table('documents')
        documents_table.remove((Document.id == doc_id) & (Document.userId == user_id))
        return {"message": "Document deleted"}, 200
