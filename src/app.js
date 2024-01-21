const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env

const app = express();
const port = 3000;

mongoose.connect(process.env.MONGODB_URI);

// Middleware untuk parsing body
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

const itemRoutes = require('./routes/itemRoutes');
app.use('/api', itemRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});