import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import TopBar from '../components/TopBar';

import { TbFingerprintScan } from "react-icons/tb";

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
        <div className="bg-white rounded-lg pb-4 shadow overflow-y-hidden">
            <TopBar />

            <div className="px-4 grid gap-3 grid-cols-12">
                <div className="col-span-12 p-4 rounded border border-stone-300">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-1.5 font-medium">
                            <TbFingerprintScan /> Scanner TXT to Excel Converter
                        </h3>
                    </div>

                    <div className="h-full px-4">
                        <input type="file" accept=".txt" onChange={handleFileUpload} />
                    </div>
                </div>
            </div>

            <div className="px-4 grid gap-3 grid-cols-12 mt-5">
                <div className="col-span-12 p-4 rounded border border-stone-300">
                    {preview.length > 0 && !isConfirmed && (
                        <div className="p-4 rounded">
                            <h3 className="font-semibold mb-2">Preview (First 10 Rows)</h3>
                            <table className="w-full table-auto border border-stone-300 rounded overflow-hidden">
                                <thead>
                                    <tr className="bg-stone-100 text-sm font-medium text-stone-600">
                                        <th className="text-left px-4 py-2 border-b border-stone-300">Employee_No</th>
                                        <th className="text-left px-4 py-2 border-b border-stone-300">Date</th>
                                        <th className="text-left px-4 py-2 border-b border-stone-300">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((row, idx) => (
                                        <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-stone-50"
                                            } hover:bg-stone-100`}>
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
            </div>
        </div>
    );
}