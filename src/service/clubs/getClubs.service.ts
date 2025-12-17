import prisma from '@/libs/prisma';
import { PaginationParams } from '@/types';

export async function getClubs({ skip = 0, take = 10 }: PaginationParams) {
  const [total, clubs] = await Promise.all([
    prisma.clubs.count(),
    prisma.clubs.findMany({
      skip,
      take,
      orderBy: { created_at: 'desc' },
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
    })
  ])

  return { total, clubs }
}
