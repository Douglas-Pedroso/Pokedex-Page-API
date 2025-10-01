const API_URL = "https://pokeapi.co/api/v2";

async function fetchPokemons(limit = 20, offset = 0) {
  const res = await fetch(`${API_URL}/pokemon?limit=${limit}&offset=${offset}`);
  return res.json();
}

async function fetchPokemonDetail(nameOrId) {
  const res = await fetch(`${API_URL}/pokemon/${nameOrId}`);
  return res.json();
}
