import './logout.scss';
import {useNavigate} from "react-router";
import {useAuth} from "../../contexts/auth";
import {useEffect} from "react";


const Logout = () => {
    const navigate = useNavigate()
    const {signOut} = useAuth()
    useEffect(() => {
        signOut()
        navigate('/login')
    }, [navigate, signOut])

    return null
};

export default Logout;