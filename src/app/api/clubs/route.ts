import { verifyAuth } from '@/libs/auth';
import { applyCorsHeaders, handleCorsOptions } from '@/libs/cors';
import prisma from '@/libs/prisma'
import { clubCreateSchema } from '@/schemas/club.schema';
import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from 'yup';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const skip = Number(searchParams.get('skip'))
    const take = Number(searchParams.get('take') ?? 10)

    if (isNaN(skip) || skip < 0) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'skip debe ser un número válido mayor o igual a 0.' },
          { status: 400 },
        )
      )
    }

    if (isNaN(take) || take < 1) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'take debe ser un número válido mayor o igual a 1.' },
          { status: 400 },
        )
      )
    }

    const clubs = await prisma.clubs.findMany({
      skip,
      take,
      orderBy: { created_at: 'desc' },
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

    return applyCorsHeaders(NextResponse.json({ data: clubs }))
  } catch {
    return applyCorsHeaders(
      NextResponse.json(
        { error: 'Error interno del servidor. Inténtalo más tarde.' },
        { status: 500 },
      )
    )
  }
}

// Crear club (solo club_owner o admin)
export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth.valid) return auth.response;

    const userRole = auth.decoded?.role;
    const userId = auth.decoded?.id;

    if (userRole !== 'club_owner' && userRole !== 'admin') {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'Solo los propietarios de club y administradores pueden crear un club.' },
          { status: 403 }
        )
      )
    }

    const {
      name,
      fiscal_address,
      logo,
      owner_id
    } = await clubCreateSchema.validate(await request.json());

    let finalOwnerId: number;

    if (userRole === 'club_owner') {
      finalOwnerId = Number(userId); // El dueño del club crea el club → owner_id automático
    } else {
      if (!owner_id) {
        return applyCorsHeaders(
          NextResponse.json(
            { error: 'El administrador debe especificar el owner_id del club.' },
            { status: 400 }
          )
        );
      }

      finalOwnerId = Number(owner_id); // El admin crea el club → owner_id debe venir del body

      const clubOwner = await prisma.users.findFirst({
        where: { club_owner: { user_id: finalOwnerId } }
      });

      if (!clubOwner) {
        return applyCorsHeaders(
          NextResponse.json(
            { error: 'No se encontró un usuario con rol dueño de club con ese ID.' },
            { status: 400 }
          )
        );
      }
    }

    const newClub = await prisma.clubs.create({
      data: {
        owner_id: finalOwnerId,
        name,
        fiscal_address,
        logo: logo ?? null,
      }
    });

    return applyCorsHeaders(
      NextResponse.json({
        message: 'Club creado correctamente.',
        data: newClub
      })
    );

  } catch (error) {
    if (error instanceof ValidationError) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      );
    }

    return applyCorsHeaders(
      NextResponse.json(
        { error: 'Error interno del servidor al crear el club.' },
        { status: 500 }
      )
    );
  }
}