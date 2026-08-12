document.documentElement.classList.add('js');

const mobileCss=document.createElement('link');
mobileCss.rel='stylesheet';
mobileCss.href='/assets/mobile.css?v=2';
document.head.appendChild(mobileCss);

const mobilePreviewCss=document.createElement('link');
mobilePreviewCss.rel='stylesheet';
mobilePreviewCss.href='/assets/mobile-preview.css?v=1';
document.head.appendChild(mobilePreviewCss);

/*
 * A secao de sistemas precisa existir antes do primeiro paint/interacao.
 * Quando ela era criada pelo conversion.js (carregado dinamicamente), o
 * documento ganhava uma secao grande depois do carregamento e o scroll
 * anchoring do navegador podia compensar essa mudanca no primeiro wheel.
 */
const conversionCss=document.createElement('link');
conversionCss.rel='stylesheet';
conversionCss.href='/assets/conversion.css?v=1';
document.head.appendChild(conversionCss);

function installSystemsShowcase(){
  const work=document.querySelector('#work');
  const sites=document.querySelector('#sites-lps');
  if(!work||!sites||document.querySelector('#systems')) return;

  const section=document.createElement('section');
  section.className='systems-showcase';
  section.id='systems';
  section.innerHTML=`<div class="wrap"><div class="systems-head"><div class="mono">02 / Sistemas funcionais</div><div><h2>Projetos que você pode usar, não só olhar</h2><p>Duas demonstrações completas para mostrar fluxo, estados e interação. Os dados de teste ficam somente na sessão atual do navegador.</p></div></div><div class="systems-grid"><article class="system-card"><a class="system-preview" href="/demos/crm-pro/" target="_blank" rel="noopener noreferrer" data-track="demo_open" data-project="crm-pro"><iframe src="/demos/crm-pro/" loading="lazy" title="Preview CRM Pro"></iframe></a><div class="system-body"><div class="system-top"><span>CRM comercial · demo</span><b>Interativo</b></div><h3>CRM Pro</h3><p>Dashboard, clientes, oportunidades, pipeline Kanban e tarefas em uma operação comercial navegável.</p><div class="system-features"><span>Clientes</span><span>Pipeline</span><span>Tarefas</span><span>Dashboard</span></div><div class="system-actions"><a href="/demos/crm-pro/" target="_blank" rel="noopener noreferrer" data-track="demo_open" data-project="crm-pro">Testar CRM Pro ↗</a></div></div></article><article class="system-card"><a class="system-preview" href="/demos/agendapro/" target="_blank" rel="noopener noreferrer" data-track="demo_open" data-project="agendapro"><iframe src="/demos/agendapro/" loading="lazy" title="Preview AgendaPro"></iframe></a><div class="system-body"><div class="system-top"><span>Agendamento · demo</span><b>Interativo</b></div><h3>AgendaPro</h3><p>Serviços, profissionais, horários, confirmação e painel administrativo em um fluxo completo de agendamento.</p><div class="system-features"><span>Agenda</span><span>Horários</span><span>Admin</span><span>Confirmação</span></div><div class="system-actions"><a href="/demos/agendapro/" target="_blank" rel="noopener noreferrer" data-track="demo_open" data-project="agendapro">Testar AgendaPro ↗</a></div></div></article></div><div class="hire-strip"><div><h3>Tem um projeto parecido?</h3><p>Conte o contexto, investimento e prazo. O briefing já chega organizado para começarmos pela solução certa.</p></div><a href="/contratar/" data-track="hire_open">Enviar briefing →</a></div></div>`;
  sites.parentNode.insertBefore(section,sites);

  const nav=document.querySelector('.nav');
  if(nav&&!nav.querySelector('a[href="#systems"]')){
    const link=document.createElement('a');
    link.href='#systems';
    link.textContent='Sistemas';
    const sitesLink=nav.querySelector('a[href="#sites-lps"]');
    nav.insertBefore(link,sitesLink||nav.firstChild);
  }
}

installSystemsShowcase();

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
