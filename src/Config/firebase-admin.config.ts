import { registerAs } from '@nestjs/config';

export default registerAs('firebase', () => ({
  serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
}));