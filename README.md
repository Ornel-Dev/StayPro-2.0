# StayPro Backend and Database Setup

This repository contains a simple static front-end and a Node.js/Express backend to store users and rooms in a SQLite database.

## Getting started

1. **Install dependencies** (requires Node.js installed):
   ```bash
   cd "c:\Users\ornel\OneDrive\Desktop\SENA\FASE 3_EJECUCIÓN\ACTIVIDAD DE PROYECTO 7\ENTREGAS\ENTREGAS ZIP\StayPro 2"
   npm install
   ```

2. **Initialize the database** (sqlite3 CLI required, or you can rely on the server to create tables automatically):
   ```bash
   npm run init-db
   ```
   This executes `create_tables.sql` and seeds default users and rooms.

3. **Start the server**:
   ```bash
   npm start
   ```
   The server listens on http://localhost:3000 by default and also serves the static files (`index.html`, `script.js`, `styles.css`).

4. **Open the front-end** in your browser:
   - Navigate to `http://localhost:3000/` and log in with one of the seeded accounts:
     - `admin` / `admin123` (administrator)
     - `recepcion` / `recep123` (receptionist)
     - `limpieza` / `limpieza123` (cleaning)

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
