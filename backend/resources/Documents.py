from flask import request
from flask_restful import Resource
from tinydb import Query
from library.python.Database import Database
from resources.User import User

db = Database().get_db()


class Documents(Resource):

    @staticmethod
    def get():
        documents_table = db.table('documents')
        documents = documents_table.all()
        return documents, 200

    @staticmethod
    def post():
        new_document = request.get_json()
        new_document['id'] = Database.generate_id()  # We can use the same ID generator method from User class
        documents_table = db.table('documents')
        documents_table.insert(new_document)
        return new_document, 201

