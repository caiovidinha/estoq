export class Accounts {
    constructor() {
        this.arrayAccounts = []
    }

    salvar(id,conta,saldo) {
        let produto = this.lerDados(
            id,
            conta,
            saldo
        )
        this.arrayAccounts.push(produto)
    }

    lerDados(id,conta,saldo) {
        let account = {}
        
        account.id = id
        account.conta = conta
        account.saldo = saldo

        return account
    }
}
