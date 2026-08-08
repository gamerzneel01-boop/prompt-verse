const promptTools = [
  {id:"chat",cat:"chat",icon:"💬",name:"ChatGPT Prompt Generator",desc:"Build structured prompts for chat-based AI.",tags:["ChatGPT","Prompt"]},
  {id:"gemini",cat:"chat",icon:"✦",name:"Gemini Prompt Generator",desc:"Create organized prompts for research and content.",tags:["Gemini","Prompt"]},
  {id:"claude",cat:"chat",icon:"◈",name:"Claude Prompt Generator",desc:"Create detailed reasoning and writing prompts.",tags:["Claude","Writing"]},
  {id:"image",cat:"image",icon:"🎨",name:"AI Image Prompt Builder",desc:"Build cinematic prompts with camera, lighting and style.",tags:["Image AI","Visual"]},
  {id:"video",cat:"image",icon:"🎬",name:"AI Video Prompt Builder",desc:"Create scene, camera and motion directions.",tags:["Video AI","Cinematic"]},
  {id:"youtube",cat:"youtube",icon:"▶",name:"YouTube Prompt Pack",desc:"Generate titles, hooks, scripts and thumbnails.",tags:["YouTube","Creator"]},
  {id:"coding",cat:"coding",icon:"💻",name:"Coding Prompt Builder",desc:"Prompts for debugging, architecture and code reviews.",tags:["Coding","Dev"]},
  {id:"business",cat:"business",icon:"📈",name:"Business Prompt Builder",desc:"Marketing, research, strategy and planning prompts.",tags:["Business","Marketing"]},
  {id:"writer",cat:"chat",icon:"✍️",name:"Writing Prompt Generator",desc:"Blog, story, email and copywriting prompts.",tags:["Writing","Copy"]},
  {id:"research",cat:"chat",icon:"🔎",name:"Research Prompt Builder",desc:"Create prompts for structured research and summaries.",tags:["Research","Analysis"]},
  {id:"seo",cat:"business",icon:"🚀",name:"SEO Prompt Builder",desc:"Prompts for content briefs, keywords and on-page SEO.",tags:["SEO","Growth"]},
  {id:"social",cat:"youtube",icon:"◎",name:"Social Media Prompt Pack",desc:"Generate captions, hooks and content calendars.",tags:["Social","Content"]}
];

const trending = [
  {title:"Viral YouTube Shorts Script",cat:"YouTube",text:"Act as an expert short-form video scriptwriter. Create a 30-second high-retention script about [TOPIC] with a 2-second hook, rapid value, pattern interrupt and natural CTA."},
  {title:"Cinematic AI Image",cat:"Image AI",text:"Create a cinematic 4K image prompt for [SUBJECT], dramatic volumetric lighting, detailed environment, realistic textures, dynamic composition, shallow depth of field, professional photography."},
  {title:"Expert Tutor",cat:"Education",text:"Act as a patient expert tutor. Explain [TOPIC] to a beginner using simple language, examples, analogies, a step-by-step breakdown and a short quiz at the end."},
  {title:"Code Debugger",cat:"Coding",text:"Act as a senior software engineer. Analyze the following code, identify the root cause, explain the bug, provide a corrected version and list prevention tips: [CODE]."},
  {title:"Marketing Strategy",cat:"Business",text:"Act as a growth strategist. Build a practical marketing plan for [PRODUCT] targeting [AUDIENCE], including positioning, channels, content pillars, funnel stages and measurable KPIs."},
  {title:"Prompt Improver",cat:"Meta",text:"Improve the prompt below by adding role, context, constraints, success criteria and output format while preserving the original intent: [PROMPT]."}
];

const $ = id => document.getElementById(id);
let activeCat = "all";
let saved = JSON.parse(localStorage.getItem("promptVerseSaved") || "[]");
let history = JSON.parse(localStorage.getItem("promptVerseHistory") || "[]");

function toastMsg(msg){
  const t=$("toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(window.__toastTimer); window.__toastTimer=setTimeout(()=>t.classList.remove("show"),1800);
}
function saveState(){
  localStorage.setItem("promptVerseSaved",JSON.stringify(saved));
  localStorage.setItem("promptVerseHistory",JSON.stringify(history.slice(0,30)));
  $("savedCount").textContent=saved.length;
}
function copyText(text){ navigator.clipboard?.writeText(text); toastMsg("Copied to clipboard ✓"); }
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

function scorePrompt(text){
  const n=text.trim().length;
  let score=35;
  if(n>80)score+=15;if(n>180)score+=10;if(/role|act as|expert/i.test(text))score+=10;
  if(/context|audience|background/i.test(text))score+=8;
  if(/format|output|steps|bullet|table/i.test(text))score+=8;
  if(/constraint|avoid|must|do not/i.test(text))score+=7;
  return Math.min(99,Math.max(20,score));
}

function buildPrompt(goal,model,tone,length,lang){
  const task=goal.trim()||"help me create better content";
  return `You are an expert ${model} assistant.

TASK
${task}

CONTEXT
Work with practical assumptions, identify missing information when necessary, and keep the response focused on the user's real objective.

STYLE
Tone: ${tone}
Language: ${lang}
Output style: ${length}

REQUIREMENTS
- Be clear and specific.
- Break complex work into logical steps when useful.
- Avoid unnecessary filler.
- State assumptions briefly if something is ambiguous.
- Provide actionable examples where they improve the result.

SUCCESS CRITERIA
The final answer should directly solve the task, be easy to use, and follow the requested format.

Now complete the task.`;
}

function addHistory(title,text){
  history.unshift({title,text,time:new Date().toLocaleString()});
  history=history.slice(0,30); saveState(); renderHistory();
}

function renderTrending(){
  const grid=$("trendingGrid");
  grid.innerHTML=trending.map((p,i)=>`
    <article class="prompt-card">
      <div class="prompt-card-top"><span class="tag">${p.cat}</span><span>#${i+1}</span></div>
      <h3>${p.title}</h3>
      <p>${escapeHtml(p.text)}</p>
      <div class="tool-actions">
        <button class="try" onclick="useTrending(${i})">Use Prompt →</button>
        <button class="save" onclick="toggleSavedText(${i})">${saved.includes("trend:"+i)?"♥":"♡"}</button>
      </div>
    </article>`).join("");
}
window.useTrending=i=>{
  $("goalInput").value=trending[i].text.replace("[TOPIC]","my topic").replace("[SUBJECT]","my subject").replace("[CODE]","my code").replace("[PRODUCT]","my product").replace("[AUDIENCE]","my audience").replace("[PROMPT]","my prompt");
  $("generator").scrollIntoView({behavior:"smooth"}); toastMsg("Prompt loaded into generator");
};
window.toggleSavedText=i=>{
  const id="trend:"+i; saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id]; saveState(); renderTrending(); renderHistory(); toastMsg(saved.includes(id)?"Saved ✓":"Removed");
};

function renderTools(){
  const q=($("toolFilter").value||"").toLowerCase();
  $("toolsGrid").innerHTML=promptTools
    .filter(t=>(activeCat==="all"||t.cat===activeCat) && `${t.name} ${t.desc} ${t.tags.join(" ")}`.toLowerCase().includes(q))
    .map(t=>`<article class="tool-card">
      <div class="tool-icon">${t.icon}</div><h3>${t.name}</h3><p>${t.desc}</p>
      <div class="tool-meta">${t.tags.map(x=>`<span class="tag">${x}</span>`).join("")}</div>
      <div class="tool-actions"><button class="try" onclick="openTool('${t.id}')">Open Tool →</button><button class="save" onclick="toggleToolSave('${t.id}')">${saved.includes("tool:"+t.id)?"♥":"♡"}</button></div>
    </article>`).join("") || `<div class="empty">No tools found.</div>`;
}
window.toggleToolSave=id=>{
  const key="tool:"+id; saved=saved.includes(key)?saved.filter(x=>x!==key):[...saved,key]; saveState(); renderTools(); renderHistory(); toastMsg(saved.includes(key)?"Saved ✓":"Removed");
};

function openModal(title,body){
  $("modalBody").innerHTML=`<div class="eyebrow">PROMPT-VERSE TOOL</div><h2>${title}</h2>${body}`;
  $("modal").classList.add("open");
}
window.openTool=id=>{
  const t=promptTools.find(x=>x.id===id); if(!t)return;
  openModal(t.name,`
    <p style="color:#8e97a8">${t.desc}</p>
    <label>Describe your goal</label>
    <textarea id="toolInput" placeholder="Tell Prompt-Verse what you want to create..."></textarea>
    <div class="control-grid">
      <div><label>Model</label><select id="toolModel"><option>ChatGPT</option><option>Gemini</option><option>Claude</option><option>General AI</option></select></div>
      <div><label>Tone</label><select id="toolTone"><option>Professional</option><option>Creative</option><option>Expert</option><option>Viral</option></select></div>
    </div>
    <button class="generate" id="toolGenerate">Generate</button>
    <div class="output" id="toolOutput" style="display:none"></div>
    <div class="tool-actions" style="margin-top:10px"><button id="toolCopy">Copy</button><button id="toolImprove">Improve This</button></div>`);
  $("toolGenerate").onclick=()=>{
    const result=buildPrompt($("toolInput").value,$("toolModel").value,$("toolTone").value,"Detailed","English");
    $("toolOutput").textContent=result;$("toolOutput").style.display="block";$("toolOutput").dataset.copy=result;
    addHistory(t.name,result);
  };
  $("toolCopy").onclick=()=>{const x=$("toolOutput");x.dataset.copy?copyText(x.dataset.copy):toastMsg("Generate a result first")};
  $("toolImprove").onclick=()=>openImprover($("toolOutput").dataset.copy||$("toolInput").value);
};

function openImprover(initial=""){
  openModal("Prompt Improver",`
    <p style="color:#8e97a8">Turn a simple request into a stronger prompt.</p>
    <label>Your prompt</label><textarea id="improveInput" placeholder="Paste your prompt here...">${escapeHtml(initial)}</textarea>
    <button class="generate" id="improveBtn">Improve Prompt ✨</button>
    <div class="output" id="improveOutput" style="display:none"></div>`);
  $("improveBtn").onclick=async()=>{
    const raw=$("improveInput").value.trim()||"Create better content";
    setGenerating($("improveBtn"),true);
    try{
      const result=await callPromptVerseAI(raw,"improve");
      $("improveOutput").textContent=result;$("improveOutput").style.display="block";$("improveOutput").dataset.copy=result;
      addHistory("Improved Prompt",result);toastMsg("Prompt improved with AI ✨");
    }catch(err){
      const result=`Act as an expert prompt engineer.

ORIGINAL REQUEST:
${raw}

TASK:
Improve the request without changing its core intent. Add role, context, constraints, success criteria and output format.`;
      $("improveOutput").textContent=result;$("improveOutput").style.display="block";$("improveOutput").dataset.copy=result;
      addHistory("Improved Prompt (local fallback)",result);toastMsg("AI unavailable — local fallback used");console.error(err);
    }finally{setGenerating($("improveBtn"),false)}
  };
}

function openBuilder(){
  openModal("Prompt Builder",`
    <p style="color:#8e97a8">Assemble a prompt from proven building blocks.</p>
    <label>Role</label><input id="bRole" placeholder="e.g. senior YouTube strategist">
    <label>Goal</label><input id="bGoal" placeholder="e.g. create 10 viral video ideas">
    <label>Audience</label><input id="bAudience" placeholder="e.g. Minecraft beginners">
    <label>Context</label><textarea id="bContext" placeholder="Add important background..."></textarea>
    <label>Output format</label><input id="bOutput" placeholder="e.g. numbered list with short explanations">
    <button class="generate" id="buildBtn">Build Prompt 🧩</button>
    <div class="output" id="buildOutput" style="display:none"></div>`);
  $("buildBtn").onclick=()=>{
    const role=$("bRole").value||"an expert assistant",goal=$("bGoal").value||"complete the user's task",aud=$("bAudience").value||"the target audience",ctx=$("bContext").value||"Use the information provided by the user.",fmt=$("bOutput").value||"a clear structured answer";
    const result=`ROLE
Act as ${role}.

GOAL
${goal}.

AUDIENCE
${aud}.

CONTEXT
${ctx}

INSTRUCTIONS
Be accurate, practical and specific. Ask only essential clarifying questions. Avoid filler.

OUTPUT FORMAT
${fmt}.

QUALITY CHECK
Before finalizing, verify that the answer directly satisfies the goal and is appropriate for the audience.`;
    $("buildOutput").textContent=result;$("buildOutput").style.display="block";$("buildOutput").dataset.copy=result;
    addHistory("Built Prompt",result);
  };
}

function openImageBuilder(){
  openModal("AI Image Prompt Builder",`
    <p style="color:#8e97a8">Create a cinematic visual prompt.</p>
    <label>Subject</label><input id="iSubject" placeholder="e.g. futuristic Minecraft warrior">
    <div class="control-grid">
      <div><label>Style</label><select id="iStyle"><option>Cinematic realistic</option><option>3D render</option><option>Anime</option><option>Concept art</option><option>Photorealistic</option></select></div>
      <div><label>Lighting</label><select id="iLight"><option>Dramatic volumetric</option><option>Soft studio</option><option>Golden hour</option><option>Neon cyberpunk</option></select></div>
      <div><label>Camera</label><select id="iCamera"><option>35mm cinematic</option><option>85mm portrait</option><option>Wide angle</option><option>Macro</option></select></div>
      <div><label>Aspect ratio</label><select id="iRatio"><option>16:9</option><option>9:16</option><option>1:1</option></select></div>
    </div>
    <label>Environment</label><input id="iEnv" placeholder="e.g. futuristic city at night">
    <button class="generate" id="imageBtn">Build Image Prompt 🎨</button>
    <div class="output" id="imageOutput" style="display:none"></div>`);
  $("imageBtn").onclick=()=>{
    const s=$("iSubject").value||"heroic subject",env=$("iEnv").value||"detailed cinematic environment";
    const result=`Create a ${$("iRatio").value} ${$("iStyle").value} image of ${s} in ${env}. ${$("iLight").value} lighting, ${$("iCamera").value} camera look, detailed textures, strong composition, realistic depth, atmospheric perspective, high visual clarity, professional color grading, dramatic storytelling, clean focal point, no unwanted text or watermark.`;
    $("imageOutput").textContent=result;$("imageOutput").style.display="block";$("imageOutput").dataset.copy=result;
    addHistory("Image Prompt",result);
  };
}

function openScore(initial=""){
  openModal("Prompt Score",`
    <p style="color:#8e97a8">A local heuristic score for prompt structure — not an AI evaluation.</p>
    <textarea id="scoreInput" placeholder="Paste your prompt...">${escapeHtml(initial)}</textarea>
    <button class="generate" id="scoreBtn">Analyze Prompt 📊</button>
    <div class="output" id="scoreOutput" style="display:none"></div>`);
  $("scoreBtn").onclick=()=>{
    const text=$("scoreInput").value, total=scorePrompt(text);
    const details=[
      `Overall: ${total}/100`,
      `Clarity: ${Math.min(99,35+Math.min(50,text.length/8))|0}/100`,
      `Context: ${/context|audience|background/i.test(text)?88:45}/100`,
      `Specificity: ${text.length>180?90:text.length>80?72:48}/100`,
      `Output structure: ${/format|steps|list|table|output/i.test(text)?90:50}/100`,
      `Tip: ${total<60?"Add role, context, constraints and a clear output format.":"Your prompt has a useful structure. Add examples or constraints if the result needs more precision."}`
    ];
    $("scoreOutput").textContent=details.join("\n");$("scoreOutput").style.display="block";
  };
}

function openPowerTool(type){
  if(type==="improver")return openImprover();
  if(type==="builder")return openBuilder();
  if(type==="image")return openImageBuilder();
  if(type==="score")return openScore();
}


// ===== Prompt-Verse v5: real server-side AI =====
async function callPromptVerseAI(userPrompt, mode="prompt"){
  const response = await fetch('/api/generate', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({prompt:userPrompt, mode})
  });
  let data={};
  try { data=await response.json(); } catch(e) {}
  if(!response.ok) throw new Error(data.error || 'AI request failed.');
  return data.output || '';
}
function setGenerating(button, yes){
  if(!button) return;
  button.disabled=yes;
  button.dataset.oldText ||= button.textContent;
  button.textContent=yes?'Generating…':button.dataset.oldText;
}

document.querySelectorAll(".feature-card").forEach(b=>b.onclick=()=>openPowerTool(b.dataset.tool));

function renderHistory(){
  const el=$("historyGrid");
  const items=history.slice(0,8);
  const savedTools=saved.filter(x=>x.startsWith("trend:")||x.startsWith("tool:")).length;
  if(!items.length && !savedTools){el.innerHTML=`<div class="empty">Generate a prompt and your recent work will appear here.</div>`;return;}
  el.innerHTML=items.map((x,i)=>`<article class="history-card"><span>${escapeHtml(x.title)}</span><small>${escapeHtml(x.time)}</small><p>${escapeHtml(x.text.slice(0,220))}${x.text.length>220?"…":""}</p><button onclick="copyHistory(${i})">Copy</button></article>`).join("");
}
window.copyHistory=i=>{if(history[i])copyText(history[i].text)};

$("generateMain").onclick=async()=>{
  const goal=$("goalInput").value.trim();
  if(!goal){toastMsg("Tell me what you want AI to do first.");$("goalInput").focus();return;}
  const button=$("generateMain");
  setGenerating(button,true);
  const request=`Create a ready-to-copy AI prompt for this goal:
${goal}

Target model: ${$("modelSelect").value}
Tone: ${$("toneSelect").value}
Output style: ${$("lengthSelect").value}
Language: ${$("langSelect").value}`;
  try{
    const result=await callPromptVerseAI(request,"prompt");
    $("mainOutput").textContent=result;$("mainScore").textContent=scorePrompt(result)+"/100";
    addHistory("AI Prompt Generator",result);toastMsg("Real AI prompt generated ✨");
  }catch(err){
    const result=buildPrompt(goal,$("modelSelect").value,$("toneSelect").value,$("lengthSelect").value,$("langSelect").value);
    $("mainOutput").textContent=result;$("mainScore").textContent=scorePrompt(result)+"/100";
    addHistory("AI Prompt Generator (local fallback)",result);toastMsg("AI unavailable — local fallback used");
    console.error(err);
  }finally{setGenerating(button,false)}
};
$("copyMain").onclick=()=>copyText($("mainOutput").textContent);

$("searchBtn").onclick=()=>{$("toolFilter").value=$("globalSearch").value;$("tools").scrollIntoView({behavior:"smooth"});renderTools()};
$("globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter")$("searchBtn").click()});
$("randomBtn").onclick=()=>{const ideas=["Create a viral YouTube Shorts script","Design a cinematic AI image","Build a coding debugger prompt","Create a marketing strategy"];$("goalInput").value=ideas[Math.floor(Math.random()*ideas.length)];$("generator").scrollIntoView({behavior:"smooth"})};
$("toolFilter").oninput=renderTools;

document.querySelectorAll(".pill").forEach(p=>p.onclick=()=>{
  document.querySelectorAll(".pill").forEach(x=>x.classList.remove("active"));p.classList.add("active");
  activeCat=p.dataset.cat;renderTools();
});
document.querySelectorAll("[data-jump]").forEach(b=>b.onclick=()=>{
  activeCat=b.dataset.jump;document.querySelectorAll(".pill").forEach(x=>x.classList.toggle("active",x.dataset.cat===activeCat));
  $("tools").scrollIntoView({behavior:"smooth"});renderTools();
});
$("refreshTrending").onclick=()=>{trending.push(trending.shift());renderTrending();toastMsg("Trending refreshed")};

$("modalClose").onclick=()=>$("modal").classList.remove("open");
$("modal").addEventListener("click",e=>{if(e.target===$("modal"))$("modal").classList.remove("open")});
$("savedBtn").onclick=()=>$("saved").scrollIntoView({behavior:"smooth"});

$("themeBtn").onclick=()=>{
  document.body.classList.toggle("light");
  localStorage.setItem("promptVerseTheme",document.body.classList.contains("light")?"light":"dark");
};
if(localStorage.getItem("promptVerseTheme")==="light")document.body.classList.add("light");

$("menuBtn").onclick=()=>$("mobileNav").classList.toggle("open");
$("newsletterForm").onsubmit=e=>{e.preventDefault();$("newsletterNote").textContent="Thanks! Connect an email service before launch.";e.target.reset()};

saveState();renderTrending();renderTools();renderHistory();
