from openai import OpenAI

import time

BASE_URL = "http://localhost:5050/v1"
API_KEY = "lm-studio"

MODELS = [
    "smollm3-3b",
    "liquid/lfm2.5-1.2b"
]

def main():

    client = OpenAI(
        base_url=BASE_URL,
        api_key=API_KEY
    )

    prompt = """
O meu carro não liga. Ao tentar dar a partida, é possível ouvir o motor de arranque, 
mas o motor não pega.

Depois de algumas tentativas de ligar o carro, fica um cheiro muito forte de combustível.

Realizar o diagnóstico deste problema.
"""

    print("=" * 70)
    print("BENCHMARK DE INFERÊNCIA")
    print("=" * 70)

    for model in MODELS:

        print()
        print("=" * 70)
        print(f"MODELO: {model}")
        print("=" * 70)

        inicio = time.perf_counter()

        response = client.chat.completions.create(

            model=model,

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.2,

            max_tokens=4096
        )

        fim = time.perf_counter()

        tempo_total = fim - inicio

        message = response.choices[0].message

        reasoning = getattr(message, "reasoning_content", None)

        answer = message.content

        print("REASONING")
        print("-" * 70)
        print(reasoning or "Nenhum raciocínio foi retornado pelo modelo.")

        print()
        print("RESPOSTA")
        print("-" * 70)
        print(answer or "Nenhuma resposta final foi retornada.")

        print()
        print("MÉTRICAS")
        print("-" * 70)

        print(f"Motivo de finalização: {response.choices[0].finish_reason}")
        print(f"Tempo total: {tempo_total:.2f} segundos")

        if response.usage:

            input_tokens = response.usage.prompt_tokens
            output_tokens = response.usage.completion_tokens
            total_tokens = response.usage.total_tokens

            completion_details = getattr(
                response.usage,
                "completion_tokens_details",
                None
            )

            reasoning_tokens = getattr(
                completion_details,
                "reasoning_tokens",
                None
            )

            text_tokens = getattr(
                completion_details,
                "text_tokens",
                None
            )

            print(f"Input tokens: {input_tokens}")
            print(f"Output tokens: {output_tokens}")
            print(f"Total tokens: {total_tokens}")
            print(
                "Tokens de reasoning: "
                f"{reasoning_tokens if reasoning_tokens is not None else 'não informado'}"
            )
            print(
                "Tokens de texto: "
                f"{text_tokens if text_tokens is not None else 'não informado'}"
            )

            if output_tokens > 0:

                tokens_por_segundo = output_tokens / tempo_total

                print(
                    f"Tokens/segundo aproximados: "
                    f"{tokens_por_segundo:.2f}"
                )

if __name__ == "__main__":
    main()