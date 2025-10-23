from flask import Blueprint, request, jsonify
from extensions import mongo
from models.agendamento import Agendamento
from bson import ObjectId  
from pymongo.errors import DuplicateKeyError, ServerSelectionTimeoutError, AutoReconnect

blueprint_agendamento = Blueprint('agendamento', __name__)

@blueprint_agendamento.route('/agendamento', methods=['POST'])
def criar_agendamento():
    try:
        dados_recebidos = request.get_json()
        
        # Não precisa do identificador - é auto-incremento
        nome_do_cliente = dados_recebidos.get('nome_do_cliente')
        tipo_de_servico = dados_recebidos.get('tipo_de_servico')
        data_e_hora = dados_recebidos.get('data_e_hora')
        
        # Validações
        if not nome_do_cliente:
            return jsonify({"mensagem": "Nome do cliente é obrigatório."}), 400
        
        if not tipo_de_servico:
            return jsonify({"mensagem": "Tipo de serviço é obrigatório."}), 400
        
        if not data_e_hora:
            return jsonify({"mensagem": "Data e hora são obrigatórios."}), 400
        
        # Verificar se o horário ainda está disponível
        agendamentos_collection = mongo.db.agendamentos
        agendamento_existente = agendamentos_collection.find_one({"data_e_hora": data_e_hora})
        
        if agendamento_existente:
            return jsonify({
                "mensagem": "Este horário já foi agendado por outro cliente. Por favor, escolha outro horário."
            }), 409  # Conflict
        
        # Criar documento do agendamento
        documento_agendamento = Agendamento.criar_documento(
            nome_do_cliente=nome_do_cliente,
            tipo_de_servico=tipo_de_servico,
            data_e_hora=data_e_hora
        )

        # Inserir no MongoDB
        result = agendamentos_collection.insert_one(documento_agendamento)
        
        return jsonify({
            "mensagem": "Agendamento criado com sucesso!",
            "agendamento": {
                "id": str(result.inserted_id),
                "cliente": nome_do_cliente,
                "servico": tipo_de_servico,
                "data_hora": data_e_hora
            }
        }), 201

    except Exception as erro:
        print(f"Erro no agendamento: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor."}), 500

@blueprint_agendamento.route('/agendamento', methods=['GET'])
def listar_agendamentos():
    try:
        agendamentos_collection = mongo.db.agendamentos
        agendamentos_cursor = agendamentos_collection.find({})
        
        lista_agendamentos = []
        for agendamento_doc in agendamentos_cursor:
            agendamento_dict = Agendamento.to_dict(agendamento_doc)
            if agendamento_dict:
                lista_agendamentos.append(agendamento_dict)
        
        return jsonify(lista_agendamentos), 200
        
    except Exception as erro:
        print(f"Erro ao listar agendamentos: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor."}), 500  
   
@blueprint_agendamento.route('/agendamento/<string:agendamento_id>', methods=['DELETE'])
def cancelar_agendamento(agendamento_id):
    try:
        agendamentos_collection = mongo.db.agendamentos
        
        # Converter string para ObjectId
        try:
            object_id = ObjectId(agendamento_id)
        except:
            return jsonify({"mensagem": "ID de agendamento inválido."}), 400
            
        # Buscar e deletar o agendamento
        result = agendamentos_collection.delete_one({"_id": object_id})
        
        if result.deleted_count == 0:
            return jsonify({"mensagem": "Agendamento não encontrado."}), 404
        
        return jsonify({"mensagem": "Agendamento cancelado com sucesso."}), 200
        
    except Exception as erro:
        print(f"Erro ao cancelar agendamento: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor."}), 500

@blueprint_agendamento.route('/agendamento/delete', methods=['DELETE'])
def deletar_todos_agendamentos():
    try:
        agendamento_deletar_collection = mongo.db.agendamentos

        resultado = agendamento_deletar_collection.delete_many({})
        return jsonify({"mensagem": "Todos agendamentos deletados com sucesso"}), 200
    
    except Exception as erro:
        print(f"Erro ao deletar usuários: {erro}")

        if isinstance(erro, (ServerSelectionTimeoutError, AutoReconnect)):
            return jsonify({"mensagem": "Serviço de banco de dados indisponível. Tente novamente mais tarde."}), 503
        return jsonify({"mensagem": "Erro interno do servidor."}), 500

@blueprint_agendamento.route('/horarios-disponiveis', methods=['GET'])
def horarios_disponiveis():
    try:
        data_selecionada = request.args.get('data')
        
        if not data_selecionada:
            return jsonify({"mensagem": "Data é obrigatória."}), 400
        
        # Horários padrão da barbearia
        horarios_padrao = [
            "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
            "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
            "16:00", "16:30", "17:00", "17:30", "18:00"
        ]
        
        # Buscar agendamentos já feitos para a data selecionada
        agendamentos_collection = mongo.db.agendamentos
        agendamentos_do_dia = list(agendamentos_collection.find({
            "data_e_hora": {"$regex": f"^{data_selecionada}"}
        }))
        
        # Extrair apenas os horários já agendados
        horarios_ocupados = []
        for agendamento in agendamentos_do_dia:
            # Extrai a hora da string "2025-10-20 14:30"
            data_hora = agendamento['data_e_hora'].split(' ')
            if len(data_hora) > 1:
                horarios_ocupados.append(data_hora[1])
        
        # Filtrar horários disponíveis (remover os ocupados)
        horarios_disponiveis = [
            horario for horario in horarios_padrao 
            if horario not in horarios_ocupados
        ]
        
        return jsonify({
            "horarios_disponiveis": horarios_disponiveis,
            "horarios_ocupados": horarios_ocupados,
            "total_disponiveis": len(horarios_disponiveis)
        }), 200
        
    except Exception as erro:
        print(f"Erro ao buscar horários disponíveis: {erro}")
        return jsonify({"mensagem": "Erro interno do servidor."}), 500

