class TrieNode:
    """
    A TrieNode class to represent a node in a Trie data structure

    Attributes:
    ----------
    children : dict
        a dictionary that maps characters to TrieNodes
    is_end_of_word : bool
        a boolean that represents whether the node is the end of a word
    is_root : bool
        a boolean that represents whether the node is the root of the Trie
    document : Document
        a Document object representing the document associated with the node

    Methods:
    --------
    insert(self, document)
        Inserts a document into the Trie
    search(self, prefix)
        Searches for documents with a given prefix
    _get_words(self, node)
        Helper method to get all documents associated with a node
    """
    def __init__(self, is_root=False):
        self.children = {}
        self.is_end_of_word = False
        self.is_root = is_root
        self.document = None

    def insert(self, document):
        """
        Inserts a document into the Trie

        Parameters:
        -----------
        document : Document
            a Document object representing the document to be inserted
        """
        node = self
        word = document.title.lower().strip()
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True
        node.document = document

    def search(self, prefix):
        """
        Searches for documents with a given prefix

        Parameters:
        -----------
        prefix : str
            a string representing the prefix to search for

        Returns:
        --------
        documents : list
            a list of Document objects that match the prefix
        """
        node = self
        prefix = prefix.lower().strip()
        for char in prefix:
            if char not in node.children:
                return []
            node = node.children[char]
        return self._get_words(node)

    def _get_words(self, node):
        """
        Helper method to get all documents associated with a node

        Parameters:
        -----------
        node : TrieNode
            a TrieNode object representing the node to get documents from

        Returns:
        --------
        documents : list
            a list of Document objects associated with the node
        """
        documents = []
        if node.is_end_of_word:
            documents.append(node.document)
        for child in node.children.values():
            documents.extend(self._get_words(child))
        return documents
