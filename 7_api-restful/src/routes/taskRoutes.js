// src/routes/taskRoutes.js — Rotas de Tarefas
const express = require("express");
const router = express.Router();

const {
  listarTarefas,
  buscarTarefa,
  criarTarefa,
  atualizarTarefa,
  atualizarStatus,
  excluirTarefa,
} = require("../controllers/taskController");

const { autenticar } = require("../middlewares/authMiddleware");

// Todas as rotas de tarefas exigem autenticação
router.use(autenticar);

router.get("/",                listarTarefas);    // GET    /api/tasks
router.get("/:id",             buscarTarefa);     // GET    /api/tasks/:id
router.post("/",               criarTarefa);      // POST   /api/tasks
router.put("/:id",             atualizarTarefa);  // PUT    /api/tasks/:id
router.patch("/:id/status",    atualizarStatus);  // PATCH  /api/tasks/:id/status
router.delete("/:id",          excluirTarefa);    // DELETE /api/tasks/:id

module.exports = router;
