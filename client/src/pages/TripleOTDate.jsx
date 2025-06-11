import { useEffect, useState } from "react";
import axios from "axios";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdOutlineEventNote } from "react-icons/md";
import TopBar from "../components/TopBar";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const TRIPLE_OT_API = `http://${
  import.meta.env.VITE_APP_BACKEND_IP
}:5000/api/triple-ot`;

function TripleOTDatePage() {
  const [dates, setDates] = useState([]);
  const [newDate, setNewDate] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    axios.get(TRIPLE_OT_API).then((res) => setDates(res.data));
  }, []);

  const addDate = async (e) => {
    e.preventDefault();
    if (!newDate) return;

    try {
      await axios.post(TRIPLE_OT_API, {
        date: newDate,
        description: newDescription,
      });
      setDates([...dates, { date: newDate, description: newDescription }]);
      setNewDate("");
      setNewDescription("");
      toast.success("Date added successfully!");
    } catch (err) {
      toast.error("Failed to add date");
    }
  };

  const deleteDate = async (date) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `Delete triple OT date: ${date}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${TRIPLE_OT_API}/${date}`);
        setDates(dates.filter((d) => d.date !== date));
        toast.success("Date deleted");
      } catch (err) {
        toast.error("Failed to delete date");
      }
    }
  };

  return (
    <div className="bg-white rounded-lg pb-4 shadow overflow-y-hidden">
      <TopBar />

      <div className="px-4 grid gap-3 grid-cols-12">
        {/* Form Section */}
        <div className="col-span-12 p-4 rounded border border-stone-300">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 font-medium">
              <MdOutlineEventNote /> Triple OT Date Manager
            </h3>
          </div>
          <div className="max-h-[9rem] overflow-y-auto rounded border border-stone-200 p-2">
            <form
              onSubmit={addDate}
              className="flex flex-wrap gap-2 items-start"
            >
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="border p-1 rounded"
              />
              <input
                type="text"
                placeholder="Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="border p-1 rounded"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                <span className="flex items-center gap-2">
                  <IoMdAddCircleOutline />
                  Add Date
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="col-span-12 p-4 rounded border border-stone-300">
          <div className="border border-gray-300 rounded overflow-hidden h-full flex flex-col">
            <div className="overflow-y-auto flex-grow">
              <table className="min-w-full h-fit text-sm border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Description</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dates.map((d) => (
                    <tr key={d.date}>
                      <td className="p-2 border whitespace-nowrap">{d.date}</td>
                      <td className="p-2 border">{d.description}</td>
                      <td className="p-2 border whitespace-nowrap space-x-2">
                        <button
                          onClick={() => deleteDate(d.date)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {dates.length === 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        className="p-2 border text-center text-gray-500"
                      >
                        No triple OT dates added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripleOTDatePage;
