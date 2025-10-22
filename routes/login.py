from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from extensions import mongo
import jwt
from datetime import datetime, timedelta
import os

blueprint_login = Blueprint('login', __name__)

# 1. Função Utilitária para Geração do Token (SEM @route)
import os
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', "sua_chave_super_secreta_e_longa") # Use uma chave forte e armazene como variável de ambiente!

def criar_access_token(user_id, nome_usuario=None):
    """Gera o JWT com a ID do usuário e tempo de expiração."""
    to_encode = {
        "sub": str(user_id),
        "nome": nome_usuario,  # Opcional: incluir nome no token para uso no frontend
        "exp": datetime.utcnow() + timedelta(hours=24),  # Token válido por 24 horas
        "iat": datetime.utcnow()  # Data de criação do token
    }
    token = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return token

def verificar_token(token):
    """Verifica e decodifica o JWT. Retorna os dados do usuário ou None se inválido."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token expirado
    except jwt.InvalidTokenError:
        return None  # Token inválido

# 2. Rota de Login: Usando a função com a lógica de verificação
@blueprint_login.route('/login', methods=['POST'])
def entrar():
    try:
        dados_recebidos = request.get_json()
        email_usuario = dados_recebidos.get('email')
        senha_informada = dados_recebidos.get('senha')

        # Se faltar e-mail ou senha, retorna erro.
        if not email_usuario or not senha_informada:
            return jsonify({
                "success": False,
                "message": "E-mail e senha são obrigatórios."
            }), 400

        
        # 1. Buscar o usuário no banco de dados pelo email
        usuarios_collection = mongo.db.usuarios
        usuario_encontrado = usuarios_collection.find_one({"email": email_usuario})

        # 2. Verificar se o usuário existe E se a senha confere
        if usuario_encontrado and check_password_hash(usuario_encontrado['senha_hash'], senha_informada):
            
            # SUCESSO: CREDENCIAIS VÁLIDAS. CHAME A FUNÇÃO UTILIÁRIA!
            user_id = usuario_encontrado['_id']
            nome_usuario = usuario_encontrado.get('nome', 'Usuário')  # Nome para o token
            token = criar_access_token(user_id, nome_usuario)
            
            # RESPOSTA SEGURA: Apenas token, sem dados sensíveis
            return jsonify({
                "success": True,
                "message": "Login realizado com sucesso!",
                "access_token": token,
                "token_type": "Bearer",
                "expires_in": 86400  # 24 horas em segundos
            }), 200
            
        else:
            # FALHA! E-mail não encontrado ou senha incorreta.
            return jsonify({
                "success": False,
                "message": "Credenciais inválidas."
            }), 401

    except Exception as erro:
        print(f"Erro ao processar login: {erro}")
        return jsonify({
            "success": False,
            "message": "Erro interno do servidor."
        }), 500