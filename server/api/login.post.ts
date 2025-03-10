// server/api/login.post.ts
import { z } from "zod";
import { SignJWT } from "jose";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
}).passthrough();

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  const expectedEmail = process.env.AUTH_EMAIL;
  const expectedPassword = process.env.AUTH_PASSWORD;

  if (email === expectedEmail && password === expectedPassword) {
    // Erstelle ein JWT mit jose
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    return { success: true };
  }

  throw createError({
    statusCode: 401,
    message: 'Bad credentials',
  });
});