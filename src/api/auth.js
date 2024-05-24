import defaultUser from '../utils/default-user';

export async function signIn(email, password) {
    try {
        let user = null;
        // Send request
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users?email=${email}`)
        if (response.ok) {
            user = await response.json();
        }
        if (user) {
            return {
                isOk: true,
                data: user
            };
        } else {
            return {
                isOk: false,
                data: user,
                message: "Authentication failed"
            };
        }
    } catch {
        return {
            isOk: false,
            message: "Authentication failed"
        };
    }
}

export async function getUser() {
    try {
        // Check local storage for existing session
        const user = localStorage.getItem('user')
        if (user) {
            return {
                isOk: true,
                data: JSON.parse(user)
            }
        }
        return {
            isOk: false, // false simulates logged off user
            data: defaultUser
        };
    } catch {
        return {
            isOk: false
        };
    }
}

export async function createAccount(email, password) {
    try {
        // Send request
        console.log(email, password);

        return {
            isOk: true
        };
    } catch {
        return {
            isOk: false,
            message: "Failed to create account"
        };
    }
}

export async function changePassword(email, recoveryCode) {
    try {
        // Send request
        console.log(email, recoveryCode);

        return {
            isOk: true
        };
    } catch {
        return {
            isOk: false,
            message: "Failed to change password"
        }
    }
}

export async function resetPassword(email) {
    try {
        // Send request
        console.log(email);

        return {
            isOk: true
        };
    } catch {
        return {
            isOk: false,
            message: "Failed to reset password"
        };
    }
}
