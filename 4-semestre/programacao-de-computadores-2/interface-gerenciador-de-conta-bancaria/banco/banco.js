async function listarContas(){
    let response = await fetch("http://localhost:8080/banco",
        {
            method: "GET"
        }
    );
    response = await response.json();

    const divListar = document.getElementById("div-listar");

    const p = divListar.querySelectorAll("p");
    p.forEach(p => p.remove());

    response.forEach(conta => {
        divListar.innerHTML += `<p>Numero: ${conta.numero} - Titular: ${conta.titular} - Saldo: R$ ${conta.saldo}</p>`;
    });
}

async function buscarPorNumero(){
    const numero = +document.getElementById("numeroBuscar").value;
    document.getElementById("numeroBuscar").value = "";
    const response = await fetch(`http://localhost:8080/banco/${numero}`,
        {
            method: "GET"
        }
    );
    const conta = await response.json();
    if(conta === null){
        return alert("Conta não encontrada");
    }

    const divBuscar = document.getElementById("div-buscarPorNumero");
    const p = divBuscar.querySelectorAll("p");
    p.forEach(p => p.remove());
    divBuscar.innerHTML += `<p>Numero: ${conta.numero} - Titular: ${conta.titular} - Saldo: R$ ${conta.saldo}</p>`;
}

async function inserirConta(){

    const conta = {
        numero: +document.getElementById("numeroInserir").value,
        titular: document.getElementById("titularInserir").value,
        saldo: +document.getElementById("saldoInserir").value
    }

    document.getElementById("numeroInserir").value = "";
    document.getElementById("titularInserir").value = "";
    document.getElementById("saldoInserir").value = "";

    let response = await fetch("http://localhost:8080/banco",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(conta)
        }
    );

    response = await response.json();

    alert(response.mensagem);
}

async function atualizarSaldo(){
    const conta = {
        numero: +document.getElementById("numeroAtualizar").value,
        titular: "padrao",
        saldo: +document.getElementById("saldoAtualizar").value
    }

    document.getElementById("numeroAtualizar").value = "";
    document.getElementById("saldoAtualizar").value = "";

    console.log(conta);
    let response = await fetch("http://localhost:8080/banco",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(conta)
        }
    );
    
    response = await response.json();
    alert(response.mensagem);
}

async function excluirConta(){
    const numero = +document.getElementById("numeroExcluir").value;
    document.getElementById("numeroExcluir").value = "";

    let response = await fetch(`http://localhost:8080/banco/${numero}`,
        {
            method: "DELETE"
        }
    );

    response = await response.json();
    alert(response.mensagem);
}
        
async function transferencia(){
    const transferencia = {
        numeroOrigem: +document.getElementById("numeroOrigem").value,
        numeroDestino: +document.getElementById("numeroDestino").value,
        valor: +document.getElementById("valorTransferencia").value
    }
    const response = await fetch("http://localhost:8080/banco/transferir",
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transferencia)
        }
    );

    let mensagem = await response.json();
    mensagem = mensagem.mensagem;


    if(response.status === 500){
       return alert("saldo insuficiente");
    }

    if(response.status !== 200){
        return alert("Erro inesperado");
    }
    

    return alert(mensagem);
}