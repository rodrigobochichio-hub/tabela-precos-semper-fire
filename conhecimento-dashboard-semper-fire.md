# Conhecimento migrado — projeto Dashboard-SemperFire

> Pacote consolidado em 18/out/2026 para o projeto **Automação Semper Fire**.
> Instruções do projeto de origem: "Dashboard do Semper Fire para controle e gestão."

---

## 1. Dashboard Operacional Semper Fire

Dashboard Operacional do Semper Fire (clube de tiro + loja de armas, SP). Arquivo único HTML/CSS/JS puro, sem build. Despachante/Loja/Insumos/Faturamento/Laudos leem ao vivo Google Sheets publicados como CSV; **Financeiro (Fluxo de Caixa + Mov. Bancária 2026) lê `dados-financeiro.js` do próprio repo (desde v7.4)**.

- **GitHub:** https://github.com/rodrigobochichio-hub/dashboard-semper-fire (privado). Pasta local no Mac: `~/Documents/Dashboard-SemperFire/` (clone via SSH).
- **Dashboard ao vivo:** https://dashboard-semper-fire.pages.dev/ (Cloudflare Pages). Pages serve o `index.html` da RAIZ — a cada versão nova, copiar `dashboard-v6/index_vX.Y.html` → `index.html` da raiz. Cada versão é um novo arquivo `index_vX.Y.html` (nunca sobrescrever) + bump da CACHE_KEY + linha no changelog do README (seção 11).
- **Versão vigente: v7.4** (10/out/2026), CACHE_KEY `semperfire-dashboard-cache-v7-4`. Histórico: v7.0 = seção FINANCEIRO; v7.1 = Insumos AGO/SET; v7.2 = Insumos OUT/NOV/DEZ; v7.3 = Fluxo de Caixa JUL/AGO/SET; v7.4 = financeiro via `dados-financeiro.js` + correção Mov. Bancária 2026.
- **Seções:** Despachante (Concessão CR, Processos, Pasta/E-mail, Renovação CRAF, Deferido/Indeferido, Laudos novos CR), Loja, Insumos, Financeiro.

### Acesso do Claude (desde out/2026)
- Rodrigo quer que o Claude tenha acesso direto ao git e ele só passe as demandas. GitHub App "Claude" instalado em rodrigobochichio-hub com **All repositories** → Claude clona, commita e dá push direto em `main` (deploy automático nos 2 projetos Pages). Commits como rodrigobochichio-hub.
- **Nunca dar push em branch de teste com dados sensíveis sem checar Access** — toda branch gera preview `<branch>.dashboard-semper-fire.pages.dev`.
- Ambiente cloud do Claude não alcança docs.google.com pelo shell; ler planilhas via conector Google Drive ou Claude in Chrome (fetch com `credentials:'omit'` p/ testar acesso anônimo).

### Financeiro (v7.4) — atualização sob demanda
- Rodrigo não quer planilhas financeiras abertas na internet; Claude lê o Drive e atualiza sob demanda. Renata (financeiro) usa sempre a pasta Drive "Fluxo de caixa" (id 1ufUiJ3whyoUCjX6CNgRMGkJIqCu3KNpR, em Clube Semper Fire › Financeiro). Arquivos mensais na subpasta 1WRdzP-chrWIqTTlhWen7q07Sgpf9OApN: "Fluxo Caixa <mês> 26 - Clube-Loja.xlsx" (owner rlovisaro), abas CLUBE / LOJA / RESUMO / ANALISE.
- **`dados-financeiro.js` (raiz do repo)** define `window.SF_FINANCEIRO = { atualizadoEm, fluxo2026: { mes: {label,nome,arquivoDrive,planos:[[nome,clube,loja,total]],tipos:[...],totClube,totLoja,totGeral} }, movban2026: {clube:{rec[12],desp[12]}, loja:{rec[12],desp[12]}} }`. `FLUXO_2026` é derivado dele.
- **"Atualiza o financeiro" / mês novo:** achar o arquivo no Drive (`title contains 'Clube-Loja'`), ler a seção RESUMO (plano de contas CLUBE|%|LOJA|%|TOTAL; DESPESAS POR TIPO Fixo/Variável/Investimento), transcrever, **validar** clube+loja=total por linha e soma = TOTAL GERAL; adicionar mês em `fluxo2026`; atualizar `atualizadoEm`; commit/push; conferir no ar.
- **Mov. Bancária 2026:** fonte "RESULTADO ANUAL.xlsx" (id 1s2bg2knp3RBKVWIQP4E7JPgBhNKjIPwO), bloco 2026: Clube RECEITA/DESPESA/SALDO C/C, Loja RECEITA/DESPESA, consolidado (usar p/ validar). Jan–set/26 carregados (clube rec 1.409.464,76 / desp 1.511.700,98; loja rec 417.832,98 / desp 382.181,39). 2022–2025 hard-coded em `HIST`.
- Bug corrigido out/2026: até v7.3 a Mov. Bancária 2026 exibia o bloco 2022 (gviz gid 94216299).
- Fluxo de Caixa 2026 (total geral): jan 169.425,12 · fev 178.357,16 · mar 229.084,76 · abr 208.062,71 · mai 211.445,59 · jun 217.803,66 · jul 205.513,36 · ago 260.352,80 · set 210.779,85.

### Segurança
- Pasta raiz "Clube Semper Fire" no Drive restrita (sem "qualquer pessoa com o link"); fluxos de caixa jan–jun despublicados. Acesso explícito: Rodrigo (owner), Renata (rlovisaro), Cayo, Raphael. Funcionários precisam ser compartilhados por e-mail.
- **Cloudflare Access** (team semperfire, OTP e-mail): app `dashboard-semper-fire` → policy "Equipe Semper Fire"; destinations `dashboard-semper-fire.pages.dev` + `*.dashboard-semper-fire.pages.dev` (previews, 10/out/2026). App `dashboard-despachante-semper-fire` → policy "Funcionario Semper Fire" (Katia + Rodrigo). Pendente opcional: apagar preview antigo da branch `v7-4` (commit 38d9d2e).
- **Ainda públicas (publish-to-web):** Despachante (⚠️ aba CR expõe LOGIN e SENHA gov.br dos clientes), Loja, Insumos, Faturamento, Laudos. Proposta pendente: migrar para o esquema do financeiro (sob demanda ou tarefa agendada diária) — Rodrigo ainda não decidiu.

### Fontes publicadas (gids)
- Despachante `SHEET_DESP_BASE` (DEFERIDOS 1943188044, CR 1256892167, PROCESSOS 0, PASTA_EMAIL 1690399718, RENOV_CRAF 1842829622); Loja `SHEET_LOJA_BASE` (COFRE 0, VENDAS 1575521552); Faturamento 162854170; Laudos `SHEET_LAUDOS_BASE` (AGENDAR 0, OK 1615377349).
- Insumos (planilha 1Ei9PYVUht_23bUGyAuIU05Pq4BvDEi9U) em `INSUMOS_GIDS` (EST/PROD/CONS): abr 452472968/1142829763/64438467; mai 1227610810/266416292/1155851587; jun 1967132911/133583632/920441175; jul 1274134133/1292341406/1588814040; ago 659643604/618017348/1485423741; set 151168037/1035177406/301903338; out 499420987/672015930/487242398; nov 2023788347/841230135/55734432; dez 1858377997/1638653212/714523544; PROJ 1420252359.
- **Mês novo de Insumos = 6 edits:** tab `data-tab-ins`, `<section class="panel" id="panel-ins-XXX">`, gids em INSUMOS_GIDS, array `meses`, null-guard list de ids, chamadas renderEstoque/Producao/Consumo; KPI `insKpiMeses`.

### Padrões de código
- Abas do Financeiro escopam painéis por prefixo de id (`[id^="panel-cons-"]`); sub-nav `[data-fin]` → `.fin-block`. Nova aba: botão `data-tab="x"` + `<section class="panel" id="panel-x">`, sortState.x, filtros `data-x-filter`, tableId no `sortMap`. Não reutilizar class "panel" em componentes aninhados (usar "ins-card").
- Painel restrito funcionário: `dashboard-despachante/index.html` (só Despachante), projeto Pages separado, mesmo repo; regenerar quando mudar o Despachante no principal.

---

## 2. Programa de Bonificação por Metas (iniciado jun/2026)

Modelo FINAL (v2):
- **Bônus por pessoa = 0,3% do faturamento bruto do mês**: 0,15% faturamento (coletivo) + 0,15% KPI do departamento. **6 funcionários**.
- **Meta plena R$215k** (240k inviável), gatilho mínimo R$200k. Ex.: fat 215k − desp 190k = 25k − ~3,9k bônus = ~21k caixa. Bolo total = 1,8% do fat.
- **Régua faturamento:** <200k=0%, 200–207k=50%, 208–214k=75%, ≥215k=100%, ≥230k=120%.
- **Régua KPI depto:** <70%=0%, 70–99%=proporcional, ≥100%=100%.
- **Teto:** bolo ≤ 2,5% do fat. Pagamento mensal, mês subsequente.
- **Desclassificador:** Pista-Instrutores — incidente de segurança por culpa de profissional SF zera a metade-KPI do depto.
- **KPIs por depto:**
  - Despachante (3 × 33,3%): agilidade entrada PF; status sem ficar >15 dias; pendências CRAF/doc regularizadas.
  - Recepção: contratos CR 30%, renovação filiações 30%, comandas abertas 20%, cadastros incompletos 20%.
  - Loja: faturamento vs meta 40%, vendas na margem 25%, contratos assinados 20%, contato diário WhatsApp 15%.
  - Pista-Instrutores: incidentes segurança 50% (desclassif.), qualidade instrução 20%, limpeza pista 15%, manutenção armas 15%.
  - Pista-Controle: comandas sem divergência 35%, verificação de armas com segurança 35%, controle acesso 30%.
  - Recarga: qualidade por pesquisa 40%, aderência controle de insumos 30%, panes/negas 30%.
- **Entregáveis:** `Programa de Bonificacao - KPIs e Metodologia.docx` e `Bonificacao - Planilha de KPIs e Calculo.xlsx` (abas PARAMETROS, FATURAMENTO, KPIS_DEPTO, RESUMO_DEPTO, BONUS_PESSOAS). Nomes como "Funcionário 1–6".
- **Pendente:** subir a planilha no Google Sheets e integrar ao dashboard (seção "Bonificação / KPIs": semáforo por depto + bônus projetado + sobra de caixa), lendo FATURAMENTO, RESUMO_DEPTO, BONUS_PESSOAS.

---

## 3. Site Tabela de Preços

Site interno: https://tabela-precos-semper-fire.pages.dev/

- **`app.js` lê o JSON embutido no `index.html`** (`<script id="dadosJson">`), NÃO o `dados.json` solto. Sempre re-embutir no index.html.
- **Deploy vem do repo separado** `rodrigobochichio-hub/tabela-precos-semper-fire` (Pages `tabela-precos-semper-fire`), NÃO do repo do dashboard.
- Atualização historicamente por UPLOAD no GitHub (Add file → Upload files). Desde out/2026 o Claude tem acesso git direto (GitHub App em All repositories).
- Planilha master: `Tabela_de_preco_geral_<mes>_<ano>_vN.xlsx`, abas Tabela CBC / PAVEI / GLOCK. CBC: header linha 3, dados 4–274 (271 itens); D=Preço Fornecedor, E=MKP, J=`FLOOR(D*(1+E),1)` (cartão), K=`FLOOR(J-J*0.12,1)` (à vista).
- JSON: `{atualizado_em, periodo, total, produtos[]}`, item `{cod, desc, forn, marca, cat, pcc, psc}` (pcc=J, psc=K).
- Jul/2026: +5% no preço fornecedor CBC (commit 8b1f953, arquivo v2).
