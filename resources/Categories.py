from flask import request
from flask_restful import Resource

from library.python.Database import Database

db = Database().get_db()


class Categories(Resource):
    # @staticmethod
    # def get_categories():
    #     try:
    #         with open('./json-db.json', 'r', encoding='utf-8') as f:
    #             data = json.load(f)
    #             categories = data['categories']
    #         return categories
    #     except Exception as e:
    #         return {"error": str(e)}, 500
    #
    # @staticmethod
    # def write_categories(categories):
    #     try:
    #         with open('./json-db.json', 'r', encoding='utf-8') as f:
    #             data = json.load(f)
    #             data['categories'] = categories
    #         with open('./json-db.json', 'w', encoding='utf-8') as f:
    #             json.dump(data, f, indent=4)
    #     except Exception as e:
    #         return {"error": str(e)}, 500

    @staticmethod
    def get():
        categories = db.table('categories').get(doc_id=1)
        if not categories:
            return {"error": "Categories not found"}, 404
        return categories['data'], 200

    @staticmethod
    def post():
        new_categories = request.get_json().get('categories')
        if new_categories:
            existing_categories = db.table('categories').get(doc_id=1)['data']
            existing_categories.extend(new_categories)
            updated_categories = list(set(existing_categories))  # remove duplicates
            db.table('categories').update({'data': updated_categories}, doc_ids=[1])
            return updated_categories, 200
        else:
            return {"error": "No categories provided"}, 400
