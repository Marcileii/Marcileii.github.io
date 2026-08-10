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

const io=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');io.unobserve(entry.target)}})},{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
