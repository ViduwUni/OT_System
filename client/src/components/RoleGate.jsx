import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const RoleGate = ({ allow, children }) => {
    const allowedRoles = Array.isArray(allow) ? allow : [allow];
    const { user } = useContext(AuthContext);
    const userRole = user?.role;

    if (allowedRoles.includes(userRole)) {
        return <>{children}</>
    }

    return null;
};

export default RoleGate;