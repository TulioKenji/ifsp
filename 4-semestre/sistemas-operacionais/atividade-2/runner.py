import subprocess
import time
import signal
import os

# comandos para abrir cada programa em um cmd separado
processos = [
    ["start", "cmd", "/K", "python primos.py"],
    ["start", "cmd", "/K", "primos_c.exe"],
    ["start", "cmd", "/K", "java Primos"]
]

# iniciar cada processo
for cmd in processos:
    print(f"Iniciando: {' '.join(cmd)}")
    subprocess.Popen(" ".join(cmd), shell=True)

print("Todos os programas foram iniciados em janelas separadas! 🚀")
print("Agora vamos deixar rodando por 1 hora ⏳...")

# espera 1 hora (3600 segundos)
try:
    # time.sleep(3600)
    time.sleep(3600)
except KeyboardInterrupt:
    print("Execução interrompida manualmente! (CTRL+C)")

# Finalizar os programas → fecha todas janelas de cmd abertas especificamente para eles
print("Tempo expirou, encerrando programas...")

try:
    # fecha o Python, o executável C, e o Java
    
    os.system('taskkill /IM primos_c.exe /F')
    os.system('taskkill /IM java.exe /F')
    os.system('taskkill /IM python.exe /F')
    
except Exception as e:
    print("Não foi possível encerrar alguns processos:", e)