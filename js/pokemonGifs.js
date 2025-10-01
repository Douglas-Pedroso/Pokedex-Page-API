// pokemonGifs.js
// Função que retorna o link do GIF animado de um Pokémon
const pokemonGifs = (function() {
  return function(name) {
    return `http://img.pokemondb.net/sprites/black-white/anim/normal/${name.toLowerCase()}.gif`;
  };
})();
