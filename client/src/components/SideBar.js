import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from "../context/AuthContext";

export default function SideBar() {
    const { logout } = useContext(AuthContext);
    return (
        <div style={{
            width: '200px',
            height: '100vh',
            background: '#f0f0f0',
            padding: '1rem'
        }}>
            <h2>Menu</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/txttoexcel">Text to Excel</Link></li>
                <li><Link to="/employeeManagement">Employees</Link></li>
                <li><Link to="/overtimeList">Overtime List</Link></li>
                <li><Link to="/overtimeForm">Overtime Form</Link></li>
                <li><Link to="/monthlyReport">Monthly Report</Link></li>
            </ul>
            <button onClick={logout}>Logout</button>
        </div>
    );
}