# Tasky API

A comprehensive task management system API built with NestJS.

## Description

Tasky is a task management system that allows teams to organize and track their projects and tasks efficiently. The API provides endpoints for user authentication, team management, project management, task tracking, and task assistance.

## Features

- User Authentication (Register/Login)
- Team Management
- Project Management
- Task Management with Location Support
- Task Assistance System
- Role-based Access Control

## API Documentation

### Authentication

#### Register
- **POST** `/auth/register`
- Register a new user
- Body:
```json
{
    "email": "john.doe@example.com",
    "password": "password123",
    "nom": "Doe",
    "prenom": "John",
    "username": "johndoe"
}
```

#### Login
- **POST** `/auth/login`
- Login with credentials
- Body:
```json
{
    "email": "john.doe@example.com",
    "password": "password123"
}
```

### Teams

#### Create Team
- **POST** `/teams`
- Create a new team
- Requires Authentication
- Body:
```json
{
    "nom": "My Team",
    "description": "A team description",
    "memberIds": [1, 2, 3]
}
```

#### Get All Teams
- **GET** `/teams`
- Get all teams for authenticated user
- Requires Authentication

### Projects

#### Create Project
- **POST** `/projets`
- Create a new project
- Requires Authentication
- Body:
```json
{
    "nom": "New Project",
    "description": "Project description",
    "startDate": "2025-01-23",
    "endDate": "2025-02-23",
    "status": "planifié",
    "teamId": 1
}
```

#### Get Projects
- **GET** `/projets` - Get all projects
- **GET** `/projets/:id` - Get project by ID
- **GET** `/projets/team/:teamId` - Get projects by team
- **GET** `/projets/member/:memberId` - Get projects by team member
- Requires Authentication

#### Update Project
- **PUT** `/projets/:id`
- Update project details (Team Owner only)
- Requires Authentication
- Body: Same as create project

#### Delete Project
- **DELETE** `/projets/:id`
- Delete a project and its tasks (Team Owner only)
- Requires Authentication

### Tasks

#### Create Task
- **POST** `/tasks`
- Create a new task
- Requires Authentication
- Body:
```json
{
    "nom": "New Task",
    "description": "Task description",
    "startDate": "2025-01-23",
    "endDate": "2025-02-23",
    "priority": "normale",
    "statut": "a faire",
    "projetId": 1,
    "location": {
        "latitude": 33.5731104,
        "longitude": -7.5898434,
        "address": "Casablanca, Morocco"
    }
}
```

#### Get Tasks
- **GET** `/tasks/:taskId` - Get task by ID
- **GET** `/tasks/project/:projectId` - Get tasks by project
- **GET** `/tasks/my-tasks` - Get all assigned tasks
- **GET** `/tasks/my-tasks/a-faire` - Get to-do tasks
- **GET** `/tasks/my-tasks/en-cours` - Get in-progress tasks
- **GET** `/tasks/my-tasks/terminees` - Get completed tasks
- Requires Authentication

## Security

- All endpoints (except register/login) require JWT authentication
- Team-based access control
- Project ownership verification
- Task assignment validation

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_database
JWT_SECRET=your_jwt_secret
```

## Docker Support

The application includes Docker support. To run with Docker:

```bash
$ docker-compose up
```

## License

This project is licensed under the MIT License.
