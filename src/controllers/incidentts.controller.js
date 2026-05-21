const prisma = require('../lib/prisma');

async function createIncident(req, res) {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Título y descripción son obligatorios' });
  }

  const incident = await prisma.incident.create({
    data: {
      title,
      description,
      reporterId: req.user.id
    }
  });

  res.status(201).json(incident);
}

module.exports = {
  createIncident
};