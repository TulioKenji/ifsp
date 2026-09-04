# ============================================================
# PROJETO: TITANIC - PRÉ-PROCESSAMENTO DE DADOS
# ============================================================
#
# Objetivo desta etapa:
#   - Carregar o dataset Titanic
#   - Conhecer sua estrutura
#   - Identificar valores ausentes
#   - Identificar dados duplicados
#   - Observar estatísticas básicas
#   - Identificar valores categóricos
#
# IMPORTANTE:
# Nesta etapa NÃO vamos modificar os dados.
# Primeiro vamos fazer o diagnóstico do dataset.
# ============================================================




# ============================================================
# IMPORTAÇÃO DAS BIBLIOTECAS
# ============================================================


# Pandas:
# Biblioteca principal para manipulação e análise de dados.
#
# É utilizada para:
#   - Ler arquivos CSV
#   - Criar e manipular DataFrames
#   - Filtrar dados
#   - Identificar valores ausentes
#   - Calcular estatísticas
#   - Transformar colunas
#
# "pd" é um apelido (alias) utilizado por convenção.
import pandas as pd




# NumPy:
# Biblioteca utilizada para computação numérica.
#
# É muito utilizada em Data Science para:
#   - Operações matemáticas
#   - Arrays numéricos
#   - Tratamento de valores especiais, como NaN
#   - Operações estatísticas e vetorizadas
#
# "np" é o alias utilizado por convenção.
import numpy as np




# ============================================================
# 1. CARREGAMENTO DO DATASET
# ============================================================


# pd.read_csv()
#
# Método do Pandas utilizado para ler um arquivo CSV
# (Comma-Separated Values).
#
# O resultado é armazenado em um DataFrame.
#
# DataFrame:
# É uma estrutura semelhante a uma tabela, formada por
# linhas e colunas.
#
# Nosso arquivo está localizado em:
#
#   dataset/train.csv
#
# Como o script está sendo executado a partir da pasta
# "titanic", o caminho relativo será:
#
#   dataset/train.csv
#
df = pd.read_csv("dataset/train.csv")




# ============================================================
# 2. VISUALIZAR AS PRIMEIRAS LINHAS
# ============================================================


print("\n===== PRIMEIRAS LINHAS =====")


# df.head()
#
# Método utilizado para visualizar as primeiras linhas
# do DataFrame.
#
# Por padrão, retorna as 5 primeiras linhas.
#
# Também podemos informar uma quantidade:
#
#   df.head(10)
#
# Nesse caso seriam mostradas as 10 primeiras linhas.
#
# É muito utilizado na primeira inspeção de um dataset.
# NaN significa Not a Number (não é um número) e representa um valor numérico indefinido
print(df.head())




# ============================================================
# 3. DIMENSÕES DO DATASET
# ============================================================


print("\n===== DIMENSÕES =====")




# df.shape
#
# A propriedade "shape" retorna uma tupla contendo:
#
#   (quantidade_de_linhas, quantidade_de_colunas)
#
# Exemplo:
#
#   (891, 12)
#
# significa:
#
#   891 linhas
#   12 colunas
#
# IMPORTANTE:
# shape é uma propriedade e não um método.
#
# Por isso usamos:
#
#   df.shape
#
# e não:
#
#   df.shape()
#
print(f"Dimensões: {df.shape}")




# df.shape[0]
#
# Retorna a primeira posição da tupla "shape".
#
# Em Python, a primeira posição possui índice 0.
#
# Portanto:
#
#   df.shape[0] -> quantidade de linhas
#
print(f"Linhas: {df.shape[0]}")




# df.shape[1]
#
# Retorna a segunda posição da tupla "shape".
#
# Portanto:
#
#   df.shape[1] -> quantidade de colunas
#
print(f"Colunas: {df.shape[1]}")




# ============================================================
# 4. NOMES DAS COLUNAS
# ============================================================


print("\n===== COLUNAS =====")




# df.columns
#
# Retorna o nome de todas as colunas do DataFrame.
#
# O resultado é um objeto chamado Index.
#
# Exemplo:
#
#   Index(['PassengerId', 'Survived', 'Pclass', ...])
#
print(df.columns)




# df.columns.tolist()
#
# O método "tolist()" converte o objeto Index em uma
# lista Python tradicional.
#
# Exemplo:
#
#   ['PassengerId', 'Survived', 'Pclass', ...]
#
print(df.columns.tolist())




# ============================================================
# 5. INFORMAÇÕES SOBRE O DATASET
# ============================================================


print("\n===== INFORMAÇÕES =====")




# df.info()
#
# Método extremamente importante para a inspeção inicial.
#
# Mostra:
#
#   - quantidade de linhas
#   - quantidade de colunas
#   - nome das colunas
#   - quantidade de valores NÃO nulos
#   - tipo de dado de cada coluna
#
# Exemplos de tipos:
#
#   int64   -> números inteiros
#   float64 -> números decimais
#   object  -> normalmente texto/categorias
#
# Também podemos identificar rapidamente valores
# ausentes observando a diferença entre o total de
# linhas e o número de valores non-null.
#
df.info()




# ============================================================
# 6. IDENTIFICAÇÃO DE VALORES AUSENTES
# ============================================================


print("\n===== VALORES AUSENTES =====")




# df.isnull()
#
# Verifica cada célula do DataFrame.
#
# Retorna:
#
#   True  -> valor ausente
#   False -> valor presente
#
# Exemplo:
#
#   Age
#   22     -> False
#   38     -> False
#   NaN    -> True
#
# Sozinho, esse método gera uma tabela enorme.
#
# Por isso vamos combiná-lo com ".sum()".
#
#
# df.isnull().sum()
#
# O método sum() soma os valores True.
#
# Em Python/Pandas:
#
#   True  = 1
#   False = 0
#
# Dessa forma conseguimos contar quantos valores ausentes
# existem em cada coluna.
#
print(df.isnull().sum())




# ============================================================
# 7. PERCENTUAL DE VALORES AUSENTES
# ============================================================


print("\n===== PERCENTUAL DE VALORES AUSENTES =====")




# df.isnull().mean()
#
# Primeiro identificamos os valores ausentes:
#
#   df.isnull()
#
# Depois calculamos a média:
#
#   mean()
#
# Como True equivale a 1 e False equivale a 0,
# a média representa a proporção de valores ausentes.
#
# Exemplo:
#
#   177 valores ausentes
#   891 registros
#
#   177 / 891 = 0.1987
#
# Multiplicando por 100:
#
#   19.87%
#
percentual_ausentes = df.isnull().mean() * 100




# Criamos um novo DataFrame contendo duas informações:
#
#   Quantidade -> número absoluto de valores ausentes
#   Percentual -> percentual de valores ausentes
#
missing = pd.DataFrame({
    "Quantidade": df.isnull().sum(),
    "Percentual": percentual_ausentes
})


print(missing)




# ============================================================
# 8. VERIFICAÇÃO DE LINHAS DUPLICADAS
# ============================================================


print("\n===== DUPLICIDADES =====")




# df.duplicated()
#
# Verifica se uma linha é uma duplicata de outra linha
# que apareceu anteriormente no DataFrame.
#
# Retorna:
#
#   True  -> linha duplicada
#   False -> linha não duplicada
#
#
# df.duplicated().sum()
#
# Conta quantas linhas duplicadas existem.
#
quantidade_duplicados = df.duplicated().sum()


print(f"Quantidade de linhas duplicadas: {quantidade_duplicados}")




# ============================================================
# 9. VERIFICAÇÃO DE DUPLICIDADE DO PASSENGERID
# ============================================================


print("\n===== DUPLICIDADE DO PASSENGERID =====")




# Aqui estamos verificando especificamente a coluna
# PassengerId.
#
# Como PassengerId é um identificador único, esperamos
# que não existam valores repetidos.
#
# df["PassengerId"]
#
# Seleciona apenas a coluna PassengerId.
#
#
# df["PassengerId"].duplicated()
#
# Verifica duplicidades nessa coluna.
#
#
# .sum()
#
# Conta quantas duplicidades foram encontradas.
#
duplicados_passenger_id = df["PassengerId"].duplicated().sum()


print(f"PassengerId duplicados: {duplicados_passenger_id}")




# ============================================================
# 10. ESTATÍSTICAS DESCRITIVAS
# ============================================================


print("\n===== ESTATÍSTICAS DESCRITIVAS =====")




# df.describe()
#
# Calcula estatísticas descritivas para as colunas
# numéricas.
#
# Entre as principais informações:
#
#   count -> quantidade de valores
#   mean  -> média
#   std   -> desvio padrão
#   min   -> valor mínimo
#   25%   -> primeiro quartil (Q1)
#   50%   -> mediana (Q2)
#   75%   -> terceiro quartil (Q3)
#   max   -> valor máximo
#
# Isso nos ajuda a entender a distribuição dos dados.
#
print(df.describe())




# ============================================================
# 11. ESTATÍSTICAS DAS VARIÁVEIS CATEGÓRICAS
# ============================================================


print("\n===== ESTATÍSTICAS CATEGÓRICAS =====")




# df.describe(include="object")
#
# O método describe(), por padrão, trabalha principalmente
# com dados numéricos.
#
# Ao utilizar:
#
#   include="object"
#
# estamos solicitando estatísticas das colunas que o Pandas
# identificou como object, normalmente contendo texto.
#
# Para essas colunas podemos obter:
#
#   count  -> quantidade de valores não nulos
#   unique -> quantidade de categorias diferentes
#   top    -> categoria mais frequente
#   freq   -> frequência da categoria mais frequente
#
print(df.describe(include="object"))




# ============================================================
# 12. VALORES ÚNICOS DA COLUNA SEX
# ============================================================


print("\n===== VALORES ÚNICOS - SEX =====")




# df["Sex"]
#
# Seleciona a coluna Sex.
#
#
# .unique()
#
# Retorna os diferentes valores encontrados na coluna.
#
# Esperamos encontrar:
#
#   male
#   female
#
print(df["Sex"].unique())




# ============================================================
# 13. VALORES ÚNICOS DA COLUNA EMBARKED
# ============================================================


print("\n===== VALORES ÚNICOS - EMBARKED =====")




# Novamente utilizamos unique() para descobrir quais
# categorias existem na coluna Embarked.
#
# Esperamos encontrar:
#
#   [C] Cherbourg
#   [Q] Queenstown
#   [S] Southampton
#
print(df["Embarked"].unique())




# ============================================================
# 14. FREQUÊNCIA DA VARIÁVEL SEX
# ============================================================


print("\n===== FREQUÊNCIA - SEX =====")




# df["Sex"].value_counts()
#
# Conta quantas vezes cada categoria aparece.
#
# Exemplo:
#
#   male      577
#   female    314
#
# Isso é diferente de unique().
#
# unique():
#   mostra quais categorias existem.
#
# value_counts():
#   mostra quantas vezes cada categoria aparece.
#
print(df["Sex"].value_counts())




# ============================================================
# FIM DA ANÁLISE INICIAL
# ============================================================
#
# Não houve nenhuma alteração no DataFrame.
#
# O objetivo foi apenas visualizar e entender os dados:
#
#   - Quantas linhas existem?
#   - Quantas colunas existem?
#   - Quais são as colunas?
#   - Quais são os tipos de dados?
#   - Existem valores ausentes?
#   - Onde estão os valores ausentes?
#   - Existem duplicidades?
#   - Como estão distribuídos os dados numéricos?
#   - Quais categorias existem?
#
# ============================================================
