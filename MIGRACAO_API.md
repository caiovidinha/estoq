# 🔄 Migração para API REST - Status e Próximos Passos

## ✅ O que já foi feito:

### 1. Criado Serviço de API (`src/services/api.js`)
- ✅ Configuração da base URL da API
- ✅ Funções para todas as operações de transações (conta e crédito):
  - `getTransacoes()` - Listar com filtros e paginação
  - `createTransacao()` - Criar nova transação
  - `updateTransacao()` - Atualizar transação existente
  - `deleteTransacao()` - Deletar transação
  - `getTransacoesCredito()` - Listar transações de crédito
  - `createTransacaoCredito()` - Criar transação de crédito
  - `updateTransacaoCredito()` - Atualizar transação de crédito
  - `deleteTransacaoCredito()` - Deletar transação de crédito
- ✅ Funções para configurações:
  - `getCategorias()` - Buscar categorias
  - `getMeses()` - Buscar meses
  - `getContas()` - Buscar contas
  - `getCartoes()` - Buscar cartões
  - `getStatus()` - Buscar status baseado no tipo
- ✅ Helpers de formatação de data e valor

### 2. Criados Hooks Customizados (`src/hooks/useFormOptions.js`)
- ✅ `useCategorias()` - Hook para buscar categorias
- ✅ `useMeses()` - Hook para buscar meses
- ✅ `useContas()` - Hook para buscar contas com refetch
- ✅ `useCartoes()` - Hook para buscar cartões com refetch
- ✅ `useStatus(tipo)` - Hook para buscar status baseado no tipo

### 3. Atualizado Header/Navegação
- ✅ Ocultadas páginas de "Categorias" e "Balanço Mensal" temporariamente
- ✅ Ajustado grid do menu desktop de 5 para 3 colunas
- ✅ Menu mobile também atualizado

---

## 🔧 Próximos Passos (Para Fazer):

### 4. Atualizar Modais de Criação de Transações

Você tem 6 modais principais que precisam ser atualizados:
- `AddIncomeModalConta.jsx` - Receita em conta
- `AddExpenseModalConta.jsx` - Despesa em conta
- `AddIncomeModalCredito.jsx` - Receita em crédito
- `AddExpenseModalCredito.jsx` - Despesa em crédito
- `AddIncomeModalBus.jsx` - Receita (antigo)
- `AddExpenseModalBus.jsx` - Despesa (antigo)

**Mudanças necessárias em cada modal:**

1. **Importar os hooks:**
```jsx
import { useCategorias, useMeses, useContas, useCartoes } from '@/hooks/useFormOptions'
import { createTransacao, createTransacaoCredito, formatValorParaAPI, formatDataParaAPI } from '@/services/api'
```

2. **Usar os hooks no componente:**
```jsx
const { categorias, loading: loadingCat } = useCategorias()
const { meses, loading: loadingMes } = useMeses()
const { contas, loading: loadingContas } = useContas() // Para conta
const { cartoes, loading: loadingCartoes } = useCartoes() // Para crédito
```

3. **Substituir o fetch do Google Sheets pela API:**

**ANTES:**
```jsx
const res = await fetch('/api/createTransaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
})
```

**DEPOIS (para transações de conta):**
```jsx
const transacao = {
    tipo: 'Receita', // ou 'Despesa'
    descritivo: categoria,
    valor: formatValorParaAPI(valor), // R$ 150,00
    data: formatDataParaAPI(new Date(data)), // DD/MM/YYYY
    mes: mes,
    detalhes: descricao,
    situacao: status, // 'Pago', 'A pagar', 'Recebido', 'A receber'
    conta: conta
}

await createTransacao(transacao)
```

**DEPOIS (para transações de crédito):**
```jsx
const transacao = {
    tipo: 'Receita', // ou 'Despesa'
    descritivo: categoria,
    valor: formatValorParaAPI(valor),
    data: formatDataParaAPI(new Date(data)),
    mes: mes,
    detalhes: descricao,
    situacao: status,
    cartao: cartao
}

await createTransacaoCredito(transacao)
```

4. **Atualizar dropdowns para usar os dados da API:**

**ANTES (exemplo com Google Sheets):**
```jsx
useEffect(() => {
    const fetchContas = async () => {
        // código complexo do Google Sheets
    }
    fetchContas()
}, [])
```

**DEPOIS:**
```jsx
// Apenas use o hook - não precisa de useEffect!
const { contas } = useContas()

// Depois use no Dropdown:
<Dropdown>
    {contas.map(conta => (
        <Dropdown.Item key={conta}>{conta}</Dropdown.Item>
    ))}
</Dropdown>
```

---

### 5. Atualizar Página de Movimentações (`src/pages/movimentacoes.jsx`)

**Mudanças necessárias:**

1. **Importar serviços:**
```jsx
import { getTransacoes, getTransacoesCredito, updateTransacao, deleteTransacao, updateTransacaoCredito, deleteTransacaoCredito } from '@/services/api'
```

2. **Substituir busca de dados:**
```jsx
// Estado para paginação
const [page, setPage] = useState(1)
const [pageSize, setPageSize] = useState(20)
const [totalPages, setTotalPages] = useState(1)

// Buscar transações
const fetchTransacoes = async () => {
    try {
        const filters = {
            page: page,
            page_size: pageSize,
            mes: mesFilter, // se tiver filtro
            situacao: statusFilter, // se tiver filtro
            order_by: 'data'
        }
        
        const data = await getTransacoes(filters)
        setTransacoes(data.items)
        setTotalPages(data.total_pages)
    } catch (error) {
        console.error('Erro ao buscar transações:', error)
    }
}

useEffect(() => {
    fetchTransacoes()
}, [page, mesFilter, statusFilter])
```

3. **Adicionar botões de editar e excluir:**
```jsx
// Em cada linha da tabela:
<button onClick={() => handleEdit(transacao.row_index)}>
    Editar
</button>
<button onClick={() => handleDelete(transacao.row_index)}>
    Excluir
</button>

// Funções:
const handleDelete = async (rowIndex) => {
    if (confirm('Deseja realmente excluir esta transação?')) {
        await deleteTransacao(rowIndex)
        fetchTransacoes() // Recarregar lista
    }
}

const handleEdit = async (rowIndex) => {
    // Abrir modal com dados da transação
    // Ao salvar, usar updateTransacao(rowIndex, dados)
}
```

4. **Adicionar paginação:**
```jsx
<div className="flex gap-2 mt-4">
    <button 
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
    >
        Anterior
    </button>
    <span>Página {page} de {totalPages}</span>
    <button 
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
    >
        Próxima
    </button>
</div>
```

---

### 6. Atualizar Página A Pagar/Receber (`src/pages/aPagar.jsx`)

Similar à página de movimentações, mas com filtros específicos:

```jsx
// Filtrar apenas pendentes
const filters = {
    situacao: 'A pagar', // ou 'A receber'
    order_by: 'data'
}

const data = await getTransacoes(filters)
```

Adicionar:
- Botão para marcar como pago/recebido
- Filtros por data
- Filtros por categoria
- Total de contas a pagar/receber

---

## 📊 Formato de Dados da API

### Transação (Conta):
```json
{
  "tipo": "Despesa",
  "descritivo": "Supermercado",
  "valor": "R$ 150,00",
  "data": "02/01/2026",
  "mes": "Janeiro",
  "detalhes": "Compras mensais",
  "situacao": "Pago",
  "conta": "Conta Corrente",
  "row_index": 2
}
```

### Transação (Crédito):
```json
{
  "tipo": "Despesa",
  "descritivo": "Restaurante",
  "valor": "R$ 85,00",
  "data": "02/01/2026",
  "mes": "Janeiro",
  "detalhes": "Almoço",
  "situacao": "Pago",
  "cartao": "Nubank",
  "row_index": 5
}
```

---

## 🎯 Benefícios da Migração:

✅ **Performance**: API mais rápida que Google Sheets  
✅ **Paginação**: Não precisa carregar todos os dados de uma vez  
✅ **Filtros**: Filtros eficientes no servidor  
✅ **CRUD completo**: Criar, editar e deletar facilmente  
✅ **Tipagem**: Dados estruturados e validados  
✅ **Escalabilidade**: Preparado para crescer  

---

## 📝 Notas Importantes:

1. **row_index**: Sempre vem da API ao listar. Use ele para UPDATE e DELETE.
2. **Formato de data**: A API usa DD/MM/YYYY (02/01/2026)
3. **Formato de valor**: A API usa R$ 150,00 (com vírgula)
4. **Paginação**: Sempre use paginação, não carregue tudo de uma vez
5. **Erros**: Sempre trate erros com try/catch e mostre mensagens ao usuário

---

## 🚀 Para Testar:

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Abra o console do navegador (F12)
3. Teste as funções da API diretamente:
```javascript
import { getCategorias } from '@/services/api'
getCategorias().then(console.log)
```

4. Verifique se os links de Categorias e Balanço Mensal sumiram do menu

---

## 📞 Dúvidas?

A documentação completa da API está em `API.md` na raiz do projeto!
