const $ = (s) => document.querySelector(s);
const loginView = $('#loginView'), appView = $('#appView'), pageContent = $('#pageContent');
let currentPage = 'inicio';
const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(url, options={}) {
  const response = await fetch('/api'+url, { credentials:'same-origin', headers:{'Content-Type':'application/json'}, ...options });
  const data = await response.json().catch(()=>({}));
  if (!response.ok) { if(response.status===401){showLogin();} throw new Error(data.erro || 'Ocorreu um erro.'); }
  return data;
}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600);}
function showLogin(){appView.classList.add('hidden');loginView.classList.remove('hidden');}
function showApp(user){loginView.classList.add('hidden');appView.classList.remove('hidden');$('#userName').textContent=user.nome;go('inicio');}
$('#loginForm').addEventListener('submit', async e=>{
  e.preventDefault();$('#loginError').textContent='';
  try{const d=await api('/auth/login',{method:'POST',body:JSON.stringify({email:$('#email').value,senha:$('#senha').value})});showApp(d.usuario);}
  catch(err){$('#loginError').textContent=err.message;}
});
$('#logoutBtn').addEventListener('click',async()=>{try{await api('/auth/logout',{method:'POST'});}finally{showLogin();}});
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
async function go(page){currentPage=page;document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));const names={inicio:'Visão geral',tutores:'Tutores',pets:'Pets',agendamentos:'Agendamentos'};$('#pageTitle').textContent=names[page];await render();}
async function render(){
  try{
    if(currentPage==='inicio'){
      const [t,p,a]=await Promise.all([api('/tutores'),api('/pets'),api('/agendamentos')]);
      pageContent.innerHTML=`<div class="welcome"><h3>Olá! Bem-vindo(a) ao VetCare.</h3><p>Gerencie a rotina da clínica com organização e segurança.</p></div><div class="stats"><div class="stat"><small>Tutores cadastrados</small><strong>${t.length}</strong></div><div class="stat"><small>Pets cadastrados</small><strong>${p.length}</strong></div><div class="stat"><small>Agendamentos</small><strong>${a.length}</strong></div></div><section class="panel"><div class="panel-head"><h3>Próximos atendimentos</h3><button class="secondary" onclick="go('agendamentos')">Ver todos</button></div>${appointmentsTable(a.slice(0,5))}</section>`;
    } else if(currentPage==='tutores') await renderTutores();
    else if(currentPage==='pets') await renderPets();
    else await renderAgendamentos();
  }catch(e){pageContent.innerHTML=`<section class="panel empty">${esc(e.message)}</section>`;}
}
function appointmentsTable(rows){if(!rows.length)return '<div class="empty">Nenhum agendamento encontrado.</div>';return `<div class="table-wrap"><table><thead><tr><th>Data e hora</th><th>Pet</th><th>Tutor</th><th>Contato</th><th>Motivo</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${new Date(a.data_hora).toLocaleString('pt-BR')}</td><td>${esc(a.pet)}</td><td>${esc(a.tutor)}</td><td>${esc(a.telefone||'')}</td><td>${esc(a.motivo||'—')}</td></tr>`).join('')}</tbody></table></div>`;}
async function renderTutores(){
 const rows=await api('/tutores');
 pageContent.innerHTML=`<section class="panel"><div class="panel-head"><h3>Cadastro e gerenciamento de tutores</h3><button class="primary" id="newTutor">+ Novo tutor</button></div><div class="toolbar"><input id="searchTutor" placeholder="Buscar por nome, e-mail ou telefone"><button class="secondary" id="searchBtn">Buscar</button></div><div id="tutorTable">${tutorTable(rows)}</div></section>`;
 $('#newTutor').onclick=()=>tutorForm();$('#searchBtn').onclick=searchTutors;$('#searchTutor').onkeydown=e=>{if(e.key==='Enter')searchTutors();};
}
function tutorTable(rows){if(!rows.length)return '<div class="empty">Nenhum tutor encontrado.</div>';return `<div class="table-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>CPF (descriptografado para usuário autenticado)</th><th>Ações</th></tr></thead><tbody>${rows.map(t=>`<tr><td>${esc(t.nome)}</td><td>${esc(t.email)}</td><td>${esc(t.telefone)}</td><td>${esc(t.cpf)}</td><td><div class="actions"><button class="small-btn" onclick="editTutor(${t.id})">Editar</button><button class="small-btn danger" onclick="deleteTutor(${t.id})">Excluir</button></div></td></tr>`).join('')}</tbody></table></div>`;}
async function searchTutors(){try{$('#tutorTable').innerHTML=tutorTable(await api('/tutores?busca='+encodeURIComponent($('#searchTutor').value)));}catch(e){toast(e.message);}}
function tutorForm(t={}){pageContent.innerHTML=`<section class="panel"><div class="panel-head"><h3>${t.id?'Editar':'Novo'} tutor</h3><button class="secondary" id="back">Voltar</button></div><form id="tutorForm" class="form-grid"><label>Nome completo<input name="nome" required value="${esc(t.nome||'')}"></label><label>E-mail<input name="email" type="email" required value="${esc(t.email||'')}"></label><label>Telefone<input name="telefone" required value="${esc(t.telefone||'')}"></label><label>CPF<input name="cpf" required maxlength="14" value="${esc(t.cpf||'')}" placeholder="000.000.000-00"></label><div class="wide modal-actions"><button type="button" class="secondary" id="cancel">Cancelar</button><button class="primary">Salvar tutor</button></div></form></section>`;
 $('#back').onclick=$('#cancel').onclick=()=>go('tutores');$('#tutorForm').onsubmit=async e=>{e.preventDefault();const body=Object.fromEntries(new FormData(e.target));try{await api(t.id?'/tutores/'+t.id:'/tutores',{method:t.id?'PUT':'POST',body:JSON.stringify(body)});toast('Tutor salvo com sucesso.');go('tutores');}catch(err){toast(err.message);}};
}
async function editTutor(id){try{const t=(await api('/tutores')).find(x=>x.id===id);if(t)tutorForm(t);}catch(e){toast(e.message);}}
async function deleteTutor(id){if(!confirm('Confirma a exclusão deste tutor?'))return;try{await api('/tutores/'+id,{method:'DELETE'});toast('Tutor excluído.');renderTutores();}catch(e){toast(e.message);}}
async function renderPets(){
 const [pets,tutors]=await Promise.all([api('/pets'),api('/tutores')]);
 pageContent.innerHTML=`<section class="panel"><div class="panel-head"><h3>Cadastro de pets</h3></div><form id="petForm" class="form-grid"><label>Nome do pet<input name="nome" required></label><label>Espécie<input name="especie" required placeholder="Cão, gato..."></label><label>Raça<input name="raca"></label><label>Data de nascimento<input name="data_nascimento" type="date"></label><label>Sexo<select name="sexo"><option value="">Não informado</option><option>Macho</option><option>Fêmea</option></select></label><label>Tutor responsável<select name="tutor_id" required><option value="">Selecione um tutor</option>${tutors.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label><div class="wide modal-actions"><button class="primary">Cadastrar pet</button></div></form></section><section class="panel"><div class="panel-head"><h3>Pets cadastrados</h3></div>${pets.length?`<div class="table-wrap"><table><thead><tr><th>Pet</th><th>Espécie</th><th>Raça</th><th>Tutor</th></tr></thead><tbody>${pets.map(p=>`<tr><td>${esc(p.nome)}</td><td>${esc(p.especie)}</td><td>${esc(p.raca||'—')}</td><td>${esc(p.tutor)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Nenhum pet cadastrado.</div>'}</section>`;
 $('#petForm').onsubmit=async e=>{e.preventDefault();try{await api('/pets',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});toast('Pet cadastrado.');renderPets();}catch(err){toast(err.message);}};
}
async function renderAgendamentos(){
 const rows=await api('/agendamentos');
 pageContent.innerHTML=`<section class="panel"><div class="panel-head"><h3>Agenda da clínica</h3><span class="muted">${rows.length} registro(s)</span></div>${rows.length?`<div class="table-wrap"><table><thead><tr><th>Data e hora</th><th>Pet</th><th>Tutor</th><th>Contato</th><th>Motivo</th><th>Status</th><th>Ação</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${new Date(a.data_hora).toLocaleString('pt-BR')}</td><td>${esc(a.pet)} · ${esc(a.especie)}</td><td>${esc(a.tutor)}</td><td>${esc(a.telefone||'')}</td><td>${esc(a.motivo||'—')}</td><td>${esc(a.status)}</td><td><button class="small-btn" onclick="changeDate(${a.id},'${new Date(a.data_hora).toISOString()}')">Alterar data</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Nenhum agendamento cadastrado.</div>'}</section>`;
}
async function changeDate(id,current){const value=prompt('Nova data e hora (AAAA-MM-DDTHH:mm):',current.slice(0,16));if(!value)return;try{await api('/agendamentos/'+id+'/data',{method:'PUT',body:JSON.stringify({data_hora:value})});toast('Agendamento atualizado.');renderAgendamentos();}catch(e){toast(e.message);}}
(async()=>{try{const d=await api('/auth/me');showApp(d.usuario);}catch{showLogin();}})();
