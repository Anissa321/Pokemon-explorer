'use strict';
import './style.css';

const app = document.querySelector('#app');

const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=24';

const STORAGE_KEYS = {
  favorites: 'pokemonFavorites',
  search: 'pokemonSearch',
  sort: 'pokemonSort',
  type: 'pokemonType',
  view: 'pokemonView'
};

let allPokemon = [];
let filteredPokemon = [];
let favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites)) || [];
let selectedType = localStorage.getItem(STORAGE_KEYS.type) || 'all';
let currentSort = localStorage.getItem(STORAGE_KEYS.sort) || 'id-asc';
let currentView = localStorage.getItem(STORAGE_KEYS.view) || 'cards';
let currentSearch = localStorage.getItem(STORAGE_KEYS.search) || '';
let pokemonTypes = ['all'];
let shinyPokemonIds = [];

function renderLoadingScreen() {
  app.innerHTML = `
    <div class="loading-screen">
      <div class="loading-pokeball">
        <div class="loading-top"></div>
        <div class="loading-middle"></div>
        <div class="loading-bottom"></div>
        <div class="loading-center"></div>
      </div>
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

    pokemonTypes = [
      'all',
      ...new Set(
        allPokemon.flatMap((pokemon) =>
          pokemon.types.map((item) => item.type.name)
        )
      )
    ];

    renderLayout();
    updateFilters();
    addEventListeners();
  } catch (error) {
    app.innerHTML = `<p class="error-message">Er ging iets mis bij het ophalen van de Pokémon.</p>`;
    console.error(error);
  }
}

function savePreferences() {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  localStorage.setItem(STORAGE_KEYS.search, currentSearch);
  localStorage.setItem(STORAGE_KEYS.sort, currentSort);
  localStorage.setItem(STORAGE_KEYS.type, selectedType);
  localStorage.setItem(STORAGE_KEYS.view, currentView);
}

function renderLayout() {
  app.innerHTML = `
    <div class="page-shell">
      <header class="hero">
        <div class="pokeball-logo" aria-hidden="true">
          <div class="pokeball-top"></div>
          <div class="pokeball-center"></div>
          <div class="pokeball-bottom"></div>
        </div>

        <h1>Pokemon Explorer</h1>
        <p>Zoek, filter, sorteer en bewaar je favoriete Pokémon.</p>
      </header>

      <section class="toolbar">
        <div class="search-form">
          <div class="pokeball-field">
            <input
              type="text"
              id="search"
              placeholder="Zoek een Pokémon..."
              value="${currentSearch}"
            />
          </div>
        </div>

        <div class="pokeball-field">
          <select id="sortBy">
            <option value="id-asc" ${currentSort === 'id-asc' ? 'selected' : ''}>ID oplopend</option>
            <option value="id-desc" ${currentSort === 'id-desc' ? 'selected' : ''}>ID aflopend</option>
            <option value="name-asc" ${currentSort === 'name-asc' ? 'selected' : ''}>Naam A-Z</option>
            <option value="name-desc" ${currentSort === 'name-desc' ? 'selected' : ''}>Naam Z-A</option>
            <option value="weight-asc" ${currentSort === 'weight-asc' ? 'selected' : ''}>Gewicht laag-hoog</option>
            <option value="weight-desc" ${currentSort === 'weight-desc' ? 'selected' : ''}>Gewicht hoog-laag</option>
            <option value="height-asc" ${currentSort === 'height-asc' ? 'selected' : ''}>Hoogte laag-hoog</option>
            <option value="height-desc" ${currentSort === 'height-desc' ? 'selected' : ''}>Hoogte hoog-laag</option>
          </select>
        </div>

        <button id="showFavorites" class="pokeball-button" type="button">
          <span>Favorieten</span>
        </button>

        <button id="showAll" class="pokeball-button" type="button">
          <span>Reset</span>
        </button>
      </section>

      <p id="formMessage" class="form-message"></p>

      <section class="type-filter-section">
        <h3 class="type-filter-title">Filter op type</h3>
        <div class="type-filter-grid">
          ${pokemonTypes
            .map(
              (type) => `
                <button
                  class="type-filter-btn ${type === 'all' ? 'type-pill-all' : `type-pill-${type}`}"
                  data-type="${type}"
                  type="button"
                >
                  <span class="type-icon">${getTypeIcon(type)}</span>
                  ${type}
                </button>
              `
            )
            .join('')}
        </div>
      </section>

      <section class="view-toggle">
        <button class="view-btn ${currentView === 'cards' ? 'active-view' : ''}" data-view="cards" type="button">Cards</button>
        <button class="view-btn ${currentView === 'table' ? 'active-view' : ''}" data-view="table" type="button">Tabel</button>
      </section>

      <p class="result-text" id="resultText"></p>

      <section id="contentArea"></section>
    </div>

    <div class="modal hidden" id="pokemonModal">
      <div class="modal-card">
        <button class="close-modal" id="closeModal" type="button">✕</button>
        <div id="modalContent"></div>
      </div>
    </div>
  `;
}

function getTypeClass(pokemon) {
  return `type-${pokemon.types[0].type.name}`;
}

function getTypeIcon(type) {
  const icons = {
    all: '⭐',
    normal: '⚪',
    fire: '🔥',
    water: '💧',
    grass: '🌿',
    poison: '☠️',
    flying: '🕊️',
    bug: '🐛',
  };

  return icons[type] || '⭐';
}

function getPokemonImage(pokemon) {
  const isShiny = shinyPokemonIds.includes(pokemon.id);
  const officialArtwork = isShiny
    ? pokemon.sprites.other['official-artwork'].front_shiny
    : pokemon.sprites.other['official-artwork'].front_default;

  const fallback = isShiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default;

  return officialArtwork || fallback;
}

function renderPokemon(pokemonList) {
  const contentArea = document.querySelector('#contentArea');
  const resultText = document.querySelector('#resultText');

  resultText.textContent = `${pokemonList.length} Pokémon gevonden`;

  if (pokemonList.length === 0) {
    contentArea.innerHTML = `<p class="empty-state">Geen Pokémon gevonden.</p>`;
    return;
  }

  if (currentView === 'cards') {
    contentArea.innerHTML = `
      <section class="pokemon-container">
        ${pokemonList
          .map((pokemon) => {
            const isFavorite = favorites.includes(pokemon.id);
            const pokemonTypesText = pokemon.types.map((item) => item.type.name).join(', ');
            const isShiny = shinyPokemonIds.includes(pokemon.id);

            return `
              <article class="card reveal-item ${getTypeClass(pokemon)} ${isShiny ? 'shiny-card' : ''}" data-id="${pokemon.id}">
                <button class="favorite-button" data-id="${pokemon.id}" type="button">
                  ${isFavorite ? '❤️' : '🤍'}
                </button>

                ${isShiny ? '<div class="shiny-badge">✨ Shiny</div>' : ''}

                <div class="card-glow"></div>

                <div class="image-wrap">
                  <img
                    src="${getPokemonImage(pokemon)}"
                    alt="${pokemon.name}"
                    class="pokemon-main-image"
                    data-id="${pokemon.id}"
                  />
                </div>

                <div class="card-content">
                  <span class="pokemon-number">#${pokemon.id}</span>
                  <h2>${capitalize(pokemon.name)}</h2>
                  <p class="type-line">${pokemonTypesText}</p>

                  <div class="type-tags">
                    ${pokemon.types
                      .map(
                        (item) => `
                          <span class="mini-type-pill type-pill-${item.type.name}">
                            <span class="type-icon">${getTypeIcon(item.type.name)}</span>
                            ${item.type.name}
                          </span>
                        `
                      )
                      .join('')}
                  </div>

                  <button class="details-button" data-id="${pokemon.id}" type="button">Open kaart</button>
                </div>
              </article>
            `;
          })
          .join('')}
      </section>
    `;
  } else {
    contentArea.innerHTML = `
      <div class="table-wrapper reveal-item">
        <table class="pokemon-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Naam</th>
              <th>Type(s)</th>
              <th>Height</th>
              <th>Weight</th>
              <th>Base Exp</th>
              <th>Favoriet</th>
            </tr>
          </thead>
          <tbody>
            ${pokemonList
              .map((pokemon) => {
                const isFavorite = favorites.includes(pokemon.id);
                return `
                  <tr class="pokemon-row" data-id="${pokemon.id}">
                    <td>#${pokemon.id}</td>
                    <td>${capitalize(pokemon.name)}</td>
                    <td>${pokemon.types.map((item) => item.type.name).join(', ')}</td>
                    <td>${pokemon.height}</td>
                    <td>${pokemon.weight}</td>
                    <td>${pokemon.base_experience}</td>
                    <td>
                      <button class="table-favorite-btn" data-id="${pokemon.id}" type="button">
                        ${isFavorite ? '❤️' : '🤍'}
                      </button>
                    </td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  updateActiveTypeButton();
  updateActiveViewButton();
  setupObserver();
}

function addEventListeners() {
  const searchInput = document.querySelector('#search');
  const sortBy = document.querySelector('#sortBy');
  const showFavorites = document.querySelector('#showFavorites');
  const showAll = document.querySelector('#showAll');
  const closeModal = document.querySelector('#closeModal');
  const modal = document.querySelector('#pokemonModal');
  const typeButtons = document.querySelectorAll('.type-filter-btn');
  const viewButtons = document.querySelectorAll('.view-btn');

  searchInput.addEventListener('input', () => {
    currentSearch = searchInput.value.trim();

    if (currentSearch !== '' && currentSearch.length < 2) {
      showFormMessage('Typ minstens 2 letters om te zoeken.', true);
    } else {
      showFormMessage('');
    }

    savePreferences();
    updateFilters();
  });

  sortBy.addEventListener('change', () => {
    currentSort = sortBy.value;
    savePreferences();
    updateFilters();
  });

  typeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedType = button.dataset.type;
      savePreferences();
      updateFilters();
    });
  });

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      currentView = button.dataset.view;
      savePreferences();
      renderPokemon(filteredPokemon);
      bindDynamicContentEvents();
    });
  });

  showFavorites.addEventListener('click', () => {
    filteredPokemon = allPokemon.filter((pokemon) => favorites.includes(pokemon.id));
    applyCurrentSort();
    renderPokemon(filteredPokemon);
    bindDynamicContentEvents();
  });

  showAll.addEventListener('click', () => {
    currentSearch = '';
    selectedType = 'all';
    currentSort = 'id-asc';
    currentView = 'cards';

    document.querySelector('#search').value = '';
    document.querySelector('#sortBy').value = 'id-asc';

    savePreferences();
    updateFilters();
    bindDynamicContentEvents();
  });

  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.classList.add('hidden');
    }
  });

  bindDynamicContentEvents();
}

function bindDynamicContentEvents() {
  const contentArea = document.querySelector('#contentArea');

  contentArea.onclick = handleDynamicClick;
  contentArea.ondblclick = handleDynamicDoubleClick;
}

function handleDynamicClick(event) {
  const favoriteButton = event.target.closest('.favorite-button');
  const tableFavoriteButton = event.target.closest('.table-favorite-btn');
  const detailsButton = event.target.closest('.details-button');
  const clickedCard = event.target.closest('.card');
  const clickedRow = event.target.closest('.pokemon-row');

  if (favoriteButton) {
    const pokemonId = Number(favoriteButton.dataset.id);
    toggleFavorite(pokemonId);
    renderPokemon(filteredPokemon);
    return;
  }

  if (tableFavoriteButton) {
    const pokemonId = Number(tableFavoriteButton.dataset.id);
    toggleFavorite(pokemonId);
    renderPokemon(filteredPokemon);
    return;
  }

  if (detailsButton) {
    const pokemonId = Number(detailsButton.dataset.id);
    openModal(pokemonId);
    return;
  }

  if (clickedCard) {
    const pokemonId = Number(clickedCard.dataset.id);
    openModal(pokemonId);
    return;
  }

  if (clickedRow) {
    const pokemonId = Number(clickedRow.dataset.id);
    openModal(pokemonId);
  }
}

function handleDynamicDoubleClick(event) {
  const clickedCard = event.target.closest('.card');
  const clickedRow = event.target.closest('.pokemon-row');
  const clickedImage = event.target.closest('.pokemon-main-image');
  const clickedModalImage = event.target.closest('.modal-image');

  if (clickedImage) {
    const pokemonId = Number(clickedImage.dataset.id);
    toggleShiny(pokemonId);
    renderPokemon(filteredPokemon);
    return;
  }

  if (clickedModalImage) {
    const pokemonId = Number(clickedModalImage.dataset.id);
    toggleShiny(pokemonId);
    openModal(pokemonId);
    return;
  }

  if (clickedCard) {
    openModal(Number(clickedCard.dataset.id));
  }

  if (clickedRow) {
    openModal(Number(clickedRow.dataset.id));
  }
}

function toggleShiny(pokemonId) {
  if (shinyPokemonIds.includes(pokemonId)) {
    shinyPokemonIds = shinyPokemonIds.filter((id) => id !== pokemonId);
  } else {
    shinyPokemonIds.push(pokemonId);
  }
}

function setupObserver() {
  const items = document.querySelectorAll('.reveal-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.15
  });

  items.forEach((item) => observer.observe(item));
}

function updateActiveTypeButton() {
  const buttons = document.querySelectorAll('.type-filter-btn');

  buttons.forEach((button) => {
    button.classList.toggle('active-type', button.dataset.type === selectedType);
  });
}

function updateActiveViewButton() {
  const buttons = document.querySelectorAll('.view-btn');

  buttons.forEach((button) => {
    button.classList.toggle('active-view', button.dataset.view === currentView);
  });
}

function showFormMessage(message, isError = false) {
  const formMessage = document.querySelector('#formMessage');
  formMessage.textContent = message;
  formMessage.classList.toggle('error-text', isError);
}

function updateFilters() {
  filteredPokemon = allPokemon.filter((pokemon) => {
    const matchesName = pokemon.name.toLowerCase().includes(currentSearch.toLowerCase());
    const matchesType =
      selectedType === 'all' || pokemon.types.some((item) => item.type.name === selectedType);

    return matchesName && matchesType;
  });

  applyCurrentSort();
  renderPokemon(filteredPokemon);
}

function applyCurrentSort() {
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
      case 'height-asc':
        return a.height - b.height;
      case 'height-desc':
        return b.height - a.height;
      default:
        return a.id - b.id;
    }
  });
}

function toggleFavorite(pokemonId) {
  if (favorites.includes(pokemonId)) {
    favorites = favorites.filter((id) => id !== pokemonId);
  } else {
    favorites.push(pokemonId);
  }

  savePreferences();
}

function getStatWidth(value) {
  return Math.min((value / 150) * 100, 100);
}

function openModal(pokemonId) {
  const modal = document.querySelector('#pokemonModal');
  const modalContent = document.querySelector('#modalContent');
  const pokemon = allPokemon.find((item) => item.id === pokemonId);
  const isShiny = shinyPokemonIds.includes(pokemon.id);

  const types = pokemon.types
    .map(
      (item) => `
        <span class="type-pill type-pill-${item.type.name}">
          <span class="type-icon">${getTypeIcon(item.type.name)}</span>
          ${item.type.name}
        </span>
      `
    )
    .join('');

  const abilities = pokemon.abilities
    .map(
      (item) => `
        <span class="ability-pill">
          ${capitalize(item.ability.name)}
        </span>
      `
    )
    .join('');

  const stats = pokemon.stats
    .map(
      (item) => `
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-name">${capitalize(item.stat.name)}</span>
            <span class="stat-value">${item.base_stat}</span>
          </div>
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${getStatWidth(item.base_stat)}%"></div>
          </div>
        </div>
      `
    )
    .join('');

  modalContent.innerHTML = `
    <div class="modal-layout">
      <div class="pokemon-card-large ${getTypeClass(pokemon)} ${isShiny ? 'shiny-card' : ''}">
        <div class="pokemon-card-top">
          <span class="card-rarity">Pokémon Card</span>
          <span class="card-hp">HP ${pokemon.stats[0].base_stat}</span>
        </div>

        ${isShiny ? '<div class="shiny-badge modal-shiny">✨ Shiny</div>' : ''}

        <div class="modal-image-box">
          <img
            src="${getPokemonImage(pokemon)}"
            alt="${pokemon.name}"
            class="modal-image"
            data-id="${pokemon.id}"
          />
        </div>

        <div class="pokemon-card-body">
          <span class="pokemon-number">#${pokemon.id}</span>
          <h2>${capitalize(pokemon.name)}</h2>

          <div class="type-pills">${types}</div>

          <div class="abilities-wrap">
            <h3 class="section-title">Abilities</h3>
            <div class="abilities-list">${abilities}</div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <span class="info-label">Height</span>
              <strong>${pokemon.height}</strong>
            </div>
            <div class="info-box">
              <span class="info-label">Weight</span>
              <strong>${pokemon.weight}</strong>
            </div>
            <div class="info-box">
              <span class="info-label">Base Exp</span>
              <strong>${pokemon.base_experience}</strong>
            </div>
            <div class="info-box">
              <span class="info-label">Types</span>
              <strong>${pokemon.types.length}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-info-panel ${getTypeClass(pokemon)}">
        <span class="pokemon-number">#${pokemon.id}</span>
        <h3 class="section-title">Stats</h3>
        <div class="stats-grid">${stats}</div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

fetchPokemonList();


