from openai import OpenAI
from config import BASE_URL, API_KEY, MODEL

def main():

    client = OpenAI(
        base_url=BASE_URL,
        api_key=API_KEY
    )

    print(f"Modelo: {MODEL}")
    print("Enviando prompt...")
    print()

    response = client.chat.completions.create(
        model=MODEL,

        messages=[
            {
                "role": "user",
                "content": """
                Explique o que é um carro.
                """
            }
        ],

        max_tokens=300,
        reasoning_effort="none"
    )

    answer = response.choices[0].message.content

    print("LLM:")
    print(answer)

if __name__ == "__main__":
    main()