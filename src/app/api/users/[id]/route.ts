import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/libs/prisma'
import { verifyAuth } from '@/libs/auth';

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
      return NextResponse.json(
        { error: 'ID debe ser un número válido.' },
        { status: 400 },
      )
    }

    // Bucar usuario
    const user = await prisma.users.findFirst({
      where: { id: numericId },
      select: {
        id: true,
        nickname: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: `El ID ${ numericId } no existe` },
        { status: 404 },
      )
    }

    return NextResponse.json(user)
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor. Inténtalo más tarde.' },
      { status: 500 },
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
      return NextResponse.json(
        { error: 'Solo los administradores pueden eliminar usuarios.' },
        { status: 403 },
      );
    }

    const { id } = await params
    const numericId = Number(id)

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: 'ID debe ser un número válido.' },
        { status: 400 },
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.users.findUnique({ where: { id: numericId } })

    if (!existingUser) {
      return NextResponse.json(
        { error: `El usuario con ID ${ numericId } no existe.` },
        { status: 400 },
      );
    }

    // Eliminar el usuario
    await prisma.users.delete({
      where: { id: numericId },
    });

    return NextResponse.json({
      message: `El usuario con ID ${ numericId } eliminado correctamente.`,
    });
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor al eliminar el usuario.' },
      { status: 500 },
    );
  }
}