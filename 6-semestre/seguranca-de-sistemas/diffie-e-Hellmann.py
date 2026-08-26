import random
import math


def eh_primo(numero):
    if numero < 2:
        return False

    for i in range(2, int(math.sqrt(numero)) + 1):
        if numero % i == 0:
            return False

    return True


def gerar_n():
    while True:
        n = random.randint(3, 1000)

        if eh_primo(n):
            return n


def gerar_g(n):
    return random.randint(2, n - 1)


def main():
    senha_A = input("Digite a senha de A: ")
    senha_B = input("Digite a senha de B: ")

    if senha_A.strip() == "" or senha_B.strip() == "":
        print("As senhas não podem estar vazias.")
        return

    if senha_A == senha_B:
        print("As senhas são iguais.")
        return

    try:
        senha_A = int(senha_A)
    except ValueError:
        print("Senha de A inválida. Digite um número inteiro.")
        return

    try:
        senha_B = int(senha_B)
    except ValueError:
        print("Senha de B inválida. Digite um número inteiro.")
        return

    if senha_A <= 0 or senha_B <= 0:
        print("As senhas devem ser números inteiros positivos.")
        return

    n = gerar_n()
    g = gerar_g(n)

    chave_publica_A = pow(g, senha_A, n)
    chave_publica_B = pow(g, senha_B, n)

    chave_A = pow(chave_publica_B, senha_A, n)
    chave_B = pow(chave_publica_A, senha_B, n)

    print("\n========== DIFFIE-HELLMAN ==========")
    print(f"Senha de A: {senha_A}")
    print(f"Senha de B: {senha_B}")
    print(f"N: {n}")
    print(f"G: {g}")

    print(f"\nChave pública de A: {chave_publica_A}")
    print(f"Chave pública de B: {chave_publica_B}")

    print(f"\nChave calculada por A: {chave_A}")
    print(f"Chave calculada por B: {chave_B}")

    if chave_A == chave_B:
        print(f"\nChave compartilhada: {chave_A}")
        print("A e B possuem a mesma chave compartilhada!")
    else:
        print("\nErro: as chaves compartilhadas são diferentes.")


if __name__ == "__main__":
    main()