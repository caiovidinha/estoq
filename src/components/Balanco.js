export class Balanco {
    constructor() {
        this.id = 1
        this.arrayBal = []
    }

    salvar(ano, mes, valor) {
        let balanco = this.lerDados(ano, mes, valor)
        this.arrayBal.push(balanco)
    }

    lerDados(ano, mes, valor) {
        let balanco = {}
        balanco.id = this.id
        balanco.ano = ano
        balanco.mes = mes
        balanco.valor = valor

        this.id++
        return balanco
    }
}
