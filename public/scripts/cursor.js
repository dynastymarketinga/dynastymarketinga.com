(function initCursor(){
  if(window.__dynastyCursorInit) return;
  window.__dynastyCursorInit = true;
  let mx=0,my=0,rx=0,ry=0;
  function activeCursor(){
    const page = document.querySelector('.page.active');
    return {
      cur: page ? page.querySelector('.cur') : document.getElementById('cur'),
      ring: page ? page.querySelector('.cur-ring') : document.getElementById('curRing')
    };
  }
  document.addEventListener('mousemove',e=>{
    mx=e.clientX; my=e.clientY;
    const {cur} = activeCursor();
    if(cur){ cur.style.left=mx+'px'; cur.style.top=my+'px'; }
  });
  (function animR(){
    const {cur,ring} = activeCursor();
    rx+=(mx-rx)*0.1; ry+=(my-ry)*0.1;
    if(cur){ cur.style.left=mx+'px'; cur.style.top=my+'px'; }
    if(ring){ ring.style.left=rx+'px'; ring.style.top=ry+'px'; }
    requestAnimationFrame(animR);
  })();
  document.querySelectorAll('a,button,.wi,.tcard,.svc-row,.cli,.pcard,input,textarea,select,.check-label,.budget-label').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('cur-hover','hov'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('cur-hover','hov'));
  });
})();
