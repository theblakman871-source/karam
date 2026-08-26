const STORAGE = {
  settings: 'karam_barber_settings_v2',
  services: 'karam_barber_services_v2',
  bookings: 'karam_barber_bookings_v2',
  passwordHash: 'karam_barber_admin_hash_v2',
  session: 'karam_barber_admin_session_v2'
};

const DEFAULT_PASSWORD = 'Karam2026!';
const days = ['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag'];

const defaultSettings = {
  shopName: 'Karam Barber',
  whatsapp: '46700000000',
  displayPhone: '070-000 00 00',
  address: 'Lägg in salongens adress i adminpanelen',
  openTime: '10:00',
  closeTime: '19:00',
  slotMinutes: 30,
  openDays: [1,2,3,4,5,6],
  barbers: ['Valfri barberare','Karam']
};

const defaultServices = [
  {id: crypto.randomUUID(), name:'Haircut', description:'Klassisk eller modern klippning med konsultation, styling och finish.', price:350, duration:30},
  {id: crypto.randomUUID(), name:'Skin Fade', description:'Detaljerad fade med skarpa övergångar och precis finish.', price:400, duration:45},
  {id: crypto.randomUUID(), name:'Haircut + Beard', description:'Komplett paket med klippning, skäggform och styling.', price:550, duration:60},
  {id: crypto.randomUUID(), name:'Beard Trim', description:'Formning, linjer och finish för ett välbalanserat skägg.', price:250, duration:30},
  {id: crypto.randomUUID(), name:'Kids Haircut', description:'Klippning för barn med samma fokus på form och detaljer.', price:300, duration:30},
  {id: crypto.randomUUID(), name:'Premium Grooming', description:'Klippning, skägg, varm handduk och extra finish.', price:650, duration:75}
];

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

function getSettings(){ return {...defaultSettings, ...(JSON.parse(localStorage.getItem(STORAGE.settings) || 'null') || {})}; }
function setSettings(v){ localStorage.setItem(STORAGE.settings, JSON.stringify(v)); }
function getServices(){
  const raw = localStorage.getItem(STORAGE.services);
  if(!raw){ localStorage.setItem(STORAGE.services, JSON.stringify(defaultServices)); return defaultServices; }
  return JSON.parse(raw);
}
function setServices(v){ localStorage.setItem(STORAGE.services, JSON.stringify(v)); }
function getBookings(){ return JSON.parse(localStorage.getItem(STORAGE.bookings) || '[]'); }
function setBookings(v){ localStorage.setItem(STORAGE.bookings, JSON.stringify(v)); }
function sanitizeNumber(v){ return String(v || '').replace(/\D/g,''); }
function money(v){ return `${Number(v)} kr`; }
function escapeHTML(v=''){ return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function showToast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(showToast.t); showToast.t=setTimeout(()=>t.classList.remove('show'),2400); }

async function hashText(text){
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function ensurePassword(){
  if(!localStorage.getItem(STORAGE.passwordHash)) localStorage.setItem(STORAGE.passwordHash, await hashText(DEFAULT_PASSWORD));
}

function renderSite(){
  const s=getSettings();
  $$('[data-shop-name]').forEach(el=>el.textContent=s.shopName);
  $('#shopAddress').textContent=s.address;
  $('#shopPhone').textContent=s.displayPhone;
  document.title=`${s.shopName} — Boka tid`;

  const hours=$('#hoursList'); hours.innerHTML='';
  days.forEach((day,idx)=>{
    const open=s.openDays.map(Number).includes(idx);
    hours.insertAdjacentHTML('beforeend', `<div class="hours-row"><span>${day}</span><span>${open ? `${s.openTime}–${s.closeTime}` : 'Stängt'}</span></div>`);
  });
  renderServices();
  refreshBookingSelects();
}

function renderServices(){
  const list=getServices();
  $('#servicesGrid').innerHTML=list.map((svc,i)=>`<article class="service-card">
    <span class="service-number">${String(i+1).padStart(2,'0')}</span>
    <h3>${escapeHTML(svc.name)}</h3>
    <p>${escapeHTML(svc.description)}</p>
    <div class="service-meta"><strong class="service-price">${money(svc.price)}</strong><span class="service-duration">ca ${svc.duration} min</span></div>
    <button class="btn btn-outline" data-book-service="${svc.id}">Boka tjänsten</button>
  </article>`).join('');
  $$('[data-book-service]').forEach(btn=>btn.addEventListener('click',()=>openBooking(btn.dataset.bookService)));
}

function refreshBookingSelects(selectedService){
  const services=getServices();
  const s=getSettings();
  $('#bookingService').innerHTML='<option value="">Välj tjänst</option>'+services.map(x=>`<option value="${x.id}">${escapeHTML(x.name)} — ${money(x.price)}</option>`).join('');
  $('#bookingBarber').innerHTML=s.barbers.map(x=>`<option value="${escapeHTML(x)}">${escapeHTML(x)}</option>`).join('');
  if(selectedService) $('#bookingService').value=selectedService;
  updateTimes();
}

function localISODate(d){ const z=new Date(d.getTime()-d.getTimezoneOffset()*60000); return z.toISOString().slice(0,10); }
function setDateMinimum(){ $('#bookingDate').min=localISODate(new Date()); if(!$('#bookingDate').value) $('#bookingDate').value=localISODate(new Date()); }
function timeToMin(t){ const [h,m]=t.split(':').map(Number); return h*60+m; }
function minToTime(m){ return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`; }

function updateTimes(){
  const s=getSettings(), date=$('#bookingDate').value, select=$('#bookingTime');
  select.innerHTML='';
  if(!date){ select.innerHTML='<option value="">Välj datum först</option>'; return; }
  const dateObj=new Date(`${date}T12:00:00`), day=dateObj.getDay();
  if(!s.openDays.map(Number).includes(day)){
    select.innerHTML='<option value="">Stängt denna dag</option>';
    $('#bookingAvailabilityNotice').hidden=false;
    $('#bookingAvailabilityNotice').textContent='Salongen är stängd den valda dagen. Välj ett annat datum.';
    return;
  }
  $('#bookingAvailabilityNotice').hidden=true;
  const start=timeToMin(s.openTime), end=timeToMin(s.closeTime), step=Number(s.slotMinutes)||30;
  const bookings=getBookings().filter(b=>b.date===date);
  const barber=$('#bookingBarber').value;
  let options=[];
  for(let m=start; m<end; m+=step){
    const t=minToTime(m);
    const busy=bookings.some(b=>b.time===t && (barber==='Valfri barberare' || b.barber===barber));
    if(!busy) options.push(t);
  }
  select.innerHTML=options.length ? '<option value="">Välj tid</option>'+options.map(t=>`<option value="${t}">${t}</option>`).join('') : '<option value="">Inga lediga tider</option>';
}

function openBooking(serviceId){
  setDateMinimum(); refreshBookingSelects(serviceId); $('#bookingDialog').showModal();
}

function buildWhatsappMessage(b){
  return `Hej! Jag vill boka en tid hos ${b.shopName}.\n\n👤 Namn: ${b.name}\n📞 Telefon: ${b.phone}\n✂️ Tjänst: ${b.serviceName}\n💈 Barberare: ${b.barber}\n📅 Datum: ${b.date}\n🕒 Tid: ${b.time}\n💰 Pris: ${money(b.price)}${b.note ? `\n📝 Kommentar: ${b.note}` : ''}\n\nBekräfta gärna om tiden är ledig. Tack!`;
}

$('#bookingForm').addEventListener('submit', e=>{
  e.preventDefault();
  const fd=new FormData(e.currentTarget), service=getServices().find(x=>x.id===fd.get('service')), s=getSettings();
  if(!service){ showToast('Välj en tjänst.'); return; }
  const number=sanitizeNumber(s.whatsapp);
  if(number.length<8){ showToast('WhatsApp-numret måste anges i adminpanelen.'); return; }
  const booking={
    id:crypto.randomUUID(), createdAt:new Date().toISOString(), shopName:s.shopName,
    name:String(fd.get('name')).trim(), phone:String(fd.get('phone')).trim(), serviceId:service.id, serviceName:service.name,
    price:service.price, barber:String(fd.get('barber')), date:String(fd.get('date')), time:String(fd.get('time')), note:String(fd.get('note')||'').trim(), status:'Skickad till WhatsApp'
  };
  const existing=getBookings();
  const conflict=existing.some(b=>b.date===booking.date && b.time===booking.time && b.barber===booking.barber && booking.barber!=='Valfri barberare');
  if(conflict){ showToast('Tiden verkar redan vara bokad. Välj en annan tid.'); updateTimes(); return; }
  existing.unshift(booking); setBookings(existing);
  if (window.KaramDB?.configured) {
    window.KaramDB.insertBooking(booking).then(result => {
      if (!result.ok && !result.skipped) console.warn('Cloud save failed', result.error);
    });
  }
  const url=`https://wa.me/${number}?text=${encodeURIComponent(buildWhatsappMessage(booking))}`;
  window.open(url,'_blank','noopener,noreferrer');
  $('#bookingDialog').close(); e.currentTarget.reset(); setDateMinimum(); renderBookingsAdmin(); updateTimes();
  showToast('WhatsApp öppnades med bokningen färdig.');
});

$$('[data-open-booking]').forEach(b=>b.addEventListener('click',()=>openBooking()));
$('[data-close-booking]').addEventListener('click',()=>$('#bookingDialog').close());
$('#bookingDate').addEventListener('change',updateTimes); $('#bookingBarber').addEventListener('change',updateTimes);

$('.nav-toggle').addEventListener('click',e=>{ const nav=$('.main-nav'); nav.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded',nav.classList.contains('open')); });
$$('.main-nav a').forEach(a=>a.addEventListener('click',()=>$('.main-nav').classList.remove('open')));

// Admin
$('#adminOpen').addEventListener('click', async()=>{ await ensurePassword(); $('#adminPassword').value=''; $('#loginError').hidden=true; $('#adminLoginDialog').showModal(); });
$('[data-close-admin-login]').addEventListener('click',()=>$('#adminLoginDialog').close());
$('[data-close-admin]').addEventListener('click',()=>$('#adminDialog').close());
$('#adminLoginForm').addEventListener('submit',async e=>{
  e.preventDefault(); const ok=(await hashText($('#adminPassword').value))===localStorage.getItem(STORAGE.passwordHash);
  if(!ok){ $('#loginError').hidden=false; return; }
  sessionStorage.setItem(STORAGE.session,'1'); $('#adminLoginDialog').close(); openAdmin();
});
function openAdmin(){ populateSettings(); renderServicesAdmin(); renderBookingsAdmin(); $('#adminDialog').showModal(); }
$('#adminLogout').addEventListener('click',()=>{ sessionStorage.removeItem(STORAGE.session); $('#adminDialog').close(); showToast('Du är utloggad.'); });

$$('.admin-tab').forEach(tab=>tab.addEventListener('click',()=>{
  $$('.admin-tab').forEach(x=>x.classList.toggle('active',x===tab));
  $$('.admin-pane').forEach(p=>p.classList.toggle('active',p.dataset.pane===tab.dataset.tab));
}));

function populateSettings(){
  const s=getSettings(), f=$('#settingsForm');
  f.shopName.value=s.shopName; f.whatsapp.value=s.whatsapp; f.displayPhone.value=s.displayPhone; f.address.value=s.address; f.openTime.value=s.openTime; f.closeTime.value=s.closeTime; f.slotMinutes.value=String(s.slotMinutes); f.barbers.value=s.barbers.join('\n');
  [...f.openDays.options].forEach(o=>o.selected=s.openDays.map(Number).includes(Number(o.value)));
}
$('#settingsForm').addEventListener('submit',e=>{
  e.preventDefault(); const f=e.currentTarget;
  const selected=[...f.openDays.selectedOptions].map(o=>Number(o.value));
  const barbers=f.barbers.value.split('\n').map(x=>x.trim()).filter(Boolean);
  setSettings({shopName:f.shopName.value.trim(),whatsapp:sanitizeNumber(f.whatsapp.value),displayPhone:f.displayPhone.value.trim(),address:f.address.value.trim(),openTime:f.openTime.value,closeTime:f.closeTime.value,slotMinutes:Number(f.slotMinutes.value),openDays:selected,barbers:barbers.length?barbers:['Valfri barberare']});
  renderSite(); $('#settingsSaved').hidden=false; setTimeout(()=>$('#settingsSaved').hidden=true,2200); showToast('Inställningarna sparades.');
});

function renderServicesAdmin(){
  const list=getServices();
  $('#servicesAdminList').innerHTML=list.map(s=>`<div class="admin-list-item" data-service-row="${s.id}">
    <div><h4>${escapeHTML(s.name)}</h4><p>${escapeHTML(s.description)} · ${money(s.price)} · ${s.duration} min</p></div>
    <div class="button-row"><button class="btn btn-small btn-outline" data-edit-service="${s.id}">Redigera</button><button class="btn btn-small btn-danger" data-delete-service="${s.id}">Ta bort</button></div>
  </div>`).join('') || '<p>Inga tjänster ännu.</p>';
  $$('[data-edit-service]').forEach(b=>b.addEventListener('click',()=>editServiceRow(b.dataset.editService)));
  $$('[data-delete-service]').forEach(b=>b.addEventListener('click',()=>{ if(confirm('Ta bort tjänsten?')){ setServices(getServices().filter(s=>s.id!==b.dataset.deleteService)); renderServicesAdmin(); renderSite(); }}));
}
function editServiceRow(id){
  const s=getServices().find(x=>x.id===id), row=$(`[data-service-row="${id}"]`); if(!s||!row)return;
  row.innerHTML=`<div class="service-edit-grid">
    <input data-f="name" value="${escapeHTML(s.name)}" placeholder="Namn"><input data-f="price" type="number" min="0" value="${s.price}" placeholder="Pris"><input data-f="duration" type="number" min="5" step="5" value="${s.duration}" placeholder="Minuter">
    <textarea data-f="description" rows="2" placeholder="Beskrivning">${escapeHTML(s.description)}</textarea>
    <div class="button-row"><button class="btn btn-small btn-primary" data-save> Spara </button><button class="btn btn-small btn-outline" data-cancel>Avbryt</button></div>
  </div>`;
  $('[data-save]',row).addEventListener('click',()=>{
    const list=getServices(), target=list.find(x=>x.id===id); target.name=$('[data-f="name"]',row).value.trim(); target.price=Number($('[data-f="price"]',row).value); target.duration=Number($('[data-f="duration"]',row).value); target.description=$('[data-f="description"]',row).value.trim(); setServices(list); renderServicesAdmin(); renderSite(); showToast('Tjänsten uppdaterades.');
  });
  $('[data-cancel]',row).addEventListener('click',renderServicesAdmin);
}
$('#addService').addEventListener('click',()=>{
  const list=getServices(); list.push({id:crypto.randomUUID(),name:'Ny tjänst',description:'Beskriv tjänsten här.',price:300,duration:30}); setServices(list); renderServicesAdmin(); renderSite(); editServiceRow(list.at(-1).id);
});

function renderBookingsAdmin(){
  const list=getBookings();
  $('#bookingsList').innerHTML=list.map(b=>`<div class="admin-list-item">
    <div><h4>${escapeHTML(b.date)} ${escapeHTML(b.time)} — ${escapeHTML(b.name)}</h4><p>${escapeHTML(b.serviceName)} · ${escapeHTML(b.barber)} · ${escapeHTML(b.phone)}${b.note?` · ${escapeHTML(b.note)}`:''}</p></div>
    <button class="btn btn-small btn-danger" data-delete-booking="${b.id}">Ta bort</button>
  </div>`).join('') || '<p>Inga lokalt sparade bokningar ännu.</p>';
  $$('[data-delete-booking]').forEach(b=>b.addEventListener('click',()=>{ setBookings(getBookings().filter(x=>x.id!==b.dataset.deleteBooking)); renderBookingsAdmin(); updateTimes(); }));
}
$('#clearBookings').addEventListener('click',()=>{ if(confirm('Rensa alla lokalt sparade bokningar?')){ setBookings([]); renderBookingsAdmin(); updateTimes(); }});
$('#exportBookings').addEventListener('click',()=>{
  const rows=getBookings(); if(!rows.length){showToast('Det finns inga bokningar att exportera.');return;}
  const headers=['Datum','Tid','Namn','Telefon','Tjänst','Barberare','Pris','Kommentar','Skapad'];
  const csv=[headers,...rows.map(b=>[b.date,b.time,b.name,b.phone,b.serviceName,b.barber,b.price,b.note,b.createdAt])].map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}), a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`bokningar-${localISODate(new Date())}.csv`; a.click(); URL.revokeObjectURL(a.href);
});

$('#passwordForm').addEventListener('submit',async e=>{
  e.preventDefault(); const f=e.currentTarget, msg=$('#passwordMessage'); msg.hidden=false; msg.className='form-error';
  if((await hashText(f.currentPassword.value))!==localStorage.getItem(STORAGE.passwordHash)){ msg.textContent='Nuvarande lösenord är fel.'; return; }
  if(f.newPassword.value!==f.confirmPassword.value){ msg.textContent='De nya lösenorden matchar inte.'; return; }
  if(f.newPassword.value.length<8){ msg.textContent='Det nya lösenordet måste vara minst 8 tecken.'; return; }
  localStorage.setItem(STORAGE.passwordHash,await hashText(f.newPassword.value)); f.reset(); msg.className='success-message'; msg.textContent='Lösenordet är ändrat.';
});

$('#year').textContent=new Date().getFullYear();
setDateMinimum();
ensurePassword();
renderSite();
