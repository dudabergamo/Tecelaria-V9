import type { Request } from 'express';
import { User } from '../../drizzle/schema';
import { db } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function authenticateAuth0Request(req: Request): Promise<User | null> {
  // Pega o usuário da sessão do Passport
  if (!req.user) {
    return null;
  }

  const auth0User = req.user as any;
  
  // Extrai informações do perfil Auth0
  const auth0Id = auth0User.user_id || auth0User.id;
  const email = auth0User.email || auth0User.emails?.[0]?.value;
  const name = auth0User.displayName || auth0User.name || auth0User.nickname;

  if (!auth0Id || !email) {
    console.log('[Auth0] Missing required user data');
    return null;
  }

  try {
    // Busca usuário no banco pelo openId (auth0Id)
    let user = await db.query.users.findFirst({
      where: eq(users.openId, auth0Id),
    });

    // Se não existe, cria novo usuário
    if (!user) {
      console.log('[Auth0] Creating new user:', email);
      
      const [newUser] = await db.insert(users).values({
        openId: auth0Id,
        email: email,
        name: name,
        role: 'user',
        hasActiveKit: false,
        kitStartDate: null,
      }).returning();

      user = newUser;
    }

    return user;
  } catch (error) {
    console.error('[Auth0] Database error:', error);
    return null;
  }
}
