import * as XLSX from "xlsx";

const DownloadTemplateButton = () => {
    const handleDownload = () => {
        const wsData = [
            [
                "Employee No",
                "Date",
                "Shift",
                "In Time",
                "Out Time",
                "Reason"
            ],
            [
                "EMP001",
                "2025-06-01",
                "A",
                "2025-06-01T06:30",
                "2025-06-01T18:00",
                "Worked late on urgent task"
            ]
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Optional: auto column widths
        ws["!cols"] = wsData[0].map((col) => ({ wch: col.length + 10 }));

        // Optional: freeze header row
        ws["!freeze"] = { xSplit: 0, ySplit: 1 };

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "OT Template");

        XLSX.writeFile(wb, "Overtime_Import_Template.xlsx");
    };

    return (
        <div>
            <button
                onClick={handleDownload}
            >
                Download Excel Template
            </button>
            <br />
            <br />
        </div>
    );
};

export default DownloadTemplateButton;