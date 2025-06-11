import React, { useEffect, useState } from "react";
import axios from "axios";
import TopBar from "../components/TopBar";
import { Tooltip } from "antd";
import Swal from "sweetalert2";

import { SiGoogleforms } from "react-icons/si";
import { CiCircleRemove } from "react-icons/ci";
import { FaArrowAltCircleRight, FaArrowAltCircleDown } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdOutlineRestorePage } from "react-icons/md";
import { GrClearOption } from "react-icons/gr";
import { IoIosSave } from "react-icons/io";

const API_BASE = `http://${
  import.meta.env.VITE_APP_BACKEND_IP
}:5000/api/overtime`;
const EMPLOYEE_API = `http://${
  import.meta.env.VITE_APP_BACKEND_IP
}:5000/api/employee`;

function OvertimeForm() {
  const [employees, setEmployees] = useState([]);
  const [employeeForms, setEmployeeForms] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openIndexes, setOpenIndexes] = useState([]);
  const [tripleOTDates, setTripleOTDates] = useState([]);

  useEffect(() => {
    axios
      .get(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/triple-ot`)
      .then((res) => setTripleOTDates(res.data.map((d) => d.date)));
  }, []);

  // Load saved data and employee list on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem("overtimeFormData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.length > 0) {
          setEmployeeForms(parsed);
          setOpenIndexes(parsed.map((_, i) => i));
        }
      } catch (err) {
        console.error("Failed to parse session data:", err);
      }
    }
    axios
      .get(EMPLOYEE_API)
      .then((res) => {
        setEmployees(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Prevent overwriting sessionStorage with empty forms
  useEffect(() => {
    if (employeeForms.length > 0) {
      sessionStorage.setItem("overtimeFormData", JSON.stringify(employeeForms));
    }
  }, [employeeForms]);

  // Auto-expand all employee forms on load or add
  useEffect(() => {
    if (
      employeeForms.length > 0 &&
      !openIndexes.includes(employeeForms.length - 1)
    ) {
      setOpenIndexes((prev) => [...prev, employeeForms.length - 1]);
    }
  }, [employeeForms.length]);

  const toggleAccordion = (index) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const combineDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    if (timeStr.includes("T")) return new Date(timeStr);
    const [hours, minutes] = timeStr.split(":").map(Number);
    const dt = new Date(dateStr);
    dt.setHours(hours, minutes, 0, 0);
    return dt;
  };

  const fixOutTimeNextDay = (inDateTime, outDateTime) => {
    if (outDateTime <= inDateTime) {
      const newOut = new Date(outDateTime);
      newOut.setDate(newOut.getDate() + 1);
      return newOut;
    }
    return outDateTime;
  };

  const calculateOT = ({ shift, date, inTime, outTime }) => {
    if (!date || !inTime || !outTime)
      return { ot_normal_hours: 0, ot_double_hours: 0, ot_triple_hours: 0 };

    const inDateTime = combineDateTime(date, inTime);
    let outDateTime = combineDateTime(date, outTime);
    if (!inDateTime || !outDateTime)
      return { ot_normal_hours: 0, ot_double_hours: 0, ot_triple_hours: 0 };
    outDateTime = fixOutTimeNextDay(inDateTime, outDateTime);

    const totalHours = (outDateTime - inDateTime) / 3600000;

    if (tripleOTDates.includes(date)) {
      return {
        ot_normal_hours: 0,
        ot_double_hours: 0,
        ot_triple_hours: Math.round(totalHours * 4) / 4,
      };
    }

    const day = inDateTime.getDay();
    if (day === 0) {
      return {
        ot_normal_hours: 0,
        ot_double_hours: Math.round(totalHours * 4) / 4,
        ot_triple_hours: 0,
      };
    }

    const shiftEnd = new Date(
      `${date}T${shift === "A" ? "15:30:00" : "17:30:00"}`
    );
    if (outDateTime > shiftEnd) {
      const ot = (outDateTime - shiftEnd) / 3600000;
      return {
        ot_normal_hours: Math.round(ot * 4) / 4,
        ot_double_hours: 0,
        ot_triple_hours: 0,
      };
    }

    return { ot_normal_hours: 0, ot_double_hours: 0, ot_triple_hours: 0 };
  };

  const addEmployeeSection = () => {
    setEmployeeForms((prev) => {
      const newForms = [
        ...prev,
        {
          employee_no: "",
          employee_name: "",
          entries: [
            {
              date: "",
              shift: "A",
              inTime: "",
              outTime: "",
              isNightShift: false,
              ot_normal_hours: 0,
              ot_double_hours: 0,
              ot_triple_hours: 0,
              reason: "",
              error: "",
            },
          ],
        },
      ];
      // Update openIndexes after setting new forms
      setOpenIndexes((prevOpen) => [...prevOpen, prev.length]); // `prev.length` is the new index
      return newForms;
    });
  };

  const addEntry = (empIdx) => {
    const newForms = [...employeeForms];
    newForms[empIdx].entries.push({
      date: "",
      shift: "A",
      inTime: "",
      outTime: "",
      isNightShift: false,
      ot_normal_hours: 0,
      ot_double_hours: 0,
      ot_triple_hours: 0,
      reason: "",
      error: "",
    });
    setEmployeeForms(newForms);
  };

  const removeEntry = (empIdx, entryIdx) => {
    const newForms = [...employeeForms];
    newForms[empIdx].entries.splice(entryIdx, 1);
    setEmployeeForms(newForms);
  };

  const handleEmpChange = (empIdx, e) => {
    const { value } = e.target;
    const emp = employees.find((emp) => emp.employee_no === value);
    const newForms = [...employeeForms];
    newForms[empIdx].employee_no = value;
    newForms[empIdx].employee_name = emp ? emp.employee_name : "";
    setEmployeeForms(newForms);
  };

  const handleEntryChange = (empIdx, entryIdx, e) => {
    const { name, value, type, checked } = e.target;
    const newForms = [...employeeForms];
    let entry = newForms[empIdx].entries[entryIdx];
    entry[name] = type === "checkbox" ? checked : value;

    if (name === "outTime" && entry.outTime && entry.date) {
      const outDate = new Date(entry.outTime);
      const threshold = new Date(entry.date);
      threshold.setHours(21, 15, 0, 0);
      entry.isNightShift = outDate > threshold;
    }

    if (["date", "shift", "inTime", "outTime"].includes(name)) {
      Object.assign(entry, calculateOT(entry));
    }

    setEmployeeForms(newForms);
  };

  const validateForms = () => {
    let valid = true;
    const updatedForms = employeeForms.map((emp) => {
      const validEntries = emp.entries.map((entry) => {
        if (!entry.date || !entry.inTime || !entry.outTime) {
          valid = false;
          return { ...entry, error: "Fill required fields." };
        }
        return { ...entry, error: "" };
      });
      return { ...emp, entries: validEntries };
    });
    setEmployeeForms(updatedForms);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForms()) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Form",
        text: "Please fill out all required fields before submitting.",
      });
      return;
    }

    const payloads = employeeForms.flatMap((emp) =>
      emp.entries.map((entry) => ({
        employee_no: emp.employee_no,
        employee_name: emp.employee_name,
        date: new Date(entry.date),
        shift: entry.shift,
        inTime: new Date(entry.inTime),
        outTime: new Date(entry.outTime),
        isNightShift: entry.isNightShift,
        ot_normal_hours: entry.ot_normal_hours,
        ot_double_hours: entry.ot_double_hours,
        ot_triple_hours: entry.ot_triple_hours,
        reason: entry.reason,
      }))
    );

    setLoading(true);
    try {
      await Promise.all(payloads.map((p) => axios.post(API_BASE, p)));
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Overtime data submitted successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
      setEmployeeForms([]);
      setOpenIndexes([]);
      sessionStorage.removeItem("overtimeFormData");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Something went wrong while submitting the data.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg pb-4 shadow overflow-y-hidden">
      <TopBar />

      <div className="px-4 grid gap-3 grid-cols-12">
        <div className="col-span-12 p-4 rounded border border-stone-300">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 font-medium">
              <SiGoogleforms /> Grouped Overtime Entry Form
            </h3>
            <div className="flex gap-2">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex flex-row items-center gap-1"
              >
                <IoIosSave /> Submit All
              </button>
              <button
                type="button"
                onClick={addEmployeeSection}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex flex-row items-center gap-1"
              >
                <IoMdAddCircleOutline /> Add Employee
              </button>
              <button
                type="button"
                onClick={() => {
                  const savedData = sessionStorage.getItem("overtimeFormData");
                  if (savedData) {
                    const parsed = JSON.parse(savedData);
                    setEmployeeForms(parsed);
                    setOpenIndexes(parsed.map((_, i) => i));
                  }
                }}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 flex flex-row items-center gap-1"
              >
                <MdOutlineRestorePage /> Restore Last Session
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem("overtimeFormData");
                  setEmployeeForms([]);
                  setOpenIndexes([]);
                }}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex flex-row items-center gap-1"
              >
                <GrClearOption /> Clear Saved Data
              </button>
            </div>
          </div>

          <div className="overflow-y-auto rounded border border-stone-200 p-2 space-y-4">
            {submitError && <p className="text-red-600">{submitError}</p>}

            {employeeForms.map((emp, empIdx) => (
              <div
                key={empIdx}
                className="border border-stone-300 rounded p-3 bg-stone-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(empIdx)}
                    className="font-medium flex flex-row items-center gap-1"
                  >
                    {openIndexes.includes(empIdx) ? (
                      <FaArrowAltCircleDown />
                    ) : (
                      <FaArrowAltCircleRight />
                    )}{" "}
                    {emp.employee_no || "Select Employee"}-(
                    {emp.employee_name || ""})
                  </button>
                  <span className="text-sm text-stone-600 ml-2">
                    ({emp.entries.length}{" "}
                    {emp.entries.length === 1 ? "entry" : "entries"})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newForms = employeeForms.filter(
                        (_, idx) => idx !== empIdx
                      );
                      setEmployeeForms(newForms);
                      setOpenIndexes(openIndexes.filter((i) => i !== empIdx));
                    }}
                    disabled={employeeForms.length === 1}
                    title="Remove this employee section"
                    className="text-red-600 hover:underline flex flex-row gap-1 items-center"
                  >
                    <CiCircleRemove /> Remove
                  </button>
                </div>

                {openIndexes.includes(empIdx) && (
                  <div className="space-y-4">
                    <div className="flex flex-row sm:flex-row gap-2 items-center">
                      <label className="font-medium">Employee No:</label>
                      <select
                        value={emp.employee_no}
                        onChange={(e) => handleEmpChange(empIdx, e)}
                        className="border p-1 rounded"
                      >
                        <option value="">Select</option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp.employee_no}>
                            {emp.employee_no} - {emp.employee_name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => addEntry(empIdx)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        + Add Entry
                      </button>
                    </div>

                    {emp.entries.map((entry, entryIdx) => (
                      <div
                        key={entryIdx}
                        className="p-3 border rounded bg-white space-y-2"
                      >
                        <p className="font-semibold">Entry ({entry.date})</p>
                        {entry.error && (
                          <p className="text-red-600">{entry.error}</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Tooltip title="Date">
                            <input
                              type="date"
                              name="date"
                              value={entry.date}
                              onChange={(e) =>
                                handleEntryChange(empIdx, entryIdx, e)
                              }
                              required
                              className="border p-1 rounded"
                            />
                          </Tooltip>
                          <Tooltip title="In Time">
                            <input
                              type="datetime-local"
                              name="inTime"
                              value={entry.inTime}
                              onChange={(e) =>
                                handleEntryChange(empIdx, entryIdx, e)
                              }
                              required
                              className="border p-1 rounded"
                            />
                          </Tooltip>
                          <Tooltip title="Out Time">
                            <input
                              type="datetime-local"
                              name="outTime"
                              value={entry.outTime}
                              onChange={(e) =>
                                handleEntryChange(empIdx, entryIdx, e)
                              }
                              required
                              className="border p-1 rounded"
                            />
                          </Tooltip>
                          <Tooltip title="Shift">
                            <select
                              name="shift"
                              value={entry.shift}
                              onChange={(e) =>
                                handleEntryChange(empIdx, entryIdx, e)
                              }
                              className="border p-1 rounded"
                            >
                              <option value="A">Shift 6:30AM</option>
                              <option value="B">Shift 8:30AM</option>
                            </select>
                          </Tooltip>
                          <textarea
                            name="reason"
                            value={entry.reason}
                            onChange={(e) =>
                              handleEntryChange(empIdx, entryIdx, e)
                            }
                            placeholder="Reason"
                            className="border p-1 rounded w-full"
                          />
                        </div>

                        <div className="text-sm">
                          <p>
                            <strong>Employee:</strong>{" "}
                            <span>{String(emp.employee_name)}</span>
                          </p>
                          <p>
                            <strong>Normal OT:</strong>{" "}
                            <span>
                              {Number(entry.ot_normal_hours).toFixed(2)}
                            </span>{" "}
                            hrs |<strong> Double OT:</strong>{" "}
                            <span>
                              {Number(entry.ot_double_hours).toFixed(2)}
                            </span>{" "}
                            hrs |<strong> Triple OT:</strong>{" "}
                            <span>
                              {Number(entry.ot_triple_hours).toFixed(2)}
                            </span>{" "}
                            hrs
                          </p>
                          <p>
                            <strong>Night Shift:</strong>{" "}
                            <span>{entry.isNightShift ? "Yes" : "No"}</span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeEntry(empIdx, entryIdx)}
                          className="text-red-600 hover:underline"
                        >
                          Remove Entry
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OvertimeForm;
