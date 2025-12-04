import { PrismaClient } from '@prisma/client'

// Singleton para Prisma Client (CRÍTICO para Serverless)
// Previne múltiplas instâncias e esgotamento de conexões
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
