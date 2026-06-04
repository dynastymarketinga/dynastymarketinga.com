import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const legacy = fs.readFileSync(path.join(root, 'index.legacy.html'), 'utf8');

function between(startMarker, endMarker, from = 0) {
  const s = legacy.indexOf(startMarker, from);
  const e = legacy.indexOf(endMarker, s);
  if (s === -1 || e === -1) throw new Error(`Markers not found: ${startMarker}`);
  return legacy.slice(s + startMarker.length, e).trim();
}

const cssMain = between('<style>\n', '</style>', 0);
const cssPortfolioStart = legacy.indexOf('<style>', legacy.indexOf('</style>') + 1);
const cssPortfolio = legacy.slice(
  legacy.indexOf('\n', cssPortfolioStart) + 1,
  legacy.indexOf('</style>', cssPortfolioStart)
).trim();
const cssResponsive = between('/* Global responsive hardening */', '</style>', legacy.lastIndexOf('/* Global responsive hardening */'));

const homeBlock = between('<div class="page active" id="page-home">', '<script>\n// Custom cursor', 0);
const homeScripts = between('// Custom cursor (single init for all pages)', '</script>', legacy.indexOf('// Custom cursor'));

let portfolioBlock = between('<div class="page" id="page-portfolio">', '<script>\n// Mover overlays', 0);
portfolioBlock += '\n' + between('<!-- DETAIL: Carolina Real Estate -->', '<script>\n// Mover overlays', legacy.indexOf('<!-- DETAIL: Carolina Real Estate -->'));

const portfolioScripts = between('// Mover overlays al body', '</script>', legacy.indexOf('// Mover overlays'));

const contactBlock = between('<div class="page" id="page-contact">', '<script>\n// Contact page', 0);
const contactScripts = between('// Contact page — scoped scripts', '</script>', legacy.indexOf('// Contact page'));

function fixLinks(html) {
  return html
    .replace(/onclick="showPage\('home'\);return false;"/g, '')
    .replace(/onclick="showPage\('portfolio'\);return false;"/g, '')
    .replace(/onclick="showPage\('contact'\);return false;"/g, '')
    .replace(/href="#home"/g, 'href="/"')
    .replace(/href="#portfolio"/g, 'href="/portfolio"')
    .replace(/href="#contact"/g, 'href="/contact"')
    .replace(/href="contact\.html"/g, 'href="/contact"')
    .replace(/href="index\.html"/g, 'href="/"')
    .replace(/onclick="closeDetail\('([^']+)'\)"/g, 'data-close-detail="$1"');
}

const outDir = path.join(root, 'src');
fs.mkdirSync(path.join(outDir, 'styles'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'scripts'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'partials'), { recursive: true });

fs.writeFileSync(path.join(outDir, 'styles', 'tokens.css'), cssMain);
fs.writeFileSync(path.join(outDir, 'styles', 'portfolio.css'), cssPortfolio);
fs.writeFileSync(path.join(outDir, 'styles', 'responsive.css'), cssResponsive);

fs.writeFileSync(path.join(outDir, 'partials', 'home.html'), fixLinks(homeBlock));
fs.writeFileSync(path.join(outDir, 'partials', 'portfolio.html'), fixLinks(portfolioBlock));
fs.writeFileSync(path.join(outDir, 'partials', 'contact.html'), fixLinks(contactBlock));

const cursorScript = homeScripts.trim();
const globalTail = `
// Nav sticky
const nav=document.getElementById('nav');
if(nav){
  window.addEventListener('scroll',()=>{
    nav.classList.toggle('stuck',scrollY>50);
  });
}
`;

fs.writeFileSync(
  path.join(outDir, 'scripts', 'cursor.js'),
  cursorScript.replace(/document\.querySelectorAll\('a,button[^']+'\)/, "document.querySelectorAll('a,button,.wi,.tcard,.svc-row,.cli,.pcard,input,textarea,select,.check-label,.budget-label')")
);

fs.writeFileSync(
  path.join(outDir, 'scripts', 'home.js'),
  `
${globalTail}
const rvEls=document.querySelectorAll('.rv,.rv-left,.rv-right');
const rvObs=new IntersectionObserver(en=>{
  en.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');rvObs.unobserve(e.target);}});
},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
rvEls.forEach(el=>rvObs.observe(el));

function countUp(el,target,dur){
  let s=0;const inc=target/(dur/16);
  const t=setInterval(()=>{
    s+=inc;if(s>=target){s=target;clearInterval(t);}
    el.textContent=Math.round(s);
  },16);
}
const cuObs=new IntersectionObserver(en=>{
  en.forEach(e=>{
    if(e.isIntersecting){
      countUp(e.target,parseInt(e.target.dataset.t),1800);
      cuObs.unobserve(e.target);
    }
  });
},{threshold:0.5});
document.querySelectorAll('.cu').forEach(el=>cuObs.observe(el));

document.addEventListener('mousemove', e => {
  const pieces = document.querySelectorAll('.mb-piece');
  const cx = e.clientX / window.innerWidth - 0.5;
  const cy = e.clientY / window.innerHeight - 0.5;
  pieces.forEach((p, i) => {
    const d = (i % 2 === 0 ? 1 : -1) * (8 + i * 2);
    const base = ['rotate(-2.5deg)','rotate(1.8deg)','rotate(2deg)','rotate(-1.4deg)','rotate(3deg)','rotate(-3.5deg)'][i] || '';
    p.style.transform = \`\${base} translate(\${cx*d}px,\${cy*d*0.6}px)\`;
  });
});

document.querySelectorAll('.svc-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = \`translateY(-16px) rotateX(\${-y*10}deg) rotateY(\${x*10}deg) scale(1.02)\`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

window.addEventListener('scroll',()=>{
  document.querySelectorAll('.plx').forEach(el=>{
    const spd=parseFloat(el.dataset.spd)||0.25;
    el.style.transform=\`translateY(\${scrollY*spd}px)\`;
  });
});
`.trim()
);

fs.writeFileSync(
  path.join(outDir, 'scripts', 'portfolio.js'),
  `
${portfolioScripts.trim()}

document.querySelectorAll('[data-close-detail]').forEach(btn => {
  btn.addEventListener('click', () => closeDetail(btn.dataset.closeDetail));
});
`.trim()
);

fs.writeFileSync(
  path.join(outDir, 'scripts', 'contact.js'),
  contactScripts.trim()
);

console.log('Extracted legacy assets to src/');
