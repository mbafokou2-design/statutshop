import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async () => ({
    folder: 'statutshop/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  }),
});

export const uploadProductImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

const deliveryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, file) => {
    const isCni = file.fieldname === 'cniPhoto';
    return {
      folder: isCni ? 'statutshop/deliveries/cni' : 'statutshop/deliveries/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    };
  },
});

export const uploadDeliveryImages = multer({
  storage: deliveryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});