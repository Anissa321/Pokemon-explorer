'use strict';
import './style.css';

const app = document.querySelector('#app');

const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=24';

let allPokemon = [];
let filteredPokemon = [];
let currentSearch = '';
let selectedType = 'all';
let pokemonTypes = ['all'];
let currentSort = 'id-asc';

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
    updateFilters();

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

        <select id="sortBy">
          <option value="id-asc">ID oplopend</option>
          <option value="id-desc">ID aflopend</option>
          <option value="name-asc">Naam A-Z</option>
          <option value="name-desc">Naam Z-A</option>
          <option value="weight-asc">Gewicht laag-hoog</option>
          <option value="weight-desc">Gewicht hoog-laag</option>
        </select>
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
  const sortBy = document.querySelector('#sortBy');

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

  sortBy.addEventListener('change', () => {
    currentSort = sortBy.value;
    updateFilters();
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

  applySort();
  renderPokemon(filteredPokemon);
}

function applySort() {
  filteredPokemon.sort((a, b) => {
    switch (currentSort) {
      case 'id-desc':
        return b.id - a.id;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'weight-asc':
        return a.weight - b.weight;
      case 'weight-desc':
        return b.weight - a.weight;
      default:
        return a.id - b.id;
    }
  });
}

fetchPokemonList();
