import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, RoomType } from '../generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const rooms = [
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `room-standard-${String(i + 1).padStart(2, '0')}`,
    type: RoomType.STANDARD,
    capacity: 2,
    price_per_night: 100,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `room-deluxe-${String(i + 1).padStart(2, '0')}`,
    type: RoomType.DELUXE,
    capacity: 3,
    price_per_night: 200,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `room-suite-${String(i + 1).padStart(2, '0')}`,
    type: RoomType.SUITE,
    capacity: 4,
    price_per_night: 400,
  })),
];

async function main() {
  for (const room of rooms) {
    await prisma.room.upsert({
      where: { id: room.id },
      update: {},
      create: room,
    });
  }
  console.log(`Seeded ${rooms.length} rooms`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
