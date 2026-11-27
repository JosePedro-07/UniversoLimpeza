'use strict';

const STORAGE_KEYS = {
  usuarios: 'ul_usuarios_v7',
  sessao: 'ul_sessao_v7',
  produtos: 'ul_produtos_v7',
  carrinho: 'ul_carrinho_v7',
  pedidos: 'ul_pedidos_v7',
  sangrias: 'ul_sangrias_v7',
  fechamentos: 'ul_fechamentos_v7',
  auditoria: 'ul_auditoria_v7'
};

const USUARIOS_INICIAIS = [
  {
    id: 1,
    nome: 'Joana (Administração)',
    email: 'admin@universolimpeza.com.br',
    senha: 'admin123',
    perfil: 'admin',
    endereco: 'Rua Ricardo Piloni, 408 - Nova Granada'
  },
  {
    id: 2,
    nome: 'Carlos Eduardo',
    email: 'cliente@email.com',
    senha: '123456',
    perfil: 'cliente',
    endereco: 'Av. Brasil, 210 - Centro, Nova Granada'
  }
];

const PRODUTOS_INICIAIS = [
  { id: 1, codigo: '00104', nome: 'Detergente Líquido Neutro 500ml', categoria: 'Limpeza Geral', preco: 2.50, estoque: 120, estoque_minimo: 50, rendimento: 'Uso diário', icone: '🧴' },
  { id: 2, codigo: '00215', nome: 'Desinfetante Lavanda 2L', categoria: 'Desinfetantes', preco: 8.90, estoque: 8, estoque_minimo: 15, rendimento: 'Perfume prolongado', icone: '🪻' },
  { id: 3, codigo: '00216', nome: 'Desinfetante Lavanda 5L', categoria: 'Desinfetantes', preco: 18.90, estoque: 25, estoque_minimo: 10, rendimento: 'Galão econômico', icone: '🪣' },
  { id: 4, codigo: '00302', nome: 'Sabão em Pó Multiação 1kg', categoria: 'Lavanderia', preco: 14.90, estoque: 45, estoque_minimo: 20, rendimento: 'Rende 12 lavagens', icone: '🧺' },
  { id: 5, codigo: '00305', nome: 'Lava Roupas Líquido 3L', categoria: 'Lavanderia', preco: 24.90, estoque: 18, estoque_minimo: 10, rendimento: 'Rende 30 lavagens', icone: '🫧' },
  { id: 6, codigo: '00523', nome: 'Amaciante de Roupas 5L', categoria: 'Lavanderia', preco: 24.90, estoque: 18, estoque_minimo: 5, rendimento: 'Rende 55 lavagens', icone: '🌸' },
  { id: 7, codigo: '00488', nome: 'Água Sanitária 1L', categoria: 'Alvejantes', preco: 4.20, estoque: 4, estoque_minimo: 10, rendimento: 'Ação bactericida', icone: '🧪' },
  { id: 8, codigo: '00612', nome: 'Desengordurante Multiuso 500ml', categoria: 'Limpeza Geral', preco: 6.50, estoque: 3, estoque_minimo: 12, rendimento: 'Limpeza pesada', icone: '✨' },
  { id: 9, codigo: '00701', nome: 'Vassoura de Nylon Reforçada', categoria: 'Utilidades Domésticas', preco: 24.90, estoque: 6, estoque_minimo: 8, rendimento: 'Alta durabilidade', icone: '🧹' },
  { id: 10, codigo: '00702', nome: 'Rodo Plástico Duplo 40cm', categoria: 'Utilidades Domésticas', preco: 19.90, estoque: 14, estoque_minimo: 6, rendimento: 'Borracha dupla', icone: '🧽' },
  { id: 11, codigo: '00901', nome: 'Kit Lavanderia Completa (Lava Roupas 3L + Amaciante 5L)', categoria: 'Kits Econômicos', preco: 46.90, estoque: 10, estoque_minimo: 4, rendimento: 'Economia de R$ 2,90', icone: '🎁' },
  { id: 12, codigo: '00902', nome: 'Kit Faxina Pesada (Desinfetante 5L + Água Sanitária + Multiuso)', categoria: 'Kits Econômicos', preco: 27.90, estoque: 7, estoque_minimo: 4, rendimento: 'Combo completo', icone: '🏆' }
];

const WHATSAPP_LOJA = '5517991181473';

function lerStorage(chave, fallback) {
  try {
    const bruto = localStorage.getItem(chave);
    if (!bruto) return structuredClone(fallback);
    const parsed = JSON.parse(bruto);
    return parsed !== null ? parsed : structuredClone(fallback);
  } catch (_) {
    return structuredClone(fallback);
  }
}

let usuarios = lerStorage(STORAGE_KEYS.usuarios, USUARIOS_INICIAIS);
let usuarioLogado = lerStorage(STORAGE_KEYS.sessao, null);
let produtos = lerStorage(STORAGE_KEYS.produtos, PRODUTOS_INICIAIS);
let carrinho = lerStorage(STORAGE_KEYS.carrinho, []);
let pedidos = lerStorage(STORAGE_KEYS.pedidos, []);
let sangrias = lerStorage(STORAGE_KEYS.sangrias, []);
let fechamentosCaixa = lerStorage(STORAGE_KEYS.fechamentos, []);
let auditoria = lerStorage(STORAGE_KEYS.auditoria, [
  { id: 1, data: 'Hoje • 08:00', usuario: 'Sistema', acao: 'Inicialização do catálogo e controle de estoque.' }
]);

let categoriaAtiva = 'Todos';
let ordenacaoAtiva = 'destaque';
let callbackConfirmacao = null;

function escapeHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function salvarEstado() {
  localStorage.setItem(STORAGE_KEYS.usuarios, JSON.stringify(usuarios));
  localStorage.setItem(STORAGE_KEYS.sessao, JSON.stringify(usuarioLogado));
  localStorage.setItem(STORAGE_KEYS.produtos, JSON.stringify(produtos));
  localStorage.setItem(STORAGE_KEYS.carrinho, JSON.stringify(carrinho));
  localStorage.setItem(STORAGE_KEYS.pedidos, JSON.stringify(pedidos));
  localStorage.setItem(STORAGE_KEYS.sangrias, JSON.stringify(sangrias));
  localStorage.setItem(STORAGE_KEYS.fechamentos, JSON.stringify(fechamentosCaixa));
  localStorage.setItem(STORAGE_KEYS.auditoria, JSON.stringify(auditoria));
}

function registrarLog(acao) {
  const agora = new Date();
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const data = agora.toLocaleDateString('pt-BR');
  auditoria.unshift({
    id: Date.now() + Math.random(),
    data: `${data} • ${hora}`,
    usuario: usuarioLogado ? usuarioLogado.nome : 'Cliente Visitante',
    acao
  });
  if (auditoria.length > 80) auditoria.pop();
}

function formatarMoeda(valor) {
  const num = Number(valor) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function isAdminLogado() {
  return Boolean(usuarioLogado && usuarioLogado.perfil === 'admin');
}

function mostrarNotificacao(titulo, mensagem, tipo = 'success') {
  const container = document.getElementById('toast-container');
  const icones = { success: '✅', info: 'ℹ️', warning: '⚠️', error: '❌' };
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `
    <span style="font-size:1.1rem;line-height:1.2;">${icones[tipo] || '✅'}</span>
    <div>
      <strong style="display:block;font-size:0.88rem;margin-bottom:2px;">${escapeHTML(titulo)}</strong>
      <span style="font-size:0.8rem;color:#cbd5e1;display:block;">${escapeHTML(mensagem)}</span>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(24px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 260);
  }, 3500);
}

/* ============================================================================
   MODAL DE CONFIRMAÇÃO SEGURA
   ============================================================================ */
const modalConfirmacao = document.getElementById('modal-confirmacao');

function solicitarConfirmacao(titulo, mensagem, onConfirmar) {
  document.getElementById('confirm-titulo').textContent = titulo;
  document.getElementById('confirm-mensagem').textContent = mensagem;
  callbackConfirmacao = onConfirmar;
  modalConfirmacao.classList.remove('hidden');
  overlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function fecharConfirmacao() {
  modalConfirmacao.classList.add('hidden');
  callbackConfirmacao = null;
  const algumAberto = ![drawer, modalAuth, modalPerfil, modalAdmin].every((el) => el.classList.contains('hidden'));
  if (!algumAberto) {
    overlay.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
}

document.getElementById('btn-fechar-confirm').addEventListener('click', fecharConfirmacao);
document.getElementById('btn-confirm-cancelar').addEventListener('click', fecharConfirmacao);
document.getElementById('btn-confirm-aceitar').addEventListener('click', () => {
  const fn = callbackConfirmacao;
  fecharConfirmacao();
  if (typeof fn === 'function') fn();
});

/* ============================================================================
   CONTROLE DE SESSÃO E PERFIL DE USUÁRIO
   ============================================================================ */
function atualizarInterfaceUsuario() {
  const userArea = document.getElementById('user-area');
  const btnAdmin = document.getElementById('btn-abrir-admin');
  const wrapperTesteCarrinho = document.getElementById('wrapper-teste-carrinho');

  if (usuarioLogado) {
    const primeiroNome = usuarioLogado.nome.split(' ')[0];
    const inicial = primeiroNome.charAt(0).toUpperCase();
    const isAdmin = isAdminLogado();

    userArea.innerHTML = `
      <div class="user-pill">
        <button type="button" class="user-profile-btn" id="btn-abrir-perfil" title="Minha Conta & Pedidos">
          <span class="avatar-circle ${escapeHTML(usuarioLogado.perfil)}">${escapeHTML(inicial)}</span>
          <span>Olá, <strong>${escapeHTML(primeiroNome)}</strong></span>
          <span class="role-tag ${escapeHTML(usuarioLogado.perfil)}">${isAdmin ? 'Admin' : 'Cliente'}</span>
        </button>
        <button type="button" class="btn-logout" id="btn-fazer-logout">Sair</button>
      </div>
    `;

    document.getElementById('btn-abrir-perfil').addEventListener('click', abrirModalPerfil);
    document.getElementById('btn-fazer-logout').addEventListener('click', fazerLogout);

    btnAdmin.classList.toggle('hidden', !isAdmin);
    if (typeof window.ulSyncEcosystemAuth === 'function') {
      window.ulSyncEcosystemAuth(usuarioLogado);
    }
    wrapperTesteCarrinho.classList.toggle('hidden', !isAdmin);
    if (!isAdmin) document.getElementById('pedido-modo-teste').checked = false;

    const nomeInput = document.getElementById('nome-cliente');
    const endInput = document.getElementById('endereco-cliente');
    if (nomeInput) nomeInput.value = usuarioLogado.nome;
    if (endInput && usuarioLogado.endereco) endInput.value = usuarioLogado.endereco;
  } else {
    userArea.innerHTML = `
      <button type="button" class="btn-login-trigger" id="btn-trigger-auth">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Entrar / Cadastrar</span>
      </button>
    `;
    document.getElementById('btn-trigger-auth').addEventListener('click', abrirModalAuth);
    btnAdmin.classList.add('hidden');
    if (typeof window.ulSyncEcosystemAuth === 'function') {
      window.ulSyncEcosystemAuth(null);
    }
    wrapperTesteCarrinho.classList.add('hidden');
    document.getElementById('pedido-modo-teste').checked = false;
  }
}

function autenticar(email, senha) {
  const encontrado = usuarios.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
  );
  if (!encontrado) {
    mostrarNotificacao('Acesso negado', 'E-mail ou senha inválidos.', 'error');
    return;
  }
  usuarioLogado = encontrado;
  registrarLog(`Login efetuado no perfil ${encontrado.perfil.toUpperCase()}.`);
  salvarEstado();
  fecharModais();
  atualizarInterfaceUsuario();
  mostrarNotificacao('Login realizado!', `Bem-vindo(a), ${encontrado.nome}.`, 'success');
}

document.querySelectorAll('.btn-demo').forEach((btn) => {
  btn.addEventListener('click', () => {
    autenticar(btn.dataset.demoEmail, btn.dataset.demoSenha);
  });
});

document.getElementById('form-login').addEventListener('submit', (e) => {
  e.preventDefault();
  autenticar(
    document.getElementById('login-email').value.trim(),
    document.getElementById('login-senha').value
  );
});

document.getElementById('form-cadastro').addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = document.getElementById('cad-nome').value.trim();
  const email = document.getElementById('cad-email').value.trim().toLowerCase();
  const endereco = document.getElementById('cad-endereco').value.trim();
  const senha = document.getElementById('cad-senha').value;

  if (!nome || !email || senha.length < 4) {
    mostrarNotificacao('Dados inválidos', 'Preencha todos os campos obrigatórios.', 'warning');
    return;
  }

  if (usuarios.some((u) => u.email.toLowerCase() === email)) {
    mostrarNotificacao('E-mail já cadastrado', 'Este endereço de e-mail já possui conta.', 'warning');
    return;
  }

  const novo = { id: Date.now(), nome, email, senha, perfil: 'cliente', endereco };
  usuarios.push(novo);
  usuarioLogado = novo;
  registrarLog(`Novo cliente cadastrado: ${nome} (${email}).`);
  salvarEstado();
  fecharModais();
  atualizarInterfaceUsuario();
  e.target.reset();
  mostrarNotificacao('Cadastro concluído!', `Conta criada para ${nome}.`, 'success');
});

function fazerLogout() {
  const nome = usuarioLogado ? usuarioLogado.nome.split(' ')[0] : '';
  registrarLog('Logout realizado.');
  usuarioLogado = null;
  salvarEstado();
  fecharModais();
  atualizarInterfaceUsuario();
  document.getElementById('nome-cliente').value = '';
  document.getElementById('endereco-cliente').value = '';
  mostrarNotificacao('Sessão encerrada', `Até breve, ${nome}!`, 'info');
}

function abrirModalPerfil() {
  if (!usuarioLogado) return;
  document.getElementById('perf-nome').value = usuarioLogado.nome;
  document.getElementById('perf-email').value = usuarioLogado.email;
  document.getElementById('perf-endereco').value = usuarioLogado.endereco || '';

  const meusPedidos = pedidos.filter((p) => p.usuario_id === usuarioLogado.id);
  const listaEl = document.getElementById('lista-pedidos-usuario');

  if (meusPedidos.length === 0) {
    listaEl.innerHTML = '<p style="color:#64748b;font-size:0.84rem;">Nenhum pedido registrado nesta conta até o momento.</p>';
  } else {
    listaEl.innerHTML = meusPedidos.map((ped) => {
      const statusClass = ped.status === 'Cancelado' ? 'cancelado' : (ped.status === 'Pendente' ? 'pendente' : '');
      const itensTexto = ped.itens.map((i) => `${i.qtd}x ${escapeHTML(i.nome)}`).join(', ');
      return `
        <div class="order-card ${ped.is_teste ? 'arquivo-teste' : ''}">
          <div class="order-card-head">
            <div>
              <strong>Pedido #${ped.id.toString().slice(-4)} • ${escapeHTML(ped.data)}</strong>
              ${ped.is_teste ? '<span class="badge-teste">🧪 Arquivo Teste</span>' : ''}
            </div>
            <span class="order-status ${statusClass}">${escapeHTML(ped.status)}</span>
          </div>
          <div style="color:#475569;margin-bottom:4px;">${itensTexto}</div>
          <div style="display:flex;justify-content:space-between;font-weight:700;">
            <span>${escapeHTML(ped.entrega)} (${escapeHTML(ped.pagamento)})</span>
            <span style="color:#0f766e;">${formatarMoeda(ped.total)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  abrirModal(modalPerfil);
}

document.getElementById('form-editar-perfil').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!usuarioLogado) return;
  const novoNome = document.getElementById('perf-nome').value.trim();
  if (!novoNome) return;

  usuarioLogado.nome = novoNome;
  usuarioLogado.endereco = document.getElementById('perf-endereco').value.trim();
  const idx = usuarios.findIndex((u) => u.id === usuarioLogado.id);
  if (idx !== -1) usuarios[idx] = { ...usuarioLogado };
  registrarLog('Dados cadastrais do perfil atualizados.');
  salvarEstado();
  atualizarInterfaceUsuario();
  mostrarNotificacao('Perfil atualizado!', 'Suas informações foram salvas.', 'success');
});

/* ============================================================================
   VITRINE, FILTROS E CARRINHO
   ============================================================================ */
function atualizarStatusLoja() {
  const agora = new Date();
  const dia = agora.getDay();
  const hora = agora.getHours();
  const el = document.getElementById('status-loja');
  const abertoSemana = dia >= 1 && dia <= 5 && hora >= 8 && hora < 18;
  const abertoSabado = dia === 6 && hora >= 8 && hora < 12;

  if (abertoSemana || abertoSabado) {
    el.textContent = '● Loja Aberta Agora';
    el.classList.remove('fechado');
  } else {
    el.textContent = '● Fechada • Seg-Sex 8h–18h | Sáb 8h–12h';
    el.classList.add('fechado');
  }
}

function filtrarPorCategoria(cat, rolar = true) {
  categoriaAtiva = cat;
  document.querySelectorAll('.cat-btn').forEach((b) => b.classList.toggle('active', b.dataset.cat === cat));
  renderizarProdutos();
  if (rolar) {
    document.getElementById('catalogo-secao').scrollIntoView({ behavior: 'smooth' });
  }
}

function resetarFiltros(e) {
  if (e) e.preventDefault();
  document.getElementById('input-busca').value = '';
  ordenacaoAtiva = 'destaque';
  document.getElementById('select-ordenar').value = 'destaque';
  filtrarPorCategoria('Todos', Boolean(e));
}

function sincronizarCarrinhoComEstoque() {
  let ajustado = false;
  carrinho = carrinho.reduce((acc, item) => {
    const prod = produtos.find((p) => p.id === item.id);
    if (!prod || prod.estoque <= 0) {
      ajustado = true;
      return acc;
    }
    const qtdValida = Math.min(item.qtd, prod.estoque);
    if (qtdValida !== item.qtd || item.preco !== prod.preco || item.nome !== prod.nome) ajustado = true;
    acc.push({ id: prod.id, nome: prod.nome, preco: prod.preco, qtd: qtdValida });
    return acc;
  }, []);

  if (ajustado) {
    salvarEstado();
    atualizarCarrinho();
  }
}

function renderizarProdutos() {
  const grid = document.getElementById('grid-produtos');
  const termo = document.getElementById('input-busca').value.toLowerCase().trim();

  let filtrados = produtos.filter((p) => {
    const bateCat = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva;
    const bateBusca =
      p.nome.toLowerCase().includes(termo) ||
      p.codigo.toLowerCase().includes(termo) ||
      p.categoria.toLowerCase().includes(termo);
    return bateCat && bateBusca;
  });

  if (ordenacaoAtiva === 'menor-preco') filtrados.sort((a, b) => a.preco - b.preco);
  if (ordenacaoAtiva === 'maior-preco') filtrados.sort((a, b) => b.preco - a.preco);
  if (ordenacaoAtiva === 'az') filtrados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  document.getElementById('contador-produtos').textContent = `${filtrados.length} produto(s) disponível(is)`;

  if (filtrados.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <strong style="font-size:1.05rem;">Nenhum produto encontrado</strong>
        <p style="color:#64748b;margin:6px 0 14px;">Tente pesquisar outro termo ou limpe os filtros.</p>
        <button type="button" class="btn-primary-sm" id="btn-limpar-filtros-empty">Mostrar Todos os Produtos</button>
      </div>
    `;
    document.getElementById('btn-limpar-filtros-empty').addEventListener('click', () => resetarFiltros());
    return;
  }

  grid.innerHTML = filtrados.map((p) => {
    let badgeClass = 'badge-estoque';
    let badgeTexto = `Em estoque (${p.estoque})`;

    if (p.estoque <= 0) {
      badgeClass += ' esgotado';
      badgeTexto = 'Esgotado';
    } else if (p.estoque <= p.estoque_minimo) {
      badgeClass += ' baixo';
      badgeTexto = `Últimas ${p.estoque} un.`;
    }

    return `
      <article class="card">
        <div class="card-top">
          <span class="${badgeClass}">${badgeTexto}</span>
          <span class="sku-tag">SKU #${escapeHTML(p.codigo)}</span>
        </div>
        <div class="prod-visual">
          <span>${escapeHTML(p.icone)}</span>
          ${p.rendimento ? `<span class="rendimento-pill">${escapeHTML(p.rendimento)}</span>` : ''}
        </div>
        <div>
          <span class="card-cat">${escapeHTML(p.categoria)}</span>
          <h3>${escapeHTML(p.nome)}</h3>
        </div>
        <div class="card-bottom">
          <div class="preco">${formatarMoeda(p.preco)} <small>/ un.</small></div>
          <button type="button" class="btn-add" data-add-id="${p.id}" ${p.estoque <= 0 ? 'disabled' : ''}>
            ${p.estoque <= 0 ? 'Indisponível' : '+ Adicionar ao Carrinho'}
          </button>
        </div>
      </article>
    `;
  }).join('');
}

document.getElementById('grid-produtos').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-add-id]');
  if (!btn || btn.disabled) return;
  adicionarAoCarrinho(Number(btn.dataset.addId));
});

function adicionarAoCarrinho(id) {
  const prod = produtos.find((p) => p.id === id);
  if (!prod || prod.estoque <= 0) return;

  const item = carrinho.find((c) => c.id === id);
  if (item) {
    if (item.qtd >= prod.estoque) {
      mostrarNotificacao('Estoque máximo atingido', `Disponível: ${prod.estoque} unidades.`, 'warning');
      return;
    }
    item.qtd++;
  } else {
    carrinho.push({ id: prod.id, nome: prod.nome, preco: prod.preco, qtd: 1 });
  }

  salvarEstado();
  atualizarCarrinho();
  mostrarNotificacao('Adicionado ao carrinho!', `${prod.nome} incluído no pedido.`, 'success');
}

function alterarQtd(id, delta) {
  const prod = produtos.find((p) => p.id === id);
  const idx = carrinho.findIndex((c) => c.id === id);
  if (idx === -1) return;

  const novaQtd = carrinho[idx].qtd + delta;
  if (novaQtd <= 0) {
    const removido = carrinho[idx].nome;
    carrinho.splice(idx, 1);
    mostrarNotificacao('Item removido', `${removido} retirado do carrinho.`, 'info');
  } else if (prod && novaQtd <= prod.estoque) {
    carrinho[idx].qtd = novaQtd;
  } else {
    mostrarNotificacao('Limite de estoque', `Temos ${prod ? prod.estoque : 0} unidades em loja.`, 'warning');
  }

  salvarEstado();
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const container = document.getElementById('itens-carrinho');
  const countEl = document.getElementById('cart-count');
  const subEl = document.getElementById('valor-subtotal');
  const totalEl = document.getElementById('valor-total');

  const totalItens = carrinho.reduce((acc, item) => acc + item.qtd, 0);
  const valorTotal = carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);

  countEl.textContent = totalItens;
  subEl.textContent = formatarMoeda(valorTotal);
  totalEl.textContent = formatarMoeda(valorTotal);

  if (carrinho.length === 0) {
    container.innerHTML = '<p style="color:#64748b;text-align:center;margin-top:36px;font-size:0.9rem;">Seu carrinho está vazio.<br>Escolha produtos na vitrine!</p>';
    return;
  }

  container.innerHTML = carrinho.map((item) => `
    <div class="cart-item">
      <div>
        <strong style="font-size:0.88rem;display:block;">${escapeHTML(item.nome)}</strong>
        <span style="font-size:0.78rem;color:#64748b;">${formatarMoeda(item.preco)} un. • Sub: <strong>${formatarMoeda(item.preco * item.qtd)}</strong></span>
      </div>
      <div class="qty-controls">
        <button type="button" data-qty-id="${item.id}" data-qty-delta="-1" aria-label="Diminuir quantidade">-</button>
        <span style="font-weight:700;min-width:18px;text-align:center;">${item.qtd}</span>
        <button type="button" data-qty-id="${item.id}" data-qty-delta="1" aria-label="Aumentar quantidade">+</button>
      </div>
    </div>
  `).join('');
}

document.getElementById('itens-carrinho').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-qty-id]');
  if (!btn) return;
  alterarQtd(Number(btn.dataset.qtyId), Number(btn.dataset.qtyDelta));
});

function finalizarWhatsApp() {
  if (carrinho.length === 0) {
    mostrarNotificacao('Carrinho vazio', 'Adicione itens antes de enviar o pedido.', 'warning');
    return;
  }

  const nome = document.getElementById('nome-cliente').value.trim();
  const entrega = document.getElementById('tipo-entrega').value;
  const endereco = document.getElementById('endereco-cliente').value.trim();
  const pagamento = document.getElementById('forma-pagamento').value;
  const troco = document.getElementById('troco-para').value.trim();
  const isTeste = isAdminLogado() && document.getElementById('pedido-modo-teste').checked;

  if (!nome) {
    mostrarNotificacao('Nome obrigatório', 'Informe seu nome completo para identificação do pedido.', 'warning');
    return;
  }

  if (entrega === 'Entrega em domicílio' && !endereco) {
    mostrarNotificacao('Endereço obrigatório', 'Informe sua rua e bairro em Nova Granada.', 'warning');
    return;
  }

  for (const item of carrinho) {
    const p = produtos.find((prod) => prod.id === item.id);
    if (!p || p.estoque < item.qtd) {
      mostrarNotificacao('Estoque insuficiente', `O item "${item.nome}" teve alteração de saldo. Revise o carrinho.`, 'error');
      sincronizarCarrinhoComEstoque();
      return;
    }
  }

  let total = 0;
  const linhasItens = carrinho.map((item) => {
    const sub = item.preco * item.qtd;
    total += sub;
    return `• ${item.qtd}x ${item.nome} — ${formatarMoeda(sub)}`;
  }).join('\n');

  const agora = Date.now();
  const novoPedido = {
    id: agora,
    timestamp: agora,
    usuario_id: usuarioLogado ? usuarioLogado.id : null,
    canal: 'Catálogo Online',
    cliente: nome,
    entrega,
    endereco,
    pagamento: pagamento === 'Dinheiro' && troco ? `Dinheiro (Troco: ${troco})` : pagamento,
    total,
    status: 'Pendente',
    is_teste: isTeste,
    data: new Date(agora).toLocaleDateString('pt-BR'),
    itens: structuredClone(carrinho)
  };

  carrinho.forEach((item) => {
    const p = produtos.find((prod) => prod.id === item.id);
    if (p) p.estoque -= item.qtd;
  });

  pedidos.unshift(novoPedido);
  registrarLog(`${isTeste ? '[TESTE] ' : ''}Pedido Online #${novoPedido.id.toString().slice(-4)} (${formatarMoeda(total)}) criado por ${nome}.`);
  carrinho = [];
  document.getElementById('pedido-modo-teste').checked = false;
  salvarEstado();
  atualizarCarrinho();
  renderizarProdutos();
  fecharModais();

  const mensagem = [
    isTeste ? '*[PEDIDO DE TESTE] - UNIVERSO DA LIMPEZA* #TESTE' : '*NOVO PEDIDO - UNIVERSO DA LIMPEZA* #PEDIDO-SITE',
    `*Pedido:* #${novoPedido.id.toString().slice(-4)}`,
    `*Cliente:* ${nome}`,
    `*Recebimento:* ${entrega}`,
    entrega === 'Entrega em domicílio' ? `*Endereço:* ${endereco}` : null,
    `*Pagamento:* ${novoPedido.pagamento}`,
    '',
    '*Itens do Pedido:*',
    linhasItens,
    '',
    `*Total:* ${formatarMoeda(total)}`
  ].filter(Boolean).join('\n');

  mostrarNotificacao(
    isTeste ? 'Pedido de Teste registrado!' : 'Pedido confirmado!',
    'Baixa no estoque realizada. Abrindo WhatsApp...',
    isTeste ? 'info' : 'success'
  );
  const url = `https://wa.me/${WHATSAPP_LOJA}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ============================================================================
   EXCLUSÃO DE PEDIDOS E GERENCIAMENTO DE ARQUIVO TESTE
   ============================================================================ */
function alternarModoTestePedido(pedidoId) {
  if (!isAdminLogado()) return;
  const ped = pedidos.find((p) => p.id === pedidoId);
  if (!ped) return;

  ped.is_teste = !ped.is_teste;
  registrarLog(`Pedido #${ped.id.toString().slice(-4)} ${ped.is_teste ? 'marcado como ARQUIVO TESTE' : 'restaurado como venda real'}.`);
  salvarEstado();
  renderizarAdmin();
  mostrarNotificacao(
    ped.is_teste ? 'Marcado como Arquivo Teste' : 'Restaurado para Venda Real',
    ped.is_teste ? 'Este pedido não será somado no fechamento de caixa.' : 'Pedido voltou a contabilizar no caixa.',
    'info'
  );
}

function excluirPedido(pedidoId) {
  if (!isAdminLogado()) return;
  const ped = pedidos.find((p) => p.id === pedidoId);
  if (!ped) return;

  solicitarConfirmacao(
    `Excluir Pedido #${ped.id.toString().slice(-4)}?`,
    `Deseja excluir definitivamente o pedido de "${ped.cliente}" (${formatarMoeda(ped.total)})? Os itens serão devolvidos automaticamente ao estoque.`,
    () => {
      const idx = pedidos.findIndex((p) => p.id === pedidoId);
      if (idx === -1) return;

      if (ped.status !== 'Cancelado') {
        ped.itens.forEach((item) => {
          const prod = produtos.find((p) => p.id === item.id);
          if (prod) prod.estoque += item.qtd;
        });
      }

      pedidos.splice(idx, 1);
      registrarLog(`Excluiu definitivamente o pedido #${ped.id.toString().slice(-4)} (${ped.cliente}) e estornou os itens ao estoque.`);
      salvarEstado();
      renderizarAdmin();
      renderizarProdutos();
      mostrarNotificacao('Pedido excluído!', `Pedido #${ped.id.toString().slice(-4)} removido e estoque devolvido.`, 'success');
    }
  );
}

document.getElementById('btn-limpar-testes').addEventListener('click', () => {
  if (!isAdminLogado()) return;
  const testes = pedidos.filter((p) => p.is_teste);
  if (testes.length === 0) {
    mostrarNotificacao('Nenhum pedido de teste', 'Não há pedidos marcados como teste no momento.', 'info');
    return;
  }

  solicitarConfirmacao(
    `Excluir ${testes.length} Pedido(s) de Teste?`,
    'Todos os pedidos sinalizados como Arquivo Teste serão removidos e seus itens retornarão ao estoque.',
    () => {
      testes.forEach((ped) => {
        if (ped.status !== 'Cancelado') {
          ped.itens.forEach((item) => {
            const prod = produtos.find((p) => p.id === item.id);
            if (prod) prod.estoque += item.qtd;
          });
        }
      });

      pedidos = pedidos.filter((p) => !p.is_teste);
      registrarLog(`Limpeza em lote: ${testes.length} pedido(s) de teste excluído(s) com estorno de estoque.`);
      salvarEstado();
      renderizarAdmin();
      renderizarProdutos();
      mostrarNotificacao('Testes removidos!', `${testes.length} pedido(s) de teste excluído(s) e estoque estornado.`, 'success');
    }
  );
});

/* ============================================================================
   FECHAMENTO DE CAIXA (DIÁRIO, SEMANAL E GERAÇÃO DE ARQUIVO CSV)
   ============================================================================ */
function obterDadosCaixaFiltrados() {
  const periodo = document.getElementById('caixa-periodo').value;
  const hojeStr = new Date().toLocaleDateString('pt-BR');
  const seteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const filtrarItem = (item) => {
    if (periodo === 'hoje') return item.data === hojeStr;
    if (periodo === 'semana') return (item.timestamp || item.id) >= seteDiasAtras;
    return true;
  };

  const vendasValidas = pedidos.filter((p) => p.status !== 'Cancelado' && !p.is_teste && filtrarItem(p));
  const sangriasPeriodo = sangrias.filter(filtrarItem);

  let pix = 0;
  let cartao = 0;
  let dinheiro = 0;
  let totalBalcao = 0;
  let totalOnline = 0;

  vendasValidas.forEach((v) => {
    const forma = v.pagamento.split(' ')[0];
    if (forma === 'PIX') pix += v.total;
    else if (forma === 'Cartão') cartao += v.total;
    else if (forma === 'Dinheiro') dinheiro += v.total;

    if (v.canal === 'PDV Balcão') totalBalcao += v.total;
    else totalOnline += v.total;
  });

  const faturamentoBruto = pix + cartao + dinheiro;
  const totalSangrias = sangriasPeriodo.reduce((acc, s) => acc + s.valor, 0);
  const fundoTroco = Math.max(0, parseFloat(document.getElementById('caixa-fundo-troco').value) || 0);
  const saldoGavetaEsperado = fundoTroco + dinheiro - totalSangrias;

  const nomesPeriodo = {
    hoje: `Fechamento Diário (${hojeStr})`,
    semana: 'Fechamento Semanal (Últimos 7 dias)',
    tudo: 'Acumulado Geral'
  };

  return {
    periodo,
    tituloPeriodo: nomesPeriodo[periodo],
    vendasValidas,
    sangriasPeriodo,
    pix,
    cartao,
    dinheiro,
    totalBalcao,
    totalOnline,
    faturamentoBruto,
    totalSangrias,
    fundoTroco,
    saldoGavetaEsperado
  };
}

function renderizarFechamentoCaixa() {
  const dados = obterDadosCaixaFiltrados();
  const resumoEl = document.getElementById('caixa-resumo-financeiro');

  resumoEl.innerHTML = `
    <div class="caixa-linha"><span>Período selecionado:</span><strong>${escapeHTML(dados.tituloPeriodo)}</strong></div>
    <div class="caixa-linha"><span>Vendas reais contabilizadas:</span><strong>${dados.vendasValidas.length} venda(s)</strong></div>
    <hr style="border:none;border-top:1px solid #f1f5f9;">
    <div class="caixa-linha"><span>💠 Entradas via PIX:</span><strong>${formatarMoeda(dados.pix)}</strong></div>
    <div class="caixa-linha"><span>💳 Entradas via Cartão:</span><strong>${formatarMoeda(dados.cartao)}</strong></div>
    <div class="caixa-linha"><span>💵 Entradas em Dinheiro:</span><strong>${formatarMoeda(dados.dinheiro)}</strong></div>
    <div class="caixa-linha" style="color:#475569;font-size:0.78rem;">
      <span>Origem: Balcão ${formatarMoeda(dados.totalBalcao)} | Site ${formatarMoeda(dados.totalOnline)}</span>
    </div>
    <hr style="border:none;border-top:1px solid #f1f5f9;">
    <div class="caixa-linha"><span>➕ Fundo de Troco Inicial:</span><span>${formatarMoeda(dados.fundoTroco)}</span></div>
    <div class="caixa-linha" style="color:#dc2626;"><span>➖ Sangrias / Saídas (${dados.sangriasPeriodo.length}):</span><span>- ${formatarMoeda(dados.totalSangrias)}</span></div>
    <div class="caixa-linha destaque">
      <span>💰 Saldo Esperado em Gaveta (Espécie):</span>
      <strong>${formatarMoeda(dados.saldoGavetaEsperado)}</strong>
    </div>
    <div class="caixa-linha destaque" style="color:#16a34a;">
      <span>📈 Faturamento Total do Período:</span>
      <strong>${formatarMoeda(dados.faturamentoBruto)}</strong>
    </div>
  `;

  const histEl = document.getElementById('lista-fechamentos-salvos');
  if (fechamentosCaixa.length === 0) {
    histEl.innerHTML = '<p style="color:#64748b;font-size:0.8rem;text-align:center;padding:18px;">Nenhum fechamento encerrado ainda. Clique em "Encerrar & Salvar Caixa" ao final do expediente.</p>';
  } else {
    histEl.innerHTML = fechamentosCaixa.map((f) => `
      <div class="order-card" style="padding:10px 12px;">
        <div class="order-card-head">
          <strong>${escapeHTML(f.titulo)}</strong>
          <span class="order-status">Encerrado</span>
        </div>
        <div style="font-size:0.78rem;color:#475569;">
          Responsável: ${escapeHTML(f.responsavel)} • ${f.qtdVendas} vendas
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-top:4px;font-weight:700;">
          <span>Gaveta: ${formatarMoeda(f.saldoGaveta)}</span>
          <span style="color:#0f766e;">Total: ${formatarMoeda(f.faturamento)}</span>
        </div>
      </div>
    `).join('');
  }
}

document.getElementById('caixa-periodo').addEventListener('change', renderizarFechamentoCaixa);
document.getElementById('caixa-fundo-troco').addEventListener('input', renderizarFechamentoCaixa);

document.getElementById('btn-add-sangria').addEventListener('click', () => {
  if (!isAdminLogado()) return;
  const valor = parseFloat(document.getElementById('caixa-sangria-valor').value) || 0;
  const motivo = document.getElementById('caixa-sangria-motivo').value.trim() || 'Retirada operacional';

  if (valor <= 0) {
    mostrarNotificacao('Valor inválido', 'Informe o valor da sangria em reais.', 'warning');
    return;
  }

  const agora = Date.now();
  sangrias.unshift({
    id: agora,
    timestamp: agora,
    data: new Date(agora).toLocaleDateString('pt-BR'),
    valor,
    motivo,
    responsavel: usuarioLogado.nome
  });

  registrarLog(`Sangria de caixa registrada: -${formatarMoeda(valor)} (${motivo}).`);
  salvarEstado();
  document.getElementById('caixa-sangria-valor').value = '';
  document.getElementById('caixa-sangria-motivo').value = '';
  renderizarFechamentoCaixa();
  mostrarNotificacao('Sangria registrada!', `${formatarMoeda(valor)} abatido da gaveta.`, 'info');
});

document.getElementById('btn-encerrar-caixa').addEventListener('click', () => {
  if (!isAdminLogado()) return;
  const dados = obterDadosCaixaFiltrados();

  const registro = {
    id: Date.now(),
    titulo: `${dados.tituloPeriodo} • ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    responsavel: usuarioLogado.nome,
    qtdVendas: dados.vendasValidas.length,
    faturamento: dados.faturamentoBruto,
    saldoGaveta: dados.saldoGavetaEsperado
  };

  fechamentosCaixa.unshift(registro);
  registrarLog(`Fechamento de caixa encerrado: ${registro.titulo} | Total: ${formatarMoeda(registro.faturamento)}.`);
  salvarEstado();
  renderizarFechamentoCaixa();
  mostrarNotificacao('Caixa encerrado!', 'Conferência salva no histórico.', 'success');
});

document.getElementById('btn-copiar-resumo-caixa').addEventListener('click', () => {
  const dados = obterDadosCaixaFiltrados();
  const texto = [
    '*FECHAMENTO DE CAIXA - UNIVERSO DA LIMPEZA*',
    `*Período:* ${dados.tituloPeriodo}`,
    `*Responsável:* ${usuarioLogado ? usuarioLogado.nome : 'Admin'}`,
    '--------------------------------',
    `• PIX: ${formatarMoeda(dados.pix)}`,
    `• Cartão: ${formatarMoeda(dados.cartao)}`,
    `• Dinheiro: ${formatarMoeda(dados.dinheiro)}`,
    '--------------------------------',
    `• Fundo de Troco: ${formatarMoeda(dados.fundoTroco)}`,
    `• Sangrias/Saídas: -${formatarMoeda(dados.totalSangrias)}`,
    `*Saldo em Gaveta (Espécie):* ${formatarMoeda(dados.saldoGavetaEsperado)}`,
    `*FATURAMENTO TOTAL (${dados.vendasValidas.length} vendas):* ${formatarMoeda(dados.faturamentoBruto)}`
  ].join('\n');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto);
  }
  mostrarNotificacao('Resumo copiado!', 'Relatório pronto para colar no WhatsApp.', 'success');
});

document.getElementById('btn-gerar-arquivo-caixa').addEventListener('click', () => {
  const dados = obterDadosCaixaFiltrados();
  const fmtNum = (n) => n.toFixed(2).replace('.', ',');

  const linhas = [
    'RELATORIO DE FECHAMENTO DE CAIXA - UNIVERSO DA LIMPEZA (NOVA GRANADA - SP)',
    `Periodo;${dados.tituloPeriodo}`,
    `Responsavel;${usuarioLogado ? usuarioLogado.nome : 'Administrador'}`,
    `Data de Emissao;${new Date().toLocaleString('pt-BR')}`,
    '',
    'RESUMO POR FORMA DE PAGAMENTO;VALOR (R$)',
    `Entradas PIX;${fmtNum(dados.pix)}`,
    `Entradas Cartao;${fmtNum(dados.cartao)}`,
    `Entradas Dinheiro;${fmtNum(dados.dinheiro)}`,
    `Faturamento Bruto Total;${fmtNum(dados.faturamentoBruto)}`,
    '',
    'CONFERENCIA DE GAVETA (ESPECIE);VALOR (R$)',
    `Fundo de Troco Inicial;${fmtNum(dados.fundoTroco)}`,
    `(+) Vendas em Dinheiro;${fmtNum(dados.dinheiro)}`,
    `(-) Sangrias / Saidas;${fmtNum(dados.totalSangrias)}`,
    `(=) Saldo Esperado em Gaveta;${fmtNum(dados.saldoGavetaEsperado)}`,
    '',
    'DETALHAMENTO DE MOVIMENTACOES DO PERIODO',
    'Tipo;ID;Data;Canal;Cliente / Motivo;Forma Pagamento;Valor (R$)'
  ];

  dados.vendasValidas.forEach((v) => {
    const clienteLimpo = String(v.cliente).replace(/"/g, '""');
    linhas.push(`ENTRADA;#${v.id.toString().slice(-4)};${v.data};${v.canal || 'Site'};"${clienteLimpo}";${v.pagamento};${fmtNum(v.total)}`);
  });

  dados.sangriasPeriodo.forEach((s) => {
    const motivoLimpo = String(s.motivo).replace(/"/g, '""');
    linhas.push(`SANGRIA;#${s.id.toString().slice(-4)};${s.data};Gaveta;"${motivoLimpo}";Dinheiro;-${fmtNum(s.valor)}`);
  });

  const blob = new Blob(['\uFEFF' + linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const sufixo = dados.periodo === 'hoje' ? 'diario' : dados.periodo === 'semana' ? 'semanal' : 'geral';
  link.download = `controle_caixa_${sufixo}_universo_limpeza.csv`;
  link.click();
  URL.revokeObjectURL(link.href);

  registrarLog(`Gerou arquivo de controle de caixa (${sufixo}).`);
  salvarEstado();
  mostrarNotificacao('Arquivo gerado!', `controle_caixa_${sufixo}_universo_limpeza.csv baixado.`, 'success');
});

/* ============================================================================
   PAINEL DE GESTÃO GERAL
   ============================================================================ */
function renderizarAdmin() {
  if (!isAdminLogado()) return;

  const totalProdutos = produtos.length;
  const criticos = produtos.filter((p) => p.estoque <= p.estoque_minimo);
  const valorEstoque = produtos.reduce((acc, p) => acc + p.preco * p.estoque, 0);
  const pedidosValidos = pedidos.filter((p) => p.status !== 'Cancelado' && !p.is_teste);
  const faturamento = pedidosValidos.reduce((acc, p) => acc + p.total, 0);

  document.getElementById('admin-kpis').innerHTML = `
    <div class="kpi-box"><span>SKUs Ativos</span><strong>${totalProdutos} itens</strong></div>
    <div class="kpi-box ${criticos.length > 0 ? 'alert' : ''}"><span>Reposição</span><strong>${criticos.length} críticos</strong></div>
    <div class="kpi-box"><span>Valor em Estoque</span><strong>${formatarMoeda(valorEstoque)}</strong></div>
    <div class="kpi-box"><span>Vendas Reais</span><strong>${pedidosValidos.length} vendas</strong></div>
    <div class="kpi-box revenue"><span>Faturamento</span><strong>${formatarMoeda(faturamento)}</strong></div>
  `;

  renderizarFechamentoCaixa();

  document.getElementById('lista-admin').innerHTML = produtos.map((p) => `
    <div class="admin-row">
      <div>
        <strong>${escapeHTML(p.nome)}</strong>
        <div style="font-size:0.73rem;color:${p.estoque <= p.estoque_minimo ? '#dc2626' : '#64748b'};">
          SKU #${escapeHTML(p.codigo)} • ${escapeHTML(p.categoria)} ${p.estoque <= p.estoque_minimo ? '• ⚠️ Abaixo do mínimo' : ''}
        </div>
      </div>
      <input type="number" step="0.10" min="0" value="${p.preco.toFixed(2)}" data-prod-id="${p.id}" data-prod-campo="preco" aria-label="Preço" />
      <input type="number" min="0" value="${p.estoque}" data-prod-id="${p.id}" data-prod-campo="estoque" aria-label="Estoque atual" />
      <input type="number" min="0" value="${p.estoque_minimo}" data-prod-id="${p.id}" data-prod-campo="estoque_minimo" aria-label="Estoque mínimo" />
      <button type="button" class="btn-del" data-del-prod="${p.id}">Excluir</button>
    </div>
  `).join('');

  const pdvSelect = document.getElementById('pdv-produto');
  pdvSelect.innerHTML = produtos.map((p) => `
    <option value="${p.id}" ${p.estoque <= 0 ? 'disabled' : ''}>
      [#${escapeHTML(p.codigo)}] ${escapeHTML(p.nome)} — ${formatarMoeda(p.preco)} (Saldo: ${p.estoque})
    </option>
  `).join('');

  const porPagamento = pedidosValidos.reduce((acc, p) => {
    const chave = p.pagamento.split(' ')[0];
    acc[chave] = (acc[chave] || 0) + p.total;
    return acc;
  }, {});

  document.getElementById('pdv-resumo-caixa').innerHTML = `
    <strong style="font-size:0.95rem;color:#0f172a;">Resumo de Caixa por Forma de Pagamento</strong>
    <div style="display:flex;justify-content:space-between;"><span>PIX:</span><strong>${formatarMoeda(porPagamento['PIX'] || 0)}</strong></div>
    <div style="display:flex;justify-content:space-between;"><span>Cartão:</span><strong>${formatarMoeda(porPagamento['Cartão'] || 0)}</strong></div>
    <div style="display:flex;justify-content:space-between;"><span>Dinheiro:</span><strong>${formatarMoeda(porPagamento['Dinheiro'] || 0)}</strong></div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:4px 0;">
    <div style="display:flex;justify-content:space-between;font-size:1rem;color:#0f766e;">
      <span>Total Geral:</span><strong>${formatarMoeda(faturamento)}</strong>
    </div>
  `;

  const pedLista = document.getElementById('lista-admin-pedidos');
  if (pedidos.length === 0) {
    pedLista.innerHTML = '<p style="color:#64748b;text-align:center;padding:24px;">Nenhuma venda ou pedido registrado ainda.</p>';
  } else {
    pedLista.innerHTML = pedidos.map((ped) => {
      const itensResumo = ped.itens.map((i) => `${i.qtd}x ${escapeHTML(i.nome)}`).join(' | ');
      return `
        <div class="order-card ${ped.is_teste ? 'arquivo-teste' : ''}">
          <div class="order-card-head">
            <div>
              <strong>#${ped.id.toString().slice(-4)} • ${escapeHTML(ped.cliente)} (${escapeHTML(ped.canal || 'Site')} • ${escapeHTML(ped.data)})</strong>
              ${ped.is_teste ? '<span class="badge-teste">🧪 Arquivo Teste</span>' : ''}
            </div>
            <div class="pedido-actions-group">
              <select class="select-status-pedido" data-status-ped="${ped.id}" aria-label="Status do pedido">
                <option value="Pendente" ${ped.status === 'Pendente' ? 'selected' : ''}>🟡 Pendente</option>
                <option value="Separado" ${ped.status === 'Separado' ? 'selected' : ''}>🔵 Separado</option>
                <option value="Entregue" ${ped.status === 'Entregue' ? 'selected' : ''}>🟢 Entregue / Concluído</option>
                <option value="Cancelado" ${ped.status === 'Cancelado' ? 'selected' : ''}>🔴 Cancelado</option>
              </select>
              <button type="button" class="btn-teste-toggle" data-toggle-teste="${ped.id}">
                ${ped.is_teste ? '↩️ Tornar Real' : '🧪 Arquivo Teste'}
              </button>
              <button type="button" class="btn-del" data-del-ped="${ped.id}">
                🗑️ Excluir
              </button>
            </div>
          </div>
          <div style="color:#475569;margin-bottom:4px;">${itensResumo}</div>
          <div style="display:flex;justify-content:space-between;font-size:0.8rem;">
            <span>${escapeHTML(ped.entrega)}${ped.endereco ? ` — ${escapeHTML(ped.endereco)}` : ''} • ${escapeHTML(ped.pagamento)}</span>
            <strong style="color:#0f766e;">${formatarMoeda(ped.total)}</strong>
          </div>
        </div>
      `;
    }).join('');
  }

  const repLista = document.getElementById('lista-reposicao');
  if (criticos.length === 0) {
    repLista.innerHTML = '<p style="color:#166534;text-align:center;padding:24px;font-weight:600;">✅ Todos os produtos estão acima do estoque mínimo!</p>';
  } else {
    repLista.innerHTML = criticos.map((p) => {
      const sugerido = Math.max(p.estoque_minimo * 2 - p.estoque, 5);
      return `
        <div class="order-card" style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong>[#${escapeHTML(p.codigo)}] ${escapeHTML(p.nome)}</strong>
            <div style="font-size:0.78rem;color:#dc2626;">Atual: ${p.estoque} un. | Mínimo: ${p.estoque_minimo} un.</div>
          </div>
          <span style="background:#fef3c7;color:#92400e;padding:4px 10px;border-radius:8px;font-weight:700;font-size:0.8rem;">
            Comprar +${sugerido} un.
          </span>
        </div>
      `;
    }).join('');
  }

  document.getElementById('lista-auditoria').innerHTML = auditoria.map((log) => `
    <div style="font-size:0.82rem;padding:8px 10px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;gap:10px;">
      <span><strong>${escapeHTML(log.usuario)}:</strong> ${escapeHTML(log.acao)}</span>
      <span style="color:#64748b;white-space:nowrap;font-size:0.75rem;">${escapeHTML(log.data)}</span>
    </div>
  `).join('');
}

/* Delegação de Eventos no Painel Admin */
document.getElementById('lista-admin').addEventListener('change', (e) => {
  const input = e.target.closest('[data-prod-id]');
  if (!input) return;
  editarProduto(Number(input.dataset.prodId), input.dataset.prodCampo, input.value);
});

document.getElementById('lista-admin').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-del-prod]');
  if (!btn) return;
  removerProduto(Number(btn.dataset.delProd));
});

document.getElementById('lista-admin-pedidos').addEventListener('change', (e) => {
  const sel = e.target.closest('[data-status-ped]');
  if (!sel) return;
  alterarStatusPedido(Number(sel.dataset.statusPed), sel.value);
});

document.getElementById('lista-admin-pedidos').addEventListener('click', (e) => {
  const btnTeste = e.target.closest('[data-toggle-teste]');
  if (btnTeste) {
    alternarModoTestePedido(Number(btnTeste.dataset.toggleTeste));
    return;
  }
  const btnDel = e.target.closest('[data-del-ped]');
  if (btnDel) {
    excluirPedido(Number(btnDel.dataset.delPed));
  }
});

function editarProduto(id, campo, valor) {
  if (!isAdminLogado()) return;
  const prod = produtos.find((p) => p.id === id);
  if (!prod) return;

  const num = campo === 'preco' ? Math.max(0, parseFloat(valor) || 0) : Math.max(0, parseInt(valor, 10) || 0);
  prod[campo] = num;
  registrarLog(`Alterou ${campo} do produto "${prod.nome}" para ${num}.`);
  salvarEstado();
  sincronizarCarrinhoComEstoque();
  renderizarAdmin();
  renderizarProdutos();
  mostrarNotificacao('Produto atualizado!', `${prod.nome} salvo no catálogo.`, 'success');
}

function removerProduto(id) {
  if (!isAdminLogado()) return;
  const prod = produtos.find((p) => p.id === id);
  if (!prod) return;

  solicitarConfirmacao(
    `Excluir "${prod.nome}"?`,
    `Deseja remover o produto SKU #${prod.codigo} do catálogo?`,
    () => {
      produtos = produtos.filter((p) => p.id !== id);
      registrarLog(`Removeu produto "${prod.nome}" do catálogo.`);
      salvarEstado();
      sincronizarCarrinhoComEstoque();
      renderizarAdmin();
      renderizarProdutos();
      mostrarNotificacao('Produto excluído', `${prod.nome} removido do catálogo.`, 'info');
    }
  );
}

document.getElementById('form-novo-produto').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!isAdminLogado()) return;

  const codigo = document.getElementById('novo-codigo').value.trim();
  if (produtos.some((p) => p.codigo.toLowerCase() === codigo.toLowerCase())) {
    mostrarNotificacao('SKU duplicado', `Já existe um produto com o código #${codigo}.`, 'warning');
    return;
  }

  const novo = {
    id: Date.now(),
    codigo,
    nome: document.getElementById('novo-nome').value.trim(),
    categoria: document.getElementById('novo-categoria').value,
    preco: Math.max(0.1, parseFloat(document.getElementById('novo-preco').value) || 0),
    estoque: Math.max(0, parseInt(document.getElementById('novo-estoque').value, 10) || 0),
    estoque_minimo: Math.max(1, parseInt(document.getElementById('novo-minimo').value, 10) || 5),
    rendimento: 'Novo cadastro',
    icone: '🧴'
  };

  produtos.unshift(novo);
  registrarLog(`Cadastrou novo SKU #${novo.codigo} — ${novo.nome} (${novo.estoque} un.).`);
  salvarEstado();
  renderizarAdmin();
  renderizarProdutos();
  e.target.reset();
  document.getElementById('novo-minimo').value = '5';
  mostrarNotificacao('Produto cadastrado!', `${novo.nome} disponível na vitrine.`, 'success');
});

document.getElementById('btn-registrar-pdv').addEventListener('click', () => {
  if (!isAdminLogado()) return;
  const prodId = parseInt(document.getElementById('pdv-produto').value, 10);
  const qtd = Math.max(1, parseInt(document.getElementById('pdv-qtd').value, 10) || 1);
  const pagamento = document.getElementById('pdv-pagamento').value;
  const isTeste = document.getElementById('pdv-modo-teste').checked;

  const prod = produtos.find((p) => p.id === prodId);
  if (!prod || prod.estoque < qtd) {
    mostrarNotificacao('Saldo insuficiente', 'Quantidade maior que o estoque disponível no balcão.', 'error');
    return;
  }

  prod.estoque -= qtd;
  const total = prod.preco * qtd;
  const agora = Date.now();
  const vendaBalcao = {
    id: agora,
    timestamp: agora,
    usuario_id: usuarioLogado.id,
    canal: 'PDV Balcão',
    cliente: isTeste ? 'Teste Balcão (Simulação)' : 'Venda Balcão (Loja Física)',
    entrega: 'Retirada imediata',
    endereco: '',
    pagamento,
    total,
    status: 'Entregue',
    is_teste: isTeste,
    data: new Date(agora).toLocaleDateString('pt-BR'),
    itens: [{ id: prod.id, nome: prod.nome, preco: prod.preco, qtd }]
  };

  pedidos.unshift(vendaBalcao);
  registrarLog(`${isTeste ? '[TESTE] ' : ''}PDV Balcão: ${qtd}x ${prod.nome} (${formatarMoeda(total)} via ${pagamento}).`);
  document.getElementById('pdv-modo-teste').checked = false;
  salvarEstado();
  sincronizarCarrinhoComEstoque();
  renderizarAdmin();
  renderizarProdutos();
  mostrarNotificacao(
    isTeste ? 'Venda Teste registrada!' : 'Venda registrada no PDV!',
    `${qtd}x ${prod.nome} — ${formatarMoeda(total)}.`,
    isTeste ? 'info' : 'success'
  );
});

function alterarStatusPedido(pedidoId, novoStatus) {
  if (!isAdminLogado()) return;
  const ped = pedidos.find((p) => p.id === pedidoId);
  if (!ped || ped.status === novoStatus) return;

  const statusAnterior = ped.status;
  if (novoStatus === 'Cancelado' && statusAnterior !== 'Cancelado') {
    ped.itens.forEach((item) => {
      const prod = produtos.find((p) => p.id === item.id);
      if (prod) prod.estoque += item.qtd;
    });
  } else if (statusAnterior === 'Cancelado' && novoStatus !== 'Cancelado') {
    ped.itens.forEach((item) => {
      const prod = produtos.find((p) => p.id === item.id);
      if (prod) prod.estoque = Math.max(0, prod.estoque - item.qtd);
    });
  }

  ped.status = novoStatus;
  registrarLog(`Status do Pedido #${ped.id.toString().slice(-4)} alterado de ${statusAnterior} para ${novoStatus}.`);
  salvarEstado();
  renderizarAdmin();
  renderizarProdutos();
  mostrarNotificacao('Status atualizado!', `Pedido #${ped.id.toString().slice(-4)} marcado como ${novoStatus}.`, 'info');
}

document.getElementById('btn-copiar-reposicao').addEventListener('click', () => {
  const criticos = produtos.filter((p) => p.estoque <= p.estoque_minimo);
  if (criticos.length === 0) {
    mostrarNotificacao('Tudo abastecido', 'Nenhum item abaixo do estoque mínimo.', 'info');
    return;
  }
  const texto = 'LISTA DE REPOSIÇÃO - UNIVERSO DA LIMPEZA:\n' + criticos.map((p) => {
    const sugerido = Math.max(p.estoque_minimo * 2 - p.estoque, 5);
    return `- [SKU #${p.codigo}] ${p.nome}: Saldo ${p.estoque} un. -> Comprar +${sugerido} un.`;
  }).join('\n');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto);
  }
  mostrarNotificacao('Lista copiada!', 'Relação de compras copiada para a área de transferência.', 'success');
});

document.getElementById('btn-exportar-csv').addEventListener('click', () => {
  const cabecalho = 'Codigo;Produto;Categoria;Preco;Estoque_Atual;Estoque_Minimo\n';
  const linhas = produtos.map((p) => {
    const nomeLimpo = String(p.nome).replace(/"/g, '""');
    return `${p.codigo};"${nomeLimpo}";"${p.categoria}";${p.preco.toFixed(2).replace('.', ',')};${p.estoque};${p.estoque_minimo}`;
  }).join('\n');
  const blob = new Blob(['\uFEFF' + cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'estoque_universo_da_limpeza.csv';
  link.click();
  URL.revokeObjectURL(link.href);
  registrarLog('Exportou relatório de estoque em CSV.');
  salvarEstado();
  mostrarNotificacao('CSV exportado!', 'Planilha de estoque baixada com sucesso.', 'success');
});

/* ============================================================================
   GERENCIAMENTO DE MODAIS E NAVEGAÇÃO
   ============================================================================ */
const drawer = document.getElementById('drawer-carrinho');
const modalAuth = document.getElementById('modal-auth');
const modalPerfil = document.getElementById('modal-perfil');
const modalAdmin = document.getElementById('modal-admin');
const overlay = document.getElementById('overlay');

function abrirModal(elemento) {
  elemento.classList.remove('hidden');
  overlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function abrirModalAuth() {
  abrirModal(modalAuth);
}

function fecharModais() {
  drawer.classList.add('hidden');
  modalAuth.classList.add('hidden');
  modalPerfil.classList.add('hidden');
  modalAdmin.classList.add('hidden');
  modalConfirmacao.classList.add('hidden');
  callbackConfirmacao = null;
  overlay.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const isLogin = tab.dataset.tab === 'login';
    document.getElementById('form-login').classList.toggle('hidden', !isLogin);
    document.getElementById('form-cadastro').classList.toggle('hidden', isLogin);
    document.getElementById('auth-titulo').textContent = isLogin ? 'Entrar na sua conta' : 'Criar conta de cliente';
  });
});

document.querySelectorAll('.admin-subtab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-subtab').forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const alvo = tab.dataset.admintab;
    ['caixa', 'pedidos', 'pdv', 'estoque', 'reposicao', 'auditoria'].forEach((nome) => {
      document.getElementById(`admin-tab-${nome}`).classList.toggle('hidden', nome !== alvo);
    });
  });
});

document.getElementById('btn-logo-reset').addEventListener('click', resetarFiltros);
document.getElementById('btn-hero-kits').addEventListener('click', () => filtrarPorCategoria('Kits Econômicos'));
document.getElementById('btn-abrir-carrinho').addEventListener('click', () => abrirModal(drawer));

document.getElementById('btn-abrir-admin').addEventListener('click', () => {
  if (!isAdminLogado()) {
    mostrarNotificacao('Acesso restrito', 'Apenas administradores podem acessar o painel.', 'error');
    return;
  }
  renderizarAdmin();
  abrirModal(modalAdmin);
});

document.getElementById('btn-fechar-carrinho').addEventListener('click', fecharModais);
document.getElementById('btn-fechar-auth').addEventListener('click', fecharModais);
document.getElementById('btn-fechar-perfil').addEventListener('click', fecharModais);
document.getElementById('btn-fechar-admin').addEventListener('click', fecharModais);
overlay.addEventListener('click', fecharModais);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!modalConfirmacao.classList.contains('hidden')) {
      fecharConfirmacao();
    } else {
      fecharModais();
    }
  }
});

document.getElementById('btn-salvar-admin').addEventListener('click', () => {
  fecharModais();
  mostrarNotificacao('Painel fechado', 'Alterações salvas com sucesso.', 'success');
});

document.getElementById('btn-resetar-bd').addEventListener('click', () => {
  if (!isAdminLogado()) return;
  solicitarConfirmacao(
    'Restaurar Produtos Padrão?',
    'Isso irá redefinir a lista de produtos e estoques para os valores iniciais.',
    () => {
      produtos = structuredClone(PRODUTOS_INICIAIS);
      registrarLog('Restaurou lista inicial de produtos.');
      salvarEstado();
      sincronizarCarrinhoComEstoque();
      renderizarAdmin();
      renderizarProdutos();
      mostrarNotificacao('Produtos restaurados!', 'Catálogo inicial recarregado com sucesso.', 'info');
    }
  );
});

document.getElementById('input-busca').addEventListener('input', renderizarProdutos);
document.getElementById('select-ordenar').addEventListener('change', (e) => {
  ordenacaoAtiva = e.target.value;
  renderizarProdutos();
});
document.querySelectorAll('.cat-btn').forEach((btn) => {
  btn.addEventListener('click', () => filtrarPorCategoria(btn.dataset.cat));
});

document.getElementById('tipo-entrega').addEventListener('change', (e) => {
  const isEntrega = e.target.value === 'Entrega em domicílio';
  document.getElementById('grupo-endereco').classList.toggle('hidden', !isEntrega);
  document.getElementById('valor-frete').textContent = isEntrega ? 'Grátis (Nova Granada)' : 'Retirada no balcão';
});

document.getElementById('forma-pagamento').addEventListener('change', (e) => {
  document.getElementById('grupo-troco').classList.toggle('hidden', e.target.value !== 'Dinheiro');
});

document.getElementById('btn-finalizar-whatsapp').addEventListener('click', finalizarWhatsApp);

/* Inicialização */
atualizarStatusLoja();
atualizarInterfaceUsuario();
sincronizarCarrinhoComEstoque();
renderizarProdutos();
atualizarCarrinho();

/* ============================================================================
   CONTROLE DE SEGURANÇA GLOBAL DO ECOSSISTEMA (RBAC: ADMIN vs CLIENTE)
   ============================================================================ */
window.ulSyncEcosystemAuth = function(user) {
  const SESSION_KEY = 'ul_auth_session_v1';
  const bar = document.getElementById('adminSuiteSwitcher');
  const badge = document.getElementById('adminSuiteUserBadge');

  const isAdmin = Boolean(user && (user.perfil === 'admin' || user.role === 'admin'));

  if (isAdmin) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      role: 'admin',
      perfil: 'admin',
      nome: user.nome || user.name || 'Joana (Administração)',
      email: user.email || 'admin@universolimpeza.com.br',
      loggedAt: Date.now()
    }));
    if (bar) bar.classList.remove('hidden-suite');
    if (badge) badge.textContent = 'Admin: ' + (user.nome || user.name || 'Joana');
  } else if (user) {
    // Cliente comum: pode fazer pedidos, mas NÃO tem acesso ao ecossistema interno
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      role: 'cliente',
      perfil: 'cliente',
      nome: user.nome || user.name || 'Cliente',
      email: user.email || '',
      loggedAt: Date.now()
    }));
    if (bar) bar.classList.add('hidden-suite');
  } else {
    localStorage.removeItem(SESSION_KEY);
    if (bar) bar.classList.add('hidden-suite');
  }
};

window.ulLogoutAdmin = function() {
  localStorage.removeItem('ul_auth_session_v1');
  const bar = document.getElementById('adminSuiteSwitcher');
  if (bar) bar.classList.add('hidden-suite');
  if (typeof fazerLogout === 'function') {
    fazerLogout();
  } else {
    usuarioLogado = null;
    if (typeof salvarEstado === 'function') salvarEstado();
    if (typeof atualizarInterfaceUsuario === 'function') atualizarInterfaceUsuario();
  }
};

// Executa sincronização imediata ao carregar a página
(function bootstrapEcosystemRBAC() {
  if (typeof usuarioLogado !== 'undefined') {
    window.ulSyncEcosystemAuth(usuarioLogado);
  }
})();
