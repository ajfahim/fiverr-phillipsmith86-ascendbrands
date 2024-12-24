import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { createOrUpdateExcelFile } from '../../utils/save-excel-file-to-filesystem.js';

const postVehicleInformation = async (req, res) => {
  try {
    const { registration_number, password } = req.body;
    if (password !== process.env.EXCEL_PASSWORD) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid password',
      });
    }

    const url = `${process.env.One_Auto_URL}?vehicle_registration_mark=${registration_number}`;

    const { data: oneAutoData } = await axios.get(url, {
      headers: {
        'x-api-key': process.env.One_Auto_API_KEY,
      },
    });
    console.log('🚀 ~ postVehicleInformation ~ oneAutoData:', oneAutoData);

    if (!oneAutoData.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to retrieve vehicle information from One Auto',
      });
    }

    let outVinData;
    if (oneAutoData.success) {
      const { data } = await axios.get(
        `${process.env.Outvin_URL}/${oneAutoData.result.vehicle_identification?.vehicle_identification_number}`,
        {
          auth: {
            username: process.env.Outvin_Username,
            password: process.env.Outvin_Password,
          },
        },
      );
      outVinData = data;
    }

    const vehicleInformation = {
      VinNumber:
        oneAutoData.result.vehicle_identification
          ?.vehicle_identification_number || '',
      vehicleRegistrationMark:
        oneAutoData.result.vehicle_identification?.vehicle_registration_mark ||
        '',
      dvlaManufacturerDesc:
        oneAutoData.result.vehicle_identification?.dvla_manufacturer_desc || '',
      dvlaModelDesc:
        oneAutoData.result.vehicle_identification?.dvla_model_desc || '',
      manufacturedYear:
        oneAutoData.result.vehicle_identification?.manufactured_year || '',
      priorNiVrm: oneAutoData.result.vehicle_identification?.prior_ni_vrm || '',
      priorColourDVLA: oneAutoData.result.colour_details?.colour || '',
      originalColour: oneAutoData.result.colour_details?.original_colour || '',
      vehicleIdentificationNumber:
        oneAutoData.result.vehicle_identification
          ?.vehicle_identification_number || '',
      paintName: Object.values(
        outVinData.data.vehicle.stream_map.color_code.stream_result,
      )[0].description,
      paintCode: Object.values(
        outVinData.data.vehicle.stream_map.color_code.stream_result,
      )[0].code,
      interior: Object.values(
        outVinData.data.vehicle.stream_map.interior_code.stream_result,
      )[0].description,
      interiorCode: Object.values(
        outVinData.data.vehicle.stream_map.interior_code.stream_result,
      )[0].code,
    };

    // Define the file path for the Excel file
    const filePath = './vehicle-info.xlsx'; // Modify path as needed

    // Create or update the Excel file with the new vehicle information
    createOrUpdateExcelFile(filePath, vehicleInformation);

    return res.status(200).json({
      status: 'success',
      data: vehicleInformation,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve vehicle information and update Excel file',
    });
  }
};

const downloadExcelFile = async (req, res) => {
  try {
    //get password from query params

    const password = req.query.password;
    if (password !== process.env.EXCEL_PASSWORD) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    const filePath = path.join(path.resolve(), 'vehicle-info.xlsx'); // Path where the Excel file is saved

    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Set appropriate headers for file download
      res.download(filePath, 'vehicle-info.xlsx', (err) => {
        if (err) {
          console.error('Error during file download:', err);
          res.status(500).json({
            status: 'error',
            message: 'Failed to download the file.',
          });
        }
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'File not found',
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to handle file download',
    });
  }
};

export const VehicleInformationController = {
  postVehicleInformation,
  downloadExcelFile,
};
