const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome é obrigatório"],
      trim: true,
      minlength: [2, "O nome deve ter pelo menos 2 caracteres"],
    },

    email: {
      type: String,
      required: [true, "O e-mail é obrigatório"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Informe um e-mail válido"],
    },

    senha: {
      type: String,
      required: [true, "A senha é obrigatória"],
      minlength: [6, "A senha deve ter no mínimo 6 caracteres"],
      select: false, // Nunca retorna a senha em queries por padrão
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    versionKey: false,
  }
);

// Middleware PRE-SAVE: criptografa a senha antes de salvar
userSchema.pre("save", async function (next) {
  // Só recriptografa se a senha foi modificada
  if (!this.isModified("senha")) return next();

  const salt = await bcrypt.genSalt(12);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

// Método de instância: compara senha informada com o hash salvo
userSchema.methods.compararSenha = async function (senhaInformada) {
  return bcrypt.compare(senhaInformada, this.senha);
};

// Método de instância: retorna o usuário sem dados sensíveis
userSchema.methods.toPublicJSON = function () {
  return {
    id:        this._id,
    nome:      this.nome,
    email:     this.email,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
