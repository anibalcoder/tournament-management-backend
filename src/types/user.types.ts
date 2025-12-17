import { InferType } from 'yup';
import { userUpdateSchema } from '@/schemas/user.schema';

/**
 * Tipo inferido automáticamente desde Yup
 * Siempre estará sincronizado con el schema
 */
export type UserUpdateBody = InferType<typeof userUpdateSchema>;
