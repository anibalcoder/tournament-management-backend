import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as {
  prisma?: PrismaClient
}

const prisma = globalForPrisma.prisma ?? (globalForPrisma.prisma = new PrismaClient())

if (process.env.NODE_ENV !== 'production') {
  // En desarrollo, usa una sola instancia de PrismaClient para evitar múltiples conexiones.
  globalForPrisma.prisma = prisma
}

export default prisma