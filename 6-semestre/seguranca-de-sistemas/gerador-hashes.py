import hashlib

def main():
    resultados = []

    HASHES_ALVO = {
        "9a1f30943126974075dbd4d13c8018ac",
        "978f6f608df5279d4d85e700d83ac873",
        "250e77f12a5ab6972a0895d290c4792f0a326ea8"
    }
    with open("piores-senhas.txt", "r", encoding="utf-8") as arquivo:
        for linha in arquivo:
            senha = linha.strip()

            if not senha:
                continue

            md5 = hashlib.md5(senha.encode("utf-8")).hexdigest()
            sha1 = hashlib.sha1(senha.encode("utf-8")).hexdigest()

            resultados.append(
                f"{senha} | MD5: {md5} | SHA1: {sha1}"
            )

            # Verifica MD5
            if md5 in HASHES_ALVO:
                print(f"[MD5] Senha encontrada: {senha}")
                print(f"      Hash: {md5}")

            # Verifica SHA-1
            if sha1 in HASHES_ALVO:
                print(f"[SHA1] Senha encontrada: {senha}")
                print(f"       Hash: {sha1}")

    # Cria arquivo com todos os hashes
    with open("hashes.txt", "w", encoding="utf-8") as arquivo:
        for resultado in resultados:
            arquivo.write(resultado + "\n")

if __name__ == "__main__":
    main()