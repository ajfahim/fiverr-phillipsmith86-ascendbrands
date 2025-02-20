import axios from 'axios';
import fs from 'fs';
import path from 'path';
import ApiError from '../../utils/ApiError.js';
import catchAsync from '../../utils/catchAsync.js';
import { createOrUpdateExcelFile } from '../../utils/save-excel-file-to-filesystem.js';

const postVehicleInformation = catchAsync(async (req, res) => {
  const { registration_number, password } = req.body;

  if (password !== process.env.EXCEL_PASSWORD) {
    throw new ApiError(401, 'Invalid password');
  }

  if (!registration_number) {
    throw new ApiError(400, 'Registration number is required');
  }

  const url = `${process.env.One_Auto_URL}?vehicle_registration_mark=${registration_number}`;

  try {
    const { data: oneAutoData } = await axios.get(url, {
      headers: {
        'x-api-key': process.env.One_Auto_API_KEY,
      },
      timeout: 5000, // 5 second timeout
    });

    if (!oneAutoData.success) {
      throw new ApiError(
        400,
        'Failed to retrieve vehicle information from One Auto',
      );
    }

    let outVinData;
    try {
      const vin =
        oneAutoData.result.vehicle_identification
          ?.vehicle_identification_number;
      if (!vin) {
        throw new ApiError(400, 'Vehicle identification number not found');
      }

      const { data } = await axios.get(`${process.env.Outvin_URL}/${vin}`, {
        auth: {
          username: process.env.Outvin_Username,
          password: process.env.Outvin_Password,
        },
        timeout: 5000,
      });
      outVinData = data;

      if (!outVinData || !outVinData.data || !outVinData.data.vehicle) {
        throw new ApiError(400, 'Invalid response from Outvin API');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(
          error.response?.status || 500,
          `Outvin API Error: ${error.message}`,
        );
      }
      throw error;
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
    };

    // Add paint and interior information if available
    if (outVinData?.data?.vehicle?.stream_map) {
      const colorStream =
        outVinData.data.vehicle.stream_map.color_code?.stream_result;
      const interiorStream =
        outVinData.data.vehicle.stream_map.interior_code?.stream_result;

      if (colorStream) {
        const colorValues = Object.values(colorStream)[0];
        vehicleInformation.paintName = colorValues?.description || '';
        vehicleInformation.paintCode = colorValues?.code || '';
      }

      if (interiorStream) {
        const interiorValues = Object.values(interiorStream)[0];
        vehicleInformation.interior = interiorValues?.description || '';
        vehicleInformation.interiorCode = interiorValues?.code || '';
      }
    }

    // Define the file path for the Excel file
    const filePath = './vehicle-info.xlsx';

    try {
      // Create or update the Excel file with the new vehicle information
      await createOrUpdateExcelFile(filePath, vehicleInformation);
    } catch (error) {
      throw new ApiError(500, 'Failed to update Excel file');
    }

    return res.status(200).json({
      status: 'success',
      data: vehicleInformation,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(
        error.response?.status || 500,
        `One Auto API Error: ${error.message}`,
      );
    }
    throw error;
  }
});

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
