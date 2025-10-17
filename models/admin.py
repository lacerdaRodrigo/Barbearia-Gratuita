
from datetime import datetime
from bson import ObjectId

class AdminBarbearia:
    """Utilitário para trabalhar com documentos de admin no MongoDB"""
    
    @staticmethod
    def criar_documento(nome, email, senha):
        """Cria um documento de admin padronizado"""
        return {
            "nome": nome,
            "email": email,
            "senha": senha,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    @staticmethod
    def validar_documento(documento):
        """Valida se um documento tem os campos obrigatórios"""
        campos_obrigatorios = ["nome", "email", "senha"]
        return all(campo in documento for campo in campos_obrigatorios)
    
    @staticmethod
    def to_dict(documento):
        """Converte documento MongoDB para dict serializado"""
        if not documento:
            return None
            
        return {
            "id": str(documento["_id"]),
            "nome": documento.get("nome"),
            "email": documento.get("email"),
            "created_at": documento.get("created_at"),
            "updated_at": documento.get("updated_at")
        }
