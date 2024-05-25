import hashlib
from tinydb import Query

from library.python.Database import Database
from library.python.Document import Document
from library.python.TrieNode import TrieNode
from library.python.TrieUser import TrieUser

db = Database().get_db()


def initialize_trie_users():
    """
    Initialize the TrieNodes for all users in the database
    :return: A dictionary mapping user IDs to their TrieNodes containing their documents
    """
    # Fetch all users from the database
    users = db.table('users').all()

    # Initialize an empty dictionary to store the mapping of users to their TrieNodes
    trie_users_map = {}

    # Iterate over each user
    for user in users:
        # Create a new TrieNode for the user
        trie_node = TrieNode(True)

        # Fetch all documents belonging to the current user
        documents = db.table('documents').search(Query().userId == user['id'])

        # Insert each document into the TrieNode
        for document in documents:
            trie_node.insert(Document(document['id'], document['title'], document['hashValue'], document['fileExt']))

        # Map the user to their TrieNode
        trie_users_map[user['id']] = TrieUser(trie_node, user['id'])

    # Return the map of users to their TrieNodes
    return trie_users_map


def compute_file_hash(file):
    """
    Compute the SHA-256 hash of a file

    Parameters:
    -----------
    file : file
        The file object to compute the hash for

    Returns:
    --------
    hash : str
        The SHA-256 hash of the file
    """
    sha256_hash = hashlib.sha256()

    # Read and update hash string value in blocks of 4K
    for byte_block in iter(lambda: file.read(4096), b""):
        sha256_hash.update(byte_block)

    return sha256_hash.hexdigest()
