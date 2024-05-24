import {get} from '../utils/api'

const getDocuments = async (baseApiUrl) => {
    try {
        return await get(`${baseApiUrl}/documents`)
    } catch (e) {
        console.log(e)
        throw e
    }
}



const getUsers = async (baseApiUrl) => {
    try {
        return await get(`${baseApiUrl}/users`)
    } catch (e) {
        console.log(e)
        throw e
    }
}

const getCategories = async (baseApiUrl) => {
    try {
        return await get(`${baseApiUrl}/categories`)
    } catch (e) {
        console.log(e)
        throw e
    }
}

export {
    getDocuments,
    getUsers,
    getCategories
}