const btnCadastrar = document.getElementById("btn-cadastrar");
btnCadastrar.addEventListener("click", async (e) => {
    e.preventDefault();

    const dados = {};

    const nome = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    dados.usuario = { nome, email, senha };

    const rua = document.getElementById("rua").value;
    const bairro = document.getElementById("bairro").value;
    dados.endereco = { rua, bairro };

    const cpf = document.getElementById("cpf").value;
    const rg = document.getElementById("rg").value;
    const cnh = document.getElementById("cnh").value;
    dados.documento = { cpf, rg, cnh };

    const mensagem = document.getElementById("mensagem");


    try {
        const response = await fetch('http://localhost:3000/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        const mensagemData = await response.clone().json();
        console.log(mensagemData);
        mensagem.innerText = "Cadastro realizado com sucesso!";
        
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
    }
});

