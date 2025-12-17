import prisma from '@/libs/prisma';

export async function getClub({ numericId }: { numericId: number }) {
  return await prisma.clubs.findFirst({
    where: { id: numericId },
    include: {
      owner: {
        select: {
          id: true,
          nickname: true,
          email: true,
          profile_picture: true,
        },
      },
      approvedByAdmin: {
        select: {
          id: true,
          nickname: true,
          email: true,
          profile_picture: true,
        },
      },
      competitors: {
        where: { is_approved: true },
        select: {
          user: {
            select: {
              id: true,
              nickname: true,
              email: true,
              profile_picture: true,
            },
          },
        },
      },
    },
  });
}
