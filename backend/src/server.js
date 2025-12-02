const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const { 
    ZonaGeografica, 
    Participante, 
    GuiaTurista, 
    RecorridoVirtual, 
    Avatar 
} = require('./models/models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from frontend
// In Docker, we mount frontend to /frontend. Locally it might be ../../frontend
const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, '../../frontend');
console.log(`Serving frontend from: ${frontendPath}`);
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Database Connection
const dbConfig = {
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'chichen_itza_db'
};

let connection;

async function connectDB() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL Database');
    } catch (err) {
        console.error('Error connecting to database:', err);
        setTimeout(connectDB, 5000); // Retry after 5s
    }
}

connectDB();

// --- API Endpoints ---

// === ZONES (CRUD) ===
app.get('/api/zones', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM ZonaGeografica');
        const zones = rows.map(row => new ZonaGeografica(row.idZona, row.nombre, row.descripcion, row.esPrivada));
        res.json(zones.map(z => z.toJSON()));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/zones', async (req, res) => {
    const { nombre, descripcion, esPrivada } = req.body;
    try {
        const [result] = await connection.execute(
            'INSERT INTO ZonaGeografica (nombre, descripcion, esPrivada) VALUES (?, ?, ?)',
            [nombre, descripcion, esPrivada]
        );
        res.status(201).json({ id: result.insertId, message: 'Zone created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/zones/:id', async (req, res) => {
    const { nombre, descripcion, esPrivada } = req.body;
    try {
        await connection.execute(
            'UPDATE ZonaGeografica SET nombre=?, descripcion=?, esPrivada=? WHERE idZona=?',
            [nombre, descripcion, esPrivada, req.params.id]
        );
        res.json({ message: 'Zone updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/zones/:id', async (req, res) => {
    try {
        await connection.execute('DELETE FROM ZonaGeografica WHERE idZona=?', [req.params.id]);
        res.json({ message: 'Zone deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === TOURS (CRUD) ===
app.get('/api/tours', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM RecorridoVirtual');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tours', async (req, res) => {
    const { tipo, fechaInicio, duracion, idGuia, zones } = req.body;
    try {
        const [result] = await connection.execute(
            'INSERT INTO RecorridoVirtual (tipo, fechaInicio, duracion, idGuia) VALUES (?, ?, ?, ?)',
            [tipo, fechaInicio, duracion, idGuia]
        );
        
        const tourId = result.insertId;

        // Insert Zones if provided
        if (zones && zones.length > 0) {
            const zoneValues = zones.map(zId => [tourId, zId]);
            // Helper to flatten for bulk insert or loop
            for (const zId of zones) {
                await connection.execute(
                    'INSERT INTO Recorrido_Zonas (idRecorrido, idZona) VALUES (?, ?)',
                    [tourId, zId]
                );
            }
        }

        res.status(201).json({ id: tourId, message: 'Tour created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === AUTHENTICATION ===
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await connection.execute(
            'SELECT p.*, a.idRol, r.nombreRol FROM Participante p LEFT JOIN Avatar a ON p.idParticipante = a.idParticipante LEFT JOIN Rol r ON a.idRol = r.idRol WHERE p.username = ? AND p.password = ?',
            [username, password]
        );

        if (rows.length > 0) {
            const user = rows[0];
            res.json({ 
                success: true, 
                user: { 
                    id: user.idParticipante, 
                    nombre: user.nombre, 
                    username: user.username,
                    role: user.nombreRol,
                    roleId: user.idRol
                } 
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === PARTICIPANTS (CRUD & REGISTER) ===
app.get('/api/participants', async (req, res) => {
    try {
        // Join with Recorrido to see bookings
        const [rows] = await connection.execute(`
            SELECT p.*, r.tipo as tourType 
            FROM Participante p 
            LEFT JOIN RecorridoVirtual r ON p.idRecorrido = r.idRecorrido
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/participants', async (req, res) => {
    const { nombre, correo, username, password, idRol } = req.body;
    try {
        const [result] = await connection.execute(
            'INSERT INTO Participante (nombre, correo, username, password, conexionActiva) VALUES (?, ?, ?, ?, ?)',
            [nombre, correo, username, password, true]
        );
        const idParticipante = result.insertId;

        // Create Default Avatar for Participant
        await connection.execute(
            'INSERT INTO Avatar (tipoAvatar, estado, idParticipante, idRol) VALUES (?, ?, ?, ?)',
            ['Default', 'Idle', idParticipante, idRol || 1] // Default role 1 (Explorer)
        );

        res.status(201).json({ id: idParticipante, message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === BOOKING ===
app.post('/api/book', async (req, res) => {
    const { idParticipante, idRecorrido } = req.body;
    try {
        await connection.execute(
            'UPDATE Participante SET idRecorrido = ? WHERE idParticipante = ?',
            [idRecorrido, idParticipante]
        );
        res.json({ message: 'Tour booked successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/participants/:id', async (req, res) => {
    const { nombre, correo, conexionActiva } = req.body;
    try {
        await connection.execute(
            'UPDATE Participante SET nombre=?, correo=?, conexionActiva=? WHERE idParticipante=?',
            [nombre, correo, conexionActiva, req.params.id]
        );
        res.json({ message: 'Participant updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/participants/:id', async (req, res) => {
    try {
        await connection.execute('DELETE FROM Participante WHERE idParticipante=?', [req.params.id]);
        res.json({ message: 'Participant deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === ROLES ===
app.get('/api/roles', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM Rol');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === OPERATIONS ===
// Move Avatar/Participant to a Zone
app.post('/api/move', async (req, res) => {
    const { idParticipante, idZona } = req.body;
    try {
        // Update in DB
        await connection.execute(
            'UPDATE Participante SET ubicacionActual = (SELECT nombre FROM ZonaGeografica WHERE idZona = ?) WHERE idParticipante = ?',
            [idZona, idParticipante]
        );
        
        // Also update Avatar table if exists
        await connection.execute(
            'UPDATE Avatar SET idZonaActual = ? WHERE idParticipante = ?',
            [idZona, idParticipante]
        );

        res.json({ message: `Participant ${idParticipante} moved to Zone ${idZona}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
