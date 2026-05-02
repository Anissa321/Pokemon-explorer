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
let currentView = 'cards';
let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

function renderLoadingScreen() {
  app.innerHTML = `<div class="loading-screen"><h2>Pokémon worden geladen...</h2></div>`;
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
      ...new Set(allPokemon.flatMap(p =>
        p.types.map(t => t.type.name)
      ))
    ];

    renderLayout();
    addEventListeners();
    updateFilters();

  } catch (error) {
    app.innerHTML = `<p>Fout bij laden</p>`;
    console.error(error);
  }
}

function renderLayout() {
  app.innerHTML = `
    <div class="page">
      <header>
        <h1>Pokemon Explorer</h1>

        <input id="search" placeholder="Zoek..." />
        <select id="sortBy">
          <option value="id-asc">ID ↑</option>
          <option value="id-desc">ID ↓</option>
          <option value="name-asc">Naam A-Z</option>
          <option value="name-desc">Naam Z-A</option>
        </select>

        <button id="showFavorites">Favorieten</button>
        <button id="showAll">Reset</button>

        <button class="view-btn" data-view="cards">Cards</button>
        <button class="view-btn" data-view="table">Tabel</button>
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

    <div class="modal hidden" id="pokemonModal">
      <div class="modal-card">
        <button id="closeModal">✕</button>
        <div id="modalContent"></div>
      </div>
    </div>
  `;
}

function renderPokemon(list) {
  const content = document.querySelector('#contentArea');

  if (currentView === 'cards') {
    content.innerHTML = `
      <div class="pokemon-container">
        ${list.map(p => `
          <div class="card">
            <button class="favorite-button" data-id="${p.id}">
              ${favorites.includes(p.id) ? '❤️' : '🤍'}
            </button>

            <h2>${capitalize(p.name)}</h2>
            <img src="${p.sprites.front_default}" alt="${p.name}" />

            <button class="details-button" data-id="${p.id}">
              Open kaart
            </button>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    content.innerHTML = `
      <table class="pokemon-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Naam</th>
            <th>Type</th>
            <th>Favoriet</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(p => `
            <tr>
              <td>#${p.id}</td>
              <td>${capitalize(p.name)}</td>
              <td>${p.types.map(t => t.type.name).join(', ')}</td>

              <td>
                <button class="table-favorite-button" data-id="${p.id}">
                  ${favorites.includes(p.id) ? '❤️' : '🤍'}
                </button>
              </td>

              <td>
                <button class="details-button" data-id="${p.id}">
                  Open
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  bindButtons();
}

function bindButtons() {
  document.querySelectorAll('.favorite-button, .table-favorite-button').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      toggleFavorite(Number(btn.dataset.id));
    };
  });

  document.querySelectorAll('.details-button').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openModal(Number(btn.dataset.id));
    };
  });
}

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  renderPokemon(filteredPokemon);
}

function openModal(id) {
  const p = allPokemon.find(x => x.id === id);
  const modal = document.querySelector('#pokemonModal');
  const content = document.querySelector('#modalContent');

  content.innerHTML = `
    <h2>${capitalize(p.name)}</h2>
    <img src="${p.sprites.front_default}" alt="${p.name}" />
    <p>ID: ${p.id}</p>
    <p>Type: ${p.types.map(t => t.type.name).join(', ')}</p>
  `;

  modal.classList.remove('hidden');
}

function addEventListeners() {
  document.querySelector('#search').oninput = (e) => {
    currentSearch = e.target.value;
    updateFilters();
  };

  document.querySelector('#sortBy').onchange = (e) => {
    currentSort = e.target.value;
    updateFilters();
  };

  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.onclick = () => {
      selectedType = btn.dataset.type;
      updateFilters();
    };
  });

  document.querySelector('#showFavorites').onclick = () => {
    filteredPokemon = allPokemon.filter(p => favorites.includes(p.id));
    renderPokemon(filteredPokemon);
  };

  document.querySelector('#showAll').onclick = () => {
    currentSearch = '';
    selectedType = 'all';
    updateFilters();
  };

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.onclick = () => {
      currentView = btn.dataset.view;
      renderPokemon(filteredPokemon);
    };
  });

  document.querySelector('#closeModal').onclick = () => {
    document.querySelector('#pokemonModal').classList.add('hidden');
  };
}

function updateFilters() {
  filteredPokemon = allPokemon.filter(p => {
    const matchName = p.name.includes(currentSearch.toLowerCase());
    const matchType = selectedType === 'all' ||
      p.types.some(t => t.type.name === selectedType);
    return matchName && matchType;
  });

  applySort();
  renderPokemon(filteredPokemon);
}

function applySort() {
  filteredPokemon.sort((a, b) => {
    switch (currentSort) {
      case 'id-desc': return b.id - a.id;
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      default: return a.id - b.id;
    }
  });
}

function capitalize(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

fetchPokemonList();