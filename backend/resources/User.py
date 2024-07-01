from flask import request
from flask_restful import Resource
from tinydb import Query

from library.python.Database import Database

db = Database().get_db()


class User(Resource):

    @staticmethod
    def get(user_id):
        User = Query()
        users_table = db.table('users')
        user = users_table.search(User.id == user_id)
        if user:
            return user[0], 200
        else:
            return {"error": "User not found"}, 404

    @staticmethod
    def patch(user_id):
        updated_user = request.get_json()
        User = Query()
        db.update(updated_user, User.id == user_id)
        return updated_user, 200

    @staticmethod
    def put(user_id):
        updated_user = request.get_json()
        User = Query()
        db.update(updated_user, User.id == user_id)
        return updated_user, 200

    @staticmethod
    def delete(user_id):
        User = Query()
        db.remove(User.id == user_id)
        return {"message": "User deleted"}, 200
