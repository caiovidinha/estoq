export class Balanco {
    constructor() {
        this.id = 1
        this.arrayBal = []
    }

    salvar(ano, mes, valor, salario) {
        let balanco = this.lerDados(ano, mes, valor, salario)
        this.arrayBal.push(balanco)
    }

    lerDados(ano, mes, valor, salario) {
        let balanco = {}
        balanco.id = this.id
        balanco.ano = ano
        balanco.mes = mes
        balanco.valor = valor
        balanco.salario = salario

        this.id++
        return balanco
    }
}
