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

// Configuration du stockage (utilisé par multer)
getStorage() {
    return diskStorage({
      // Définir le répertoire de destination des fichiers uploadés
      destination: (req, file, cb) => {
        this.createUploadDir(); // Crée le répertoire avant de sauvegarder
        cb(null, path.join(__dirname, '..', 'uploads', 'images'));
      },
      // Nom unique du fichier
      filename: (req, file, cb) => {
        console.log("Fichier reçu : ", file);  // Vérifie le contenu du fichier
        const fileExtension = path.extname(file.originalname);
        if (!fileExtension) {
          return cb(new Error('File extension not found'));  // Vérifie s'il y a une extension
        }
        console.log("Extension du fichier : ", fileExtension);  // Vérifie l'extension récupérée
        cb(null, Date.now() + fileExtension);  // Génère un nom unique avec l'extension
      },
    });
  }

  // Filtre les fichiers autorisés (ici uniquement les images)
  getFileFilter() {
    return (req, file, cb) => {
      const mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (mimeTypes.includes(file.mimetype)) {
        cb(null, true); // Autorise les fichiers valides
      } else {
        cb(new Error('Only image files are allowed!'), false); // Fichiers non valides rejetés
      }
    };
  }
}
