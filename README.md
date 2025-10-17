# Barbearia-Gratuita# 🪒 Sistema de Barbearia

Sistema web para gerenciamento de barbearia com funcionalidades de cadastro, login e agendamento de horários.

## 📋 Pré-requisitos

Antes de executar o projeto, certifique-se de ter os seguintes softwares instalados em seu computador:

### 1. Python 3.7 ou superior

- **Download:** [https://www.python.org/downloads/](https://www.python.org/downloads/)
- **Versão recomendada:** Python 3.9 ou superior
- **Como verificar se já está instalado:**
  ```bash
  python --version
  ```
  ou
  ```bash
  python3 --version
  ```

### 2. pip (Gerenciador de pacotes do Python)

- Geralmente já vem instalado com o Python
- **Como verificar:**
  ```bash
  pip --version
  ```

### 3. Git (Opcional, para clonar o repositório)

- **Download:** [https://git-scm.com/downloads](https://git-scm.com/downloads)

## 🚀 Instalação e Configuração

### 1. Clone ou baixe o projeto

```bash
git clone https://github.com/seu-usuario/barbearia.git
cd barbearia
```

Ou baixe o arquivo ZIP e extraia em uma pasta de sua preferência.

### 2. Instale as dependências Python

**Opção 1 (Recomendada) - Usando requirements.txt:**

```bash
pip install -r requirements.txt
```

**Opção 2 - Instalação manual:**

```bash
pip install Flask Flask-SQLAlchemy Flask-CORS Werkzeug
```

**Dependências necessárias:**

- **Flask** - Framework web para Python
- **Flask-SQLAlchemy** - ORM para banco de dados
- **Flask-CORS** - Para permitir requisições do frontend
- **Werkzeug** - Para hash de senhas (já vem com Flask)

### 3. Verifique a estrutura do projeto

Certifique-se de que a estrutura está assim:

```
barbearia/
│
├── app.py                 # Arquivo principal da aplicação
├── extensions.py          # Configurações do banco de dados
├── requirements.txt      # Dependências do projeto
├── index.html            # Interface do usuário
├── script.js             # JavaScript do frontend
├── styles.css            # Estilos CSS
├── models/
│   ├── user.py           # Modelo de usuário
│   └── agendamento.py    # Modelo de agendamento
└── routes/
    ├── cadastro.py       # Rotas de cadastro
    └── login.py          # Rotas de login
```

## ▶️ Como executar o projeto

### 1. Execute a aplicação

No terminal, dentro da pasta do projeto, execute:

```bash
python app.py
```

### 2. Acesse no navegador

Abra seu navegador e acesse:

```
http://localhost:5000
```

## 🛠️ Funcionalidades

- ✅ **Cadastro de usuários** - Registro com nome, email, telefone e senha
- ✅ **Login seguro** - Autenticação com hash de senha
- ✅ **Interface responsiva** - Design moderno e funcional
- ✅ **Banco de dados SQLite** - Armazenamento local automático
- ✅ **Validações** - Verificação de dados de entrada
- 🚧 **Sistema de agendamentos** - Em desenvolvimento

## 💾 Banco de Dados

O projeto utiliza **SQLite** que é criado automaticamente na primeira execução. O arquivo `barbearia.db` será gerado na pasta do projeto.

## 🌐 Navegadores Suportados

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📱 Como usar

1. **Primeiro acesso:**

   - Clique na aba "Cadastro"
   - Preencha seus dados (nome, email, telefone, senha)
   - Clique em "Cadastrar"

2. **Login:**

   - Use seu email e senha cadastrados
   - Clique em "Entrar"

3. **Dashboard:**
   - Após o login, você verá a área do usuário
   - Funcionalidades de agendamento estarão disponíveis em breve

## 🔧 Solução de Problemas

### Erro: "ModuleNotFoundError"

- Certifique-se de que instalou todas as dependências:
  ```bash
  pip install Flask Flask-SQLAlchemy Flask-CORS
  ```

### Erro: "Port already in use"

- Outra aplicação está usando a porta 5000
- Pare outros processos ou mude a porta no arquivo `app.py`

### Página não carrega

- Verifique se o Python está executando sem erros
- Confirme que está acessando `http://localhost:5000`
- Verifique o terminal para mensagens de erro

### Problemas de CORS

- O Flask-CORS já está configurado
- Se persistir, verifique se está acessando pela URL correta

## 📝 Desenvolvimento

### Estrutura do Código

- **Backend:** Flask (Python)

  - Rotas organizadas em Blueprints
  - SQLAlchemy para ORM
  - Werkzeug para segurança

- **Frontend:** HTML, CSS, JavaScript vanilla
  - Interface responsiva
  - Validações do lado cliente
  - Comunicação via Fetch API

### Adicionando Novas Funcionalidades

1. Modelos: Adicione em `models/`
2. Rotas: Crie em `routes/`
3. Frontend: Modifique `index.html`, `script.js`, `styles.css`

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Em caso de dúvidas ou problemas:

- Abra uma issue no GitHub
- Verifique os logs no terminal
- Consulte a documentação do Flask: [https://flask.palletsprojects.com/](https://flask.palletsprojects.com/)

---

**Desenvolvido por Rodrigo Lacerda**
