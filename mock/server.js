require('dotenv').config({path: '../.env'});
const jsonServer = require('json-server');
const _ = require('lodash');
const TrieNode = require('./library/js/TrieNode');
const Document = require('./library/js/Document');
const TrieUser = require('./library/js/TrieUser');
const multer = require('multer');
let trieUsers = [];
const PORT = process.env.JSON_SERVER_PORT || 3003;

function initializeTrie() {
    const users = require('./json-db.json').users;
    const documents = require('./json-db.json').documents;
    trieUsers = users.map(user => {
        const trieNode = new TrieNode(true);
        documents.filter(document => document.userId === user.id).forEach(document => {
            trieNode.insert(new Document(document.id, document.title));
        });
        return new TrieUser(user.id, trieNode);
    })
}

try {
    initializeTrie();
    const server = jsonServer.create();
    const getData = require('./random-data');
    const data = getData();
    require('fs').writeFileSync('./backend/json-db.json', JSON.stringify(data, null, 2))
    const router = jsonServer.router('./backend/json-db.json');
    const middlewares = jsonServer.defaults();

    server.use(jsonServer.bodyParser);
    server.use(middlewares);

    // Add this before server.use(router)
    server.post('/categories', (req, res, next) => {
        let newCategories = req.body.categories;
        if (!_.isEmpty(newCategories)) {
            let db = router.db; //lowdb instance
            let categories = db.get('categories').value(); //get categories array
            db.get('categories').assign([...new Set(categories.concat(newCategories))]).write(); //write back to
            res.status(200).jsonp({categories});
        } else {
            res.sendStatus(400);
        }
    });

    server.get('/users/:userId/documents/:id', (req, res) => {
        const documents = router.db.get('documents');
        const document = documents.find({id: req.params.id, userId: req.params.userId}).value();
        if (document) {
            res.jsonp(document);
        } else {
            res.status(404).jsonp({error: "Document not found"});
        }
    });

    server.get('/users/:userId/documents', (req, res) => {
        const documents = router.db.get('documents');
        const userDocuments = documents.filter({userId: req.params.userId}).value();
        if (userDocuments && userDocuments.length > 0) {
            res.jsonp(userDocuments);
        } else {
            res.status(404).jsonp({error: "No documents found for this user"});
        }
    });

    server.patch('/documents/:id', (req, res) => {
        const documents = router.db.get('documents');
        const document = documents.find({id: req.params.id}).value();
        if (document) {
            const updatedDocument = documents.find({id: req.params.id}).assign(req.body).write();
            res.jsonp(updatedDocument);
        } else {
            res.status(404).jsonp({error: "Document not found"});
        }
    });

    server.get('/search/:userId/:searchPrefix', (req, res) => {
        const userId = req.params.userId;
        const searchPrefix = req.params.searchPrefix;

        const trieUser = trieUsers.find(user => user.userId === userId);
        if (!trieUser) {
            res.status(404).send('User not found');
            return;
        }

        const documents = trieUser.trieNode.search(searchPrefix);
        res.send(documents);
    });

    // Configure multer storage
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            try {
                cb(null, './backend/uploads')
            } catch (error) {
                console.error(error);
                cb(error);
            }
        }, filename: function (req, file, cb) {
            try {
                cb(null, Date.now() + '-' + file.originalname)
            } catch (error) {
                console.error(error);
                cb(error);
            }
        }
    })

    const upload = multer({storage: storage})

    server.post('/upload', upload.single('file'), (req, res, next) => {
        try {
            return res.status(200).jsonp({
                message: 'File uploaded successfully'
            });
        } catch (error) {
            next(error);
        }
    }, (err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            res.status(500).jsonp({message: "Multer error: " + err.message, error: err});
        } else if (err) {
            // An unknown error occurred when uploading.
            res.status(500).jsonp({message: "Unknown error: " + err.message, error: err});
        }
    });

    server.use(router);
    server.listen(PORT, () => {
        console.log('JSON Server is running');
        console.log(`http://localhost:${PORT}`);
    });
} catch (e) {
    console.log(e);
}
