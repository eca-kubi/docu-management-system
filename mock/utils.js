const {faker} = require('@faker-js/faker')
const _ = require('lodash')

const randomUserGen = () => {
    const id = faker.string.uuid()
    const sex = faker.person.sex()
    const firstName = faker.person.firstName({sex})
    const lastName = faker.person.lastName({sex})
    const avatar = faker.image.avatar()
    const bio = faker.person.bio()
    const position = faker.person.jobTitle()
    const prefix = faker.person.prefix(sex)
    return {
        id,
        firstName,
        lastName,
        name: faker.person.fullName({firstName, lastName}),
        email: faker.internet.email({firstName, lastName}),
        avatar,
        bio,
        position,
        prefix
    }
}

const getHumanReadableDate = (date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
const randomDocGen = ({num = 1, userId, author}) => {
    return [...new Array(num)].map(() => {
            const uploadDate = faker.date.past()
            return {
                id: faker.string.uuid(),
                hashValue: faker.string.uuid(),
                fileExt: faker.helpers.arrayElement(["docx", "pptx", "pdf", "xlsx"]),
                userId,
                author,
                title: _.startCase(faker.lorem.words(2)),
                uploadDateReadable: getHumanReadableDate(uploadDate),
                uploadDate,
                fileType: faker.helpers.arrayElement(["docx", "pptx", "pdf", "xlsx"]),
                categories: faker.helpers.arrayElements(["Work", "School", "Monthly Report", "Finance", "Archive"])
            }
        }
    )
}

const randomCategoriesGen = (total) => {
    return faker.helpers.arrayElements(
        ["Work", "School", "Monthly Report", "Finance", "Archive", "Personal", "Health", "Legal", "Miscellaneous",
            "Important", "Urgent", "Pending", "Completed", "In Progress", "Review", "Draft", "Final", "Approved",
            "Rejected", "Pending Approval", "Pending Review", "Pending Feedback", "Feedback Received", "Feedback Pending"
        ],
        total
    )
}

module.exports = {
    randomUserGen,
    randomDocGen, randomCategoriesGen
}

