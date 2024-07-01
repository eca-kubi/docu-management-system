import io
from unittest.mock import MagicMock, patch

from helpers import initialize_trie_users, compute_file_hash
from library.python.Document import Document
from library.python.TrieNode import TrieNode
from library.python.TrieUser import TrieUser


def test_initialize_trie_users():
    # Mock the Database class
    mock_db = MagicMock()
    mock_users_table = MagicMock()
    mock_documents_table = MagicMock()
    # mock_db.get_db.return_value = MagicMock()
    mock_db.table.side_effect = lambda table_name: mock_users_table if table_name == 'users' else mock_documents_table

    # Create a simple ID generator
    def id_generator():
        counter = 0
        while True:
            yield f"id_{counter}"
            counter += 1

    id_gen = id_generator()

    # Generate predictable IDs for our mock data
    user1_id = next(id_gen)
    user2_id = next(id_gen)
    doc1_id = next(id_gen)
    doc2_id = next(id_gen)
    doc3_id = next(id_gen)

    # Mock data for users and documents
    mock_users = [
        {'id': user1_id, 'name': 'User One'},
        {'id': user2_id, 'name': 'User Two'}
    ]
    mock_documents = [
        {'id': doc1_id, 'userId': user1_id, 'title': 'Document 1', 'hashValue': 'hash1', 'fileExt': 'txt'},
        {'id': doc2_id, 'userId': user1_id, 'title': 'Document 2', 'hashValue': 'hash2', 'fileExt': 'pdf'},
        {'id': doc3_id, 'userId': user2_id, 'title': 'Document 3', 'hashValue': 'hash3', 'fileExt': 'docx'}
    ]

    # Set up the mock to return our test data
    mock_users_table.all.return_value = mock_users
    mock_documents_table.search.side_effect = [
        [doc for doc in mock_documents if doc['userId'] == user1_id],
        [doc for doc in mock_documents if doc['userId'] == user2_id]
    ]

    # Patch the Database in the helpers module
    with patch('helpers.db', new=mock_db):
        result = initialize_trie_users()
        # Assert the result is a dictionary
        assert isinstance(result, dict)

        # Assert the dictionary has the correct number of users
        assert len(result) == len(mock_users)

        # Assert each value in the dictionary is a TrieUser instance
        for user_id, trie_user in result.items():
            assert isinstance(trie_user, TrieUser)
            assert user_id in [user1_id, user2_id]
            assert isinstance(trie_user.trie, TrieNode)

        # Assert the documents are correctly inserted into the TrieNodes
        for user_id, trie_user in result.items():
            user_docs = trie_user.trie.search('')
            expected_docs = [doc for doc in mock_documents if doc['userId'] == user_id]

            assert len(user_docs) == len(expected_docs)

            for doc in user_docs:
                assert isinstance(doc, Document)
                assert any(doc.id == expected_doc['id'] for expected_doc in expected_docs)
                assert any(doc.title == expected_doc['title'] for expected_doc in expected_docs)
                assert any(doc.hashValue == expected_doc['hashValue'] for expected_doc in expected_docs)
                assert any(doc.fileExt == expected_doc['fileExt'] for expected_doc in expected_docs)


def test_compute_file_hash():
    # Create a mock file object with some content
    file_content = b"This is a test file content."
    mock_file = io.BytesIO(file_content)

    # Compute the hash
    result = compute_file_hash(mock_file)

    # Assert the result is a string
    assert isinstance(result, str)

    # Assert the length of the hash (SHA-256 produces a 64-character hexadecimal string)
    assert len(result) == 64

    # Assert the hash is correct (pre-computed for the given content)
    expected_hash = "dddb3cd3dbaf57421a0b001e3f8224c71d742133e1482ba3211f70e8f794796a"
    assert result == expected_hash

    # Test with an empty file
    empty_file = io.BytesIO(b"")
    empty_result = compute_file_hash(empty_file)
    assert len(empty_result) == 64
    assert empty_result == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"  # SHA-256 of empty string
