import { club_owners, competitors, users_role } from '@prisma/client';
import prisma from '../prisma';

interface ValidateRol {
  currentRole: users_role;
  club_id?: competitors['club_id'];
  dni?: club_owners['dni'];
  category_ids?: number[];
}

export const validateRol = async ({
  currentRole,
  club_id,
  dni,
  category_ids,
}: ValidateRol) => {
  if (currentRole === users_role.club_owner) {
    if (!dni || dni.trim() === '') {
      return {
        error: 'El DNI es obligatorio para dueños de club',
        status: 400,
      };
    }

    const dniExists = await prisma.club_owners.findUnique({ where: { dni } });

    if (dniExists) {
      return { error: 'El DNI ya está registrado', status: 409 };
    }
  }

  if (currentRole === users_role.competitor) {
    if (!club_id) {
      return {
        error: 'El club_id es obligatorio para competidores',
        status: 400,
      };
    }

    const clubExists = await prisma.clubs.findUnique({
      where: { id: club_id },
    });

    if (!clubExists) {
      return { error: 'El club especificado no existe', status: 400 };
    }
  }

  if (currentRole === users_role.judge) {
    if (!category_ids || category_ids.length === 0) {
      return {
        error: 'Las categorías son obligatorias para jueces',
        status: 400,
      };
    }

    const categories = await prisma.categories.findMany({
      where: { id: { in: category_ids } },
      select: { id: true },
    });

    if (categories.length !== category_ids.length) {
      const foundIds = categories.map((c) => c.id);
      const invalidIds = category_ids.filter((id) => !foundIds.includes(id));
      return {
        error: `Las siguientes categorías no existen: ${invalidIds.join(', ')}`,
        status: 400,
      };
    }
  }

  return null; // No hubo errores
};
