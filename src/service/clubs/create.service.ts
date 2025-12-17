import prisma from '@/libs/prisma';

interface CreateClubInput {
  owner_id: number;
  name: string;
  fiscal_address: string;
  logo: string | null;
}

export async function createClub({
  owner_id,
  name,
  fiscal_address,
  logo,
}: CreateClubInput) {
  return await prisma.clubs.create({
    data: {
      owner_id,
      name,
      fiscal_address,
      logo,
    },
  });
}
