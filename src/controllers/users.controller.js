const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');

async function createTechnician(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const technician = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'TECHNICIAN'
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    res.status(201).json(technician);
  } catch (error) {
    res.status(400).json({ message: 'No se pudo crear el técnico', error: error.message });
  }
}

async function listTechnicians(req, res) {
  const technicians = await prisma.user.findMany({
    where: { role: 'TECHNICIAN' },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });

  res.json(technicians);
}

async function deleteTechnician(req, res) {
  const id = Number(req.params.id);

  const technician = await prisma.user.findFirst({
    where: { id, role: 'TECHNICIAN' }
  });

  if (!technician) {
    return res.status(404).json({ message: 'Técnico no encontrado' });
  }

  await prisma.user.delete({ where: { id } });

  res.json({ message: 'Técnico eliminado correctamente' });
}

module.exports = { createTechnician, listTechnicians, deleteTechnician };
