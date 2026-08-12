const form=document.getElementById('briefingForm'),result=document.getElementById('result'),leadRef=document.getElementById('leadRef'),submitBtn=document.getElementById('submitBriefing'),formState=document.getElementById('formState'),newBriefing=document.getElementById('newBriefing');
window.dataLayer=window.dataLayer||[];
function track(event,detail={}){window.dataLayer.push({event,...detail,path:location.pathname})}
track('page_view',{page:'contratar'});
let startedAt=Date.now();

function setSending(active){
  submitBtn.disabled=active;
  submitBtn.textContent=active?'Enviando...':'Enviar projeto →';
  form.setAttribute('aria-busy',active?'true':'false');
}

function errorMessage(code){
  if(code==='rate_limited')return 'Recebi várias tentativas deste dispositivo. Aguarde alguns minutos e tente novamente.';
  if(code==='validation_failed')return 'Revise os campos do formulário e tente novamente.';
  if(code==='invalid_form_timing')return 'Atualize a página e tente enviar novamente.';
  return 'Não consegui enviar agora. Tente novamente em alguns instantes.';
}

form.addEventListener('submit',async e=>{
  e.preventDefault();
  formState.textContent='';
  if(!form.reportValidity())return;
  const data=Object.fromEntries(new FormData(form).entries());
  const payload={...data,started_at:startedAt};
  setSending(true);
  try{
    const response=await fetch('https://qojhrihrfkoztetxpjgp.supabase.co/functions/v1/portfolio-lead',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload),
      credentials:'omit',
      cache:'no-store'
    });
    const body=await response.json().catch(()=>({}));
    if(!response.ok||!body.ok)throw Object.assign(new Error('submit_failed'),{code:body.error||'server_error'});
    track('briefing_submitted',{project_type:data.type,budget:data.budget,deadline:data.deadline});
    leadRef.textContent=body.lead_id?`Referência: ${String(body.lead_id).slice(0,8).toUpperCase()}`:'';
    result.hidden=false;
    form.reset();
    startedAt=Date.now();
    result.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(error){
    formState.textContent=errorMessage(error?.code);
    track('briefing_submit_error',{code:error?.code||'network_error'});
  }finally{
    setSending(false);
  }
});

newBriefing.addEventListener('click',()=>{
  result.hidden=true;
  formState.textContent='';
  startedAt=Date.now();
  form.scrollIntoView({behavior:'smooth',block:'start'});
  form.querySelector('[name="name"]').focus({preventScroll:true});
});