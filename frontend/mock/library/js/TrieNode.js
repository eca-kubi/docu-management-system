class TrieNode {
    constructor(isRoot = false) {
        this.children = {};
        this.isEndOfWord = false;
        this.isRoot = isRoot;
        this.document = null;
    }

    insert(document) {
        let node = this;
        const word = document.title.toLowerCase().trim();
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            if (node.children[char] === undefined) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
        node.document = document;
    }

    search(prefix) {
        let node = this;
        prefix = prefix.toLowerCase().trim();
        for (let i = 0; i < prefix.length; i++) {
            const char = prefix[i];
            if (node.children[char] === undefined) {
                return [];
            }
            node = node.children[char];
        }
        return this._getWords(node);
    }

    _getWords(node) {
        let documents = [];
        if (node.isEndOfWord) {
            documents.push(node.document);
        }
        for (let child in node.children) {
            documents = documents.concat(this._getWords(node.children[child]));
        }
        return documents;
    }
}

module.exports = TrieNode;