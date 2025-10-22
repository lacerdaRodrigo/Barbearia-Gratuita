from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash
from extensions import mongo
from models.user import Usuario
from pymongo.errors import DuplicateKeyError
from bson.objectid import ObjectId

blueprint_cadastro = Blueprint('cadastro', __name__)


# -------------------------------------------------------------
# 3. Rotas da API
# -------------------------------------------------------------

# Rota principal para servir o HTML
@blueprint_cadastro.route('/')
def pagina_inicial():
    return send_from_directory('.', 'index.html')

# Rota para servir arquivos estáticos (CSS, JS)
@blueprint_cadastro.route('/<path:nome_arquivo>')
def arquivos_estaticos(nome_arquivo):
    return send_from_directory('.', nome_arquivo)


# Rota para cadastrar um novo usuário
@blueprint_cadastro.route('/cadastro', methods=['POST'])
def cadastro():
    try:
        dados_recebidos = request.get_json()
        nome_usuario = dados_recebidos.get('nome')
        email_usuario = dados_recebidos.get('email')
        telefone_usuario = dados_recebidos.get('telefone')
        senha_usuario = dados_recebidos.get('senha')

        if not nome_usuario:
            return jsonify({"mensagem": "Nome de usuário é obrigatório."}), 400

        if not email_usuario or not senha_usuario:
            return jsonify({"mensagem": "Email e senha são obrigatórios para dar sequência"}), 400

        # Validar telefone
        if not telefone_usuario:
            return jsonify({"mensagem": "Telefone é obrigatório."}), 400
        
        telefone_limpo = ''.join(filter(str.isdigit, telefone_usuario))
        
        if not telefone_limpo.isdigit():
            return jsonify({"mensagem": "Telefone deve ser numérico."}), 400
            
        if len(telefone_limpo) < 10 or len(telefone_limpo) > 15:
            return jsonify({"mensagem": "Telefone deve ter entre 10 e 15 dígitos."}), 400

        # Verificar se email já existe
        usuarios_collection = mongo.db.usuarios
        usuario_existente = usuarios_collection.find_one({"email": email_usuario})
        
        if usuario_existente:
            return jsonify({"mensagem": "Email já cadastrado."}), 409

        # Gerar hash da senha
        hash_da_senha = generate_password_hash(senha_usuario)

        # Criar documento do usuário
        documento_usuario = Usuario.criar_documento(
            nome=nome_usuario,
            email=email_usuario,
            telefone=telefone_limpo,
            senha_hash=hash_da_senha
        )
        
        # Inserir no MongoDB
        result = usuarios_collection.insert_one(documento_usuario)

        return jsonify({"mensagem": f"Usuário com o email: {email_usuario} cadastrado com sucesso!"}), 201

    except DuplicateKeyError:
        return jsonify({"mensagem": "Email já cadastrado."}), 409
    except Exception as erro:
        print(f"Erro no cadastro: {erro}") 
        return jsonify({"mensagem": "Erro interno do servidor. Verifique o console."}), 500


@blueprint_cadastro.route('/cadastro', methods=['GET'])
def lista_usuarios():
    try:
        usuarios_collection = mongo.db.usuarios
        usuarios_cursor = usuarios_collection.find({})

        usuarios_lista = []
        for usuario_doc in usuarios_cursor:
            usuario_dict = Usuario.to_dict(usuario_doc)
            if usuario_dict:
                usuarios_lista.append(usuario_dict)
                
        return jsonify(usuarios_lista), 200

    except Exception as erro:
        print(f"Erro ao listar usuários: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor, ao listar usuarios cadastrados"}), 500

@blueprint_cadastro.route('/cadastro/<id_usuario>', methods=['DELETE'])
def deletar_usuario(id_usuario):
    try:
        id_objeto = ObjectId(id_usuario)

        usuarios_collection = mongo.db.usuarios

        resultado = usuarios_collection.delete_one({"_id": id_objeto})

        if resultado.deleted_count == 0:
            return jsonify({"mensagem": "Usuário não encontrado."}), 404
        
        return jsonify({"mensagem": "Usuário deletado com sucesso."}), 200
    
    except Exception as erro:
        if "Invalid ObjectId" in str(erro):
             return jsonify({"mensagem": "ID de usuário inválido."}), 400
             
        print(f"Erro ao deletar usuário: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor ao deletar usuário."}), 500
    
@blueprint_cadastro.route('/cadastro/deletar_todos', methods=['DELETE'])
def deletar_todos_usuarios():
    try:
        usuarios_collection = mongo.db.usuarios

        resultado = usuarios_collection.delete_many({})

        return jsonify({"mensagem": f"Todos os usuários deletados com sucesso. Total deletado: {resultado.deleted_count}"}), 200
    
    except Exception as erro:
        print(f"Erro ao deletar todos os usuários: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor ao deletar todos os usuários."}), 500 