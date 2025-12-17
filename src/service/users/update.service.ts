import { PrismaClient } from '@prisma/client';
import { UserUpdateBody } from '@/types/user.types';
import { hash } from 'bcrypt';

interface UpdateUserDTO {
  userId: number;
  body: UserUpdateBody;
  authenticatedUserId: number;
  isAdmin: boolean;
  prisma: PrismaClient;
}

export const updateUser = async ({
  userId,
  body,
  authenticatedUserId,
  isAdmin,
  prisma,
}: UpdateUserDTO) => {
  const BASE_FIELDS = [
    'name',
    'lastName',
    'age',
    'profile_picture',
    'nickname',
    'email',
  ] as const;

  // Construcción de data base
  const baseData: Record<string, unknown> = Object.fromEntries(
    BASE_FIELDS.filter((f) => body[f] !== undefined).map((f) => [
      f,
      body[f],
    ])
  );

  if (body.user_password) {
    baseData.user_password = await hash(body.user_password, 10);
  }

  // CASO: UPDATE CON JUDGE (TRANSACCIÓN)
  if (body.judge) {
    return prisma.$transaction(async (tx) => {
      const judge = await tx.judges.findFirst({
        where: { user_id: userId },
      });

      if (!judge) throw new Error('Judge no encontrado');

      // 1. Update usuario
      await tx.users.update({
        where: { id: userId },
        data: {
          ...baseData,
          updated_at: new Date(),
        },
      });

      // 2. Update aprobación juez
      if (body.judge?.is_approved !== undefined && isAdmin) {
        await tx.judges.update({
          where: { id: judge.id },
          data: {
            is_approved: body.judge.is_approved,
            approved_by: body.judge.is_approved
              ? authenticatedUserId
              : null,
            approved_at: body.judge.is_approved ? new Date() : null,
          },
        });
      }

      // 3. Update categorías
      if (body.judge?.category_ids) {
        await tx.judge_categories.deleteMany({
          where: { judge_id: judge.id },
        });

        if (body.judge.category_ids.length > 0) {
          await tx.judge_categories.createMany({
            data: body.judge.category_ids.filter((categoryId) => categoryId !== undefined).map((categoryId) => ({
              judge_id: judge.id,
              category_id: categoryId,
            })),
          });
        }
      }

      return tx.users.findUnique({
        where: { id: userId },
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

          judges: {
            select: {
              id: true,
              is_approved: true,
              approved_at: true,

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
    });
  }

  // CASO: UPDATE SIN JUDGE
  return prisma.users.update({
    where: { id: userId },
    data: {
      ...baseData,
      updated_at: new Date(),
      club_owner: body.club_owner
        ? {
            update: {
              dni: body.club_owner.dni,
              is_approved: body.club_owner.is_approved,
              approved_at: new Date(),
              approved_by_admin_id: authenticatedUserId,
            },
          }
        : undefined,
      competitor: body.competitor
        ? {
            update: {
              club_id: body.competitor.club_id,
              is_approved: body.competitor.is_approved,
              approved_at: new Date(),
              approved_by:
                body.competitor.is_approved === true
                  ? authenticatedUserId
                  : undefined,
            },
          }
        : undefined,
    },
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

      club_owner: {
        select: {
          dni: true,
          is_approved: true,
          approved_at: true,
          approvedByAdmin: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },

      competitor: {
        select: {
          club_id: true,
          is_approved: true,
          approved_at: true,
          approvedBy: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
    },
  });
};
