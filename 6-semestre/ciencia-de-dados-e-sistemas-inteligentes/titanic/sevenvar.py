import pandas as pd
import numpy as np

df = pd.read_csv("dataset/train.csv")

df_7var = df[
    [
        "Pclass",
        "Sex",
        "Age",
        "SibSp",
        "Parch",
        "Fare",
        "Embarked",
        "Survived"
    ]
]

df_7var.to_csv("dataset/7var.csv", index=False)


print(df_7var.head())

grupo = df_7var[
    (df_7var["Sex"] == "female") &
    (df_7var["Pclass"] > 2)
].copy()

print("Quantidade de passageiras:", len(grupo))

print("\nTaxa geral de sobrevivência:")
print(grupo["Survived"].mean())

max_idade = int(grupo["Age"].max())
print(f"\nTaxa de sobrevivência por idade (até {grupo["Age"].max()} anos):")

for idade in range(2, max_idade):

    abaixo = grupo[
    (grupo["Age"] < idade) &
    (grupo["Age"] > idade - 2)
]

    # Ignora cortes sem passageiros
    if len(abaixo) == 0:
        continue

    taxa_sobrevivencia = abaixo["Survived"].mean()

    print(
        f"Age < {idade:2d} And Age > {idade - 2:2d} | "
        f"Passageiros: {len(abaixo):3d} | "
        f"Sobrevivência: {taxa_sobrevivencia:.2%}"
    )