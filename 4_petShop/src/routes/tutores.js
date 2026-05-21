const express = require('express');
const router  = express.Router();
const { db, uuidv4 } = require('../models/database');

/**
 * @swagger
 * /tutores:
 *   get:
 *     summary: Lista todos os tutores
 *     tags: [Tutores]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema: { type: string }
 *         description: Filtra por nome (parcial, case-insensitive)
 *     responses:
 *       200:
 *         description: Lista de tutores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Tutor' }
 */
router.get('/', (req, res) => {
  let resultado = db.tutores;
  if (req.query.nome) {
    resultado = resultado.filter(t =>
      t.nome.toLowerCase().includes(req.query.nome.toLowerCase())
    );
  }
  res.json(resultado);
});

/**
 * @swagger
 * /tutores/{id}:
 *   get:
 *     summary: Busca tutor pelo ID
 *     tags: [Tutores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Tutor encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Tutor' }
 *       404:
 *         description: Não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get('/:id', (req, res) => {
  const tutor = db.tutores.find(t => t.id === req.params.id);
  if (!tutor) return res.status(404).json({ erro: 'Tutor não encontrado' });
  res.json(tutor);
});

/**
 * @swagger
 * /tutores:
 *   post:
 *     summary: Cadastra um novo tutor
 *     tags: [Tutores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TutorInput' }
 *     responses:
 *       201:
 *         description: Tutor criado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Tutor' }
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.post('/', (req, res) => {
  const { nome, email, telefone, endereco } = req.body;
  if (!nome || !email || !telefone)
    return res.status(400).json({ erro: 'nome, email e telefone são obrigatórios' });

  if (db.tutores.find(t => t.email === email))
    return res.status(400).json({ erro: 'E-mail já cadastrado' });

  const tutor = { id: uuidv4(), nome, email, telefone, endereco: endereco || '', criado_em: new Date().toISOString() };
  db.tutores.push(tutor);
  res.status(201).json(tutor);
});

/**
 * @swagger
 * /tutores/{id}:
 *   put:
 *     summary: Atualiza dados de um tutor
 *     tags: [Tutores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TutorInput' }
 *     responses:
 *       200:
 *         description: Tutor atualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Tutor' }
 *       404:
 *         description: Não encontrado
 */
router.put('/:id', (req, res) => {
  const idx = db.tutores.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Tutor não encontrado' });

  const { nome, email, telefone, endereco } = req.body;
  db.tutores[idx] = { ...db.tutores[idx], nome: nome || db.tutores[idx].nome, email: email || db.tutores[idx].email, telefone: telefone || db.tutores[idx].telefone, endereco: endereco ?? db.tutores[idx].endereco };
  res.json(db.tutores[idx]);
});

/**
 * @swagger
 * /tutores/{id}:
 *   delete:
 *     summary: Remove um tutor
 *     tags: [Tutores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Tutor removido
 *       404:
 *         description: Não encontrado
 */
router.delete('/:id', (req, res) => {
  const idx = db.tutores.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Tutor não encontrado' });
  db.tutores.splice(idx, 1);
  res.json({ mensagem: 'Tutor removido com sucesso' });
});

/**
 * @swagger
 * /tutores/{id}/pets:
 *   get:
 *     summary: Lista os pets de um tutor
 *     tags: [Tutores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Pets do tutor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Pet' }
 *       404:
 *         description: Tutor não encontrado
 */
router.get('/:id/pets', (req, res) => {
  const tutor = db.tutores.find(t => t.id === req.params.id);
  if (!tutor) return res.status(404).json({ erro: 'Tutor não encontrado' });
  const pets = db.pets.filter(p => p.tutor_id === req.params.id);
  res.json(pets);
});

module.exports = router;
