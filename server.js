require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(cors({
    origin: 'https://near-sideways-driver.glitch.me' // allow requests from your frontend
}));
app.use(express.json()); // to parse JSON body

// MongoDB setup
const url = process.env.DB_URI;
const client = new MongoClient(url);
let db;

client.connect().then(() => {
    console.log('✅ Connected to MongoDB');
    db = client.db("auth_project"); // You can name this DB anything
    app.listen(port, () => {
        console.log(`🚀 Server listening at http://localhost:${port}`);
    });
}).catch(err => {
    console.error('❌ MongoDB connection failed:', err);
});

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/users', async (req, res) => {
    try {
        const { name, username, dob, officeId, password } = req.body;

        if (!name || !username || !dob || !officeId || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newUser = {
            name,
            username,
            dob,
            officeId,
            password
        };

        const result = await db.collection('users').insertOne(newUser);
        res.status(201).json({ ...newUser, _id: result.insertedId });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

});

app.get('/offices/:officeId/users', async (req, res) => {
    try {
        const officeId = req.params.officeId;
        const users = await db.collection('users').find({ officeId }).toArray();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/offices', async (req, res) => {
    const offices = [
        { id: 'appWorldGraphic', label: 'App World - Graphics' },
        { id: 'appWorldIT', label: 'App World - IT' },
        { id: 'vision', label: 'Vision' },
        { id: 'finance', label: 'Finance' },
        { id: 'media', label: 'Media' }
    ];
    res.json(offices);
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await db.collection('users').findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json(user); // you might want to exclude password here for security
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



