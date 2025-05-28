import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function TxtToExcel() {
    const [rawData, setRawData] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [confirmed, setConfirmed] = useState(false);

    const handleFile = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            const lines = event.target.result.split('\n');
            const extracted = lines
                .map(line => {
                    const parts = line.trim().split(/\s+/); // this splits cleanly by tabs OR spaces
                    return parts.length >= 3 ? [parts[0], parts[1], parts[2]] : null;
                })
                .filter(Boolean);

            setRawData(extracted);
            setPreviewData(extracted.slice(0, 10));
            setConfirmed(false);
        };
        reader.readAsText(file);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.aoa_to_sheet([['Employee_ID', 'Date', 'Time'], ...rawData]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, 'Refactored Attendance.xlsx');
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">TXT to Excel Converter</h2>
            <input type="file" accept=".txt" onChange={handleFile} className="mb-4" />

            {previewData.length > 0 && !confirmed && (
                <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-semibold mb-2">Preview (first 10 rows)</h3>
                    <table className="table-auto border-collapse border border-gray-400">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 px-2">Employee_ID</th>
                                <th className="border border-gray-300 px-2">Date</th>
                                <th className="border border-gray-300 px-2">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {previewData.map((row, idx) => (
                                <tr key={idx}>
                                    {row.map((cell, i) => (
                                        <td key={i} className="border border-gray-300 px-2">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        onClick={() => setConfirmed(true)}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Confirm and Export
                    </button>
                </div>
            )}

            {confirmed && (
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
};