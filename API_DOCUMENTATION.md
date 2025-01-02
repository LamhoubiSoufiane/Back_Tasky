# Documentation API Tasky

## Base URL
```
http://localhost:3000
```

## Authentification

Pour toutes les requêtes (sauf /auth/login et /auth/register), vous devez inclure le header d'authentification :
```
Authorization: Bearer <access_token>
```

**Important :** 
- Le token doit être obtenu via le endpoint de login
- Le token expire après 15 minutes
- Pour les requêtes après expiration, utilisez le refresh token pour obtenir un nouveau access token
- Format : remplacez <access_token> par votre token JWT sans les chevrons <>

### 1. Inscription
```http
POST /auth/register
```
*Aucun header d'authentification requis*

Body:
```json
{
    "nom": "John",
    "prenom": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
}
```
Réponse (200 OK):
```json
{
    "id": 1,
    "nom": "John",
    "prenom": "Doe",
    "username": "johndoe",
    "email": "john@example.com"
}
```

### 2. Connexion
```http
POST /auth/login
```
*Aucun header d'authentification requis*

Body:
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```
Réponse (200 OK):
```json
{
    "id": 1,
    "email": "john@example.com",
    "username": "johndoe",
    "nom": "John",
    "prenom": "Doe",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Rafraîchir le Token
```http
POST /auth/refresh
```
*Requiert le refresh token dans le header*

Header:
```
Authorization: Bearer <refresh_token>
```

Réponse (200 OK):
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Déconnexion
```http
POST /auth/logout
```
*Requiert le access token dans le header*

Header:
```
Authorization: Bearer <access_token>
```

Réponse (200 OK):
```json
{
    "message": "Logout successful"
}
```

## Utilisateurs

### 1. Rechercher des utilisateurs
```http
GET /users/search?q=john
```
Recherche un utilisateur par email ou username. Retourne également la liste des équipes dont l'utilisateur est membre.

Réponse (200 OK):
```json
[
    {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "nom": "John",
        "prenom": "Doe",
        "teams": [
            {
                "id": 1,
                "nom": "Équipe A",
                "owner": {
                    "id": 2,
                    "username": "jane",
                    "nom": "Jane",
                    "prenom": "Smith"
                }
            },
            {
                "id": 2,
                "nom": "Équipe B",
                "owner": {
                    "id": 1,
                    "username": "johndoe",
                    "nom": "John",
                    "prenom": "Doe"
                }
            }
        ]
    },
    {
        "id": 3,
        "username": "johnny",
        "email": "johnny@example.com",
        "nom": "Johnny",
        "prenom": "Smith",
        "teams": []
    }
]
```

## Équipes

### 1. Créer une équipe
```http
POST /teams
```
Body:
```json
{
    "nom": "Mon équipe",
    "memberIds": [2, 3, 4]  // Optionnel, IDs des membres supplémentaires
}
```
Réponse (201 Created):
```json
{
    "id": 1,
    "nom": "Mon équipe",
    "owner": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "nom": "John",
        "prenom": "Doe"
    },
    "members": [
        {
            "id": 1,
            "username": "johndoe",
            "email": "john@example.com",
            "nom": "John",
            "prenom": "Doe"
        },
        {
            "id": 2,
            "username": "jane",
            "email": "jane@example.com",
            "nom": "Jane",
            "prenom": "Smith"
        }
    ]
}
```

### 2. Obtenir toutes les équipes
```http
GET /teams
```
Réponse (200 OK):
```json
[
    {
        "id": 1,
        "nom": "Mon équipe",
        "owner": {
            "id": 1,
            "username": "johndoe",
            "nom": "John",
            "prenom": "Doe"
        },
        "members": [
            {
                "id": 1,
                "username": "johndoe",
                "nom": "John",
                "prenom": "Doe"
            },
            {
                "id": 2,
                "username": "jane",
                "nom": "Jane",
                "prenom": "Smith"
            }
        ]
    }
]
```

### 3. Obtenir une équipe spécifique
```http
GET /teams/1
```
Réponse (200 OK):
```json
{
    "id": 1,
    "nom": "Mon équipe",
    "owner": {
        "id": 1,
        "username": "johndoe",
        "nom": "John",
        "prenom": "Doe"
    },
    "members": [
        {
            "id": 1,
            "username": "johndoe",
            "nom": "John",
            "prenom": "Doe"
        },
        {
            "id": 2,
            "username": "jane",
            "nom": "Jane",
            "prenom": "Smith"
        }
    ]
}
```

### 4. Mettre à jour une équipe
```http
PUT /teams/1
```
Body:
```json
{
    "nom": "Nouveau nom d'équipe",
    "memberIds": [2, 3, 4]
}
```
Réponse (200 OK):
```json
{
    "id": 1,
    "nom": "Nouveau nom d'équipe",
    "owner": {
        "id": 1,
        "username": "johndoe",
        "nom": "John",
        "prenom": "Doe"
    },
    "members": [
        {
            "id": 1,
            "username": "johndoe",
            "nom": "John",
            "prenom": "Doe"
        },
        {
            "id": 2,
            "username": "jane",
            "nom": "Jane",
            "prenom": "Smith"
        }
    ]
}
```

### 5. Ajouter un membre à une équipe
```http
POST /teams/1/members/5
```
Réponse (200 OK):
```json
{
    "id": 1,
    "nom": "Mon équipe",
    "owner": {
        "id": 1,
        "username": "johndoe",
        "nom": "John",
        "prenom": "Doe"
    },
    "members": [
        {
            "id": 1,
            "username": "johndoe",
            "nom": "John",
            "prenom": "Doe"
        },
        {
            "id": 5,
            "username": "alice",
            "nom": "Alice",
            "prenom": "Wilson"
        }
    ]
}
```

### 6. Supprimer une équipe
```http
DELETE /teams/1
```
Réponse (204 No Content)

## Codes d'erreur communs

- 400 Bad Request : Requête invalide
```json
{
    "statusCode": 400,
    "message": "Invalid request body"
}
```

- 401 Unauthorized : Non authentifié
```json
{
    "statusCode": 401,
    "message": "Unauthorized"
}
```

- 403 Forbidden : Non autorisé
```json
{
    "statusCode": 403,
    "message": "Only team owner can perform this action"
}
```

- 404 Not Found : Ressource non trouvée
```json
{
    "statusCode": 404,
    "message": "Team with ID 1 not found"
}
```

## Notes importantes

1. Le créateur d'une équipe devient automatiquement le chef d'équipe (owner)
2. Le chef d'équipe est toujours membre de son équipe
3. Seul le chef d'équipe peut :
   - Modifier l'équipe
   - Supprimer l'équipe
   - Ajouter de nouveaux membres
4. Toutes les routes (sauf login et register) nécessitent un token JWT valide
5. Le token JWT expire après 1 heure
6. La recherche d'utilisateurs inclut maintenant la liste des équipes dont ils sont membres
7. Lors de l'ajout d'un membre à une équipe, l'équipe est automatiquement ajoutée à la liste des équipes du membre
