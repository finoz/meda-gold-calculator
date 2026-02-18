// ─── DATABASE FEDI NUZIALI ────────────────────────────────────────────────────
// Modifica qui i modelli, larghezze, pesi e lavorazioni extra.

const DB = {

  // Titolo dell'oro: 18kt = 75% oro puro, arrotondato a 0.8 per eccesso
  purity: 0.8,

  // Colori disponibili
  colors: {
    GG: "Giallo",
    BB: "Bianco",
    RR: "Rosé"
  },

  // Fasce misura per la Comoda (determina il peso)
  sizeTiers: ["8-13", "14-21", "22-31"],

  // Modelli e relative larghezze
  // hasSizeTiers: true  → il peso dipende dalla misura del dito (usa 'weights')
  // hasSizeTiers: false → peso fisso indipendente dalla misura (usa 'weight')
  models: {
    comoda: {
      label: "Comoda",
      hasSizeTiers: true,
      widths: {
        "2.4": { label: "2.4 mm", colors: ["BB", "GG"],        weights: { "8-13": 2.5,  "14-21": 3.2,  "22-31": 3.5  } },
        "3.0": { label: "3.0 mm", colors: ["BB", "GG", "RR"],  weights: { "8-13": 3.85, "14-21": 4.35, "22-31": 4.85 } },
        "3.5": { label: "3.5 mm", colors: ["BB", "GG", "RR"],  weights: { "8-13": 4.95, "14-21": 5.35, "22-31": 5.65 } },
        "4.0": { label: "4.0 mm", colors: ["BB", "GG", "RR"],  weights: { "8-13": 5.85, "14-21": 6.35, "22-31": 6.85 } }
      }
    },
    francese: {
      label: "Francese",
      hasSizeTiers: false,
      widths: {
        "2.2": { label: "2.2 mm", colors: ["BB", "GG", "RR"],  weight: 2.0 },
        "3.0": { label: "3.0 mm", colors: ["BB", "GG", "RR"],  weight: 4.0 },
        "3.6": { label: "3.6 mm", colors: ["BB", "GG"],        weight: 5.1 }
      }
    },
    normale: {
      label: "Normale (Italiana)",
      hasSizeTiers: false,
      widths: {
        // DA COMPLETARE — inserisci i valori reali
        "2.0":  { label: "2.0 mm",      colors: ["BB", "GG"],        weight: 1.5  },
        "3.4":  { label: "3.4 mm",      colors: ["BB", "GG"],        weight: 3.0  },
        "3.4b": { label: "3.4 mm (40)", colors: ["BB", "GG"],        weight: 4.0  },
        "3.6":  { label: "3.6 mm",      colors: ["BB", "GG", "RR"],  weight: 5.0  },
        "4.0":  { label: "4.0 mm",      colors: ["GG"],              weight: 6.0  },
        "4.5":  { label: "4.5 mm",      colors: ["BB", "GG"],        weight: 7.0  },
        "4.6":  { label: "4.6 mm",      colors: ["GG"],              weight: 8.0  },
        "5.1":  { label: "5.1 mm",      colors: ["GG"],              weight: 10.0 }
      }
    }
  },

  extras: [
    { id: "incisione_mano", label: "Incisione a mano", price: 40 }
  ]
};
