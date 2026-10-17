import { numerizarValor, valorMoeda } from "./utils.js";

interface ContasBruto {
    Status: string;
    ID: number;
    Data: string;
    Nome: string;
    ['Forma de Pagamento']: string;
    Email: string;
    ['Valor (R$)']: string;       
    ['Cliente Novo']: number;     
}


export interface Estatisticas {
    transacoes: number;
    valorTotal: string;
    
    credito: number;
    boleto: number; 
    
    pagas: number;
    recusadas: number;
    aguardando: number;
    estornadas: number;
}


export interface Contas {
    nome: string;
    email: string;
    
    valor: string; 
    Pagamento: string;
    
    status: string;
    data: string;
    novo: boolean;
}



function isContaBruta(valor: unknown): valor is ContasBruto {
    if (typeof valor !== "object" || valor === null) {
        return false;
    }

    const conta = valor as Record <string, unknown>;

    return (
        typeof conta.Status === "string" &&
        typeof conta.ID === "number" &&
        typeof conta.Data === "string" &&
        typeof conta.Nome === "string" &&
        typeof conta["Forma de Pagamento"] === "string" &&
        typeof conta.Email === "string" &&
        typeof conta["Valor (R$)"] === "string" &&
        typeof conta["Cliente Novo"] === "number"
    );
}



async function puxarDados(url: string): Promise<ContasBruto[] | null> {
    try {
        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error(`Erro: ${resposta.status}`);
        }

        const dados: unknown = await resposta.json();

        if (!Array.isArray(dados)) {
            throw new Error("A API não retornou um array.");
        }

        // Filtra os itens baseado no Type Guard
        return dados.filter(isContaBruta);

    } catch (error) {
        if (error instanceof Error) {
            console.error("API falhou: " + error.message);
        }
        return null;
    }
}



function processarEstatisticas(listaBruta: ContasBruto[]): Estatisticas {
    let totalTransacoes = listaBruta.length;
    let somaValores = 0;
    
    let totalCredito = 0;
    let totalBoleto = 0;
    
    let totalPagas = 0;
    let totalRecusadas = 0;
    let totalAguardando = 0;
    let totalEstornadas = 0;

    listaBruta.forEach((conta) => {
        if (conta["Forma de Pagamento"] === "Cartão de Crédito") totalCredito++;
        else if (conta["Forma de Pagamento"] === "Boleto") totalBoleto++;
        
        switch (conta.Status) {
            case "Paga":
                totalPagas++;
                break;
            case "Recusada pela operadora de cartão":
                totalRecusadas++;
                break;
            case "Aguardando pagamento":
                totalAguardando++;
                break;
            case "Estornada":
                totalEstornadas++;
                break;
        }
        
        somaValores += numerizarValor(conta["Valor (R$)"]);
    });

    return {
        transacoes: totalTransacoes,
        valorTotal: valorMoeda(somaValores),
        credito: totalCredito,
        boleto: totalBoleto,
        pagas: totalPagas,
        recusadas: totalRecusadas,
        aguardando: totalAguardando,
        estornadas: totalEstornadas
    };
}



function processaBrutos(listaBruta: ContasBruto[]): Contas[] {
    return listaBruta.map((conta) => {
        return {
            nome: conta.Nome,
            email: conta.Email,
            valor: conta["Valor (R$)"],
            Pagamento: conta["Forma de Pagamento"],
            status: conta.Status,
            data: conta.Data,
            novo: Boolean(conta["Cliente Novo"])
        };
    });
}



export default async function retornaDados(url: string): Promise<{ estatisticas: Estatisticas; contasLimpas: Contas[] } | null> {
    const dadosBrutos = await puxarDados(url);
    
    if (!dadosBrutos || dadosBrutos.length === 0) {
        return null;
    }

    const estatisticas = processarEstatisticas(dadosBrutos);
    const contasLimpas = processaBrutos(dadosBrutos);

    return {
        estatisticas,
        contasLimpas
    };
}