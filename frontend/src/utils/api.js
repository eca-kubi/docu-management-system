/**
 * Fetch data from the given url
 * @param {string} url - The url to fetch data from
 * @returns {Promise<{data: any, isOk: boolean}|{isOk: boolean, message: string, error: string}>}
 */
async function get(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return {
                isOk: true,
                data: data
            };
        } else {
            return {
                isOk: false,
                message: 'Api call failed!',
                error: response.statusText
            };
        }
    } catch (e) {
        throw e;
    }
}

/**
 * Post data to the given url
 * @param url
 * @param postData
 * @returns {Promise<{data: any, isOk: boolean}|{isOk: boolean, message: string, error: string}>}
 */

async function post(url, postData) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        if (response.ok) {
            const data = await response.json();
            return {
                isOk: true,
                data: data
            };
        } else {
            return {
                isOk: false,
                message: 'Api call failed!',
                error: response.statusText
            };
        }
    } catch (e) {
        throw e;
    }
}

const patch = async (url, patchData) => {
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patchData)
        });
        if (response.ok) {
            const data = await response.json();
            return {
                isOk: true,
                data: data
            };
        } else {
            return {
                isOk: false,
                message: 'Api call failed!',
                error: response.statusText
            };
        }
    } catch (e) {
        throw e;
    }
}

const put = async (url, putData) => {
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(putData)
        });
        if (response.ok) {
            return {
                isOk: true,
                data: 204
            };
        } else {
            return {
                isOk: false,
                message: 'Api call failed!',
                error: response.statusText
            };
        }
    } catch (e) {
        throw e;
    }
}

const del = async (url) => {
    try {
        const response = await fetch(url, {
            method: 'DELETE'
        });
        if (response.ok) {
            return {
                isOk: true
            };
        } else {
            return {
                isOk: false,
                message: 'Api call failed!',
                error: response.statusText
            };
        }
    } catch (e) {
        throw e;
    }

}
export {
    get,
    post,
    patch,
    put,
    del
}