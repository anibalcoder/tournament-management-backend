/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { DecodedToken as AuthPayload } from '@/libs/auth';
import { UserUpdateBody } from '@/types/user.types';

interface UserUniquenessValidationResult {
  error?: string;
  status?: number;
}

export const validateUserExists = async (
  prisma: PrismaClient,
  numericId: number
): Promise<UserUniquenessValidationResult> => {
  const nick = await prisma.users.findUnique({
    where: { id: numericId },
  });

  if (!nick) {
    return { error: `El usuario con ID ${numericId} no existe`, status: 404 };
  }

  return {};
};

export const validateNicknameExists = async (
  prisma: PrismaClient,
  nickname: string
): Promise<UserUniquenessValidationResult> => {
  const nick = await prisma.users.findUnique({
    where: { nickname },
  });

  if (nick) {
    return { error: 'El nickname ya está en uso', status: 409 };
  }

  return {};
};

export const validateEmailExists = async (
  prisma: PrismaClient,
  email: string
): Promise<UserUniquenessValidationResult> => {
  const mail = await prisma.users.findUnique({
    where: { email },
  });

  if (mail) {
    return { error: 'El email ya está en uso', status: 409 };
  }

  return {};
};

// Validar permisos de edición de campos base
export function validateBaseFieldsPermissions(
body: UserUpdateBody, userToEdit: any, authUser: AuthPayload) {
  const BASE_FIELDS: (keyof UserUpdateBody)[] = [
    'name',
    'lastName',
    'age',
    'profile_picture',
    'nickname',
    'email',
    'user_password',
  ];

  const isAdmin = authUser.role === 'admin';
  const isOwner = Number(authUser.id) === userToEdit.id;

  const isTryingToEditBaseField = BASE_FIELDS.some(
    (field) => body[field] !== undefined
  );

  if (isTryingToEditBaseField && !isAdmin && !isOwner) {
    return {
      error:
        'Solo el dueño del perfil o un administrador pueden editar este usuario.',
      status: 403,
    };
  }
}

// Validar permisos de competitor
export function validateCompetitorPermissions(
  body: UserUpdateBody,
  userToEdit: any,
  authUser: AuthPayload
) {
  if (!body.competitor) return;

  if (!userToEdit.competitor) {
    return {
      error: 'El usuario a editar no es competidor.',
      status: 400,
    };
  }

  const isAdmin = authUser.role === 'admin';
  const isClubOwner =
    Number(authUser.id) === userToEdit.competitor.club.owner_id;

  if (!isAdmin && !isClubOwner) {
    return {
      error: 'Solo administrador o dueño del club pueden editar competitor.',
      status: 403,
    };
  }
}

// Validar permisos de club_owner
export function validateClubOwnerPermissions(
  body: UserUpdateBody,
  userToEdit: any,
  authUser: AuthPayload
) {
  if (!body.club_owner) return;
  const isAdmin = authUser.role === 'admin';

  if (!isAdmin) {
    return {
      error: 'Solo administrador puede editar club_owner.',
      status: 403,
    };
  }

  if (!userToEdit.club_owner) {
    return {
      error: 'Este usuario no es club_owner.',
      status: 400,
    };
  }
}

// Validar permisos y categorías de judge
export async function validateJudgePermissions(
  body: UserUpdateBody,
  userToEdit: any,
  authUser: AuthPayload,
  prisma: PrismaClient
) {
  if (!body.judge) return;

  const judgeRecord = userToEdit.judges[0];

  if (!judgeRecord) {
    return {
      error: 'El usuario a editar no es juez.',
      status: 400,
    };
  }

  const isAdmin = authUser.role === 'admin';

  if (body.judge.is_approved !== undefined && !isAdmin) {
    return {
      error: 'Solo un administrador puede aprobar jueces.',
      status: 403,
    };
  }

  if (body.judge.category_ids && body.judge.category_ids.length > 0) {
    const categoryIds = body.judge.category_ids.filter(
      (id): id is number => typeof id === 'number'
    );

    if (categoryIds.length === 0) {
      return {
        error: 'Las categorías enviadas no son válidas.',
        status: 400,
      };
    }

    const existingCategories = await prisma.categories.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });

    const existingIds = existingCategories.map((c) => c.id);
    const missingIds = categoryIds.filter((id) => !existingIds.includes(id));

    if (missingIds.length > 0) {
      return {
        error: `Las siguientes categorías no existen: ${missingIds.join(', ')}`,
        status: 400,
      };
    }
  }
}
