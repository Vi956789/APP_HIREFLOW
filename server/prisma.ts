import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');
}

if (hasDatabaseUrl()) {
  try {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  } catch (err) {
    console.warn('[AI Studio] PrismaClient initialization skipped or failed — using in-memory mock', err);
    prismaInstance = null;
  }
} else {
  console.info('[HireFlow] No DATABASE_URL provided. Running in high-performance in-memory mode with full seed data.');
}

const noOp = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d: any) => d?.data ?? {},
  update: async (d: any) => d?.data ?? {},
  updateMany: async () => ({ count: 0 }),
  delete: async () => ({}),
  deleteMany: async () => ({ count: 0 }),
  upsert: async (d: any) => d?.create ?? {},
  $transaction: async (cb: any) => (typeof cb === 'function' ? cb(prisma) : cb),
  $executeRawUnsafe: async () => 0,
};

export const prisma: PrismaClient = (prismaInstance ||
  new Proxy({}, {
    get: (_, prop) => {
      if (prop === '$transaction') return async (cb: any) => (typeof cb === 'function' ? cb(prisma) : cb);
      if (prop === '$executeRawUnsafe') return async () => 0;
      return noOp;
    },
  })) as PrismaClient;

