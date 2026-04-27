'use strict';
import './style.css';

const app = document.querySelector('#app');

const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=24';

let allPokemon = [];

function renderLoadingScreen() {
  app.innerHTML = `
    <div class="loading-screen">
      <h2>Pokémon worden geladen...</h2>
      <p>Even geduld, je Pokédex wordt gevuld.</p>
    </div>
  `;
}

async function fetchPokemonList() {
  try {
    renderLoadingScreen();

    const response = await fetch(API_URL);
    const data = await response.json();

    const pokemonDetails = await Promise.all(
      data.results.map(async (pokemon) => {
        const detailResponse = await fetch(pokemon.url);
        return await detailResponse.json();
      })
    );

    allPokemon = pokemonDetails;

    renderLayout();
    renderPokemon();

    console.log(allPokemon);
  } catch (error) {
    app.innerHTML = `<p>Fout bij laden van Pokémon</p>`;
    console.error(error);
  }
}

function renderLayout() {
  app.innerHTML = `
    <div class="page">
      <header>
        <h1>Pokemon Explorer</h1>
      </header>

      <section id="contentArea"></section>
    </div>
  `;
}

function renderPokemon() {
  const contentArea = document.querySelector('#contentArea');

  contentArea.innerHTML = `
    <div class="pokemon-container">
      ${allPokemon.map(pokemon => `
        <div class="card">
          <h2>${pokemon.name}</h2>
          <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
        </div>
      `).join('')}
    </div>
  `;
}

fetchPokemonList();
