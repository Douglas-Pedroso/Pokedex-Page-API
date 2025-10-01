function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function createPokemonCard(pokemon) {
  const card = document.createElement("div");
  card.classList.add("card");

  const img = document.createElement("img");
  img.src = pokemon.sprites.front_default;
  img.alt = pokemon.name;

  const name = document.createElement("h3");
  name.textContent = capitalize(pokemon.name);

  const id = document.createElement("p");
  id.textContent = `#${pokemon.id}`;

  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(id);

  card.addEventListener("click", () => renderPokemonModal(pokemon));

  return card;
}

function renderPokemons(pokemons) {
  const container = document.getElementById("pokedex");
  container.innerHTML = "";
  pokemons.forEach(p => container.appendChild(createPokemonCard(p)));
}

function showLoader() {
  const container = document.getElementById("pokedex");
  container.innerHTML = "";
  for (let i = 0; i < 20; i++) {
    const skeleton = document.createElement("div");
    skeleton.classList.add("card", "skeleton");
    skeleton.innerHTML = `
      <div style="width:100px;height:100px;background:#ddd;margin:0 auto 10px;border-radius:50%;"></div>
      <div style="width:60%;height:20px;background:#ddd;margin:0 auto 5px;border-radius:5px;"></div>
      <div style="width:40%;height:15px;background:#ddd;margin:0 auto;border-radius:5px;"></div>
    `;
    container.appendChild(skeleton);
  }
}

function openPokemonModal(pokemon) {
  renderPokemonModal(pokemon);
}
