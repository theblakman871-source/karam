const DEFAULT_SERVICES = [
  { id:'taper', name:'Taper Fade', price:200, duration:45, active:true },
  { id:'low', name:'Low Fade', price:200, duration:45, active:true },
  { id:'mid', name:'Mid Fade', price:200, duration:45, active:true },
  { id:'high', name:'High Fade', price:200, duration:45, active:true },
  { id:'fade-beard', name:'Fade + Skägg', price:250, duration:60, active:true },
  { id:'beard', name:'Endast skägg', price:150, duration:30, active:true }
];
const TIMES = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
const cfg = window.BLENDXO_CONFIG || {};
const isSupabase = cfg.mode === 'supabase' && cfg.supabaseUrl && cfg.supabaseAnonKey;
const sb = isSupabase ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

function readLocal(key, fallback){ try{return JSON.parse(localStorage.getItem(key)) || fallback}catch{return fallback} }
function saveLocal(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
async function getServices(){
  if(isSupabase){ const {data,error}=await sb.from('services').select('*').eq('active',true).order('sort_order'); if(!error&&data?.length) return data; }
  return readLocal('blendxo_services', DEFAULT_SERVICES);
}
async function getImages(){
  if(isSupabase){ const {data}=await sb.from('site_images').select('*'); if(data) return Object.fromEntries(data.map(x=>[x.image_key,x.url])); }
  return readLocal('blendxo_images', {});
}
async function getBookings(){
  if(isSupabase){ const {data}=await sb.from('bookings').select('*'); return data||[]; }
  return readLocal('blendxo_bookings', []);
}
async function createBooking(payload){
  if(isSupabase){
    const {data,error}=await sb.from('bookings').insert(payload).select().single();
    if(error) throw error;
    try{ await sb.functions.invoke('notify-booking',{body:data}); }catch(e){ console.warn('Notification failed', e); }
    return data;
  }
  const all=readLocal('blendxo_bookings',[]); const item={...payload,id:crypto.randomUUID(),status:'pending',created_at:new Date().toISOString()}; all.unshift(item); saveLocal('blendxo_bookings',all); return item;
}

function esc(v=''){return String(v).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));}
async function init(){
  document.getElementById('year').textContent=new Date().getFullYear();
  const date=document.getElementById('bookingDate'); const today=new Date(); date.min=today.toISOString().split('T')[0];
  const services=await getServices();
  const grid=document.getElementById('serviceGrid'); const select=document.getElementById('bookingService');
  grid.innerHTML=services.filter(s=>s.active!==false).map(s=>`<article class="service-card"><div class="service-icon">✦</div><h3>${esc(s.name)}</h3><strong>${s.price} kr</strong><p>Ca ${s.duration} min</p><a href="#boka" class="btn ghost btn-small book-service" data-id="${esc(s.id)}">Boka</a></article>`).join('');
  select.innerHTML='<option value="">Välj tjänst</option>'+services.filter(s=>s.active!==false).map(s=>`<option value="${esc(s.id)}">${esc(s.name)} – ${s.price} kr</option>`).join('');
  document.getElementById('bookingTime').innerHTML='<option value="">Välj tid</option>'+TIMES.map(t=>`<option>${t}</option>`).join('');
  document.querySelectorAll('.book-service').forEach(a=>a.addEventListener('click',()=>{select.value=a.dataset.id; updateSummary(services);}));
  [select,date,document.getElementById('bookingTime')].forEach(el=>el.addEventListener('change',()=>updateSummary(services)));

  const images=await getImages(); document.querySelectorAll('.image-slot').forEach(el=>{const url=images[el.dataset.imageKey]; if(url){el.style.backgroundImage=`url("${url}")`;el.classList.add('has-image');}});
  const gallery=document.getElementById('galleryGrid');
  gallery.innerHTML=['gallery1','gallery2','gallery3','gallery4'].map((k,i)=>images[k]?`<div class="gallery-item" style="background-image:url('${images[k]}')"></div>`:`<div class="gallery-item placeholder"><span>LOOK ${i+1}</span><small>Lägg till via admin</small></div>`).join('');

  document.getElementById('bookingForm').addEventListener('submit',async e=>{
    e.preventDefault(); const service=services.find(s=>s.id===select.value); if(!service)return;
    const payload={service_id:service.id,service_name:service.name,price:service.price,booking_date:date.value,booking_time:document.getElementById('bookingTime').value,customer_name:document.getElementById('bookingName').value.trim(),phone:document.getElementById('bookingPhone').value.trim(),note:document.getElementById('bookingNote').value.trim(),status:'pending'};
    const existing=await getBookings(); if(existing.some(b=>b.booking_date===payload.booking_date&&b.booking_time===payload.booking_time&&b.status!=='cancelled')){alert('Den tiden är redan bokad. Välj en annan tid.');return;}
    try{await createBooking(payload); const box=document.getElementById('bookingSuccess');box.classList.remove('hidden');box.innerHTML=`<b>Tack ${esc(payload.customer_name)}!</b><br>Din bokning för ${esc(service.name)} den ${esc(payload.booking_date)} kl. ${esc(payload.booking_time)} är registrerad och väntar på bekräftelse.`;e.target.reset();updateSummary(services);box.scrollIntoView({behavior:'smooth',block:'center'});}catch(err){alert('Bokningen kunde inte sparas. Försök igen.');console.error(err)}
  });
}
function updateSummary(services){ const id=document.getElementById('bookingService').value;const s=services.find(x=>x.id===id);const d=document.getElementById('bookingDate').value;const t=document.getElementById('bookingTime').value;document.getElementById('bookingSummary').innerHTML=s?`<b>${esc(s.name)}</b><span>${s.price} kr • ${s.duration} min${d?' • '+esc(d):''}${t?' kl. '+esc(t):''}</span>`:'Välj en tjänst för att se bokningssammanfattningen.'; }
init();
