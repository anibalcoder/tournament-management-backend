import { verifyAuth } from '@/libs/auth';
import prisma from '@/libs/prisma'
import { clubCreateSchema } from '@/schemas/club.schema';
import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from 'yup';

export async function GET(request: NextRequest) {
  try {
    // Validar token de acceso
    const auth = verifyAuth(request);
    if (!auth.valid) return auth.response;

    const { searchParams } = new URL(request.url)

    const skip = Number(searchParams.get('skip'))
    const take = Number(searchParams.get('take') ?? 10)

    if (isNaN(skip) || skip < 0) {
      return NextResponse.json(
        { error: 'skip debe ser un número válido mayor o igual a 0.' },
        { status: 400 },
      )
    }

    if (isNaN(take) || take < 1) {
      return NextResponse.json(
        { error: 'take debe ser un número válido mayor o igual a 1.' },
        { status: 400 },
      )
    }

    const clubs = await prisma.clubs.findMany({
      skip,
      take,
      orderBy: { created_at: 'desc' },
    })


    return NextResponse.json({
      message: 'Acceso concedido',
      userAuth: auth.decoded,
      data: clubs
    })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor. Inténtalo más tarde.' },
      { status: 500 },
    )
  }
}

// Crear club (solo club_owner)
export async function POST(request: NextRequest) {
  try {
    // Verificar token
    const auth = verifyAuth(request);
    if (!auth.valid) return auth.response;

    const userRole = auth.decoded?.role;
    const userId = auth.decoded?.id;

    // Solo un club_owner puede crear un club
    if (userRole !== 'club_owner') {
      return NextResponse.json(
        { error: 'Solo los propietarios de club pueden crear un club.' },
        { status: 403 }
      );
    }

    // Validar los datos de entrada
    const {
      name,
      fiscal_address,
      logo
    } = await clubCreateSchema.validate((await request.json()))

    // Crear club
    const newClub = await prisma.clubs.create({
      data: {
        owner_id: Number(userId),
        name,
        fiscal_address,
        logo: logo ?? null,
        approved_by_admin_id: null
      }
    })

    return NextResponse.json({
      message: 'Club creado correctamente.',
      data: newClub
    })
  } catch (error) {
    console.log(error)

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor al actualizar el club.' },
      { status: 500 },
    );
  }
}