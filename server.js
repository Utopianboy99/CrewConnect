require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── MongoDB ─────────────────────────────────────────────────
const client = new MongoClient(process.env.DB_URI);
let db;

client.connect().then(() => {
    console.log('✅ Connected to MongoDB');
    db = client.db('auth_project');
    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });
}).catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
});

// ── Routes ──────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'CrewConnect API is running' });
});

// Register
app.post('/users', async (req, res) => {
    try {
        const { name, username, dob, officeId, password } = req.body;

        if (!name || !username || !dob || !officeId || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existing = await db.collection('users').findOne({ username });
        if (existing) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { name, username, dob, officeId, password: hashedPassword };
        const result = await db.collection('users').insertOne(newUser);

        const { password: _, ...safeUser } = newUser;
        res.status(201).json({ ...safeUser, _id: result.insertedId });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await db.collection('users').findOne({ username });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const { password: _, ...safeUser } = user;
        res.json(safeUser);

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all offices
app.get('/offices', (req, res) => {
    res.json([
        { id: 'appWorldGraphic', label: 'App World - Graphics' },
        { id: 'appWorldIT',      label: 'App World - IT' },
        { id: 'vision',          label: 'Vision' },
        { id: 'finance',         label: 'Finance' },
        { id: 'media',           label: 'Media' }
    ]);
});

// Get users by office
app.get('/offices/:officeId/users', async (req, res) => {
    try {
        const users = await db.collection('users')
            .find({ officeId: req.params.officeId }, { projection: { password: 0 } })
            .toArray();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});