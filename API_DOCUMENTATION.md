# 📡 API Barbearia - Documentação

API RESTful para gerenciamento de barbearia.

**🌐 URL da API:** `https://barbearia-gratuita.onrender.com`

> **🚀 Pronto para usar!** Não precisa instalar nada - use diretamente pelo link acima.

---

## ⚡ Uso Imediato

**✅ API Online:** Use diretamente sem instalação  
**🔧 Desenvolvimento Local:** Apenas se quiser modificar o código

### Para desenvolvimento local (opcional):
```bash
pip install -r requirements.txt
export MONGO_URI="mongodb://localhost:27017/[nome_db]"
export JWT_SECRET_KEY="[sua_chave_jwt]"
python app.py
```

---

## 🌐 Endpoints Principais

### 👤 **Usuários**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/cadastro` | Cadastrar usuário |
| `GET` | `/cadastro` | Listar usuários |
| `DELETE` | `/cadastro/<nome>` | Deletar usuário |

### 🔐 **Autenticação**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/login` | Login de usuário |

### 📅 **Agendamentos**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/agendamento` | Criar agendamento |
| `GET` | `/agendamento` | Listar agendamentos |
| `DELETE` | `/agendamento/<id>` | Cancelar agendamento |
| `GET` | `/horarios-disponiveis?data=YYYY-MM-DD` | Horários livres |

### 🛠️ **Serviços**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/servicos` | Listar serviços (público) |
| `GET` | `/admin/servicos` | Listar todos serviços |
| `POST` | `/admin/servicos` | Criar serviço |
| `PUT` | `/admin/servicos/<id>` | Atualizar serviço |
| `DELETE` | `/admin/servicos/<id>` | Deletar serviço |

### 👨‍💼 **Admin**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/admin` | Cadastrar admin |
| `POST` | `/admin/login` | Login admin |

---

## 📝 Exemplos de Uso

### **Cadastrar Usuário**
```bash
curl -X POST https://barbearia-gratuita.onrender.com/cadastro \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","email":"joao@teste.com","telefone":"11999999999","senha":"123456"}'
```

### **Login**
```bash
curl -X POST https://barbearia-gratuita.onrender.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@teste.com","senha":"123456"}'
```

### **Criar Agendamento**
```bash
curl -X POST https://barbearia-gratuita.onrender.com/agendamento \
  -H "Content-Type: application/json" \
  -d '{"nome_do_cliente":"João","tipo_de_servico":"Corte Masculino","data_e_hora":"2025-10-30 14:30"}'
```

### **Ver Horários Disponíveis**
```bash
curl "https://barbearia-gratuita.onrender.com/horarios-disponiveis?data=2025-10-30"
```

### **Listar Serviços**
```bash
curl https://barbearia-gratuita.onrender.com/servicos
```

---

## 🔒 Autenticação JWT

1. Faça login: `POST /login`
2. Use o token retornado no header: `Authorization: Bearer [token]`
3. **Validade:** 24 horas

---

## � Dados de Exemplo

### **Cadastro de Usuário**
```json
{
  "nome": "Maria Silva",
  "email": "maria@exemplo.com",
  "telefone": "11987654321",
  "senha": "minhasenha"
}
```

### **Agendamento**
```json
{
  "nome_do_cliente": "Maria Silva",
  "tipo_de_servico": "Corte Feminino",
  "data_e_hora": "2025-10-30 15:00"
}
```

### **Novo Serviço (Admin)**
```json
{
  "nome": "Corte Premium",
  "preco": 45.00,
  "emoji": "✨"
}
```

---

## ⏰ Horários Disponíveis

- **Manhã:** 08:00 - 11:30 (intervalos de 30min)
- **Tarde:** 14:00 - 18:00 (intervalos de 30min)

---

## 🎯 Códigos HTTP

| Código | Status |
|--------|---------|
| `200` | ✅ Sucesso |
| `201` | ✅ Criado |
| `400` | ❌ Dados inválidos |
| `401` | ❌ Não autorizado |
| `404` | ❌ Não encontrado |
| `409` | ❌ Conflito |
| `500` | ❌ Erro servidor |

---

**🚀 API Pronta para Usar:** https://barbearia-gratuita.onrender.com  
**💡 Dica:** Teste todos os endpoints diretamente - sem instalação necessária!