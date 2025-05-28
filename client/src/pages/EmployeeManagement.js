import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({ employee_no: '', employee_name: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        const res = await axios.get('http://localhost:5000/api/employee');
        setEmployees(res.data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/employee/${editingId}`, form);
            } else {
                await axios.post('http://localhost:5000/api/employee', form);
            }
            fetchEmployees();
            setForm({ employee_no: '', employee_name: '' });
            setEditingId(null);
        } catch (err) {
            alert('Error saving employee');
        }
    };

    const handleEdit = (emp) => {
        setForm({ employee_no: emp.employee_no, employee_name: emp.employee_name });
        setEditingId(emp._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        await axios.delete(`http://localhost:5000/api/employee/${id}`);
        fetchEmployees();
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Employee Management</h2>
            <form onSubmit={handleSubmit} className="space-x-2 mb-4">
                <input type="text" name="employee_no" value={form.employee_no}
                    onChange={handleChange} placeholder="Employee No" required />
                <input type="text" name="employee_name" value={form.employee_name}
                    onChange={handleChange} placeholder="Employee Name" required />
                <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
                    {editingId ? 'Update' : 'Add'}
                </button>
            </form>

            <table className="table-auto w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-2">No</th>
                        <th className="border px-2">Name</th>
                        <th className="border px-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((emp, i) => (
                        <tr key={emp._id}>
                            <td className="border px-2">{emp.employee_no}</td>
                            <td className="border px-2">{emp.employee_name}</td>
                            <td className="border px-2 space-x-2">
                                <button onClick={() => handleEdit(emp)} className="text-blue-500">Edit</button>
                                <button onClick={() => handleDelete(emp._id)} className="text-red-500">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeManagement;