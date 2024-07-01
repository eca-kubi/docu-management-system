import jsonServer from 'json-server'
import fs from 'fs'
import util from 'util'
import {randomCategoriesGen, randomDocGen, randomUserGen} from './utils'

import {fileURLToPath} from 'url';
import {dirname} from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url))
const jsonFilePath = __dirname + '/json-db.json'

const initJsonDb = async () => {
    const readFile = util.promisify(fs.readFile)
    const writeFile = util.promisify(fs.writeFile)
    try {
        let data = await readFile(jsonFilePath)
        let jsondb = JSON.parse(data.toString())
        const user = randomUserGen()
        const categories = randomCategoriesGen(20)
        console.log(user)
        jsondb.users = [user]
        jsondb.categories = categories
        jsondb.documents = []
        for (let i = 0; i < 15; i++) {
            jsondb.documents.push(
                randomDocGen({userId: user.id, author: user.name})
            )
        }
        return writeFile(jsonFilePath, JSON.stringify(jsondb, null, 2))
    } catch (e) {
        console.log(e);
    }
}

const startServer = () => {
    const server = jsonServer.create()
    const router = jsonServer.router(jsonFilePath)
    const middlewares = jsonServer.defaults()

    server.use(middlewares)
    //server.use(jsonServer.rewriter({}))
    server.use(router)
    server.listen(3003, () => {
        console.log('JSON Server is running')
    })
}

initJsonDb().then(() => {
    console.log('JSON db is ready!')
    startServer()
})

