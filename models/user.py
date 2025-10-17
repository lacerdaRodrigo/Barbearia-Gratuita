from datetime import datetime
from bson import ObjectId

class Usuario:
    """Utilitário para trabalhar com documentos de usuário no MongoDB"""
    
    @staticmethod
    def criar_documento(nome, email, telefone, senha_hash):
        """Cria um documento de usuário padronizado"""
        return {
            "nome": nome,
            "email": email,
            "telefone": telefone,
            "senha_hash": senha_hash,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    @staticmethod
    def validar_documento(documento):
        """Valida se um documento tem os campos obrigatórios"""
        campos_obrigatorios = ["nome", "email", "telefone", "senha_hash"]
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
            "telefone": documento.get("telefone"),
            "created_at": documento.get("created_at"),
            "updated_at": documento.get("updated_at")
        }