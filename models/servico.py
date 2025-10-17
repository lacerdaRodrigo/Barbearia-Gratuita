from datetime import datetime
from bson import ObjectId

class Servico:
    """Utilitário para trabalhar com documentos de serviço no MongoDB"""
    
    @staticmethod
    def criar_documento(nome, preco, emoji='🔧', ativo=True):
        """Cria um documento de serviço padronizado"""
        return {
            "nome": nome,
            "preco": float(preco),
            "emoji": emoji,
            "ativo": ativo,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    @staticmethod
    def validar_documento(documento):
        """Valida se um documento tem os campos obrigatórios"""
        campos_obrigatorios = ["nome", "preco"]
        return all(campo in documento for campo in campos_obrigatorios)
    
    @staticmethod
    def to_dict(documento):
        """Converte documento MongoDB para dict serializado"""
        if not documento:
            return None
            
        return {
            "id": str(documento["_id"]),
            "nome": documento.get("nome"),
            "preco": documento.get("preco"),
            "emoji": documento.get("emoji", "🔧"),
            "ativo": documento.get("ativo", True),
            "created_at": documento.get("created_at"),
            "updated_at": documento.get("updated_at"),
            "preco_formatado": f"R$ {documento.get('preco', 0):.2f}",
            "nome_completo": f"{documento.get('emoji', '🔧')} {documento.get('nome')} - R$ {documento.get('preco', 0):.2f}"
        }