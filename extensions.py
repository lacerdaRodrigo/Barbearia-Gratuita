from flask_pymongo import PyMongo

# Inicializamos o objeto PyMongo sem associá-lo ao app (por enquanto)
# Isso permite que ele seja importado em outros módulos.
mongo = PyMongo()