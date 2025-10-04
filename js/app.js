let allPokemons = [];
let allPokemonNames = [];
let currentOffset = 0;
const limit = 20;
let currentList = [];
let isFiltered = false;
let searchList = [];


// Busca detalhes do Pokémon
async function fetchPokemonDetail(name) {
  try {
    const res = await fetch(`${API_URL}/pokemon/${name.toLowerCase()}`);
    if (!res.ok) throw new Error("Pokémon não encontrado");
    const data = await res.json();
    const defaultSprites = data.sprites || {};
    const animatedSprites = data.sprites.versions?.["generation-v"]?.["black-white"]?.animated || {};

    return {
      id: data.id,
      name: data.name,
      height: data.height || 0,
      weight: data.weight || 0,
      types: data.types || [],
      abilities: data.abilities || [],
      moves: data.moves || [],
      stats: data.stats || [],
      sprites: {
        front_default: defaultSprites.front_default || "",
        front_shiny: defaultSprites.front_shiny || "",
        versions: {
          "generation-v": {
            "black-white": {
              animated: {
                front_default: animatedSprites.front_default || defaultSprites.front_default || "",
                back_default: animatedSprites.back_default || defaultSprites.back_default || "",
                front_shiny: animatedSprites.front_shiny || defaultSprites.front_shiny || "",
                back_shiny: animatedSprites.back_shiny || defaultSprites.back_shiny || "",
              },
            },
          },
        },
      },
    };
  } catch {
    return null;
  }
}

// Carrega todos os nomes (para busca rápida)
async function loadAllPokemonNames() {
  try {
    const res = await fetch(`${API_URL}/pokemon?limit=100000&offset=0`);
    const data = await res.json();
    allPokemonNames = data.results.map(p => p.name);
  } catch {
    console.error("Erro ao carregar todos os nomes de Pokémon");
  }
}

// Loader
function showLoader(message = "Carregando...") {
  document.getElementById("pokedex").innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 500px;
      text-align: center;
      gap: 20px;
    ">
      <img 
        src="assets/img/pokeball.png" 
        alt="${message}" 
        style="
          width: min(200px, 20vw);
          height: auto;
          animation: spin 1.5s linear infinite;
        "
      >
      <span style="
        font-family: Arial, sans-serif;
        font-size: 1.5rem;
        color: #333;
      ">${message}</span>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}

// Carrega Pokémon (inicial, paginação ou reset)
async function loadPokemons(offset = 0) {
  showLoader();
  await new Promise(r => setTimeout(r, 50));
  const data = await fetchPokemons(limit, offset);
  const fetched = await Promise.all(data.results.map(p => fetchPokemonDetail(p.name)));
  const filtered = fetched.filter(p => p);
  currentList = offset === 0 ? filtered : currentList.concat(filtered);
  currentOffset = offset;
  renderPokemons(currentList.slice(currentOffset, currentOffset + limit));
}

// Carrega geração
async function loadGeneration(generationId) {
  showLoader("Carregando geração...");
  try {
    const res = await fetch(`${API_URL}/generation/${generationId}`);
    const genData = await res.json();
    const pokemonData = await Promise.all(genData.pokemon_species.map(p => fetchPokemonDetail(p.name)));
    currentList = pokemonData.filter(p => p).sort((a, b) => a.id - b.id);
    isFiltered = false;
    searchList = [];
    currentOffset = 0;
    renderPokemons(currentList.slice(currentOffset, currentOffset + limit));
  } catch {
    document.getElementById("pokedex").innerHTML = "<p>Erro ao carregar geração.</p>";
  }
}

// Cria barra de stats
function createStatBar(stat, value) {
  return `
    <div class="stat">
      <span class="stat-label">${stat}</span>
      <div class="stat-bar-container">
        <div class="stat-bar" style="width: ${value}%;"></div>
      </div>
      <span>${value}</span>
    </div>
  `;
}

// Modal Pokémon
function renderPokemonModal(pokemon) {
  if (!pokemon) return;
  const modal = document.getElementById("pokemonModal");
  const modalBody = document.getElementById("modalBody");
  const types = pokemon.types.map(t => t.type.name).join(", ") || "N/A";
  const abilities = pokemon.abilities.map(a => a.ability.name).join(", ") || "N/A";
  const moves = pokemon.moves.slice(0, 10).map(m => m.move.name).join(", ") || "N/A";
  const statsHTML = pokemon.stats.length
    ? pokemon.stats.map(s => createStatBar(s.stat.name, s.base_stat)).join("")
    : "<p>Stats não disponíveis</p>";
  const gifUrl = pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated?.front_default || pokemon.sprites.front_default;
  const shinyUrl = pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated?.front_shiny || pokemon.sprites.front_shiny || gifUrl;

  modalBody.innerHTML = `
    <h2>${pokemon.name.toUpperCase()}</h2>
    <div class="sprites-container">
      <img class="sprite" src="${gifUrl}" alt="${pokemon.name}" />
      <img class="sprite" src="${shinyUrl}" alt="${pokemon.name} Shiny" />
    </div>
    <p><strong>Altura:</strong> ${pokemon.height ? pokemon.height / 10 + " m" : "N/A"}</p>
    <p><strong>Peso:</strong> ${pokemon.weight ? pokemon.weight / 10 + " kg" : "N/A"}</p>
    <p><strong>Tipo:</strong> ${types}</p>
    <p><strong>Habilidades:</strong> ${abilities}</p>
    <p><strong>Movimentos:</strong> ${moves}</p>
    <div class="stats-container">${statsHTML}</div>
  `;
  modal.classList.remove("hidden");
}

// Eventos do modal
function attachModalEvents() {
  const modal = document.getElementById("pokemonModal");
  const closeBtn = document.getElementById("closeModal");
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });
}

// Carrega a primeira geração (Kanto) na inicialização
async function loadInitialGeneration() {
  showLoader("Carregando Kanto...");
  try {
    const resGen = await fetch(`${API_URL}/generation/1`); // Kanto
    const genData = await resGen.json();
    const pokemonData = await Promise.all(
      genData.pokemon_species.map(p => fetchPokemonDetail(p.name))
    );
    currentList = pokemonData.filter(p => p).sort((a, b) => a.id - b.id);
    isFiltered = false;
    searchList = [];
    currentOffset = 0;
    renderPokemons(currentList.slice(currentOffset, currentOffset + limit));
  } catch {
    document.getElementById("pokedex").innerHTML = "<p>Erro ao carregar Kanto.</p>";
  }
}

// Paginação ajustada
function paginate(delta) {
  const listToPaginate = searchList.length ? searchList : currentList;
  const newOffset = currentOffset + delta * limit;

  // Bloqueia se sair dos limites da lista
  if (newOffset < 0 || newOffset >= listToPaginate.length) return;

  currentOffset = newOffset;
  renderPokemons(listToPaginate.slice(currentOffset, currentOffset + limit));
}

// Inicialização
async function init() {
  await loadAllPokemonNames();
  await loadInitialGeneration(); // <--- aqui carregamos Kanto de fato
  attachModalEvents();

  const searchInput = document.getElementById("searchInput");
  const prevBtn = document.getElementById("prevPokemon");
  const nextBtn = document.getElementById("nextPokemon");
  const allTypesBtn = document.getElementById("allTypes");
  const allTypesBtnBottom = document.getElementById("allTypesBottom");
  const typeFilterContainer = document.getElementById("typeFilterContainer");
  const prevBtnBottom = document.getElementById("prevPokemonBottom");
  const nextBtnBottom = document.getElementById("nextPokemonBottom");
  const generationSelect = document.getElementById("generationSelect");

  // Busca
  searchInput.addEventListener("input", async e => {
    const query = e.target.value.toLowerCase();
    if (!query) {
      currentOffset = 0; searchList = [];
      return renderPokemons(currentList.slice(currentOffset, currentOffset + limit));
    }
    const baseList = isFiltered ? currentList : allPokemonNames;
    if (isFiltered) {
      searchList = baseList.filter(p => p.name.startsWith(query));
    } else {
      const matches = baseList.filter(name => name.startsWith(query));
      searchList = await Promise.all(matches.slice(0,50).map(name => fetchPokemonDetail(name)));
      searchList = searchList.filter(p => p);
    }
    currentOffset = 0;
    renderPokemons(searchList.length ? searchList.slice(currentOffset, currentOffset + limit) : document.getElementById("pokedex").innerHTML = "<p>Pokémon não encontrado.</p>");
  });

  // Filtro de tipos
  async function showTypesList() {
    if (typeFilterContainer.style.display === "flex") return typeFilterContainer.style.display = "none";
    typeFilterContainer.innerHTML = "";
    typeFilterContainer.style.display = "flex";

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Todos os Pokémons";
    resetBtn.classList.add("type-btn");
    resetBtn.addEventListener("click", async () => {
      currentOffset = 0; searchList = []; isFiltered = false;
      await loadInitialGeneration(); // <--- garante que volta para Kanto corretamente
      typeFilterContainer.style.display = "none";
    });
    typeFilterContainer.appendChild(resetBtn);

    try {
      const res = await fetch(`${API_URL}/type`);
      const data = await res.json();
      data.results.forEach(t => {
        const btn = document.createElement("button");
        btn.textContent = t.name;
        btn.classList.add("type-btn");
        btn.addEventListener("click", async () => {
          try {
            const resType = await fetch(`${API_URL}/type/${t.name}`);
            const pokes = await Promise.all((await resType.json()).pokemon.map(p => fetchPokemonDetail(p.pokemon.name)));
            currentList = pokes.filter(p => p);
            isFiltered = true; searchList = []; currentOffset = 0;
            renderPokemons(currentList.slice(currentOffset, currentOffset + limit));
            typeFilterContainer.style.display = "none";
          } catch { document.getElementById("pokedex").innerHTML = "<p>Erro ao carregar pokémons do tipo selecionado.</p>"; }
        });
        typeFilterContainer.appendChild(btn);
      });
    } catch { typeFilterContainer.innerHTML = "<p>Erro ao carregar tipos.</p>"; }
  }

  document.addEventListener("click", e => {
    if (!typeFilterContainer.contains(e.target) && e.target !== allTypesBtn && e.target !== allTypesBtnBottom) typeFilterContainer.style.display = "none";
  });

  // Botões
  prevBtn?.addEventListener("click", () => paginate(-1));
  nextBtn?.addEventListener("click", () => paginate(1));
  prevBtnBottom?.addEventListener("click", () => paginate(-1));
  nextBtnBottom?.addEventListener("click", () => paginate(1));
  allTypesBtn?.addEventListener("click", showTypesList);
  allTypesBtnBottom?.addEventListener("click", showTypesList);

  // Geração
  generationSelect?.addEventListener("change", e => loadGeneration(e.target.value));
}

init();
