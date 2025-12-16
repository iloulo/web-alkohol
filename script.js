// ======================================================
// Util: escape HTML
// ======================================================
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// ======================================================
// 1) Rumus kimia -> subskrip (standar) di konten HTML
// ======================================================
(function formatChemSpans() {
  const subMap = { "0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉" };
  const toSub = (txt) => txt.replace(/\d/g, d => subMap[d] || d);

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".chem").forEach(el => {
      const raw = el.textContent.trim();
      el.textContent = toSub(raw);
    });
  });
})();

// ======================================================
// 2) Mobile menu (nav utama)
// ======================================================
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

function setMenu(open) {
  if (!nav || !menuBtn) return;
  nav.classList.toggle("show", open);
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

menuBtn?.addEventListener("click", () => {
  const isOpen = nav.classList.contains("show");
  setMenu(!isOpen);
});

nav?.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a) setMenu(false);
});

document.addEventListener("click", (e) => {
  if (!nav || !menuBtn) return;
  if (!nav.classList.contains("show")) return;
  const clickedInside = nav.contains(e.target) || menuBtn.contains(e.target);
  if (!clickedInside) setMenu(false);
});

// ======================================================
// 3) Daftar Materi dropdown (pojok kanan)
// ======================================================
const toggleSubnav = document.getElementById("toggleSubnav");
const subnavMenu = document.getElementById("subnavMenu");

function closeSubnav() {
  subnavMenu?.classList.remove("show");
  toggleSubnav?.classList.remove("active");
  toggleSubnav?.setAttribute("aria-expanded", "false");
}

toggleSubnav?.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = subnavMenu.classList.toggle("show");
  toggleSubnav.classList.toggle("active", isOpen);
  toggleSubnav.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

subnavMenu?.addEventListener("click", (e) => {
  e.stopPropagation();
  const a = e.target.closest("a");
  if (a) closeSubnav();
});

document.addEventListener("click", (e) => {
  if (!subnavMenu || !toggleSubnav) return;
  const inside = subnavMenu.contains(e.target) || toggleSubnav.contains(e.target);
  if (!inside) closeSubnav();
});

// ======================================================
// 4) Smooth scroll with header offset
// ======================================================
(() => {
  function getHeaderOffset(){
    const header = document.querySelector(".siteHeader");
    if (!header) return 90;
    return header.getBoundingClientRect().height + 10;
  }

  function smoothToHash(hash){
    const el = document.querySelector(hash);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const hash = a.getAttribute("href");
    if (!hash || hash === "#") return;

    if (document.querySelector(hash)) {
      e.preventDefault();
      smoothToHash(hash);
      closeSubnav();
      setMenu(false);
    }
  });

  window.addEventListener("load", () => {
    if (location.hash && document.querySelector(location.hash)) {
      setTimeout(() => smoothToHash(location.hash), 80);
    }
  });
})();

// ======================================================
// 5) Quiz with feedback
// ======================================================
const quizData = [
  {
    q: "Gugus fungsi alkohol adalah...",
    options: ["—COOH", "—OH", "—CHO", "—O—"],
    answerIndex: 1,
    explainCorrect: "Benar. Alkohol memiliki gugus hidroksil (—OH) yang menempel pada atom karbon.",
    explainWrong: "Salah. Gugus alkohol adalah —OH. —COOH milik asam karboksilat, —CHO milik aldehid, dan —O— milik eter."
  },
  {
    q: "Propan-2-ol (isopropanol) termasuk alkohol...",
    options: ["primer (1°)", "sekunder (2°)", "tersier (3°)", "fenol"],
    answerIndex: 1,
    explainCorrect: "Benar. Karbon yang mengikat —OH terhubung ke dua karbon lain → alkohol sekunder (2°).",
    explainWrong: "Salah. Pada propan-2-ol, karbon —OH punya dua tetangga karbon (bukan 1 atau 3). Fenol adalah Ar—OH."
  },
  {
    q: "Oksidasi alkohol primer (1°) umumnya menghasilkan...",
    options: ["keton", "aldehid lalu asam karboksilat", "eter", "alkuna"],
    answerIndex: 1,
    explainCorrect: "Benar. Alkohol primer → aldehid, dan jika oksidasi kuat dapat lanjut menjadi asam karboksilat.",
    explainWrong: "Salah. Keton berasal dari oksidasi alkohol sekunder. Alkohol primer cenderung menghasilkan aldehid (dan bisa lanjut ke asam)."
  },
  {
    q: "Semakin panjang rantai karbon pada alkohol, kelarutan dalam air cenderung...",
    options: ["meningkat", "tetap", "menurun", "jadi tak terhingga"],
    answerIndex: 2,
    explainCorrect: "Benar. Rantai karbon bersifat nonpolar, jadi makin panjang rantainya → makin sulit larut dalam air.",
    explainWrong: "Salah. Walaupun —OH polar, rantai karbon yang panjang membuat bagian hidrofobik dominan sehingga kelarutan turun."
  }
];

const quizEl = document.getElementById("quiz");
const scoreEl = document.getElementById("score");

function renderQuiz() {
  if (!quizEl) return;
  quizEl.innerHTML = "";

  quizData.forEach((item, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "question";

    const title = document.createElement("div");
    title.className = "question__title";
    title.textContent = `${idx + 1}. ${item.q}`;

    const options = document.createElement("div");
    options.className = "options";

    item.options.forEach((opt, oidx) => {
      const label = document.createElement("label");
      label.className = "option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${idx}`;
      input.value = String(oidx);

      const span = document.createElement("span");
      span.textContent = opt;

      label.appendChild(input);
      label.appendChild(span);
      options.appendChild(label);
    });

    const feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.id = `feedback-${idx}`;
    feedback.textContent = "";

    wrap.appendChild(title);
    wrap.appendChild(options);
    wrap.appendChild(feedback);
    quizEl.appendChild(wrap);
  });

  if (scoreEl) scoreEl.textContent = "";
}

renderQuiz();

document.getElementById("checkQuiz")?.addEventListener("click", () => {
  let score = 0;

  quizData.forEach((item, idx) => {
    const picked = document.querySelector(`input[name="q${idx}"]:checked`);
    const feedback = document.getElementById(`feedback-${idx}`);

    if (!feedback) return;

    if (!picked) {
      feedback.textContent = "⚠ Belum dijawab.";
      feedback.className = "feedback warning";
      return;
    }

    if (Number(picked.value) === item.answerIndex) {
      score++;
      feedback.textContent = "✅ " + item.explainCorrect;
      feedback.className = "feedback correct";
    } else {
      const correctText = item.options[item.answerIndex];
      feedback.textContent = "❌ " + item.explainWrong + ` Jawaban yang benar: "${correctText}".`;
      feedback.className = "feedback wrong";
    }
  });

  if (scoreEl) scoreEl.textContent = `Skor akhir: ${score}/${quizData.length}`;
});

document.getElementById("resetQuiz")?.addEventListener("click", () => {
  renderQuiz();
});

// ======================================================
// 6) PubChem
// ======================================================
const pcQuery = document.getElementById("pcQuery");
const pcSearchBtn = document.getElementById("pcSearchBtn");
const pcOpenBtn = document.getElementById("pcOpenBtn");
const pcStatus = document.getElementById("pcStatus");
const pcResults = document.getElementById("pcResults");

function formatFormulaHTML(formula) {
  const safe = esc(formula || "—");
  return safe.replace(/(\d+)/g, "<sub>$1</sub>");
}

function normalizeQuery(q) {
  return q
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/["'"]/g, '"')
    .replace(/['‛']/g, "'")
    .replace(/[^\w\s\-\(\)\[\]=#\/\\+.]/g, "");
}

const QUERY_ALIASES = new Map([
  ["etanol", "ethanol"],
  ["metanol", "methanol"],
  ["alkohol etil", "ethanol"],
  ["alkohol metil", "methanol"],
  ["isopropanol", "propan-2-ol"],
  ["alkohol isopropil", "propan-2-ol"],
  ["isopropil alkohol", "propan-2-ol"],
  ["gliserol", "glycerol"],
  ["etilen glikol", "ethylene glycol"],
  ["propilen glikol", "propylene glycol"],
]);

function expandQueryCandidates(raw) {
  const q = normalizeQuery(raw);
  const candidates = [];
  if (q) candidates.push(q);
  if (QUERY_ALIASES.has(q)) candidates.push(QUERY_ALIASES.get(q));
  candidates.push(q.replace(/\s+/g, ""));
  candidates.push(q.replace(/\s+/g, "-"));
  return [...new Set(candidates)].filter(Boolean);
}

function looksLikeFormula(q) {
  const s = q.trim();
  if (!/^[A-Za-z0-9()]+$/.test(s)) return false;
  if (!/[A-Za-z]/.test(s) || !/\d/.test(s)) return false;
  return true;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function getCIDsFromQuery(raw) {
  const rawTrim = raw.trim();
  if (/^\d+$/.test(rawTrim)) return [Number(rawTrim)];

  const candidates = expandQueryCandidates(rawTrim);
  if (!candidates.length) return [];

  async function tryEndpoint(url) {
    try {
      const j = await fetchJson(url);
      return j?.IdentifierList?.CID || [];
    } catch (_) {
      return [];
    }
  }

  for (const q of candidates) {
    const cids = await tryEndpoint(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(q)}/cids/JSON`
    );
    if (cids.length) return cids;
  }

  for (const q of candidates) {
    if (looksLikeFormula(q)) {
      let cids = await tryEndpoint(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastformula/${encodeURIComponent(q)}/cids/JSON`
      );
      if (cids.length) return cids;

      cids = await tryEndpoint(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/formula/${encodeURIComponent(q)}/cids/JSON`
      );
      if (cids.length) return cids;
    }
  }

  for (const q of candidates) {
    if (/[=#\[\]\/\\]/.test(q)) {
      const cids = await tryEndpoint(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(q)}/cids/JSON`
      );
      if (cids.length) return cids;
    }
  }

  for (const q of candidates) {
    const cids = await tryEndpoint(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(q + " alcohol")}/cids/JSON`
    );
    if (cids.length) return cids;
  }

  return [];
}

function looksLikeAlcohol(record) {
  const iupac = (record.IUPACName || "").toLowerCase();
  const title = (record.Title || "").toLowerCase();
  const smiles = (record.IsomericSMILES || record.CanonicalSMILES || "").toLowerCase();

  const nameHint =
    iupac.includes("ol") ||
    title.includes("alcohol") ||
    ["ethanol","methanol","propanol","isopropanol","butanol","glycerol","ethylene glycol","propylene glycol"]
      .some(k => title.includes(k));

  const hasO = smiles.includes("o");
  const carbonyl = smiles.includes("c(=o") || smiles.includes("c=o");

  return nameHint || (hasO && !carbonyl);
}

function renderPcCards(items) {
  if (!pcResults || !pcStatus) return;
  pcResults.innerHTML = "";

  if (!items.length) {
    pcStatus.textContent = "Tidak ditemukan data dari PubChem untuk input ini. Coba ejaan lain / rumus tanpa spasi / CID angka.";
    return;
  }

  const cards = items.slice(0, 12).map((it) => {
    const cid = it.CID;
    const title = it.Title || it.IUPACName || `CID ${cid}`;
    const formulaHTML = formatFormulaHTML(it.MolecularFormula || "—");
    const mw = it.MolecularWeight ? Number(it.MolecularWeight).toFixed(3) : "—";
    const iupac = it.IUPACName || "—";

    const tag = looksLikeAlcohol(it) ? "Terindikasi: Alkohol" : "Kategori: Lain / Belum terdeteksi alkohol";
    const pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;

    return `
      <article class="pcCard">
        <h3>${esc(title)}</h3>
        <div class="pcMeta">
          <div><b>CID:</b> ${esc(cid)}</div>
          <div><b>Rumus:</b> ${formulaHTML}</div>
          <div><b>Mr:</b> ${esc(mw)}</div>
          <div><b>IUPAC:</b> ${esc(iupac)}</div>
        </div>
        <div class="badge">${esc(tag)}</div>
        <div class="pcActions">
          <a class="btn btn--primary" href="${pubchemUrl}" target="_blank" rel="noopener">Buka di PubChem</a>
        </div>
      </article>
    `;
  }).join("");

  pcResults.innerHTML = cards;
  pcStatus.textContent = `Menampilkan ${Math.min(items.length, 12)} hasil dari PubChem.`;
}

async function pubchemSearch(query) {
  const q = query.trim();
  if (!pcStatus || !pcResults || !pcOpenBtn) return;

  if (!q) {
    pcStatus.textContent = "Masukkan nama / rumus / CID dulu.";
    pcResults.innerHTML = "";
    return;
  }

  pcOpenBtn.href = `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(q)}`;
  pcStatus.textContent = "Mencari di PubChem…";
  pcResults.innerHTML = "";

  try {
    const cids = await getCIDsFromQuery(q);
    if (!cids.length) {
      pcStatus.textContent = "Tidak ditemukan CID. Coba: (1) nama umum, (2) IUPAC, (3) rumus tanpa spasi, (4) CID angka.";
      return;
    }

    const cidBatch = cids.slice(0, 30).join(",");
    const propUrl =
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cidBatch}` +
      `/property/Title,IUPACName,MolecularFormula,MolecularWeight,CanonicalSMILES,IsomericSMILES/JSON?ts=${Date.now()}`;

    const propJson = await fetchJson(propUrl);
    const props = propJson?.PropertyTable?.Properties || [];
    renderPcCards(props);
  } catch (err) {
    console.error(err);
    pcStatus.textContent = "Terjadi error saat mengakses PubChem. Coba refresh / cek koneksi internet.";
    pcResults.innerHTML = "";
  }
}

pcSearchBtn?.addEventListener("click", () => pubchemSearch(pcQuery.value));
pcQuery?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") pubchemSearch(pcQuery.value);
});

// ======================================================
// 7) 3D Viewer - DIPERBAIKI
// ======================================================
let viewer3d = null;
let spinning = false;
let currentModel = null;

const viewer3dStatus = document.getElementById("viewer3dStatus");
const molSelect = document.getElementById("molSelect");
const viewerDiv = document.getElementById("viewer3d");

const CID_TO_LOCAL_FILE = {
  "702":  "mols/ethanol_702.sdf",
  "887":  "mols/methanol_887.sdf",
  "3776": "mols/isopropanol_3776.sdf",
  "263":  "mols/butanol_263.sdf",
  "753":  "mols/glycerol_753.sdf",
  "174":  "mols/ethylene_glycol_174.sdf",
  "1030": "mols/propylene_glycol_1030.sdf"
};

function setViewerStatus(msg) {
  if (viewer3dStatus) viewer3dStatus.textContent = msg;
}

function getFormatFromPath(path) {
  const p = String(path || "").toLowerCase();
  if (p.endsWith(".mol")) return "mol";
  if (p.endsWith(".sdf")) return "sdf";
  return "sdf";
}

async function fetchText(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch gagal: ${res.status} (${path})`);
  return res.text();
}

function initViewer() {
  if (!viewerDiv) {
    setViewerStatus("❌ Elemen #viewer3d tidak ditemukan di HTML.");
    return false;
  }
  
  if (!window.$3Dmol) {
    setViewerStatus("❌ 3Dmol.js belum termuat (cek koneksi / CDN).");
    return false;
  }

  // Jangan bersihkan innerHTML jika viewer sudah ada
  if (!viewer3d) {
    viewerDiv.innerHTML = "";
    
    // Gunakan config yang lebih aman
    const config = { 
      backgroundColor: "black",
      antialias: true,
      disableFog: true
    };
    
    try {
      viewer3d = window.$3Dmol.createViewer(viewerDiv, config);
      
      // Pastikan viewer ter-render
      setTimeout(() => {
        if (viewer3d) {
          viewer3d.resize();
          viewer3d.render();
        }
      }, 100);
      
      setViewerStatus("✅ Viewer 3D siap.");
      return true;
    } catch (err) {
      console.error("Error creating viewer:", err);
      setViewerStatus("❌ Gagal membuat viewer 3D.");
      return false;
    }
  }
  
  return true;
}

function highlightOH(model) {
  if (!viewer3d || !model) return 0;
  
  const atoms = model.selectedAtoms({});
  let countO = 0;

  viewer3d.removeAllLabels();

  atoms.forEach(a => {
    if (a.elem === "O") {
      countO++;

      // Perbesar O untuk highlight
      viewer3d.setStyle({ index: a.index }, {
        stick: { radius: 0.32, color: "red" },
        sphere: { scale: 0.60, color: "red" }
      });

      // Tambah label —OH
      try {
        viewer3d.addLabel("—OH", {
          position: { x: a.x, y: a.y, z: a.z },
          backgroundColor: "rgba(255,100,100,0.4)",
          fontColor: "white",
          fontSize: 14,
          borderThickness: 1,
          backgroundOpacity: 0.4
        });
      } catch (e) {
        console.warn("Label gagal ditambahkan:", e);
      }
    }
  });

  return countO;
}

async function loadMolecule(cid) {
  const path = CID_TO_LOCAL_FILE[cid];
  if (!path) {
    setViewerStatus("❌ File tidak ditemukan di mapping CID.");
    return;
  }

  // Pastikan viewer sudah diinisialisasi
  if (!initViewer()) {
    return;
  }

  try {
    setViewerStatus("⏳ Memuat struktur 3D dari file lokal…");
    
    // Bersihkan model sebelumnya
    if (currentModel) {
      viewer3d.removeAllModels();
      currentModel = null;
    }
    
    viewer3d.clear();

    const text = await fetchText(path);
    const fmt = getFormatFromPath(path);

    // Tambahkan model baru
    currentModel = viewer3d.addModel(text, fmt);

    // BALL & STICK style
    viewer3d.setStyle({}, {
      stick: { radius: 0.18, color: "spectrum" },
      sphere: { scale: 0.35 }
    });

    // Highlight gugus —OH
    const countO = highlightOH(currentModel);

    // Zoom dan render
    viewer3d.zoomTo();
    viewer3d.render();

    // Resize untuk memastikan canvas fit
    setTimeout(() => {
      if (viewer3d) {
        viewer3d.resize();
        viewer3d.render();
      }
    }, 50);

    // Set spinning jika sedang aktif
    if (spinning) {
      viewer3d.spin(true);
    }

    setViewerStatus(`✅ Loaded: ${path} (format: ${fmt}). Ditemukan ${countO} atom O (disorot).`);
  } catch (err) {
    console.error("Error loading molecule:", err);
    setViewerStatus("❌ Gagal memuat 3D. Pastikan Live Server (127.0.0.1:5500) dan nama file di mols/ persis sama.");
  }
}

// Event listeners untuk kontrol
document.getElementById("spinBtn")?.addEventListener("click", () => {
  if (!viewer3d) return;
  
  spinning = !spinning;
  viewer3d.spin(spinning);
  setViewerStatus(spinning ? "🔄 Spin: ON" : "⏸ Spin: OFF");
});

document.getElementById("resetViewBtn")?.addEventListener("click", () => {
  if (!viewer3d) return;
  
  viewer3d.zoomTo();
  viewer3d.render();
  setViewerStatus("🔄 View di-reset (zoomTo).");
});

molSelect?.addEventListener("change", (e) => {
  loadMolecule(e.target.value);
});

// Resize handler
let resizeTimeout;
window.addEventListener("resize", () => {
  if (!viewer3d) return;
  
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    try {
      viewer3d.resize();
      viewer3d.render();
    } catch (e) {
      console.warn("Resize error:", e);
    }
  }, 100);
});

// Init saat page load
window.addEventListener("load", () => {
  // Tunggu sebentar untuk memastikan 3Dmol.js loaded
  setTimeout(() => {
    if (initViewer()) {
      const initialCID = molSelect?.value || "3776";
      loadMolecule(initialCID);
    }
  }, 200);
});

// ======================================================
// 8) Subtle Scroll-Reveal (non-destructive)
// ======================================================
(() => {
  const targets = document.querySelectorAll(
    ".section .card, .section .panel, .section .contentCard, .section .caseCard, .section .pcCard, .section .question, .videoWrap, .tableWrap, .note"
  );

  targets.forEach(el => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("show");
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

  targets.forEach(el => io.observe(el));
})();
// ======================================================
// 9) Interactive tables: Search + Sort (non-destructive)
// ======================================================
(() => {
  const tables = document.querySelectorAll(".tableWrap .dataTable");
  if (!tables.length) return;

  function getCellText(td) {
    return (td?.textContent || "").trim().toLowerCase();
  }

  function isNumericLike(s) {
    // contoh: 123, 12.3, 12,3
    const t = String(s).trim().replace(/\./g, "").replace(",", ".");
    return t !== "" && !Number.isNaN(Number(t));
  }

  function toNumber(s) {
    return Number(String(s).trim().replace(/\./g, "").replace(",", "."));
  }

  tables.forEach((table) => {
    const wrap = table.closest(".tableWrap");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    if (!wrap || !thead || !tbody) return;

    // ---- Build controls (search box) without editing HTML file
    const controls = document.createElement("div");
    controls.className = "tableControls";

    const search = document.createElement("input");
    search.className = "tableSearch";
    search.type = "search";
    search.placeholder = "Cari di tabel… (contoh: etanol / toksik / diol)";

    const hint = document.createElement("div");
    hint.className = "tableHint";
    hint.textContent = "Tip: klik judul kolom untuk sort.";

    controls.appendChild(search);
    controls.appendChild(hint);

    // Insert controls before wrap (biar rapi)
    wrap.parentNode.insertBefore(controls, wrap);

    // ---- Search filtering
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      const rows = [...tbody.querySelectorAll("tr")];

      rows.forEach((tr) => {
        const rowText = tr.textContent.toLowerCase();
        tr.style.display = q === "" || rowText.includes(q) ? "" : "none";
      });
    });

    // ---- Sortable headers
    const headers = [...thead.querySelectorAll("th")];
    let sortState = { col: -1, dir: 1 }; // dir: 1 asc, -1 desc

    headers.forEach((th, idx) => {
      th.classList.add("sortable");

      // indicator
      const indicator = document.createElement("span");
      indicator.className = "sortIndicator";
      indicator.textContent = "";
      th.appendChild(indicator);

      th.addEventListener("click", () => {
        const rows = [...tbody.querySelectorAll("tr")].filter(tr => tr.style.display !== "none");

        // toggle direction if same column
        if (sortState.col === idx) sortState.dir *= -1;
        else sortState = { col: idx, dir: 1 };

        // reset indicators
        headers.forEach(h => {
          const s = h.querySelector(".sortIndicator");
          if (s) s.textContent = "";
        });
        indicator.textContent = sortState.dir === 1 ? "▲" : "▼";

        rows.sort((a, b) => {
          const aTd = a.children[idx];
          const bTd = b.children[idx];
          const aText = (aTd?.textContent || "").trim();
          const bText = (bTd?.textContent || "").trim();

          const aNum = isNumericLike(aText);
          const bNum = isNumericLike(bText);

          if (aNum && bNum) {
            return (toNumber(aText) - toNumber(bText)) * sortState.dir;
          }
          return aText.localeCompare(bText, "id", { sensitivity: "base" }) * sortState.dir;
        });

        // re-append sorted rows
        rows.forEach(r => tbody.appendChild(r));
      });
    });
  });
})();
// ======================================================
// Mini Game: Klasifikasi Alkohol Cepat
// ======================================================
(() => {
  const correctAnswer = "2"; // propan-2-ol → alkohol sekunder
  const feedback = document.getElementById("mgFeedback");

  document.querySelectorAll(".miniGame__options button")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.answer === correctAnswer) {
          feedback.textContent = "✅ Benar! Ini alkohol sekunder (2°).";
          feedback.style.color = "#22c55e";
        } else {
          feedback.textContent =
            "❌ Salah. Hitung jumlah karbon yang terikat pada karbon –OH.";
          feedback.style.color = "#f87171";
        }
      });
    });
})();
// ======================================================
// Mini Game (Mode Sulit + Timer + Streak)
// Aturan timer:
// - Soal 1: timer tidak berjalan
// - Timer mulai aktif setelah peserta menjawab soal 1
// ======================================================
(() => {
  const root = document.getElementById("miniGame");
  if (!root) return;

  const qEl = document.getElementById("mgQuestion");
  const optEl = document.getElementById("mgOptions");
  const fbEl = document.getElementById("mgFeedback");
  const nextBtn = document.getElementById("mgNext");
  const scoreEl = document.getElementById("mgScore");
  const timerEl = document.getElementById("mgTimer");
  const streakEl = document.getElementById("mgStreak");

  const CHOICES = [
    { key: "1", label: "1°" },
    { key: "2", label: "2°" },
    { key: "3", label: "3°" },
    { key: "phenol", label: "Fenol" },
    { key: "polyol", label: "Poliol" }
  ];

  // Bank soal “lebih susah” (ada jebakan)
  const BANK = [
    { q: "tert-Butanol / 2-methylpropan-2-ol  ((CH₃)₃COH)", a: "3",
      exp: "Karbon –OH terhubung ke 3 karbon lain → alkohol tersier (3°)." },
    { q: "Benzyl alcohol  (C₆H₅–CH₂–OH)", a: "1",
      exp: "–OH menempel pada CH₂; karbon –OH hanya punya 1 tetangga karbon → 1°." },
    { q: "Fenol  (C₆H₅–OH)", a: "phenol",
      exp: "–OH langsung pada cincin aromatik → fenol (bukan alkohol alifatik)." },
    { q: "2-Butanol  (CH₃–CH(OH)–CH₂–CH₃)", a: "2",
      exp: "Karbon –OH terhubung ke 2 karbon lain → alkohol sekunder (2°)." },
    { q: "Neopentyl alcohol  ((CH₃)₃C–CH₂–OH)", a: "1",
      exp: "Walau bercabang besar, –OH tetap di CH₂ → 1°." },
    { q: "Etilen glikol  (HO–CH₂–CH₂–OH)", a: "polyol",
      exp: "Diol (2 gugus –OH) → poliol." },
    { q: "Gliserol  (HO–CH₂–CH(OH)–CH₂–OH)", a: "polyol",
      exp: "Triol (3 gugus –OH) → poliol." }
  ];

  const ROUND_SECONDS = 15;

  // ---- State
  let score = 0;
  let total = 0;
  let streak = 0;

  let current = null;
  let locked = false;

  let timer = null;
  let t = ROUND_SECONDS;

  let roundNo = 0;           // 1,2,3,...
  let timerEnabled = false;  // baru true setelah soal 1 dijawab

  function pickQuestion() {
    let next;
    do {
      next = BANK[Math.floor(Math.random() * BANK.length)];
    } while (current && next.q === current.q && BANK.length > 1);
    return next;
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function setTimerUI(text) {
    if (!timerEl) return;
    timerEl.textContent = text;
    timerEl.classList.toggle("is-urgent", timerEnabled && typeof t === "number" && t <= 5);
  }

  function setStreakUI() {
    if (!streakEl) return;
    streakEl.textContent = `🔥 Streak ${streak}`;
    streakEl.classList.toggle("is-hot", streak >= 3);
  }

  function updateHUD() {
    if (scoreEl) scoreEl.textContent = `Skor: ${score}/${total}`;
    setStreakUI();

    if (!timerEnabled && roundNo === 1) {
      setTimerUI("⏱ mulai setelah soal 1");
    } else if (timerEnabled && !locked) {
      setTimerUI(`⏱ ${t}s`);
    }
  }

  function startTimer() {
    stopTimer();
    t = ROUND_SECONDS;

    // kalau timer belum diaktifkan (masih soal 1), jangan jalan
    if (!timerEnabled) {
      updateHUD();
      return;
    }

    setTimerUI(`⏱ ${t}s`);

    timer = setInterval(() => {
      if (locked) return;
      t -= 1;
      setTimerUI(`⏱ ${t}s`);

      if (t <= 5 && timerEl) timerEl.classList.add("is-urgent");
      if (t <= 0) {
        locked = true;
        total++;
        streak = 0;
        stopTimer();

        fbEl.style.color = "#f87171";
        fbEl.textContent = "⏰ Waktu habis! Streak reset. Klik “Soal Berikutnya”.";

        updateHUD();
      }
    }, 1000);
  }

  function renderChoices() {
    optEl.innerHTML = "";
    CHOICES.forEach(c => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = c.label;
      btn.dataset.key = c.key;
      btn.addEventListener("click", () => answer(c.key));
      optEl.appendChild(btn);
    });
  }

  function newRound() {
    locked = false;
    fbEl.textContent = "";
    fbEl.style.color = "rgba(255,255,255,.75)";

    current = pickQuestion();
    qEl.textContent = current.q;

    renderChoices();

    roundNo++;

    // Soal 1: timer tidak jalan
    if (roundNo === 1 && !timerEnabled) {
      stopTimer();
      t = ROUND_SECONDS;
      setTimerUI("⏱ mulai setelah soal 1");
    } else {
      startTimer();
    }

    updateHUD();
  }

  function answer(key) {
    if (locked) return;
    locked = true;
    stopTimer();
    total++;

    const correct = key === current.a;

    if (correct) {
      score++;
      streak++;
      fbEl.style.color = "#22c55e";
      // Soal 1 tidak pakai waktu, jadi tidak usah tampilkan “detik”
      fbEl.textContent = `✅ Benar. ${current.exp}`;
    } else {
      streak = 0;
      fbEl.style.color = "#f87171";
      fbEl.textContent = `❌ Salah. ${current.exp}`;
    }

    // Setelah peserta menjawab soal 1 → aktifkan timer untuk soal berikutnya
    if (!timerEnabled) timerEnabled = true;

    updateHUD();
  }

  nextBtn?.addEventListener("click", () => {
    newRound();
  });

  // start
  newRound();
})();
