// src/routes/userRoutes.js — Rotas de Usuários
const express = require("express");
const router = express.Router();

const {
  listarUsuarios,
  buscarUsuario,
  atualizarUsuario,
  excluirUsuario,
} = require("../controllers/userController");

const { autenticar } = require("../middlewares/authMiddleware");

// Todas as rotas abaixo exigem autenticação
router.use(autenticar);

router.get("/",        listarUsuarios);          // GET    /api/users
router.get("/:id",     buscarUsuario);           // GET    /api/users/:id
router.put("/:id",     atualizarUsuario);        // PUT    /api/users/:id
router.delete("/:id",  excluirUsuario);          // DELETE /api/users/:id

module.exports = router;
