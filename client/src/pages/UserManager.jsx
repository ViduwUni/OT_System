import { useEffect, useState, useContext } from "react";
import axios from "axios";
import TopBar from "../components/TopBar";
import Swal from "sweetalert2";

import { MdManageAccounts } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdOutlineSystemUpdateAlt } from "react-icons/md";
import { AuthContext } from "../context/AuthContext";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "manager(hr)",
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const { user: loggedInUser } = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/auth/users`
      );
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
        await axios.put(
          `http://${
            import.meta.env.VITE_APP_BACKEND_IP
          }:5000/api/auth/users/${editingId}`,
          form
        );
        Swal.fire("Success", "User updated successfully!", "success");
        setEditingId(null);
      } else {
        await axios.post(
          `http://${
            import.meta.env.VITE_APP_BACKEND_IP
          }:5000/api/auth/register`,
          form
        );
        Swal.fire("Success", "User added successfully!", "success");
      }
      setForm({ name: "", email: "", password: "", role: "manager(hr)" });
      fetchUsers();
    } catch (err) {
      console.error("Error saving user:", err);
      Swal.fire("Error", "Failed to save user. Try again!", "error");
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setEditingId(user._id);
    Swal.fire("Edit Mode", `Editing user: ${user.name}`, "info");
  };

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(id);
      }
    });
  };

  const confirmDelete = async (id) => {
    try {
      await axios.delete(
        `http://${
          import.meta.env.VITE_APP_BACKEND_IP
        }:5000/api/auth/users/${id}`
      );
      Swal.fire("Deleted!", "User has been deleted.", "success");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      Swal.fire("Error", "Failed to delete the user.", "error");
    }
  };

  return (
    <div className="bg-white rounded-lg pb-4 shadow overflow-y-hidden">
      <TopBar />

      <div className="px-4 grid gap-3 grid-cols-12">
        <div className="col-span-12 p-4 rounded border border-stone-300">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 font-medium">
              <MdManageAccounts /> User Management Form
            </h3>
          </div>
          <div className="max-h-[9rem] overflow-y-auto rounded border border-stone-200 p-2">
            <form
              onSubmit={handleSubmit}
              className="flex flex-wrap gap-2 items-start"
            >
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
                {loggedInUser.role === "administrator" ? (<option>administrator</option>) : ''}
                <option>manager(hr)</option>
                <option>supervisor(hr)</option>
                <option>supervisor(production)</option>
                <option>manager(production)</option>
              </select>
              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                {editingId ? (
                  <span className="flex items-center gap-2">
                    <MdOutlineSystemUpdateAlt />
                    Update User
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <IoMdAddCircleOutline />
                    Add User
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="col-span-12 p-4 rounded border border-stone-300">
          <div className="mb-4 flex items-center justify-between"></div>

          <div className="overflow-x-auto">
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
                {users.map((user) => {
                  const isVidunUser =
                    user.role === "administrator" &&
                    user.name === "Vidun Hettiarachchi";
                  const isLoggedInVidun =
                    loggedInUser.role === "administrator" &&
                    loggedInUser.name === "Vidun Hettiarachchi";
                  const isSelf = user._id === loggedInUser._id;

                  const canEditDelete =
                    isLoggedInVidun || // Vidun can edit all
                    !isVidunUser || // others can edit if user is not Vidun
                    isSelf; // anyone can edit themselves

                
                  return (
                    <tr key={user._id}>
                      <td className="p-2 border whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="p-2 border whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="p-2 border whitespace-nowrap">
                        {user.role}
                      </td>
                      <td className="p-2 border whitespace-nowrap space-x-2">
                        {canEditDelete ? (
                          <>
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user._id)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 italic">
                            Restricted
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
