from openai import OpenAI
from config import BASE_URL, API_KEY, MODEL

def main():

    client = OpenAI(
        base_url=BASE_URL,
        api_key=API_KEY
    )

    print("Modelos disponibilizados pelo LM Studio:")

    models = client.models.list()

    # print(models)
    for model in models.models:
        print(f"- {model}")
 
if __name__ == "__main__":
    main()