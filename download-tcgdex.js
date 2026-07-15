/**
 * TELECHARGE-IMAGES — Node.js 18+ (aucune dépendance)
 * ────────────────────────────────────────────────────
 * Usage :  node telecharge-images.js
 *
 * Télécharge les scans TCGdex directement aux noms attendus par l'app :
 *   images/em-1.jpg, images/ecto-14.jpg, images/jgk-3.jpg, …
 *
 * Fonctionnement :
 *  1. La liste des 189 cartes de l'app est embarquée ci-dessous (id, extension, numéro).
 *  2. Le script récupère la liste des sets TCGdex FR et fait correspondre chaque
 *     extension de l'app à un set TCGdex (nom normalisé + vérification du nombre
 *     de cartes officiel quand le numéro le permet, ex. 34/119 → set de 119).
 *  3. Pour chaque carte, il télécharge l'image haute déf (jpg, sinon webp, sinon png)
 *     sous le nom images/{id-app}.{ext}.
 *  4. Bilan final + rapport-images.json (extensions non trouvées, cartes sans scan).
 *
 * Relançable à volonté : les fichiers déjà présents sont sautés.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './images';
const API = 'https://api.tcgdex.net/v2/fr';
const DELAY_MS = 300;

const CARDS =
[{"id":"em-1","nom":"Braségali","extension":"EX : Émeraude","numero":"1/106"},{"id":"em-2","nom":"Deoxys","extension":"EX : Émeraude","numero":"2/106"},{"id":"em-3","nom":"Brouhabam","extension":"EX : Émeraude","numero":"3/106"},{"id":"em-4","nom":"Gardevoir","extension":"EX : Émeraude","numero":"4/106"},{"id":"em-5","nom":"Groudon","extension":"EX : Émeraude","numero":"5/106"},{"id":"em-6","nom":"Kyogre","extension":"EX : Émeraude","numero":"6/106"},{"id":"em-7","nom":"Élecsprint","extension":"EX : Émeraude","numero":"7/106"},{"id":"em-8","nom":"Milobellus","extension":"EX : Émeraude","numero":"8/106"},{"id":"em-9","nom":"Rayquaza","extension":"EX : Émeraude","numero":"9/106"},{"id":"em-10","nom":"Jungko","extension":"EX : Émeraude","numero":"10/106"},{"id":"em-11","nom":"Laggron","extension":"EX : Émeraude","numero":"11/106"},{"id":"em-12","nom":"Éoko","extension":"EX : Émeraude","numero":"12/106"},{"id":"em-13","nom":"Oniglali","extension":"EX : Émeraude","numero":"13/106"},{"id":"em-14","nom":"Groudon","extension":"EX : Émeraude","numero":"14/106"},{"id":"em-15","nom":"Kyogre","extension":"EX : Émeraude","numero":"15/106"},{"id":"em-16","nom":"Élecsprint","extension":"EX : Émeraude","numero":"16/106"},{"id":"em-17","nom":"Tarinor","extension":"EX : Émeraude","numero":"17/106"},{"id":"em-18","nom":"Relicanth","extension":"EX : Émeraude","numero":"18/106"},{"id":"em-19","nom":"Rhinoféros","extension":"EX : Émeraude","numero":"19/106"},{"id":"em-20","nom":"Séviper","extension":"EX : Émeraude","numero":"20/106"},{"id":"em-21","nom":"Mangriff","extension":"EX : Émeraude","numero":"21/106"},{"id":"em-22","nom":"Chapignon","extension":"EX : Émeraude","numero":"22/106"},{"id":"em-23","nom":"Camérupt","extension":"EX : Émeraude","numero":"23/106"},{"id":"em-24","nom":"Kaorine","extension":"EX : Émeraude","numero":"24/106"},{"id":"em-25","nom":"Galifeu","extension":"EX : Émeraude","numero":"25/106"},{"id":"em-26","nom":"Dodrio","extension":"EX : Émeraude","numero":"26/106"},{"id":"em-27","nom":"Électrode","extension":"EX : Émeraude","numero":"27/106"},{"id":"em-28","nom":"Massko","extension":"EX : Émeraude","numero":"28/106"},{"id":"em-29","nom":"Groret","extension":"EX : Émeraude","numero":"29/106"},{"id":"em-30","nom":"Groret","extension":"EX : Émeraude","numero":"30/106"},{"id":"em-31","nom":"Hariyama","extension":"EX : Émeraude","numero":"31/106"},{"id":"em-32","nom":"Lumivole","extension":"EX : Émeraude","numero":"32/106"},{"id":"em-33","nom":"Kirlia","extension":"EX : Émeraude","numero":"33/106"},{"id":"em-34","nom":"Linéon","extension":"EX : Émeraude","numero":"34/106"},{"id":"em-35","nom":"Ramboum","extension":"EX : Émeraude","numero":"35/106"},{"id":"em-36","nom":"Flobio","extension":"EX : Émeraude","numero":"36/106"},{"id":"em-37","nom":"Négapi","extension":"EX : Émeraude","numero":"37/106"},{"id":"em-38","nom":"Feunard","extension":"EX : Émeraude","numero":"38/106"},{"id":"em-39","nom":"Posipi","extension":"EX : Émeraude","numero":"39/106"},{"id":"em-40","nom":"Avaltout","extension":"EX : Émeraude","numero":"40/106"},{"id":"em-41","nom":"Hélédelle","extension":"EX : Émeraude","numero":"41/106"},{"id":"em-42","nom":"Muciole","extension":"EX : Émeraude","numero":"42/106"},{"id":"em-43","nom":"Balbuto","extension":"EX : Émeraude","numero":"43/106"},{"id":"em-44","nom":"Cacnea","extension":"EX : Émeraude","numero":"44/106"},{"id":"em-45","nom":"Doduo","extension":"EX : Émeraude","numero":"45/106"},{"id":"em-46","nom":"Skelénox","extension":"EX : Émeraude","numero":"46/106"},{"id":"em-47","nom":"Dynavolt","extension":"EX : Émeraude","numero":"47/106"},{"id":"em-48","nom":"Dynavolt","extension":"EX : Émeraude","numero":"48/106"},{"id":"em-49","nom":"Barpau","extension":"EX : Émeraude","numero":"49/106"},{"id":"em-50","nom":"Barpau","extension":"EX : Émeraude","numero":"50/106"},{"id":"em-51","nom":"Gloupti","extension":"EX : Émeraude","numero":"51/106"},{"id":"em-52","nom":"Embrylex","extension":"EX : Émeraude","numero":"52/106"},{"id":"em-53","nom":"Lovdisc","extension":"EX : Émeraude","numero":"53/106"},{"id":"em-54","nom":"Makuhita","extension":"EX : Émeraude","numero":"54/106"},{"id":"em-55","nom":"Meditikka","extension":"EX : Émeraude","numero":"55/106"},{"id":"em-56","nom":"Gobou","extension":"EX : Émeraude","numero":"56/106"},{"id":"em-57","nom":"Chamallot","extension":"EX : Émeraude","numero":"57/106"},{"id":"em-58","nom":"Chamallot","extension":"EX : Émeraude","numero":"58/106"},{"id":"em-59","nom":"Pichu","extension":"EX : Émeraude","numero":"59/106"},{"id":"em-60","nom":"Pikachu","extension":"EX : Émeraude","numero":"60/106"},{"id":"em-61","nom":"Tarsal","extension":"EX : Émeraude","numero":"61/106"},{"id":"em-62","nom":"Rhinocorne","extension":"EX : Émeraude","numero":"62/106"},{"id":"em-63","nom":"Balignon","extension":"EX : Émeraude","numero":"63/106"},{"id":"em-64","nom":"Stalgamin","extension":"EX : Émeraude","numero":"64/106"},{"id":"em-65","nom":"Spoink","extension":"EX : Émeraude","numero":"65/106"},{"id":"em-66","nom":"Spoink","extension":"EX : Émeraude","numero":"66/106"},{"id":"em-67","nom":"Tylton","extension":"EX : Émeraude","numero":"67/106"},{"id":"em-68","nom":"Nirondelle","extension":"EX : Émeraude","numero":"68/106"},{"id":"em-69","nom":"Poussifeu","extension":"EX : Émeraude","numero":"69/106"},{"id":"em-70","nom":"Arcko","extension":"EX : Émeraude","numero":"70/106"},{"id":"em-71","nom":"Voltorbe","extension":"EX : Émeraude","numero":"71/106"},{"id":"em-72","nom":"Goupix","extension":"EX : Émeraude","numero":"72/106"},{"id":"em-73","nom":"Chuchmur","extension":"EX : Émeraude","numero":"73/106"},{"id":"em-74","nom":"Zigzaton","extension":"EX : Émeraude","numero":"74/106"},{"id":"em-75","nom":"Zone de combat","extension":"EX : Émeraude","numero":"75/106"},{"id":"em-76","nom":"Double guérison totale","extension":"EX : Émeraude","numero":"76/106"},{"id":"em-77","nom":"Annette surfe sur le net","extension":"EX : Émeraude","numero":"77/106"},{"id":"em-78","nom":"Baie Prine","extension":"EX : Émeraude","numero":"78/106"},{"id":"em-79","nom":"Le Projet de M. Rochard","extension":"EX : Émeraude","numero":"79/106"},{"id":"em-80","nom":"Baie Oran","extension":"EX : Émeraude","numero":"80/106"},{"id":"em-81","nom":"PokéNav","extension":"EX : Émeraude","numero":"81/106"},{"id":"em-82","nom":"Prof. Seko","extension":"EX : Émeraude","numero":"82/106"},{"id":"em-83","nom":"Super bonbon","extension":"EX : Émeraude","numero":"83/106"},{"id":"em-84","nom":"Scott","extension":"EX : Émeraude","numero":"84/106"},{"id":"em-85","nom":"Timmy au dressage","extension":"EX : Émeraude","numero":"85/106"},{"id":"em-86","nom":"Énergie Obscurité","extension":"EX : Émeraude","numero":"86/106"},{"id":"em-87","nom":"Double Énergie Multicolore","extension":"EX : Émeraude","numero":"87/106"},{"id":"em-88","nom":"Énergie Métal","extension":"EX : Émeraude","numero":"88/106"},{"id":"em-89","nom":"Énergies Multiples","extension":"EX : Émeraude","numero":"89/106"},{"id":"em-90","nom":"Altaria ex","extension":"EX : Émeraude","numero":"90/106"},{"id":"em-91","nom":"Cacturne ex","extension":"EX : Émeraude","numero":"91/106"},{"id":"em-92","nom":"Camérupt ex","extension":"EX : Émeraude","numero":"92/106"},{"id":"em-93","nom":"Deoxys ex","extension":"EX : Émeraude","numero":"93/106"},{"id":"em-94","nom":"Téraclope ex","extension":"EX : Émeraude","numero":"94/106"},{"id":"em-95","nom":"Charmina ex","extension":"EX : Émeraude","numero":"95/106"},{"id":"em-96","nom":"Milobellus ex","extension":"EX : Émeraude","numero":"96/106"},{"id":"em-97","nom":"Raichu ex","extension":"EX : Émeraude","numero":"97/106"},{"id":"em-98","nom":"Regice ex","extension":"EX : Émeraude","numero":"98/106"},{"id":"em-99","nom":"Regirock ex","extension":"EX : Émeraude","numero":"99/106"},{"id":"em-100","nom":"Registeel ex","extension":"EX : Émeraude","numero":"100/106"},{"id":"em-101","nom":"Énergie Plante","extension":"EX : Émeraude","numero":"101/106"},{"id":"em-102","nom":"Énergie Feu","extension":"EX : Émeraude","numero":"102/106"},{"id":"em-103","nom":"Énergie Eau","extension":"EX : Émeraude","numero":"103/106"},{"id":"em-104","nom":"Énergie Électrique","extension":"EX : Émeraude","numero":"104/106"},{"id":"em-105","nom":"Énergie Psy","extension":"EX : Émeraude","numero":"105/106"},{"id":"em-106","nom":"Énergie Combat","extension":"EX : Émeraude","numero":"106/106"},{"id":"em-107","nom":"Canarticho","extension":"EX : Émeraude","numero":"107/106"},{"id":"ecto-1","nom":"Ectoplasma","extension":"Équilibre Parfait","numero":"050/088"},{"id":"ecto-2","nom":"Méga-Ectoplasma ex","extension":"Héros Transcendants","numero":"125/217"},{"id":"ecto-3","nom":"Méga-Ectoplasma ex","extension":"Héros Transcendants","numero":"269/217"},{"id":"ecto-4","nom":"Méga-Ectoplasma ex","extension":"Héros Transcendants","numero":"284/217"},{"id":"ecto-5","nom":"Méga-Ectoplasma ex","extension":"Flammes Fantasmagoriques","numero":"056/094"},{"id":"ecto-6","nom":"Ectoplasma ex","extension":"Forces Temporelles","numero":"104/162"},{"id":"ecto-7","nom":"Ectoplasma ex","extension":"Forces Temporelles","numero":"193/162"},{"id":"ecto-8","nom":"Ectoplasma","extension":"Destinées de Paldea","numero":"057/091"},{"id":"ecto-9","nom":"Ectoplasma","extension":"151","numero":"094/165"},{"id":"ecto-10","nom":"Ectoplasma","extension":"Origine Perdue","numero":"066/196"},{"id":"ecto-11","nom":"Ectoplasma","extension":"Origine Perdue","numero":"TG06/TG30"},{"id":"ecto-12","nom":"Ectoplasma-V","extension":"Poing de Fusion","numero":"156/264"},{"id":"ecto-13","nom":"Ectoplasma-VMAX","extension":"Poing de Fusion","numero":"157/264"},{"id":"ecto-14","nom":"Ectoplasma-VMAX","extension":"Poing de Fusion","numero":"271/264"},{"id":"ecto-15","nom":"Ectoplasma","extension":"Règne de Glace","numero":"057/198"},{"id":"ecto-16","nom":"Ectoplasma","extension":"Épée et Bouclier","numero":"085/202"},{"id":"ecto-17","nom":"Ectoplasma","extension":"Alliance Infaillible","numero":"70/214"},{"id":"ecto-18","nom":"Ectoplasma et Mimiqui-GX","extension":"Duo de Choc","numero":"53/181"},{"id":"ecto-19","nom":"Ectoplasma et Mimiqui-GX","extension":"Duo de Choc","numero":"164/181"},{"id":"ecto-20","nom":"Ectoplasma et Mimiqui-GX","extension":"Duo de Choc","numero":"165/181"},{"id":"ecto-21","nom":"Ectoplasma et Mimiqui-GX","extension":"Duo de Choc","numero":"186/181"},{"id":"ecto-22","nom":"Ectoplasma","extension":"Invasion Carmin","numero":"38/111"},{"id":"ecto-23","nom":"Ectoplasma","extension":"Générations","numero":"35/83"},{"id":"ecto-24","nom":"Ectoplasma","extension":"Impulsion Turbo","numero":"60/162"},{"id":"ecto-25","nom":"Ectoplasma-EX","extension":"Vigueur Spectrale","numero":"34/119"},{"id":"ecto-26","nom":"M-Ectoplasma-EX","extension":"Vigueur Spectrale","numero":"35/119"},{"id":"ecto-27","nom":"Lien Spirituel Ectoplasma","extension":"Vigueur Spectrale","numero":"95/119"},{"id":"ecto-28","nom":"Ectoplasma-EX","extension":"Vigueur Spectrale","numero":"114/119"},{"id":"ecto-29","nom":"M-Ectoplasma-EX","extension":"Vigueur Spectrale","numero":"121/119"},{"id":"ecto-30","nom":"Ectoplasma","extension":"HS : Triomphe","numero":"94/102"},{"id":"ecto-31","nom":"Ectoplasma","extension":"Platine : Arceus","numero":"16/99"},{"id":"ecto-32","nom":"Ectoplasma","extension":"Platine : Arceus","numero":"17/99"},{"id":"ecto-33","nom":"Ectoplasma Niv.X","extension":"Platine : Arceus","numero":"97/99"},{"id":"ecto-34","nom":"Ectoplasma GL","extension":"Platine : Rivaux Émergeants","numero":"40/111"},{"id":"ecto-35","nom":"Ectoplasma","extension":"Diamant & Perle : Tempête","numero":"18/100"},{"id":"ecto-36","nom":"Ectoplasma","extension":"Diamant & Perle","numero":"27/130"},{"id":"ecto-37","nom":"Ectoplasma","extension":"EX : Créateurs de Légendes","numero":"5/92"},{"id":"ecto-38","nom":"Ectoplasma ex","extension":"EX : Rouge Feu & Vert Feuille","numero":"108/112"},{"id":"ecto-39","nom":"Ectoplasma","extension":"Skyridge","numero":"10/144"},{"id":"ecto-40","nom":"Ectoplasma","extension":"Skyridge","numero":"H9/H32"},{"id":"ecto-41","nom":"Ectoplasma","extension":"Expedition","numero":"13/165"},{"id":"ecto-42","nom":"Ectoplasma","extension":"Expedition","numero":"48/165"},{"id":"ecto-43","nom":"Ectoplasma","extension":"Legendary Collection","numero":"11/110"},{"id":"ecto-44","nom":"Ectoplasma obscur","extension":"Neo Destiny","numero":"6/105"},{"id":"ecto-45","nom":"Ectoplasma de Morgane","extension":"Gym Challenge","numero":"29/132"},{"id":"ecto-46","nom":"Ectoplasma de Morgane","extension":"Gym Heroes","numero":"14/132"},{"id":"ecto-47","nom":"Ectoplasma","extension":"Fossile","numero":"5/62"},{"id":"ecto-48","nom":"Ectoplasma","extension":"Fossile","numero":"20/62"},{"id":"ecto-49","nom":"Ectoplasma","extension":"Trick or Trade 2024","numero":"057/091"},{"id":"ecto-50","nom":"Ectoplasma","extension":"Trick or Trade 2023","numero":"066/196"},{"id":"ecto-51","nom":"Ectoplasma","extension":"Trick or Trade 2022","numero":"057/198"},{"id":"ecto-52","nom":"Ectoplasma-V","extension":"Pack Récompense","numero":"156/264"},{"id":"ecto-53","nom":"Ectoplasma-VMAX","extension":"Pack Récompense","numero":"157/264"},{"id":"ecto-54","nom":"Ectoplasma","extension":"Pack Récompense","numero":"066/196"},{"id":"ecto-55","nom":"Ectoplasma-EX","extension":"Jumbo","numero":"34/119"},{"id":"ecto-56","nom":"Ectoplasma (Queengar)","extension":"World Championships 2009","numero":"18/100"},{"id":"ecto-57","nom":"Ectoplasma","extension":"Topps","numero":"94/151"},{"id":"ecto-58","nom":"Ectoplasma","extension":"Lamincards 2005","numero":"94/150"},{"id":"jgk-1","nom":"Jungko-GX","extension":"Tonnerre Perdu","numero":"22/214"},{"id":"jgk-2","nom":"Jungko-GX","extension":"Tonnerre Perdu","numero":"196/214"},{"id":"jgk-3","nom":"Jungko-GX","extension":"Tonnerre Perdu","numero":"216/214"},{"id":"jgk-4","nom":"Jungko","extension":"Tempête Céleste","numero":"10/168"},{"id":"jgk-5","nom":"Jungko-EX","extension":"Origines Antiques","numero":"7/98"},{"id":"jgk-6","nom":"M-Jungko-EX","extension":"Origines Antiques","numero":"8/98"},{"id":"jgk-7","nom":"Lien Spirituel Jungko","extension":"Origines Antiques","numero":"80/98"},{"id":"jgk-8","nom":"Jungko-EX","extension":"Origines Antiques","numero":"84/98"},{"id":"jgk-9","nom":"M-Jungko-EX","extension":"Origines Antiques","numero":"85/98"},{"id":"jgk-10","nom":"Jungko","extension":"Primo-Choc","numero":"8/160"},{"id":"jgk-11","nom":"Jungko","extension":"Primo-Choc","numero":"9/160"},{"id":"jgk-12","nom":"Jungko","extension":"Glaciation Plasma","numero":"8/116"},{"id":"jgk-13","nom":"Jungko","extension":"Platine : Arceus","numero":"30/99"},{"id":"jgk-14","nom":"Jungko","extension":"Platine : Arceus","numero":"31/99"},{"id":"jgk-15","nom":"Jungko","extension":"Diamant & Perle : Tempête","numero":"10/100"},{"id":"jgk-16","nom":"Jungko","extension":"Diamant & Perle : Duels au Sommet","numero":"8/106"},{"id":"jgk-17","nom":"Jungko ex δ Espèces Delta","extension":"EX : Gardiens de Cristal","numero":"96/100"},{"id":"jgk-18","nom":"Jungko","extension":"EX : Émeraude","numero":"10/106"},{"id":"jgk-19","nom":"Jungko ex","extension":"EX : Team Magma VS Team Aqua","numero":"93/95"},{"id":"jgk-20","nom":"Jungko","extension":"EX : Rubis & Saphir","numero":"11/109"},{"id":"jgk-21","nom":"Jungko","extension":"EX : Rubis & Saphir","numero":"20/109"},{"id":"jgk-22","nom":"Jungko","extension":"POP 4","numero":"5/17"},{"id":"jgk-23","nom":"Jungko","extension":"POP 1","numero":"4/17"},{"id":"jgk-24","nom":"Jungko","extension":"Lamincards 2006","numero":"012/150"}];

/* ─────────── Correspondances forcées (extension app → id de set TCGdex) ───────────
   Prioritaires sur la détection automatique. Mettre null pour ignorer une extension. */
const OVERRIDES = {
  "Platine : Arceus": "pl4",                    // pl1 = Platine de base : mauvais set !
  "Diamant & Perle : Duels au Sommet": "dp4",   // dp1 = Diamant & Perle de base
  "Jumbo": null,                                 // pas de vrai équivalent TCGdex
};

/* ─────────── Utilitaires ─────────── */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// normalise un nom : minuscules, sans accents, sans ponctuation ni espaces
function norm(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// normalise un identifiant de carte : majuscules, zéros de tête retirés ("057"→"57", "TG06"→"TG6")
function normId(s) {
  return String(s || '').toUpperCase().replace(/0*(\d+)/g, '$1');
}

async function getJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} sur ${url}`);
  return resp.json();
}

/* ─────────── Correspondance extension app → set TCGdex ─────────── */
function matchSet(extName, denoms, sets) {
  const target = norm(extName);
  let candidates = [];
  for (const s of sets) {
    const n = norm(s.name);
    if (!n) continue;
    let score = 0;
    if (n === target) score = 3;
    else if (target.endsWith(n) || n.endsWith(target)) score = 2;
    else if (n.includes(target) || target.includes(n)) score = 1;
    if (score) candidates.push({ set: s, score });
  }
  if (!candidates.length) return null;
  // Vérification par le dénominateur des numéros (ex. "34/119" → set de 119 cartes)
  const numDenoms = denoms.filter((d) => /^\d+$/.test(d)).map(Number);
  if (numDenoms.length) {
    const verified = candidates.filter(({ set }) => {
      const off = set.cardCount?.official, tot = set.cardCount?.total;
      return numDenoms.some((d) => d === off || d === tot);
    });
    if (verified.length) candidates = verified.map((c) => ({ ...c, verified: true }));
  }
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  return { set: best.set, verified: !!best.verified };
}

/* ─────────── Programme principal ─────────── */
(async () => {
  // Mode utilitaire : node telecharge-images.js --list-sets [filtre]
  const li = process.argv.indexOf('--list-sets');
  if (li !== -1) {
    const filtre = norm(process.argv[li + 1] || '');
    const all = await getJSON(`${API}/sets`);
    for (const st of all) {
      if (!filtre || norm(st.name).includes(filtre) || st.id.includes(process.argv[li + 1] || '')) {
        console.log(`  ${st.id.padEnd(10)} ${String(st.cardCount?.official ?? '?').padStart(4)} cartes  ${st.name}`);
      }
    }
    return;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Récupération de la liste des sets TCGdex (FR)…');
  const sets = await getJSON(`${API}/sets`);
  console.log(`${sets.length} sets disponibles.\n`);

  // Regrouper les cartes par extension
  const byExt = {};
  for (const c of CARDS) (byExt[c.extension] ||= []).push(c);

  const report = { setsAssocies: {}, extensionsNonTrouvees: [], cartesSansScan: [], echecs: [] };
  let downloaded = 0, skipped = 0;

  for (const [extName, cards] of Object.entries(byExt)) {
    const denoms = cards.map((c) => (c.numero.split('/')[1] || '').trim());
    let match;
    if (Object.prototype.hasOwnProperty.call(OVERRIDES, extName)) {
      const forcedId = OVERRIDES[extName];
      if (forcedId === null) {
        console.log(`— « ${extName} » : ignorée volontairement (OVERRIDES) → repli CDN`);
        report.extensionsNonTrouvees.push({ extension: extName, cartes: cards.map((c) => c.id) });
        continue;
      }
      const forced = sets.find((st) => st.id === forcedId);
      if (!forced) {
        console.log(`✗ « ${extName} » : l'id forcé « ${forcedId} » n'existe pas chez TCGdex — utilise --list-sets pour trouver le bon`);
        report.echecs.push({ extension: extName, erreur: `override ${forcedId} introuvable` });
        continue;
      }
      match = { set: forced, verified: true, forced: true };
    } else {
      match = matchSet(extName, denoms, sets);
    }
    if (!match) {
      console.log(`✗ « ${extName} » : aucun set TCGdex correspondant (${cards.length} cartes → repli CDN)`);
      report.extensionsNonTrouvees.push({ extension: extName, cartes: cards.map((c) => c.id) });
      continue;
    }
    const flag = match.verified ? '✓' : '~ (non vérifié par le nombre de cartes)';
    console.log(`${flag} « ${extName} » → set TCGdex « ${match.set.name} » (${match.set.id})`);
    report.setsAssocies[extName] = match.set.id + (match.verified ? '' : ' (non vérifié)');

    // Récupérer les cartes du set une seule fois
    let setData;
    try {
      setData = await getJSON(`${API}/sets/${match.set.id}`);
    } catch (e) {
      console.log(`  Impossible de charger le set : ${e.message}`);
      report.echecs.push({ extension: extName, erreur: e.message });
      continue;
    }
    const byLocal = {};
    for (const sc of setData.cards) byLocal[normId(sc.localId)] = sc;

    for (const card of cards) {
      // Fichier déjà présent (jpg/webp/png) ? → on saute
      const existing = ['jpg', 'webp', 'png'].find((ext) =>
        fs.existsSync(path.join(OUTPUT_DIR, `${card.id}.${ext}`))
      );
      if (existing) { skipped++; continue; }

      const numerateur = normId((card.numero.split('/')[0] || '').trim());
      const tcgCard = byLocal[numerateur];
      if (!tcgCard || !tcgCard.image) {
        report.cartesSansScan.push({ id: card.id, nom: card.nom, extension: extName, numero: card.numero });
        continue;
      }

      let saved = false;
      for (const ext of ['jpg', 'webp', 'png']) {
        try {
          const resp = await fetch(`${tcgCard.image}/high.${ext}`);
          if (!resp.ok) continue;
          const buf = Buffer.from(await resp.arrayBuffer());
          fs.writeFileSync(path.join(OUTPUT_DIR, `${card.id}.${ext}`), buf);
          console.log(`  ✓ ${card.id}.${ext}  (${card.nom} — ${card.numero})`);
          downloaded++; saved = true;
          break;
        } catch (e) { /* on tente le format suivant */ }
      }
      if (!saved) report.echecs.push({ id: card.id, nom: card.nom, erreur: 'aucun format disponible' });
      await sleep(DELAY_MS);
    }
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'rapport-images.json'), JSON.stringify(report, null, 2));

  console.log('\n══════════ BILAN ══════════');
  console.log(`Téléchargées : ${downloaded}`);
  console.log(`Déjà présentes (sautées) : ${skipped}`);
  console.log(`Extensions absentes de TCGdex : ${report.extensionsNonTrouvees.length} (${report.extensionsNonTrouvees.map(e => e.extension).join(', ') || '—'})`);
  console.log(`Cartes sans scan dans un set trouvé : ${report.cartesSansScan.length}`);
  console.log(`Échecs réseau : ${report.echecs.length}`);
  console.log(`Détail complet : ${path.join(OUTPUT_DIR, 'rapport-images.json')}`);
  console.log('\nLes cartes non couvertes resteront affichées via le CDN pokecardex (repli automatique de l\'app),');
  console.log('et tu pourras les compléter une par une depuis l\'app (bouton « ⇧ Image → GitHub »).');
})();