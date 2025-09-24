document.addEventListener("DOMContentLoaded", () => {
  // Navegação entre abas
  const navLinks = document.querySelectorAll("nav a");
  const views = document.querySelectorAll(".view");
  const botaoSecoes = document.querySelectorAll("button[data-section]");

  function navegarPara(secao) {
    navLinks.forEach(l => l.classList.remove("active"));
    views.forEach(v => v.classList.remove("is-active"));
    const link = document.querySelector(`nav a[data-section="${secao}"]`);
    if (link) link.classList.add("active");
    const view = document.querySelector(`.view[data-view="${secao}"]`);
    if (view) view.classList.add("is-active");
  }

  navLinks.forEach(link => link.addEventListener("click", () => navegarPara(link.dataset.section)));
  botaoSecoes.forEach(botao => botao.addEventListener("click", () => navegarPara(botao.dataset.section)));

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("usuario"); // remove usuário logado
      window.location.href = "index.html"; // volta para a página inicial/login
    });
  }

  // Dados simulados
  if (!localStorage.getItem("servicos")) {
    localStorage.setItem("servicos", JSON.stringify([
      { id: 1, nome: "Limpeza", duracao: 30, preco: 120.00 },
      { id: 2, nome: "Consulta", duracao: 45, preco: 200.00 }
    ]));
  }
  if (!localStorage.getItem("disponibilidade")) {
    localStorage.setItem("disponibilidade", JSON.stringify({
      dias: [1,2,3,4,5],
      inicio: "09:00",
      fim: "18:00",
      intervalo: 30
    }));
  }
  if (!localStorage.getItem("agendamentos")) {
    localStorage.setItem("agendamentos", JSON.stringify([]));
  }

  // FUNÇÕES
  function carregarServicos() {
    const servicos = JSON.parse(localStorage.getItem("servicos") || "[]");
    const tbody = document.getElementById("tbodyServicos");
    const select = document.getElementById("selectServico");
    if(!tbody || !select) return;
    tbody.innerHTML = "";
    select.innerHTML = '<option value="" disabled selected>Selecione</option>';
    servicos.forEach(s => {
      tbody.innerHTML += `<tr>
        <td>${s.nome}</td>
        <td>${s.duracao} min</td>
        <td>R$ ${s.preco.toFixed(2)}</td>
      </tr>`;
      select.innerHTML += `<option value="${s.id}">${s.nome}</option>`;
    });
  }

  function carregarContatos() {
    const contatos = JSON.parse(localStorage.getItem("contatos") || "{}");
    const enderecoEl = document.getElementById("contatoEndereco");
    const whatsEl = document.getElementById("contatoWhats");
    const emailEl = document.getElementById("contatoEmail");
    if (enderecoEl) enderecoEl.textContent = contatos.endereco || "—";
    if (whatsEl) whatsEl.textContent = contatos.whatsapp || "—";
    if (emailEl) emailEl.textContent = contatos.email || "—";

    const mapaWrap = document.getElementById("mapaWrap");
    if (mapaWrap) {
      mapaWrap.innerHTML = contatos.mapaUrl
        ? `<iframe src="${contatos.mapaUrl}" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`
        : "";
    }

    renderInicioChips();
  }

  function carregarHorariosCliente() {
    const disp = JSON.parse(localStorage.getItem("disponibilidade") || "{}");
    const contatoAtend = document.getElementById("contatoAtendimento");
    const diasStr = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
    if (contatoAtend && disp.dias) {
      const diasAtendimento = Array.isArray(disp.dias) ? disp.dias.map(d => diasStr[d]).join("–") : "—";
      contatoAtend.textContent = `${diasAtendimento}, ${disp.inicio || ''}–${disp.fim || ''}`;
    }
    renderInicioChips();
  }

  function renderInicioChips() {
    const inicioCard = document.querySelector('.view[data-view="inicio"] .card');
    if (!inicioCard) return;
    let stack = inicioCard.querySelector('.stack.mt-2') || inicioCard.querySelector('.stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'stack mt-2';
      const ref = inicioCard.querySelector('.stack.mt-3') || inicioCard.querySelector('.stack') || inicioCard.firstChild;
      inicioCard.insertBefore(stack, ref);
    }
    while (stack.querySelectorAll('span').length < 3) {
      const sp = document.createElement('span');
      sp.className = 'chip';
      sp.textContent = '—';
      stack.appendChild(sp);
    }
    const spans = stack.querySelectorAll('span');
    const contatos = JSON.parse(localStorage.getItem("contatos") || "{}");
    const disp = JSON.parse(localStorage.getItem("disponibilidade") || "{}");
    const diasStr = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
    const diasAtendimento = Array.isArray(disp.dias) && disp.dias.length ? disp.dias.map(d => diasStr[d]).join("–") : "—";
    const inicio = disp.inicio || "";
    const fim = disp.fim || "";
    spans[0].textContent = diasAtendimento === "—" ? "Horário indisponível" : `${diasAtendimento} ${inicio}–${fim}`;
    spans[1].textContent = contatos.endereco || "Bairro Central";
    spans[2].textContent = "Estacionamento";
  }

  function formatarDiaMes(d) {
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth()+1).padStart(2, "0");
    return `${dia}/${mes}`;
  }

  function ehPausaAlmoco(horaObj) {
    return horaObj[0] === 12;
  }

  function gerarHorariosLivres() {
    const disponibilidade = JSON.parse(localStorage.getItem("disponibilidade") || "{}");
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    const lista = document.getElementById("listaHorariosLivres");
    if(!lista) return;
    lista.innerHTML = "";
    if(!disponibilidade.dias) return;

    const datas = [new Date(), new Date(Date.now() + 86400000)];
    datas.forEach(d => {
      const diaSemana = d.getDay();
      if (!disponibilidade.dias.includes(diaSemana)) return;
      let hora = disponibilidade.inicio.split(":").map(Number);
      const fim = disponibilidade.fim.split(":").map(Number);

      while (hora[0] < fim[0] || (hora[0] === fim[0] && hora[1] + disponibilidade.intervalo <= fim[1])) {
        if (ehPausaAlmoco(hora)) hora = [13, 0];
        if (!(hora[0] < fim[0] || (hora[0] === fim[0] && hora[1] + disponibilidade.intervalo <= fim[1]))) break;

        const hStr = hora.map(n => String(n).padStart(2,"0")).join(":");
        const dataStr = d.toISOString().split("T")[0];
        const ocupado = agendamentos.some(a => a.data===dataStr && a.hora===hStr && a.status!=="cancelada");

        if (!ocupado) {
          const div = document.createElement("div");
          div.classList.add("chip");
          div.textContent = `${formatarDiaMes(d)} - ${hStr}`;

          // Clique no horário mostra mensagem e preenche o form
          div.addEventListener("click", () => {
            const inputDataEl = document.getElementById("inputData");
            const selectHoraEl = document.getElementById("selectHora");
            const msgAgendarEl = document.getElementById("msgAgendar");

            inputDataEl.value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
            atualizarSelectHora();
            selectHoraEl.value = hStr;

            if(msgAgendarEl){
              msgAgendarEl.textContent = "Agenda feita! Por favor, aguarde confirmação";
              setTimeout(()=> msgAgendarEl.textContent = "", 5000);
            } else {
              alert("Agenda feita! Por favor, aguarde confirmação");
            }
          });

          lista.appendChild(div);
        }

        hora[1] += disponibilidade.intervalo;
        if (hora[1] >= 60) {
          hora[0] += Math.floor(hora[1]/60);
          hora[1] = hora[1]%60;
        }
      }
    });
  }

  function atualizarSelectHora() {
    const inputDataVal = document.getElementById("inputData").value;
    const selectHora = document.getElementById("selectHora");
    if(!selectHora) return;
    selectHora.innerHTML = '<option value="" disabled selected>Selecione a data</option>';
    if (!inputDataVal) return;
    const disponibilidade = JSON.parse(localStorage.getItem("disponibilidade") || "{}");
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    const diaSemana = new Date(inputDataVal).getDay();
    if (!disponibilidade.dias || !disponibilidade.dias.includes(diaSemana)) return;

    let hora = disponibilidade.inicio.split(":").map(Number);
    const fim = disponibilidade.fim.split(":").map(Number);

    while (hora[0] < fim[0] || (hora[0] === fim[0] && hora[1] + disponibilidade.intervalo <= fim[1])) {
      if (ehPausaAlmoco(hora)) hora = [13, 0];
      if (!(hora[0] < fim[0] || (hora[0] === fim[0] && hora[1] + disponibilidade.intervalo <= fim[1]))) break;

      const hStr = hora.map(n => String(n).padStart(2,"0")).join(":");
      const ocupado = agendamentos.some(a => a.data===inputDataVal && a.hora===hStr && a.status!=="cancelada");

      if (!ocupado) selectHora.innerHTML += `<option value="${hStr}">${hStr}</option>`;

      hora[1] += disponibilidade.intervalo;
      if (hora[1] >= 60) {
        hora[0] += Math.floor(hora[1]/60);
        hora[1] = hora[1]%60;
      }
    }
  }

  const inputData = document.getElementById("inputData");
  function atualizarInputData() {
    if (!inputData) return;
    const disponibilidade = JSON.parse(localStorage.getItem("disponibilidade") || "{}");
    if (!disponibilidade.dias) return;

    const hoje = new Date();
    inputData.setAttribute("min", hoje.toISOString().split("T")[0]);
    inputData.addEventListener("input", () => {
      if (!inputData.value) { atualizarSelectHora(); return; }
      const dataSelecionada = new Date(inputData.value);
      if (!disponibilidade.dias.includes(dataSelecionada.getDay())) {
        alert("Esta data não está disponível para agendamento!");
        inputData.value = "";
        atualizarSelectHora();
      } else atualizarSelectHora();
    });
  }

  // FORM AGENDAR
  const formAgendar = document.getElementById("formAgendar");
  const msgAgendar = document.getElementById("msgAgendar");
  if (formAgendar) {
    formAgendar.addEventListener("submit", e => {
      e.preventDefault();
      const form = e.target;
      const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
      const novo = {
        id: Date.now(),
        nome: form.nome.value,
        tel: form.tel.value,
        email: form.email.value,
        servicoId: form.servicoId.value,
        data: form.data.value,
        hora: form.hora.value,
        obs: form.obs.value,
        status: "pendente"
      };
      agendamentos.push(novo);
      localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
      form.reset();
      gerarHorariosLivres();

      if (msgAgendar) {
        msgAgendar.textContent = "Agenda feita! Por favor, aguarde confirmação";
        setTimeout(()=> msgAgendar.textContent = "", 5000);
      } else {
        alert("Agenda feita! Por favor, aguarde confirmação");
      }

      // Atualiza snapshot e exibe mensagem se status mudar (mesma aba)
      const prevSnap = JSON.parse(sessionStorage.getItem("agdsStatusSnapshot") || "{}");
      const ags = JSON.parse(localStorage.getItem("agendamentos") || "[]");
      let mensagem = "";
      ags.forEach(a => {
        const prev = prevSnap[a.id];
        if (prev && prev !== a.status) {
          if (a.status === "aprovada") mensagem = "Agenda confirmada";
          if (a.status === "cancelada") mensagem = "Agenda cancelada";
        }
      });
      buildStatusSnapshot();
      if (mensagem && msgAgendar) {
        msgAgendar.textContent = mensagem;
        setTimeout(() => msgAgendar.textContent = "", 7000);
      }
    });
  }

  // STATUS SNAPSHOT
  function buildStatusSnapshot() {
    const ags = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    const snap = {};
    ags.forEach(a => snap[a.id] = a.status);
    sessionStorage.setItem("agdsStatusSnapshot", JSON.stringify(snap));
    return snap;
  }
  if (!sessionStorage.getItem("agdsStatusSnapshot")) buildStatusSnapshot();

  // DETECTAR APROVAÇÕES OU CANCELAMENTOS
  window.addEventListener("storage", (ev) => {
    if (!ev.key) return;
    const keysToReact = ["contatos", "disponibilidade", "servicos", "agendamentos"];
    if (keysToReact.includes(ev.key)) {
      carregarServicos();
      carregarContatos();
      carregarHorariosCliente();
      gerarHorariosLivres();
      atualizarInputData();
    }

    if (ev.key === "agendamentos") {
      const prevSnap = JSON.parse(sessionStorage.getItem("agdsStatusSnapshot") || "{}");
      const ags = JSON.parse(ev.newValue || "[]");
      let mensagem = "";
      ags.forEach(a => {
        const prev = prevSnap[a.id];
        if (prev && prev !== a.status) {
          if (a.status === "aprovada") mensagem = "Agenda confirmada";
          if (a.status === "cancelada") mensagem = "Agenda cancelada";
        }
      });
      buildStatusSnapshot();
      if (mensagem) {
        if (msgAgendar) {
          msgAgendar.textContent = mensagem;
          setTimeout(() => msgAgendar.textContent = "", 7000);
        } else alert(mensagem);
      }
    }
  });

  function recarregarTudo() {
    carregarServicos();
    carregarContatos();
    carregarHorariosCliente();
    gerarHorariosLivres();
    atualizarInputData();
    buildStatusSnapshot();
  }
  window.addEventListener("focus", recarregarTudo);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") recarregarTudo();
  });

  // Inicialização
  carregarServicos();
  carregarContatos();
  carregarHorariosCliente();
  gerarHorariosLivres();
  atualizarInputData();
  buildStatusSnapshot();

  if (inputData) inputData.addEventListener("change", atualizarSelectHora);
});

