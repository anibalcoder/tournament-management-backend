import { object, string } from 'yup'

export const clubCreateSchema = object({
  name: string()
    .required('El nombre del club es obligatorio.')
    .min(3, 'El nombre del club debe tener al menos 3 caracteres.')
    .max(255, 'El nombre del club no puede superar los 255 caracteres.'),

  fiscal_address: string()
    .required('La dirección fiscal es obligatoria.')
    .min(10, 'La dirección fiscal debe tener al menos 10 caracteres.')
    .max(500, 'La dirección fiscal no puede superar los 500 caracteres.'),

  logo: string()
    .url('El logo debe ser una URL válida.')
    .nullable()
    .optional(),
})
  .noUnknown(
    true,
    'Solo se permiten las propiedades name, fiscal_address y logo (opcional).',
  )
  .strict(true)

export const clubUpdateSchema = clubCreateSchema.partial();