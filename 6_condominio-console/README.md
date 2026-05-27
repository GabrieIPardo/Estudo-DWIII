# condominio-console

Aplicação de console em Node.js para simular funcionalidades de um sistema de condomínio (cadastros, reservas, garagem, utensílios, etc.).

## Requisitos
- Node.js (versão LTS recomendada)
- npm (ou gerenciador equivalente)

## Instalação
```bash
npm install
```

## Execução
```bash
node index.js
```

> Se houver scripts no `package.json`, você também pode executar via `npm run <script>`.

## Estrutura básica
```
condominio-console/
├─ index.js
├─ package.json
├─ src/
│  ├─ Chat.js
│  ├─ Condomino.js
│  ├─ Database.js
│  ├─ Garagem.js
│  ├─ Reserva.js
│  ├─ SistemaCondominio.js
│  ├─ Unidade.js
│  └─ Utensilio.js
└─ docs/
```

## Observações
- Os módulos em `src/` encapsulam as regras e entidades do domínio.
- Ajuste ou complemente a documentação conforme a evolução do projeto.