const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const save = (k,v) => { try{ localStorage.setItem(k,v) }catch(e){} };
const load = k => { try{ return localStorage.getItem(k) }catch(e){ return null } };
let lang = load('ss_lang');
const tr = k => (T[lang] && T[lang][k]) || T.en[k] || '';

function applyLang(l){
  lang = l; save('ss_lang', l);
  document.documentElement.lang = l;
  $$('[data-i18n]').forEach(el => { const v = tr(el.dataset.i18n); if(v) el.textContent = v; });
  $('#langSel').value = l;
  document.title = tr('brand') + ' | ' + tr(document.body.dataset.title || 'brand_s');
  renderSim(); renderVideos();
}
function applyTheme(t){
  document.documentElement.dataset.theme = t; save('ss_theme', t);
  $('#themeBtn').textContent = t === 'dark' ? '☀️' : '🌙';
}
function showToast(){
  const t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role','dialog');
  t.innerHTML = '<h3>Choose your language · भाषा चुनें · भाषा निवडा</h3><p>Select your preferred language for this website.</p><div class="row"><button class="btn" data-l="en">English</button><button class="btn" data-l="hi">हिन्दी</button><button class="btn" data-l="mr">मराठी</button></div>';
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  $$('button', t).forEach(b => b.onclick = () => { applyLang(b.dataset.l); t.classList.remove('show'); setTimeout(() => t.remove(), 450); });
}
/* videos */
const FEATURED = ['uMkOphesrqI','XBkzBrXlle0','S7xHpU5hCZI'];
function renderVideos(){
  const f = $('#featured');
  if(f && !f.dataset.done){
    f.dataset.done = 1;
    f.innerHTML = FEATURED.map((id,i) => `<div class="vid rv"><div class="fr"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="video ${i+1}" loading="lazy" allowfullscreen></iframe></div><div class="m"><h3 data-i18n="v${i+1}_t"></h3><small data-i18n="v${i+1}_d"></small></div></div>`).join('');
    $$('.rv', f).forEach(observe);
  }
  const r = $('#regional');
  if(r && !r.dataset.done){
    r.dataset.done = 1;
    r.innerHTML = REGIONAL.map(v => {
      const top = v.id
        ? `<div class="fr"><iframe src="https://www.youtube-nocookie.com/embed/${v.id}" title="${v.r}" loading="lazy" allowfullscreen></iframe></div>`
        : `<a class="lk" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(v.q)}">▶<span data-i18n="watch"></span></a>`;
      return `<div class="vid rv">${top}<div class="m"><h3>${v.r}</h3><small>${v.q}</small></div></div>`;
    }).join('');
    $$('.rv', r).forEach(observe);
  }
  $$('[data-i18n]', document).forEach(el => { const v = tr(el.dataset.i18n); if(v) el.textContent = v; });
}
/* reveal */
let io;
function observe(el){ if(io) io.observe(el); else el.classList.add('in'); }
/* checklist */
function initChecklist(){
  const box = $('#checklist'); if(!box) return;
  const saved = JSON.parse(load('ss_ck') || '[]');
  const boxes = $$('input', box);
  const upd = () => {
    const n = boxes.filter(b => b.checked).length;
    $('#progBar').style.width = (n / boxes.length * 100) + '%';
    $('#progNum').textContent = n + '/' + boxes.length;
    save('ss_ck', JSON.stringify(boxes.map((b,i) => b.checked ? i : -1).filter(i => i >= 0)));
  };
  boxes.forEach((b,i) => { b.checked = saved.includes(i); b.onchange = upd; });
  upd();
}
/* simulator */
let sim = {i:0, score:0, answered:false, done:false};
function renderSim(){
  const box = $('#sim'); if(!box) return;
  if(sim.done){
    const g = sim.score >= SIM.length - 1 ? 'sim_g3' : sim.score >= SIM.length / 2 ? 'sim_g2' : 'sim_g1';
    box.innerHTML = `<div class="res"><h3>${tr('sim_done')}</h3><b>${sim.score} ${tr('sim_of')} ${SIM.length}</b><p>${tr(g)}</p><button class="btn" id="again" style="margin-top:16px">${tr('sim_again')}</button></div>`;
    $('#again').onclick = () => { sim = {i:0, score:0, answered:false, done:false}; renderSim(); };
    return;
  }
  const q = SIM[sim.i];
  box.innerHTML = `<div class="top"><span>${sim.i+1} ${tr('sim_of')} ${SIM.length}</span><span>${tr('sim_score')}: ${sim.score}</span></div>
   <div class="msg"><small>${q.from[lang]}</small><p>${q.m[lang]}</p></div>
   <div class="row"><button class="btn red" data-a="1">🚩 ${tr('sim_scam')}</button><button class="btn grn" data-a="0">✅ ${tr('sim_safe')}</button></div><div id="fb"></div>`;
  if(sim.answered) showFb(sim.last);
  $$('[data-a]', box).forEach(b => b.onclick = () => {
    if(sim.answered) return;
    const ok = (b.dataset.a === '1') === q.a;
    if(ok) sim.score++;
    sim.answered = true; sim.last = ok; showFb(ok); $('.top span:last-child', box).textContent = tr('sim_score') + ': ' + sim.score;
  });
}
function showFb(ok){
  const q = SIM[sim.i];
  $('#fb').innerHTML = `<div class="fb ${ok?'ok':'no'}"><b>${ok?tr('sim_right'):tr('sim_wrong')}</b> ${q.w[lang]}<br><button class="btn" id="nx">${tr('sim_next')}</button></div>`;
  $('#nx').onclick = () => { sim.answered = false; if(sim.i + 1 >= SIM.length) sim.done = true; else sim.i++; renderSim(); };
}
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js');
  if('IntersectionObserver' in window) io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.12});
  $$('.rv').forEach(observe);
  applyTheme(load('ss_theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  initChecklist();
  applyLang(lang || 'en');
  $('#langSel').onchange = e => applyLang(e.target.value);
  $('#themeBtn').onclick = () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  $('#menuBtn').onclick = () => $('nav').classList.toggle('open');
  $$('.img img').forEach(im => { const f = () => im.parentElement.classList.add('failed'); im.onerror = f; if(im.complete && !im.naturalWidth) f(); });
  const top = $('#top'); window.addEventListener('scroll', () => top.classList.toggle('on', scrollY > 500));
  top.onclick = () => scrollTo({top:0, behavior:'smooth'});
  if(!lang) setTimeout(showToast, 700);
});
