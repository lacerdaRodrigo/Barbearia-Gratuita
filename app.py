# ...existing code...
import os
import certifi
import jwt
from datetime import datetime
from flask import Flask
from flask_cors import CORS
from extensions import mongo  # Importa o mongo não inicializado
from routes.cadastro import blueprint_cadastro  # Importa o Blueprint de cadastro
from routes.login import blueprint_login  # Importa o Blueprint de login
from routes.agendamento import blueprint_agendamento  # Importa o Blueprint de agendamento
from routes.admin import blueprint_admin  # Importa o Blueprint de admin
from routes.servico import blueprint_servico  # Importa o Blueprint de serviços

def criar_aplicacao():
    aplicacao = Flask(__name__)

    # Configurações de Mongo (lê a URI do ambiente)
    aplicacao.config.setdefault("MONGO_URI", os.getenv("MONGO_URI", "mongodb://localhost:27017/barbearia"))
    aplicacao.config.setdefault("MONGO_TLS_CA_FILE", certifi.where())

    # Inicializa extensões
    mongo.init_app(aplicacao)

    # Habilitar CORS para permitir requisições do frontend
    CORS(aplicacao)

    # Registra os Blueprints (as rotas)
    aplicacao.register_blueprint(blueprint_cadastro)
    aplicacao.register_blueprint(blueprint_login)
    aplicacao.register_blueprint(blueprint_agendamento)
    aplicacao.register_blueprint(blueprint_admin)
    aplicacao.register_blueprint(blueprint_servico)

    return aplicacao

# Criar a aplicação para o Gunicorn
app = criar_aplicacao()

if __name__ == '__main__':
    aplicacao = app

    # Inicializar dados padrão dentro do contexto da aplicação
    with aplicacao.app_context():
        db = mongo.db
        try:
            # Criar serviços padrão se não existirem
            if db.servicos.count_documents({}) == 0:
                servicos_padrao = [
                    {"nome": "Corte Masculino", "preco": 25.00, "emoji": "💇‍♂️", "ativo": True, "created_at": datetime.utcnow()},
                    {"nome": "Corte Feminino", "preco": 35.00, "emoji": "💇‍♀️", "ativo": True, "created_at": datetime.utcnow()},
                    {"nome": "Barba", "preco": 20.00, "emoji": "🧔", "ativo": True, "created_at": datetime.utcnow()},
                    {"nome": "Corte + Barba", "preco": 40.00, "emoji": "✨", "ativo": True, "created_at": datetime.utcnow()},
                    {"nome": "Bigode", "preco": 15.00, "emoji": "👨‍🦱", "ativo": True, "created_at": datetime.utcnow()},
                    {"nome": "Escova", "preco": 30.00, "emoji": "🌪️", "ativo": True, "created_at": datetime.utcnow()},
                    {"nome": "Hidratação", "preco": 45.00, "emoji": "💧", "ativo": True, "created_at": datetime.utcnow()},
                    {"nome": "Corte + Barba + Bigode", "preco": 50.00, "emoji": "🔥", "ativo": True, "created_at": datetime.utcnow()},
                ]
                db.servicos.insert_many(servicos_padrao)
                print("✅ Serviços padrão criados com sucesso!")
        except Exception as e:
            print("⚠️ Não foi possível popular serviços padrão:", e)

    # Configuração para produção vs desenvolvimento
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    debug = os.getenv('DEBUG', 'False').lower() == 'true'

    aplicacao.run(host=host, port=port, debug=debug)
# ...existing code...