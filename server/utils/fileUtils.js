import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createUploadsFolder = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  const modelsDir = path.join(uploadsDir, 'models');
  const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

  [uploadsDir, modelsDir, thumbnailsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

export const deleteFile = async (filePath) => {
  try {
    await fs.remove(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
