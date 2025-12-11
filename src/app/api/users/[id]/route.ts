import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/libs/prisma'
import { verifyAuth } from '@/libs/auth';
import { applyCorsHeaders, handleCorsOptions } from '@/libs/cors';
import { hash } from 'bcrypt';
import { userUpdateSchema } from '@/schemas/user.schema';
import { ValidationError } from 'yup';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Validar token de acceso
    const auth = verifyAuth(request);
    if (!auth.valid) return auth.response;

    const { id } = await params

    const numericId = Number(id)

    if (isNaN(numericId)) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'ID debe ser un número válido.' },
          { status: 400 },
        )
      )
    }

    // Bucar usuario
    const user = await prisma.users.findFirst({
      where: { id: numericId },
      select: {
        id: true,
        name: true,
        lastName: true,
        age: true,
        nickname: true,
        role: true,
        created_at: true,
        updated_at: true,
        // Datos cuando es dueño del club
        club_owner: {
          select: {
            dni: true,
            is_approved: true,
            approved_by_admin_id: true,
            approved_at: true,
          }
        },
        // Datos cuando es competidor
        competitor: {
          select: {
            club_id: true,
            is_approved: true,
            approved_by: true,
            approved_at: true,
          }
        }
      }
    })

    if (!user) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: `El usuario con ID ${ numericId } no existe` },
          { status: 404 },
        )
      )
    }

    return applyCorsHeaders(NextResponse.json(user))
  } catch {
    return applyCorsHeaders(
      NextResponse.json(
        { error: 'Error interno del servidor. Inténtalo más tarde.' },
        { status: 500 },
      )
    )
  }
}

// Eliminar usuario (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar token
    const auth = verifyAuth(request);
    if (!auth.valid) return auth.response;

    // Verificar rol
    const userRole = auth.decoded?.role;
    if (userRole !== 'admin') {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'Solo los administradores pueden eliminar usuarios.' },
          { status: 403 },
        )
      )
    }

    const { id } = await params
    const numericId = Number(id)

    if (isNaN(numericId)) {
      return applyCorsHeaders (
        NextResponse.json(
          { error: 'ID debe ser un número válido.' },
          { status: 400 },
        )
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.users.findUnique({ where: { id: numericId } })

    if (!existingUser) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: `El usuario con ID ${ numericId } no existe.` },
          { status: 400 },
        )
      )
    }

    // Eliminar el usuario
    await prisma.users.delete({
      where: { id: numericId },
    });

    return applyCorsHeaders(
      NextResponse.json({
        message: `El usuario con ID ${ numericId } eliminado correctamente.`,
      })
    );
  } catch {
    return applyCorsHeaders(
      NextResponse.json(
        { error: 'Error interno del servidor al eliminar el usuario.' },
        { status: 500 },
      )
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Helper para respuestas con CORS
  const jsonResponse = (data: object, status = 200) =>
    applyCorsHeaders(NextResponse.json(data, { status }));

  try {
    const auth = verifyAuth(request);
    if (!auth.valid) return auth.response;

    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return jsonResponse({ error: 'El ID del usuario debe ser un número válido.' }, 400);
    }

    const userToEdit = await prisma.users.findUnique({
      where: { id: numericId },
      include: { club_owner: true, competitor: { include: { club: true } } }
    });

    if (!userToEdit) {
      return jsonResponse({ error: 'Usuario a editar no existe' }, 404);
    }

    const authenticatedUser = auth.decoded!;
    const isAdmin = authenticatedUser.role === 'admin';
    const isOwner = Number(authenticatedUser.id) === userToEdit.id;
    const body = await request.json();

    // Validación de lo que el usuario añade
    await userUpdateSchema.validate(body, { abortEarly: false });

    // Prohibir cambio de rol
    if (body.role !== undefined) {
      return jsonResponse({ error: 'No se puede editar el rol del usuario.' }, 400);
    }

    // Validar permisos para competitor
    if (body.competitor) {
      if (!userToEdit.competitor) {
        return jsonResponse({ error: 'El usuario a editar no es competidor.' }, 400);
      }
      const isClubOwner = Number(authenticatedUser.id) === userToEdit.competitor.club.owner_id;
      if (!isAdmin && !isClubOwner) {
        return jsonResponse({ error: 'Solo administrador o dueño del club pueden editar competitor.' }, 403);
      }
    }

    // Validar permisos para campos base
    const BASE_FIELDS = ['name', 'lastName', 'age', 'profile_picture', 'nickname', 'email', 'user_password'];
    if (BASE_FIELDS.some(field => body[field] !== undefined) && !isAdmin && !isOwner) {
      return jsonResponse({ error: 'Solo el dueño del perfil o un administrador pueden editar este usuario.' }, 403);
    }

    // Validar permisos para club_owner
    if (body.club_owner) {
      if (!isAdmin) return jsonResponse({ error: 'Solo administrador puede editar club_owner.' }, 403);
      if (!userToEdit.club_owner) return jsonResponse({ error: 'Este usuario no es club_owner.' }, 400);
    }

    // Construir datos base (incluyendo hash de password si aplica)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseData: Record<string, any> = Object.fromEntries(
      BASE_FIELDS.filter(f => f !== 'user_password' && body[f] !== undefined)
        .map(f => [f, body[f]])
    );
    if (body.user_password) baseData.user_password = await hash(body.user_password, 10);

    // Update final
    const updatedUser = await prisma.users.update({
      where: { id: numericId },
      data: {
        ...baseData,
        updated_at: new Date(),
        club_owner: body.club_owner ? {
          update: {
            dni: String(body.club_owner.dni ?? userToEdit.club_owner!.dni),
            is_approved: Boolean(body.club_owner.is_approved ?? userToEdit.club_owner!.is_approved),
            approved_at: new Date(),
            approved_by_admin_id: Number(authenticatedUser.id)
          }
        } : undefined,
        competitor: body.competitor ? {
          update: {
            club_id: Number(body.competitor.club_id ?? userToEdit.competitor!.club_id),
            is_approved: body.competitor.is_approved ?? userToEdit.competitor!.is_approved,
            approved_at: new Date(),
            approved_by: body.competitor.is_approved === true ? Number(authenticatedUser.id) : userToEdit.competitor!.approved_by!
          }
        } : undefined
      },
      select: {
        id: true, name: true, lastName: true, age: true, profile_picture: true,
        nickname: true, email: true, role: true, created_at: true, updated_at: true,
        club_owner: true, competitor: true
      }
    });

    return jsonResponse({ message: 'Usuario actualizado correctamente.', data: updatedUser });

  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonResponse({ error: error.errors }, 500);
    }

    console.error(error);
    return jsonResponse({ error: 'Error interno del servidor.' }, 500);
  }
}