document.documentElement.classList.add('js');

const mobileCss=document.createElement('link');
mobileCss.rel='stylesheet';
mobileCss.href='/assets/mobile.css?v=1';
document.head.appendChild(mobileCss);

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

function installMobileNavigation(){
  const top=document.querySelector('.top');
  const topin=top?.querySelector('.topin');
  const nav=top?.querySelector('.nav');
  if(!top||!topin||!nav||topin.querySelector('.mobile-menu-toggle')) return;

  const toggle=document.createElement('button');
  toggle.type='button';
  toggle.className='mobile-menu-toggle';
  toggle.setAttribute('aria-label','Abrir menu');
  toggle.setAttribute('aria-expanded','false');
  toggle.innerHTML='<span></span>';
  topin.appendChild(toggle);

  const setOpen=(open)=>{
    nav.classList.toggle('open',open);
    document.body.classList.toggle('menu-open',open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  };

  toggle.addEventListener('click',()=>setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click',(event)=>{
    if(event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown',(event)=>{
    if(event.key==='Escape') setOpen(false);
  });
  window.addEventListener('resize',()=>{
    if(window.innerWidth>980) setOpen(false);
  });
}

installMobileNavigation();

const conversionScript=document.createElement('script');
conversionScript.src='/assets/conversion.js?v=1';
conversionScript.defer=true;
document.head.appendChild(conversionScript);
