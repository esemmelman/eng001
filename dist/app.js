const words = [
 ['Predilection','n.','a predisposition in favor of something'],
 ['Manifestation','n.','a public display of group feelings'],
 ['Injunction','n.','a formal command or admonition'],
 ['Dissembling','n.','pretending with intention to deceive'],
 ['Blatantly','adv.','in a completely obvious manner'],
 ['Vindictive','adj.','disposed to seek revenge or intended for revenge'],
 ['Corroborate','v.','support with evidence or authority or make more certain'],
 ['Intimation','n.','a slight suggestion or vague understanding'],
 ['Trepidation','n.','a feeling of alarm or dread'],
 ['Calumny','n.',"an abusive attack on a person's character or good name"],
 ['Arbitrate','v.','act between parties with a view to reconciling differences'],
 ['Contiguous','adj.','having a common boundary or edge'],
 ['Iniquity','n.','morally objectionable behavior'],
 ['Inculcation','n.','teaching or impressing upon the mind by frequent instruction'],
 ['Abrogation','n.','an official or legal cancellation']
];
const shuffle = a => {a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
let mode='multiple', questions=[],graded=false;
const form=document.querySelector('#questions');
function start(){
 graded=false;document.querySelector('#results').hidden=true;document.querySelector('#grade').disabled=false;
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 const titles={multiple:'Multiple choice',boolean:'True or false',match:'Matching'};
 document.querySelector('#mode-title').textContent=titles[mode];
 document.querySelector('#instructions').textContent={multiple:'Choose the correct definition for each word.',boolean:'Decide whether each word and definition pair is correct.',match:'Match each word to a definition from the shuffled list. Use each definition once.'}[mode];
 const bank=shuffle(words.map((_,i)=>i));const truth=shuffle(words.map((_,i)=>i<8));
 questions=shuffle(words.map((_,i)=>i)).map((id,i)=>{const distractors=shuffle(words.map((_,j)=>j).filter(j=>j!==id));return {id,options:shuffle([id,...distractors.slice(0,3)]),shown:truth[i]?id:distractors[0],answer:truth[i]?'true':'false'};});
 form.innerHTML=questions.map((q,i)=>{const w=words[q.id];const heading=`<span class="number">${String(i+1).padStart(2,'0')}</span><strong>${w[0]}</strong><small>${w[1]}</small>`;let fields;
 if(mode==='match'){fields=`<select aria-label="Definition for ${w[0]}" name="q${i}"><option value="">Choose a definition…</option>${bank.map((id,j)=>`<option value="${id}">${String.fromCharCode(65+j)}. ${words[id][2]}</option>`).join('')}</select>`;}
 else{const opts=mode==='multiple'?q.options.map(id=>[String(id),words[id][2]]):[['true','True'],['false','False']];fields=`<div class="options">${opts.map(([v,t])=>`<label class="option"><input type="radio" name="q${i}" value="${v}">${t}</label>`).join('')}</div>`;}
 return `<fieldset id="row${i}"><legend>${heading}${mode==='boolean'?`<br><span>${words[q.shown][2]}</span>`:''}</legend>${fields}<div class="feedback" hidden></div></fieldset>`;
 }).join('');progress();
}
function progress(){const data=new FormData(form);const n=questions.filter((_,i)=>data.get('q'+i)).length;document.querySelector('#count').textContent='15 words to practice';document.querySelector('#answered').textContent=`${n} / 15 answered`;document.querySelector('#progress').style.width=`${n/15*100}%`;}
form.addEventListener('change',()=>{progress();if(graded){document.querySelector('#results').hidden=true;document.querySelector('#grade').disabled=false;form.querySelectorAll('fieldset').forEach(r=>{r.classList.remove('correct','incorrect');r.querySelector('.feedback').hidden=true;});graded=false;}});
form.addEventListener('submit',e=>e.preventDefault());
document.querySelector('#grade').addEventListener('click',()=>{const data=new FormData(form);let score=0,missing=0;questions.forEach((q,i)=>{const val=data.get('q'+i),expected=mode==='boolean'?q.answer:String(q.id),correct=val===expected;score+=correct?1:0;missing+=!val?1:0;const row=document.querySelector('#row'+i);row.className=correct?'correct':'incorrect';const feedback=row.querySelector('.feedback');feedback.hidden=false;feedback.textContent=correct?'✓ Correct.':`${val?'✗ Incorrect.':'— Unanswered.'} ${mode==='boolean'?`Answer: ${q.answer}. `:''}${words[q.id][0]}: ${words[q.id][2]}.`;});const result=document.querySelector('#results');result.hidden=false;result.innerHTML=`<h2>${score} / 15 · ${Math.round(score/15*100)}%</h2><p>${score===15?'Excellent work! You know every word.':'Review the answers below each question, then try a new quiz.'}${missing?` ${missing} unanswered question${missing===1?' was':'s were'} counted as incorrect.`:''}</p>`;graded=true;result.focus();});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;start();}));document.querySelector('#restart').addEventListener('click',start);start();
