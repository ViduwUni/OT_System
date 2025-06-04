import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function MonthlyReport() {
    const [report, setReport] = useState([]);
    const [expandedEmployee, setExpandedEmployee] = useState(null);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().slice(0, 10);
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        d.setDate(0);
        return d.toISOString().slice(0, 10);
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/overtime/monthly-report`, {
                params: {
                    startDate,
                    endDate
                }
            });
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
    }, [startDate, endDate]);

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
        wsData.push([`Overtime Report from ${startDate} to ${endDate}`]);
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
                ['Date', 'OT Normal', 'OT Double', 'OT Triple', 'Night Shift', 'Reason']
            );

            entry.entries?.forEach(day => {
                wsData.push([
                    new Date(day.date).toISOString().slice(0, 10),
                    (day.ot_normal_hours ?? 0).toFixed(2),
                    (day.ot_double_hours ?? 0).toFixed(2),
                    (day.ot_triple_hours ?? 0).toFixed(2),
                    day.isNightShift ? 'Yes' : 'No',
                    day.reason || ''
                ]);
            });

            wsData.push([], []);
        });

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Dynamic column width
        const getMaxWidths = (data) => {
            const colCount = Math.max(...data.map(row => row.length));
            const widths = new Array(colCount).fill(0);

            data.forEach(row => {
                row.forEach((cell, i) => {
                    const len = String(cell).length;
                    widths[i] = Math.max(widths[i], len);
                });
            });

            return widths.map(w => ({ wch: w + 5 }));
        };

        ws['!cols'] = getMaxWidths(wsData);

        // Optional: freeze panes (e.g., keep headers in view)
        ws['!freeze'] = { xSplit: 0, ySplit: 10 };

        XLSX.utils.book_append_sheet(wb, ws, 'Monthly OT Report');
        XLSX.writeFile(wb, `OT_Report_${startDate}_to_${endDate}.xlsx`);
    };

    return (
        <div>
            <h2>Monthly OT Report</h2>

            <label>
                Start Date: &nbsp;
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate}
                />
            </label>
            &nbsp;&nbsp;
            <label>
                End Date: &nbsp;
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                />
            </label>

            <button
                onClick={exportToExcel}
            >
                Export to Excel
            </button>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : report.length === 0 ? (
                <p>No data found for selected date range.</p>
            ) : (
                <table border="1" cellPadding="10" cellSpacing="0">
                    <thead>
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
                                    <tr onClick={() => toggleExpand(entry.employee_no)}>
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
                                                <table border="1" cellPadding="8" cellSpacing="0">
                                                    <thead>
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
                                                            <tr key={i} className='child-table-row'>
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