import { verifyAuth } from '@/libs/auth'
import prisma from '@/libs/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Validar token de acceso
    const auth = verifyAuth(request)
    if (!auth.valid) return auth.response

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

    const users = await prisma.users.findMany({
      skip,
      take,
      orderBy: { created_at: 'desc' },
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
        club_owners: {
          select: {
            dni: true,
            is_approved: true,
            approved_by_admin_id: true,
            approved_at: true,
          }
        },

        // Datos cuando es competidor
        competitors_competitors_user_idTousers: {
          select: {
            club_id: true,
            is_approved: true,
            approved_by: true,
            approved_at: true,
          }
        }
      }
    })


    return NextResponse.json({
      message: 'Acceso concedido',
      userAuth: auth.decoded,
      data: users
    })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor. Inténtalo más tarde.' },
      { status: 500 },
    )
  }
}