// middleware/authenticated.server.ts
import jwt from 'jsonwebtoken';
import { defineNuxtRouteMiddleware, navigateTo, useCookie } from 'nuxt/app';

export default defineNuxtRouteMiddleware((to, from) => {
  // Öffentliche Routen erlauben
  if (["/", "/login"].includes(to.path)) return;

  // Lese das Cookie (verwende useCookie aus Nuxt 3)
  const tokenCookie = useCookie('auth_token');
  const token = tokenCookie.value;

  // Falls kein Token vorhanden, leite um
  if (!token) {
    return navigateTo('/');
  }
  
  try {
    // Verifiziere das JWT
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return navigateTo('/');
  }
});