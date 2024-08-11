import logging
from flask import request
from flask_restful import Resource
from tinydb import Query

from library.python.Database import Database

db = Database().get_db()


class Users(Resource):

    @staticmethod
    def get():
        email = request.args.get('email')
        if email:
            User = Query()
            users_table = db.table('users')
            user = users_table.search(User.email == email)
            if user:
                return user[0], 200
            else:
                return {"error": "User not found"}, 404
        else:
            users_table = db.table('users')  # Specify the table
            users = users_table.all()  # Retrieve all records from the 'users' table
            logger = logging.getLogger()
            logger.info(f"Users: {users}")
            return users, 200

    @staticmethod
    def post():
        new_user = request.get_json()
        new_user['id'] = Database.generate_id()
        users_table = db.table('users')
        users_table.insert(new_user)
        return new_user, 201
