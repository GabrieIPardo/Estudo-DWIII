// src/config/database.js — Conexão com o MongoDB via Mongoose
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/api_restful";

    await mongoose.connect(uri);

    console.log("✅ MongoDB conectado com sucesso!");
  } catch (error) {
    console.error("❌ Falha ao conectar ao MongoDB:", error.message);
    process.exit(1); // Encerra o processo se não conseguir conectar
  }
};

// Eventos de conexão para monitoramento
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB desconectado.");
});

module.exports = connectDB;
