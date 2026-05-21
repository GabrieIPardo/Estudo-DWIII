const express = require('express');
const router  = express.Router();
const { db, uuidv4 } = require('../models/database');

/**
 * @swagger
 * /vendas:
 *   get:
 *     summary: Lista todas as vendas
 *     tags: [Vendas]
 *     responses:
 *       200:
 *         description: Lista de vendas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Venda' }
 */
router.get('/', (req, res) => res.json(db.vendas));

/**
 * @swagger
 * /vendas/{id}:
 *   get:
 *     summary: Busca venda pelo ID
 *     tags: [Vendas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Venda encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Venda' }
 *       404:
 *         description: Venda não encontrada
 */
router.get('/:id', (req, res) => {
  const venda = db.vendas.find(v => v.id === req.params.id);
  if (!venda) return res.status(404).json({ erro: 'Venda não encontrada' });
  res.json(venda);
});

/**
 * @swagger
 * /vendas:
 *   post:
 *     summary: Registra uma nova venda
 *     description: Verifica estoque disponível, desconta automaticamente e calcula o total.
 *     tags: [Vendas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VendaInput' }
 *     responses:
 *       201:
 *         description: Venda registrada com sucesso
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Venda' }
 *       400:
 *         description: Estoque insuficiente ou produto inválido
 */
router.post('/', (req, res) => {
  const { tutor_id, itens } = req.body;
  if (!itens || !Array.isArray(itens) || itens.length === 0)
    return res.status(400).json({ erro: 'itens é obrigatório e deve ser um array não vazio' });

  const itensProcessados = [];
  for (const item of itens) {
    const produto = db.produtos.find(p => p.id === item.produto_id);
    if (!produto) return res.status(400).json({ erro: `Produto ${item.produto_id} não encontrado` });
    if (produto.estoque < item.quantidade)
      return res.status(400).json({ erro: `Estoque insuficiente para "${produto.nome}". Disponível: ${produto.estoque}` });

    itensProcessados.push({ produto_id: produto.id, nome_produto: produto.nome, quantidade: item.quantidade, preco_unit: produto.preco, subtotal: +(produto.preco * item.quantidade).toFixed(2) });
  }

  // Desconta estoque
  itensProcessados.forEach(item => {
    const idx = db.produtos.findIndex(p => p.id === item.produto_id);
    db.produtos[idx].estoque -= item.quantidade;
  });

  const total = +itensProcessados.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2);
  const venda = { id: uuidv4(), tutor_id: tutor_id || null, itens: itensProcessados, total, criado_em: new Date().toISOString() };
  db.vendas.push(venda);
  res.status(201).json(venda);
});

/**
 * @swagger
 * /vendas/relatorio/resumo:
 *   get:
 *     summary: Resumo financeiro das vendas
 *     tags: [Vendas]
 *     responses:
 *       200:
 *         description: Resumo de vendas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_vendas:   { type: integer }
 *                 receita_total:  { type: number }
 *                 ticket_medio:   { type: number }
 */
router.get('/relatorio/resumo', (req, res) => {
  const total_vendas  = db.vendas.length;
  const receita_total = +db.vendas.reduce((a, v) => a + v.total, 0).toFixed(2);
  const ticket_medio  = total_vendas ? +(receita_total / total_vendas).toFixed(2) : 0;
  res.json({ total_vendas, receita_total, ticket_medio });
});

module.exports = router;
