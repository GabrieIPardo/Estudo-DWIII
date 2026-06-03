const User = require("../models/User");

// GET /api/users  — Listar todos os usuários (apenas admins usariam)
const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await User.find().select("-senha");
    res.json({
      success: true,
      total: usuarios.length,
      usuarios: usuarios.map((u) => u.toPublicJSON()),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id  — Buscar usuário por ID
const buscarUsuario = async (req, res, next) => {
  try {
    const usuario = await User.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado.",
      });
    }

    res.json({ success: true, usuario: usuario.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id  — Atualizar dados do usuário autenticado
const atualizarUsuario = async (req, res, next) => {
  try {
    // Garante que o usuário só pode alterar o próprio perfil
    if (req.usuario._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Você não tem permissão para editar este usuário.",
      });
    }

    const { nome, email } = req.body;

    // Campos permitidos para atualização (não permite trocar senha por aqui)
    const dadosAtualizados = {};
    if (nome)  dadosAtualizados.nome  = nome;
    if (email) dadosAtualizados.email = email;

    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      dadosAtualizados,
      { new: true, runValidators: true }
    );

    if (!usuario) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    res.json({
      success: true,
      message: "Perfil atualizado com sucesso!",
      usuario: usuario.toPublicJSON(),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const mensagens = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: mensagens.join(". ") });
    }
    next(error);
  }
};

// DELETE /api/users/:id  — Excluir conta do usuário
const excluirUsuario = async (req, res, next) => {
  try {
    if (req.usuario._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Você não tem permissão para excluir este usuário.",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Conta excluída com sucesso.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listarUsuarios, buscarUsuario, atualizarUsuario, excluirUsuario };
