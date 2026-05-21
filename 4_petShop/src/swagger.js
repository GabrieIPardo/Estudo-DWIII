const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🐾 Pet Shop API',
      version: '1.0.0',
      description: `
# API Completa para Gerenciamento de Pet Shop

Esta API permite gerenciar todos os recursos de um pet shop moderno:

- **Tutores** – Cadastro e gestão de clientes/tutores de pets
- **Pets** – Cadastro e histórico dos animais
- **Produtos** – Estoque de produtos (alimentação, higiene, acessórios, saúde)
- **Serviços** – Banho, tosa, consultas veterinárias etc.
- **Agendamentos** – Agendamento de serviços para os pets
- **Vendas** – Registro de vendas de produtos

> Todos os dados são mantidos em memória (sem banco de dados externo), ideais para testes e demonstração.
      `,

    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor Local' },
    ],
    tags: [
      { name: 'Tutores',       description: 'Gerenciamento de tutores/donos de pets' },
      { name: 'Pets',          description: 'Gerenciamento de animais' },
      { name: 'Produtos',      description: 'Catálogo e estoque de produtos' },
      { name: 'Serviços',      description: 'Serviços oferecidos pelo pet shop' },
      { name: 'Agendamentos',  description: 'Agendamento de serviços' },
      { name: 'Vendas',        description: 'Registro de vendas' },
    ],
    components: {
      schemas: {
        Tutor: {
          type: 'object',
          properties: {
            id:         { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            nome:       { type: 'string', example: 'Ana Silva' },
            email:      { type: 'string', format: 'email', example: 'ana@email.com' },
            telefone:   { type: 'string', example: '11999990001' },
            endereco:   { type: 'string', example: 'Rua das Flores, 10' },
            criado_em:  { type: 'string', format: 'date-time' },
          },
        },
        TutorInput: {
          type: 'object',
          required: ['nome', 'email', 'telefone'],
          properties: {
            nome:     { type: 'string', example: 'João Pereira' },
            email:    { type: 'string', format: 'email', example: 'joao@email.com' },
            telefone: { type: 'string', example: '11988880001' },
            endereco: { type: 'string', example: 'Rua Araucária, 55' },
          },
        },
        Pet: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            nome:      { type: 'string', example: 'Rex' },
            especie:   { type: 'string', enum: ['cachorro','gato','ave','roedor','réptil','outro'], example: 'cachorro' },
            raca:      { type: 'string', example: 'Labrador' },
            idade:     { type: 'integer', example: 3 },
            peso:      { type: 'number', format: 'float', example: 28.5 },
            tutor_id:  { type: 'string', format: 'uuid', nullable: true },
            criado_em: { type: 'string', format: 'date-time' },
          },
        },
        PetInput: {
          type: 'object',
          required: ['nome', 'especie'],
          properties: {
            nome:     { type: 'string', example: 'Bolinha' },
            especie:  { type: 'string', enum: ['cachorro','gato','ave','roedor','réptil','outro'], example: 'gato' },
            raca:     { type: 'string', example: 'Persa' },
            idade:    { type: 'integer', example: 1 },
            peso:     { type: 'number', example: 3.8 },
            tutor_id: { type: 'string', format: 'uuid', nullable: true },
          },
        },
        Produto: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            nome:      { type: 'string', example: 'Ração Premium 15kg' },
            categoria: { type: 'string', enum: ['alimentacao','higiene','saude','acessorios','outro'] },
            preco:     { type: 'number', format: 'float', example: 189.90 },
            estoque:   { type: 'integer', example: 50 },
            descricao: { type: 'string', example: 'Ração super premium para cães adultos' },
          },
        },
        ProdutoInput: {
          type: 'object',
          required: ['nome', 'categoria', 'preco'],
          properties: {
            nome:      { type: 'string', example: 'Areia para Gato 4kg' },
            categoria: { type: 'string', enum: ['alimentacao','higiene','saude','acessorios','outro'], example: 'higiene' },
            preco:     { type: 'number', example: 35.00 },
            estoque:   { type: 'integer', example: 100 },
            descricao: { type: 'string', example: 'Areia sanitária com controle de odores' },
          },
        },
        Servico: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            nome:         { type: 'string', example: 'Banho + Tosa' },
            preco:        { type: 'number', format: 'float', example: 100.00 },
            duracao_min:  { type: 'integer', example: 120, description: 'Duração em minutos' },
            descricao:    { type: 'string', example: 'Banho completo com tosa a escolha' },
          },
        },
        ServicoInput: {
          type: 'object',
          required: ['nome', 'preco'],
          properties: {
            nome:        { type: 'string', example: 'Hidratação' },
            preco:       { type: 'number', example: 70.00 },
            duracao_min: { type: 'integer', example: 45 },
            descricao:   { type: 'string', example: 'Hidratação profunda para pelos ressecados' },
          },
        },
        Agendamento: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            pet_id:      { type: 'string', format: 'uuid' },
            servico_id:  { type: 'string', format: 'uuid' },
            tutor_id:    { type: 'string', format: 'uuid' },
            data_hora:   { type: 'string', format: 'date-time', example: '2025-06-15T10:00:00Z' },
            status:      { type: 'string', enum: ['agendado','em_andamento','concluido','cancelado'], example: 'agendado' },
            observacoes: { type: 'string', example: 'Pet com alergia a perfume' },
            criado_em:   { type: 'string', format: 'date-time' },
          },
        },
        AgendamentoInput: {
          type: 'object',
          required: ['pet_id', 'servico_id', 'data_hora'],
          properties: {
            pet_id:      { type: 'string', format: 'uuid' },
            servico_id:  { type: 'string', format: 'uuid' },
            tutor_id:    { type: 'string', format: 'uuid' },
            data_hora:   { type: 'string', format: 'date-time', example: '2025-06-20T14:00:00Z' },
            observacoes: { type: 'string', example: 'Prefere tosa curta' },
          },
        },
        Venda: {
          type: 'object',
          properties: {
            id:         { type: 'string', format: 'uuid' },
            tutor_id:   { type: 'string', format: 'uuid', nullable: true },
            itens:      {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  produto_id:  { type: 'string', format: 'uuid' },
                  quantidade:  { type: 'integer', example: 2 },
                  preco_unit:  { type: 'number', example: 189.90 },
                  subtotal:    { type: 'number', example: 379.80 },
                },
              },
            },
            total:      { type: 'number', example: 379.80 },
            criado_em:  { type: 'string', format: 'date-time' },
          },
        },
        VendaInput: {
          type: 'object',
          required: ['itens'],
          properties: {
            tutor_id: { type: 'string', format: 'uuid', nullable: true },
            itens: {
              type: 'array',
              items: {
                type: 'object',
                required: ['produto_id', 'quantidade'],
                properties: {
                  produto_id: { type: 'string', format: 'uuid' },
                  quantidade: { type: 'integer', minimum: 1, example: 2 },
                },
              },
            },
          },
        },
        Erro: {
          type: 'object',
          properties: {
            erro:      { type: 'string', example: 'Recurso não encontrado' },
            detalhes:  { type: 'string', example: 'Nenhum pet com esse ID foi localizado' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
