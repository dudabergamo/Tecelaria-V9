import type { Request } from 'express';
import type { User } from '../../drizzle/schema';
import { getDb, upsertUser, getUserByOpenId } from '../db';

export async function authenticateAuth0Request(req: Request): Promise<User | null> {
  // Pega o usuário da sessão do Passport
  if (!req.user) {
    console.log('[Auth0] No user in session');
    return null;
  }

  const auth0User = req.user as any;
  
  // Extrai informações do perfil Auth0
  const auth0Id = auth0User.user_id || auth0User.id;
  const email = auth0User.email || auth0User.emails?.[0]?.value;
  const name = auth0User.displayName || auth0User.name || auth0User.nickname;

  console.log('[Auth0] User data:', { auth0Id, email, name });

  if (!auth0Id || !email) {
    console.log('[Auth0] Missing required user data');
    return null;
  }

  try {
    const db = await getDb();
    if (!db) {
      console.log('[Auth0] Database not available');
      return null;
    }

    const { users } = await import('../../drizzle/schema');
    const { eq } = await import('drizzle-orm');

    // Busca usuário por openId ou email
    let user = await getUserByOpenId(auth0Id);
    
    // Se não encontrar por openId, tenta por email
    if (!user) {
      console.log('[Auth0] User not found by openId, searching by email:', email);
      const [userByEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      user = userByEmail || null;
    }

    if (!user) {
      console.log('[Auth0] Creating new user:', email);
      
      // Cria novo usuário
      await upsertUser({
        openId: auth0Id,
        email: email,
        name: name,
        role: 'user',
        lastSignedIn: new Date(),
      });

      user = await getUserByOpenId(auth0Id);
    } else {
      // Atualiza último login e openId
      console.log('[Auth0] Updating existing user:', email);
      await upsertUser({
        openId: auth0Id,
        lastSignedIn: new Date(),
      });
    }

    return user || null;
  } catch (error) {
    console.error('[Auth0] Database error:', error);
    return null;
  }
}
