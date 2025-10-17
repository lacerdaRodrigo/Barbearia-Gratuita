from flask import Blueprint, request, jsonify
from extensions import mongo
from models.servico import Servico
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from datetime import datetime

blueprint_servico = Blueprint('servico', __name__)

@blueprint_servico.route('/admin/servicos', methods=['GET'])
def listar_servicos():
    try:
        servicos_collection = mongo.db.servicos
        servicos_cursor = servicos_collection.find({})
        
        servicos_lista = []
        for servico_doc in servicos_cursor:
            servico_dict = Servico.to_dict(servico_doc)
            if servico_dict:
                servicos_lista.append(servico_dict)
        
        return jsonify({
            "servicos": servicos_lista,
            "total": len(servicos_lista)
        }), 200

    except Exception as erro:
        print(f"Erro ao listar serviços: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor."}), 500


@blueprint_servico.route('/admin/servicos', methods=['POST'])
def criar_servico():
    try:
        dados_recebidos = request.get_json()

        nome = dados_recebidos.get('nome')
        preco = dados_recebidos.get('preco')
        emoji = dados_recebidos.get('emoji', '🔧')

        if not nome:
            return jsonify({"mensagem": "Nome do serviço é obrigatório."}), 400

        if not preco:
            return jsonify({"mensagem": "Preço é obrigatório."}), 400

        try:
            preco = float(preco)
            if preco <= 0:
                return jsonify({"mensagem": "Preço deve ser maior que zero."}), 400
        except ValueError:
            return jsonify({"mensagem": "Preço deve ser um número válido."}), 400

        # Verificar se já existe serviço com mesmo nome
        servicos_collection = mongo.db.servicos
        servico_existente = servicos_collection.find_one({"nome": nome})
        
        if servico_existente:
            return jsonify({"mensagem": "Já existe um serviço com este nome."}), 409

        # Criar documento do serviço
        documento_servico = Servico.criar_documento(
            nome=nome,
            preco=preco,
            emoji=emoji
        )
        
        # Inserir no MongoDB
        result = servicos_collection.insert_one(documento_servico)
        
        # Buscar o documento inserido para retornar
        servico_criado = servicos_collection.find_one({"_id": result.inserted_id})
        servico_dict = Servico.to_dict(servico_criado)

        return jsonify({
            "mensagem": "Serviço criado com sucesso!",
            "servico": servico_dict
        }), 201

    except Exception as erro:
        print(f"Erro ao criar serviço: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor."}), 500


@blueprint_servico.route('/admin/servicos/<string:servico_id>', methods=['PUT'])
def atualizar_servico(servico_id):
    try:
        # Converter string para ObjectId
        try:
            object_id = ObjectId(servico_id)
        except:
            return jsonify({"mensagem": "ID de serviço inválido."}), 400

        servicos_collection = mongo.db.servicos
        servico_existente = servicos_collection.find_one({"_id": object_id})
        
        if not servico_existente:
            return jsonify({"mensagem": "Serviço não encontrado."}), 404

        dados_recebidos = request.get_json()
        
        # Preparar campos para atualização
        campos_atualizacao = {"updated_at": datetime.utcnow()}

        nome = dados_recebidos.get('nome')
        preco = dados_recebidos.get('preco')
        emoji = dados_recebidos.get('emoji')
        ativo = dados_recebidos.get('ativo')

        if nome is not None:
            # Verificar se outro serviço já tem esse nome
            outro_servico = servicos_collection.find_one({
                "nome": nome,
                "_id": {"$ne": object_id}
            })
            if outro_servico:
                return jsonify({"mensagem": "Já existe um serviço com este nome."}), 409
            campos_atualizacao["nome"] = nome
        
        if preco is not None:
            try:
                preco = float(preco)
                if preco <= 0:
                    return jsonify({"mensagem": "Preço deve ser maior que zero."}), 400
                campos_atualizacao["preco"] = preco
            except ValueError:
                return jsonify({"mensagem": "Preço deve ser um número válido."}), 400
        
        if emoji is not None:
            campos_atualizacao["emoji"] = emoji
            
        if ativo is not None:
            campos_atualizacao["ativo"] = bool(ativo)

        # Atualizar no MongoDB
        result = servicos_collection.update_one(
            {"_id": object_id},
            {"$set": campos_atualizacao}
        )
        
        if result.modified_count == 0:
            return jsonify({"mensagem": "Nenhuma alteração foi feita."}), 400

        # Buscar o documento atualizado
        servico_atualizado = servicos_collection.find_one({"_id": object_id})
        servico_dict = Servico.to_dict(servico_atualizado)

        return jsonify({
            "mensagem": "Serviço atualizado com sucesso!",
            "servico": servico_dict
        }), 200

    except Exception as erro:
        print(f"Erro ao atualizar serviço: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor."}), 500


@blueprint_servico.route('/admin/servicos/<string:servico_id>', methods=['DELETE'])
def deletar_servico(servico_id):
    try:
        # Converter string para ObjectId
        try:
            object_id = ObjectId(servico_id)
        except:
            return jsonify({"mensagem": "ID de serviço inválido."}), 400

        servicos_collection = mongo.db.servicos
        result = servicos_collection.delete_one({"_id": object_id})
        
        if result.deleted_count == 0:
            return jsonify({"mensagem": "Serviço não encontrado."}), 404

        return jsonify({"mensagem": "Serviço deletado com sucesso!"}), 200

    except Exception as erro:
        print(f"Erro ao deletar serviço: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor."}), 500


@blueprint_servico.route('/servicos', methods=['GET'])
def listar_servicos_publicos():
    """Endpoint público para listar serviços ativos (para o formulário de agendamento)"""
    try:
        servicos_collection = mongo.db.servicos
        servicos_cursor = servicos_collection.find({"ativo": True})
        
        servicos_lista = []
        for servico_doc in servicos_cursor:
            servico_dict = Servico.to_dict(servico_doc)
            if servico_dict:
                servicos_lista.append(servico_dict)
        
        return jsonify(servicos_lista), 200

    except Exception as erro:
        print(f"Erro ao listar serviços públicos: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor."}), 500