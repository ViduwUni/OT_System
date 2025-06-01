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
            const entries = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const parts = line.split(/\s+/);
                if (parts.length >= 3) {
                    const [emp, date, time] = parts;
                    const dateTimeStr = `${date}T${time}`;
                    const dt = new Date(dateTimeStr);

                    if (isNaN(dt)) {
                        entries.push({
                            emp: emp || 'INVALID_EMP',
                            date: date || 'INVALID_DATE',
                            time: time || '',
                            dateTime: null,
                            invalid: true,
                            original: line
                        });
                        continue;
                    }

                    entries.push({ emp, date, time, dateTime: dt });
                } else {
                    const [emp, date, time] = parts;
                    entries.push({
                        emp: emp || 'INVALID_EMP',
                        date: date || 'INVALID_DATE',
                        time: time || '',
                        dateTime: null,
                        invalid: true,
                        original: line
                    });
                }
            }

            const grouped = {};
            entries.forEach(entry => {
                if (!entry.dateTime) {
                    const key = `${entry.emp}|INVALID`;
                    if (!grouped[key]) grouped[key] = [];
                    grouped[key].push(entry);
                    return;
                }

                const logicalDate = (entry.dateTime.getHours() < 6)
                    ? new Date(entry.dateTime.getFullYear(), entry.dateTime.getMonth(), entry.dateTime.getDate() - 1)
                    : new Date(entry.dateTime.getFullYear(), entry.dateTime.getMonth(), entry.dateTime.getDate());

                const logicalDateStr = logicalDate.toISOString().split('T')[0];
                const key = `${entry.emp}|${logicalDateStr}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(entry);
            });

            const sessions = [];

            Object.entries(grouped).forEach(([key, punches]) => {
                const [emp, date] = key.split('|');

                const invalids = punches.filter(p => p.invalid || !p.dateTime);
                invalids.forEach(entry => {
                    sessions.push([
                        entry.emp,
                        date,
                        '',
                        `Invalid: ${entry.original || 'Corrupted line'}`
                    ]);
                });

                const validPunches = punches.filter(p => !p.invalid && p.dateTime);
                if (validPunches.length === 0) return;

                validPunches.sort((a, b) => a.dateTime - b.dateTime);
                const uniquePunches = [validPunches[0]];
                for (let i = 1; i < validPunches.length; i++) {
                    const prev = uniquePunches[uniquePunches.length - 1].dateTime;
                    const curr = validPunches[i].dateTime;
                    if ((curr - prev) / 1000 > 60) {
                        uniquePunches.push(validPunches[i]);
                    }
                }

                const times = uniquePunches.map(p => p.dateTime);
                let inStr = '', outStr = '';

                if (times.length === 1) {
                    const t = times[0];
                    const timeStr = t.toTimeString().split(' ')[0];
                    if (t.getHours() < 6) {
                        outStr = timeStr;
                    } else {
                        inStr = timeStr;
                    }
                } else {
                    for (let i = 0; i < times.length; i++) {
                        if (times[i].getHours() >= 6) {
                            inStr = times[i].toTimeString().split(' ')[0];
                            break;
                        }
                    }
                    outStr = times[times.length - 1].toTimeString().split(' ')[0];
                    if (inStr === outStr) {
                        outStr = '';
                    }
                }

                sessions.push([emp, date, inStr, outStr]);
            });

            setRawData(sessions);
            setPreviewData(sessions.slice(0, 100)); // data count (PREVIEW)
            setConfirmed(false);
        };

        reader.readAsText(file);
    };

    const exportToExcel = () => {
        const sortedData = [...rawData].sort((a, b) => a[0].localeCompare(b[0]));

        const dataForExcel = [
            ['Employee_No', 'Date', 'In', 'Out'],
            ...sortedData.map(row => [row[0], row[1], row[2], row[3]])
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);

        const parseExcelTime = (timeStr) => {
            if (!timeStr || timeStr.startsWith('Invalid')) return null;
            const [h, m, s] = timeStr.split(':').map(Number);
            return (h * 3600 + m * 60 + (s || 0)) / 86400;
        };

        for (let i = 0; i < sortedData.length; i++) {
            const rowIndex = i + 2;
            worksheet[`A${rowIndex}`].t = 's';
            worksheet[`A${rowIndex}`].v = sortedData[i][0].toString();

            const dateStr = sortedData[i][1];
            const [year, month, day] = dateStr.split('-').map(Number);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                const dateOnly = new Date(year, month - 1, day);
                worksheet[`B${rowIndex}`].t = 'd';
                worksheet[`B${rowIndex}`].v = dateOnly;
                worksheet[`B${rowIndex}`].z = 'mm/dd/yyyy';
            } else {
                worksheet[`B${rowIndex}`].t = 's';
                worksheet[`B${rowIndex}`].v = dateStr;
            }

            const inTime = parseExcelTime(sortedData[i][2]);
            if (inTime !== null) {
                worksheet[`C${rowIndex}`].t = 'n';
                worksheet[`C${rowIndex}`].v = inTime;
                worksheet[`C${rowIndex}`].z = 'hh:mm:ss';
            } else {
                worksheet[`C${rowIndex}`].t = 's';
                worksheet[`C${rowIndex}`].v = sortedData[i][2] || '';
            }

            const outTime = parseExcelTime(sortedData[i][3]);
            if (outTime !== null) {
                worksheet[`D${rowIndex}`].t = 'n';
                worksheet[`D${rowIndex}`].v = outTime;
                worksheet[`D${rowIndex}`].z = 'hh:mm:ss';
            } else {
                worksheet[`D${rowIndex}`].t = 's';
                worksheet[`D${rowIndex}`].v = sortedData[i][3] || '';
            }
        }

        worksheet['!cols'] = [
            { wch: 12 },
            { wch: 15 },
            { wch: 12 },
            { wch: 30 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        const now = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `Attendance_${now}.xlsx`);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">TXT to Excel Converter</h2>
            <input type="file" accept=".txt" onChange={handleFile} className="mb-4" />

            {previewData.length > 0 && !confirmed && (
                <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-semibold mb-2">Preview (first 10 rows)</h3>
                    <div className="space-y-4">
                        {Object.entries(
                            previewData.reduce((acc, [emp, date, inTime, outTime]) => {
                                if (!acc[emp]) acc[emp] = [];
                                acc[emp].push([date, inTime, outTime]);
                                return acc;
                            }, {})
                        ).map(([emp, entries]) => (
                            <div key={emp} className="bg-white p-3 rounded shadow">
                                <h4 className="font-bold text-blue-600 mb-2">Employee: {emp}</h4>
                                <table className="table-auto border-collapse border border-gray-400 text-sm w-full">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="border border-gray-300 px-2 py-1">Date</th>
                                            <th className="border border-gray-300 px-2 py-1">In</th>
                                            <th className="border border-gray-300 px-2 py-1">Out</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map(([date, inTime, outTime], idx) => (
                                            <tr key={idx}>
                                                <td className="border border-gray-300 px-2 py-1">{date}</td>
                                                <td className="border border-gray-300 px-2 py-1">{inTime}</td>
                                                <td className="border border-gray-300 px-2 py-1">{outTime}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setConfirmed(true)}
                        className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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
}