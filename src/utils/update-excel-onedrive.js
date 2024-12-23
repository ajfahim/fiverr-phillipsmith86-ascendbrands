import { ConfidentialClientApplication } from '@azure/msal-node';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const msalConfig = {
  auth: {
    clientId: process.env.Azure_Client_ID,
    clientSecret: process.env.Azure_Client_Secret,
    authority: `https://login.microsoftonline.com/${process.env.Azure_TENANT_ID}`,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

// Function to get access token from Microsoft Graph
const getAccessToken = async () => {
  try {
    const tokenResponse = await cca.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default'],
    });
    return tokenResponse.accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Unable to get access token');
  }
};

// Function to get file ID of the Excel file in OneDrive
const getExcelFileId = async () => {
  try {
    const accessToken = await getAccessToken();
    const folderPath = '/Fiverr'; // The folder where your file is located
    const fileName = 'vehicle-info.xlsx'; // The exact name of the file

    const url = `https://graph.microsoft.com/v1.0/me/drive/root:${folderPath}/${fileName}:/`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const file = response.data;
    console.log('🚀 ~ getExcelFileId ~ file:', file);
    return file.id;
  } catch (error) {
    console.error('Error retrieving file from OneDrive:', error);
    throw new Error('Failed to retrieve file from OneDrive');
  }
};

// Function to insert data into the Excel file on OneDrive
const insertDataIntoExcel = async (fileId, accessToken, vehicleInformation) => {
  try {
    const worksheetId = 'sheet1'; // The worksheet you want to target (adjust as necessary)

    const data = [
      [
        vehicleInformation.vehicleRegistrationMark,
        vehicleInformation.dvlaManufacturerDesc,
        vehicleInformation.dvlaModelDesc,
        vehicleInformation.manufacturedYear,
        vehicleInformation.priorNiVrm,
        vehicleInformation.priorColourDVLA,
        vehicleInformation.originalColour,
        vehicleInformation.vehicleIdentificationNumber,
        vehicleInformation.paintName,
        vehicleInformation.paintCode,
        vehicleInformation.interior,
        vehicleInformation.interiorCode,
      ],
    ];

    await axios.post(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/workbook/worksheets/${worksheetId}/range(address='A1')/insert`,
      {
        values: data,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    console.log('Data successfully inserted into Excel');
  } catch (error) {
    console.error('Error inserting data into Excel:', error);
    throw new Error('Unable to insert data into Excel');
  }
};

export { getAccessToken, getExcelFileId, insertDataIntoExcel };
