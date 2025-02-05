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
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const storage = this.uploadService.getStorage();
    const fileFilter = this.uploadService.getFileFilter();

    // Vérifie si storage et fileFilter sont définis
    if (!storage || !fileFilter) {
      throw new HttpException('Invalid file configuration', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const imageUrl = `http://localhost:3000/uploads/images/${file.filename}`;
    return { success: true, imageUrl };
  }

}
