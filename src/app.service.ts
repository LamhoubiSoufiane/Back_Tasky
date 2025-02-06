import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  createUploadDir() {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  storage = diskStorage({
    destination: (req, file, cb) => {
      this.createUploadDir();
      cb(null, path.join(__dirname, '..', 'uploads', 'images'));
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Nom unique
    },
  });

  fileFilter = (req, file, cb) => {
    const mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (mimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  };

}
