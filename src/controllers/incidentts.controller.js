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

  const includeRelations = {
  reporter: { select: { id: true, name: true, email: true, role: true } },
  technician: { select: { id: true, name: true, email: true, role: true } },
  notes: {
    include: {
      author: { select: { id: true, name: true, email: true, role: true } }
    }
  }
};

async function listMyIncidents(req, res) {
  const incidents = await prisma.incident.findMany({
    where: { reporterId: req.user.id },
    include: includeRelations,
    orderBy: { createdAt: 'desc' }
  });

  res.json(incidents);
}

  res.status(201).json(incident);
}

module.exports = {
  createIncident
};