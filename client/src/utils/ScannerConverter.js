import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ScannerConverter() {
    const [data, setData] = useState([]);
    const [preview, setPreview] = useState([]);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const lines = event.target.result.split('\n');
            const rows = lines
                .map(line => {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length < 3) return null;

                    const [emp, date, time] = parts;
                    const [h = '00', m = '00', s = '00'] = time.split(':');
                    const hour = parseInt(h, 10);

                    let actualDate = date;

                    // Shift early-morning time to previous day (OUTs after midnight)
                    if (hour >= 0 && hour < 6) {
                        const d = new Date(date);
                        d.setDate(d.getDate() - 1);
                        actualDate = d.toISOString().split('T')[0]; // format as yyyy-mm-dd
                    }

                    return [emp, actualDate, time];
                })
                .filter(Boolean);

            setData(rows);
            setPreview(rows.slice(0, 10));
            setIsConfirmed(false);
        };

        reader.readAsText(file);
    };

    // Convert string time to Date object for comparison, handling MISSING as invalid
    const toDateTime = (dateStr, timeStr) => {
        if (!timeStr || timeStr === 'MISSING') return null;
        const [hh = '00', mm = '00', ss = '00'] = timeStr.split(':');
        return new Date(`${dateStr}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:${ss.padStart(2, '0')}`);
    };

    const processAttendance = (rows) => {
        const grouped = {};

        // Group data by emp and date
        rows.forEach(([emp, date, time]) => {
            if (!grouped[emp]) grouped[emp] = {};
            if (!grouped[emp][date]) grouped[emp][date] = [];

            grouped[emp][date].push({
                time,
                datetime: toDateTime(date, time),
            });
        });

        const finalRows = [];

        Object.keys(grouped).forEach(emp => {
            const dates = Object.keys(grouped[emp]).sort();

            dates.forEach(date => {
                const entries = grouped[emp][date];
                // Remove null datetime entries before sorting
                const validEntries = entries.filter(e => e.datetime !== null);
                validEntries.sort((a, b) => a.datetime - b.datetime);

                if (validEntries.length === 0) {
                    // No valid times at all
                    finalRows.push([emp, date, 'MISSING', 'MISSING']);
                    return;
                }

                if (validEntries.length === 1) {
                    const entry = validEntries[0];
                    const hour = entry.datetime.getHours();

                    // If time is between 0:00 and 5:59, treat as OUT
                    if (hour >= 0 && hour < 6) {
                        finalRows.push([emp, date, 'MISSING', entry.time]);
                    } else {
                        // Otherwise treat as IN (morning start)
                        finalRows.push([emp, date, entry.time, 'MISSING']);
                    }
                } else {
                    // Multiple entries: first is IN, last is OUT
                    const inTime = validEntries[0].time;
                    const outTime = validEntries[validEntries.length - 1].time;
                    finalRows.push([emp, date, inTime, outTime]);
                }
            });
        });

        return finalRows;
    };

    const exportToExcel = () => {
        const processed = processAttendance(data);
        const header = ['Employee_No', 'Date', 'IN_Time', 'OUT_Time'];
        const sheetData = [header, ...processed];
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sorted_Attendance');
        XLSX.writeFile(workbook, 'Sorted_Attendance.xlsx');
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">TXT to Excel Converter</h2>
            <input type="file" accept=".txt" onChange={handleFileUpload} className="mb-4" />

            {preview.length > 0 && !isConfirmed && (
                <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-semibold mb-2">Preview (First 10 Rows)</h3>
                    <table className="table-auto border-collapse border border-gray-400">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 px-2">Employee_No</th>
                                <th className="border border-gray-300 px-2">Date</th>
                                <th className="border border-gray-300 px-2">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {preview.map((row, idx) => (
                                <tr key={idx}>
                                    {row.map((cell, i) => (
                                        <td key={i} className="border border-gray-300 px-2">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        onClick={() => setIsConfirmed(true)}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Confirm and Export
                    </button>
                </div>
            )}

            {isConfirmed && (
                <div className="mt-4">
                    <button
                        onClick={exportToExcel}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Download Excel File
                    </button>
                </div>
            )}
        </div>
    );
}