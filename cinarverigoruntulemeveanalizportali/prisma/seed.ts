import { PrismaClient } from '../src/generated/prisma';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  let adminId: string;

  // Check if admin user already exists
  const adminExists = await prisma.user.findUnique({
    where: {
      email: 'admin@cinar.com',
    },
  });

  if (!adminExists) {
    // Create admin user
    const hashedPassword = await hash('Admin123!', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@cinar.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    
    adminId = admin.id;
    console.log('Admin user created successfully');
  } else {
    adminId = adminExists.id;
    console.log('Admin user already exists');
  }

  // Create default workspaces if they don't exist
  const workspace1 = await prisma.workspace.findFirst({
    where: {
      name: 'Çalışma alanı 1',
    },
  });

  if (!workspace1) {
    const newWorkspace1 = await prisma.workspace.create({
      data: {
        name: 'Çalışma alanı 1',
        description: 'Varsayılan çalışma alanı 1',
        createdBy: adminId,
        users: {
          create: {
            userId: adminId,
          },
        },
      },
    });
    console.log('Çalışma alanı 1 created successfully');
  } else {
    console.log('Çalışma alanı 1 already exists');
  }

  const workspace2 = await prisma.workspace.findFirst({
    where: {
      name: 'Çalışma alanı 2',
    },
  });

  if (!workspace2) {
    const newWorkspace2 = await prisma.workspace.create({
      data: {
        name: 'Çalışma alanı 2',
        description: 'Varsayılan çalışma alanı 2',
        createdBy: adminId,
        users: {
          create: {
            userId: adminId,
          },
        },
      },
    });
    console.log('Çalışma alanı 2 created successfully');
  } else {
    console.log('Çalışma alanı 2 already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 