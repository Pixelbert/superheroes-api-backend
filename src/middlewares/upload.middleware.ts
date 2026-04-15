import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/images')); 
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${path.basename(file.originalname, ext)}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

export const upload = multer({ storage: storage });