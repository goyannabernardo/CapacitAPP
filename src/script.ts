import retornaDados, { Estatisticas, Contas } from "./lib/fetchDados.js";

const url = "https://api.origamid.dev/json/transacoes.json";

function preencherEstatisticas(estatisticas: Estatisticas): void {
    const totalElement = document.getElementById("total");
    const valorElement = document.getElementById("valor-total");
    const boletoElement = document.getElementById("boleto");
    const creditoElement = document.getElementById("credito");

    const pagaElement = document.getElementById("status-paga");
    const aguardandoElement = document.getElementById("status-aguardando");
    const recusadaElement = document.getElementById("status-recusada");
    const estornadaElement = document.getElementById("status-estornada");

    if (totalElement) totalElement.innerText = estatisticas.transacoes.toString();
    if (valorElement) valorElement.innerText = `R$ ${estatisticas.valorTotal}`;
    if (boletoElement) boletoElement.innerText = estatisticas.boleto.toString();
    if (creditoElement) creditoElement.innerText = estatisticas.credito.toString();

    if (pagaElement) pagaElement.innerText = estatisticas.pagas.toString();
    if (aguardandoElement) aguardandoElement.innerText = estatisticas.aguardando.toString();
    if (recusadaElement) recusadaElement.innerText = estatisticas.recusadas.toString();
    if (estornadaElement) estornadaElement.innerText = estatisticas.estornadas.toString();
}


// Constroi as colunas de forma mais eficiente e evita XSS
function preencherTabela(contas: Contas[]): void {
    const tabela = document.getElementById("tabela-corpo");
    if (!tabela) return;

    const fragmento = document.createDocumentFragment();

    contas.forEach((conta) => {
        const tr = document.createElement("tr");

        const celulas = [
            conta.nome,
            conta.email,
            `R$ ${conta.valor}`,
            conta.pagamento,
            conta.status,
            conta.data,
            conta.novo ? "Sim" : "Não",
        ];

        celulas.forEach((texto) => {
            const td = document.createElement("td");
            td.textContent = texto;
            tr.appendChild(td);
        });

        fragmento.appendChild(tr);
    });

    tabela.replaceChildren(fragmento);
}



// Roda os scrpits necessarios para receber os dados
async function iniciar() {
    const dados = await retornaDados(url);
    
    const containerDados = document.getElementById("container-dados");
    const telaErro = document.getElementById("tela-erro");

    if (!dados) {
        if (containerDados) containerDados.style.display = "none";
        if (telaErro) telaErro.style.display = "block";
        return;
    }

    if (containerDados) containerDados.style.display = "block";
    if (telaErro) telaErro.style.display = "none";

    preencherEstatisticas(dados.estatisticas);
    preencherTabela(dados.contasLimpas);
}

iniciar();