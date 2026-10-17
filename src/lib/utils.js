export function numerizarValor(moeda) {
    if (moeda === '-') {
        return 0;
    }
    else {
        return Number(moeda.replace("R$", "").replaceAll(".", "").replace(",", ".").trim());
    }
}
export function valorMoeda(valor) {
    return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
