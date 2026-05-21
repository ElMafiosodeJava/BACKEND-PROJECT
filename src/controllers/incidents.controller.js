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

async function listAssignedIncidents(req, res) {
  const incidents = await prisma.incident.findMany({
    where: { technicianId: req.user.id },
    include: includeRelations,
    orderBy: { createdAt: 'desc' }
  });

  res.json(incidents);
}

async function listAllIncidents(req, res) {
  const incidents = await prisma.incident.findMany({
    include: includeRelations,
    orderBy: { createdAt: 'desc' }
  });

  res.json(incidents);
}

async function getIncidentById(req, res) {
  const id = Number(req.params.id);

  const incident = await prisma.incident.findUnique({
    where: { id },
    include: includeRelations
  });

  if (!incident) {
    return res.status(404).json({ message: 'Incidencia no encontrada' });
  }

  const isAdmin = req.user.role === 'ADMIN';
  const isReporter = incident.reporterId === req.user.id;
  const isTechnician = incident.technicianId === req.user.id;

  if (!isAdmin && !isReporter && !isTechnician) {
    return res.status(403).json({ message: 'No tienes permisos para ver esta incidencia' });
  }

  res.json(incident);
}

async function assignTechnician(req, res) {
  const id = Number(req.params.id);
  const { technicianId } = req.body;

  const technician = await prisma.user.findFirst({
    where: { id: Number(technicianId), role: 'TECHNICIAN' }
  });

  if (!technician) {
    return res.status(404).json({ message: 'Técnico no encontrado' });
  }

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      technicianId: Number(technicianId),
      status: 'ASSIGNED'
    },
    include: includeRelations
  });

  res.json(incident);
}

module.exports = {
  createIncident,
  listMyIncidents
};