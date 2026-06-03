const jwt = require("jsonwebtoken");
const User = require("../models/User");

const autenticar = async (req, res, next) => {
  try {
    // 1. Extrair o token do header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Acesso negado. Token não fornecido.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Buscar o usuário no banco (confirma que ainda existe)
    const usuario = await User.findById(decoded.id);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: "Token inválido. Usuário não encontrado.",
      });
    }

    // 4. Injetar o usuário na requisição e seguir
    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado. Faça login novamente.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Token inválido.",
    });
  }
};

module.exports = { autenticar };
