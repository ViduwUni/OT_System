import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function MonthlyReport() {
    const [report, setReport] = useState([]);
    const [expandedEmployee, setExpandedEmployee] = useState(null);
    const [month, setMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/overtime/monthly-report?month=${month}`);
            setReport(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch report');
            setReport([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [month]);

    const toggleExpand = (employeeNo) => {
        setExpandedEmployee(expandedEmployee === employeeNo ? null : employeeNo);
    };

    // Excel export logic
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [];

        // Summary calculations
        let totalNormal = 0, totalDouble = 0, totalTriple = 0, totalConfirmed = 0, totalNight = 0;

        report.forEach(entry => {
            totalNormal += entry.total_ot_normal_hours ?? 0;
            totalDouble += entry.total_ot_double_hours ?? 0;
            totalTriple += entry.total_ot_triple_hours ?? 0;
            totalConfirmed += entry.total_confirmed_hours ?? 0;
            totalNight += entry.entries?.filter(e => e.isNightShift).length ?? 0;
        });

        // Summary
        wsData.push([`Overtime Monthly Report - ${month}`]);
        wsData.push([]);
        wsData.push(['Summary']);
        wsData.push(['Total OT Normal Hours', totalNormal.toFixed(2)]);
        wsData.push(['Total OT Double Hours', totalDouble.toFixed(2)]);
        wsData.push(['Total OT Triple Hours', totalTriple.toFixed(2)]);
        wsData.push(['Total Confirmed Hours', totalConfirmed.toFixed(2)]);
        wsData.push(['Total Night Shifts', totalNight]);
        wsData.push([]);
        wsData.push([]);

        // Details per employee
        report.forEach(entry => {
            wsData.push(
                [`Employee No: ${entry.employee_no}`, `Name: ${entry.employee_name}`],
                ['Date', 'OT Normal', 'OT Double', 'OT Triple', 'Night Shift']
            );

            entry.entries?.forEach(day => {
                wsData.push([
                    new Date(day.date).toISOString().slice(0, 10),
                    (day.ot_normal_hours ?? 0).toFixed(2),
                    (day.ot_double_hours ?? 0).toFixed(2),
                    (day.ot_triple_hours ?? 0).toFixed(2),
                    day.isNightShift ? 'Yes' : 'No'
                ]);
            });

            wsData.push([], []);
        });

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Optional: set column widths
        const colWidths = new Array(wsData[0].length).fill({ wch: 20 });
        ws['!cols'] = colWidths;

        // Optional: freeze panes (e.g., keep headers in view)
        ws['!freeze'] = { xSplit: 0, ySplit: 10 };

        XLSX.utils.book_append_sheet(wb, ws, 'Monthly OT Report');
        XLSX.writeFile(wb, `OT_Report_${month}.xlsx`);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Monthly OT Report</h2>

            <label>
                Select Month: &nbsp;
                <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
            </label>

            {/* NEW: Export button */}
            <button
                onClick={exportToExcel}
                style={{
                    marginLeft: '20px',
                    padding: '6px 12px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Export to Excel
            </button>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : report.length === 0 ? (
                <p>No data found for selected month.</p>
            ) : (
                <table border="1" cellPadding="10" cellSpacing="0" style={{ marginTop: '20px', borderCollapse: 'collapse', width: '100%' }}>
                    <thead style={{ backgroundColor: '#f0f0f0' }}>
                        <tr>
                            <th>Employee No</th>
                            <th>Name</th>
                            <th>OT Normal (hrs)</th>
                            <th>OT Double (hrs)</th>
                            <th>OT Triple (hrs)</th>
                            <th>Confirmed Hours</th>
                            <th>Night Shifts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.map((entry, index) => {
                            const normal = entry.total_ot_normal_hours ?? 0;
                            const double = entry.total_ot_double_hours ?? 0;
                            const triple = entry.total_ot_triple_hours ?? 0;
                            const confirmed = entry.total_confirmed_hours ?? 0;
                            const nightShiftCount = entry.entries?.filter(e => e.isNightShift).length ?? 0;
                            const key = `${entry.employee_no}-${entry.year}-${entry.month}-${index}`;

                            return (
                                <React.Fragment key={key}>
                                    <tr onClick={() => toggleExpand(entry.employee_no)} style={{ cursor: 'pointer', backgroundColor: expandedEmployee === entry.employee_no ? '#f9f9f9' : 'white' }}>
                                        <td>{entry.employee_no}</td>
                                        <td>{entry.employee_name}</td>
                                        <td>{normal.toFixed(2)}</td>
                                        <td>{double.toFixed(2)}</td>
                                        <td>{triple.toFixed(2)}</td>
                                        <td>{confirmed.toFixed(2)}</td>
                                        <td>{nightShiftCount}</td>
                                    </tr>
                                    {expandedEmployee === entry.employee_no && entry.entries && entry.entries.length > 0 && (
                                        <tr>
                                            <td colSpan="7">
                                                <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', marginTop: '10px' }}>
                                                    <thead style={{ backgroundColor: '#e0e0e0' }}>
                                                        <tr>
                                                            <th>Employee No</th>
                                                            <th>Name</th>
                                                            <th>Date</th>
                                                            <th>OT Normal (hrs)</th>
                                                            <th>OT Double (hrs)</th>
                                                            <th>OT Triple (hrs)</th>
                                                            <th>Night Shift</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {entry.entries.map((day, i) => (
                                                            <tr key={i}>
                                                                <td>{entry.employee_no}</td>
                                                                <td>{entry.employee_name}</td>
                                                                <td>{new Date(day.date).toLocaleDateString()}</td>
                                                                <td>{(day.ot_normal_hours ?? 0).toFixed(2)}</td>
                                                                <td>{(day.ot_double_hours ?? 0).toFixed(2)}</td>
                                                                <td>{(day.ot_triple_hours ?? 0).toFixed(2)}</td>
                                                                <td>{day.isNightShift ? 'Yes' : 'No'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default MonthlyReport;