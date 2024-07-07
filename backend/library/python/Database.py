import json
import os
import uuid

from tinydb import TinyDB
from library.python.Singleton import Singleton
from library.python.UTF8JSONStorage import UTF8JSONStorage


def is_list_of_dicts(data):
    if isinstance(data, list):
        return all(isinstance(item, dict) for item in data)
    return False


def list_to_single_value_dict(lst, key='1'):
    return {'result': {'id': key, 'data': lst}} if isinstance(lst, list) else TypeError("Input should be a list")


def preprocess_data(data):
    # Check if data is a list
    if not is_list_of_dicts(data):
        if isinstance(data, list):
            return list_to_single_value_dict(data)  # Convert the list to a dictionary
        elif isinstance(data, dict):
            return data
        else:
            raise ValueError("Data should be a list of dictionaries")

    # Check if each item in the list is a dictionary
    for item in data:
        if not isinstance(item, dict):
            raise ValueError("Each item in the list should be a dictionary")

    # Transform the list of dictionaries into a dictionary of dictionaries
    transformed_data = {item['id']: item for item in data}

    return transformed_data


class Database(metaclass=Singleton):
    def __init__(self):
        self.db_path = os.environ.get('DB_PATH') if os.environ.get('DB_PATH') else './db.json'
        self.db = TinyDB(self.db_path, storage=UTF8JSONStorage, sort_keys=True, indent=4, separators=(',', ': '))

    def get_db(self):
        return self.db

    @staticmethod
    def generate_id():
        return str(uuid.uuid4())

    def populate_db(self, resource_name):
        with open(self.db_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            resources = data.get(resource_name, [])  # Access the resource key
            resources = preprocess_data(resources)  # Preprocess the data
            self.db.drop_table(resource_name)  # Drop the table
            table = self.db.table(resource_name)  # Specify the table
            if isinstance(resources, dict):  # Check if resources is a dictionary
                for resource_id, resource in resources.items():
                    if isinstance(resource, dict):  # Check if resource is a dictionary
                        table.insert(resource)
                    else:
                        print(f"Skipping resource with ID {resource_id} as it's not a dictionary")
            else:
                print("Resources is not a dictionary.")
