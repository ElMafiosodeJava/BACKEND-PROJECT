const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/incidents', incidentsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Jarvis Incidence funcionando' });
});

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const incidentsRoutes = require('./routes/incidents.routes');

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

module.exports = app;