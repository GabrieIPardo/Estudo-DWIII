const express = require('express');
const router  = express.Router();
const { db, uuidv4 } = require('../models/database');

/**
 * @swagger
 * /servicos:
 *   get:
 *     summary: Lista todos os serviços
 *     tags: [Serviços]
 *     responses:
 *       200:
 *         description: Lista de serviços
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Servico' }
 */
router.get('/', (req, res) => res.json(db.servicos));

/**
 * @swagger
 * /servicos/{id}:
 *   get:
 *     summary: Busca serviço pelo ID
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Serviço encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Servico' }
 *       404:
 *         description: Serviço não encontrado
 */
router.get('/:id', (req, res) => {
  const s = db.servicos.find(s => s.id === req.params.id);
  if (!s) return res.status(404).json({ erro: 'Serviço não encontrado' });
  res.json(s);
});

/**
 * @swagger
 * /servicos:
 *   post:
 *     summary: Cadastra um novo serviço
 *     tags: [Serviços]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ServicoInput' }
 *     responses:
 *       201:
 *         description: Serviço criado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Servico' }
 */
router.post('/', (req, res) => {
  const { nome, preco, duracao_min, descricao } = req.body;
  if (!nome || preco === undefined)
    return res.status(400).json({ erro: 'nome e preco são obrigatórios' });

  const servico = { id: uuidv4(), nome, preco: parseFloat(preco), duracao_min: duracao_min || 60, descricao: descricao || '' };
  db.servicos.push(servico);
  res.status(201).json(servico);
});

/**
 * @swagger
 * /servicos/{id}:
 *   put:
 *     summary: Atualiza um serviço
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ServicoInput' }
 *     responses:
 *       200:
 *         description: Serviço atualizado
 *       404:
 *         description: Serviço não encontrado
 */
router.put('/:id', (req, res) => {
  const idx = db.servicos.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Serviço não encontrado' });
  const { nome, preco, duracao_min, descricao } = req.body;
  db.servicos[idx] = { ...db.servicos[idx], nome: nome || db.servicos[idx].nome, preco: preco !== undefined ? parseFloat(preco) : db.servicos[idx].preco, duracao_min: duracao_min ?? db.servicos[idx].duracao_min, descricao: descricao ?? db.servicos[idx].descricao };
  res.json(db.servicos[idx]);
});

/**
 * @swagger
 * /servicos/{id}:
 *   delete:
 *     summary: Remove um serviço
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Serviço removido
 *       404:
 *         description: Serviço não encontrado
 */
router.delete('/:id', (req, res) => {
  const idx = db.servicos.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Serviço não encontrado' });
  db.servicos.splice(idx, 1);
  res.json({ mensagem: 'Serviço removido com sucesso' });
});

module.exports = router;
