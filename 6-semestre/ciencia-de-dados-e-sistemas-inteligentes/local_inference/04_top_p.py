from openai import OpenAI
from config import BASE_URL, API_KEY, MODEL

def executar(client, top_p):

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

        temperature=0.7,

        top_p=top_p,

        max_tokens=1000,
        reasoning_effort="none"
    )

    return response.choices[0].message.content

def main():

    client = OpenAI(
        base_url=BASE_URL,
        api_key=API_KEY
    )

    valores = [
        0.1,
        0.3,
        0.5,
        0.7,
        0.9,
        1.0
    ]

    print(f"Modelo: {MODEL}")

    for top_p in valores:

        print()
        print("=" * 70)
        print(f"TOP_P = {top_p}")
        print("=" * 70)

        answer = executar(
            client,
            top_p
        )

        print(answer)

if __name__ == "__main__":
    main()