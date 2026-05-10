import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import XLSX from "xlsx-js-style";

/* ---------------- HELPERS ---------------- */

/**
 * Excel Export Helpers
 * Uses xlsx-js-style to generate formatted Excel workbooks.
 */

const getMonthName = (month, year) =>
  new Date(year, month).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

// Define a common border style for all cells
const borderStyle = {
  top: { style: "thin" },
  bottom: { style: "thin" },
  left: { style: "thin" },
  right: { style: "thin" },
};

/**
 * Apply Styles to Worksheet
 * Iterates through all cells in a sheet and applies formatting (Borders, Alignment, Bold).
 */
const applyStyles = (ws) => {
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;

      const isHeader = R === 0;
      const isNameCol = C === 1; // "Student Name" column
      // Check if this cell is part of the "TOTAL" summary rows
      const isTotalRow = ws[cellAddress].v === "TOTAL PRESENT" || ws[cellAddress].v === "TOTAL ABSENT" || ws[cellAddress].v === "TOTAL P" || ws[cellAddress].v === "TOTAL A";

      ws[cellAddress].s = {
        font: { bold: isHeader || isTotalRow, size: 11 },
        alignment: {
          horizontal: isNameCol ? "left" : "center", // Left align names, center everything else
          vertical: "center",
        },
        border: borderStyle,
      };
      
      // If it's a Total row, ensure the whole row's formatting is bold
      if (isTotalRow) {
        for (let c2 = range.s.c; c2 <= range.e.c; ++c2) {
          const addr2 = XLSX.utils.encode_cell({ r: R, c: c2 });
          if (ws[addr2]) {
             ws[addr2].s = { ...ws[addr2].s, font: { bold: true } };
          }
        }
      }
    }
  }

  // Set manual column widths (wch = width in characters)
  ws["!cols"] = [
    { wch: 8 },  // Roll No
    { wch: 25 }, // Name
    ...Array(40).fill({ wch: 4 }) // Individual date columns (narrower)
  ];
};

/**
 * Save and Share Excel File
 * Universal function for Web (download) and Native (share dialog).
 */
const saveAndShareExcel = async (fileName, workbook) => {
  if (Platform.OS === "web") {
    // Browser download
    XLSX.writeFile(workbook, fileName);
    return `File ${fileName} downloaded`;
  } else {
    // Mobile sharing dialog
    const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
    const fileUri = FileSystem.cacheDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Export Attendance",
      });
      return `File ${fileName} exported`;
    } else {
      throw new Error("Sharing is not available on this device");
    }
  }
};

/* =====================================================
   MONTHLY EXCEL EXPORT
   Creates a single-sheet Excel for a specific month.
 ===================================================== */
export const exportMonthlyAttendanceCSV = async ({
  selectedClass,
  dates,
  filteredStudents,
  getStatus,
  year,
  month,
}) => {
  if (!selectedClass) return;

  const header = ["Roll", "Student Name", ...dates.map(d => d.split("-")[2]), "P", "A"];
  const dailyPresent = Array(dates.length).fill(0);
  const dailyAbsent = Array(dates.length).fill(0);

  const rows = filteredStudents.map((s) => {
    const rowData = [s.rollNo || "", s.name || ""];
    let pCount = 0;
    let aCount = 0;
    dates.forEach((d, idx) => {
      const status = getStatus(s.id, d);
      rowData.push(status);
      if (status === "P") { pCount++; dailyPresent[idx]++; }
      else if (status === "A") { aCount++; dailyAbsent[idx]++; }
    });
    rowData.push(pCount, aCount);
    return rowData;
  });

  rows.push([], ["", "TOTAL PRESENT", ...dailyPresent], ["", "TOTAL ABSENT", ...dailyAbsent]);

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  applyStyles(ws);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");

  const fileName = `Attendance_${selectedClass}_${getMonthName(month, year).replace(/ /g, "_")}.xlsx`;
  return await saveAndShareExcel(fileName, wb);
};

/* =====================================================
   ALL MONTHS EXCEL EXPORT (MULTI-SHEET)
   Creates a workbook where each month is a separate tab.
 ===================================================== */
export const exportAllMonthsAttendanceCSV = async ({
  selectedClass,
  students,
  attendanceData,
  getStatus,
}) => {
  if (!selectedClass) return;

  const filteredStudents = students
    .filter((s) => s.class === selectedClass)
    .sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0));

  const monthsMap = {};
  Object.keys(attendanceData).forEach((date) => {
    const dt = new Date(date);
    const key = `${dt.getFullYear()}-${dt.getMonth()}`;
    if (!monthsMap[key]) {
      monthsMap[key] = { month: dt.getMonth(), year: dt.getFullYear() };
    }
  });

  const wb = XLSX.utils.book_new();

  Object.values(monthsMap).forEach(({ month, year }) => {
    const monthName = new Date(year, month).toLocaleString("default", { month: "short" });
    const sheetName = `${monthName}_${year}`;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    });

    const header = ["Roll", "Name", ...monthDates.map(d => d.split("-")[2]), "P", "A"];
    const dailyPresent = Array(monthDates.length).fill(0);
    const dailyAbsent = Array(monthDates.length).fill(0);

    const rows = filteredStudents.map((s) => {
      const rowData = [s.rollNo || "", s.name || ""];
      let pCount = 0;
      let aCount = 0;
      monthDates.forEach((d, idx) => {
        const status = getStatus(s.id, d);
        rowData.push(status);
        if (status === "P") { pCount++; dailyPresent[idx]++; }
        else if (status === "A") { aCount++; dailyAbsent[idx]++; }
      });
      rowData.push(pCount, aCount);
      return rowData;
    });

    rows.push([], ["", "TOTAL P", ...dailyPresent], ["", "TOTAL A", ...dailyAbsent]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    applyStyles(ws);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const fileName = `Attendance_${selectedClass}_Full_Report.xlsx`;
  return await saveAndShareExcel(fileName, wb);
};


