from flask import request
from flask_restful import Resource
from tinydb import Query
from library.python.Database import Database
from resources.User import User

db = Database().get_db()


class Document(Resource):

    @staticmethod
    def get(document_id):
        Document = Query()
        documents_table = db.table('documents')
        document = documents_table.search(Document.id == document_id)
        if document:
            return document[0], 200
        else:
            return {"error": "Document not found"}, 404

    @staticmethod
    def patch(document_id):
        Document = Query()
        updated_document = request.get_json()
        existing_document = db.table('documents').get(Document.id == document_id)
        if not existing_document:
            return {"error": "Document not found"}, 404
        updated_document = {**existing_document, **updated_document}
        documents_table = db.table('documents')
        documents_table.update(updated_document, Document.id == document_id)
        return updated_document, 200

    @staticmethod
    def put(document_id):
        updated_document = request.get_json()
        Document = Query()
        documents_table = db.table('documents')
        documents_table.update(updated_document, Document.id == document_id)
        return updated_document, 200

    @staticmethod
    def delete(document_id):
        Document = Query()
        documents_table = db.table('documents')
        documents_table.remove(Document.id == document_id)
        return "", 204
