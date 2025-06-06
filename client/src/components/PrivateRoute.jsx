import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Layout from './Layout';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    // While loading, don't render or redirect — prevent flicker
    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
            }}></div>
        );
    }

    return user ? <Layout>{children}</Layout> : <Navigate to="/" replace />;
};

export default PrivateRoute;