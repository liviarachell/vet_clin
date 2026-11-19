const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.id, p.nome, p.especie, p.raca, p.data_nascimento, p.sexo,
              t.id AS tutor_id, t.nome AS tutor
       FROM pets p JOIN tutores t ON t.id = p.tutor_id ORDER BY p.nome`
    );
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao listar pets.' }); }
});

router.post('/', async (req, res) => {
  try {
    const { nome, especie, raca, data_nascimento, sexo, tutor_id } = req.body;
    if (!nome || !especie || !tutor_id) return res.status(400).json({ erro: 'Nome, espécie e tutor são obrigatórios.' });
    await db.execute(
      'INSERT INTO pets (nome, especie, raca, data_nascimento, sexo, tutor_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nome.trim(), especie.trim(), raca || null, data_nascimento || null, sexo || null, Number(tutor_id)]
    );
    res.status(201).json({ mensagem: 'Pet cadastrado e associado ao tutor.' });
  } catch (e) {
    if (e.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ erro: 'Tutor informado não existe.' });
    console.error(e); res.status(500).json({ erro: 'Erro ao cadastrar pet.' });
  }
});
module.exports = router;
