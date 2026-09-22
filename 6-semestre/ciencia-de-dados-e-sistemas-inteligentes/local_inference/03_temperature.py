from openai import OpenAI
from config import BASE_URL, API_KEY, MODEL

def executar(client, temperature):

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

        temperature=temperature,

        max_tokens=1000,
        reasoning_effort="none"
    )

    return response.choices[0].message.content

def main():

    client = OpenAI(
        base_url=BASE_URL,
        api_key=API_KEY
    )

    temperatures = [
        0.0,
        0.2,
        0.5,
        0.8,
        1.0
    ]

    print(f"Modelo: {MODEL}")

    for temperature in temperatures:

        print()
        print("=" * 70)
        print(f"TEMPERATURE = {temperature}")
        print("=" * 70)

        answer = executar(
            client,
            temperature
        )

        print(answer)

if __name__ == "__main__":
    main()