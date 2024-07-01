const {randomUserGen, randomDocGen, randomCategoriesGen} = require("./utils");

module.exports = () => {
    try {
        //const users = [randomUserGen(), randomUserGen(), randomUserGen()]
        // use previous users for now to simplify testing
        const users = require('./json-db.json').users;
        console.log('User 1:', users[0])
        const categories = randomCategoriesGen(20)
        const documents = users.map((user) =>
            randomDocGen({num: 15, userId: user.id, author: user.name}))
            .reduce((acc, val) => acc.concat(val), [])

        return {
            users,
            categories,
            documents
        };
    } catch (e) {
        console.log(e);
    }
}

