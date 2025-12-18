import passport from 'passport';
import { Strategy as Auth0Strategy } from 'passport-auth0';
import session from 'express-session';
import type { Express } from 'express';

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
      function (accessToken: string, refreshToken: string, extraParams: any, profile: any, done: any) {
  console.log('[Auth] Auth0 callback - User authenticated:', profile.email || profile.user_id);
  return done(null, profile);
}
    )
  );

  passport.serializeUser((user, done) => {
  console.log('[Auth] Serializing user');
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  console.log('[Auth] Deserializing user');
  done(null, user);
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
  (req, res) => {
    console.log('[Auth] Login successful! Redirecting to /memories');
    console.log('[Auth] User:', req.user);
    res.redirect('/memories');
  }
);
  app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

app.get('/api/auth/me', (req, res) => {
  console.log('[Auth] /api/auth/me called - User:', req.user ? 'logged in' : 'not logged in');
  res.json(req.user || null);
});
   console.log('[Auth] All auth routes registered');
}
