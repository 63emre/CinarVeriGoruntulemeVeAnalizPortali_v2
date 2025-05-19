import { PrismaClient } from '../src/generated/prisma';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Check if admin user already exists
  const adminExists = await prisma.user.findUnique({
    where: {
      email: 'admin@cinar.com',
    },
  });

  if (!adminExists) {
    // Create admin user
    const hashedPassword = await hash('Admin123!', 10);
    
    await prisma.user.create({
      data: {
        email: 'admin@cinar.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists');
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