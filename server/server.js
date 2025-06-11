const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected.."))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employee', require('./routes/employeeRoutes'));
app.use('/api/overtime', require('./routes/overtimeRoutes'));
app.use('/api/connection', require('./routes/connectionRoutes'));
app.use('/api/triple-ot', require('./routes/tripleOTRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => console.log(`Server running on port ${PORT}`));