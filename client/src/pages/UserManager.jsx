import { useEffect, useState } from "react";
import axios from "axios";

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
        <div className="w-full px-4 py-6 space-y-8 flex flex-row flex-wrap">
            <h1>User Manager</h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full">
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required={!editingId} />
                <select name="role" value={form.role} onChange={handleChange}>
                    <option>manager(hr)</option>
                    <option>supervisor(hr)</option>
                    <option>supervisor(production)</option>
                    <option>manager(production)</option>
                </select>
                <button type="submit">
                    {editingId ? "Update User" : "Add User"}
                </button>
            </form>

            {/* Table */}
            <table className="w-full">
                <thead>
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
                            <td className="p-2 border">{user.name}</td>
                            <td className="p-2 border">{user.email}</td>
                            <td className="p-2 border">{user.role}</td>
                            <td className="p-2 border space-x-2">
                                <button onClick={() => handleEdit(user)} className="text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => handleDeleteClick(user._id)} className="text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Confirmation Modal */}
            {confirmOpen && (
                <div className="w-full">
                    <div>
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to delete this user?</p>
                        <div>
                            <button onClick={cancelDelete} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
                            <button onClick={confirmDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;