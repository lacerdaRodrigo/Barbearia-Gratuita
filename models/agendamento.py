
from datetime import datetime
from bson import ObjectId

class Agendamento:
    """Utilitário para trabalhar com documentos de agendamento no MongoDB"""
    
    @staticmethod
    def criar_documento(nome_do_cliente, tipo_de_servico, data_e_hora):
        """Cria um documento de agendamento padronizado"""
        return {
            "nome_do_cliente": nome_do_cliente,
            "tipo_de_servico": tipo_de_servico,
            "data_e_hora": data_e_hora,
            "status": "confirmado",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    @staticmethod
    def validar_documento(documento):
        """Valida se um documento tem os campos obrigatórios"""
        campos_obrigatorios = ["nome_do_cliente", "tipo_de_servico", "data_e_hora"]
        return all(campo in documento for campo in campos_obrigatorios)
    
    @staticmethod
    def to_dict(documento):
        """Converte documento MongoDB para dict serializado"""
        if not documento:
            return None
            
        return {
            "id": str(documento["_id"]),
            "cliente": documento.get("nome_do_cliente"),
            "servico": documento.get("tipo_de_servico"),
            "data_hora": documento.get("data_e_hora"),
            "status": documento.get("status", "confirmado"),
            "created_at": documento.get("created_at"),
            "updated_at": documento.get("updated_at")
        }
