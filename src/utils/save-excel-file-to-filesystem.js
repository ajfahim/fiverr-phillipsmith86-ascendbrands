// utils/update-excel-onedrive.js
import fs from 'fs';
import XLSX from 'xlsx';

// Function to create or update the Excel file on the server
export const createOrUpdateExcelFile = (filePath, vehicleInformation) => {
  let workbook;

  // Check if file exists, and read it if it does
  if (fs.existsSync(filePath)) {
    workbook = XLSX.readFile(filePath); // Read the existing file
  } else {
    // If the file does not exist, create a new workbook and add a sheet with headers
    workbook = XLSX.utils.book_new();
    workbook.SheetNames.push('Sheet1');
    workbook.Sheets['Sheet1'] = XLSX.utils.aoa_to_sheet([
      [
        'Vehicle Registration Number',
        'VIN Number',
        'Manufacturer',
        'Model',
        'Year of Manufacture',
        'Prior VRM',
        'Prior Colour – DVLA',
        'Original Colour - DVLA',
        'Paint Name',
        'Paint Code',
        'Interior',
        'Interior Code',
      ],
    ]); // Add headers
  }

  // Get the first sheet
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Get the current row count and add the new row
  const rowCount = XLSX.utils.sheet_to_json(sheet).length + 1; // Add 1 to get the next row number

  // Format the data to match the Excel columns
  const newRow = [
    vehicleInformation.vehicleRegistrationMark,
    vehicleInformation.vehicleIdentificationNumber,
    vehicleInformation.dvlaManufacturerDesc,
    vehicleInformation.dvlaModelDesc,
    vehicleInformation.manufacturedYear,
    vehicleInformation.priorNiVrm,
    vehicleInformation.priorColourDVLA,
    vehicleInformation.originalColour,
    vehicleInformation.paintName,
    vehicleInformation.paintCode,
    vehicleInformation.interior,
    vehicleInformation.interiorCode,
  ];

  // Add the new row of data
  XLSX.utils.sheet_add_aoa(sheet, [newRow], { origin: `A${rowCount + 1}` });

  // Write the updated workbook to the file
  XLSX.writeFile(workbook, filePath);
};
