document.documentElement.classList.add('js');

// Favicon do portfólio
let favicon=document.querySelector('link[rel="icon"]');
if(!favicon){
  favicon=document.createElement('link');
  favicon.rel='icon';
  document.head.appendChild(favicon);
}
favicon.type='image/svg+xml';
favicon.href='/favicon.svg?v=2';

// Remove o monograma que foi colocado no cabeçalho por engano.
const misplacedBrandMark=document.querySelector('.brand-mark');
if(misplacedBrandMark) misplacedBrandMark.remove();

// Galeria dedicada a sites e landing pages demonstrativos.
if(!document.querySelector('link[href="/assets/gallery.css"]')){
  const galleryCss=document.createElement('link');
  galleryCss.rel='stylesheet';
  galleryCss.href='/assets/gallery.css?v=1';
  document.head.appendChild(galleryCss);
}

const aboutSection=document.querySelector('#about');
if(aboutSection && !document.querySelector('#sites-lps')){
  const section=document.createElement('section');
  section.className='site-gallery-section';
  section.id='sites-lps';
  section.innerHTML=`
    <div class="wrap">
      <div class="site-gallery-head reveal">
        <div class="mono">02 / Sites & LPs</div>
        <div>
          <h2>Sites que você pode abrir e testar</h2>
          <p>Exemplos completos criados para mostrar variedade de direção visual, responsividade, formulários e páginas comerciais. Cada demo usa uma identidade própria — não é o mesmo template com textos trocados.</p>
        </div>
      </div>
      <div class="site-gallery">
        <article class="site-demo featured reveal">
          <div class="site-demo-preview"><iframe src="/demos/aurora-estetica/" title="Preview Aurora Estética"></iframe></div>
          <div class="site-demo-body">
            <div class="site-demo-top"><span class="site-demo-type">Landing page · estética</span><span class="site-demo-live">Demo ao vivo</span></div>
            <h3>Aurora Estética</h3>
            <p>Landing page premium para clínica de estética, com posicionamento de marca, tratamentos, prova de autoridade e formulário de avaliação que responde na própria página.</p>
            <div class="site-demo-tags"><span>Landing page</span><span>Conversão</span><span>Formulário</span><span>Responsivo</span></div>
            <a href="/demos/aurora-estetica/" target="_blank">Abrir site completo ↗</a>
          </div>
        </article>
        <article class="site-demo reveal">
          <div class="site-demo-preview"><iframe src="/demos/nexo-contabil/" title="Preview Nexo Contábil"></iframe></div>
          <div class="site-demo-body">
            <div class="site-demo-top"><span class="site-demo-type">Site comercial · contabilidade</span><span class="site-demo-live">Interativo</span></div>
            <h3>Nexo Contábil</h3>
            <p>Site de serviços B2B com visual executivo, dashboard conceitual e um mini diagnóstico que qualifica o perfil da empresa.</p>
            <div class="site-demo-tags"><span>B2B</span><span>Lead qualification</span><span>Serviços</span></div>
            <a href="/demos/nexo-contabil/" target="_blank">Abrir site completo ↗</a>
          </div>
        </article>
        <article class="site-demo reveal">
          <div class="site-demo-preview"><iframe src="/demos/cafe-atelier/" title="Preview Café Atelier"></iframe></div>
          <div class="site-demo-body">
            <div class="site-demo-top"><span class="site-demo-type">Website · gastronomia</span><span class="site-demo-live">Demo ao vivo</span></div>
            <h3>Café Atelier</h3>
            <p>Website de cafeteria com menu, storytelling, oferta para eventos corporativos e formulário de orçamento.</p>
            <div class="site-demo-tags"><span>Branding</span><span>Menu</span><span>Eventos</span></div>
            <a href="/demos/cafe-atelier/" target="_blank">Abrir site completo ↗</a>
          </div>
        </article>
        <article class="site-demo reveal">
          <div class="site-demo-preview"><iframe src="/demos/atlas/" title="Preview Atlas Studio"></iframe></div>
          <div class="site-demo-body">
            <div class="site-demo-top"><span class="site-demo-type">Landing page · estúdio</span><span class="site-demo-live">Responsivo</span></div>
            <h3>Atlas Studio</h3>
            <p>Direção visual mais editorial para demonstrar que a construção pode mudar completamente conforme o nicho e a marca.</p>
            <div class="site-demo-tags"><span>Web design</span><span>Editorial</span><span>Front-end</span></div>
            <a href="/demos/atlas/" target="_blank">Abrir site completo ↗</a>
          </div>
        </article>
      </div>
      <p class="site-gallery-note">Todas as marcas desta seção são fictícias e existem apenas como projetos demonstrativos de portfólio.</p>
    </div>`;
  aboutSection.parentNode.insertBefore(section,aboutSection);

  const nav=document.querySelector('.nav');
  if(nav && !nav.querySelector('a[href="#sites-lps"]')){
    const link=document.createElement('a');
    link.href='#sites-lps';
    link.textContent='Sites & LPs';
    const aboutLink=nav.querySelector('a[href="#about"]');
    nav.insertBefore(link,aboutLink || null);
  }
}

const io=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');io.unobserve(entry.target)}})},{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
