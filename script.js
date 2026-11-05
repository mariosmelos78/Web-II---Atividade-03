// Referências dos Elementos do DOM
const selectUf = document.getElementById('select-uf');
const statusContainer = document.getElementById('status-container');
const ufInfoSection = document.getElementById('uf-info');
const municipiosSection = document.getElementById('municipios-container');
const totalMunicipiosEl = document.getElementById('total-municipios');
const listaMunicipiosEl = document.getElementById('lista-municipios');

// Cache dos estados para evitar requisições repetidas na renderização da UF
let estadosCache = [];

// ==========================================
// FUNÇÕES DE GERENCIAMENTO DE ESTADO / TELA
// ==========================================

function mostrarCarregando(mensagem = 'Carregando...') {
  statusContainer.textContent = '';
  const p = document.createElement('p');
  p.className = 'mensagem-carregando';
  p.textContent = mensagem;
  statusContainer.appendChild(p);
}

function limparStatus() {
  statusContainer.textContent = '';
}

function mostrarErro(mensagem, funcaoRecarregar = null) {
  statusContainer.textContent = '';
  
  const divErro = document.createElement('div');
  divErro.className = 'mensagem-erro';

  const texto = document.createElement('p');
  texto.textContent = mensagem;
  divErro.appendChild(texto);

  // Bônus: Botão Tentar De Novo
  if (funcaoRecarregar) {
    const btnRetry = document.createElement('button');
    btnRetry.className = 'btn-retry';
    btnRetry.textContent = 'Tentar de novo';
    btnRetry.addEventListener('click', funcaoRecarregar);
    divErro.appendChild(btnRetry);
  }

  statusContainer.appendChild(divErro);
}

function ocultarResultados() {
  ufInfoSection.classList.add('hidden');
  municipiosSection.classList.add('hidden');
}

// ==========================================
// REQUISIÇÕES DA API (ASYNC / AWAIT)
// ==========================================

// 1. Carregar Lista de Estados
async function carregarEstados() {
  mostrarCarregando('Carregando lista de estados...');
  ocultarResultados();
  selectUf.disabled = true;

  try {
    const resposta = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');

    if (!resposta.ok) {
      throw new Error(`Falha ao buscar estados (Status: ${resposta.status})`);
    }

    const estados = await resposta.json();
    
    // Ordenar alfabeticamente pelo nome
    estados.sort((a, b) => a.nome.localeCompare(b.nome));
    estadosCache = estados;

    preencherSelectEstados(estados);
    limparStatus();
  } catch (erro) {
    mostrarErro('Não foi possível carregar a lista de estados. Verifique sua conexão.', carregarEstados);
  } finally {
    selectUf.disabled = false;
  }
}

// 2. Preencher Opções do Select (com createElement)
function preencherSelectEstados(estados) {
  selectUf.textContent = '';

  const opcaoPadrao = document.createElement('option');
  opcaoPadrao.value = '';
  opcaoPadrao.textContent = '-- Selecione um Estado --';
  selectUf.appendChild(opcaoPadrao);

  estados.forEach(estado => {
    const option = document.createElement('option');
    option.value = estado.sigla;
    // Exibe Nome e Sigla no Select
    option.textContent = `${estado.nome} (${estado.sigla})`;
    selectUf.appendChild(option);
  });
}

// 3. Carregar Municípios da UF Escolhida
async function carregarMunicipios(siglaUf) {
  if (!siglaUf) {
    ocultarResultados();
    limparStatus();
    return;
  }

  mostrarCarregando(`Buscando municípios de ${siglaUf}...`);
  ocultarResultados();

  try {
    const url = `[suspicious link removed]{siglaUf}/municipios`;
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error(`Erro na busca de municípios (Status: ${resposta.status})`);
    }

    const municipios = await resposta.json();

    // Tratamento de "não encontrado" / lista vazia
    if (!Array.isArray(municipios) || municipios.length === 0) {
      mostrarErro(`Nenhum município foi encontrado para o estado ${siglaUf}.`);
      return;
    }

    exibirInformacoesEstado(siglaUf);
    exibirListaMunicipios(municipios);
    limparStatus();
  } catch (erro) {
    mostrarErro(`Erro ao carregar dados dos municípios de ${siglaUf}.`, () => carregarMunicipios(siglaUf));
  }
}

// ==========================================
// RENDERIZAÇÃO DE DADOS NO DOM (createElement)
// ==========================================

// Exibe Informações do Estado (Informações 1, 2 e 3)
function exibirInformacoesEstado(siglaUf) {
  const estado = estadosCache.find(e => e.sigla === siglaUf);
  if (!estado) return;

  ufInfoSection.textContent = '';

  // Informação 1: Nome do Estado
  const titulo = document.createElement('h2');
  titulo.textContent = estado.nome;

  const containerDetalhes = document.createElement('div');
  containerDetalhes.className = 'uf-detalhes';

  // Informação 2: Sigla
  const badgeSigla = document.createElement('span');
  badgeSigla.className = 'badge';
  badgeSigla.textContent = `UF: ${estado.sigla}`;

  // Informação 3: Região (Nome e Sigla da Região)
  const badgeRegiao = document.createElement('span');
  badgeRegiao.className = 'badge';
  badgeRegiao.textContent = `Região: ${estado.regiao.nome} (${estado.regiao.sigla})`;

  containerDetalhes.appendChild(badgeSigla);
  containerDetalhes.appendChild(badgeRegiao);

  ufInfoSection.appendChild(titulo);
  ufInfoSection.appendChild(containerDetalhes);
  ufInfoSection.classList.remove('hidden');
}

// Exibe Lista e Contagem dos Municípios (Informações 4 e 5)
function exibirListaMunicipios(municipios) {
  listaMunicipiosEl.textContent = '';

  // Informação 4: Quantidade Total de Municípios
  totalMunicipiosEl.textContent = `Total de municípios encontrados: ${municipios.length}`;

  // Informação 5: Nomes dos Municípios
  municipios.forEach(municipio => {
    const li = document.createElement('li');
    li.textContent = municipio.nome;
    listaMunicipiosEl.appendChild(li);
  });

  municipiosSection.classList.remove('hidden');
}

// ==========================================
// EVENTOS E INICIALIZAÇÃO
// ==========================================

selectUf.addEventListener('change', (evento) => {
  const ufSelecionada = evento.target.value;
  carregarMunicipios(ufSelecionada);
});

// Inicializa a aplicação ao carregar a página
carregarEstados();
