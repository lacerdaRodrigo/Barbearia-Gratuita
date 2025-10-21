from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from extensions import mongo
import jwt
from datetime import datetime, timedelta

blueprint_login = Blueprint('login', __name__)

# 1. Função Utilitária para Geração do Token (SEM @route)
SECRET_KEY = "sua_chave_super_secreta_e_longa" # Use uma chave forte e armazene como variável de ambiente!

def criar_access_token(user_id):
    """Gera o JWT com a ID do usuário e tempo de expiração."""
    to_encode = {
        "sub": str(user_id), 
        "exp": datetime.utcnow() + timedelta(minutes=30)
    }
    token = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return token

# 2. Rota de Login: Usando a função com a lógica de verificação
@blueprint_login.route('/login', methods=['POST'])
def entrar():
    try:
        dados_recebidos = request.get_json()
        email_usuario = dados_recebidos.get('email')
        senha_informada = dados_recebidos.get('senha')

        # Se faltar e-mail ou senha, retorna erro.
        if not email_usuario or not senha_informada:
            return jsonify({"mensagem": "E-mail e senha são obrigatórios."}), 400

        
        # 1. Buscar o usuário no banco de dados pelo email
        usuarios_collection = mongo.db.usuarios
        usuario_encontrado = usuarios_collection.find_one({"email": email_usuario})

        # 2. Verificar se o usuário existe E se a senha confere
        if usuario_encontrado and check_password_hash(usuario_encontrado['senha_hash'], senha_informada):
            
            # SUCESSO: CREDENCIAIS VÁLIDAS. CHAME A FUNÇÃO UTILIÁRIA!
            user_id = usuario_encontrado['_id']
            token = criar_access_token(user_id) # <<-- CHAMADA CORRETA
            
            return jsonify({
                "mensagem": "Login bem-sucedido e seguro!",
                "access_token": token,
                "token_type": "Bearer",
                "usuario": {
                    "nome": usuario_encontrado.get('nome', 'Usuário'),
                    "email": usuario_encontrado['email']
                }
            }), 200
            
        else:
            # FALHA! E-mail não encontrado ou senha incorreta.
            return jsonify({"mensagem": "E-mail ou senha inválidos."}), 401

    except Exception as erro:
        print(f"Erro ao processar login: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor."}), 500