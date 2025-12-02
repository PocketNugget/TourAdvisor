-- Database Initialization for Chichen Itzá Virtual Tour

CREATE DATABASE IF NOT EXISTS chichen_itza_db;
USE chichen_itza_db;

-- Table: ZonaGeografica
CREATE TABLE IF NOT EXISTS ZonaGeografica (
    idZona INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    esPrivada BOOLEAN DEFAULT FALSE
);

-- Table: Rol
CREATE TABLE IF NOT EXISTS Rol (
    idRol INT AUTO_INCREMENT PRIMARY KEY,
    nombreRol VARCHAR(50) NOT NULL
);

-- Table: Permiso
CREATE TABLE IF NOT EXISTS Permiso (
    idPermiso INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    idRol INT,
    FOREIGN KEY (idRol) REFERENCES Rol(idRol) ON DELETE CASCADE
);

-- Table: Servidor
CREATE TABLE IF NOT EXISTS Servidor (
    idServidor INT AUTO_INCREMENT PRIMARY KEY,
    ubicacion VARCHAR(100),
    capacidadUsuarios INT,
    estado VARCHAR(50)
);

-- Table: Participante (Updated for Auth)
CREATE TABLE IF NOT EXISTS Participante (
    idParticipante INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE, -- Made optional for admin/simple auth
    username VARCHAR(50) UNIQUE, -- New field
    password VARCHAR(50), -- New field (Plaintext for MVP as requested)
    conexionActiva BOOLEAN DEFAULT FALSE,
    ubicacionActual VARCHAR(100),
    idServidor INT,
    FOREIGN KEY (idServidor) REFERENCES Servidor(idServidor) ON DELETE SET NULL
);

-- Table: GuiaTurista
CREATE TABLE IF NOT EXISTS GuiaTurista (
    idParticipante INT PRIMARY KEY,
    certificacion VARCHAR(100),
    idioma VARCHAR(50),
    FOREIGN KEY (idParticipante) REFERENCES Participante(idParticipante) ON DELETE CASCADE
);

-- Table: Avatar
CREATE TABLE IF NOT EXISTS Avatar (
    idAvatar INT AUTO_INCREMENT PRIMARY KEY,
    tipoAvatar VARCHAR(50),
    estado VARCHAR(50),
    posicionX FLOAT DEFAULT 0.0,
    posicionY FLOAT DEFAULT 0.0,
    idParticipante INT UNIQUE,
    idZonaActual INT,
    idRol INT,
    FOREIGN KEY (idParticipante) REFERENCES Participante(idParticipante) ON DELETE CASCADE,
    FOREIGN KEY (idZonaActual) REFERENCES ZonaGeografica(idZona) ON DELETE SET NULL,
    FOREIGN KEY (idRol) REFERENCES Rol(idRol) ON DELETE SET NULL
);

-- Table: RecorridoVirtual
CREATE TABLE IF NOT EXISTS RecorridoVirtual (
    idRecorrido INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50),
    fechaInicio DATETIME,
    duracion INT,
    idGuia INT,
    FOREIGN KEY (idGuia) REFERENCES GuiaTurista(idParticipante) ON DELETE SET NULL
);

-- Join Table for RecorridoVirtual <-> Participante
ALTER TABLE Participante ADD COLUMN idRecorrido INT;
ALTER TABLE Participante ADD CONSTRAINT fk_recorrido FOREIGN KEY (idRecorrido) REFERENCES RecorridoVirtual(idRecorrido) ON DELETE SET NULL;

-- Join Table for RecorridoVirtual <-> ZonaGeografica
CREATE TABLE IF NOT EXISTS Recorrido_Zonas (
    idRecorrido INT,
    idZona INT,
    PRIMARY KEY (idRecorrido, idZona),
    FOREIGN KEY (idRecorrido) REFERENCES RecorridoVirtual(idRecorrido) ON DELETE CASCADE,
    FOREIGN KEY (idZona) REFERENCES ZonaGeografica(idZona) ON DELETE CASCADE
);

-- Seed Data
INSERT INTO ZonaGeografica (nombre, descripcion, esPrivada) VALUES 
('El Castillo', 'The iconic pyramid of Kukulkan', FALSE),
('Great Ball Court', 'The largest ball court in ancient Mesoamerica', FALSE),
('Temple of the Warriors', 'A large stepped pyramid fronted by rows of carved columns', TRUE);

INSERT INTO Rol (nombreRol) VALUES ('Explorer'), ('Guide'), ('Photographer'), ('Researcher'), ('Admin');

INSERT INTO Servidor (ubicacion, capacidadUsuarios, estado) VALUES ('US-East', 1000, 'Active');

-- Seed Users (MVP Credentials)
-- Admin User (Role 5 = Admin)
INSERT INTO Participante (nombre, username, password, correo) VALUES ('Administrator', 'admin', 'admin', 'admin@mayavision.com');
SET @adminId = LAST_INSERT_ID();
INSERT INTO Avatar (tipoAvatar, estado, idParticipante, idRol) VALUES ('AdminAvatar', 'Active', @adminId, 5);

-- Normal User (Role 1 = Explorer)
INSERT INTO Participante (nombre, username, password, correo) VALUES ('Standard User', 'user', 'user', 'user@example.com');
SET @userId = LAST_INSERT_ID();
INSERT INTO Avatar (tipoAvatar, estado, idParticipante, idRol) VALUES ('ExplorerAvatar', 'Active', @userId, 1);

-- Make Admin a Guide as well to allow tour creation (idGuia FK)
INSERT INTO GuiaTurista (idParticipante, certificacion, idioma) VALUES (@adminId, 'Official Guide', 'English, Spanish');

