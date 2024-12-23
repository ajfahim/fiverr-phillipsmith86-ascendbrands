import axios from 'axios';

const postVehicleInformation = async (req, res) => {
  try {
    const { registration_number, password } = req.body;
    console.log('🚀 ~ postVehicleInformation ~ password:', password);
    if (password !== '1986') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid password',
      });
    }

    const url = `${process.env.One_Auto_URL}?vehicle_registration_mark=${registration_number}`;

    console.log('🚀 ~ postVehicleInformation ~ url:', url);
    const { data: oneAutoData } = await axios.get(url, {
      headers: {
        'x-api-key': process.env.One_Auto_API_KEY,
      },
    });

    console.log('🚀 ~ postVehicleInformation ~ oneAutoData:', oneAutoData);

    if (!oneAutoData.success) {
      console.log(
        '🚀 ~ postVehicleInformation ~ oneAutoData.success:',
        oneAutoData.success,
      );
      console.log(oneAutoData);
      return res.status(400).json({
        status: 'error',
        message: 'Failed to retrieve vehicle information from One Auto',
      });
    }
    let outVinData;

    if (oneAutoData.success) {
      // make request to outvin api to get vehicle colour and interior details
      // make axios request with basic auth
      console.log(
        'Hello',
        `${process.env.Outvin_URL}/${
          oneAutoData.result.vehicle_identification
            ?.vehicle_identification_number
        }`,
      );
      const { data } = await axios.get(
        `${process.env.Outvin_URL}/${
          oneAutoData.result.vehicle_identification
            ?.vehicle_identification_number
        }`,
        {
          auth: {
            username: process.env.Outvin_Username,
            password: process.env.Outvin_Password,
          },
        },
      );
      console.log('🚀 ~ postVehicleInformation ~ data:', data);
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

    return res.status(200).json({
      status: 'success',
      data: vehicleInformation,
    });
  } catch (error) {
    console.error('Error fetching vehicle information:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve vehicle information',
    });
  }
};

export const VehicleInformationController = {
  postVehicleInformation,
};
