let contas = null;

function listarFiltros(tipo){
    let select = document.createElement("select");
    select.setAttribute("id", `select-filtro-${tipo}`);
    select.innerHTML = `
        <option value="" disabled selected>Selecione um filtro</option>
        <option value="saldomaiorquemil">Saldo maior que mil</option>
        <option value="saldototal">Saldo total</option>
        <option value="faixadesaldo">Agrupar por faixa de saldo</option>
        <option value="saldomaiorquecincomil">Saldo maior que 5 mil</option>
        <option value="numeropar">Contas com numero par</option>
        <option value="ordenarcontas">Contas ordenadas</option>
    `;
    return select;
}

async function listarContas() {
    let response = await fetch("http://localhost:8080/arquivo",
        { method: "GET" }
    );
    response = await response.json();

    const divListar = document.getElementById("div-listar");

    const p = divListar.querySelectorAll("p");
    p.forEach(p => p.remove());
    document.getElementById("select-contas")?.remove();
   response.forEach(conta => {
        divListar.innerHTML += `<p>Numero: ${conta.numero} - Titular: ${conta.titular} - Saldo: R$ ${conta.saldo}</p>`;
    });
    divListar.innerHTML += listarFiltros("contas").outerHTML;
    divListar.innerHTML += `<button onclick="aplicarFiltro('contas')">Aplicar filtro</button>`;
    contas = response;

    const divOperacoes = document.getElementById("div-operacoes");
    let select = document.createElement("select");
    select.setAttribute("id", "select-contas");
    contas.forEach(conta => {
        select.innerHTML += `<option value="${conta.numero}">Numero: ${conta.numero} - Titular: ${conta.titular} - Saldo: R$ ${conta.saldo}</option>`;
    });
    divOperacoes.innerHTML = select.outerHTML + divOperacoes.innerHTML;
    
}

async function listarContasAtualizadas() {
    let response = await fetch("http://localhost:8080/arquivo/atualizadas",
        { method: "GET" }
    );
    response = await response.json();

    const divListar = document.getElementById("div-listarAtualizadas");

    const p = divListar.querySelectorAll("p");
    p.forEach(p => p.remove());
    divListar.innerHTML = `<h2 id="h2-contas-atualizadas">Contas Atualizadas</h2>`;
   response.forEach(conta => {
        divListar.innerHTML += `<p>Numero: ${conta.numero} - Titular: ${conta.titular} - Saldo: R$ ${conta.saldo}</p>`;
    });
    divListar.innerHTML += listarFiltros("contas_atualizadas").outerHTML;
    divListar.innerHTML += `<button onclick="aplicarFiltro('contas_atualizadas')">Aplicar filtro</button>`;
    
    contas = response;
}

async function buscarPorNumero(){
    let numero = +document.getElementById("numeroBuscar").value;
    document.getElementById("numeroBuscar").value = "";
    let response = await fetch(`http://localhost:8080/arquivo/${numero}`,
        { method: "GET" }
    );
    response = await response.json();

    if(response === null){
        return alert("Conta não encontrada");
    }

    const divBuscar = document.getElementById("div-buscarPorNumero");
    const p = divBuscar.querySelectorAll("p");
    p.forEach(p => p.remove());
 
    divBuscar.innerHTML += `<p>Numero: ${response.numero} - Titular: ${response.titular} - Saldo: R$ ${response.saldo}</p>`;
}

async function sacar(){
    const select = +document.getElementById("select-contas").value;
    const valor = +document.getElementById("valorOperacao").value;

    const conta = {
        numero: select,
        titular: "padrao",
        saldo: valor
    }

    let response = await fetch("http://localhost:8080/arquivo/sacar",
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(conta)
        }
    );

    response = await response.json();

    listarContasAtualizadas();

    alert(response.mensagem)
}

async function depositar(){
    const select = +document.getElementById("select-contas").value;
    const valor = +document.getElementById("valorOperacao").value;

    const conta = {
        numero: select,
        titular: "padrao",
        saldo: valor
    }

    let response = await fetch("http://localhost:8080/arquivo/depositar",
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(conta)
        }
    );

    response = await response.json();

    listarContasAtualizadas();

    alert(response.mensagem)
}

async function tarifa(){
    const numero = +document.getElementById("select-contas").value;
    const tarifa = document.getElementById("select-tarifa").value;

    let response = await fetch(`http://localhost:8080/arquivo/tarifa/${tarifa}/${numero}`,{
         method: "GET"
    });

    response = await response.json();
    response = +response.mensagem;
    alert(`Tarifa: R$ ${response.toFixed(2)}`);
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

    let response = await fetch("http://localhost:8080/arquivo",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(conta)
        }
    );

    response = await response.json();

    listarContas();
    alert(response.mensagem);
}

//filtros
async function aplicarFiltro(caminho){
    const tipo = document.getElementById(`select-filtro-${caminho}`).value;
    caminho = caminho+".txt";
    if(tipo === "saldototal"){
        return filtroSaldoTotal(caminho);
    }
    if(tipo === "faixadesaldo"){
        return filtroFaixaDeSaldo(caminho);
    }

    let response = await fetch(`http://localhost:8080/arquivo/${tipo}/${caminho}`,{
         method: "GET"
    });
    response = await response.json();

    const nameDiv = caminho ==="contas.txt" ? "div-listar" : "div-listarAtualizadas";
    const divListar = document.getElementById(nameDiv);
    const p = divListar.querySelectorAll("p");
    p.forEach(p => p.remove());

    const nameH2 = caminho ==="contas.txt" ? "h2-contas" : "h2-contas-atualizadas";
    document.getElementById(nameH2)?.remove();
    document.getElementById("h2-filtradas")?.remove();

    document.getElementById('div-classe-a')?.remove();
    document.getElementById('div-classe-b')?.remove();
    document.getElementById('div-classe-c')?.remove();


    response.forEach(conta => {
        divListar.innerHTML += `<p>Numero: ${conta.numero} - Titular: ${conta.titular} - Saldo: R$ ${conta.saldo}</p>` ;
    });

    divListar.innerHTML = `<h2 id="h2-filtradas">Contas Filtradas</h2>` + divListar.innerHTML;
}

async function filtroSaldoTotal(caminho){
    let response = await fetch(`http://localhost:8080/arquivo/saldototal/${caminho}`,{
         method: "GET"
    });

    response = await response.json();

    alert(`O saldo total é de R$ ${response.mensagem}`);
}

async function filtroFaixaDeSaldo(caminho){
    let response = await fetch(`http://localhost:8080/arquivo/faixadesaldo/${caminho}`,{
         method: "GET"
    });
    response = await response.json();

    const nameDiv = caminho ==="contas.txt" ? "div-listar" : "div-listarAtualizadas";
    const divListar = document.getElementById(nameDiv);
    const p = divListar.querySelectorAll("p");
    p.forEach(p => p.remove());

    const nameH2 = caminho ==="contas.txt" ? "h2-contas" : "h2-contas-atualizadas";
    document.getElementById(nameH2)?.remove();
    document.getElementById("h2-filtradas")?.remove();

    const classeA = document.createElement("div");
    classeA.setAttribute("id", "div-classe-a");
    classeA.innerHTML = `Contas Classe A`;
    response.a.forEach(conta => {
        classeA.innerHTML += `<p>Numero: ${conta.numero} - Titular: ${conta.titular} - Saldo: R$ ${conta.saldo}</p>` ;
    })
    divListar.appendChild(classeA);

    const classeB = document.createElement("div");
    classeB.setAttribute("id", "div-classe-b");
    classeB.innerHTML = `Contas Classe B`;
    response.b.forEach(conta => {
        classeB.innerHTML += `<p>Numero: ${conta.numero} - Titular: ${conta.titular} - Saldo: R$ ${conta.saldo}</p>` ;
    })
    divListar.appendChild(classeB);

    const classeC = document.createElement("div");
    classeC.setAttribute("id", "div-classe-c");
    classeC.innerHTML = `Contas Classe C`;
    response.c.forEach(conta => {
        classeC.innerHTML += `<p>Numero: ${conta.numero} - Titular: ${conta.titular} - Saldo: R$ ${conta.saldo}</p>` ;
    })
    divListar.appendChild(classeC);

    divListar.innerHTML = `<h2 id="h2-filtradas">Contas Filtradas</h2>` + divListar.innerHTML;
}