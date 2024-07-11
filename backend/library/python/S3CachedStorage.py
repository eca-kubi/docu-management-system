import json
import os
import boto3
from tinydb.storages import Storage


class S3CachedStorage(Storage):
    def __init__(self, bucket_name, file_name, cache_dir='/tmp'):
        self.s3 = boto3.client('s3')
        self.bucket = bucket_name
        self.file = file_name
        self.cache_path = os.path.join(cache_dir, file_name)
        self.cache_timestamp = 0
        self._load_cache()

    def _load_cache(self):
        try:
            s3_object = self.s3.head_object(Bucket=self.bucket, Key=self.file)
            s3_timestamp = s3_object['LastModified'].timestamp()

            if not os.path.exists(self.cache_path) or s3_timestamp > self.cache_timestamp:
                self.s3.download_file(self.bucket, self.file, self.cache_path)
                self.cache_timestamp = s3_timestamp
                print(f"Downloaded {self.file} from S3")
        except self.s3.exceptions.ClientError:
            # File doesn't exist in S3, create an empty cache file
            with open(self.cache_path, 'w') as f:
                json.dump({}, f)
            print(f"Created an empty cache file {self.cache_path}")

    def read(self):
        with open(self.cache_path, 'r') as f:
            return json.load(f)

    def write(self, data):
        with open(self.cache_path, 'w') as f:
            json.dump(data, f)

        self.s3.upload_file(self.cache_path, self.bucket, self.file)
        self.cache_timestamp = os.path.getmtime(self.cache_path)