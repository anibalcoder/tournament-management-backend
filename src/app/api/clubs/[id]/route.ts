import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/libs/prisma'
import { verifyAuth } from '@/libs/auth';
import { clubs } from '@prisma/client';
import { ValidationError } from 'yup';
import { clubUpdateSchema } from '@/schemas/club.schema';
import { applyCorsHeaders, handleCorsOptions } from '@/libs/cors';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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

    // Bucar club
    const club = await prisma.clubs.findFirst({
      where: { id: numericId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
          }
        },
        approvedByAdmin: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
          }
        }
      }
    })

    if (!club) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: `El club con ID ${ numericId } no existe` },
          { status: 404 },
        )
      )
    }

    return applyCorsHeaders(NextResponse.json(club))
  } catch {
    return applyCorsHeaders(
      NextResponse.json(
        { error: 'Error interno del servidor. Inténtalo más tarde.' },
        { status: 500 },
      )
    )
  }
}

// Eliminar club (solo admin)
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
          { error: 'Solo los administradores pueden eliminar clubes.' },
          { status: 403 },
        )
      )
    }

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

    // Verificar si el club ya existe
    const existingClub = await prisma.clubs.findUnique({ where: { id: numericId } })

    if (!existingClub) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: `El club con ID ${ numericId } no existe.` },
          { status: 400 },
        )
      )
    }

    // Eliminar club
    await prisma.clubs.delete({
      where: { id: numericId },
    })

    return applyCorsHeaders(NextResponse.json({
      message: `El club con ID ${ numericId } eliminado correctamente.`,
    }))
  } catch {
    return applyCorsHeaders(
      NextResponse.json(
        { error: 'Error interno del servidor al eliminar el club.' },
        { status: 500 },
      )
    )
  }
}

// Actualizar club (solo admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar token
    const auth = verifyAuth(request);
    if (!auth.valid) return auth.response;

    // Verificar rol
    const userRole = auth.decoded?.role;
    const userId = auth.decoded?.id;
  
    if (userRole !== 'admin') {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'Solo los administradores pueden actualizar clubes.' },
          { status: 403 },
        )
      )
    }

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

    // Verificar si el club ya existe
    const existingClub = await prisma.clubs.findUnique({
      where: { id: numericId },
    })

    if (!existingClub) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: `El club con ID ${ numericId } no existe.` },
          { status: 400 },
        )
      )
    }

    // Validar los datos de entrada
    const {
      name,
      fiscal_address,
      logo,
      is_approved
    } = await clubUpdateSchema.validate((await request.json()))

    // Preparar datos para actualizar
    const dataToUpdate: Partial<clubs> = {}

    // Agregar campos si se proporcionan
    if (name) dataToUpdate.name = name;
    if (fiscal_address) dataToUpdate.fiscal_address = fiscal_address;
    if (logo) dataToUpdate.logo = logo

    if (typeof is_approved === 'boolean') {
      dataToUpdate.is_approved = is_approved;
      dataToUpdate.approved_by = Number(userId);
      dataToUpdate.approvedAt = new Date()
    }

    // Actualizar club
    const clubUpdate = await prisma.clubs.update({
      where: { id: numericId },
      data: dataToUpdate,
    });

    return applyCorsHeaders(
      NextResponse.json({
        message: `El club con ID ${ numericId } actualizado correctamente.`,
        data: clubUpdate
      })
    )
  } catch (error) {
    if (error instanceof ValidationError) {
      return applyCorsHeaders(
        NextResponse.json(
          { errors: error.errors },
          { status: 400 }
        )
      )
    }

    return applyCorsHeaders (
      NextResponse.json(
        { error: 'Error interno del servidor al actualizar el club.' },
        { status: 500 },
      )
    )
  }
}