'use strict';
import './style.css';

const app = document.querySelector('#app');

const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=24';

let allPokemon = [];
let filteredPokemon = [];
let currentSearch = '';
let selectedType = 'all';
let pokemonTypes = ['all'];

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
    filteredPokemon = allPokemon;

    // TYPES ophalen
    pokemonTypes = [
      'all',
      ...new Set(
        allPokemon.flatMap((pokemon) =>
          pokemon.types.map((item) => item.type.name)
        )
      )
    ];

    renderLayout();
    addEventListeners();
    renderPokemon(filteredPokemon);

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
        <input type="text" id="search" placeholder="Zoek een Pokémon..." />
        <p id="formMessage"></p>
      </header>

      <div id="typeFilters">
        ${pokemonTypes.map(type => `
          <button class="type-btn" data-type="${type}">
            ${type}
          </button>
        `).join('')}
      </div>

      <section id="contentArea"></section>
    </div>
  `;
}

function renderPokemon(pokemonList) {
  const contentArea = document.querySelector('#contentArea');

  contentArea.innerHTML = `
    <div class="pokemon-container">
      ${pokemonList.map(pokemon => `
        <div class="card">
          <h2>${pokemon.name}</h2>
          <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
        </div>
      `).join('')}
    </div>
  `;
}

function addEventListeners() {
  const searchInput = document.querySelector('#search');
  const typeButtons = document.querySelectorAll('.type-btn');

  searchInput.addEventListener('input', () => {
    currentSearch = searchInput.value.trim();

    if (currentSearch !== '' && currentSearch.length < 2) {
      showFormMessage('Typ minstens 2 letters om te zoeken.');
      return;
    }

    showFormMessage('');
    updateFilters();
  });

  typeButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedType = button.dataset.type;
      updateFilters();
    });
  });
}

function showFormMessage(message) {
  const formMessage = document.querySelector('#formMessage');
  formMessage.textContent = message;
}

function updateFilters() {
  filteredPokemon = allPokemon.filter((pokemon) => {
    const matchesName = pokemon.name.toLowerCase().includes(currentSearch.toLowerCase());

    const matchesType =
      selectedType === 'all' ||
      pokemon.types.some(item => item.type.name === selectedType);

    return matchesName && matchesType;
  });

  renderPokemon(filteredPokemon);
}

fetchPokemonList();
