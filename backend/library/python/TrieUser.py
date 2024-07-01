class TrieUser:
    """
    A class to represent a TrieUser.

    ...

    Attributes
    ----------
    trie : TrieNode
        a TrieNode object that represents the TrieNode of the user
    user_id : str
        a string that represents the unique id of the user

    Methods
    -------
    __init__(self, trie, user_id)
        Constructs all the necessary attributes for the TrieUser object.
    """

    def __init__(self, trie, user_id):
        """
        Constructs all the necessary attributes for the TrieUser object.

        Parameters
        ----------
            trie : TrieNode
                a TrieNode object that represents the TrieNode of the user
            user_id : str
                a string that represents the unique id of the user
        """
        self.trie = trie
        self.user_id = user_id
