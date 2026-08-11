document.documentElement.classList.add('js');

const mobileCss=document.createElement('link');
mobileCss.rel='stylesheet';
mobileCss.href='/assets/mobile.css?v=2';
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

  nav.id=nav.id||'primary-navigation';

  const toggle=document.createElement('button');
  toggle.type='button';
  toggle.className='mobile-menu-toggle';
  toggle.setAttribute('aria-label','Abrir menu');
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-controls',nav.id);
  toggle.innerHTML='<span class="menu-label">Menu</span><span class="menu-icon" aria-hidden="true"><i></i><i></i></span>';
  topin.appendChild(toggle);

  const backdrop=document.createElement('button');
  backdrop.type='button';
  backdrop.className='mobile-nav-backdrop';
  backdrop.setAttribute('aria-label','Fechar menu');
  top.insertAdjacentElement('afterend',backdrop);

  const label=toggle.querySelector('.menu-label');
  const isMobile=()=>window.matchMedia('(max-width:980px)').matches;
  const isOpen=()=>nav.classList.contains('open');

  const setOpen=(open,{returnFocus=false}={})=>{
    if(!isMobile()) open=false;
    nav.classList.toggle('open',open);
    backdrop.classList.toggle('open',open);
    document.body.classList.toggle('menu-open',open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
    label.textContent=open?'Fechar':'Menu';
    if(open){
      requestAnimationFrame(()=>nav.querySelector('a')?.focus());
    }else if(returnFocus){
      toggle.focus();
    }
  };

  toggle.addEventListener('click',()=>setOpen(!isOpen()));
  backdrop.addEventListener('click',()=>setOpen(false,{returnFocus:true}));
  nav.addEventListener('click',(event)=>{
    if(event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown',(event)=>{
    if(event.key==='Escape'&&isOpen()){
      event.preventDefault();
      setOpen(false,{returnFocus:true});
      return;
    }
    if(event.key==='Tab'&&isOpen()){
      const focusable=[toggle,...nav.querySelectorAll('a[href]')];
      if(!focusable.length) return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){
        event.preventDefault();
        last.focus();
      }else if(!event.shiftKey&&document.activeElement===last){
        event.preventDefault();
        first.focus();
      }
    }
  });
  window.addEventListener('resize',()=>{
    if(!isMobile()&&isOpen()) setOpen(false);
  });
}

installMobileNavigation();

const conversionScript=document.createElement('script');
conversionScript.src='/assets/conversion.js?v=1';
conversionScript.defer=true;
document.head.appendChild(conversionScript);
