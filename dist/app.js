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
const examples = ["I have a predilection for chocolate ice cream.", "Her smile was a manifestation of her joy.", "The judge issued an injunction to stop the work.", "He was dissembling when he said he had done his homework.", "She blatantly broke the rules.", "The vindictive boy hid a toy to get even.", "The photos corroborate her story.", "His frown gave an intimation that something was wrong.", "I felt trepidation before my first day at school.", "The false rumor about her was calumny.", "Our teacher will arbitrate the argument.", "The two contiguous yards share a fence.", "Stealing from the poor is an act of iniquity.", "Daily practice helps with the inculcation of good habits.", "The abrogation of the old rule let us play outside."];
const shuffle = a => {a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const flashTimers = new WeakMap();
let mode='multiple', questions=[], activeMatch=0;
const form=document.querySelector('#questions');
function start(){
 document.querySelector('#results').hidden=true;activeMatch=0;
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 const bank=shuffle(words.map((_,i)=>i));const truth=shuffle(words.map((_,i)=>i<8));
 questions=shuffle(words.map((_,i)=>i)).map((id,i)=>{const distractors=shuffle(words.map((_,j)=>j).filter(j=>j!==id));return {id,options:shuffle([id,...distractors.slice(0,3)]),shown:truth[i]?id:distractors[0],answer:truth[i]?'true':'false'};});
 if(mode==='match'){
  form.innerHTML=`<div class="matching-board"><section class="word-column" aria-label="Words"><h3>Words</h3>${questions.map((q,i)=>`<div id="row${i}" class="match-row"><input type="hidden" name="q${i}" value=""><button type="button" class="word-pick" data-word="${i}" data-example="${q.id}" aria-expanded="false" aria-pressed="${i===0}"><span class="number">${i+1}.</span><span class="word-content">${words[q.id][0]}</span> <small>${words[q.id][1]}</small></button><div class="match-answer"><span class="pair-letter">Choose a definition →</span><span class="feedback" role="status" hidden></span></div></div>`).join('')}</section><section class="definition-column" aria-label="Definitions"><h3>Definitions</h3>${bank.map((id,j)=>`<button type="button" class="definition-pick" data-definition="${id}"><span class="definition-letter">${String.fromCharCode(65+j)}.</span><span>${words[id][2]}</span></button>`).join('')}</section></div>`;
  progress();return;
 }
 form.innerHTML=questions.map((q,i)=>{const w=words[q.id];const heading=`<span class="number">${String(i+1).padStart(2,'0')}</span><button type="button" class="word-toggle" data-example="${q.id}" aria-expanded="false"><strong>${w[0]}</strong></button><small>${w[1]}</small>`;let fields;
 if(mode==='match'){fields=`<div class="match-answer"><select aria-label="Definition for ${w[0]}" name="q${i}"><option value="">Choose a definition…</option>${bank.map((id,j)=>`<option value="${id}">${String.fromCharCode(65+j)}. ${words[id][2]}</option>`).join('')}</select></div><div class="correct-match" hidden></div>`;}
 else{const opts=mode==='multiple'?q.options.map(id=>[String(id),words[id][2]]):[['true','True'],['false','False']];fields=`<div class="options">${opts.map(([v,t])=>`<label class="option"><input type="radio" name="q${i}" value="${v}">${t}</label>`).join('')}</div>`;}
 return `<fieldset id="row${i}"><legend>${heading}${mode==='boolean'?`<br><span>${words[q.shown][2]}</span>`:''}</legend>${fields}<span class="feedback" role="status" hidden></span></fieldset>`;
 }).join('');progress();
}
function progress(event){
 const data=new FormData(form);
 let score=0,answered=0;
 questions.forEach((q,i)=>{
  const value=data.get('q'+i),row=document.querySelector('#row'+i),feedback=row.querySelector('.feedback');
  const hasAnswer=value!==null&&value!=='';
  const correct=hasAnswer&&value===(mode==='boolean'?q.answer:String(q.id));
  answered+=hasAnswer?1:0;score+=correct?1:0;
  row.className=hasAnswer?(correct?'correct':'incorrect'):'';
  feedback.hidden=!hasAnswer;
  feedback.textContent=!hasAnswer?'':correct?'✓ Correct · 1/1':'✗ Incorrect · 0/1';
  if(mode!=='match'){
   const selected=row.querySelector('input:checked');
   if(selected)selected.closest('.option').append(feedback);
  }else{
   row.querySelector('.match-answer').append(feedback);
   const chosen=hasAnswer?form.querySelector(`[data-definition="${value}"]`):null;
   row.querySelector('.pair-letter').textContent=chosen?`Answer: ${chosen.querySelector('.definition-letter').textContent}`:'Choose a definition →';
  }
  if(event?.target.name==='q'+i){
   clearTimeout(flashTimers.get(row));
   form.querySelectorAll('.flash-correct').forEach(el=>el.classList.remove('flash-correct'));
   if(hasAnswer&&!correct){
    const target=mode==='match'?form.querySelector(`[data-definition="${q.id}"]`):row.querySelector(`input[value="${mode==='boolean'?q.answer:q.id}"]`).closest('.option');
    void target.offsetWidth;
    target.classList.add('revealed-correct');
    target.classList.add('flash-correct');
    flashTimers.set(row,setTimeout(()=>target.classList.remove('flash-correct'),1000));
   }
  }
 });
 const result=document.querySelector('#results');
 result.hidden=answered!==15;
 if(answered===15)result.innerHTML=`<h2>${score} / 15 · ${Math.round(score/15*100)}%</h2><p>${score===15?'Excellent work! You know every word.':'Review your individual scores, or start a new quiz.'}</p>`;
}
form.addEventListener('click',event=>{
 const toggle=event.target.closest('[data-example]');
 if(toggle){
  const id=Number(toggle.dataset.example), expanded=toggle.getAttribute('aria-expanded')==='true';
  toggle.setAttribute('aria-expanded',String(!expanded));
  const content=toggle.querySelector('.word-content')||toggle.querySelector('strong');
  content.innerHTML=expanded?words[id][0]:examples[id].replace(new RegExp(words[id][0],'i'),word=>`<span class="example-word">${word}</span>`);
 }
 if(mode!=='match')return;
 const word=event.target.closest('[data-word]');
 if(word){activeMatch=Number(word.dataset.word);form.querySelectorAll('[data-word]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.word)===activeMatch)));return;}
 const definition=event.target.closest('[data-definition]');
 if(!definition)return;
 const value=definition.dataset.definition;
 form.querySelectorAll('input[type=hidden]').forEach(input=>{if(input.value===value)input.value='';});
 const input=form.querySelector(`[name="q${activeMatch}"]`);
 input.value=value;
 progress({target:input});
});
form.addEventListener('change',progress);
form.addEventListener('submit',e=>e.preventDefault());
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;start();}));document.querySelector('#restart').addEventListener('click',start);start();





