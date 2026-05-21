const express = require('express');
const router  = express.Router();
const { db, uuidv4 } = require('../models/database');

/**
 * @swagger
 * /pets:
 *   get:
 *     summary: Lista todos os pets
 *     tags: [Pets]
 *     parameters:
 *       - in: query
 *         name: especie
 *         schema: { type: string }
 *         description: Filtra por espécie (cachorro, gato, etc.)
 *       - in: query
 *         name: nome
 *         schema: { type: string }
 *         description: Filtra por nome (parcial)
 *     responses:
 *       200:
 *         description: Lista de pets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Pet' }
 */
router.get('/', (req, res) => {
  let resultado = db.pets;
  if (req.query.especie) resultado = resultado.filter(p => p.especie === req.query.especie);
  if (req.query.nome)    resultado = resultado.filter(p => p.nome.toLowerCase().includes(req.query.nome.toLowerCase()));
  res.json(resultado);
});

/**
 * @swagger
 * /pets/{id}:
 *   get:
 *     summary: Busca pet pelo ID
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Pet encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pet' }
 *       404:
 *         description: Pet não encontrado
 */
router.get('/:id', (req, res) => {
  const pet = db.pets.find(p => p.id === req.params.id);
  if (!pet) return res.status(404).json({ erro: 'Pet não encontrado' });
  res.json(pet);
});

/**
 * @swagger
 * /pets:
 *   post:
 *     summary: Cadastra um novo pet
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PetInput' }
 *     responses:
 *       201:
 *         description: Pet criado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pet' }
 *       400:
 *         description: Dados inválidos
 */
router.post('/', (req, res) => {
  const { nome, especie, raca, idade, peso, tutor_id } = req.body;
  if (!nome || !especie) return res.status(400).json({ erro: 'nome e especie são obrigatórios' });

  if (tutor_id && !db.tutores.find(t => t.id === tutor_id))
    return res.status(400).json({ erro: 'tutor_id inválido' });

  const pet = { id: uuidv4(), nome, especie, raca: raca || null, idade: idade || null, peso: peso || null, tutor_id: tutor_id || null, criado_em: new Date().toISOString() };
  db.pets.push(pet);
  res.status(201).json(pet);
});

/**
 * @swagger
 * /pets/{id}:
 *   put:
 *     summary: Atualiza dados de um pet
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PetInput' }
 *     responses:
 *       200:
 *         description: Pet atualizado
 *       404:
 *         description: Pet não encontrado
 */
router.put('/:id', (req, res) => {
  const idx = db.pets.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Pet não encontrado' });
  const { nome, especie, raca, idade, peso, tutor_id } = req.body;
  db.pets[idx] = { ...db.pets[idx], nome: nome || db.pets[idx].nome, especie: especie || db.pets[idx].especie, raca: raca ?? db.pets[idx].raca, idade: idade ?? db.pets[idx].idade, peso: peso ?? db.pets[idx].peso, tutor_id: tutor_id ?? db.pets[idx].tutor_id };
  res.json(db.pets[idx]);
});

/**
 * @swagger
 * /pets/{id}:
 *   delete:
 *     summary: Remove um pet
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Pet removido
 *       404:
 *         description: Pet não encontrado
 */
router.delete('/:id', (req, res) => {
  const idx = db.pets.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Pet não encontrado' });
  db.pets.splice(idx, 1);
  res.json({ mensagem: 'Pet removido com sucesso' });
});

/**
 * @swagger
 * /pets/{id}/agendamentos:
 *   get:
 *     summary: Lista agendamentos de um pet
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Agendamentos do pet
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Agendamento' }
 */
router.get('/:id/agendamentos', (req, res) => {
  const pet = db.pets.find(p => p.id === req.params.id);
  if (!pet) return res.status(404).json({ erro: 'Pet não encontrado' });
  res.json(db.agendamentos.filter(a => a.pet_id === req.params.id));
});

module.exports = router;
