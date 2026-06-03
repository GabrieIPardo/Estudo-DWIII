// src/routes/authRoutes.js — Rotas de Autenticação
const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/authController");
const { autenticar } = require("../middlewares/authMiddleware");

// Rotas públicas
router.post("/register", register);   // Cadastrar novo usuário
router.post("/login",    login);      // Fazer login e receber token

// Rota protegida — requer token JWT válido
router.get("/me", autenticar, getMe); // Retorna dados do usuário logado

module.exports = router;
