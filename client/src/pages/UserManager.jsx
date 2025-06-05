import { useEffect, useState } from "react";
import axios from "axios";
import TopBar from "../components/TopBar";

import { MdManageAccounts } from "react-icons/md";

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "manager(hr)" });
    const [editingId, setEditingId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState(null);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/auth/users`);
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/auth/users/${editingId}`, form);
                setEditingId(null);
            } else {
                await axios.post(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/auth/register`, form);
            }
            setForm({ name: "", email: "", password: "", role: "manager(hr)" });
            fetchUsers();
        } catch (err) {
            console.error("Error saving user:", err);
        }
    };

    const handleEdit = (user) => {
        setForm({ name: user.name, email: user.email, password: "", role: user.role });
        setEditingId(user._id);
    };

    const handleDeleteClick = (id) => {
        setDeleteUserId(id);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/auth/users/${deleteUserId}`);
            setConfirmOpen(false);
            setDeleteUserId(null);
            fetchUsers();
        } catch (err) {
            console.error("Error deleting user:", err);
        }
    };

    const cancelDelete = () => {
        setConfirmOpen(false);
        setDeleteUserId(null);
    };

    return (
        <div className="bg-white rounded-lg pb-4 shadow h-[90vh] overflow-y-hidden">
            <TopBar />

            <div className="px-4 grid gap-3 grid-cols-12">
                <div className="col-span-12 p-4 rounded border border-stone-300">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-1.5 font-medium">
                            <MdManageAccounts /> User Management Form
                        </h3>
                    </div>
                    <div className="max-h-[9rem] overflow-y-auto rounded border border-stone-200 p-2">
                        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-start">
                            <input
                                name="name"
                                placeholder="Name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="border p-1 rounded"
                            />
                            <input
                                name="email"
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="border p-1 rounded"
                            />
                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                required={!editingId}
                                className="border p-1 rounded"
                            />
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="border p-1 rounded"
                            >
                                <option>manager(hr)</option>
                                <option>supervisor(hr)</option>
                                <option>supervisor(production)</option>
                                <option>manager(production)</option>
                            </select>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                                {editingId ? "Update User" : "Add User"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="col-span-12 p-4 rounded border border-stone-300 h-[70%]">
                    <div className="mb-4 flex items-center justify-between">
                        {/* Anything else like title/buttons here */}
                    </div>

                    <div className="overflow-x-auto max-h-[80%]">
                        <table className="min-w-full">
                            <thead className="sticky top-0 z-10 bg-gray-100">
                                <tr>
                                    <th className="p-2 border">Name</th>
                                    <th className="p-2 border">Email</th>
                                    <th className="p-2 border">Role</th>
                                    <th className="p-2 border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td className="p-2 border whitespace-nowrap">{user.name}</td>
                                        <td className="p-2 border whitespace-nowrap">{user.email}</td>
                                        <td className="p-2 border whitespace-nowrap">{user.role}</td>
                                        <td className="p-2 border whitespace-nowrap space-x-2">
                                            <button onClick={() => handleEdit(user)} className="text-blue-600 hover:underline">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteClick(user._id)} className="text-red-600 hover:underline">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManager;