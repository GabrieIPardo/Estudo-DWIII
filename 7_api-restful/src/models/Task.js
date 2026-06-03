const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "O título da tarefa é obrigatório"],
      trim: true,
      maxlength: [120, "O título não pode ter mais de 120 caracteres"],
    },

    descricao: {
      type: String,
      trim: true,
      maxlength: [500, "A descrição não pode ter mais de 500 caracteres"],
      default: "",
    },

    status: {
      type: String,
      enum: {
        values: ["pendente", "em_progresso", "concluida"],
        message: 'Status inválido. Use: "pendente", "em_progresso" ou "concluida"',
      },
      default: "pendente",
    },

    prioridade: {
      type: String,
      enum: ["baixa", "media", "alta"],
      default: "media",
    },

    dataVencimento: {
      type: Date,
      default: null,
    },

    // Relacionamento com o usuário dono da tarefa (referência)
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A tarefa deve pertencer a um usuário"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índice composto: buscar tarefas de um usuário por status eficientemente
taskSchema.index({ usuario: 1, status: 1 });

module.exports = mongoose.model("Task", taskSchema);
