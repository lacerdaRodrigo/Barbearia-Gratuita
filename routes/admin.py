from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import mongo
from models.admin import AdminBarbearia
from pymongo.errors import DuplicateKeyError, ServerSelectionTimeoutError, AutoReconnect
from models.admin import AdminBarbearia

blueprint_admin = Blueprint('admin', __name__)

@blueprint_admin.route('/admin' , methods=['POST'])
def criar_admin():
    try:
        dados_recebidos = request.get_json()

        nome = dados_recebidos.get('nome')
        email = dados_recebidos.get('email')
        senha = dados_recebidos.get('senha')

        if not nome:
            return jsonify({"mensagem": "Nome é obrigatório."}), 400

        if not email:
            return jsonify({"mensagem": "Email é obrigatório."}), 400
        
        if not senha:
            return jsonify({"mensagem": "Senha é obrigatória."}), 400

        # Verificar se email já existe
        admins_collection = mongo.db.admins
        admin_existente = admins_collection.find_one({"email": email})
        
        if admin_existente:
            return jsonify({"mensagem": "Email já cadastrado para outro administrador."}), 409

        hash_da_senha = generate_password_hash(senha)

        # Criar documento do admin
        documento_admin = AdminBarbearia.criar_documento(
            nome=nome,
            email=email,
            senha=hash_da_senha
        )
        
        # Inserir no MongoDB
        result = admins_collection.insert_one(documento_admin)

        return jsonify({"mensagem": "Administrador criado com sucesso!"}), 201

    except DuplicateKeyError:
        return jsonify({"mensagem": "Email já cadastrado para outro administrador."}), 409
    except (ServerSelectionTimeoutError, AutoReconnect) as conn_err:
        print(f"Erro de conexão com o Mongo ao criar admin: {conn_err}")
        return jsonify({"mensagem": "Serviço de banco de dados indisponível. Tente novamente mais tarde."}), 503
    except Exception as erro:
        print(f"Erro ao criar admin: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor."}), 500

@blueprint_admin.route('/admin/login', methods=['POST'])
def login_admin():
    try:
        dados_recebidos = request.get_json()
        email = dados_recebidos.get('email')
        senha = dados_recebidos.get('senha')

        if not email or not senha:
            return jsonify({"mensagem": "Email e senha são obrigatórios."}), 400

        # Buscar admin no banco
        admins_collection = mongo.db.admins
        admin_encontrado = admins_collection.find_one({"email": email})

        if admin_encontrado and check_password_hash(admin_encontrado['senha'], senha):
            return jsonify({
                "mensagem": "Login de admin realizado com sucesso!",
                "admin": {
                    "id": str(admin_encontrado["_id"]),
                    "nome": admin_encontrado["nome"],
                    "email": admin_encontrado["email"]
                }
            }), 200
        else:
            return jsonify({"mensagem": "Credenciais inválidas."}), 401

    except Exception as erro:
        print(f"Erro no login do admin: {erro}")
        if isinstance(erro, (ServerSelectionTimeoutError, AutoReconnect)):
            return jsonify({"mensagem": "Serviço de banco de dados indisponível. Tente novamente mais tarde."}), 503
        return jsonify({"mensagem": "Erro interno do servidor."}), 500

@blueprint_admin.route('/admin/usuarios', methods=['GET'])
def listar_usuarios():
    try:
        admin_collection = mongo.db.admins
        admin_cursor = admin_collection.find({})

        admin_lista = []
        for admin_doc in admin_cursor:
            admin_dict = AdminBarbearia.to_dict(admin_doc)
            if admin_dict:
                admin_lista.append(admin_dict)

        return jsonify(admin_lista), 200
    
    except Exception as erro:
        print(f"Erro ao listar usuários: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor, ao listar usuarios cadastrados"}), 500

@blueprint_admin.route('/admin/usuarios/delete', methods=['DELETE'])
def delete_admin():
    try:
        admins_collection = mongo.db.admins

        resultado = admins_collection.delete_many({})
        return jsonify({"mensagem": f"{resultado.deleted_count} usuários deletados."}), 200
    
    except Exception as erro:
        print(f"Erro ao deletar usuários: {erro}")
        if isinstance(erro, (ServerSelectionTimeoutError, AutoReconnect)):
            return jsonify({"mensagem": "Serviço de banco de dados indisponível. Tente novamente mais tarde."}), 503
        return jsonify({"mensagem": "Erro interno do servidor."}), 500

@blueprint_admin.route('/admin/usuarios/<nome>', methods=['DELETE'])
def deletar_admin_nome(nome):
    try:
        nome_collection = mongo.db.admins

        resultado = nome_collection.delete_one({"nome": nome})

        if resultado.deleted_count == 0:
            return jsonify({"mensagem": "Usuario não encotrado"}), 404
        
        return jsonify({"mensagem": "usuario deletado com sucesso"}), 200
    
    except Exception as erro:
        if "Invalid ObjectId" in str(erro):
             return jsonify({"mensagem": "ID de usuário inválido."}), 400
             
        print(f"Erro ao deletar usuário: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor ao deletar usuário."}), 500