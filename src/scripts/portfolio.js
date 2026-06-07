// Move overlays to body to avoid nested scroll containers
document.querySelectorAll('.detail-overlay').forEach(function(el){
  document.body.appendChild(el);
});

function lockPageScroll(lock){
  document.documentElement.classList.toggle('detail-open',lock);
  document.documentElement.style.overflow=lock?'hidden':'';
  document.body.style.overflow=lock?'hidden':'';
}

// Open detail
function openDetail(id){
  const el=document.getElementById('det-'+id);
  if(!el) return;
  document.querySelectorAll('.detail-overlay.open').forEach(function(o){ o.classList.remove('open'); });
  el.classList.add('open');
  lockPageScroll(true);
  el.scrollTop=0;
}
function closeDetail(id){
  const el=document.getElementById('det-'+id);
  if(!el) return;
  el.classList.remove('open');
  if(!document.querySelector('.detail-overlay.open')) lockPageScroll(false);
}

// Detail IDs that actually exist in DOM
const detailIds=[...document.querySelectorAll('.detail-overlay[id^="det-"]')]
  .map(el=>el.id.replace('det-',''));

// Card clicks (only for projects with detail modal)
document.querySelectorAll('.pcard').forEach(card=>{
  const projectId=card.dataset.project;
  if(!detailIds.includes(projectId)) return;
  card.addEventListener('click',(e)=>{
    if(e.target.closest('a.pcard-btn--demo')) return;
    openDetail(projectId);
  });
});

// Close buttons
detailIds.forEach(id=>{
  document.getElementById('close-'+id)?.addEventListener('click',()=>closeDetail(id));
});

// ESC key
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') detailIds.forEach(id=>closeDetail(id));
});

// Filter
document.querySelectorAll('.ftab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.ftab').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    const f=btn.dataset.f;
    document.querySelectorAll('.pcard').forEach(c=>{
      const cats=c.dataset.cat||'';
      c.style.display=(f==='all'||cats.includes(f))?'':'none';
    });
  });
});

// Reveal
const portfolioRo=new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');portfolioRo.unobserve(e.target);}});},{threshold:0.1});
document.querySelectorAll('.rv').forEach(el=>portfolioRo.observe(el));

// Featured video play/pause
document.querySelectorAll('.dvid[data-video]').forEach(wrap=>{
  const video=wrap.querySelector('video');
  if(!video) return;
  wrap.addEventListener('click',()=>{
    if(video.paused){
      document.querySelectorAll('.dvid[data-video] video').forEach(v=>{if(v!==video&&!v.paused){v.pause();v.closest('.dvid')?.classList.remove('playing');}});
      video.play();
      wrap.classList.add('playing');
    }else{
      video.pause();
      wrap.classList.remove('playing');
    }
  });
  video.addEventListener('ended',()=>wrap.classList.remove('playing'));
});

document.querySelectorAll('[data-close-detail]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.closeDetail;
    const scrollTo = btn.dataset.scrollTo;
    closeDetail(id);
    if (!scrollTo) return;
    requestAnimationFrame(() => {
      const target = document.getElementById(scrollTo);
      if (target?.classList.contains('pcard') && target.dataset.project) {
        const nextId = target.dataset.project;
        if (detailIds.includes(nextId)) {
          openDetail(nextId);
          return;
        }
      }
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
});