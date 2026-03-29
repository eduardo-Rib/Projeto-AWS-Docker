from database import db
from datetime import datetime

class CentroCusto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)

class Conta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.String(200))
    tipo = db.Column(db.String(10))
    pessoa = db.Column(db.String(100))
    valor = db.Column(db.Float)
    moeda = db.Column(db.String(10))
    vencimento = db.Column(db.Date)
    recorrente = db.Column(db.Boolean, default=False)
    paga = db.Column(db.Boolean, default=False)
    data_pagamento = db.Column(db.DateTime)

    centro_id = db.Column(db.Integer, db.ForeignKey('centro_custo.id'))