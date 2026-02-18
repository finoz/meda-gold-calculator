// ─── STATE ────────────────────────────────────────────────────────────────────

const state = {
  coppia: true,
  larghezzaDiversa: false,
  colore: null,  // condiviso tra lei e lui
  lei: { model: null, width: null, misura: null },
  lui: { model: null, width: null, misura: null }
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getSizeTier(misura) {
  const m = parseInt(misura);
  if (isNaN(m)) return null;
  if (m >= 8  && m <= 13) return "8-13";
  if (m >= 14 && m <= 21) return "14-21";
  if (m >= 22 && m <= 31) return "22-31";
  return null;
}

function getWeight(modelKey, widthKey, misura) {
  const model = DB.models[modelKey];
  if (!model) return null;
  const width = model.widths[widthKey];
  if (!width) return null;
  if (model.hasSizeTiers) {
    const tier = getSizeTier(misura);
    if (!tier) return null;
    return width.weights[tier] || null;
  } else {
    return width.weight;
  }
}

// ─── RENDER FORM ──────────────────────────────────────────────────────────────

function renderForm(containerId, personKey, shareWidthFrom) {
  const container = document.getElementById(containerId);
  const personState = state[personKey];

  let modelOptions = `<option value="">— scegli —</option>`;
  for (const [k, v] of Object.entries(DB.models)) {
    const sel = personState.model === k ? 'selected' : '';
    modelOptions += `<option value="${k}" ${sel}>${v.label}</option>`;
  }

  // Width: se shareWidthFrom, il campo è disabilitato (prende da lei)
  let widthOptions = `<option value="">— scegli modello —</option>`;
  let widthDisabled = '';
  const sourceModel = personState.model || (shareWidthFrom ? state[shareWidthFrom].model : null);
  if (sourceModel && DB.models[sourceModel]) {
    widthOptions = `<option value="">— larghezza —</option>`;
    for (const [k, v] of Object.entries(DB.models[sourceModel].widths)) {
      const sel = personState.width === k ? 'selected' : '';
      widthOptions += `<option value="${k}" ${sel}>${v.label}</option>`;
    }
  }
  if (shareWidthFrom) {
    widthDisabled = 'disabled';
    const leiWidth = state.lei.width;
    if (leiWidth && personState.width !== leiWidth) {
      personState.width = leiWidth;
    }
  }

  // Misura
  const needsMisura = sourceModel && DB.models[sourceModel]?.hasSizeTiers;
  const misuraVal = personState.misura || '';
  const tierLabel = needsMisura && personState.misura
    ? ` <span class="tag-misura">${getSizeTier(personState.misura) || '?'}</span>`
    : '';

  container.innerHTML = `
    <div class="form-row cols-2">
      <div class="field">
        <label>Modello</label>
        <select onchange="selectModel('${personKey}', this.value)">
          ${modelOptions}
        </select>
      </div>
      <div class="field">
        <label>Larghezza</label>
        <select ${widthDisabled} onchange="selectWidth('${personKey}', this.value)">
          ${widthOptions}
        </select>
      </div>
    </div>
    <div class="form-row cols-2">
      <div class="field">
        <label>Misura dito (8–31)${tierLabel}</label>
        <input type="number" min="8" max="31" value="${misuraVal}"
          placeholder="es. 14"
          onchange="selectMisura('${personKey}', this.value)">
        <span class="misura-hint">${needsMisura ? 'La misura determina il gruppo peso' : 'Solo per riferimento su questo modello'}</span>
      </div>
    </div>
  `;
}

// ─── INTERACTION ──────────────────────────────────────────────────────────────

function selectModel(person, value) {
  state[person].model = value || null;
  state[person].width = null;
  rerender();
}

function selectWidth(person, value) {
  state[person].width = value || null;
  // se coppia e larghezza NON diversa, sincronizza lui
  if (!state.larghezzaDiversa && person === 'lei') {
    state.lui.width = value || null;
  }
  // reset colore se non disponibile per nuova larghezza
  if (state.colore) {
    const model = state[person].model;
    const width = value;
    if (model && width) {
      const available = DB.models[model]?.widths[width]?.colors || [];
      if (!available.includes(state.colore)) state.colore = null;
    }
  }
  rerender();
}

function selectColor(color) {
  state.colore = color;
  rerender();
}

function selectMisura(person, value) {
  state[person].misura = value;
  rerender();
}

function rerender() {
  const flagLarghezzaDiversa = state.larghezzaDiversa;

  if (state.coppia) {
    document.getElementById('blockLui').classList.remove('hidden');

    if (!flagLarghezzaDiversa) {
      state.lui.model = state.lei.model;
      state.lui.width = state.lei.width;
      renderLuiLinkato();
    } else {
      renderForm('formLui', 'lui', null);
    }
  } else {
    document.getElementById('blockLui').classList.add('hidden');
    document.getElementById('labelLei').textContent = 'Singolo';
  }

  if (state.coppia) {
    document.getElementById('labelLei').textContent = 'Lei';
  }

  renderForm('formLei', 'lei', null);

  // Aggiorna swatches colore condiviso
  renderSharedColor();

  // Re-attach larghezza diversa toggle
  const flagEl = document.getElementById('flagLarghezzaDiversa');
  if (flagEl) flagEl.checked = state.larghezzaDiversa;
}

function renderSharedColor() {
  function getAvailable(person) {
    const m = state[person].model;
    const w = state[person].width;
    if (!m || !w || !DB.models[m]) return null; // null = non ancora selezionato
    return DB.models[m].widths[w]?.colors || [];
  }

  const leiColors = getAvailable('lei');
  const luiColors = state.coppia && state.larghezzaDiversa ? getAvailable('lui') : leiColors;

  let available = [];
  if (leiColors && luiColors) {
    available = leiColors.filter(c => luiColors.includes(c));
  } else if (leiColors) {
    available = leiColors;
  } else if (luiColors) {
    available = luiColors;
  }

  const container = document.getElementById('sharedColorOptions');
  const hint = document.getElementById('colorHint');

  if (available.length === 0) {
    hint.textContent = 'Seleziona prima modello e larghezza per vedere i colori disponibili';
  } else {
    hint.textContent = DB.colors[state.colore]
      ? `Selezionato: ${DB.colors[state.colore]}`
      : 'Scegli un colore';
  }

  // Se colore selezionato non è più disponibile, resettalo
  if (state.colore && !available.includes(state.colore)) {
    state.colore = null;
    hint.textContent = 'Il colore precedente non è disponibile per questa selezione';
  }

  let html = '';
  for (const [ck, cv] of Object.entries(DB.colors)) {
    const isAvailable = available.includes(ck);
    const active    = state.colore === ck ? 'active' : '';
    const disabled  = !isAvailable ? 'disabled' : '';
    html += `<button type="button" class="color-btn ${active} ${disabled}"
      data-color="${ck}" title="${cv}" onclick="selectColor('${ck}')"></button>`;
  }
  container.innerHTML = html;
}

function renderLuiLinkato() {
  const container   = document.getElementById('formLui');
  const personState = state.lui;
  const sourceModel = state.lei.model;
  const currentWidth = state.lei.width;
  const needsMisura = sourceModel && DB.models[sourceModel]?.hasSizeTiers;
  const misuraVal   = personState.misura || '';
  const modelLabel  = sourceModel ? DB.models[sourceModel].label : '—';
  const widthLabel  = (sourceModel && currentWidth && DB.models[sourceModel]?.widths[currentWidth])
    ? DB.models[sourceModel].widths[currentWidth].label : '—';

  container.innerHTML = `
    <p class="nota" style="margin-bottom:1rem;">Stesso modello e larghezza di lei: <strong>${modelLabel} ${widthLabel}</strong></p>
    <div class="form-row cols-2">
      <div class="field">
        <label>Misura dito (8–31)</label>
        <input type="number" min="8" max="31" value="${misuraVal}"
          placeholder="es. 20"
          onchange="selectMisura('lui', this.value)">
        <span class="misura-hint">${needsMisura ? 'La misura determina il gruppo peso' : 'Solo per riferimento'}</span>
      </div>
    </div>
  `;
}

// ─── CALCOLO ──────────────────────────────────────────────────────────────────

function calcola() {
  const spot     = parseFloat(document.getElementById('spotOro').value);
  const coeff    = parseFloat(document.getElementById('coefficiente').value);
  const sconto   = parseFloat(document.getElementById('scontoFisso').value);
  const ivaPerc  = parseFloat(document.getElementById('iva').value) / 100;

  if (isNaN(spot) || spot <= 0) { alert('Inserisci un prezzo spot valido.'); return; }

  // Extra selezionati
  let extraTotale = 0;
  const extraChecked = [];
  DB.extras.forEach(e => {
    const el = document.getElementById(`extra_${e.id}`);
    if (el && el.checked) {
      extraTotale += e.price;
      extraChecked.push(e);
    }
  });

  // Calcola singolo anello
  function calcAnello(personKey) {
    const s = state[personKey];
    if (!s.model || !s.width || !state.colore) return null;
    const weight = getWeight(s.model, s.width, s.misura);
    if (weight === null) return null;
    const pesoOro  = weight * DB.purity;
    const costoOro = pesoOro * spot;
    const label    = DB.models[s.model].label
      + ' ' + DB.models[s.model].widths[s.width].label
      + ' ' + DB.colors[state.colore];
    return { weight, pesoOro, costoOro, label };
  }

  const lei = calcAnello('lei');
  const lui = state.coppia ? calcAnello('lui') : null;

  if (!lei) { alert('Completa i dati della fede (modello, larghezza, colore, misura se richiesta).'); return; }
  if (state.coppia && !lui) { alert('Completa i dati della fede (lui).'); return; }

  const costoOroTot  = lei.costoOro + (lui ? lui.costoOro : 0);
  const costoConExtra = costoOroTot + extraTotale;
  const prezzoLordo  = costoConExtra * coeff;
  const prezzoScontato = prezzoLordo - sconto;
  const prezzoIva    = prezzoScontato * (1 + ivaPerc);

  // Render risultato
  const fmt = v => `€ ${v.toFixed(2)}`;
  let html = '';

  html += `<div class="result-line"><span>Peso anello lei (${lei.label})</span><span>${lei.weight.toFixed(2)} g</span></div>`;
  html += `<div class="result-line"><span>Peso oro lei (18kt)</span><span>${lei.pesoOro.toFixed(2)} g</span></div>`;
  html += `<div class="result-line"><span>Costo oro lei</span><span class="amount" style="font-size:0.9rem">${fmt(lei.costoOro)}</span></div>`;

  if (lui) {
    html += `<div class="result-line"><span>Peso anello lui (${lui.label})</span><span>${lui.weight.toFixed(2)} g</span></div>`;
    html += `<div class="result-line"><span>Peso oro lui (18kt)</span><span>${lui.pesoOro.toFixed(2)} g</span></div>`;
    html += `<div class="result-line"><span>Costo oro lui</span><span class="amount" style="font-size:0.9rem">${fmt(lui.costoOro)}</span></div>`;
  }

  html += `<div class="result-line highlight"><span>Costo oro totale</span><span class="amount">${fmt(costoOroTot)}</span></div>`;

  if (extraChecked.length > 0) {
    extraChecked.forEach(e => {
      html += `<div class="result-line"><span>+ ${e.label}</span><span>${fmt(e.price)}</span></div>`;
    });
    html += `<div class="result-line highlight"><span>Con lavorazioni</span><span class="amount">${fmt(costoConExtra)}</span></div>`;
  }

  html += `<div class="result-line"><span>× Coefficiente (${coeff})</span><span class="amount">${fmt(prezzoLordo)}</span></div>`;
  html += `<div class="result-line total highlight"><span>Prezzo di listino</span><span class="amount">${fmt(prezzoLordo)}</span></div>`;
  html += `<div class="result-line scontato"><span>Prezzo netto scontato (− €${sconto.toFixed(0)})</span><span class="amount">${fmt(prezzoScontato)}</span></div>`;
  html += `<div class="result-line total"><span>Prezzo finale IVA incl. (${(ivaPerc * 100).toFixed(0)}%)</span><span class="amount">${fmt(prezzoIva)}</span></div>`;

  document.getElementById('resultLines').innerHTML = html;
  const risultato = document.getElementById('risultato');
  risultato.classList.remove('hidden');
  risultato.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.getElementById('flagCoppia').addEventListener('change', function () {
  state.coppia = this.checked;
  document.getElementById('flagCoppiaLabel').textContent = this.checked ? 'Coppia' : 'Singolo';
  rerender();
});

document.getElementById('flagLarghezzaDiversa').addEventListener('change', function () {
  state.larghezzaDiversa = this.checked;
  if (!this.checked) {
    state.lui.model = state.lei.model;
    state.lui.width = state.lei.width;
  }
  rerender();
});

document.getElementById('btnCalcola').addEventListener('click', calcola);

rerender();
