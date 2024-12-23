import axios from 'axios';
import { createOrUpdateExcelFile } from '../../utils/update-excel-onedrive.js';

const postVehicleInformation = async (req, res) => {
  try {
    const { registration_number } = req.body;
    const url = `${process.env.One_Auto_URL}?vehicle_registration_mark=${registration_number}`;

    const { data: oneAutoData } = await axios.get(url, {
      headers: {
        'x-api-key': process.env.One_Auto_API_KEY,
      },
    });

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

    // const accessToken = await getAccessToken();
    // const filesAndFolders = await listFilesAndFolders(accessToken);
    // console.log(
    //   '🚀 ~ postVehicleInformation ~ filesAndFolders:',
    //   filesAndFolders,
    // );
    // const fileId = await getExcelFileId(accessToken);
    // await insertDataIntoExcel(fileId, accessToken, vehicleInformation);

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

export const VehicleInformationController = {
  postVehicleInformation,
};
