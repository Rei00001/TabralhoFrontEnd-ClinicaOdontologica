// admin.js
document.addEventListener("DOMContentLoaded", () => {
  const tbodyAgds = document.getElementById("tbodyAgendamentos");
  const tbodyServicosAdmin = document.getElementById("tbodyServicosAdmin");
  const formConfig = document.getElementById("formConfig");
  const msgConfig = document.getElementById("msgConfig");

  // ---------- AGENDAMENTOS ----------
  function carregarAgendamentos() {
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    const servicos = JSON.parse(localStorage.getItem("servicos") || "[]");
    if(!tbodyAgds) return;
    tbodyAgds.innerHTML = "";
    agendamentos.forEach(a => {
      const s = servicos.find(s=>s.id==a.servicoId);
      tbodyAgds.innerHTML += `<tr>
        <td><span class="status" data-type="${a.status}">${a.status}</span></td>
        <td>${a.data}</td>
        <td>${a.hora}</td>
        <td>${a.nome}</td>
        <td>${a.tel}</td>
        <td>${s ? s.nome : "—"}</td>
        <td>${a.obs}</td>
        <td>
          <button class="btn" onclick="alterarStatus(${a.id},'aprovada')">Aprovar</button>
          <button class="btn muted" onclick="alterarStatus(${a.id},'cancelada')">Cancelar</button>
        </td>
      </tr>`;
    });
  }

  // Retorna true se alterou (usado opcionalmente)
  window.alterarStatus = function(id,status) {
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    const idx = agendamentos.findIndex(a=>a.id===id);
    if(idx>=0) {
      agendamentos[idx].status = status;
      localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
      carregarAgendamentos();
      // após salvar, podemos atualizar msgConfig temporariamente
      if (msgConfig) {
        msgConfig.textContent = "Status atualizado.";
        setTimeout(()=> msgConfig.textContent = "", 2000);
      }
      return true;
    }
    return false;
  }

  // ---------- SERVIÇOS ----------
  function carregarServicosAdmin() {
    const servicos = JSON.parse(localStorage.getItem("servicos") || "[]");
    if(!tbodyServicosAdmin) return;
    tbodyServicosAdmin.innerHTML = "";
    servicos.forEach(s => {
      tbodyServicosAdmin.innerHTML += `<tr>
        <td><input type="text" value="${s.nome}" onchange="editarServico(${s.id},'nome',this.value)"></td>
        <td><input type="number" value="${s.duracao}" onchange="editarServico(${s.id},'duracao',this.value)"></td>
        <td><input type="number" value="${s.preco}" step="0.01" onchange="editarServico(${s.id},'preco',this.value)"></td>
        <td><button class="btn muted" onclick="removerServico(${s.id})">Remover</button></td>
      </tr>`;
    });
  }

  window.editarServico = function(id,prop,valor){
    const servicos = JSON.parse(localStorage.getItem("servicos") || "[]");
    const s = servicos.find(s=>s.id==id);
    if(s) s[prop] = prop==="preco"||prop==="duracao"? parseFloat(valor):valor;
    localStorage.setItem("servicos", JSON.stringify(servicos));
  }

  window.removerServico = function(id){
    let servicos = JSON.parse(localStorage.getItem("servicos") || "[]");
    servicos = servicos.filter(s=>s.id!=id);
    localStorage.setItem("servicos", JSON.stringify(servicos));
    carregarServicosAdmin();
  }

  document.getElementById("btnAddServico").addEventListener("click", () => {
    const nome = document.getElementById("novoNome").value;
    const duracao = parseFloat(document.getElementById("novoDuracao").value);
    const preco = parseFloat(document.getElementById("novoPreco").value);
    if(!nome||!duracao||!preco) return alert("Preencha todos os campos");
    const servicos = JSON.parse(localStorage.getItem("servicos") || "[]");
    servicos.push({id: Date.now(), nome, duracao, preco});
    localStorage.setItem("servicos", JSON.stringify(servicos));
    carregarServicosAdmin();
    document.getElementById("novoNome").value = "";
    document.getElementById("novoDuracao").value = "";
    document.getElementById("novoPreco").value = "";
  });

  // ---------- CONTATOS ----------
  const formContatos = document.getElementById("formContatos");
  const msgContatos = document.getElementById("msgContatos");
  if (formContatos) {
    // Preenche form com valores atuais, se existirem
    const contatosAtuais = JSON.parse(localStorage.getItem("contatos") || "{}");
    if (contatosAtuais) {
      formContatos.endereco.value = contatosAtuais.endereco || "";
      formContatos.whatsapp.value = contatosAtuais.whatsapp || "";
      formContatos.email.value = contatosAtuais.email || "";
      formContatos.mapaUrl.value = contatosAtuais.mapaUrl || "";
    }

    formContatos.addEventListener("submit", e => {
      e.preventDefault();
      const contatos = {
        endereco: formContatos.endereco.value,
        whatsapp: formContatos.whatsapp.value,
        email: formContatos.email.value,
        mapaUrl: formContatos.mapaUrl.value
      };
      localStorage.setItem("contatos", JSON.stringify(contatos));
      msgContatos.textContent = "Contatos salvos!";
      setTimeout(() => msgContatos.textContent = "", 3000);
    });
  }

  // ---------- HORÁRIOS / DIAS ----------
  if (formConfig) {
    // Preenche com config existente
    const cfg = JSON.parse(localStorage.getItem("disponibilidade") || "{}");
    if (cfg && cfg.dias) {
      // marcar checkboxes
      const inputsDias = Array.from(formConfig.querySelectorAll('input[name="dias"]'));
      inputsDias.forEach(inp => {
        inp.checked = cfg.dias.includes(parseInt(inp.value));
      });
      if (formConfig.inicio) formConfig.inicio.value = cfg.inicio || formConfig.inicio.value;
      if (formConfig.fim) formConfig.fim.value = cfg.fim || formConfig.fim.value;
      if (formConfig.intervalo) formConfig.intervalo.value = cfg.intervalo || formConfig.intervalo.value;
      if (formConfig.obs) formConfig.obs.value = cfg.obs || "";
    }

    formConfig.addEventListener("submit", e => {
      e.preventDefault();
      const dias = Array.from(formConfig.querySelectorAll('input[name="dias"]:checked')).map(d => parseInt(d.value));
      const inicio = formConfig.inicio.value;
      const fim = formConfig.fim.value;
      const intervalo = parseInt(formConfig.intervalo.value);
      const obs = formConfig.obs.value;
      const config = { dias, inicio, fim, intervalo, obs };
      localStorage.setItem("disponibilidade", JSON.stringify(config));
      msgConfig.textContent = "Horários salvos!";
      setTimeout(() => msgConfig.textContent = "", 3000);
    });
  }

  const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    // Limpa sessionStorage, se quiser
    sessionStorage.clear();
    // Redireciona para login.html
    window.location.href = "index.html";
  });
}


  // Inicializa
  carregarAgendamentos();
  carregarServicosAdmin();
});


