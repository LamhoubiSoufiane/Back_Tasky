import { Controller, Post, UploadedFile, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import * as path from 'path';
import { diskStorage } from 'multer';

@Controller('upload')
export class UploadController {
 /* constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    // Utilisation du service pour obtenir la configuration de stockage et de filtre
    const storage = this.uploadService.getStorage();
    const fileFilter = this.uploadService.getFileFilter();

    // Exemple de logique pour gérer le fichier
    const imageUrl = `http://localhost:3000/uploads/images/${file.filename}`;
    return { success: true, imageUrl };
  }
    
*/

    constructor(private readonly uploadService: UploadService) {}

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: UploadService.getStorage(),
        fileFilter: UploadService.getFileFilter(),
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
        }

        // Créer l'URL complète pour accéder à l'image
        const imageUrl = `http://localhost:3000/uploads/images/${file.filename}`;
        return { 
            success: true, 
            imageUrl,
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        };
    }
}
