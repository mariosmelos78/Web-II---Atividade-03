// Seleção dos elementos do DOM
const characterIdInput = document.getElementById('characterId');
const searchBtn = document.getElementById('searchBtn');
const contentArea = document.getElementById('contentArea');

// 1. Função principal responsável por buscar os dados da API
async function fetchCharacterData(id) {
    const url = `https://rickandmortyapi.com{id}`;
    
    // Mostra o estado de "Carregando..." na tela antes do fetch
    showLoading();

    try {
        const resposta = await fetch(url);

        // Trata o erro de "Não encontrado" (Ex: ID que não existe dá erro 404)
        if (resposta.status === 404) {
            throw new Error("Personagem não encontrado! Digite um ID válido (1 até 826).");
        }

        // Verifica se a resposta foi bem-sucedida para outros erros de rede
        if (!resposta.ok) {
            throw new Error(`Erro na requisição: Código ${resposta.status}`);
        }

        const dados = await resposta.json();
        
        // Se deu tudo certo, envia os dados obtidos para serem renderizados
        renderCharacterCard(dados);

    } catch (error) {
        // Captura o erro e mostra uma mensagem amigável para o usuário na tela
        showError(error.message);
    }
}

// 2. Função responsável por criar e estruturar o elemento (Cartão) na tela
function renderCharacterCard(character) {
    // Limpa a área de conteúdo antes de desenhar o novo elemento
    contentArea.textContent = "";

    const card = document.createElement('div');
    card.className = 'card';

    // Criação da imagem (Info 1)
    const img = document.createElement('img');
    img.src = character.image;
    img.alt = `Foto de ${character.name}`;

    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';

    // Criação do nome (Info 2)
    const name = document.createElement('h2');
    name.textContent = character.name;

    // Criação da espécie (Info 3)
    const speciesRow = document.createElement('div');
    speciesRow.className = 'info-row';
    speciesRow.textContent = "Espécie: ";
    const speciesSpan = document.createElement('strong');
    speciesSpan.textContent = character.species;
    speciesRow.appendChild(speciesSpan);

    // Criação da origem (Info 4)
    const originRow = document.createElement('div');
    originRow.className = 'info-row';
    originRow.textContent = "Origem: ";
    const originSpan = document.createElement('strong');
    originSpan.textContent = character.origin.name;
    originRow.appendChild(originSpan);

    // Badge Dinâmico para o Status do Personagem (Extra/Estilo)
    const statusRow = document.createElement('div');
    statusRow.className = 'info-row';
    statusRow.style.marginTop = "12px";
    
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge status-${character.status.toLowerCase()}`;
    statusBadge.textContent = character.status;
    statusRow.appendChild(statusBadge);

    // Montando a árvore de elementos com appendChild (Sem usar innerHTML)
    cardInfo.appendChild(name);
    cardInfo.appendChild(speciesRow);
    cardInfo.appendChild(originRow);
    cardInfo.appendChild(statusRow);

    card.appendChild(img);
    card.appendChild(cardInfo);

    contentArea.appendChild(card);
}

// 3. Função responsável pelo estado de Carregando
function showLoading() {
    contentArea.textContent = "";
    const loadingMessage = document.createElement('p');
    loadingMessage.className = 'loading';
    loadingMessage.textContent = "Carregando dados...";
    contentArea.appendChild(loadingMessage);
}

// 4. Função responsável por exibir mensagens de erro na tela
function showError(message) {
    contentArea.textContent = "";
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    contentArea.appendChild(errorDiv);
}

// Ouvintes de Eventos (Event Listeners)
searchBtn.addEventListener('click', () => {
    const id = characterIdInput.value.trim();
    if (id) {
        fetchCharacterData(id);
    }
});

// Faz uma busca inicial ao carregar a página pela primeira vez (ID 1)
fetchCharacterData(1);
