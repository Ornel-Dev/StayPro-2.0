-- SQL script to initialize the database schema for the StayPro project
-- Run with SQLite (`sqlite3 hotel.db < create_tables.sql`) or adapt for your RDBMS.

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('recepcionista','limpieza','administrador'))
);

CREATE TABLE IF NOT EXISTS rooms (
    number INTEGER PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('Individual','Doble')),
    status TEXT NOT NULL CHECK(status IN ('disponible','ocupada','limpieza','mantenimiento')),
    price REAL NOT NULL,
    guest TEXT,
    cleaningStatus TEXT NOT NULL CHECK(cleaningStatus IN ('limpia','sucia','en_proceso'))
);

CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientName TEXT NOT NULL,
    clientEmail TEXT,
    clientPhone TEXT,
    room INTEGER NOT NULL,
    checkin TEXT NOT NULL,
    checkout TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('confirmada','en_curso','cancelada')),
    observations TEXT
);

-- Default users
INSERT OR IGNORE INTO users(username,password,name,role) VALUES
  ('admin','admin123','Admin General','administrador'),
  ('recepcion','recep123','María García','recepcionista'),
  ('limpieza','limpieza123','Juan Pérez','limpieza');

-- Default rooms 101-120
INSERT OR IGNORE INTO rooms(number,type,status,price,guest,cleaningStatus) VALUES
  (101,'Individual','disponible',80,NULL,'limpia'),
  (102,'Individual','disponible',80,NULL,'limpia'),
  (103,'Individual','disponible',80,NULL,'limpia'),
  (104,'Individual','disponible',80,NULL,'limpia'),
  (105,'Individual','disponible',80,NULL,'limpia'),
  (106,'Individual','disponible',80,NULL,'limpia'),
  (107,'Individual','disponible',80,NULL,'limpia'),
  (108,'Individual','disponible',80,NULL,'limpia'),
  (109,'Individual','disponible',80,NULL,'limpia'),
  (110,'Individual','disponible',80,NULL,'limpia'),
  (111,'Doble','disponible',120,NULL,'limpia'),
  (112,'Doble','disponible',120,NULL,'limpia'),
  (113,'Doble','disponible',120,NULL,'limpia'),
  (114,'Doble','disponible',120,NULL,'limpia'),
  (115,'Doble','disponible',120,NULL,'limpia'),
  (116,'Doble','disponible',120,NULL,'limpia'),
  (117,'Doble','disponible',120,NULL,'limpia'),
  (118,'Doble','disponible',120,NULL,'limpia'),
  (119,'Doble','disponible',120,NULL,'limpia'),
  (120,'Doble','disponible',120,NULL,'limpia');

COMMIT;
