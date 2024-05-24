import useSWR, {mutate} from "swr";

const fetcher = url => fetch(url).then((res) => res.json())

const useCategories = () => {
    const {data: categories, error, isLoading} =
        useSWR(`${process.env.REACT_APP_API_URL}/categories`, fetcher);
    return {
        categories,
        mutate,
        error,
        isLoading
    }
}

const useDocuments = (userId) => {
    const {data: documents, error, isLoading} =
        useSWR(`${process.env.REACT_APP_API_URL}/users/${userId}/documents`, fetcher);
    return {
        documents,
        mutate,
        error,
        isLoading
    }
}

export {useCategories, useDocuments}