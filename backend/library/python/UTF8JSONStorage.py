import json
import codecs
from tinydb.storages import JSONStorage


class UTF8JSONStorage(JSONStorage):
    def __init__(self, path, create_dirs=False, encoding='utf-8', sort_keys=True, indent=4, separators=(',', ': ')):
        super().__init__(path, create_dirs)
        self.path = path
        self.encoding = encoding
        self.sort_keys = sort_keys
        self.indent = indent
        self.separators = separators

    def read(self):
        with codecs.open(self.path, 'r', encoding=self.encoding) as handle:
            content = handle.read()
            if not content.strip():  # Check if the file is empty or contains only whitespace
                print(f"File {self.path} is empty or contains only whitespace.")
                return None
            return json.loads(content)

    def write(self, data):
        with codecs.open(self.path, 'w', encoding=self.encoding) as handle:
            json.dump(data, handle, indent=self.indent, separators=self.separators)
