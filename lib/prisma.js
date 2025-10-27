const { PrismaClient } = require('@prisma/client');

// Create a single instance of PrismaClient to avoid multiple connections
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

module.exports = prisma;
