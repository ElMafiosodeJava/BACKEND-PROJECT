require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../src/lib/prisma');

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('user123', 10);
  const techPass = await bcrypt.hash('tech123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@jarvis.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@jarvis.com',
      passwordHash: adminPass,
      role: 'ADMIN'
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'usuario@jarvis.com' },
    update: {},
    create: {
      name: 'Usuario Demo',
      email: 'usuario@jarvis.com',
      passwordHash: userPass,
      role: 'USER'
    }
  });

  const technician = await prisma.user.upsert({
    where: { email: 'tecnico@jarvis.com' },
    update: {},
    create: {
      name: 'Técnico Demo',
      email: 'tecnico@jarvis.com',
      passwordHash: techPass,
      role: 'TECHNICIAN'
    }
  });

  await prisma.incident.create({
    data: {
      title: 'Ordenador no enciende',
      description: 'El equipo de recepción no arranca desde esta mañana.',
      reporterId: user.id,
      technicianId: technician.id,
      status: 'ASSIGNED',
      notes: {
        create: {
          title: 'Primera revisión',
          content: 'Se revisa la fuente de alimentación y el cableado.',
          authorId: technician.id
        }
      }
    }
  });

  console.log('Datos de prueba creados:');
  console.log('Admin: admin@jarvis.com / admin123');
  console.log('Usuario: usuario@jarvis.com / user123');
  console.log('Técnico: tecnico@jarvis.com / tech123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
