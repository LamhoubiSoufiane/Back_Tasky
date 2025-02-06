import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {

  /*constructor() {
    // S'assurer que l'instance est correctement initialisée
    this.createUploadDir();
  }

  // Crée le répertoire d'upload si nécessaire
  createUploadDir() {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  // Méthode pour récupérer la configuration du stockage
  getStorage() {
    return diskStorage({
      // Définition du répertoire de destination des fichiers uploadés
      destination: (req, file, cb) => {
        this.createUploadDir(); // Crée le répertoire avant de sauvegarder
        cb(null, path.join(__dirname, '..', 'uploads', 'images')); // Destination du fichier
      },
      // Définition du nom du fichier (unique avec le timestamp)
      filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nom unique avec l'extension
      },
    });
  }

  // Méthode pour récupérer le filtre de fichier
  getFileFilter() {
    return (req, file, cb) => {
      const mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (mimeTypes.includes(file.mimetype)) {
        cb(null, true); // Autorise les fichiers valides
      } else {
        cb(new Error('Only image files are allowed!'), false); // Rejette les fichiers invalides
      }
    };
  }
*/

constructor() {
    // S'assurer que le dossier d'upload existe dès l'initialisation du service
    this.createUploadDir();
  }

  // Crée le répertoire d'upload si nécessaire
  createUploadDir() {
    // Modification du chemin pour être sûr qu'il est créé à la racine du projet
    const uploadDir = path.join(process.cwd(), 'uploads', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  // Méthode statique pour fournir la configuration du stockage à Multer
  static getStorage() {
    return diskStorage({
      destination: (req, file, cb) => {
        // Utilisation du même chemin ici
        const uploadDir = path.join(process.cwd(), 'uploads', 'images');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);
        if (!fileExtension) {
          return cb(new Error('File extension not found'), null);
        }
        cb(null, `${Date.now()}${fileExtension}`);
      },
    });
  }

  // Méthode statique pour fournir le filtre des fichiers à Multer
  static getFileFilter() {
    return (req, file, cb) => {
      const mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (mimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    };
  }

  // Ajouter cette méthode pour vérifier si le fichier existe
  async verifyFileExists(filename: string): Promise<boolean> {
    const filePath = path.join(__dirname, '..', 'uploads', 'images', filename);
    return fs.existsSync(filePath);
  }

}
