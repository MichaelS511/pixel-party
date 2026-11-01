(()=>{
const TASK_KEY='pixelPartyQuestList',TICKET_KEY='pixelPartyArcadeTickets';
const list=document.querySelector('#task-list'),form=document.querySelector('#quest-form'),titleInput=document.querySelector('#quest-title'),categoryInput=document.querySelector('#quest-category'),empty=document.querySelector('#empty-quests');
function tickets(){return Math.max(0,Number(localStorage.getItem(TICKET_KEY)||0)||0)}
function refreshTickets(){
  const count=tickets();document.querySelectorAll('[data-ticket-count]').forEach(el=>el.textContent=count);
  const label=document.querySelector('[data-play-label]'),hint=document.querySelector('[data-ticket-hint]'),link=document.querySelector('[data-play-link]');
  if(label)label.textContent=count?'Play Pixel Survivor':'Earn a ticket to play';
  if(hint)hint.textContent=count===0?'Complete a quest to get your first ticket.':count===1?'You have one run ready. Finish another quest to earn more.':'You have '+count+' runs ready. Each run uses one ticket.';
  if(link)link.classList.toggle('ticket-ready',count>0);
}
function setTickets(count){localStorage.setItem(TICKET_KEY,String(Math.max(0,count)));refreshTickets();window.dispatchEvent(new Event('pixelparty:tickets'))}
window.PixelTasks={tickets,spendTicket(){const available=tickets();if(available<1)return false;setTickets(available-1);return true},refreshTickets};
if(!list||!form){refreshTickets();window.addEventListener('storage',event=>{if(event.key===TICKET_KEY)refreshTickets()});return}
const starterTasks=[
  {title:'Check in with the clubs',category:'Club'},
  {title:'Go to soccer practice',category:'Practice'},
  {title:'Practice piano',category:'Personal'}
];
function readTasks(){try{return JSON.parse(localStorage.getItem(TASK_KEY)||'null')}catch{return null}}
let tasks=readTasks();
if(!Array.isArray(tasks)){tasks=starterTasks.map((task,index)=>({id:'starter-'+index,title:task.title,category:task.category,done:false,rewarded:false}));saveTasks()}
let filter='active',editingId=null,rewardTimer=0;
function saveTasks(){localStorage.setItem(TASK_KEY,JSON.stringify(tasks))}
function escapeText(value){const el=document.createElement('span');el.textContent=value;return el.innerHTML}
function render(){
  const visible=tasks.filter(task=>filter==='all'||(filter==='done'?task.done:!task.done));
  const done=tasks.filter(task=>task.done).length,active=tasks.length-done;
  document.querySelectorAll('[data-done-count]').forEach(el=>el.textContent=done);
  document.querySelectorAll('[data-total-count]').forEach(el=>el.textContent=tasks.length);
  document.querySelectorAll('[data-active-count]').forEach(el=>el.textContent=active);
  document.querySelectorAll('[data-filter-done-count]').forEach(el=>el.textContent=done);
  document.querySelectorAll('[data-filter]').forEach(button=>{const selected=button.dataset.filter===filter;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected))});
  list.replaceChildren();
  for(const task of visible){
    const row=document.createElement('li');row.className='task-row'+(task.done?' is-done':'');row.dataset.id=task.id;
    const check=document.createElement('input');check.type='checkbox';check.checked=Boolean(task.done);check.className='task-check';check.setAttribute('aria-label',(task.done?'Reopen ':'Complete ')+task.title);
    const body=document.createElement('div');body.className='task-copy';
    if(editingId===task.id){
      const edit=document.createElement('input');edit.className='task-edit-input';edit.maxLength=90;edit.value=task.title;edit.setAttribute('aria-label','Edit quest title');body.append(edit);
      const save=document.createElement('button');save.type='button';save.className='task-action task-save';save.dataset.action='save';save.textContent='Save';
      const cancel=document.createElement('button');cancel.type='button';cancel.className='task-action';cancel.dataset.action='cancel';cancel.textContent='Cancel';
      row.append(check,body,save,cancel);list.append(row);edit.focus();edit.select();continue;
    }
    const name=document.createElement('strong');name.textContent=task.title;
    const tag=document.createElement('span');tag.className='task-category';tag.textContent=task.category||'Personal';
    body.append(name,tag);
    const editButton=document.createElement('button');editButton.type='button';editButton.className='task-action';editButton.dataset.action='edit';editButton.setAttribute('aria-label','Edit '+task.title);editButton.textContent='Edit';
    const deleteButton=document.createElement('button');deleteButton.type='button';deleteButton.className='task-action delete-action';deleteButton.dataset.action='delete';deleteButton.setAttribute('aria-label','Delete '+task.title);deleteButton.textContent='Delete';
    row.append(check,body,editButton,deleteButton);list.append(row);
  }
  empty.hidden=visible.length>0;
  refreshTickets();
}
form.addEventListener('submit',event=>{event.preventDefault();const title=titleInput.value.trim();if(!title)return;tasks.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),title,category:categoryInput.value,done:false,rewarded:false});saveTasks();filter='active';titleInput.value='';render();titleInput.focus()});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;editingId=null;render()}));
list.addEventListener('change',event=>{if(!event.target.matches('.task-check'))return;const row=event.target.closest('.task-row'),task=tasks.find(item=>item.id===row.dataset.id);if(!task)return;const completing=event.target.checked;task.done=completing;if(completing&&!task.rewarded){task.rewarded=true;setTickets(tickets()+1);if(window.PixelEconomy)window.PixelEconomy.award(10);const status=document.querySelector('#quest-announcement');if(status){status.textContent='Quest cleared! You earned 10 points and 1 arcade ticket.';status.hidden=false;clearTimeout(rewardTimer);rewardTimer=setTimeout(()=>{status.hidden=true},3600)}}saveTasks();render()});
list.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(!button)return;const row=button.closest('.task-row'),id=row.dataset.id,task=tasks.find(item=>item.id===id);if(!task)return;
  if(button.dataset.action==='edit'){editingId=id;render()}
  if(button.dataset.action==='cancel'){editingId=null;render()}
  if(button.dataset.action==='save'){const input=row.querySelector('.task-edit-input'),value=input.value.trim();if(!value){input.focus();return}task.title=value;editingId=null;saveTasks();render()}
  if(button.dataset.action==='delete'){tasks=tasks.filter(item=>item.id!==id);editingId=null;saveTasks();render()}
});
list.addEventListener('keydown',event=>{if(!event.target.matches('.task-edit-input'))return;if(event.key==='Enter'){event.preventDefault();event.target.closest('.task-row').querySelector('[data-action="save"]').click()}if(event.key==='Escape'){editingId=null;render()}});
window.addEventListener('storage',event=>{if(event.key===TICKET_KEY)refreshTickets();if(event.key===TASK_KEY){tasks=readTasks()||[];render()}});
render();
})();
