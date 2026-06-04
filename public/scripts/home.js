// Nav sticky
const nav=document.getElementById('nav');
if(nav){
  window.addEventListener('scroll',()=>{
    nav.classList.toggle('stuck',scrollY>50);
  });
}

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
    p.style.transform = `${base} translate(${cx*d}px,${cy*d*0.6}px)`;
  });
});

document.querySelectorAll('.svc-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `translateY(-16px) rotateX(${-y*10}deg) rotateY(${x*10}deg) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

window.addEventListener('scroll',()=>{
  document.querySelectorAll('.plx').forEach(el=>{
    const spd=parseFloat(el.dataset.spd)||0.25;
    el.style.transform=`translateY(${scrollY*spd}px)`;
  });
});