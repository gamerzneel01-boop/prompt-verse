let prompts=[],active='All';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const toast=m=>{const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1500)};
fetch('prompts/prompts.json').then(r=>r.json()).then(data=>{prompts=data;init()});
function init(){
 const cats=['All',...new Set(prompts.map(p=>p.category))];
 $('libraryPills').innerHTML=cats.map(c=>`<button class="pill ${c==='All'?'active':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
 document.querySelectorAll('.pill').forEach(b=>b.onclick=()=>{active=b.dataset.cat;document.querySelectorAll('.pill').forEach(x=>x.classList.toggle('active',x===b));render()});
 $('promptSearch').oninput=render;$('sortPrompts').onchange=render;render();
}
function render(){
 const q=$('promptSearch').value.toLowerCase(),sort=$('sortPrompts').value;
 let arr=prompts.filter(p=>(active==='All'||p.category===active)&&(`${p.title} ${p.category} ${p.type} ${p.prompt}`.toLowerCase().includes(q)));
 if(sort==='az')arr.sort((a,b)=>a.title.localeCompare(b.title));if(sort==='za')arr.sort((a,b)=>b.title.localeCompare(a.title));
 $('resultCount').textContent=`${arr.length} prompt${arr.length===1?'':'s'} found`;
 $('libraryGrid').innerHTML=arr.map(p=>`<article class="library-card"><span class="tag">${esc(p.category)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="prompt-preview">${esc(p.prompt)}</div><div class="tool-actions"><a class="try" href="prompt.html?slug=${encodeURIComponent(p.slug)}">View Prompt →</a><button class="save" onclick="copyPrompt(${p.id})">Copy</button></div></article>`).join('')||'<div class="empty">No matching prompts found.</div>';
}
window.copyPrompt=id=>{const p=prompts.find(x=>x.id===id);navigator.clipboard?.writeText(p.prompt);toast('Prompt copied ✓')};
$('themeBtn').onclick=()=>document.body.classList.toggle('light');
