import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Initialiser Firebase Admin avec les credentials
    const serviceAccount = this.configService.get('FIREBASE_SERVICE_ACCOUNT');

    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
  }

  async sendNotification(userFCMToken: string, notification: { title: string; body: string }, data?: any) {
    try {
      const message = {
        notification,
        data,
        token: userFCMToken,
      };

      const response = await admin.messaging().send(message);
      console.log('Notification sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  async sendTeamInvitationNotification(userFCMToken: string, teamName: string, teamId: string) {
    return this.sendNotification(
      userFCMToken,
      {
        title: 'Nouvelle invitation d\'équipe',
        body: `Vous avez été ajouté à l'équipe ${teamName}!`,
      },
      {
        type: 'TEAM_INVITATION',
        teamId,
      },
    );
  }

  async sendNewProjectNotification(userFCMToken: string, projectName: string, projectId: string) {
    return this.sendNotification(
      userFCMToken,
      {
        title: 'Nouveau projet',
        body: `Un nouveau projet "${projectName}" a été créé!`,
      },
      {
        type: 'NEW_PROJECT',
        projectId,
      },
    );
  }
}