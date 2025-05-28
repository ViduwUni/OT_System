import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);

    return (
        <div>
            <h2>Hello {user?.role}</h2>
            <button onClick={logout}>Logout</button>
        </div>
    );
}