class Document:
    """
    A class used to represent a Document.

    Attributes
    ----------
    id : str
        a string that represents the unique id of the document
    title : str
        the title of the document
    hashValue : str
        a string that represents the hash value of the document
    fileExt : str
        the file extension of the document
    """

    def __init__(self, id, title, hashValue, fileExt):
        """
        Constructs all the necessary attributes for the Document object.

        Parameters
        ----------
            id : str
                a string that represents the unique id of the document
            title : str
                the title of the document
            hashValue : str
                a string that represents the hash value of the document
            fileExt : str
                the file extension of the document
        """
        self.id = id
        self.hashValue = hashValue
        self.title = title
        self.fileExt = fileExt
