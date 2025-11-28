import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import prisma from '@/libs/prisma';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Buscar usuario en BD
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user)
      return NextResponse.json(
        { message: 'Correo no encontrado' },
        { status: 404 }
      );

    // Token válido 15 min
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '15m' });

    // Guardar token en password_resets
    await prisma.password_resets.create({
      data: { user_id: user.id, token },
    });

    // LINK que llegará al correo
    const link = `http://localhost:3000/reset-password/${token}`;

    // Crea y configura el transportador (objeto encargado de enviar correos electrónicos)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `Soporte <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperar contraseña',
      html: `
        <p>Haz clic en el siguiente enlace para continuar:</p>
        <a href="${link}" style="color:blue;">Restablecer contraseña</a>
        <p>Este enlace expira en 15 minutos.</p>
      `,
    });

    return NextResponse.json({
      message: 'Correo enviado para recuperar contraseña',
    });
  } catch {
    return NextResponse.json(
      { error: 'Error al enviar correo' },
      { status: 500 }
    );
  }
}
