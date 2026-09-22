from openai import OpenAI
from config import BASE_URL, API_KEY, MODEL


def main():

    client = OpenAI(
        base_url=BASE_URL,
        api_key=API_KEY
    )

    messages = [

        {
            "role": "system",
            "content": """
Você é um engenheiro senior em diagnóstico automotivo.
Analise sintomas de automóveis de forma clara e objetiva.

Apresente possíveis causas, verificações recomendadas e riscos.
Não forneça um diagnóstico definitivo sem evidências e avise
quando for necessário realizar testes mais aprofundados.
"""
        }
    ]

    print("=" * 70)
    print("CHAT LOCAL")
    print("=" * 70)

    print(f"Modelo: {MODEL}")
    print()
    print("Digite ':q' para encerrar.")
    print()

    while True:

        user_input = input("User: ")

        if user_input.lower() in [
            ":q"
        ]:
            break

        messages.append(
            {
                "role": "user",
                "content": user_input
            }
        )

        response = client.chat.completions.create(

            model=MODEL,
            messages=messages,
            temperature=0.2,
            max_tokens=500
        )

        answer = response.choices[0].message.content or ""
        answer = answer.lstrip()

        print()
        print(">> ", end="", flush=True)
        print(answer)
        print()

        messages.append(
            {
                "role": "assistant",
                "content": answer
            }
        )


if __name__ == "__main__":
    main()
