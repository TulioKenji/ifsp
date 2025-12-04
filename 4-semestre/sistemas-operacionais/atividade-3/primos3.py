import threading
import random
import concurrent.futures
import time

# Parte 1: Modificado para gerar até 50 números por thread
maximo_por_thread = 50 

# Variável global para contar o total de primos (protegida por um lock)
primos_global = 0
lock = threading.Lock() # Lock para proteger o acesso à variável global

def eh_primo(n):
    """Função otimizada para verificar se um número é primo."""
    if n <= 1:
        return False
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
    """
    Função que será executada por cada thread.
    Gera números, verifica se são primos e atualiza o contador global.
    """
    print(f"Thread {index} iniciou.")
    
    # Lista local para armazenar os primos encontrados APENAS por esta thread
    lista_local_primos = list()
    
    # Usando a variável global para o contador
    global primos_global

    for _ in range(maximo_por_thread):
        # Parte 1: Modificado para gerar números de 16 algarismos
        numero_aleatorio = random.randint(10**15, 10**16 - 1)
        
        if eh_primo(numero_aleatorio):
            lista_local_primos.append(numero_aleatorio)
            print(f"Thread {index} encontrou um primo: {numero_aleatorio}")
            
            # --- Correção da Condição de Corrida ---
            # Adquire o "cadeado" para modificar a variável global com segurança
            with lock:
                primos_global += 1

    print(f"Thread {index} finalizou, encontrou {len(lista_local_primos)} primos.")
    # Retorna a lista de primos que esta thread encontrou
    return lista_local_primos


if __name__ == "__main__":
    print("Iniciando a busca por números primos...")
    start_time = time.time()
    
    resultados_das_threads = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        # executor.map retorna um iterador com os resultados de cada thread
        resultados_das_threads = list(executor.map(th_gerador_numero, range(5)))

    print("\n--- TAREFA FINALIZADA ---")

    # Parte 3: Verificação da contagem de primos
    print(f"\nValor final da variável global 'primos_global': {primos_global}")

    # Calculando o total de primos somando o tamanho de cada lista retornada
    total_primos_pelas_listas = sum(len(lista) for lista in resultados_das_threads)
    print(f"Soma da contagem de primos de cada lista: {total_primos_pelas_listas}")

    if primos_global == total_primos_pelas_listas:
        print("\n[SUCESSO] A contagem da variável global e a soma das listas são iguais.")
    else:
        print("\n[FALHA] A contagem da variável global e a soma das listas são diferentes. (Isso indica uma condição de corrida não resolvida)")

    end_time = time.time()
    print(f"Tempo total de execução: {end_time - start_time:.2f} segundos.")