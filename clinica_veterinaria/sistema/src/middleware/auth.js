function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  next();
}
module.exports = { requireAuth };
