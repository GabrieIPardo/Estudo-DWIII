const express      = require('express');
const cors         = require('cors');
const swaggerUi    = require('swagger-ui-express');
const swaggerSpec  = require('./swagger');

const tutoresRouter      = require('./routes/tutores');
const petsRouter         = require('./routes/pets');
const produtosRouter     = require('./routes/produtos');
const servicosRouter     = require('./routes/servicos');
const agendamentosRouter = require('./routes/agendamentos');
const vendasRouter       = require('./routes/vendas');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Swagger UI ───────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: '🐾 Pet Shop API',
  customCss: `
    .swagger-ui .topbar { background-color: #2d6a4f; }
    .swagger-ui .topbar-wrapper img { content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='20' font-size='20'%3E🐾%3C/text%3E%3C/svg%3E"); }
    .swagger-ui .info .title { color: #2d6a4f; }
  `,
  swaggerOptions: { persistAuthorization: true },
}));

// Rota para baixar o JSON da spec
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// ─── Rotas ────────────────────────────────────────────────────────────────────
app.use('/tutores',      tutoresRouter);
app.use('/pets',         petsRouter);
app.use('/produtos',     produtosRouter);
app.use('/servicos',     servicosRouter);
app.use('/agendamentos', agendamentosRouter);
app.use('/vendas',       vendasRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check da API
 *     tags: []
 *     responses:
 *       200:
 *         description: API online
 */
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    nome: '🐾 Pet Shop API',
    versao: '1.0.0',
    documentacao: `http://localhost:${PORT}/api-docs`,
    endpoints: [
      'GET /tutores',
      'GET /pets',
      'GET /produtos',
      'GET /servicos',
      'GET /agendamentos',
      'GET /vendas',
    ],
  });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ erro: 'Endpoint não encontrado', documentacao: `http://localhost:${PORT}/api-docs` });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno no servidor' });
});

app.listen(PORT, () => {
  console.log(`\n🐾  Pet Shop API rodando em http://localhost:${PORT}`);
  console.log(`📖  Swagger UI:           http://localhost:${PORT}/api-docs`);
  console.log(`📄  OpenAPI JSON:         http://localhost:${PORT}/api-docs.json\n`);
});

module.exports = app;
