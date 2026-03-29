from datetime import date

def dias_para_vencer(vencimento):
    return (vencimento - date.today()).days