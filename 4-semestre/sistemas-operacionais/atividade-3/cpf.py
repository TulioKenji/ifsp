import random
import queue
import threading
import concurrent.futures

cpf_valido = 0
cpf_invalido = 0
lock = threading.Lock()

def gerar_cpf(queue, stop_event):
    while not stop_event.is_set():
        numero_aleatorio = random.randint(10**10, 10**11 - 1)
        queue.put(numero_aleatorio) 

def validar_cpf(queue, stop_event):
    global cpf_valido
    global cpf_invalido
    while not stop_event.is_set():
        cpf = queue.get()
        cpf = str(cpf)
        valido = False
    
        # --- Cálculo do primeiro dígito verificador ---
        soma = 0
        for i in range(9):
            soma += int(cpf[i]) * (10 - i)

        resto = soma % 11
        digito_verificador_1 = 0 if resto < 2 else 11 - resto

        # Verifica o primeiro dígito
        if digito_verificador_1 != int(cpf[9]):
            with lock:
                cpf_invalido += 1
            continue 

        # --- Cálculo do segundo dígito verificador ---
        soma = 0
        for i in range(10):
            soma += int(cpf[i]) * (11 - i)

        resto = soma % 11
        digito_verificador_2 = 0 if resto < 2 else 11 - resto

        # Verifica o segundo dígito e retorna o resultado final
        valido = digito_verificador_2 == int(cpf[10])
        if valido:
            cpf_valido += 1
        else:
            cpf_invalido += 1
        if cpf_valido >= 50000:
                    stop_event.set()
    

if __name__ == "__main__":
    queue_cpf = queue.Queue(maxsize=1000) 
    stop_event = threading.Event()
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        executor.submit(gerar_cpf, queue_cpf, stop_event)
        executor.submit(validar_cpf, queue_cpf, stop_event)
    print(f"CPFs Válidos: {cpf_valido}, CPFs Inválidos: {cpf_invalido}")
    print("ACABOU ACABOU ACABOU")