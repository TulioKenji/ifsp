REGRAS_TITANIC = [

    # ============================================================
    # REGRAS PARA PASSAGEIRAS DO SEXO FEMININO
    # ============================================================

    {
        "id": "R01",
        "condicoes": [
            ("Sex", "==", "female"),
            ("Pclass", "<=", 2)
        ],
        "resultado": "SOBREVIVE"
    },

    {
        "id": "R02",
        "condicoes": [
            ("Sex", "==", "female"),
            ("Pclass", ">", 2),
            ("Age", "<", 18)
        ],
        "resultado": "SOBREVIVE"
    },

    {
        "id": "R03",
        "condicoes": [
            ("Sex", "==", "female"),
            ("Pclass", ">", 2),
            ("Age", ">=", 18),
            ("Parch", ">", 0)
        ],
        "resultado": "SOBREVIVE"
    },

    {
        "id": "R04",
        "condicoes": [
            ("Sex", "==", "female"),
            ("Pclass", ">", 2),
            ("Age", ">=", 18),
            ("Parch", "==", 0)
        ],
        "resultado": "NAO_SOBREVIVE"
    },


    # ============================================================
    # REGRAS PARA PASSAGEIROS DO SEXO MASCULINO
    # ============================================================

    {
        "id": "R05",
        "condicoes": [
            ("Sex", "==", "male"),
            ("Pclass", "<=", 2),
            ("Age", "<", 18)
        ],
        "resultado": "SOBREVIVE"
    },

    {
        "id": "R06",
        "condicoes": [
            ("Sex", "==", "male"),
            ("Pclass", "<=", 2),
            ("Age", ">=", 18),
            ("Fare", ">", 50)
        ],
        "resultado": "SOBREVIVE"
    },

    {
        "id": "R07",
        "condicoes": [
            ("Sex", "==", "male"),
            ("Pclass", "<=", 2),
            ("Age", ">=", 18),
            ("Fare", "<=", 50)
        ],
        "resultado": "NAO_SOBREVIVE"
    },

    {
        "id": "R08",
        "condicoes": [
            ("Sex", "==", "male"),
            ("Pclass", ">", 2),
            ("Age", "<", 15)
        ],
        "resultado": "SOBREVIVE"
    },

    {
        "id": "R09",
        "condicoes": [
            ("Sex", "==", "male"),
            ("Pclass", ">", 2),
            ("Age", ">=", 15)
        ],
        "resultado": "NAO_SOBREVIVE"
    }
]
