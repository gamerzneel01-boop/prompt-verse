const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const toast=m=>{const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1500)};
const slug=new URLSearchParams(location.search).get('slug');
fetch('prompts/prompts.json').then(r=>r.json()).then(all=>{
 const p=all.find(x=>x.slug===slug)||all[0];
 document.title=`${p.title} — Prompt-Verse`;
 document.querySelector('meta[name="description"]').content=`${p.title}: ready-to-use ${p.category} AI prompt from Prompt-Verse.`;
 const related=all.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,4);
 $('detail').innerHTML=`<div class="eyebrow">${esc(p.category.toUpperCase())} PROMPT</div>
 <h1>${esc(p.title)}</h1><p class="section-lead">${esc(p.description)}</p>
 <div class="detail-box"><div class="detail-top"><span>Ready-to-use prompt</span><button id="copy">Copy Prompt 📋</button></div><pre>${esc(p.prompt)}</pre></div>
 <div class="detail-info"><h2>How to use this prompt</h2><ol><li>Copy the prompt.</li><li>Replace bracketed placeholders such as [TOPIC] with your own details.</li><li>Paste it into your preferred AI model.</li><li>Refine the output with extra context if needed.</li></ol></div>
 <div class="detail-info"><h2>Prompt tips</h2><p>Give the AI a clear goal, useful context, constraints and a specific output format. Add examples when consistency matters.</p></div>
 <h2 class="related-title">Related prompts</h2><div class="related-grid">${related.map(x=>`<a href="prompt.html?slug=${encodeURIComponent(x.slug)}"><span>${esc(x.category)}</span><b>${esc(x.title)}</b><small>${esc(x.description)}</small></a>`).join('')}</div>`;
 $('copy').onclick=()=>{navigator.clipboard?.writeText(p.prompt);toast('Prompt copied ✓')};
});
