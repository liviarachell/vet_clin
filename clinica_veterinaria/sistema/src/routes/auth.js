const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyPassword } = require('../utils/security');

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '');
    if (!email || !senha) return res.status(400).json({ erro: 'Informe e-mail e senha.' });

    const [rows] = await db.execute(
      'SELECT id, nome, email, senha_hash, ativo FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );
    const user = rows[0];
    if (!user || !user.ativo || !verifyPassword(senha, user.senha_hash)) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    req.session.regenerate(err => {
      if (err) return res.status(500).json({ erro: 'Não foi possível iniciar a sessão.' });
      req.session.user = { id: user.id, nome: user.nome, email: user.email };
      req.session.cookie.maxAge = Number(process.env.SESSION_HOURS || 2) * 60 * 60 * 1000;
      res.json({ mensagem: 'Login realizado.', usuario: req.session.user });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro interno ao realizar login.' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ erro: 'Não autenticado.' });
  res.json({ usuario: req.session.user });
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ erro: 'Não foi possível encerrar a sessão.' });
    res.clearCookie('clinica.sid');
    res.json({ mensagem: 'Sessão encerrada.' });
  });
});
module.exports = router;
