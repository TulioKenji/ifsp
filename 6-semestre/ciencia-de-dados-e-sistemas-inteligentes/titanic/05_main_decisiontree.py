# main_treedecision.py

from policies.titanic_rules import REGRAS_TITANIC
from engines.inference_engine import (
    inferir_primeira,
    explicar_inferencia
)


# ================================================================
# FATOS DO PASSAGEIRO
# ================================================================

passageiro = {
    "Sex": "female",
    "Pclass": 3,
    "Age": 16,
    "SibSp": 0,
    "Parch": 1,
    "Fare": 7.25,
    "Embarked": "S"
}


# ================================================================
# EXECUÇÃO DA INFERENCE ENGINE
# ================================================================

resultado = inferir_primeira(
    passageiro,
    REGRAS_TITANIC
)


# ================================================================
# APRESENTAÇÃO DO RESULTADO
# ================================================================

print("=" * 60)
print("INFERENCE ENGINE - TITANIC")
print("=" * 60)

print("\nFATOS DO PASSAGEIRO:")

for campo, valor in passageiro.items():
    print(f"  {campo}: {valor}")


print("\n" + "-" * 60)

print(explicar_inferencia(resultado))

print("=" * 60)
