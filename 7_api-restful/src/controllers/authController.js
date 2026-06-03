const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Gera um token JWT assinado com o ID do usuário.
 
const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;

    // Validação básica dos campos obrigatórios
    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: "Preencha todos os campos: nome, email e senha.",
      });
    }

    // Verificar se o e-mail já está em uso
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: "Este e-mail já está cadastrado.",
      });
    }

    // Criar o usuário (a senha é criptografada pelo hook pre-save do Model)
    const usuario = await User.create({ nome, email, senha });

    // Gerar token JWT
    const token = gerarToken(usuario._id);

    res.status(201).json({
      success: true,
      message: "Usuário cadastrado com sucesso!",
      token,
      usuario: usuario.toPublicJSON(),
    });
  } catch (error) {
    // Erros de validação do Mongoose
    if (error.name === "ValidationError") {
      const mensagens = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: mensagens.join(". ") });
    }
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: "Informe o e-mail e a senha.",
      });
    }

    // Buscar usuário incluindo o campo senha (select: false no schema)
    const usuario = await User.findOne({ email }).select("+senha");

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }

    // Comparar senha informada com o hash salvo
    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }

    const token = gerarToken(usuario._id);

    res.json({
      success: true,
      message: "Login realizado com sucesso!",
      token,
      usuario: usuario.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me  (rota protegida)
const getMe = async (req, res) => {
  res.json({
    success: true,
    usuario: req.usuario.toPublicJSON(),
  });
};

module.exports = { register, login, getMe };
