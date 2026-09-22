from openai import OpenAI
from config import BASE_URL, API_KEY, MODEL

def executar(client, configuracao):

    prompt = """
O meu carro não liga. Ao tentar dar a partida, é possível ouvir o motor de arranque, 
mas o motor não pega.

Depois de algumas tentativas de ligar o carro, fica um cheiro muito forte de combustível.

Realizar o diagnóstico deste problema.
"""
    response = client.chat.completions.create(

        model=MODEL,

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=configuracao["temperature"],

        top_p=configuracao["top_p"],

        max_tokens=configuracao["max_tokens"],

        frequency_penalty=configuracao["frequency_penalty"],

        presence_penalty=configuracao["presence_penalty"],

        reasoning_effort="none",

        stop=configuracao["stop"]
    )

    return response.choices[0].message.content

def main():

    client = OpenAI(
        base_url=BASE_URL,
        api_key=API_KEY
    )

    configuracoes = [
        {
            "nome": "Resposta objetiva",
            "temperature": 0.2,
            "top_p": 0.9,
            "max_tokens": 500,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
            "stop": ["FIM_DA_RESPOSTA"]
        },
        {
            "nome": "Resposta equilibrada",
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 1000,
            "frequency_penalty": 0.2,
            "presence_penalty": 0.1,
            "stop": ["FIM_DA_RESPOSTA"]
        },
        {
            "nome": "Resposta criativa",
            "temperature": 1.0,
            "top_p": 0.8,
            "max_tokens": 1000,
            "frequency_penalty": 0.4,
            "presence_penalty": 0.3,
            "stop": ["FIM_DA_RESPOSTA"]
        }
    ]

    print(f"Modelo: {MODEL}")

    for configuracao in configuracoes:

        print()
        print("=" * 70)
        print(f"CONFIGURAÇÃO = {configuracao['nome']}")
        print(f"temperature = {configuracao['temperature']}")
        print(f"top_p = {configuracao['top_p']}")
        print(f"max_tokens = {configuracao['max_tokens']}")
        print(f"frequency_penalty = {configuracao['frequency_penalty']}")
        print(f"presence_penalty = {configuracao['presence_penalty']}")
        print("=" * 70)

        answer = executar(
            client,
            configuracao
        )

        print(answer)

if __name__ == "__main__":
    main()