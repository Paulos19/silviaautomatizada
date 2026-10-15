import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

// Garante que se novos modelos não existirem na instância em cache da memória, reinicializa
const cached = globalThis.prismaGlobal;
const hasWaitlist = cached && Boolean((cached as any).waitlistEntry);

const prisma = (!cached || !hasWaitlist) ? prismaClientSingleton() : cached;

export default prisma

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma