import prisma from '@/libs/prisma';

export async function getUser({ numericId }: { numericId: number }) {
  return await prisma.users.findFirst({
    where: { id: numericId },
    select: {
      id: true,
      name: true,
      lastName: true,
      age: true,
      profile_picture: true,
      nickname: true,
      email: true,
      role: true,
      created_at: true,
      updated_at: true,
      // Datos cuando es dueño del club
      club_owner: {
        select: {
          dni: true,
          is_approved: true,
          approvedByAdmin: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
      // Datos cuando es competidor
      competitor: {
        select: {
          club_id: true,
          is_approved: true,
          approved_by: true,
          approvedBy: {
            select: {
              nickname: true,
            },
          },
        },
      },
      // Datos cuando es juez
      judges: {
        select: {
          id: true,
          is_approved: true,
          approvedByAdmin: {
            select: {
              id: true,
              nickname: true,
            },
          },
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
