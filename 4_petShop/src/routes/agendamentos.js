const express = require('express');
const router  = express.Router();
const { db, uuidv4 } = require('../models/database');

/**
 * @swagger
 * /agendamentos:
 *   get:
 *     summary: Lista todos os agendamentos
 *     tags: [Agendamentos]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [agendado, em_andamento, concluido, cancelado] }
 *       - in: query
 *         name: data
 *         schema: { type: string, format: date }
 *         description: Filtra por data (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Agendamento' }
 */
router.get('/', (req, res) => {
  let resultado = db.agendamentos;
  if (req.query.status) resultado = resultado.filter(a => a.status === req.query.status);
  if (req.query.data)   resultado = resultado.filter(a => a.data_hora.startsWith(req.query.data));
  res.json(resultado);
});

/**
 * @swagger
 * /agendamentos/{id}:
 *   get:
 *     summary: Busca agendamento pelo ID
 *     tags: [Agendamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Agendamento encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Agendamento' }
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', (req, res) => {
  const ag = db.agendamentos.find(a => a.id === req.params.id);
  if (!ag) return res.status(404).json({ erro: 'Agendamento não encontrado' });
  res.json(ag);
});

/**
 * @swagger
 * /agendamentos:
 *   post:
 *     summary: Cria um novo agendamento
 *     tags: [Agendamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AgendamentoInput' }
 *     responses:
 *       201:
 *         description: Agendamento criado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Agendamento' }
 *       400:
 *         description: Dados inválidos ou conflito de horário
 */
router.post('/', (req, res) => {
  const { pet_id, servico_id, tutor_id, data_hora, observacoes } = req.body;
  if (!pet_id || !servico_id || !data_hora)
    return res.status(400).json({ erro: 'pet_id, servico_id e data_hora são obrigatórios' });

  if (!db.pets.find(p => p.id === pet_id))
    return res.status(400).json({ erro: 'pet_id inválido' });
  if (!db.servicos.find(s => s.id === servico_id))
    return res.status(400).json({ erro: 'servico_id inválido' });

  // Verifica conflito de horário (mesmo serviço, mesma hora exata)
  const conflito = db.agendamentos.find(a => a.data_hora === data_hora && a.status !== 'cancelado');
  if (conflito) return res.status(400).json({ erro: 'Conflito de horário: já existe agendamento nesse horário' });

  const agendamento = {
    id: uuidv4(), pet_id, servico_id,
    tutor_id: tutor_id || null,
    data_hora, status: 'agendado',
    observacoes: observacoes || '',
    criado_em: new Date().toISOString(),
  };
  db.agendamentos.push(agendamento);
  res.status(201).json(agendamento);
});

/**
 * @swagger
 * /agendamentos/{id}/status:
 *   patch:
 *     summary: Atualiza o status de um agendamento
 *     tags: [Agendamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [agendado, em_andamento, concluido, cancelado]
 *     responses:
 *       200:
 *         description: Status atualizado
 *       400:
 *         description: Status inválido
 *       404:
 *         description: Agendamento não encontrado
 */
router.patch('/:id/status', (req, res) => {
  const idx = db.agendamentos.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Agendamento não encontrado' });

  const validos = ['agendado', 'em_andamento', 'concluido', 'cancelado'];
  if (!validos.includes(req.body.status))
    return res.status(400).json({ erro: `Status inválido. Use: ${validos.join(', ')}` });

  db.agendamentos[idx].status = req.body.status;
  res.json(db.agendamentos[idx]);
});

/**
 * @swagger
 * /agendamentos/{id}:
 *   delete:
 *     summary: Cancela (remove) um agendamento
 *     tags: [Agendamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Agendamento cancelado
 *       404:
 *         description: Não encontrado
 */
router.delete('/:id', (req, res) => {
  const idx = db.agendamentos.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Agendamento não encontrado' });
  db.agendamentos.splice(idx, 1);
  res.json({ mensagem: 'Agendamento removido' });
});

module.exports = router;
