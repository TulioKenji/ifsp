# inference_engine.py

"""
Inference Engine simples baseada em regras.

A engine recebe:

    FATOS
        ↓
    REGRAS
        ↓
    AVALIAÇÃO
        ↓
    CONCLUSÕES

A engine não conhece o domínio do Titanic.
Ela trabalha de forma genérica.
"""


# ================================================================
# AVALIA UMA ÚNICA CONDIÇÃO
# ================================================================

def avaliar_condicao(fatos, condicao):
    """
    Avalia uma condição individual.

    Exemplo:

        ("Age", "<", 18)

    significa:

        fatos["Age"] < 18
    """

    campo, operador, valor_esperado = condicao

    # Verifica se o campo existe nos fatos
    if campo not in fatos:
        return False

    valor_atual = fatos[campo]

    # ------------------------------------------------------------
    # Operador ==
    # ------------------------------------------------------------

    if operador == "==":
        return valor_atual == valor_esperado

    # ------------------------------------------------------------
    # Operador !=
    # ------------------------------------------------------------

    if operador == "!=":
        return valor_atual != valor_esperado

    # ------------------------------------------------------------
    # Operador >
    # ------------------------------------------------------------

    if operador == ">":
        return valor_atual > valor_esperado

    # ------------------------------------------------------------
    # Operador >=
    # ------------------------------------------------------------

    if operador == ">=":
        return valor_atual >= valor_esperado

    # ------------------------------------------------------------
    # Operador <
    # ------------------------------------------------------------

    if operador == "<":
        return valor_atual < valor_esperado

    # ------------------------------------------------------------
    # Operador <=
    # ------------------------------------------------------------

    if operador == "<=":
        return valor_atual <= valor_esperado

    # Operador desconhecido
    raise ValueError(
        f"Operador não suportado: {operador}"
    )


# ================================================================
# AVALIA UMA REGRA COMPLETA
# ================================================================

def avaliar_regra(fatos, regra):
    """
    Avalia todas as condições de uma regra.

    Todas as condições precisam ser verdadeiras.

    Exemplo:

        Sex == "female"
        AND
        Pclass > 2
        AND
        Age < 18
    """

    resultados_condicoes = []

    for condicao in regra["condicoes"]:

        resultado = avaliar_condicao(
            fatos,
            condicao
        )

        resultados_condicoes.append({
            "condicao": condicao,
            "verdadeira": resultado
        })

        # Se uma condição for falsa,
        # a regra inteira será falsa.
        if not resultado:
            return {
                "ativada": False,
                "condicoes": resultados_condicoes
            }

    # Todas as condições foram satisfeitas
    return {
        "ativada": True,
        "condicoes": resultados_condicoes
    }


# ================================================================
# CONVERTE UMA CONDIÇÃO PARA TEXTO
# ================================================================

def condicao_para_texto(condicao):
    """
    Converte:

        ("Age", "<", 18)

    para:

        Age < 18
    """

    campo, operador, valor = condicao

    if isinstance(valor, str):
        valor = f'"{valor}"'

    return f"{campo} {operador} {valor}"


# ================================================================
# CONVERTE UMA REGRA PARA TEXTO
# ================================================================

def regra_para_texto(regra):
    """
    Converte uma regra para uma representação
    que possa ser apresentada ao usuário.
    """

    condicoes = []

    for condicao in regra["condicoes"]:
        condicoes.append(
            condicao_para_texto(condicao)
        )

    texto_condicoes = " AND ".join(condicoes)

    return (
        f"SE {texto_condicoes} "
        f"ENTÃO {regra['resultado']}"
    )


# ================================================================
# EXECUTA A INFERÊNCIA
# ================================================================

def inferir(fatos, regras):
    """
    Executa o processo de inferência.

    Percorre as regras e identifica aquelas
    cujas condições são satisfeitas.
    """

    regras_ativadas = []

    for regra in regras:

        avaliacao = avaliar_regra(
            fatos,
            regra
        )

        if avaliacao["ativada"]:

            regras_ativadas.append({
                "id": regra["id"],
                "resultado": regra["resultado"],
                "condicoes": avaliacao["condicoes"]
            })

    return regras_ativadas


# ================================================================
# EXECUTA A INFERÊNCIA E RETORNA A PRIMEIRA CONCLUSÃO
# ================================================================

def inferir_primeira(fatos, regras):
    """
    Executa a inferência e retorna a primeira
    regra satisfeita.

    Esta função é especialmente adequada para
    regras derivadas de uma árvore de decisão,
    pois os caminhos das folhas são mutuamente
    exclusivos.
    """

    for regra in regras:

        avaliacao = avaliar_regra(
            fatos,
            regra
        )

        if avaliacao["ativada"]:

            return {
                "regra": regra["id"],
                "resultado": regra["resultado"],
                "condicoes": avaliacao["condicoes"]
            }

    return {
        "regra": None,
        "resultado": "SEM_CONCLUSAO",
        "condicoes": []
    }


# ================================================================
# GERA EXPLICAÇÃO DA INFERÊNCIA
# ================================================================

def explicar_inferencia(inferencia):
    """
    Produz uma explicação textual da decisão.
    """

    if inferencia["regra"] is None:

        return (
            "Nenhuma regra foi satisfeita."
        )

    linhas = []

    linhas.append(
        f"Regra aplicada: {inferencia['regra']}"
    )

    linhas.append("")
    linhas.append("Condições:")

    for item in inferencia["condicoes"]:

        condicao = condicao_para_texto(
            item["condicao"]
        )

        if item["verdadeira"]:
            simbolo = "✓"
        else:
            simbolo = "✗"

        linhas.append(
            f"  {simbolo} {condicao}"
        )

    linhas.append("")
    linhas.append(
        f"Resultado: {inferencia['resultado']}"
    )

    return "\n".join(linhas)
