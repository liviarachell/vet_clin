const express = require('express');
const router = express.Router();
const db = require('../db');
const { encryptCPF, decryptCPF, validCPF } = require('../utils/security');

router.get('/', async (req, res) => {
  try {
    const termo = String(req.query.busca || '').trim();
    const like = `%${termo}%`;
    const [rows] = await db.execute(
      `SELECT id, nome, email, telefone, cpf_criptografado, criado_em
       FROM tutores
       WHERE nome LIKE ? OR email LIKE ? OR telefone LIKE ?
       ORDER BY nome`,
      [like, like, like]
    );
    res.json(rows.map(t => ({ ...t, cpf: decryptCPF(t.cpf_criptografado), cpf_criptografado: undefined })));
  } catch (e) {
    console.error(e); res.status(500).json({ erro: 'Erro ao listar tutores.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, email, telefone, cpf } = req.body;
    if (!nome || !email || !telefone || !cpf) return res.status(400).json({ erro: 'Preencha todos os campos.' });
    if (!validCPF(cpf)) return res.status(400).json({ erro: 'CPF inválido.' });
    await db.execute(
      'INSERT INTO tutores (nome, email, telefone, cpf_criptografado) VALUES (?, ?, ?, ?)',
      [nome.trim(), email.trim().toLowerCase(), telefone.trim(), encryptCPF(cpf)]
    );
    res.status(201).json({ mensagem: 'Tutor cadastrado com sucesso.' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    console.error(e); res.status(500).json({ erro: 'Erro ao cadastrar tutor.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nome, email, telefone, cpf } = req.body;
    if (!nome || !email || !telefone || !cpf || !validCPF(cpf)) return res.status(400).json({ erro: 'Dados inválidos ou incompletos.' });
    const [result] = await db.execute(
      'UPDATE tutores SET nome=?, email=?, telefone=?, cpf_criptografado=? WHERE id=?',
      [nome.trim(), email.trim().toLowerCase(), telefone.trim(), encryptCPF(cpf), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ erro: 'Tutor não encontrado.' });
    res.json({ mensagem: 'Tutor atualizado.' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'E-mail já utilizado.' });
    console.error(e); res.status(500).json({ erro: 'Erro ao atualizar tutor.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM tutores WHERE id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ erro: 'Tutor não encontrado.' });
    res.json({ mensagem: 'Tutor excluído.' });
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ erro: 'Tutor possui pets vinculados e não pode ser excluído.' });
    console.error(e); res.status(500).json({ erro: 'Erro ao excluir tutor.' });
  }
});
module.exports = router;
