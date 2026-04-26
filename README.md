# Tabela de Preços · Semper Fire

Site interno de consulta de preços para os funcionários da Semper Fire.

🔗 **Acesso:** https://precos-semper-fire.pages.dev (após deploy)

🔐 **Senha:** `semperfire2026`

## Stack

- HTML + CSS + JS puros (zero dependências)
- Hospedado no Cloudflare Pages
- Dados embutidos no próprio HTML (carrega instantâneo, funciona offline depois do primeiro acesso)

## Estrutura de arquivos

```
.
├── index.html        ← Site (com dados embutidos)
├── style.css         ← Estilos (tema claro, verde-petróleo)
├── app.js            ← Lógica (login, busca, filtros)
├── dados.json        ← Catálogo de produtos (gerado mensalmente)
└── README.md         ← Este arquivo
```

## Atualização mensal (fluxo do Rodrigo)

A planilha master `Tabela_de_preco_geral_<mes>_<ano>.xlsx` continua sendo o sistema de verdade. O site consome um JSON gerado dela.

**Fluxo proposto (sempre que chegar PDF de fornecedor novo):**

1. Rodrigo manda o PDF do fornecedor + planilha atual pro Claude
2. Claude atualiza a planilha master (fórmulas, markups, filtros anti-CBC)
3. Claude gera 3 entregáveis:
   - `Tabela_de_preco_geral_<mes>_<ano>.xlsx` (planilha atualizada)
   - `dados.json` (catálogo só com preços finais — sem custo, sem margem)
   - `Tabela_Precos_Semper_Fire_<mes>_<ano>.pdf` (pra mandar no WhatsApp)
4. Rodrigo:
   - Substitui o `dados.json` no GitHub (drag-and-drop ou commit)
   - Cloudflare faz deploy automático em ~1 min
   - Manda o PDF pros funcionários no WhatsApp

**Tempo total mensal:** ~1 minuto (só o commit do JSON).

## Categorias e fornecedores

Catálogo atual:

| Fornecedor | Produtos | Categorias |
|---|---|---|
| CBC | 271 | Armas + Munição |
| PAVEI | 151 | Armas + Carregadores (filtrado anti-CBC, marcas: TAURUS, ROSSI, BROWNING, HATSAN, BRESCIA, MECGAR, ATA, BRIGADE) |
| GLOCK | 24 | Armas (markup 45% sobre preço lojista SP) |
| **Total** | **446** | |

## Filtros do site

- **Busca:** texto livre (suporta múltiplas palavras: "9mm taurus", "calibre 38", "carabina rossi")
- **Categoria:** Armas / Munição / Carregadores
- **Fornecedor:** CBC / PAVEI / GLOCK
- **Marca:** TAURUS, ROSSI, BROWNING, GLOCK, CBC, etc.
- **Ordenação:** por categoria / A-Z / preço crescente / preço decrescente

## Trocar a senha

A senha é validada por hash SHA-256 no JavaScript. Pra trocar:

1. Calcule o hash da nova senha:
   ```bash
   echo -n "novaSenha" | sha256sum
   ```
2. Edite `app.js`, primeira linha não-comentário:
   ```js
   const SENHA_HASH = 'cole_o_hash_aqui';
   ```
3. Commita.

⚠ **Importante:** essa senha não é segurança real — é só um obstáculo casual. Qualquer pessoa que abra o "view source" do site consegue ver o hash. Se precisar de proteção real, use o Cloudflare Access (igual no dashboard).

## Deploy no Cloudflare Pages

1. Repositório no GitHub: `rodrigobochichio-hub/tabela-precos-semper-fire`
2. No Cloudflare Pages → "Create project" → "Connect to Git" → escolhe o repo
3. Build settings:
   - **Build command:** (deixar vazio)
   - **Build output directory:** `/`
4. Deploy automático a cada commit no branch `main`

URL final: `precos-semper-fire.pages.dev` (ou customizado depois)
