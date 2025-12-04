#Gerador de números primos com 18 algarismos
# gerar um numero aleatorio com 18 algarismos
# validar se o numero é primo
# rodar o codigo no thread main
import threading
import random
maximo = 50
primos=0


def eh_primo(n):
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True


def th_gerador_numero(index):
    print("Thread ", index)
    global primos
    lista= list()
    for i in range(maximo):
        numero_aleatorio = random.randint(10**15, 10**16 - 1)
        if eh_primo(numero_aleatorio):
            lista.append(numero_aleatorio)
            print (numero_aleatorio)
            primos = primos+1
    print(len(lista))

if __name__ =="__main__":
    index =0
    for index in range(50):
        x = threading.Thread(target =th_gerador_numero, args=(index,))
        x.start()
        x.join()
    print(primos)
    print("ACABOU ACABOU ACABOU")