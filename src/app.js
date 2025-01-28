const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoutes');
const financeRoutes = require('./routes/financeRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/finances', financeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
connectDB();