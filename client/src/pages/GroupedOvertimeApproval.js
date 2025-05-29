import React, { useEffect, useState } from "react";
import axios from "axios";

const API_GROUPED = "http://localhost:5000/api/overtime/grouped";
const API_APPROVAL = "http://localhost:5000/api/overtime/approval";

function GroupedOvertimeApproval() {
    const [periodType, setPeriodType] = useState("week"); // or "month"
    const [data, setData] = useState([]);
    const [selected, setSelected] = useState(null); // selected group for approval
    const [confirmedHours, setConfirmedHours] = useState(0);
    const [approvalStage, setApprovalStage] = useState("pending");

    useEffect(() => {
        fetchGrouped();
    }, [periodType]);

    const fetchGrouped = async () => {
        try {
            const res = await axios.get(API_GROUPED + `?period=${periodType}`);
            setData(res.data);
        } catch (err) {
            alert("Failed to load grouped overtime");
        }
    };

    const openApproval = (group) => {
        setSelected(group);
        setConfirmedHours(
            group.confirmed_hours || group.total_ot_normal_hours + group.total_ot_double_hours + group.total_ot_triple_hours
        );
        setApprovalStage(group.approval_stage || "pending");
    };

    const saveApproval = async () => {
        try {
            await axios.post(API_APPROVAL, {
                employee_no: selected._id.employee_no,
                period_type: periodType,
                period_value:
                    periodType === "week"
                        ? `${selected._id.year}-W${selected._id.week}`
                        : `${selected._id.year}-${String(selected._id.month).padStart(2, "0")}`,
                confirmed_hours: confirmedHours,
                approval_stage: approvalStage,
            });
            alert("Approval saved");
            setSelected(null);
            fetchGrouped();
        } catch {
            alert("Failed to save approval");
        }
    };

    return (
        <div>
            <h2>Grouped Overtime Approval</h2>
            <label>
                Group by:
                <select value={periodType} onChange={(e) => setPeriodType(e.target.value)}>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                </select>
            </label>

            <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
                <thead>
                    <tr>
                        <th>Employee No</th>
                        <th>Period</th>
                        <th>Total Normal OT</th>
                        <th>Total Double OT</th>
                        <th>Total Triple OT</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((group, idx) => {
                        const { year, week, month, employee_no } = group._id;
                        const periodStr =
                            periodType === "week"
                                ? (week !== undefined ? `${year}-W${week}` : `missing-week-${idx}`)
                                : (month !== undefined ? `${year}-${String(month).padStart(2, "0")}` : `missing-month-${idx}`);

                        return (
                            <tr key={`${employee_no}-${periodStr}`}>
                                <td>{employee_no}</td>
                                <td>{periodStr}</td>
                                <td>{group.total_ot_normal_hours}</td>
                                <td>{group.total_ot_double_hours}</td>
                                <td>{group.total_ot_triple_hours}</td>
                                <td>
                                    <button onClick={() => openApproval(group)}>Approve</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {selected && (
                <div style={{ marginTop: 20, border: "1px solid #ccc", padding: 10 }}>
                    <h3>
                        Approve Overtime for {selected._id.employee_no} -{" "}
                        {periodType === "week"
                            ? `${selected._id.year}-W${selected._id.week}`
                            : `${selected._id.year}-${String(selected._id.month).padStart(2, "0")}`}
                    </h3>
                    <label>
                        Confirmed Hours:
                        <input
                            type="number"
                            value={confirmedHours}
                            min="0"
                            onChange={(e) => setConfirmedHours(Number(e.target.value))}
                        />
                    </label>
                    <br />
                    <label>
                        Approval Stage:
                        <select value={approvalStage} onChange={(e) => setApprovalStage(e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="approved_production">Approved (Production)</option>
                            <option value="final_approved_hr">Final Approved (HR)</option>
                        </select>
                    </label>
                    <br />
                    <button onClick={saveApproval}>Save</button>
                    <button onClick={() => setSelected(null)} style={{ marginLeft: 10 }}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}

export default GroupedOvertimeApproval;