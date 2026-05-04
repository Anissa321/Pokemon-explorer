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
let shinyPokemonIds = [];

function renderLoadingScreen() {
  app.innerHTML = `
    <div class="loading-screen">
      <h2>Pokémon worden geladen...</h2>
      <p>Even geduld, je Pokédex wordt gevuld.</p>
    </div>
  `;
}

function getTypeIcon(type) {
  switch (type) {
    case 'all': return '🔍';
    case 'grass': return '🌿';
    case 'poison': return '☠️';
    case 'fire': return '🔥';
    case 'flying': return '🕊️';
    case 'water': return '💧';
    case 'bug': return '🐛';
    case 'normal': return '⚪';
    default: return '🔘';
  }
}

function getPokemonImage(pokemon) {
  const isShiny = shinyPokemonIds.includes(pokemon.id);

  const official = isShiny
    ? pokemon.sprites.other['official-artwork'].front_shiny
    : pokemon.sprites.other['official-artwork'].front_default;

  const fallback = isShiny
    ? pokemon.sprites.front_shiny
    : pokemon.sprites.front_default;

  return official || fallback;
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
    app.innerHTML = `<p>Fout bij laden</p>`;
    console.error(error);
  }
}

function renderLayout() {
  app.innerHTML = `
    <div class="page">
      <header>
        <h1>Pokemon Explorer</h1>
        <div class="pokeball"></div>

        <div class="controls">
          <input id="search" placeholder="Zoek..." />

          <select id="sortBy">
            <option value="id-asc">ID ↑</option>
            <option value="id-desc">ID ↓</option>
            <option value="name-asc">Naam A-Z</option>
            <option value="name-desc">Naam Z-A</option>
          </select>

          <button id="showFavorites"><span>Favorieten</span></button>
          <button id="showAll"><span>Reset</span></button>

          <button class="view-btn" data-view="cards"><span>Cards</span></button>
          <button class="view-btn" data-view="table"><span>Tabel</span></button>
        </div>
      </header>

      <div id="typeFilters">
        ${pokemonTypes.map(type => `
          <button class="type-btn" data-type="${type}">
            <span>${getTypeIcon(type)}</span>
            <span>${type}</span>
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

  if (list.length === 0) {
    content.innerHTML = `<p class="empty-state">Geen Pokémon gevonden.</p>`;
    return;
  }

  if (currentView === 'cards') {
    content.innerHTML = `
      <div class="pokemon-container">
        ${list.map(p => {
          const isShiny = shinyPokemonIds.includes(p.id);

          return `
            <div class="card type-${p.types[0].type.name}">
              <button class="favorite-button" data-id="${p.id}">
                <span>${favorites.includes(p.id) ? '❤️' : '🤍'}</span>
              </button>

              ${isShiny ? '<div class="shiny-badge">✨ Shiny</div>' : ''}

              <h2>${capitalize(p.name)}</h2>

              <img 
                src="${getPokemonImage(p)}" 
                alt="${p.name}" 
                data-id="${p.id}"
                class="pokemon-image"
              />

              <button class="details-button" data-id="${p.id}">
                Open kaart
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else {
    content.innerHTML = `
      <div class="table-wrapper">
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
                    <span>${favorites.includes(p.id) ? '❤️' : '🤍'}</span>
                  </button>
                </td>

                <td>
                  <button class="details-button table-details" data-id="${p.id}">
                    Open
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  bindButtons();
}

function bindButtons() {
  document.querySelectorAll('.favorite-button, .table-favorite-button').forEach(btn => {
    btn.onclick = (event) => {
      event.stopPropagation();
      toggleFavorite(Number(btn.dataset.id));
    };
  });

  document.querySelectorAll('.details-button').forEach(btn => {
    btn.onclick = (event) => {
      event.stopPropagation();
      openModal(Number(btn.dataset.id));
    };
  });

  document.querySelectorAll('.pokemon-image').forEach(img => {
    img.ondblclick = () => {
      toggleShiny(Number(img.dataset.id));
      renderPokemon(filteredPokemon);
    };
  });
}

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(favoriteId => favoriteId !== id);
  } else {
    favorites.push(id);
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  renderPokemon(filteredPokemon);
}

function toggleShiny(id) {
  if (shinyPokemonIds.includes(id)) {
    shinyPokemonIds = shinyPokemonIds.filter(shinyId => shinyId !== id);
  } else {
    shinyPokemonIds.push(id);
  }
}

function openModal(id) {
  const p = allPokemon.find(pokemon => pokemon.id === id);
  const modal = document.querySelector('#pokemonModal');
  const content = document.querySelector('#modalContent');
  const isFavorite = favorites.includes(p.id);
  const isShiny = shinyPokemonIds.includes(p.id);

  content.innerHTML = `
    <button class="modal-favorite" data-id="${p.id}">
      <span>${isFavorite ? '❤️' : '🤍'}</span>
    </button>

    <div class="modal-layout">
      <div class="modal-left type-${p.types[0].type.name}">
        ${isShiny ? '<div class="modal-shiny-badge">✨ Shiny</div>' : ''}

        <h2>${capitalize(p.name)}</h2>

        <img 
          src="${getPokemonImage(p)}" 
          alt="${p.name}" 
          class="modal-pokemon-image"
          data-id="${p.id}"
        />

        <div class="type-tags">
          ${p.types.map(t => `
            <span class="type-pill type-${t.type.name}">
              ${getTypeIcon(t.type.name)} ${t.type.name}
            </span>
          `).join('')}
        </div>
      </div>

      <div class="modal-right">
        <p><strong>ID:</strong> #${p.id}</p>
        <p><strong>Height:</strong> ${p.height}</p>
        <p><strong>Weight:</strong> ${p.weight}</p>
        <p><strong>Base experience:</strong> ${p.base_experience}</p>

        <h3>Stats</h3>

        <div class="stats">
          ${p.stats.map(stat => `
            <div class="stat">
              <div class="stat-label">
                <span>${stat.stat.name}</span>
                <strong>${stat.base_stat}</strong>
              </div>
              <div class="bar">
                <div class="fill" style="width: ${Math.min(stat.base_stat, 100)}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');

  document.querySelector('.modal-favorite').onclick = () => {
    toggleFavorite(p.id);
    openModal(p.id);
  };

  document.querySelector('.modal-pokemon-image').ondblclick = () => {
    toggleShiny(p.id);
    openModal(p.id);
    renderPokemon(filteredPokemon);
  };
}

function addEventListeners() {
  document.querySelector('#search').oninput = (event) => {
    currentSearch = event.target.value.trim().toLowerCase();
    updateFilters();
  };

  document.querySelector('#sortBy').onchange = (event) => {
    currentSort = event.target.value;
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
    applySort();
    renderPokemon(filteredPokemon);
  };

  document.querySelector('#showAll').onclick = () => {
    currentSearch = '';
    selectedType = 'all';
    currentSort = 'id-asc';

    document.querySelector('#search').value = '';
    document.querySelector('#sortBy').value = 'id-asc';

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

  document.querySelector('#pokemonModal').onclick = (event) => {
    if (event.target.id === 'pokemonModal') {
      event.target.classList.add('hidden');
    }
  };
}

function updateFilters() {
  filteredPokemon = allPokemon.filter(p => {
    const matchName = p.name.toLowerCase().includes(currentSearch);
    const matchType =
      selectedType === 'all' ||
      p.types.some(t => t.type.name === selectedType);

    return matchName && matchType;
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
      default:
        return a.id - b.id;
    }
  });
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

fetchPokemonList();