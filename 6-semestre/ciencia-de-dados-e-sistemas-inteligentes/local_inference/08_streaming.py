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
    print("CHAT LOCAL COM STREAMING")
    print("=" * 70)

    print(f"Modelo: {MODEL}")
    print()
    print("Digite ':q' para encerrar.")
    print()

    while True:

        user_input = input("User: ")

        if user_input.lower() in [
            ":q",
        ]:
            break

        messages.append(
            {
                "role": "user",
                "content": user_input
            }
        )

        stream = client.chat.completions.create(

            model=MODEL,
            messages=messages,
            temperature=0.2,
            max_tokens=500,
            stream=True
        )

        answer_parts = []
        primeiro_fragmento = True

        print()
        print(">> ", end="", flush=True)

        for chunk in stream:

            if not chunk.choices:
                continue

            delta = chunk.choices[0].delta

            if delta.content:
                content = delta.content

                if primeiro_fragmento:
                    content = content.lstrip()
                    primeiro_fragmento = False

                answer_parts.append(content)
                print(
                    content,
                    end="",
                    flush=True
                )

        answer = "".join(answer_parts)

        print()
        print()

        messages.append(
            {
                "role": "assistant",
                "content": answer
            }
        )

if __name__ == "__main__":
    main()