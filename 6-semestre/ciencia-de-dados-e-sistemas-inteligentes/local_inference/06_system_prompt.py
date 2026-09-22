from openai import OpenAI
from config import BASE_URL, API_KEY, MODEL

def main():

    client = OpenAI(
        base_url=BASE_URL,
        api_key=API_KEY
    )

    response = client.chat.completions.create(

        model=MODEL,

        messages=[
            {
                "role": "system",
                "content": """
Você é um engenheiro senior em diagnóstico automotivo.
Analise sintomas de automóveis de forma clara e objetiva.

Apresente possíveis causas, verificações recomendadas e riscos.
Não forneça um diagnóstico definitivo sem evidências e avise
quando for necessário realizar testes mais aprofundados.
"""
            },
            {
                "role": "user",
                "content": """
O meu carro não liga. Ao tentar dar a partida, é possível ouvir o motor de arranque, 
mas o motor não pega.

Depois de algumas tentativas de ligar o carro, fica um cheiro muito forte de combustível.

Realizar o diagnóstico deste problema.
"""
            }
        ],

        temperature=0.2,
        top_p=0.9,
        max_tokens=500,
        frequency_penalty=0.0,
        presence_penalty=0.0,
        reasoning_effort="none",
        stop=[
            "FIM_DA_RESPOSTA"
        ]
    )

    print(f"Modelo: {MODEL}")
    print()

    print(response.choices[0].message.content)

if __name__ == "__main__":
    main()