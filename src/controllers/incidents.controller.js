const prisma = require('../lib/prisma');

const includeRelations = {
  reporter: { select: { id: true, name: true, email: true, role: true } },
  technician: { select: { id: true, name: true, email: true, role: true } },
  notes: {
    include: {
      author: { select: { id: true, name: true, email: true, role: true } }
    }
  }
};

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

async function listMyIncidents(req, res) {
  const incidents = await prisma.incident.findMany({
    where: { reporterId: req.user.id },
    include: includeRelations,
    orderBy: { createdAt: 'desc' }
  });

  res.json(incidents);
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

async function updateIncidentStatus(req, res) {
  const id = Number(req.params.id);
  const { status } = req.body;

  const allowedStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Estado no válido' });
  }

  const incident = await prisma.incident.findUnique({ where: { id } });

  if (!incident) {
    return res.status(404).json({ message: 'Incidencia no encontrada' });
  }

  const isAdmin = req.user.role === 'ADMIN';
  const isAssignedTechnician = incident.technicianId === req.user.id;

  if (!isAdmin && !isAssignedTechnician) {
    return res.status(403).json({ message: 'Solo el administrador o el técnico asignado pueden cambiar el estado' });
  }

  const updated = await prisma.incident.update({
    where: { id },
    data: { status },
    include: includeRelations
  });

  res.json(updated);
}

async function deleteIncident(req, res) {
  const id = Number(req.params.id);

  await prisma.incident.delete({ where: { id } });

  res.json({ message: 'Incidencia eliminada correctamente' });
}

async function createNote(req, res) {
  const incidentId = Number(req.params.id);
  const { title, content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'El contenido de la anotación es obligatorio' });
  }

  const incident = await prisma.incident.findUnique({ where: { id: incidentId } });

  if (!incident) {
    return res.status(404).json({ message: 'Incidencia no encontrada' });
  }

  const isAdmin = req.user.role === 'ADMIN';
  const isAssignedTechnician = incident.technicianId === req.user.id;

  if (!isAdmin && !isAssignedTechnician) {
    return res.status(403).json({ message: 'Solo el técnico asignado o el administrador pueden añadir anotaciones' });
  }

  const note = await prisma.note.create({
    data: {
      incidentId,
      authorId: req.user.id,
      title,
      content
    },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } }
    }
  });

  res.status(201).json(note);
}

async function listNotes(req, res) {
  const incidentId = Number(req.params.id);

  const incident = await prisma.incident.findUnique({ where: { id: incidentId } });

  if (!incident) {
    return res.status(404).json({ message: 'Incidencia no encontrada' });
  }

  const isAdmin = req.user.role === 'ADMIN';
  const isReporter = incident.reporterId === req.user.id;
  const isAssignedTechnician = incident.technicianId === req.user.id;

  if (!isAdmin && !isReporter && !isAssignedTechnician) {
    return res.status(403).json({ message: 'No tienes permisos para ver estas anotaciones' });
  }

  const notes = await prisma.note.findMany({
    where: { incidentId },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  res.json(notes);
}

module.exports = {
  createIncident,
   listMyIncidents,
  listAssignedIncidents,
  listAllIncidents,
  getIncidentById,
  assignTechnician,
  updateIncidentStatus,
  deleteIncident,
  createNote,
  listNotes
};