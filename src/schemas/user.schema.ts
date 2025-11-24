import { object, string, number, boolean } from 'yup'
import { users_role } from '@prisma/client';

export const userRegisterSchema = object ({
  name: string ()
    .required('El nombre es obligatorio.')
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(255, 'El nombre no puede superar los 255 caracteres.'),

  lastName: string ()
    .required('El apellido es obligatorio.')
    .min(2, 'El apellido debe tener al menos 2 caracteres.')
    .max(255, 'El apellido no puede superar los 255 caracteres.'),

  nickname: string ()
    .required ('El nickname es obligatorio.')
    .min (3, 'El nickname debe tener al menos 3 caracteres.')
    .max (30, 'El nickname no puede superar los 30 caracteres.'),

  age: number()
    .required('La edad es obligatorio.')
    .min(18, 'Debes ser mayor o igual a 18 años.')
    .integer('La edad debe ser un número entero.'),

  email: string()
    .required('El email es obligatorio.')
    .email('Debe ingresar un email válido.')
    .max(320, 'El email no puede superar los 320 caracteres.'),

  user_password: string ()
    .required ('La contraseña es obligatoria.')
    .min (8, 'Debe tener al menos 8 caracteres.')
    .matches (/[A-Z]/, 'Debe incluir al menos una letra mayúscula.')
    .matches (/[a-z]/, 'Debe incluir al menos una letra minúscula.')
    .matches (/[&%#?♦♣৭Ǟ!@$^*()_+\-=[\]{};':"\\|,.<>/?]/, 'Debe incluir al menos un carácter especial.')
    .test (
      'no-dni',
      'La contraseña no puede ser un DNI (8 dígitos numéricos).',
      (value) => !/^\d{8}$/.test (value)
    ),

  role: string ()
    .required('El rol es obligatorio.')
    .oneOf (Object.values(users_role), 'Rol no válido.'),

  // Campo obligatorio solo para dueños de club
  dni: string ()
    .when('role', {
      is: users_role.club_owner,
      then: (schema) => schema
        .required('El DNI es obligatorio para dueños de club.')
        .min(8, 'El DNI debe tener al menos 8 caracteres.')
        .max(20, 'El DNI no puede superar los 20 caracteres.')
        .matches(/^[0-9]+$/, 'El DNI debe contener solo números.'),
      otherwise: (schema) => schema.notRequired()
    }),

  // Campo obligatorio solo para competidores
  club_id: number ()
    .when('role', {
      is: users_role.competitor,
      then: (schema) => schema
        .required('El club_id es obligatorio para competidores.')
        .positive('El club_id debe ser un número positivo.')
        .integer('El club_id debe ser un número entero.'),
      otherwise: (schema) => schema.notRequired()
    }),
})

export const userUpdateSchema = userRegisterSchema.partial();

// Schema para actualización por club_owner
// Solo permite actualizar is_approved y approved_by_admin_id
export const clubOwnerUpdateSchema = object({
  is_approved: boolean()
    .optional(),
  approved_by_admin_id: number()
    .optional()
    .positive('El approved_by_admin_id debe ser un número positivo.')
    .integer('El approved_by_admin_id debe ser un número entero.'),
});

// Schema para actualización por competitor
// Solo permite actualizar is_approved y approved_by
export const competitorUpdateSchema = object({
  is_approved: boolean()
    .optional(),
  approved_by: number()
    .optional()
    .positive('El approved_by debe ser un número positivo.')
    .integer('El approved_by debe ser un número entero.'),
});