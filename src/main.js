'use strict';
import './style.css';

const app = document.querySelector('#app');

const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=24';
const FAVORITES_KEY = 'pokemonFavorites';

let allPokemon = [];
let filteredPokemon = [];
let currentSearch = '';
let selectedType = 'all';
let pokemonTypes = ['all'];
let currentSort = 'id-asc';
let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

function renderLoadingScreen() {
  app.innerHTML = `<div class="loading-screen"><h2>Pokémon worden geladen...</h2><p>Even geduld, je Pokédex wordt gevuld.</p></div>`;
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
      ...new Set(allPokemon.flatMap((pokemon) => pokemon.types.map((item) => item.type.name)))
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

        <button id="showFavorites" type="button">Favorieten</button>
        <button id="showAll" type="button">Reset</button>
      </header>

      <div id="typeFilters">
        ${pokemonTypes.map(type => `<button class="type-btn" data-type="${type}">${type}</button>`).join('')}
      </div>

      <section id="contentArea"></section>
    </div>

    <div class="modal hidden" id="pokemonModal">
      <div class="modal-card">
        <button id="closeModal" type="button">✕</button>
        <div id="modalContent"></div>
      </div>
    </div>
  `;
}

function renderPokemon(pokemonList) {
  const contentArea = document.querySelector('#contentArea');

  if (pokemonList.length === 0) {
    contentArea.innerHTML = `<p>Geen Pokémon gevonden.</p>`;
    return;
  }

  contentArea.innerHTML = `
    <div class="pokemon-container">
      ${pokemonList.map(pokemon => {
        const isFavorite = favorites.includes(pokemon.id);

        return `
          <div class="card" data-id="${pokemon.id}">
            <button class="favorite-button" data-id="${pokemon.id}" type="button">
              ${isFavorite ? '❤️' : '🤍'}
            </button>

            <h2>${capitalize(pokemon.name)}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />

            <button class="details-button" data-id="${pokemon.id}" type="button">
              Open kaart
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;

  bindCardButtons();
}

function bindCardButtons() {
  const favoriteButtons = document.querySelectorAll('.favorite-button');
  const detailButtons = document.querySelectorAll('.details-button');

  favoriteButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const pokemonId = Number(button.dataset.id);
      toggleFavorite(pokemonId);
    });
  });

  detailButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const pokemonId = Number(button.dataset.id);
      openModal(pokemonId);
    });
  });
}

function openModal(pokemonId) {
  const modal = document.querySelector('#pokemonModal');
  const modalContent = document.querySelector('#modalContent');
  const pokemon = allPokemon.find(item => item.id === pokemonId);

  modalContent.innerHTML = `
    <h2>${capitalize(pokemon.name)}</h2>
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
    <p><strong>ID:</strong> #${pokemon.id}</p>
    <p><strong>Type:</strong> ${pokemon.types.map(item => item.type.name).join(', ')}</p>
    <p><strong>Height:</strong> ${pokemon.height}</p>
    <p><strong>Weight:</strong> ${pokemon.weight}</p>
    <p><strong>Base experience:</strong> ${pokemon.base_experience}</p>
    <p><strong>Abilities:</strong> ${pokemon.abilities.map(item => capitalize(item.ability.name)).join(', ')}</p>
  `;

  modal.classList.remove('hidden');
}

function toggleFavorite(pokemonId) {
  if (favorites.includes(pokemonId)) {
    favorites = favorites.filter(id => id !== pokemonId);
  } else {
    favorites.push(pokemonId);
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  renderPokemon(filteredPokemon);
}

function addEventListeners() {
  const searchInput = document.querySelector('#search');
  const typeButtons = document.querySelectorAll('.type-btn');
  const sortBy = document.querySelector('#sortBy');
  const showFavorites = document.querySelector('#showFavorites');
  const showAll = document.querySelector('#showAll');
  const modal = document.querySelector('#pokemonModal');
  const closeModal = document.querySelector('#closeModal');

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

  showFavorites.addEventListener('click', () => {
    filteredPokemon = allPokemon.filter(pokemon => favorites.includes(pokemon.id));
    applySort();
    renderPokemon(filteredPokemon);
  });

  showAll.addEventListener('click', () => {
    currentSearch = '';
    selectedType = 'all';
    currentSort = 'id-asc';

    searchInput.value = '';
    sortBy.value = 'id-asc';

    updateFilters();
  });

  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.classList.add('hidden');
    }
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

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

fetchPokemonList();
