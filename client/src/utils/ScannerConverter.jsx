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
                    return parts.length >= 3 ? parts.slice(0, 3) : null;
                })
                .filter(Boolean);

            setData(rows);
            setPreview(rows.slice(0, 10));
            setIsConfirmed(false);
        };

        reader.readAsText(file);
    };

    const sortByEmployeeAndDate = (rows) => {
        const grouped = {};

        rows.forEach(([emp, date, time]) => {
            if (!grouped[emp]) grouped[emp] = [];
            grouped[emp].push([emp, date, time]);
        });

        const sorted = Object.keys(grouped).sort().flatMap(emp => {
            return grouped[emp].sort((a, b) => {
                const d1 = new Date(a[1]);
                const d2 = new Date(b[1]);
                return d1 - d2;
            });
        });

        return sorted;
    };

    const exportToExcel = () => {
        const sortedData = sortByEmployeeAndDate(data);
        const header = ['Employee_No', 'Date', 'Time'];
        const sheetData = [header, ...sortedData];
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
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