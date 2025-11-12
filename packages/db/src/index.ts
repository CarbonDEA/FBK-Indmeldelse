import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

let prismaClientSingleton: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
  if (!prismaClientSingleton) {
    prismaClientSingleton = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaClientSingleton;
}

export const prisma = getPrismaClient();

// Helper function to get next member number
export async function getNextMemberNo(): Promise<number> {
  const result = await prisma.$queryRaw<Array<{ next_no: bigint }>>`
    SELECT nextval('member_no_seq') as next_no;
  `;
  return Number(result[0].next_no);
}

// Export types
export type { Member, Application, AccessKey, Payment, AuditLog } from '@prisma/client';
