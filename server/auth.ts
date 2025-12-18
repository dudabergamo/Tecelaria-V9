import passport from 'passport';
import { Strategy as Auth0Strategy } from 'passport-auth0';
import session from 'express-session';
import type { Express } from 'express';

export function setupAuth(app: Express) {
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
      function (accessToken: string, refreshToken: string, extraParams: any, profile: any, done: any) {
        return done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session());
app.use((req, res, next) => {
  console.log('[Auth] Request:', req.path, 'User:', req.user ? 'logged in' : 'anonymous');
  next();
});
  // Rotas de autenticação
  app.get('/api/auth/login', passport.authenticate('auth0', {
    scope: 'openid email profile',
  }));

  app.get('/api/auth/callback', 
    passport.authenticate('auth0', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );

  app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  app.get('/api/auth/me', (req, res) => {
    res.json(req.user || null);
  });
}
