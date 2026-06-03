const Task = require("../models/Task");

// GET /api/tasks  — Listar tarefas do usuário autenticado
// Suporta filtros via query: ?status=pendente&prioridade=alta
const listarTarefas = async (req, res, next) => {
  try {
    const filtro = { usuario: req.usuario._id };

    // Filtros opcionais via query string
    if (req.query.status)     filtro.status     = req.query.status;
    if (req.query.prioridade) filtro.prioridade = req.query.prioridade;

    // Paginação simples
    const pagina    = parseInt(req.query.pagina)  || 1;
    const limite    = parseInt(req.query.limite)   || 10;
    const skip      = (pagina - 1) * limite;

    const [tarefas, total] = await Promise.all([
      Task.find(filtro)
        .sort({ createdAt: -1 })   // Mais recentes primeiro
        .skip(skip)
        .limit(limite),
      Task.countDocuments(filtro),
    ]);

    res.json({
      success: true,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
      tarefas,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id  — Buscar uma tarefa por ID
const buscarTarefa = async (req, res, next) => {
  try {
    const tarefa = await Task.findOne({
      _id:     req.params.id,
      usuario: req.usuario._id,        // Garante que pertence ao usuário
    });

    if (!tarefa) {
      return res.status(404).json({
        success: false,
        message: "Tarefa não encontrada.",
      });
    }

    res.json({ success: true, tarefa });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks  — Criar nova tarefa
const criarTarefa = async (req, res, next) => {
  try {
    const { titulo, descricao, status, prioridade, dataVencimento } = req.body;

    if (!titulo) {
      return res.status(400).json({
        success: false,
        message: "O título da tarefa é obrigatório.",
      });
    }

    const tarefa = await Task.create({
      titulo,
      descricao,
      status,
      prioridade,
      dataVencimento,
      usuario: req.usuario._id,        // Associa ao usuário logado
    });

    res.status(201).json({
      success: true,
      message: "Tarefa criada com sucesso!",
      tarefa,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const mensagens = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: mensagens.join(". ") });
    }
    next(error);
  }
};

// PUT /api/tasks/:id  — Atualizar tarefa
const atualizarTarefa = async (req, res, next) => {
  try {
    const { titulo, descricao, status, prioridade, dataVencimento } = req.body;

    const tarefa = await Task.findOneAndUpdate(
      { _id: req.params.id, usuario: req.usuario._id },
      { titulo, descricao, status, prioridade, dataVencimento },
      { new: true, runValidators: true }
    );

    if (!tarefa) {
      return res.status(404).json({
        success: false,
        message: "Tarefa não encontrada ou sem permissão.",
      });
    }

    res.json({
      success: true,
      message: "Tarefa atualizada com sucesso!",
      tarefa,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const mensagens = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: mensagens.join(". ") });
    }
    next(error);
  }
};

// PATCH /api/tasks/:id/status  — Atualizar apenas o status
const atualizarStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const statusValidos = ["pendente", "em_progresso", "concluida"];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status inválido. Use: ${statusValidos.join(", ")}`,
      });
    }

    const tarefa = await Task.findOneAndUpdate(
      { _id: req.params.id, usuario: req.usuario._id },
      { status },
      { new: true }
    );

    if (!tarefa) {
      return res.status(404).json({
        success: false,
        message: "Tarefa não encontrada ou sem permissão.",
      });
    }

    res.json({ success: true, message: "Status atualizado!", tarefa });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id  — Excluir tarefa
const excluirTarefa = async (req, res, next) => {
  try {
    const tarefa = await Task.findOneAndDelete({
      _id:     req.params.id,
      usuario: req.usuario._id,
    });

    if (!tarefa) {
      return res.status(404).json({
        success: false,
        message: "Tarefa não encontrada ou sem permissão.",
      });
    }

    res.json({ success: true, message: "Tarefa excluída com sucesso." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarTarefas,
  buscarTarefa,
  criarTarefa,
  atualizarTarefa,
  atualizarStatus,
  excluirTarefa,
};
