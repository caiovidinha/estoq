export class Categorias {
    constructor() {
        this.id = 1
        this.arrayCat = []
    }

    salvar(categoria, valor) {
        let categorias = this.lerDados(categoria, valor)
        this.arrayCat.push(categorias)
    }

    lerDados(categoria, valor) {
        let categorias = {}
        categorias.id = this.id
        categorias.categoria = categoria
        categorias.valor = valor

        this.id++
        return categorias
    }
}
