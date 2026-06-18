export class Cards {
    constructor() {
        this.arrayCard = []
    }

    salvar(id,cartao,tipo,fatura,limite) {
        let produto = this.lerDados(
            id,
            cartao,
            tipo,
            fatura,
            limite,
        )
        this.arrayCard.push(produto)
    }

    lerDados(id,cartao,tipo,fatura,limite) {
        let card = {}
        
        card.id = id
        card.cartao = cartao
        card.tipo = tipo
        card.fatura = fatura
        card.limite = limite

        return card
    }
}
