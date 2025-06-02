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
            const res = await axios.get(`http://${process.env.REACT_APP_BACKEND_IP}:5000/api/auth/users`);
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
                await axios.put(`http://${process.env.REACT_APP_BACKEND_IP}:5000/api/auth/users/${editingId}`, form);
                setEditingId(null);
            } else {
                await axios.post(`http://${process.env.REACT_APP_BACKEND_IP}:5000/api/auth/register`, form);
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
            await axios.delete(`http://${process.env.REACT_APP_BACKEND_IP}:5000/api/auth/users/${deleteUserId}`);
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
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">User Manager</h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 mb-8 bg-gray-100 p-4 rounded shadow">
                <input className="w-full p-2 border rounded" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                <input className="w-full p-2 border rounded" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input className="w-full p-2 border rounded" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required={!editingId} />
                <select className="w-full p-2 border rounded" name="role" value={form.role} onChange={handleChange}>
                    <option>manager(hr)</option>
                    <option>supervisor(hr)</option>
                    <option>supervisor(production)</option>
                    <option>manager(production)</option>
                </select>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" type="submit">
                    {editingId ? "Update User" : "Add User"}
                </button>
            </form>

            {/* Table */}
            <table className="w-full table-auto border border-collapse">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Email</th>
                        <th className="p-2 border">Role</th>
                        <th className="p-2 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id} className="hover:bg-gray-50">
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
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                        <p className="mb-6">Are you sure you want to delete this user?</p>
                        <div className="flex justify-end space-x-4">
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