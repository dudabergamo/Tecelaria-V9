import passport from 'passport';
import { Strategy as Auth0Strategy } from 'passport-auth0';
import session from 'express-session';
import type { Express } from 'express';
import { getDb } from './db';
import { eq } from 'drizzle-orm';

export function setupAuth(app: Express) {
  console.log('[Auth] Setting up authentication...');
  console.log('[Auth] AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN);
  console.log('[Auth] AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID);
  console.log('[Auth] AUTH0_CALLBACK_URL:', process.env.AUTH0_CALLBACK_URL);

  // Configurar sessão
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
      resave: false,
      saveUninitialized: false,
      proxy: true, // ← IMPORTANTE: Railway usa proxy
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax', // ← IMPORTANTE: permite cookies cross-site
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  // Configurar Passport
  passport.use(
    new Auth0Strategy(
      {
        domain: process.env.AUTH0_DOMAIN!,
        clientID: process.env.AUTH0_CLIENT_ID!,
        clientSecret: process.env.AUTH0_CLIENT_SECRET!,
        callbackURL: process.env.AUTH0_CALLBACK_URL!,
      },
      async function (accessToken: string, refreshToken: string, extraParams: any, profile: any, done: any) {
        try {
          console.log('[Auth] Auth0 callback - User authenticated:', profile.email || profile.user_id);

          const db = await getDb();
          if (!db) {
            console.error('[Auth] Database not available');
            return done(new Error('Database not available'));
          }

          const { users } = await import('../drizzle/schema');

          // Procurar usuário existente
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, profile.email))
            .limit(1);

          let user;

          if (existingUser.length > 0) {
            // Usuário existe - atualizar se necessário
            user = existingUser[0];
            console.log('[Auth] User found in database:', user.id);
          } else {
            // Novo usuário - criar no banco
            const crypto = await import('crypto');
            const newUserId = crypto.randomUUID();
            const now = new Date();

            await db.insert(users).values({
              id: newUserId,
              email: profile.email,
              name: profile.displayName || profile.name || 'Usuário',
              createdAt: now,
              updatedAt: now,
              emailConfirmed: true, // Auth0 já confirmou o email
            });

            user = {
              id: newUserId,
              email: profile.email,
              name: profile.displayName || profile.name || 'Usuário',
              kitActivatedAt: null,
            };

            console.log('[Auth] New user created:', newUserId);
          }

          // Retornar usuário do banco (não do Auth0)
          return done(null, user);
        } catch (error) {
          console.error('[Auth] Error in Auth0 callback:', error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    console.log('[Auth] Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (userId: string, done) => {
    try {
      console.log('[Auth] Deserializing user:', userId);
      const db = await getDb();
      if (!db) {
        return done(new Error('Database not available'));
      }

      const { users } = await import('../drizzle/schema');
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (result.length > 0) {
        done(null, result[0]);
      } else {
        done(null, null);
      }
    } catch (error) {
      console.error('[Auth] Error deserializing user:', error);
      done(error);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
  console.log('[Auth] Passport initialized');

  app.use((req, res, next) => {
    if (req.path.startsWith('/api/auth')) {
      console.log('[Auth] Request:', req.method, req.path, 'User:', req.user ? 'logged in' : 'anonymous');
    }
    next();
  });

  // Rotas de autenticação
  app.get('/api/auth/login', (req, res, next) => {
    console.log('[Auth] /api/auth/login called - Starting Auth0 authentication');
    next();
  }, passport.authenticate('auth0', {
    scope: 'openid email profile',
  }));

  app.get('/api/auth/callback',
    (req, res, next) => {
      console.log('[Auth] /api/auth/callback called');
      next();
    },
    passport.authenticate('auth0', {
      failureRedirect: '/',
      failureMessage: true
    }),
    async (req, res) => {
      try {
        console.log('[Auth] Login successful!');
        console.log('[Auth] User:', req.user);

        const user = req.user as any;

        // Verificar se é primeiro login
        if (user && !user.kitActivatedAt) {
          console.log('[Auth] First login - Redirecting to /onboarding');
          res.redirect('/onboarding');
        } else {
          console.log('[Auth] Returning user - Redirecting to /dashboard');
          res.redirect('/dashboard');
        }
      } catch (error) {
        console.error('[Auth] Error in callback:', error);
        res.redirect('/');
      }
    }
  );

  app.get('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('[Auth] Error during logout:', err);
      }
      res.redirect('/');
    });
  });

  app.get('/api/auth/me', (req, res) => {
    console.log('[Auth] /api/auth/me called - User:', req.user ? 'logged in' : 'not logged in');
    if (req.user) {
      res.json(req.user);
    } else {
      res.json(null);
    }
  });

  console.log('[Auth] All auth routes registered');
}
