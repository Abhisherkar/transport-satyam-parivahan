const yearEl=document.getElementById("year");
if(yearEl){yearEl.textContent=String(new Date().getFullYear());}
const nav=document.querySelector(".site-nav");
const navToggle=document.querySelector(".nav-toggle");
if(navToggle&&nav){navToggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");navToggle.setAttribute("aria-expanded",open?"true":"false");});}
const sections=document.querySelectorAll(".section");
const navLinks=document.querySelectorAll(".site-nav a");
function setActive(hash){const id=(hash||"#home").replace("#","");sections.forEach(s=>{s.classList.toggle("active",s.id===id)});navLinks.forEach(a=>{a.classList.toggle("active",a.getAttribute("href")==="#"+id)});if(nav){nav.classList.remove("open");}window.scrollTo({top:0,behavior:"smooth"});}
navLinks.forEach(a=>{a.addEventListener("click",()=>{if(nav){nav.classList.remove("open");navToggle&&navToggle.setAttribute("aria-expanded","false");}})});
window.addEventListener("hashchange",()=>setActive(location.hash));
setActive(location.hash||"#home");
const tabs=document.querySelectorAll(".tab");
const panels=document.querySelectorAll(".tab-panel");
tabs.forEach(t=>{t.addEventListener("click",()=>{tabs.forEach(x=>x.classList.remove("active"));t.classList.add("active");panels.forEach(p=>{p.classList.toggle("active",p.id==="tab-"+t.dataset.tab)});});});
const inqForm=document.getElementById("inquiryForm");
const inqStatus=document.getElementById("inq-status");
const sendModal=document.getElementById("sendModal");
const sendEmailBtn=document.getElementById("sendEmail");
const sendWhatsBtn=document.getElementById("sendWhatsApp");
const sendCancelBtn=document.getElementById("sendCancel");
let pendingInquiry=null;
function openModal(){if(sendModal){sendModal.classList.add("open");sendModal.setAttribute("aria-hidden","false");}}
function closeModal(){if(sendModal){sendModal.classList.remove("open");sendModal.setAttribute("aria-hidden","true");}}
if(inqForm&&inqStatus){inqForm.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(inqForm);const name=String(d.get("name")||"").trim();const email=String(d.get("email")||"").trim();const phone=String(d.get("phone")||"").trim();const service=String(d.get("service")||"");const message=String(d.get("message")||"").trim();if(!name||!email||!phone||!message){inqStatus.textContent="Please fill in all fields.";return;}pendingInquiry={name,email,phone,service,message};openModal();});}
if(sendCancelBtn){sendCancelBtn.addEventListener("click",()=>{pendingInquiry=null;closeModal();});}
if(sendWhatsBtn){sendWhatsBtn.addEventListener("click",()=>{if(!pendingInquiry)return;const {name,email,phone,service,message}=pendingInquiry;const text=encodeURIComponent(`Inquiry\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nMessage: ${message}`);window.open(`https://wa.me/7972699155?text=${text}`,"_blank");inqStatus.textContent="Opening WhatsApp...";pendingInquiry=null;closeModal();});}
if(sendEmailBtn){sendEmailBtn.addEventListener("click",async()=>{if(!pendingInquiry)return;const ok=await sendNotify("inquiry_email",{...pendingInquiry,fromEmail:pendingInquiry.email});inqStatus.textContent=ok?"Inquiry emailed to company." : "Email sending not configured.";pendingInquiry=null;closeModal();});}
async function sendNotify(type,payload){try{const r=await fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,payload})});if(r.ok)return true;throw new Error("fail");}catch{try{const r2=await fetch("http://localhost:5501/api/notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,payload})});return r2.ok;}catch{return false;}}}
// disabled server notify for static hosting
const joinForm=document.getElementById("joinForm");
const joinStatus=document.getElementById("join-status");
if(joinForm&&joinStatus){joinForm.addEventListener("submit",async e=>{e.preventDefault();const d=new FormData(joinForm);const name=String(d.get("name")||"").trim();const email=String(d.get("email")||"").trim();const role=String(d.get("role")||"").trim();if(!name||!email||!role){joinStatus.textContent="Please complete all fields.";return;}await sendNotify("join",{name,email,role});joinStatus.textContent="Application submitted. We will get back soon.";joinForm.reset();});}
const trackForm=document.getElementById("trackForm");
const trackResults=document.getElementById("track-results");
const resultsTable=document.getElementById("results-table");
const exportCsvBtn=document.getElementById("export-csv");
const exportPdfBtn=document.getElementById("export-pdf");
const resetBtn=document.getElementById("track-reset");
let currentResults=[];
async function getMockData(){try{const r=await fetch("assets/data/mockTracking.json");if(!r.ok)throw new Error("mock data not found");return await r.json();}catch{const now=new Date().toISOString();return{"TRK1001":{status:"In Transit",origin:"Gurgaon",destination:"Surat",updated:now},"TRK1002":{status:"Delivered",origin:"Ahmedabad",destination:"Kadapa",updated:now},"TRK1003":{status:"Pending Pickup",origin:"Mumbai",destination:"Indore",updated:now}};}}
function renderResults(rows){const tbody=resultsTable.querySelector("tbody");tbody.innerHTML="";rows.forEach(r=>{const tr=document.createElement("tr");[r.id,r.status,r.origin,r.destination,r.updated].forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.appendChild(td);});tbody.appendChild(tr);});trackResults.hidden=rows.length===0;}
function parseConsignments(v){return v.split(",").map(x=>x.trim()).filter(x=>x.length>0);} 
function toCsv(rows){const h=["Consignment","Status","Origin","Destination","Last Update"];const lines=[h.join(",")];rows.forEach(r=>{lines.push([r.id,r.status,r.origin,r.destination,r.updated].map(x=>String(x).replaceAll(",",";")).join(","));});return lines.join("\n");}
function download(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);} 
function printTable(){const w=window.open("","_blank");if(!w)return;const html=`<html><head><title>Track Results</title><style>body{font-family:Inter,Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #888;padding:8px;text-align:left}thead th{background:#eee}</style></head><body>${trackResults.innerHTML}</body></html>`;w.document.write(html);w.document.close();w.focus();w.print();}
if(trackForm){trackForm.addEventListener("submit",async e=>{e.preventDefault();const d=new FormData(trackForm);const cons=String(d.get("consignments")||"");const cust=String(d.get("customer")||"").trim();const ids=parseConsignments(cons);const mock=await getMockData();currentResults=ids.map(id=>{const m=mock[id]||{};return{ id, status:m.status||"Not Found", origin:m.origin||"-", destination:m.destination||"-", updated:m.updated||new Date().toISOString() };});renderResults(currentResults);await sendNotify("track",{customer:cust,ids});});}
if(resetBtn){resetBtn.addEventListener("click",()=>{currentResults=[];renderResults(currentResults);});}
if(exportCsvBtn){exportCsvBtn.addEventListener("click",()=>{if(!currentResults.length)return;const csv=toCsv(currentResults);download("track-results.csv",csv,"text/csv");});}
if(exportPdfBtn){exportPdfBtn.addEventListener("click",()=>{if(!currentResults.length)return;printTable();});}

const counters=document.querySelectorAll(".counter .value");
if(counters.length){counters.forEach(el=>{const target=Number(el.dataset.target||"0");let v=0;const step=Math.max(1,Math.round(target/120));const t=setInterval(()=>{v+=step;if(v>=target){v=target;clearInterval(t);}el.textContent=String(v);},20);});}

const cities={
  Gurgaon:[28.4595,77.0266],Surat:[21.1702,72.8311],Ahmedabad:[23.0225,72.5714],Kadapa:[14.4673,78.8242],
  Kamareddy:[18.3258,78.3578],Muniguda:[19.6290,83.4880],Mumbai:[19.0760,72.8777],Pune:[18.5204,73.8567],
  Nashik:[19.9975,73.7898],Indore:[22.7196,75.8577]
};
function haversine(a,b){const toRad=x=>x*Math.PI/180;const R=6371;const dLat=toRad(b[0]-a[0]);const dLon=toRad(b[1]-a[1]);const lat1=toRad(a[0]);const lat2=toRad(b[0]);const s=Math.sin;const c=Math.cos;const h=s(dLat/2)**2+c(lat1)*c(lat2)*s(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(h));}
function speedFor(type){if(type==="Parcel")return 55;if(type==="Full Load")return 50;if(type==="Part Load")return 48;if(type==="ODC Project Cargo")return 35;if(type==="Container")return 52;return 50}
function estimateEtaKm(km,type){const sp=speedFor(type);const driveH=km/sp;const bufferH=type==="ODC Project Cargo"?8:3;const totalH=driveH+bufferH;const days=Math.floor(totalH/24);const hours=Math.ceil(totalH%24);return {days,hours}}
const etaForm=document.getElementById("etaForm");
const etaResult=document.getElementById("eta-result");
if(etaForm&&etaResult){etaForm.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(etaForm);const o=String(d.get("origin")||"").trim();const dest=String(d.get("dest")||"").trim();const type=String(d.get("type")||"Full Load");if(!cities[o]||!cities[dest]){etaResult.textContent="Enter valid cities from list.";return;}const km=Math.round(haversine(cities[o],cities[dest]));const {days,hours}=estimateEtaKm(km,type);etaResult.textContent=`Distance ~ ${km} km • ETA ~ ${days}d ${hours}h (${type})`;});}

async function loadClients(){try{const r=await fetch("assets/data/clients.json");const data=await r.json();const track=document.getElementById("clients-track");if(!track)return;track.innerHTML="";data.clients.forEach(c=>{const span=document.createElement("span");span.className="badge";const img=document.createElement("img");img.src=c.logo;img.alt=c.name;img.width=28;img.height=28;img.style.borderRadius="50%";img.onerror=()=>{span.textContent="";};span.appendChild(img);track.appendChild(span);});track.innerHTML+=track.innerHTML;}catch{const track=document.getElementById("clients-track");if(track){["Client A","Client B","Partner X","Partner Y"].forEach(()=>{const s=document.createElement("span");s.className="badge";s.textContent="";track.appendChild(s);});track.innerHTML+=track.innerHTML;}}}
loadClients();
