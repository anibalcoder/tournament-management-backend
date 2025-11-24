import { users_role } from '@prisma/client'
import prisma from '../prisma'

interface CreateUserDTO {
  name: string
  lastName: string
  age: number
  nickname: string
  email: string
  user_password: string
  role: users_role
  club_id?: number
  dni?: string
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
    })

    // Relación si es competidor
    if (role === users_role.competitor) {
      if (!club_id) throw new Error('club_id es obligatorio para competidores')

      await tx.competitors.create({
        data: {
          user_id: newUser.id,
          club_id,
        },
      })
    }

    // Relación si es dueño de club
    if (role === users_role.club_owner) {
      if (!dni) throw new Error('dni es obligatorio para dueños de club')

      await tx.club_owners.create({
        data: {
          user_id: newUser.id,
          dni,
        },
      })
    }

    return newUser
  })
}
