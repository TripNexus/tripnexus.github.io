/* ═══════════════════════════════════════════════════════════════
   TripNexus: estatísticas de visitas (Cloudflare Web Analytics)

   ┌─────────────────────────────────────────────────────────────┐
   │ PARA ACTIVAR: cole aqui o token do painel da Cloudflare.    │
   │ Analytics & Logs → Web Analytics → Add a site →             │
   │ Manual setup → copiar o valor de "token".                   │
   │ Enquanto estiver vazio, não é feito qualquer pedido.        │
   └─────────────────────────────────────────────────────────────┘

   Porquê aqui e não colado nas páginas: o token fica num sítio só,
   e as quatro páginas (índice e as três legais) carregam este
   ficheiro. Assim não há snippets repetidos por actualizar.

   Privacidade: o beacon da Cloudflare não usa cookies nem lê ou
   escreve o que quer que seja no dispositivo, e não segue o
   utilizador entre sites; por isso não depende do aviso de cookies
   (que é para a afiliação). Consta na Política de Privacidade.
   Para o tornar dependente do consentimento, ponha
   EXIGIR_CONSENTIMENTO a true.
   ═══════════════════════════════════════════════════════════════ */

const ANALYTICS_TOKEN = '';
const EXIGIR_CONSENTIMENTO = false;

(function(){
  const token = (ANALYTICS_TOKEN || '').trim();
  if(!token) return;                       /* sem token, não faz nada */
  if(EXIGIR_CONSENTIMENTO){
    let escolha = null;
    try{ escolha = localStorage.getItem('tn_cookies'); }catch(e){}
    if(escolha !== 'sim') return;
  }
  const s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', JSON.stringify({token}));
  document.head.appendChild(s);
})();
