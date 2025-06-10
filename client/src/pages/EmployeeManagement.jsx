import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Swal from 'sweetalert2';

import { MdManageAccounts } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdOutlineSystemUpdateAlt } from "react-icons/md";

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({ employee_no: '', employee_name: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        const res = await axios.get(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/employee`);
        setEmployees(res.data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/employee/${editingId}`, form);
            } else {
                await axios.post(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/employee`, form);
            }
            fetchEmployees();
            setForm({ employee_no: '', employee_name: '' });
            setEditingId(null);
            Swal.fire({
                icon: 'success',
                title: editingId ? 'Employee Updated' : 'Employee Added',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Error saving employee',
            });
        }
    };

    const handleEdit = (emp) => {
        setForm({ employee_no: emp.employee_no, employee_name: emp.employee_name });
        setEditingId(emp._id);
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await axios.delete(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/employee/${id}`);
                fetchEmployees();
                Swal.fire(
                    'Deleted!',
                    'Employee has been deleted.',
                    'success'
                );
            }
        });
    };

    return (
        <div className="bg-white rounded-lg pb-4 shadow overflow-y-hidden">
            <TopBar />

            <div className="px-4 grid gap-3 grid-cols-12">
                <div className="col-span-12 p-4 rounded border border-stone-300">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-1.5 font-medium">
                            <MdManageAccounts /> Employee Management Form
                        </h3>
                    </div>
                    <div className="max-h-[9rem] overflow-y-auto rounded border border-stone-200 p-2">
                        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-start">
                            <input type="text" name="employee_no" value={form.employee_no}
                                onChange={handleChange} placeholder="Employee No" required className="border p-1 rounded" />
                            <input type="text" name="employee_name" value={form.employee_name}
                                onChange={handleChange} placeholder="Employee Name" required className="border p-1 rounded" />
                            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                                {editingId ? (
                                    <span className="flex items-center gap-2">
                                        <MdOutlineSystemUpdateAlt />
                                        Update Employee
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <IoMdAddCircleOutline />
                                        Add Employee
                                    </span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="col-span-12 p-4 rounded border border-stone-300">
                    <div className="border border-gray-300 rounded overflow-hidden h-full flex flex-col">
                        <div className="overflow-y-auto flex-grow">
                            <table className="min-w-full h-fit text-sm border-collapse">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                    <tr className="bg-gray-100">
                                        <th className="p-2 border">No</th>
                                        <th className="p-2 border">Name</th>
                                        <th className="p-2 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp, i) => (
                                        <tr key={emp._id}>
                                            <td className="p-2 border whitespace-nowrap">{emp.employee_no}</td>
                                            <td className="p-2 border whitespace-nowrap">{emp.employee_name}</td>
                                            <td className="p-2 border whitespace-nowrap space-x-2">
                                                <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:underline">Edit</button>
                                                <button onClick={() => handleDelete(emp._id)} className="text-red-600 hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeManagement;