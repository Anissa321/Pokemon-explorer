(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function o(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(a){if(a.ep)return;a.ep=!0;const s=o(a);fetch(a.href,s)}})();const $=document.querySelector("#app"),P="https://pokeapi.co/api/v2/pokemon?limit=24",L="pokemonFavorites";let m=[],u=[],h="",p="all",q=["all"],y="id-asc",S="cards",v=!1,r=JSON.parse(localStorage.getItem(L))||[],d=[];function T(){$.innerHTML=`
    <div class="loading-screen">
      <h2>Pokémon worden geladen...</h2>
      <p>Even geduld, je Pokédex wordt gevuld.</p>
    </div>
  `}function w(e){switch(e){case"all":return"🔍";case"grass":return"🌿";case"poison":return"☠️";case"fire":return"🔥";case"flying":return"🕊️";case"water":return"💧";case"bug":return"🐛";case"normal":return"⚪";default:return"🔘"}}function f(e){const t=d.includes(e.id),o=t?e.sprites.other["official-artwork"].front_shiny:e.sprites.other["official-artwork"].front_default,n=t?e.sprites.front_shiny:e.sprites.front_default;return o||n}async function E(){try{T();const t=await(await fetch(P)).json();m=await Promise.all(t.results.map(async n=>await(await fetch(n.url)).json())),u=m,q=["all",...new Set(m.flatMap(n=>n.types.map(a=>a.type.name)))],F(),N(),c(),l()}catch(e){$.innerHTML="<p>Fout bij laden</p>",console.error(e)}}function F(){$.innerHTML=`
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
        ${q.map(e=>`
          <button class="type-btn" data-type="${e}">
            <span>${w(e)}</span>
            <span>${e}</span>
          </button>
        `).join("")}
      </div>

      <section id="contentArea"></section>
    </div>

    <div class="modal hidden" id="pokemonModal">
      <div class="modal-card">
        <button id="closeModal">✕</button>
        <div id="modalContent"></div>
      </div>
    </div>
  `}function k(e){const t=document.querySelector("#contentArea");if(e.length===0){t.innerHTML='<p class="empty-state">Geen Pokémon gevonden.</p>';return}S==="cards"?t.innerHTML=`
      <div class="pokemon-container">
        ${e.map(o=>{const n=d.includes(o.id);return`
            <div class="card type-${o.types[0].type.name} reveal-item">
              <button class="favorite-button" data-id="${o.id}">
                <span>${r.includes(o.id)?"❤️":"🤍"}</span>
              </button>

              ${n?'<div class="shiny-badge">✨ Shiny</div>':""}

              <h2>${b(o.name)}</h2>

              <img 
                src="${f(o)}" 
                alt="${o.name}" 
                data-id="${o.id}"
                class="pokemon-image"
              />

              <button class="details-button" data-id="${o.id}">
                Open kaart
              </button>
            </div>
          `}).join("")}
      </div>
    `:t.innerHTML=`
      <div class="table-wrapper">
        <table class="pokemon-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pokemon</th>
              <th>Type</th>
              <th>Height</th>
              <th>Weight</th>
              <th>Favoriet</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${e.map(o=>`
              <tr class="table-row type-${o.types[0].type.name} reveal-item">
                <td>#${o.id}</td>

                <td class="table-pokemon">
                  <img src="${f(o)}" alt="${o.name}" />
                  <span>${b(o.name)}</span>
                </td>

                <td>
                  <div class="table-types">
                    ${o.types.map(n=>`
                      <span class="table-type-pill type-${n.type.name}">
                        ${w(n.type.name)} ${n.type.name}
                      </span>
                    `).join("")}
                  </div>
                </td>

                <td>${o.height}</td>
                <td>${o.weight}</td>

                <td>
                  <button class="table-favorite-button" data-id="${o.id}">
                    <span>${r.includes(o.id)?"❤️":"🤍"}</span>
                  </button>
                </td>

                <td>
                  <button class="details-button table-details" data-id="${o.id}">
                    Open
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `,I(),O()}function I(){document.querySelectorAll(".favorite-button, .table-favorite-button").forEach(e=>{e.onclick=t=>{t.stopPropagation(),A(Number(e.dataset.id))}}),document.querySelectorAll(".details-button").forEach(e=>{e.onclick=t=>{t.stopPropagation(),g(Number(e.dataset.id))}}),document.querySelectorAll(".pokemon-image").forEach(e=>{e.ondblclick=()=>{M(Number(e.dataset.id)),k(u)}})}function O(){const e=new IntersectionObserver(t=>{t.forEach(o=>{o.isIntersecting&&(o.target.classList.add("revealed"),e.unobserve(o.target))})});document.querySelectorAll(".reveal-item").forEach(t=>{e.observe(t)})}function A(e){r.includes(e)?r=r.filter(t=>t!==e):r.push(e),localStorage.setItem(L,JSON.stringify(r)),c(),l()}function M(e){d.includes(e)?d=d.filter(t=>t!==e):d.push(e)}function g(e){const t=m.find(i=>i.id===e),o=document.querySelector("#pokemonModal"),n=document.querySelector("#modalContent"),a=r.includes(t.id),s=d.includes(t.id);n.innerHTML=`
    <button class="modal-favorite" data-id="${t.id}">
      <span>${a?"❤️":"🤍"}</span>
    </button>

    <div class="modal-layout">
      <div class="modal-left type-${t.types[0].type.name}">
        ${s?'<div class="modal-shiny-badge">✨ Shiny</div>':""}

        <h2>${b(t.name)}</h2>

        <img 
          src="${f(t)}" 
          alt="${t.name}" 
          class="modal-pokemon-image"
          data-id="${t.id}"
        />

        <div class="type-tags">
          ${t.types.map(i=>`
            <span class="type-pill type-${i.type.name}">
              ${w(i.type.name)} ${i.type.name}
            </span>
          `).join("")}
        </div>
      </div>

      <div class="modal-right">
        <p><strong>ID:</strong> #${t.id}</p>
        <p><strong>Height:</strong> ${t.height}</p>
        <p><strong>Weight:</strong> ${t.weight}</p>
        <p><strong>Base experience:</strong> ${t.base_experience}</p>

        <h3>Stats</h3>

        <div class="stats">
          ${t.stats.map(i=>`
            <div class="stat">
              <div class="stat-label">
                <span>${i.stat.name}</span>
                <strong>${i.base_stat}</strong>
              </div>
              <div class="bar">
                <div class="fill" style="width: ${Math.min(i.base_stat,100)}%"></div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `,o.classList.remove("hidden"),document.querySelector(".modal-favorite").onclick=()=>{A(t.id),g(t.id)},document.querySelector(".modal-pokemon-image").ondblclick=()=>{M(t.id),g(t.id),c()}}function l(){document.querySelectorAll(".view-btn").forEach(t=>{const o=t.dataset.view===S;t.classList.toggle("active-view",o),t.classList.toggle("inactive-view",!o)}),document.querySelectorAll(".type-btn").forEach(t=>{const o=t.dataset.type===p;t.classList.toggle("active-type",o),t.classList.toggle("inactive-type",p!=="all"&&!o)});const e=document.querySelector("#showFavorites");e&&(e.classList.toggle("active-view",v),e.classList.toggle("inactive-view",!v))}function N(){document.querySelector("#search").oninput=e=>{h=e.target.value.trim().toLowerCase(),c()},document.querySelector("#sortBy").onchange=e=>{y=e.target.value,c()},document.querySelectorAll(".type-btn").forEach(e=>{e.onclick=()=>{p=e.dataset.type,c(),l()}}),document.querySelector("#showFavorites").onclick=()=>{v=!0,c(),l()},document.querySelector("#showAll").onclick=()=>{v=!1,h="",p="all",y="id-asc",document.querySelector("#search").value="",document.querySelector("#sortBy").value="id-asc",c(),l()},document.querySelectorAll(".view-btn").forEach(e=>{e.onclick=()=>{S=e.dataset.view,k(u),l()}}),document.querySelector("#closeModal").onclick=()=>{document.querySelector("#pokemonModal").classList.add("hidden")},document.querySelector("#pokemonModal").onclick=e=>{e.target.id==="pokemonModal"&&e.target.classList.add("hidden")},l()}function c(){if(h.length==1){document.querySelector("#contentArea").innerHTML='<p class="empty-state">Typ minstens 2 letters om te zoeken.</p>';return}u=m.filter(e=>{const t=!v||r.includes(e.id),o=e.name.toLowerCase().includes(h),n=p==="all"||e.types.some(a=>a.type.name===p);return t&&o&&n}),j(),k(u)}function j(){u.sort((e,t)=>{switch(y){case"id-desc":return t.id-e.id;case"name-asc":return e.name.localeCompare(t.name);case"name-desc":return t.name.localeCompare(e.name);default:return e.id-t.id}})}function b(e){return e.charAt(0).toUpperCase()+e.slice(1)}E();
