const words = [
 [
  "Draught",
  "n.",
  "a large and hurried swallow"
 ],
 [
  "Condemnation",
  "n.",
  "an expression of strong disapproval"
 ],
 [
  "Pallor",
  "n.",
  "an unnatural lack of color in the skin"
 ],
 [
  "Proceeding",
  "n.",
  "a sequence of steps by which legal judgments are invoked"
 ],
 [
  "Compensate",
  "v.",
  "make amends for"
 ],
 [
  "Perplexed",
  "adj.",
  "full of difficulty or confusion or bewilderment"
 ],
 [
  "Ameliorate",
  "v.",
  "make better"
 ],
 [
  "Deliberate",
  "v.",
  "think about carefully; weigh"
 ],
 [
  "Covet",
  "v.",
  "wish, long, or crave for"
 ],
 [
  "Misgiving",
  "n.",
  "doubt about someone's honesty"
 ],
 [
  "Daft",
  "adj.",
  "foolish or mentally irregular"
 ],
 [
  "Proportionate",
  "adj.",
  "being in due magnitude or extent"
 ],
 [
  "Blasphemy",
  "n.",
  "the act of depriving something of its sacred character"
 ],
 [
  "Lechery",
  "n.",
  "unrestrained indulgence in sexual activity"
 ],
 [
  "Grapple",
  "v.",
  "grip or seize, as in a wrestling match"
 ]
];
const shortMeanings = words.map(word => word[2]);
const examples = [
 "He drank the water in one draught.",
 "The proposal drew condemnation from the crowd.",
 "Her pallor worried the nurse.",
 "The legal proceeding began in court.",
 "They offered to compensate her for the damage.",
 "He looked perplexed by the instructions.",
 "The new medicine may ameliorate the symptoms.",
 "The jury will deliberate before reaching a verdict.",
 "They covet the championship trophy.",
 "I had a misgiving about whether he was telling the truth.",
 "It would be daft to go outside in a blizzard without a coat.",
 "The reward should be proportionate to the effort.",
 "The desecration of the sacred shrine was condemned as blasphemy.",
 "The novel portrays a ruler notorious for lechery.",
 "The wrestlers grapple for control of the match."
];
const shuffle = a => {a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const flashTimers = new WeakMap();
let mode='group', questions=[], activeMatch=0, groupStart=0;
const form=document.querySelector('#questions');
const restart=document.querySelector('#restart');
function start(){
 restart.hidden=mode==='group'||mode==='alpha';
 document.querySelector('.group-navigation').hidden=mode!=='group';
 document.querySelector('#results').hidden=true;activeMatch=0;
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 document.querySelector('.actions').hidden=mode==='alpha'||mode==='group';
 if(mode==='group'){
  questions=[];
  renderGroup();
  return;
 }
 if(mode==='alpha'){
  questions=[];
  const alphabetical=words.map((word,id)=>({word:word[0],meaning:shortMeanings[id]})).sort((a,b)=>a.word.localeCompare(b.word));
  form.innerHTML=`<ul class="alpha-list" aria-label="Alphabetical vocabulary">${alphabetical.map(entry=>`<li><strong>${entry.word}</strong> - ${entry.meaning}</li>`).join('')}</ul>`;
  return;
 }
 const bank=shuffle(words.map((_,i)=>i));const truth=shuffle(words.map((_,i)=>i<8));
 questions=shuffle(words.map((_,i)=>i)).map((id,i)=>{const distractors=shuffle(words.map((_,j)=>j).filter(j=>j!==id));return {id,options:shuffle([id,...distractors.slice(0,3)]),shown:truth[i]?id:distractors[0],answer:truth[i]?'true':'false'};});
 if(mode==='match'){
  form.innerHTML=`<div class="matching-board"><section class="word-column" aria-label="Words"><h3>Words</h3>${questions.map((q,i)=>`<div id="row${i}" class="match-row"><input type="hidden" name="q${i}" value=""><button type="button" class="word-pick" data-word="${i}" data-example="${q.id}" aria-expanded="false" aria-pressed="${i===0}"><span class="number">${i+1}.</span><span class="word-content">${words[q.id][0]}</span> <small>${words[q.id][1]}</small></button><div class="match-answer"><span class="pair-letter">Choose a definition →</span><span class="feedback" role="status" hidden></span></div></div>`).join('')}</section><section class="definition-column" aria-label="Definitions"><h3>Definitions</h3>${bank.map((id,j)=>`<button type="button" class="definition-pick" data-definition="${id}"><span class="definition-letter">${String.fromCharCode(65+j)}.</span><span>${words[id][2]}</span></button>`).join('')}</section></div>`;
  progress();return;
 }
 form.innerHTML=questions.map((q,i)=>{const w=words[q.id];const heading=`<span class="number">${String(i+1).padStart(2,'0')}</span><button type="button" class="word-toggle" data-example="${q.id}" aria-expanded="false"><strong>${w[0]}</strong></button><small>${w[1]}</small>`;let fields;
 if(mode==='match'){fields=`<div class="match-answer"><select aria-label="Definition for ${w[0]}" name="q${i}"><option value="">Choose a definition…</option>${bank.map((id,j)=>`<option value="${id}">${String.fromCharCode(65+j)}. ${words[id][2]}</option>`).join('')}</select></div><div class="correct-match" hidden></div>`;}
 else{const opts=mode==='multiple'?q.options.map(id=>[String(id),words[id][2]]):[['true','True'],['false','False']];fields=`<div class="options">${opts.map(([v,t])=>`<label class="option"><input type="radio" name="q${i}" value="${v}"><span class="answer-text">${t}</span></label>`).join('')}</div>`;}
 return `<fieldset id="row${i}"><legend><div class="question-heading"><span>${heading}</span></div>${mode==='boolean'?`<br><span>${words[q.shown][2]}</span>`:''}</legend>${fields}<span class="feedback" role="status" hidden></span></fieldset>`;
 }).join('');
 progress();
}
function renderGroup(){
 const group=words.slice(groupStart,groupStart+3);
 form.innerHTML=`<section class="group-list" aria-label="Vocabulary group" aria-live="polite">${group.map((word,i)=>`<div class="group-row"><button type="button" class="group-toggle" data-group-word="${groupStart+i}" aria-pressed="false" aria-label="Show definition for ${word[0]}"><span class="number">${groupStart+i+1}.</span><span class="group-content">${word[0]}</span></button></div>`).join('')}</section>`;
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
document.addEventListener('click',event=>{
 const groupToggle=event.target.closest('[data-group-word]');
 if(groupToggle){
  const word=words[Number(groupToggle.dataset.groupWord)],showWord=groupToggle.getAttribute('aria-pressed')==='true';
  groupToggle.setAttribute('aria-pressed',String(!showWord));
  groupToggle.setAttribute('aria-label',showWord?`Show definition for ${word[0]}`:'Show vocabulary word');
  groupToggle.querySelector('.group-content').textContent=showWord?word[0]:word[2];
  return;
 }
 const nextGroup=event.target.closest('[data-next-group]');
 const previousGroup=event.target.closest('[data-previous-group]');
 if(nextGroup||previousGroup){
  groupStart=(groupStart+(nextGroup?3:-3)+words.length)%words.length;
  renderGroup();
  document.querySelector(nextGroup?'[data-next-group]':'[data-previous-group]').focus();
  return;
 }
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
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;groupStart=0;start();}));document.querySelector('#restart').addEventListener('click',start);start();





