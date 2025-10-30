// dice.js (nel vault)
const fs = require('fs');
const path = require('path');

// — risolve un path nota assoluto a partire da notePath (+ opzionale vaultPath)
function resolveNotePath(notePath, vaultPath) {
  if (!notePath) throw new Error('getProps: notePath mancante');
  return path.isAbsolute(notePath) ? notePath : path.join(vaultPath || process.cwd(), notePath);
}

function readNote(notePath, vaultPath) {
  const abs = resolveNotePath(notePath, vaultPath);
  return { abs, md: fs.readFileSync(abs, 'utf8') };
}

function extractFrontmatter(md) {
  const m = /^---\s*([\s\S]*?)\s*---/m.exec(md);
  return m ? m[1] : '';
}

function parseProps(front) {
  // usa 'yaml' se presente, altrimenti fallback leggero (primitivi + liste)
  try { return require('yaml').parse(front) || {}; }
  catch {
    const props = {};
    let curKey = null;
    for (const line of front.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const li = /^\s*-\s+(.*)$/.exec(line);
      if (li && curKey) { (props[curKey] ??= []).push(li[1].trim()); continue; }
      const kv = /^([^:]+):\s*(.*)$/.exec(line);
      if (kv) {
        curKey = kv[1].trim();
        let v = kv[2].trim().replace(/^(['"])(.*)\1$/,'$2');
        if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v);
        else if (/^(true|false)$/i.test(v)) v = /^true$/i.test(v);
        else if (v === '') v = null;
        props[curKey] = v;
      }
    }
    return props;
  }
}

// API: restituisce tutte le Proprietà (frontmatter) della nota
function getProps(notePath, vaultPath) {
  const { md } = readNote(notePath, vaultPath);
  return parseProps(extractFrontmatter(md));
}

// lascio anche la tua funzione esistente
function add(a, b) { return a + b; }

// 🎲 Tiro di dadi semplice: rollDice(num, sides, mod)
// Esempio: rollDice(3,10,2) → tira 3d10 + 2
function rollDice(num = 1, sides = 10, mod = 0) {
  const n = Number(num)   || 0;
  const s = Number(sides) || 0;
  const m = Number(mod)   || 0;
  if (n <= 0 || s <= 1) return { rolls: [], total: m, mod: m };
  const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * s) + 1);
  const total = rolls.reduce((a,b) => a + b, 0) + m;
  return { rolls, total, mod: m };
}

// === Fame e tiro V20 ibrido (semplice e lineare) ==================
// Fame = (PuntiSangue < 7 - AutocontrolloIstinto)
// NB: getProps() è già gestita dal tuo ambiente, qui la usiamo "as-is".
function getFame() {
  try {
    const props = getProps(); // nessun argomento: il tuo runtime fornisce la nota corrente
    const ps = Number(props?.PuntiSangue);
    const ai = Number(props?.AutocontrolloIstinto);
    if (!Number.isFinite(ps) || !Number.isFinite(ai)) return false;
    return ps < (7 - ai);
  } catch { return false; }
}

// 🎲 rollPoolV20(num, sides, diff, botchVal)
// - r >= diff = 1 successo; r == sides (max) = 2 successi
// - ogni 1 cancella UN dado di successo a partire dal più alto (prima 10=2, poi 9/8/...=1)
// - etichette: Critico, Messy Critical, Successo/Successi, Successo Disordinato, Fallimento, Botch, Bestiale
function rollPoolV20(num = 1, sides = 10, diff = 6, botchVal = 1) {
  const n = Number(num)   || 0;
  const s = Number(sides) || 0;
  const d = Number(diff)  || 0;
  const b = Number(botchVal);

  const fame = getFame();

  if (n <= 0 || s <= 1) {
    return { rolls: [], diff: d, fame, successi: 0, esito: 'Fallimento' };
  }

  const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * s) + 1);

  // contributo per dado
  const perDie = rolls.map((r, idx) => {
    const contrib = (r >= d) ? (r === s ? 2 : 1) : 0;
    return { idx, r, contrib };
  });

  const tens = rolls.filter(r => r === s).length;
  const ones = rolls.filter(r => r === b).length;

  // successi grezzi
  let raw = perDie.reduce((acc, x) => acc + x.contrib, 0);

  // ordina per cancellazione: prima 10 (contrib=2), poi valore, poi indice
  const stack = perDie
    .filter(x => x.contrib > 0)
    .sort((a, b2) => {
      if (b2.contrib !== a.contrib) return b2.contrib - a.contrib;
      if (b2.r !== a.r) return b2.r - a.r;
      return a.idx - b2.idx;
    });

  // applica le cancellazioni dei "1": ogni 1 rimuove UN dado di successo
  for (let i = 0; i < ones; i++) {
    const target = stack.shift();
    if (!target) break;
    raw -= target.contrib; // 10 toglie 2, gli altri 1
  }

  const successi = Math.max(0, raw);

   // --- CLASSIFICAZIONE (corretta) ---
  // successi = finali, raw = successi grezzi prima dei "1"
  let esito;
  if (successi === 0) {
    if (ones > 0) {
      // Se non avevi proprio successi grezzi → Botch/Bestiale
      // Se invece i "1" hanno cancellato dei successi → Fallimento
      esito = (raw === 0)
        ? (fame ? 'Fallimento Bestiale' : 'Fallimento Critico (Botch)')
        : 'Fallimento';
    } else {
      esito = 'Fallimento';
    }
  } else {
    const noOnes = (ones === 0);
    if (tens >= 1 && noOnes) {
      // Critico pulito
      esito = (tens === 1 && fame) ? 'Messy Critical' : 'Critico';
    } else if (tens === 1 && fame) {
      // Messy Critical con almeno 1 successo totale (anche se ci sono "1")
      esito = 'Messy Critical';
    } else if (successi === 1 && fame) {
      esito = 'Successo Disordinato';
    } else {
      esito = (successi === 1) ? '1 Successo' : `${successi} Successi`;
    }
  }


  return { rolls, diff: d, fame, successi, esito, tens, ones };
}

// === export: aggiungi la nuova funzione senza toccare il resto =====
module.exports = { add, getProps, rollDice, rollPoolV20 };
