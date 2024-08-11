import logging
import json
import boto3
from botocore.exceptions import ClientError
from tinydb.storages import Storage


class DynamoDbCachedStorage(Storage):
    def __init__(self, table_name):
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table(table_name)
        self.logger = logging.getLogger()

    def read(self):
        try:
            response = self.table.get_item(Key={'id': 'db'}, ConsistentRead=True)
            if 'Item' in response:
                return json.loads(response['Item']['db_dump'])
            else:
                return {}
        except ClientError as e:
            self.logger.error(f"Error reading from DynamoDB: {e}")
            return {}
        except json.JSONDecodeError as e:
            self.logger.error(f"Error parsing JSON data: {e}")
            return {}
        except KeyError as e:
            self.logger.error(f"KeyError: {e}")
            return {}
        except Exception as e:
            self.logger.error(f"Error reading from DynamoDB: {e}")
            return {}

    def write(self, data):
        try:
            json_data = json.dumps(data)
            self.table.put_item(Item={'id': 'db', 'db_dump': json_data})
        except ClientError as e:
            self.logger.error(f"Error writing to DynamoDB: {e}")
        except json.JSONDecodeError as e:
            self.logger.error(f"Error parsing JSON data: {e}")
        except KeyError as e:
            self.logger.error(f"KeyError: {e}")
        except Exception as e:
            self.logger.error(f"Error writing to DynamoDB: {e}")

    def __len__(self):
        return len(self.read())
