import useSWR, {mutate as globalMutate} from "swr";

const fetcher = url => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error(`An error occurred: ${res.status}`);
    }
    return res.json();
});
const useCategories = () => {
    const key = `${process.env.REACT_APP_API_URL}/categories`;
    const { data: categories, error, isLoading } = useSWR(key, fetcher);
    return { categories, mutate: () => globalMutate(key), error, isLoading };
}

const useDocuments = (userId) => {
    const key = `${process.env.REACT_APP_API_URL}/users/${userId}/documents`;
    const { data: documents, error, isLoading } = useSWR(key, fetcher);
    return { documents, mutate: () => globalMutate(key), error, isLoading };
}


export {useCategories, useDocuments}