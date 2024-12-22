-- Créer la base de données si elle n'existe pas
-- CREATE DATABASE tasky;

-- Se connecter à la base de données tasky
\c tasky;

-- Donner tous les privilèges à l'utilisateur postgres
ALTER USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE tasky TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
