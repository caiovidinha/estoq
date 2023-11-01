export class Mov {
    constructor() {
        this.id = 1
        this.arrayMov = []
    }

    salvar(tipo, descritivo, valor, data, mes, detalhes, situacao, conta) {
        let produto = this.lerDados(
            tipo,
            descritivo,
            valor,
            data,
            mes,
            detalhes,
            situacao,
            conta
        )
        this.arrayMov.push(produto)
    }

    lerDados(tipo, descritivo, valor, data, mes, detalhes, situacao, conta) {
        let produto = {}
        produto.dataRaw = data
        data = data.replace(/[^0-9,]/g, '')

        if (data[6] === ',') {
            data = data.slice(0, 5) + '0' + data.slice(5)
        }
        let month = parseInt(data.slice(5, 7)) + 1
        let day = data.slice(8)
        if(day.length === 1) day = '0' + day
        data = day + '/' + month + '/' + data.slice(0, 4)
        produto.id = this.id
        produto.tipo = tipo
        produto.descritivo = descritivo
        produto.valor = valor
        produto.data = data
        produto.mes = mes
        produto.detalhes = detalhes
        produto.situacao = situacao
        produto.conta = conta
        

        this.id++
        return produto
    }
}
