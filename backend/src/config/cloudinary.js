import { v2 as cloudinary } from 'cloudinary';

export const REQUIRED_VARS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

export function configureCloudinary() {
  const missing = REQUIRED_VARS.filter(
    (name) => !process.env[name]
  );

  if (missing.length === 0) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  return { missing };
}

export { cloudinary };