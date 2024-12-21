import { z } from 'zod';

const vehicleInformationValidationSchema = z.object({
  body: z.object({
    registration_number: z.string(),
  }),
});

export const VehicleInformationValidation = {
  vehicleInformationValidationSchema,
};
