/* ===========================================
   SEMPER FIRE — Tabela de Preços (App)
   =========================================== */

// Hash SHA-256 da senha (semperfire2026)
const SENHA_HASH = 'f942bc86e1b0951731e5ce1c43b911163d9c4f596c5974ef1ae9ea2c1e2c8329';
const SESSION_KEY = 'sf-precos-auth';

// === Dados ===
const DADOS = JSON.parse(document.getElementById('dadosJson').textContent);
const PRODUTOS = DADOS.produtos || [];

// === Estado ===
const state = {
  busca: '',
  cat: 'all',
  forn: 'all',
  marca: 'all',
  sort: 'cat',
};

// === SHA-256 ===
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// === Login ===
async function checkSession() {
  const saved = sessionStorage.getItem(SESSION_KEY);
  if (saved === SENHA_HASH) {
    showApp();
    return true;
  }
  return false;
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const senha = document.getElementById('senhaInput').value;
  const errEl = document.getElementById('loginError');
  const hash = await sha256(senha);
  if (hash === SENHA_HASH) {
    sessionStorage.setItem(SESSION_KEY, hash);
    errEl.textContent = '';
    showApp();
  } else {
    errEl.textContent = 'Senha incorreta';
    document.getElementById('senhaInput').value = '';
    document.getElementById('senhaInput').focus();
  }
});

document.getElementById('btnLogout').addEventListener('click', () => {
  if (confirm('Sair da tabela de preços?')) {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  }
});

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').hidden = false;
  initApp();
}

// === Inicialização do app ===
function initApp() {
  document.getElementById('totalProdutos').textContent = DADOS.total;
  document.getElementById('ultimaAtt').textContent = DADOS.atualizado_em;
  document.getElementById('periodo').textContent = DADOS.periodo;

  buildFilters();
  bindEvents();
  render();
}

// === Filtros (chips) ===
function buildFilters() {
  // Categoria
  const cats = {};
  const forns = {};
  const marcas = {};
  PRODUTOS.forEach(p => {
    cats[p.cat] = (cats[p.cat] || 0) + 1;
    forns[p.forn] = (forns[p.forn] || 0) + 1;
    marcas[p.marca] = (marcas[p.marca] || 0) + 1;
  });

  const renderChips = (containerId, items, type) => {
    const total = PRODUTOS.length;
    const c = document.getElementById(containerId);
    c.innerHTML = '';
    // Botão "Todos"
    const all = document.createElement('button');
    all.className = 'chip active';
    all.dataset.value = 'all';
    all.dataset.type = type;
    all.innerHTML = `Todos <span class="count">${total}</span>`;
    c.appendChild(all);
    // Demais chips ordenados por contagem desc
    const sorted = Object.entries(items).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([k, v]) => {
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.dataset.value = k;
      btn.dataset.type = type;
      btn.innerHTML = `${escapeHtml(k)} <span class="count">${v}</span>`;
      c.appendChild(btn);
    });
  };

  renderChips('chipsCategoria', cats, 'cat');
  renderChips('chipsFornecedor', forns, 'forn');
  renderChips('chipsMarca', marcas, 'marca');
}

// === Eventos ===
function bindEvents() {
  // Busca
  const busca = document.getElementById('busca');
  const btnClear = document.getElementById('btnClear');
  busca.addEventListener('input', () => {
    state.busca = busca.value.trim().toLowerCase();
    btnClear.hidden = !state.busca;
    render();
  });
  btnClear.addEventListener('click', () => {
    busca.value = '';
    state.busca = '';
    btnClear.hidden = true;
    busca.focus();
    render();
  });

  // Chips: usa delegação
  document.querySelectorAll('.chips').forEach(container => {
    container.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const type = chip.dataset.type;
      const value = chip.dataset.value;
      // Single-select por grupo
      container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state[type] = value;
      render();
    });
  });

  // Sort
  document.getElementById('sortBy').addEventListener('change', (e) => {
    state.sort = e.target.value;
    render();
  });

  // Limpar tudo
  document.getElementById('btnClearAll').addEventListener('click', () => {
    state.busca = '';
    state.cat = state.forn = state.marca = 'all';
    document.getElementById('busca').value = '';
    document.getElementById('btnClear').hidden = true;
    document.querySelectorAll('.chips').forEach(c => {
      c.querySelectorAll('.chip').forEach(ch => ch.classList.remove('active'));
      c.querySelector('[data-value="all"]').classList.add('active');
    });
    render();
  });
}

// === Filtragem ===
function filterProdutos() {
  return PRODUTOS.filter(p => {
    if (state.cat !== 'all' && p.cat !== state.cat) return false;
    if (state.forn !== 'all' && p.forn !== state.forn) return false;
    if (state.marca !== 'all' && p.marca !== state.marca) return false;
    if (state.busca) {
      const haystack = `${p.cod} ${p.desc} ${p.marca} ${p.forn}`.toLowerCase();
      // Suporta múltiplas palavras (todas têm que bater)
      const terms = state.busca.split(/\s+/);
      return terms.every(t => haystack.includes(t));
    }
    return true;
  });
}

function sortProdutos(items) {
  const sorted = [...items];
  if (state.sort === 'desc') sorted.sort((a,b) => a.desc.localeCompare(b.desc, 'pt-BR'));
  else if (state.sort === 'pcc-asc') sorted.sort((a,b) => roundUp10(a.pcc) - roundUp10(b.pcc));
  else if (state.sort === 'pcc-desc') sorted.sort((a,b) => roundUp10(b.pcc) - roundUp10(a.pcc));
  else if (state.sort === 'cat') {
    const order = {'Armas':1, 'Munição':2, 'Carregadores':3};
    sorted.sort((a,b) => {
      const oc = (order[a.cat]||9) - (order[b.cat]||9);
      if (oc !== 0) return oc;
      const om = a.marca.localeCompare(b.marca);
      if (om !== 0) return om;
      return a.desc.localeCompare(b.desc, 'pt-BR');
    });
  }
  return sorted;
}

// === Render ===
function render() {
  const filtered = sortProdutos(filterProdutos());
  const grid = document.getElementById('grid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultCount');

  count.textContent = `${filtered.length} de ${PRODUTOS.length} produtos`;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    grid.style.display = 'none';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  grid.style.display = 'grid';

  // Render com separadores se sort = cat
  let html = '';
  let lastCat = null;
  filtered.forEach(p => {
    if (state.sort === 'cat' && p.cat !== lastCat) {
      html += `<div class="cat-header">${escapeHtml(p.cat)}</div>`;
      lastCat = p.cat;
    }
    html += renderCard(p);
  });
  grid.innerHTML = html;
}

function renderCard(p) {
  const catCls = p.cat === 'Armas' ? 'cat-armas' : (p.cat === 'Munição' ? 'cat-municao' : 'cat-carregadores');
  return `<article class="card">
    <div class="card-tags">
      <span class="tag ${catCls}">${escapeHtml(p.cat)}</span>
      <span class="tag forn">${escapeHtml(p.forn)}</span>
      ${p.marca && p.marca !== p.forn ? `<span class="tag marca">${escapeHtml(p.marca)}</span>` : ''}
    </div>
    <div class="card-desc">${escapeHtml(p.desc)}</div>
    <div class="card-cod">Cód: ${escapeHtml(p.cod)}</div>
    <div class="card-prices">
      <div class="price-block highlight">
        <span class="price-label">À vista</span>
        <span class="price-value"><span class="price-currency">R$</span>${formatBR(roundUp10(p.psc))}</span>
      </div>
      <div class="price-block">
        <span class="price-label">Cartão 12x</span>
        <span class="price-value"><span class="price-currency">R$</span>${formatBR(roundUp10(p.pcc))}</span>
      </div>
    </div>
  </article>`;
}

// Arredonda SEMPRE pra cima em múltiplos de R$ 10
// Ex: 137,38 → 140 ; 12876,13 → 12880 ; 8000,00 → 8000 (já é múltiplo)
function roundUp10(n) {
  return Math.ceil(n / 10) * 10;
}

function formatBR(n) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

// === Boot ===
checkSession();
