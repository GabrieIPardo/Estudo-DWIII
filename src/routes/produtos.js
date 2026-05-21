const express = require('express');
const router  = express.Router();
const { db, uuidv4 } = require('../models/database');

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema: { type: string, enum: [alimentacao, higiene, saude, acessorios, outro] }
 *         description: Filtra por categoria
 *       - in: query
 *         name: preco_max
 *         schema: { type: number }
 *         description: Preço máximo
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Produto' }
 */
router.get('/', (req, res) => {
  let resultado = db.produtos;
  if (req.query.categoria) resultado = resultado.filter(p => p.categoria === req.query.categoria);
  if (req.query.preco_max) resultado = resultado.filter(p => p.preco <= parseFloat(req.query.preco_max));
  res.json(resultado);
});

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     summary: Busca produto pelo ID
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Produto' }
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:id', (req, res) => {
  const produto = db.produtos.find(p => p.id === req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.json(produto);
});

/**
 * @swagger
 * /produtos:
 *   post:
 *     summary: Cadastra um novo produto
 *     tags: [Produtos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProdutoInput' }
 *     responses:
 *       201:
 *         description: Produto criado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Produto' }
 *       400:
 *         description: Dados inválidos
 */
router.post('/', (req, res) => {
  const { nome, categoria, preco, estoque, descricao } = req.body;
  if (!nome || !categoria || preco === undefined)
    return res.status(400).json({ erro: 'nome, categoria e preco são obrigatórios' });

  const produto = { id: uuidv4(), nome, categoria, preco: parseFloat(preco), estoque: estoque || 0, descricao: descricao || '' };
  db.produtos.push(produto);
  res.status(201).json(produto);
});

/**
 * @swagger
 * /produtos/{id}:
 *   put:
 *     summary: Atualiza dados de um produto
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProdutoInput' }
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       404:
 *         description: Produto não encontrado
 */
router.put('/:id', (req, res) => {
  const idx = db.produtos.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Produto não encontrado' });
  const { nome, categoria, preco, estoque, descricao } = req.body;
  db.produtos[idx] = { ...db.produtos[idx], nome: nome || db.produtos[idx].nome, categoria: categoria || db.produtos[idx].categoria, preco: preco !== undefined ? parseFloat(preco) : db.produtos[idx].preco, estoque: estoque !== undefined ? estoque : db.produtos[idx].estoque, descricao: descricao ?? db.produtos[idx].descricao };
  res.json(db.produtos[idx]);
});

/**
 * @swagger
 * /produtos/{id}/estoque:
 *   patch:
 *     summary: Ajusta o estoque de um produto
 *     tags: [Produtos]
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
 *             required: [quantidade]
 *             properties:
 *               quantidade:
 *                 type: integer
 *                 description: Valor positivo (entrada) ou negativo (saída)
 *                 example: 10
 *     responses:
 *       200:
 *         description: Estoque atualizado
 *       400:
 *         description: Estoque insuficiente
 *       404:
 *         description: Produto não encontrado
 */
router.patch('/:id/estoque', (req, res) => {
  const idx = db.produtos.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Produto não encontrado' });
  const { quantidade } = req.body;
  const novoEstoque = db.produtos[idx].estoque + quantidade;
  if (novoEstoque < 0) return res.status(400).json({ erro: 'Estoque insuficiente', estoque_atual: db.produtos[idx].estoque });
  db.produtos[idx].estoque = novoEstoque;
  res.json({ mensagem: 'Estoque atualizado', estoque: novoEstoque });
});

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     summary: Remove um produto
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Produto removido
 *       404:
 *         description: Produto não encontrado
 */
router.delete('/:id', (req, res) => {
  const idx = db.produtos.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Produto não encontrado' });
  db.produtos.splice(idx, 1);
  res.json({ mensagem: 'Produto removido com sucesso' });
});

module.exports = router;
