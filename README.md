# 🪒 Sistema de Barbearia

Sistema web para gerenciamento de barbearia com funcionalidades de cadastro, login, agendamento de horários e painel administrativo.

## 📋 Pré-requisitos

Antes de executar o projeto, certifique-se de ter os seguintes softwares instalados:

### 1. Python 3.7 ou superior

- **Download:** [https://www.python.org/downloads/](https://www.python.org/downloads/)
- **Versão recomendada:** Python 3.9 ou superior
- **Como verificar:**
  ```bash
  python --version
  ```

### 2. MongoDB 6.0 ou superior

- **Download:** [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- **Docker (alternativa):**
  ```bash
  docker run -d -p 27017:27017 --name mongo mongo:6.0
  ```

### 3. pip (Gerenciador de pacotes do Python)

- Geralmente já vem instalado com o Python
- **Como verificar:**
  ```bash
  pip --version
  ```

### 4. Git (Opcional, para clonar o repositório)

- **Download:** [https://git-scm.com/downloads](https://git-scm.com/downloads)

## 🚀 Instalação e Configuração

### 1. Clone ou baixe o projeto

```bash
git clone https://github.com/lacerdaRodrigo/Barbearia-Gratuita.git
cd Barbearia-Gratuita
```

### 2. Instale as dependências Python

```bash
pip install -r requirements.txt
```

**Principais dependências:**

- **Flask** - Framework web para Python
- **Flask-CORS** - Para permitir requisições do frontend
- **PyMongo** - Driver MongoDB para Python
- **Flask-PyMongo** - Integração MongoDB com Flask
- **Werkzeug** - Para hash de senhas
- **Gunicorn** - Servidor WSGI para produção

### 3. Estrutura do projeto

```
Barbearia-Gratuita/
│
├── app.py                 # Arquivo principal da aplicação
├── extensions.py         # Configurações do MongoDB
├── requirements.txt      # Dependências do projeto
├── index.html           # Interface do usuário
├── script.js            # JavaScript do frontend
├── styles.css           # Estilos CSS
├── Procfile             # Configuração para deploy
│
├── models/              # Modelos de dados
│   ├── admin.py         # Modelo de administrador
│   ├── agendamento.py   # Modelo de agendamento
│   ├── servico.py      # Modelo de serviço
│   └── user.py         # Modelo de usuário
│
└── routes/              # Rotas da API
    ├── admin.py         # Rotas administrativas
    ├── agendamento.py  # Rotas de agendamento
    ├── cadastro.py     # Rotas de cadastro
    ├── login.py        # Rotas de autenticação
    └── servico.py      # Rotas de serviços
```

## ▶️ Como executar o projeto

### 1. Inicie o MongoDB

Se estiver usando MongoDB local:

```bash
# Verifique se o serviço está rodando
mongod
```

Se estiver usando Docker:

```bash
docker run -d -p 27017:27017 --name mongo mongo:6.0
```

### 2. Execute a aplicação

No terminal, dentro da pasta do projeto:

```bash
python app.py
```

### 3. Acesse no navegador

```
http://localhost:5000
```

## 🛠️ Funcionalidades

- ✅ **Cadastro de usuários** - Registro com nome, email, telefone e senha
- ✅ **Login seguro** - Autenticação com hash de senha
- ✅ **Painel administrativo** - Gerenciamento de serviços e horários
- ✅ **Sistema de agendamentos** - Marcação de horários pelos clientes
- ✅ **Gestão de serviços** - Cadastro e edição de serviços oferecidos
- ✅ **Interface responsiva** - Design moderno e funcional
- ✅ **Banco MongoDB** - Armazenamento escalável e flexível
- ✅ **Validações** - Verificação de dados de entrada

## � Como usar

### Usuários comuns:

1. **Cadastro:**

   - Acesse a aba "Cadastro"
   - Preencha seus dados
   - Clique em "Cadastrar"

2. **Login:**

   - Use seu email e senha
   - Clique em "Entrar"

3. **Agendamentos:**
   - Escolha o serviço desejado
   - Selecione data e horário
   - Confirme o agendamento

### Administradores:

1. **Acesso administrativo:**

   - Acesse a aba "Admin"
   - Faça login com credenciais de administrador

2. **Gerenciamento:**
   - Cadastre novos serviços
   - Gerencie horários disponíveis
   - Visualize agendamentos
   - Cadastre outros administradores

## 🌐 API Endpoints

### Autenticação

- `POST /login` - Login de usuário
- `POST /admin/login` - Login de administrador

### Usuários

- `POST /cadastro` - Criar novo usuário
- `GET /user/<id>` - Buscar usuário por ID

### Administração

- `POST /admin` - Criar novo administrador
- `GET /admin/<id>` - Buscar administrador por ID

### Serviços

- `GET /servicos` - Listar todos os serviços
- `POST /servicos` - Criar novo serviço
- `PUT /servicos/<id>` - Atualizar serviço
- `DELETE /servicos/<id>` - Remover serviço

### Agendamentos

- `GET /agendamentos` - Listar agendamentos
- `POST /agendamentos` - Criar agendamento
- `DELETE /agendamentos/<id>` - Cancelar agendamento

## 🔧 Solução de Problemas

### Erro de conexão com MongoDB

- Verifique se o MongoDB está rodando
- Confirme a porta 27017 está livre
- Verifique as credenciais de acesso

### Erros de CORS

- O Flask-CORS está configurado
- Verifique se está acessando pela URL correta

### Página não carrega

- Verifique os logs no terminal
- Confirme que o MongoDB está acessível
- Certifique-se que está na URL correta

## 📝 Desenvolvimento

### Stack Tecnológica

- **Backend:**

  - Flask (Python)
  - MongoDB
  - PyMongo
  - Werkzeug

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript vanilla
  - Fetch API

### Adicionando Novas Funcionalidades

1. **Modelos:** Adicione em `models/`
2. **Rotas:** Crie em `routes/`
3. **Frontend:** Modifique `index.html`, `script.js`, `styles.css`

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Em caso de dúvidas ou problemas:

- Abra uma issue no GitHub
- Verifique os logs no terminal
- Consulte a documentação:
  - [Flask](https://flask.palletsprojects.com/)
  - [PyMongo](https://pymongo.readthedocs.io/)
  - [MongoDB](https://docs.mongodb.com/)

---

**Desenvolvido por Rodrigo Lacerda**
