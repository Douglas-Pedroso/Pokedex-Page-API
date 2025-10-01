// Lista de tipos de Pokémon
const pokemonTypes = [
  "normal", "fire", "water", "grass", "electric",
  "ice", "fighting", "poison", "ground", "flying",
  "psychic", "bug", "rock", "ghost", "dragon",
  "dark", "steel", "fairy"
];

// Função que cria o select de tipos dinamicamente
function createTypeFilter() {
  const select = document.createElement("select");
  select.id = "typeFilter";

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "Todos os tipos";
  select.appendChild(allOption);

  pokemonTypes.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = capitalize(type);
    select.appendChild(option);
  });

  return select;
}

// Função para adicionar o filtro no header
function addTypeFilterToHeader() {
  const header = document.querySelector("header");
  const controlsDiv = document.createElement("div");
  controlsDiv.classList.add("controls");

  // Botões de paginação
  const prevBtn = document.createElement("button");
  prevBtn.id = "prevPage";
  prevBtn.textContent = "« Anterior";

  const nextBtn = document.createElement("button");
  nextBtn.id = "nextPage";
  nextBtn.textContent = "Próximo »";

  // Adiciona elementos
  controlsDiv.appendChild(createTypeFilter());
  controlsDiv.appendChild(prevBtn);
  controlsDiv.appendChild(nextBtn);

  header.appendChild(controlsDiv);
}
