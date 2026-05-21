const { v4: uuidv4 } = require('uuid');

// ─── Dados Iniciais ────────────────────────────────────────────────────────────

const db = {
  pets: [
    { id: uuidv4(), nome: 'Rex',   especie: 'cachorro', raca: 'Labrador',       idade: 3, peso: 28.5, tutor_id: null, criado_em: new Date().toISOString() },
    { id: uuidv4(), nome: 'Mia',   especie: 'gato',     raca: 'Siamês',         idade: 2, peso: 4.2,  tutor_id: null, criado_em: new Date().toISOString() },
    { id: uuidv4(), nome: 'Pingo', especie: 'cachorro', raca: 'Poodle',         idade: 5, peso: 7.1,  tutor_id: null, criado_em: new Date().toISOString() },
  ],
  tutores: [
    { id: uuidv4(), nome: 'Ana Silva',    email: 'ana@email.com',    telefone: '11999990001', endereco: 'Rua das Flores, 10', criado_em: new Date().toISOString() },
    { id: uuidv4(), nome: 'Carlos Souza', email: 'carlos@email.com', telefone: '11999990002', endereco: 'Av. Brasil, 200',    criado_em: new Date().toISOString() },
  ],
  produtos: [
    { id: uuidv4(), nome: 'Ração Premium Cachorro 15kg', categoria: 'alimentacao', preco: 189.90, estoque: 50, descricao: 'Ração super premium para cães adultos' },
    { id: uuidv4(), nome: 'Shampoo Pet Neutro 500ml',    categoria: 'higiene',     preco: 29.90,  estoque: 30, descricao: 'Shampoo suave para cães e gatos' },
    { id: uuidv4(), nome: 'Coleira Antipulgas',          categoria: 'saude',       preco: 45.00,  estoque: 20, descricao: 'Proteção contra pulgas e carrapatos por 8 meses' },
    { id: uuidv4(), nome: 'Brinquedo Bolinha de Tênis',  categoria: 'acessorios',  preco: 12.50,  estoque: 80, descricao: 'Brinquedo resistente para cães' },
  ],
  servicos: [
    { id: uuidv4(), nome: 'Banho Simples',     preco: 60.00,  duracao_min: 60,  descricao: 'Banho com secagem' },
    { id: uuidv4(), nome: 'Banho + Tosa',      preco: 100.00, duracao_min: 120, descricao: 'Banho completo com tosa a escolha' },
    { id: uuidv4(), nome: 'Consulta Veterinária', preco: 150.00, duracao_min: 45, descricao: 'Consulta clínica geral' },
    { id: uuidv4(), nome: 'Vacinação',         preco: 80.00,  duracao_min: 20,  descricao: 'Aplicação de vacinas conforme carteirinha' },
  ],
  agendamentos: [],
  vendas: [],
};

module.exports = { db, uuidv4 };
