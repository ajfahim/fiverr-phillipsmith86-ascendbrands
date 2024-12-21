import express from 'express';
import validateRequest from '../../middlewares/validateRequest.js';
import { VehicleInformationController } from './vehicle.controller.js';
import { VehicleInformationValidation } from './vehicle.validation.js';

const router = express.Router();

router.post(
  '/',
  validateRequest(
    VehicleInformationValidation.vehicleInformationValidationSchema,
  ),
  VehicleInformationController.postVehicleInformation,
);
export const VehicleRoutes = router;
