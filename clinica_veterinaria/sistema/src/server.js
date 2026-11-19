require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const db = require('./db');
const { requireAuth } = require('./middleware/auth');

const app = express();
const sessionStore = new MySQLStore({}, db);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '100kb' }));
app.use(session({
  name: 'clinica.sid',
  secret: process.env.SESSION_SECRET || 'desenvolvimento-apenas-troque-esta-chave',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: Number(process.env.SESSION_HOURS || 2) * 60 * 60 * 1000
  }
}));

app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api', requireAuth);
app.use('/api/tutores', require('./routes/tutores'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/agendamentos', require('./routes/agendamentos'));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Clínica Veterinária disponível em http://localhost:${port}`));
