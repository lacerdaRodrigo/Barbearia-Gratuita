from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from extensions import mongo
from models.user import Usuario

blueprint_login = Blueprint('login', __name__)


# Rota de Login
@blueprint_login.route('/login', methods=['POST'])
def entrar():
    try:
        dados_recebidos = request.get_json()
        email_usuario = dados_recebidos.get('email')
        senha_informada = dados_recebidos.get('senha')

        if not email_usuario or not senha_informada:
            return jsonify({"mensagem": "Login ou senha inválidos."}), 401

        # 1. Buscar o usuário no banco de dados pelo email
        usuarios_collection = mongo.db.usuarios
        usuario_encontrado = usuarios_collection.find_one({"email": email_usuario})

        # 2. Verificar se o usuário existe E se a senha confere
        if usuario_encontrado and check_password_hash(usuario_encontrado['senha_hash'], senha_informada):
            return jsonify({
                "mensagem": "Login bem-sucedido e seguro!",
                "usuario": {
                    "nome": usuario_encontrado.get('nome', 'Usuário'),
                    "email": usuario_encontrado['email']
                }
            }), 200
        else:
            return jsonify({"mensagem": "Login ou senha inválidos."}), 401

    except Exception as erro:
        print(f"Erro ao processar login: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor."}), 500

