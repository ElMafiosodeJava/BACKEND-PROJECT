const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Jarvis Incidence funcionando' });
});

const authRoutes = require('./routes/auth.routes');


app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

module.exports = app;