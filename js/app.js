let allPokemons = [];
let allPokemonNames = [];
let currentOffset = 0;
const limit = 20;
let currentList = [];
let isFiltered = false;
let searchList = [];

async function fetchPokemonDetail(name) {
  try {
    const res = await fetch(`${API_URL}/pokemon/${name.toLowerCase()}`);
    if (!res.ok) throw new Error("Pokémon não encontrado");
    const data = await res.json();
    const defaultSprites = data.sprites || {};
    const animatedSprites =
      data.sprites.versions?.["generation-v"]?.["black-white"]?.animated || {};
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
                front_default:
                  animatedSprites.front_default ||
                  defaultSprites.front_default ||
                  "",
                back_default:
                  animatedSprites.back_default ||
                  defaultSprites.back_default ||
                  "",
                front_shiny:
                  animatedSprites.front_shiny ||
                  defaultSprites.front_shiny ||
                  "",
                back_shiny:
                  animatedSprites.back_shiny || defaultSprites.back_shiny || "",
              },
            },
          },
        },
      },
    };
  } catch (error) {
    console.error(`Erro ao buscar Pokémon ${name}:`, error);
    return null;
  }
}

async function loadAllPokemonNames() {
  try {
    const res = await fetch(`${API_URL}/pokemon?limit=100000&offset=0`);
    const data = await res.json();
    allPokemonNames = data.results.map((p) => p.name);
  } catch {
    console.error("Erro ao carregar todos os nomes de Pokémon");
  }
}

async function loadPokemons(offset = 0) {
  showLoader();
  const data = await fetchPokemons(limit, offset);
  const fetchedPokemons = await Promise.all(
    data.results.map((p) => fetchPokemonDetail(p.name))
  );
  const filtered = fetchedPokemons.filter((p) => p);
  currentList = offset === 0 ? filtered : currentList.concat(filtered);
  renderPokemons(currentList.slice(currentOffset, currentOffset + limit));
}

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

function renderPokemonModal(pokemon) {
  if (!pokemon) return;
  const modal = document.getElementById("pokemonModal");
  const modalBody = document.getElementById("modalBody");
  modalBody.innerHTML = "";

  const types = pokemon.types?.map((t) => t.type.name).join(", ") || "N/A";
  const abilities =
    pokemon.abilities?.map((a) => a.ability.name).join(", ") || "N/A";
  const moves =
    pokemon.moves
      ?.slice(0, 10)
      .map((m) => m.move.name)
      .join(", ") || "N/A";
  const statsHTML =
    pokemon.stats && pokemon.stats.length > 0
      ? pokemon.stats
          .map((s) => createStatBar(s.stat.name, s.base_stat))
          .join("")
      : "<p>Stats não disponíveis</p>";

  const gifUrl =
    pokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated
      ?.front_default || pokemon.sprites.front_default;
  const shinyUrl =
    pokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated
      ?.front_shiny ||
    pokemon.sprites.front_shiny ||
    gifUrl;

  modalBody.innerHTML = `
    <h2>${pokemon.name.toUpperCase()}</h2>
    <div class="sprites-container">
      <img class="sprite" src="${gifUrl}" alt="${pokemon.name}" />
      <img class="sprite" src="${shinyUrl}" alt="${pokemon.name} Shiny" />
    </div>
    <p><strong>Altura:</strong> ${
      pokemon.height ? pokemon.height / 10 + " m" : "N/A"
    }</p>
    <p><strong>Peso:</strong> ${
      pokemon.weight ? pokemon.weight / 10 + " kg" : "N/A"
    }</p>
    <p><strong>Tipo:</strong> ${types}</p>
    <p><strong>Habilidades:</strong> ${abilities}</p>
    <p><strong>Movimentos:</strong> ${moves}</p>
    <div class="stats-container">${statsHTML}</div>
  `;

  modal.classList.remove("hidden");
}

function attachModalEvents() {
  const modal = document.getElementById("pokemonModal");
  const closeModalBtn = document.getElementById("closeModal");
  closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
}

async function init() {
  await loadAllPokemonNames();
  await loadPokemons(currentOffset);

  attachModalEvents();

  const searchInput = document.getElementById("searchInput");
  const prevBtn = document.getElementById("prevPokemon");
  const nextBtn = document.getElementById("nextPokemon");
  const allTypesBtn = document.getElementById("allTypes");
  const allTypesBtnBottom = document.getElementById("allTypesBottom");
  const typeFilterContainer = document.getElementById("typeFilterContainer");
  const prevBtnBottom = document.getElementById("prevPokemonBottom");
  const nextBtnBottom = document.getElementById("nextPokemonBottom");

  searchInput.addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();
    if (!query) {
      currentOffset = 0;
      searchList = [];
      renderPokemons(currentList.slice(currentOffset, currentOffset + limit));
      return;
    }
    const baseList = isFiltered ? currentList : allPokemonNames;
    if (isFiltered) {
      searchList = baseList.filter((p) => p.name.startsWith(query));
    } else {
      const matchingNames = baseList.filter((name) => name.startsWith(query));
      searchList = await Promise.all(
        matchingNames.slice(0, 50).map((name) => fetchPokemonDetail(name))
      );
      searchList = searchList.filter((p) => p);
    }
    currentOffset = 0;
    if (searchList.length > 0) {
      renderPokemons(searchList.slice(currentOffset, currentOffset + limit));
    } else {
      document.getElementById("pokedex").innerHTML =
        "<p>Pokémon não encontrado.</p>";
    }
  });

  async function showTypesList() {
    if (typeFilterContainer.style.display === "flex") {
      typeFilterContainer.style.display = "none";
      return;
    }
    typeFilterContainer.innerHTML = "";
    typeFilterContainer.style.display = "flex";
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Todos os Pokémons";
    resetBtn.classList.add("type-btn");
    resetBtn.addEventListener("click", async () => {
      currentOffset = 0;
      searchList = [];
      isFiltered = false;
      await loadPokemons(currentOffset); 
      typeFilterContainer.style.display = "none";
    });

    typeFilterContainer.appendChild(resetBtn);

    try {
      const res = await fetch(`${API_URL}/type`);
      const data = await res.json();
      data.results.forEach((t) => {
        const btn = document.createElement("button");
        btn.textContent = t.name;
        btn.classList.add("type-btn");
        btn.addEventListener("click", async () => {
          try {
            const resType = await fetch(`${API_URL}/type/${t.name}`);
            const dataType = await resType.json();
            const pokesOfType = await Promise.all(
              dataType.pokemon.map((p) => fetchPokemonDetail(p.pokemon.name))
            );
            currentList = pokesOfType.filter((p) => p);
            isFiltered = true;
            searchList = [];
            currentOffset = 0;
            renderPokemons(
              currentList.slice(currentOffset, currentOffset + limit)
            );
            typeFilterContainer.style.display = "none";
          } catch {
            document.getElementById("pokedex").innerHTML =
              "<p>Erro ao carregar pokémons do tipo selecionado.</p>";
          }
        });
        typeFilterContainer.appendChild(btn);
      });
    } catch {
      typeFilterContainer.innerHTML = "<p>Erro ao carregar tipos.</p>";
    }
  }

  document.addEventListener("click", (e) => {
    if (
      !typeFilterContainer.contains(e.target) &&
      e.target !== allTypesBtn &&
      e.target !== allTypesBtnBottom
    ) {
      typeFilterContainer.style.display = "none";
    }
  });

  async function paginate(delta) {
    const listToPaginate = searchList.length > 0 ? searchList : currentList;
    currentOffset += delta * limit;

    if (currentOffset < 0) currentOffset = 0;

    if (
      currentOffset >= listToPaginate.length &&
      !isFiltered &&
      searchList.length === 0
    ) {
      await loadPokemons(currentOffset);
    } else {
      renderPokemons(
        listToPaginate.slice(currentOffset, currentOffset + limit)
      );
    }
  }

  if (allTypesBtn) allTypesBtn.addEventListener("click", showTypesList);
  if (allTypesBtnBottom)
    allTypesBtnBottom.addEventListener("click", showTypesList);

  if (prevBtn) prevBtn.addEventListener("click", () => paginate(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => paginate(1));
  if (prevBtnBottom && nextBtnBottom) {
    prevBtnBottom.addEventListener("click", () => paginate(-1));
    nextBtnBottom.addEventListener("click", () => paginate(1));
  }
}

init();
