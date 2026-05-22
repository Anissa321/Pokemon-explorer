# Pokemon Explorer

Een interactieve Pokémon webapp gemaakt met JavaScript en de PokeAPI.  
Met deze applicatie kunnen gebruikers Pokémon bekijken, zoeken, filteren, sorteren en favorieten opslaan.

---
## Live demo

Bekijk de website(https://anissa321.github.io/Pokemon-explorer/)

## GitHub Repository

https://github.com/Anissa321/Pokemon-explorer

# Over het project

Pokemon Explorer is een Single Page Application (SPA) gemaakt voor het vak Web Advanced.

De applicatie haalt gegevens op via een externe API en toont verschillende Pokémon in een moderne interface met cards en tabelweergave.

Gebruikers kunnen:
- Pokémon zoeken
- Pokémon filteren op type
- Sorteren op naam of ID
- Wisselen tussen cards en tabel
- Favorieten opslaan
- Shiny Pokémon bekijken
- Details openen in een modal

---

# Gebruikte technologieën

- HTML
- CSS
- JavaScript
- Vite
- PokeAPI

---

# API

Deze applicatie gebruikt de volgende API:

https://pokeapi.co/

---

# Functionaliteiten

## Zoekfunctie
Gebruikers kunnen Pokémon zoeken op naam.

## Filteren op type
Pokémon kunnen gefilterd worden op type:
- Grass
- Fire
- Water
- Flying
- Poison
- Bug
- Normal

## Sorteren
Sorteren is mogelijk op:
- ID oplopend
- ID aflopend
- Naam A-Z
- Naam Z-A

## Cards en tabel view
Gebruikers kunnen wisselen tussen:
- Cards view
- Tabel view

## Favorieten
Pokémon kunnen toegevoegd worden aan favorieten.  
Favorieten worden opgeslagen in localStorage.

## Detail modal
Elke Pokémon heeft een detailvenster met:
- afbeelding
- types
- stats
- hoogte
- gewicht
- base experience

## Shiny Pokémon
Door dubbel te klikken op een Pokémon afbeelding kan een shiny versie getoond worden.

## Responsive design
De website werkt op:
- desktop
- tablet
- mobiel

---

# Technische vereisten

In dit project werden volgende technieken gebruikt:

- Fetch API
- Async/Await
- Promises
- Array methods
- Event listeners
- DOM manipulatie
- LocalStorage
- CSS Grid
- Flexbox
- Responsive design
- ES Modules

---
## Implementatie technische vereisten

| Vereiste | Implementatie |
|-----------|---------------|
| Fetch API | `fetch(API_URL)` → `main.js` regel 57 |
| Async/Await | `async function fetchPokemonList()` → `main.js` regel 52 |
| Promises | `Promise.all()` ophalen Pokémon details → `main.js` regel 60 |
| DOM manipulatie | `renderLayout()` en `renderPokemon()` → `main.js` regels 84 en 129 |
| Elementen selecteren | `document.querySelector()` → `main.js` regel 4 |
| Elementen manipuleren | `innerHTML` aanpassen → `main.js` regel 20 |
| Events koppelen | `onclick`, `onchange`, `oninput`, `ondblclick` → `main.js` regels 215-388 |
| Template literals | HTML rendering met backticks `` → `main.js` regels 20-25 |
| Array methods | `map()`, `filter()`, `sort()`, `some()`, `flatMap()` → `main.js` regels 62, 69, 396, 414 |
| Arrow functions | gebruikt in `.map()`, `.forEach()` en event listeners → meerdere plaatsen |
| Ternary operator | shiny afbeelding + favoriet hartje → `main.js` regels 43-49 en 141 |
| Callback functions | gebruikt in `.map()`, `.forEach()`, `.filter()` → meerdere plaatsen |
| Observer API | `observeItems()` met `IntersectionObserver` → `main.js` regels 229-239 |
| JSON manipulatie | `response.json()` verwerken API data → `main.js` regels 58 en 64 |
| LocalStorage | `localStorage.getItem()` + `localStorage.setItem()` → regels 16 en 248 |
| CSS Grid | `.pokemon-container` → `style.css` regel 223 |
| Flexbox | `.controls`, `.table-pokemon`, `#typeFilters` → `style.css` regels 81, 145, 327 |
| Responsive design | media queries → `style.css` regels 733-745 |
| ES Modules | `import './style.css'` → `main.js` regel 2 |
| Vite | project opgezet met Vite |
| Form validatie | minimum 2 letters zoeken → `main.js` regels 392-395 |

# Installatie

Clone de repository:

```bash
git clone https://github.com/Anissa321/Pokemon-explorer.git
```

Installeer dependencies:

```bash
npm install
```

Start de development server:

```bash
npm run dev
```

---

# Structuur van het project

src/
├── main.js
├── style.css

public/
├── images/
│   ├── image (1).png
│   ├── image (2).png
│   ├── image (3).png
│   ├── image (4).png
│   └── image (5).png

index.html
package.json

---

# Screenshots

### Home pagina
![Home pagina](public/images/image%20(5).png)

### Pokemon cards
![Pokemon cards](public/images/image%20(1).png)

### Shiny pokemon
![Shiny pokemon](public/images/image%20(2).png)

### Pokemon modal
![Pokemon modal](public/images/image%20(3).png)

### Tabel weergave
<img width="627" height="334" alt="Picture1" src="https://github.com/user-attachments/assets/fcaa0d31-f46a-4f6b-b841-91c9cc096281" />

---

# AI Gebruik

ChatGPT werd ondersteunend gebruikt tijdens het project.

| Gebruik AI | Waar gebruikt |
|-------------|---------------|
| Hulp bij debugging | `main.js` regels 242-251 (favorieten), regels 392-406 (filters), GitHub deployment |
| Verbeteren CSS | `style.css` regels 223-550 (cards, tabel, modal styling) |
| Ideeën voor layout | `style.css` regels 223-550 (Pokemon cards, modal layout, tabel layout) |
| Responsive design | `style.css` regels 733-745 |
| Uitleg JavaScript | `main.js` regels 52-81 (Async/Await, Fetch API, Promise.all) |
| Optimaliseren filters | `main.js` regels 392-406 (`updateFilters()`) |
| Verbeteren tabel layout | `main.js` regels 166-205 + `style.css` regels 278-370 |
| Observer API | `main.js` regels 229-239 + `style.css` regels 718-726 |
| LocalStorage uitleg | `main.js` regels 16 + 248 |
| Responsive CSS verbeteringen | `style.css` regels 733-745 |

Alle AI-output werd nagekeken, begrepen en aangepast waar nodig.

---

# Auteur

Gemaakt door Anissa Canton Rodriguez
Bachelor Toegepaste Informatica  
Erasmushogeschool Brussel
