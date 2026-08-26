def formatar_senhas(arquivo_entrada, arquivo_saida):
    senhas = []

    with open(arquivo_entrada, "r", encoding="utf-8") as arquivo:
        for linha in arquivo:
            linha = linha.strip()

            if not linha:
                continue

            # Aceita tanto espaços quanto TAB
            partes = linha.split()

            # Remove o primeiro elemento (número da linha)
            if partes[0].isdigit():
                partes = partes[1:]

            # Adiciona as senhas encontradas
            senhas.extend(partes)

    # Salva uma senha por linha
    with open(arquivo_saida, "w", encoding="utf-8") as arquivo:
        for senha in senhas:
            arquivo.write(senha + "\n")



formatar_senhas("piores-senhas.txt", "senhas-formatadas.txt")