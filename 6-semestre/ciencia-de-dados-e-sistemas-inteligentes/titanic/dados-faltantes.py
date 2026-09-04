import pandas as pd


# ============================================================
# EXEMPLO DIDÁTICO
# ============================================================

df_exemplo = pd.DataFrame({
    "Age": [20, 25, 30, None, 40]
})

print("\n===== DATASET DE EXEMPLO =====")
print(df_exemplo)

print("\n===== VALORES AUSENTES =====")
print(df_exemplo["Age"].isnull())

print("\n===== QUANTIDADE DE AUSENTES =====")
print(df_exemplo["Age"].isnull().sum())


# ============================================================
# DROPNA
# ============================================================

df_dropna = df_exemplo.dropna()

print("\n===== DROPNA =====")
print(df_dropna)


# ============================================================
# MÉDIA
# ============================================================

media = df_exemplo["Age"].mean()

print("\n===== MÉDIA =====")
print(f"Média: {media}")


df_media = df_exemplo.copy()

df_media["Age"] = df_media["Age"].fillna(media)

print("\nDataset preenchido com média:")
print(df_media)


# ============================================================
# MEDIANA
# ============================================================

mediana = df_exemplo["Age"].median()

print("\n===== MEDIANA =====")
print(f"Mediana: {mediana}")


df_mediana = df_exemplo.copy()

df_mediana["Age"] = df_mediana["Age"].fillna(mediana)

print("\nDataset preenchido com mediana:")
print(df_mediana)


# ============================================================
# TITANIC
# ============================================================

df = pd.read_csv("dataset/train.csv")

print("\n===== TITANIC - AGE =====")

print(f"Total de registros: {len(df)}")
print(f"Valores preenchidos: {df['Age'].count()}")
print(f"Valores ausentes: {df['Age'].isnull().sum()}")

print(f"Média: {df['Age'].mean():.2f}")
print(f"Mediana: {df['Age'].median():.2f}")


# ============================================================
# COMPARAÇÃO
# ============================================================

df_age_dropna = df.dropna(subset=["Age"])

df_age_media = df.copy()
df_age_media["Age"] = df_age_media["Age"].fillna(
    df_age_media["Age"].mean()
)

df_age_mediana = df.copy()
df_age_mediana["Age"] = df_age_mediana["Age"].fillna(
    df_age_mediana["Age"].median()
)

print("\n===== COMPARAÇÃO =====")

print(f"Original:  {df.shape}")
print(f"Dropna:    {df_age_dropna.shape}")
print(f"Média:     {df_age_media.shape}")
print(f"Mediana:   {df_age_mediana.shape}")