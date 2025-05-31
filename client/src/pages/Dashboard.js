import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Greeting from "../utils/Greeting";

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        const res = await axios.get(`http://${process.env.REACT_APP_BACKEND_IP}:5000/api/employee`);
        setEmployees(res.data);
    };

    return (
        <>
            <div>
                <Greeting name={user?.name} />
            </div>

            <div>
                <h3>Employees</h3>
                <table border="1px">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp, i) => (
                            <tr key={emp._id}>
                                <td>{emp.employee_no}</td>
                                <td>{emp.employee_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}