# 🪒 Sistema de Barbearia

Sistema completo para gerenciamento de barbearia com backend em Flask, frontend web e API RESTful integrada.

**🌐 Demo Online:** https://barbearia-gratuita.onrender.com  
**📡 Documentação da API:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🚀 Funcionalidades

### Para Clientes:
- ✅ **Cadastro de usuários** com validação
- 🔐 **Login seguro** com autenticação JWT
- 📅 **Agendamento de horários** em tempo real
- ⏰ **Consulta de horários disponíveis**
- 📱 **Interface responsiva** e moderna

### Para Administradores:
- 👨‍💼 **Painel administrativo** completo
- 🛠️ **Gerenciamento de serviços** (CRUD)
- 📊 **Visualização de agendamentos**
- 👥 **Controle de usuários**
- 💰 **Definição de preços** e emojis

### Técnicas:
- 🔒 **Senhas criptografadas** (Werkzeug)
- 🌐 **CORS habilitado** para frontend
- 📡 **API RESTful** completa
- 🗄️ **MongoDB** para persistência
- 🚀 **Deploy pronto** (Heroku/Render)

---

## 🔧 Tecnologias Utilizadas

### Backend:
- **Python 3.x**
- **Flask 3.0.3** - Framework web principal
- **MongoDB** - Banco de dados NoSQL
- **PyMongo 4.15.3** - Driver MongoDB
- **JWT (PyJWT)** - Autenticação por tokens
- **Werkzeug 3.0.3** - Segurança e utilitários
- **Flask-CORS 4.0.1** - Suporte CORS
- **Gunicorn 21.2.0** - Servidor de produção

### Frontend:
- **HTML5** - Estrutura
- **CSS3** - Estilização responsiva
- **JavaScript ES6** - Interatividade
- **Fetch API** - Comunicação com backend

---

## 📦 Instalação e Desenvolvimento Local

### Pré-requisitos:
- **Python 3.7+** ([Download](https://www.python.org/downloads/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community) ou use Docker)
- **Git** (opcional)

### 1. Clone o projeto:
```bash
git clone https://github.com/lacerdaRodrigo/Barbearia-Gratuita.git
cd Barbearia-Gratuita
```

### 2. Instale as dependências:
```bash
pip install -r requirements.txt
```

### 3. Configure o MongoDB:

**Opção A - MongoDB Local:**
```bash
# Inicie o serviço MongoDB
mongod
```

**Opção B - MongoDB via Docker:**
```bash
docker run -d -p 27017:27017 --name mongo mongo:6.0
```

### 4. Configure variáveis de ambiente (opcional):
```bash
# MongoDB (padrão: mongodb://localhost:27017/barbearia)
export MONGO_URI="mongodb://localhost:27017/barbearia"

# JWT Secret (recomendado para produção)
export JWT_SECRET_KEY="sua_chave_jwt_super_secreta"

# Configurações do servidor
export PORT=5000
export DEBUG=True
```

### 5. Execute a aplicação:
```bash
python app.py
```

**🎉 Pronto!** Acesse: http://localhost:5000

---

## 📁 Estrutura do Projeto

```
Barbearia-Gratuita/
│
├── app.py                 # 🚀 Aplicação principal
├── extensions.py          # 🔧 Configurações MongoDB
├── requirements.txt       # 📦 Dependências Python
├── Procfile              # 🌐 Deploy Heroku/Render
│
├── index.html            # 🌟 Interface do usuário
├── script.js             # ⚡ JavaScript frontend
├── styles.css            # 🎨 Estilos CSS
│
├── models/               # 📊 Modelos de dados
│   ├── admin.py          # 👨‍💼 Modelo administrador
│   ├── agendamento.py    # 📅 Modelo agendamento
│   ├── servico.py        # 🛠️ Modelo serviço
│   └── user.py           # 👤 Modelo usuário
│
├── routes/               # 🛣️ Rotas da API
│   ├── admin.py          # 👨‍💼 Rotas administrativas
│   ├── agendamento.py    # 📅 Rotas agendamentos
│   ├── cadastro.py       # 👤 Rotas usuários
│   ├── login.py          # 🔐 Rotas autenticação
│   └── servico.py        # 🛠️ Rotas serviços
│
└── tests/                # 🧪 Testes (Cypress)
    └── cypress/
```

---

## 🎯 Como Usar o Sistema

### 👤 **Para Usuários:**

1. **Acesse a aplicação** em http://localhost:5000
2. **Cadastre-se:**
   - Vá para aba "Cadastro"
   - Preencha: nome, email, telefone, senha
   - Clique em "Cadastrar"

3. **Faça Login:**
   - Vá para aba "Login"
   - Use seu email e senha
   - Clique em "Entrar"

4. **Agende um horário:**
   - Escolha o serviço desejado
   - Selecione data e horário
   - Confirme o agendamento

### 👨‍💼 **Para Administradores:**

1. **Crie conta de admin:**
   - Vá para aba "Admin"
   - Cadastre-se como administrador

2. **Faça login administrativo:**
   - Use suas credenciais de admin
   - Acesse o painel de controle

3. **Gerencie o sistema:**
   - Cadastre novos serviços
   - Defina preços e emojis
   - Visualize agendamentos
   - Gerencie usuários

---

## 🗄️ Banco de Dados

### Coleções criadas automaticamente:

- **`usuarios`** - Dados dos clientes
- **`agendamentos`** - Agendamentos realizados
- **`servicos`** - Catálogo de serviços
- **`admins`** - Administradores do sistema

### Serviços padrão (criados automaticamente):
- 💇‍♂️ Corte Masculino - R$ 25,00
- 💇‍♀️ Corte Feminino - R$ 35,00
- 🧔 Barba - R$ 20,00
- ✨ Corte + Barba - R$ 40,00
- 👨‍🦱 Bigode - R$ 15,00
- 🌪️ Escova - R$ 30,00
- 💧 Hidratação - R$ 45,00
- 🔥 Corte + Barba + Bigode - R$ 50,00

---

## ⏰ Funcionamento da Barbearia

**Horários de atendimento:**
- 🌅 **Manhã:** 08:00 às 11:30 (intervalos de 30min)
- 🌇 **Tarde:** 14:00 às 18:00 (intervalos de 30min)

**Sistema de agendamento:**
- ✅ Verificação automática de conflitos
- ⏱️ Horários em tempo real
- 📅 Agendamento por data específica

---

## 🌐 Deploy e Produção

### Heroku:
```bash
# Criar app
heroku create sua-barbearia

# Configurar variáveis
heroku config:set MONGO_URI="sua_mongodb_uri"
heroku config:set JWT_SECRET_KEY="sua_chave_jwt"

# Deploy
git push heroku main
```

### Render (atual):
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Docker:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

---

## 🔒 Segurança

- **🔐 Senhas:** Hash seguro com Werkzeug
- **🎟️ Autenticação:** JWT com expiração de 24h
- **🛡️ Validações:** Entrada de dados rigorosa
- **🌐 CORS:** Configurado para frontend
- **📝 Logs:** Sistema de logging para debug

---

## 🧪 Testes

O projeto inclui testes automatizados com Cypress:

```bash
cd tests/cypress
npm install
npm run test
```

---

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch: `git checkout -b feature/MinhaFeature`
3. **Commit** suas mudanças: `git commit -m 'Add: MinhaFeature'`
4. **Push** para a branch: `git push origin feature/MinhaFeature`
5. **Abra** um Pull Request

---

## 📞 Suporte e Documentação

- **🐛 Issues:** Reporte problemas no GitHub
- **📡 API:** Consulte [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **📚 Docs Flask:** https://flask.palletsprojects.com/
- **🗄️ MongoDB:** https://docs.mongodb.com/

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

**🚀 Sistema completo de barbearia - Do desenvolvimento ao deploy!**
