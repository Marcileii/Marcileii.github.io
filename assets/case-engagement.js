(function(){
"use strict";
const API="https://br-shiny-king-bbqddpnl-engagement.compute.c-15.us-east-1.aws.neon.tech/";
const el=id=>document.getElementById(id);
const key="portfolio_case_visitor";
function visitor(){
 const match=document.cookie.match(/(?:^|;\s*)portfolio_case_visitor=([a-f0-9-]{36})(?:;|$)/i);
 if(match)return match[1];
 const id=crypto.randomUUID();
 document.cookie=key+"="+id+"; max-age=31536000; path=/cases/omnichannel-performance/; SameSite=Lax; Secure";
 return id;
}
const vid=visitor();
const state={busy:false,start:Date.now()};
function message(text,isError=false){el("engStatus").textContent=text;el("engStatus").setAttribute("data-error",isError?"true":"false");}
function formatDate(v){const d=new Date(v);return Number.isNaN(+d)?"":new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium"}).format(d);}
function render(data){
 el("engCount").textContent=Number(data.likes||0).toLocaleString("pt-BR");
 el("engLike").disabled=!!data.liked;
 el("engLike").setAttribute("aria-pressed",data.liked?"true":"false");
 el("engLike").querySelector("span").textContent=data.liked?"Você curtiu":"Curtir este case";
 const list=el("engComments");list.replaceChildren();
 const items=Array.isArray(data.comments)?data.comments:[];
 el("engCommentsCount").textContent=items.length+(items.length===1?" comentário":" comentários");
 if(!items.length){const empty=document.createElement("p");empty.className="eng-empty";empty.textContent="Ainda não há comentários. Que tal iniciar a conversa?";list.appendChild(empty);return;}
 for(const item of items){
  const article=document.createElement("article");article.className="eng-comment";
  const head=document.createElement("div");head.className="eng-comment-head";
  const name=document.createElement("strong");name.textContent=String(item.author_name||"Visitante");
  const date=document.createElement("time");date.dateTime=String(item.created_at||"");date.textContent=formatDate(item.created_at);
  head.append(name,date);
  const p=document.createElement("p");p.textContent=String(item.body||"");
  article.append(head,p);list.appendChild(article);
 }
}
async function request(data){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),16000);
 try{
  const opts=data?{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data),signal:controller.signal,cache:"no-store"}:{signal:controller.signal,cache:"no-store"};
  const res=await fetch(data?API:API+"?visitor="+encodeURIComponent(vid),opts);
  const body=await res.json();
  if(!res.ok||!body.ok)throw new Error(body.error||"temporarily_unavailable");
  return body;
 }finally{clearTimeout(timeout);}
}
function failure(e){
 if(e.message==="rate_limited")return "Você já comentou recentemente. Aguarde um pouco para tentar novamente.";
 if(e.message==="validation_failed")return "Confira o nome e o comentário. Evite links e informações de contato.";
 if(e.message==="invalid_form_timing")return "Aguarde alguns segundos e tente novamente.";
 return "Não foi possível conectar agora. Tente novamente mais tarde.";
}
(async()=>{try{render(await request());message("");}catch(e){message("Os comentários estão temporariamente indisponíveis.",true);el("engLike").disabled=true;el("engSubmit").disabled=true;}})();
el("engLike").addEventListener("click",async()=>{
 if(state.busy)return;state.busy=true;el("engLike").disabled=true;message("Registrando sua curtida…");
 try{const data=await request({action:"like",visitor:vid});render(data);message(data.liked?"Obrigado por curtir o case!":"Não foi possível registrar outra curtida deste dispositivo.");}
 catch(e){message(failure(e),true);el("engLike").disabled=false;}
 finally{state.busy=false;}
});
el("engForm").addEventListener("submit",async(e)=>{
 e.preventDefault();if(state.busy||!e.currentTarget.reportValidity())return;
 const name=el("engName").value.trim(),comment=el("engText").value.trim();
 state.busy=true;el("engSubmit").disabled=true;message("Publicando comentário…");
 try{
  const result=await request({action:"comment",name,comment,startedAt:state.start,website:el("engWebsite").value});
  render(result);el("engText").value="";state.start=Date.now();message("Comentário publicado. Obrigado por compartilhar!");
 }catch(error){message(failure(error),true);}
 finally{state.busy=false;el("engSubmit").disabled=false;}
});
})();