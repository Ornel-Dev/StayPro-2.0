const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DB_PATH = path.join(__dirname, 'hotel.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Could not open database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});


db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('recepcionista','limpieza','administrador'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      number INTEGER PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('Individual','Doble')),
      status TEXT NOT NULL CHECK(status IN ('disponible','ocupada','limpieza','mantenimiento')),
      price REAL NOT NULL,
      guest TEXT,
      cleaningStatus TEXT NOT NULL CHECK(cleaningStatus IN ('limpia','sucia','en_proceso'))
    )
  `);

  db.run(`
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
    )
  `);

  // seed default users if the table is empty
  db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare('INSERT INTO users(username,password,name,role) VALUES (?,?,?,?)');
      stmt.run('admin','admin123','Admin General','administrador');
      stmt.run('recepcion','recep123','María García','recepcionista');
      stmt.run('limpieza','limpieza123','Juan Pérez','limpieza');
      stmt.finalize();
    }
  });

  // seed rooms 101-120 if empty
  db.get('SELECT COUNT(*) AS count FROM rooms', (err, row) => {
    if (!err && row.count === 0) {
      const insert = db.prepare('INSERT INTO rooms(number,type,status,price,guest,cleaningStatus) VALUES (?,?,?,?,?,?)');
      for (let i = 101; i <= 120; i++) {
        insert.run(
          i,
          i <= 110 ? 'Individual' : 'Doble',
          'disponible',
          i <= 110 ? 80 : 120,
          null,
          'limpia'
        );
      }
      insert.finalize();
    }
  });
});

// utility wrappers returning promises
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// ---- user endpoints ----
app.get('/api/users', async (req, res) => {
  try {
  
    const rows = await dbAll('SELECT username, password, name, role FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:username', async (req, res) => {
  try {
    const row = await dbGet('SELECT username, password, name, role FROM users WHERE username = ?', [req.params.username]);
    if (row) res.json(row);
    else res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    await dbRun('INSERT INTO users(username,password,name,role) VALUES (?,?,?,?)', [username, password, name, role]);
   
    res.status(201).json({ username, password, name, role });
  } catch (err) {
    if (err.message.includes('UNIQUE') || err.message.includes('PRIMARY')) {
      res.status(409).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.put('/api/users/:username', async (req, res) => {
  const { password, name, role } = req.body;
  const updates = [];
  const params = [];
  if (password) { updates.push('password = ?'); params.push(password); }
  if (name) { updates.push('name = ?'); params.push(name); }
  if (role) { updates.push('role = ?'); params.push(role); }
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  params.push(req.params.username);
  try {
    const result = await dbRun(`UPDATE users SET ${updates.join(', ')} WHERE username = ?`, params);
    if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ username: req.params.username, name, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:username', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM users WHERE username = ?', [req.params.username]);
    if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ deleted: req.params.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- room endpoints ----

app.get('/api/rooms', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM rooms');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rooms/:number', async (req, res) => {
  try {
    const row = await dbGet('SELECT * FROM rooms WHERE number = ?', [req.params.number]);
    if (row) res.json(row);
    else res.status(404).json({ error: 'Room not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  const { number, type, status, price, guest, cleaningStatus } = req.body;
  if (!number || !type || !status || price == null || !cleaningStatus) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    await dbRun('INSERT INTO rooms(number,type,status,price,guest,cleaningStatus) VALUES (?,?,?,?,?,?)', [number, type, status, price, guest || null, cleaningStatus]);
    res.status(201).json({ number, type, status, price, guest, cleaningStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rooms/:number', async (req, res) => {
  const updates = [];
  const params = [];
  ['type','status','price','guest','cleaningStatus'].forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  });
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  params.push(req.params.number);
  try {
    const result = await dbRun(`UPDATE rooms SET ${updates.join(', ')} WHERE number = ?`, params);
    if (result.changes === 0) return res.status(404).json({ error: 'Room not found' });
    const updated = await dbGet('SELECT * FROM rooms WHERE number = ?', [req.params.number]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rooms/:number', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM rooms WHERE number = ?', [req.params.number]);
    if (result.changes === 0) return res.status(404).json({ error: 'Room not found' });
    res.json({ deleted: req.params.number });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- reservation endpoints ----
app.get('/api/reservations', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM reservations');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  const { clientName, clientEmail, clientPhone, room, checkin, checkout, status, observations } = req.body;
  if (!clientName || !room || !checkin || !checkout || !status) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const result = await dbRun(
      'INSERT INTO reservations(clientName,clientEmail,clientPhone,room,checkin,checkout,status,observations) VALUES (?,?,?,?,?,?,?,?)',
      [clientName, clientEmail, clientPhone, room, checkin, checkout, status, observations]
    );
    const created = await dbGet('SELECT * FROM reservations WHERE id = ?', [result.lastID]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reservations/:id', async (req, res) => {
  const updates = [];
  const params = [];
  ['clientName','clientEmail','clientPhone','room','checkin','checkout','status','observations'].forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  });
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  params.push(req.params.id);
  try {
    const result = await dbRun(`UPDATE reservations SET ${updates.join(', ')} WHERE id = ?`, params);
    if (result.changes === 0) return res.status(404).json({ error: 'Reservation not found' });
    const updated = await dbGet('SELECT * FROM reservations WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM reservations WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Reservation not found' });
    res.json({ deleted: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
