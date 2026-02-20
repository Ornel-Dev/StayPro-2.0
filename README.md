# StayPro Backend and Database Setup

This repository contains a simple static front-end and a Node.js/Express backend to store users and rooms in a SQLite database.

## Getting started

1. **Instalar dependencias** (requiere Node.js):
   ```bash
   cd "c:\Users\ornel\OneDrive\Desktop\StayPro 2.5"
   npm install
   ```

2. **Inicializar la base de datos** *(opcional)*:

- Opción A — con la CLI de sqlite3 instalada:
   ```bash
   npm run init-db
   ```

- Opción B — sin la CLI: el servidor crea las tablas automáticamente al arrancar si no existe `hotel.db`.

3. **Arrancar la app**:

    - Usar el script de producción:
       ```bash
       npm start
       ```

    - Para desarrollo con recarga automática (instala devDependencies si no están):
       ```bash
       npm run dev
       ```

    El servidor sirve `index.html`, `script.js` y `styles.css` en http://localhost:3000 por defecto.

4. **Abrir la UI** en el navegador:
   - Navega a `http://localhost:3000/` y usa una cuenta inicial (seeded) para pruebas:
     - `admin` / `admin123` (administrator)
     - `recepcion` / `recep123` (receptionist)
     - `limpieza` / `limpieza123` (cleaning)

## Variables de entorno

Puedes configurar el puerto y la ruta de la base de datos con un archivo `.env`. Un ejemplo está en `.env.example`.

## API endpoints

The backend exposes a simple REST API under `/api`:

### Users
- `GET /api/users` – returns all users (including passwords for demonstration)
- `GET /api/users/:username` – single user
- `POST /api/users` – create user with JSON body `{ username, password, name, role }`
- `PUT /api/users/:username` – update fields such as `password`, `name` or `role`
- `DELETE /api/users/:username` – remove user

### Rooms
- `GET /api/rooms` – list of all rooms
- `GET /api/rooms/:number` – details for a room
- `POST /api/rooms` – create a room
- `PUT /api/rooms/:number` – update room properties (status, cleaningStatus, guest, etc.)
- `DELETE /api/rooms/:number` – delete room

### Reservations
- `GET /api/reservations` – retrieve all reservations (used by front‑end on load)
- `POST /api/reservations` – add a reservation; body: `{clientName,clientEmail,clientPhone,room,checkin,checkout,status,observations}`
- `PUT /api/reservations/:id` – modify any field (typically `status` when check‑in or cancel)
- `DELETE /api/reservations/:id` – remove a reservation

__Note:__ reservations are now stored in the database so they survive page reloads. When the app loads it will fetch existing bookings and mark any that are already in‑progress, meaning the dashboard may show occupied rooms even before you create a new reservation.

## Room status permissions
- Por defecto **ninguna habitación está ocupada**; el servidor inicializa todas como `disponible`.
- **Administradores y recepcionistas** pueden gestionar el estado de cualquier habitación desde la vista de habitaciones. Las reglas son:
  - Sólo una habitación **ocupada** puede marcarse como *en limpieza* (se asigna `status='limpieza'` y `cleaningStatus='sucia'`).
  - Sólo una habitación **disponible** puede ponerse en *mantenimiento*.
  - Si una habitación ya está en limpieza también se puede enviar a mantenimiento.
  - Desde mantenimiento se puede devolver la habitación a disponible.
- **Personal de limpieza** sólo ve la sección de Limpieza y puede iniciar/terminar limpiezas. Finalizar la limpieza pone la habitación en `disponible` y actualiza el backend automáticamente.
- La lógica de permisos y estas restricciones se aplican en el front-end; el API no realiza validación de roles en este ejemplo.

## Database schema

The `create_tables.sql` file contains the SQL commands to build the necessary tables and seed initial data. You may run it manually against a different RDBMS if desired.

---

⚠️ **Security note:** Passwords are stored in plain text and returned by the API for simplicity; this is acceptable for a demo but **never do this in production**. Use proper hashing and authentication mechanisms instead.
