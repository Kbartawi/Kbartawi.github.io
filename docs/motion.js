(function(){
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var root=document.documentElement;root.classList.add('motion');
  var cards=[].slice.call(document.querySelectorAll('.project-card,.about-section,.section-bar'));
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  cards.forEach(function(c,i){c.style.transitionDelay=(i%2?90:0)+'ms';io.observe(c);});
  var mocks=[].slice.call(document.querySelectorAll('.mock')),h1=document.querySelector('.hero h1'),line=document.querySelector('.founder-line'),tick=false;
  function frame(){tick=false;var vh=innerHeight;
    mocks.forEach(function(m){var r=m.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;var p=(r.top+r.height/2-vh/2)/vh;m.style.setProperty('--py',(p*-14).toFixed(1)+'px');});
    var y=Math.min(scrollY,600);if(h1)h1.style.transform='translate3d(0,'+(y*.12).toFixed(1)+'px,0)';if(line)line.style.transform='translate3d(0,'+(y*.06).toFixed(1)+'px,0)';}
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(frame);}},{passive:true});frame();
})();
