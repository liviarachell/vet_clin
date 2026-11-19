const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.id, a.data_hora, a.motivo, a.status,
              p.id AS pet_id, p.nome AS pet, p.especie, p.raca,
              t.id AS tutor_id, t.nome AS tutor, t.telefone, t.email
       FROM agendamentos a
       JOIN pets p ON p.id = a.pet_id
       JOIN tutores t ON t.id = p.tutor_id
       ORDER BY a.data_hora ASC`
    );
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao listar agendamentos.' }); }
});

router.put('/:id/data', async (req, res) => {
  try {
    const { data_hora } = req.body;
    if (!data_hora || Number.isNaN(Date.parse(data_hora))) return res.status(400).json({ erro: 'Informe uma data e hora válidas.' });
    const [result] = await db.execute('UPDATE agendamentos SET data_hora=? WHERE id=?', [new Date(data_hora), req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    res.json({ mensagem: 'Data do agendamento atualizada.' });
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao atualizar agendamento.' }); }
});
module.exports = router;
