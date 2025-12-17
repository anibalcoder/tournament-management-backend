import { users_role } from '@prisma/client';
import prisma from '@/libs/prisma';

interface CreateUserDTO {
  name: string;
  lastName: string;
  age: number;
  nickname: string;
  email: string;
  user_password: string;
  role: users_role;
  club_id?: number;
  dni?: string;
  category_ids?: number[];
}

export const createUser = async ({
  name,
  lastName,
  age,
  nickname,
  email,
  user_password,
  role,
  club_id,
  dni,
  category_ids,
}: CreateUserDTO) => {
  return await prisma.$transaction(async (tx) => {
    // Crear usuario base
    const newUser = await tx.users.create({
      data: {
        name,
        lastName,
        age,
        nickname,
        email,
        user_password,
        role,
      },
    });

    // Relación si es competidor
    if (role === users_role.competitor) {
      if (!club_id) throw new Error('club_id es obligatorio para competidores');

      await tx.competitors.create({
        data: {
          user_id: newUser.id,
          club_id,
        },
      });
    }

    // Relación si es dueño de club
    if (role === users_role.club_owner) {
      if (!dni) throw new Error('dni es obligatorio para dueños de club');

      await tx.club_owners.create({
        data: {
          user_id: newUser.id,
          dni,
        },
      });
    }

    // Relación si es juez
    if (role === users_role.judge) {
      if (!category_ids || category_ids.length === 0) {
        throw new Error('category_ids es obligatorio para jueces');
      }

      const judge = await tx.judges.create({
        data: {
          user_id: newUser.id,
        },
      });

      await tx.judge_categories.createMany({
        data: category_ids.map((categoryId) => ({
          judge_id: judge.id,
          category_id: categoryId,
        })),
      });
    }

    return newUser;
  });
};
