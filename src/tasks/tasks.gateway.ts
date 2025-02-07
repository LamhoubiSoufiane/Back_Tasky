import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/websockets',
  namespace: '/',
  pingInterval: 10000,
  pingTimeout: 5000
})
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    console.log('Client connecté:', client.id);
  }

  async handleDisconnect(client: Socket) {
    console.log('Client déconnecté:', client.id);
  }

  @SubscribeMessage('joinProject')
  handleJoinProject(client: Socket, payload: { projectId: number }) {
    console.log(`Client ${client.id} rejoint le projet:`, payload.projectId);
    const room = `project_${payload.projectId}`;
    client.join(room);
    console.log(`Client ajouté à la room: ${room}`);
    // Envoyer une confirmation au client
    client.emit('joinedProject', {
      status: 'success',
      projectId: payload.projectId
    });
  }

  notifyTaskCreated(projectId: number, task: any) {
    const projectRoom = `project_${projectId}`;
    const userRoom = `user_${task.assignedTo}`;

    console.log(`Envoi notification taskCreated aux rooms ${projectRoom} et ${userRoom}:`, task);

    this.server.to(projectRoom).emit('taskCreated', {
      event: 'taskCreated',
      data: task
    });

    this.server.to(userRoom).emit('taskCreated', {
      event: 'taskCreated',
      data: task
    });
  }

  async notifyTaskUpdated(projectId: number, task: any) {
    try {
      const projectRoom = `project_${projectId}`;
      const userRoom = `user_${task.assignedTo}`;

      // Normaliser les données de la tâche
      const normalizedTask = {
        id: task.id,
        nom: task.nom,
        description: task.description,
        startDate: task.startDate,
        endDate: task.endDate,
        priority: task.priority,
        statut: task.statut,
        assignedTo: task.assignedTo, // S'assurer que ce champ est présent
        project: task.project || task.projet,
        // Ajouter les coordonnées si elles existent
        latitude: task.latitude,
        longitude: task.longitude
      };

      console.log('Envoi notification taskUpdated:');
      console.log('Project Room:', projectRoom);
      console.log('User Room:', userRoom);
      console.log('Task Data:', normalizedTask);

      // Envoyer aux deux rooms
      this.server.to(projectRoom).emit('taskUpdated', {
        event: 'taskUpdated',
        data: normalizedTask
      });

      this.server.to(userRoom).emit('taskUpdated', {
        event: 'taskUpdated',
        data: normalizedTask
      });

      console.log('Notification envoyée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification taskUpdated:', error);
    }
  }

  notifyTaskDeleted(projectId: number, taskId: number, userId: number) {
    const projectRoom = `project_${projectId}`;
    const userRoom = `user_${userId}`;

    console.log(`Envoi notification taskDeleted aux rooms ${projectRoom} et ${userRoom}:`, taskId);

    this.server.to(projectRoom).emit('taskDeleted', {
      event: 'taskDeleted',
      data: { _id: taskId }
    });

    this.server.to(userRoom).emit('taskDeleted', {
      event: 'taskDeleted',
      data: { _id: taskId }
    });
  }

  notifyTaskStatusUpdated(projectId: number, task: any) {
    const projectRoom = `project_${projectId}`;
    const userRoom = `user_${task.assignedTo}`;

    const statusUpdateData = {
      taskId: task.id,
      status: task.statut,
      assignedTo: task.assignedTo,
      updatedAt: new Date()
    };

    this.server.to(projectRoom).emit('taskStatusUpdated', {
      event: 'taskStatusUpdated',
      data: statusUpdateData
    });

    this.server.to(userRoom).emit('taskStatusUpdated', {
      event: 'taskStatusUpdated',
      data: statusUpdateData
    });
  }

  notifyTaskAssigned(projectId: number, task: any, previousAssignee: number | null) {
    const projectRoom = `project_${projectId}`;
    const newUserRoom = `user_${task.assignedTo}`;

    const assignmentData = {
      taskId: task.id,
      previousAssignee: previousAssignee,
      newAssignee: task.assignedTo,
      taskDetails: {
        nom: task.nom,
        description: task.description,
        statut: task.statut,
        priority: task.priority
      },
      updatedAt: new Date()
    };

    this.server.to(projectRoom).emit('taskAssigned', {
      event: 'taskAssigned',
      data: assignmentData
    });

    this.server.to(newUserRoom).emit('taskAssigned', {
      event: 'taskAssigned',
      data: assignmentData
    });

    if (previousAssignee) {
      const previousUserRoom = `user_${previousAssignee}`;
      this.server.to(previousUserRoom).emit('taskUnassigned', {
        event: 'taskUnassigned',
        data: assignmentData
      });
    }
  }
  @SubscribeMessage('joinUserTasks')
  handleJoinUserTasks(client: Socket, payload: { userId: number }) {
    console.log(`Client ${client.id} rejoint les tâches de l'utilisateur:`, payload.userId);
    const room = `user_${payload.userId}`;
    client.join(room);
    console.log(`Client ajouté à la room: ${room}`);
    client.emit('joinedUserTasks', {
      status: 'success',
      userId: payload.userId
    });
  }
}