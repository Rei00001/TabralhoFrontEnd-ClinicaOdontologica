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

  // Dados simulados (para o localstorage inicializar)
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

  //FUNÇÕES
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

  // Carrega contatos (admin -> client)
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

    // Atualiza também o card inicial (chips)
    renderInicioChips();
  }

  // Carrega disponibilidade e mostra nos chips (dias e horário) do card inicial e seção contato
  function carregarHorariosCliente() {
    const disp = JSON.parse(localStorage.getItem("disponibilidade") || "{}");
    const contatoAtend = document.getElementById("contatoAtendimento");
    const diasStr = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

    if (contatoAtend && disp.dias) {
      const diasAtendimento = Array.isArray(disp.dias) ? disp.dias.map(d => diasStr[d]).join("–") : "—";
      contatoAtend.textContent = `${diasAtendimento}, ${disp.inicio || ''}–${disp.fim || ''}`;
    }

    // Atualiza também o card inicial (chips)
    renderInicioChips();
  }

  // Renderiza os chips do card "inicio" (dias+horário, endereço, estacionamento)
  function renderInicioChips() {
    const inicioCard = document.querySelector('.view[data-view="inicio"] .card');
    if (!inicioCard) return;

    // encontra/garante container .stack (o stack com chips é o que fica logo abaixo do parágrafo)
    let stack = inicioCard.querySelector('.stack.mt-2') || inicioCard.querySelector('.stack');
    if (!stack) {
      // cria um stack antes dos botões
      stack = document.createElement('div');
      stack.className = 'stack mt-2';
      const ref = inicioCard.querySelector('.stack.mt-3') || inicioCard.querySelector('.stack') || inicioCard.firstChild;
      inicioCard.insertBefore(stack, ref);
    }

    // garante exatamente 3 spans/chips dentro do stack (manter ordem previsível)
    while (stack.querySelectorAll('span').length < 3) {
      const sp = document.createElement('span');
      sp.className = 'chip';
      sp.textContent = '—';
      stack.appendChild(sp);
    }
    // se houver mais, não removemos — apenas usamos os primeiros 3
    const spans = stack.querySelectorAll('span');

    // carregar dados
    const contatos = JSON.parse(localStorage.getItem("contatos") || "{}");
    const disp = JSON.parse(localStorage.getItem("disponibilidade") || "{}");
    const diasStr = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

    // primeiro chip: dias + horário (ex: Seg–Ter–Qua 09:00–18:00)
    const diasAtendimento = Array.isArray(disp.dias) && disp.dias.length ? disp.dias.map(d => diasStr[d]).join("–") : "—";
    const inicio = disp.inicio || "";
    const fim = disp.fim || "";
    spans[0].textContent = diasAtendimento === "—" ? "Horário indisponível" : `${diasAtendimento} ${inicio}–${fim}`;

    // segundo chip: endereço (pega do contatos)
    spans[1].textContent = contatos.endereco || "Bairro Central";

    // terceiro chip: texto fixo (mantive "Estacionamento", mas você pode personalizar)
    spans[2].textContent = "Estacionamento";
  }

  // Formata data DD/MM
  function formatarDiaMes(d) {
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth()+1).padStart(2, "0");
    return `${dia}/${mes}`;
  }

  // Helper que retorna true se horario está na pausa almoço (12:00–13:00)
  function ehPausaAlmoco(horaObj) {
    // horaObj: [hh, mm]
    return horaObj[0] === 12;
  }

  // Gera horários livres (hoje e amanhã) respeitando disponibilidade e pausa almoço
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
        // Se hora está na pausa, avançar para 13:00 e continuar
        if (ehPausaAlmoco(hora)) {
          hora = [13, 0];
        }

        // verificar novamente condição fim após ajuste
        if (!(hora[0] < fim[0] || (hora[0] === fim[0] && hora[1] + disponibilidade.intervalo <= fim[1]))) break;

        const hStr = hora.map(n => String(n).padStart(2,"0")).join(":");
        const dataStr = d.toISOString().split("T")[0];
        const ocupado = agendamentos.some(a => a.data===dataStr && a.hora===hStr && a.status!=="cancelada");

        if (!ocupado) {
          const div = document.createElement("div");
          div.classList.add("chip");
          div.textContent = `${formatarDiaMes(d)} - ${hStr}`;
          div.addEventListener("click", () => {
            document.getElementById("inputData").value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
            atualizarSelectHora();
            document.getElementById("selectHora").value = hStr;
            navegarPara("agendar");
          });
          lista.appendChild(div);
        }

        // incrementa intervalo
        hora[1] += disponibilidade.intervalo;
        if (hora[1] >= 60) {
          hora[0] += Math.floor(hora[1]/60);
          hora[1] = hora[1]%60;
        }
      }
    });
  }

  // Atualiza select de horas com base em inputData (respeita disponibilidade e pausa almoço)
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
      if (ehPausaAlmoco(hora)) {
        hora = [13, 0];
      }
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

  //BLOQUEIO DE DATAS INVÁLIDAS
  const inputData = document.getElementById("inputData");
  function atualizarInputData() {
    if (!inputData) return;
    const disponibilidade = JSON.parse(localStorage.getItem("disponibilidade") || "{}");
    if (!disponibilidade.dias) return;

    // data mínima = hoje
    const hoje = new Date();
    inputData.setAttribute("min", hoje.toISOString().split("T")[0]);

    // validação ao digitar/escolher
    inputData.addEventListener("input", () => {
      if (!inputData.value) { atualizarSelectHora(); return; }
      const dataSelecionada = new Date(inputData.value);
      if (!disponibilidade.dias.includes(dataSelecionada.getDay())) {
        alert("Esta data não está disponível para agendamento!");
        inputData.value = "";
        atualizarSelectHora(); // limpa horários
      } else {
        atualizarSelectHora();
      }
    });
  }

  //FORM AGENDAR
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
      // mensagem para o usuário
      if (msgAgendar) {
        msgAgendar.textContent = "Aguarde a aprovação, obrigado";
        setTimeout(()=> msgAgendar.textContent = "", 5000);
      } else {
        alert("Aguarde a aprovação, obrigado");
      }
      navegarPara("inicio");
    });
  }

  //STATUS SNAPSHOT (para detectar aprovações)
  function buildStatusSnapshot() {
    const ags = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    const snap = {};
    ags.forEach(a => snap[a.id] = a.status);
    sessionStorage.setItem("agdsStatusSnapshot", JSON.stringify(snap));
    return snap;
  }
  // inicial snapshot
  if (!sessionStorage.getItem("agdsStatusSnapshot")) buildStatusSnapshot();

  // Quando o localStorage muda em outra aba
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

    // detectar aprovações: se agendamentos mudou
    if (ev.key === "agendamentos") {
      // compara snapshot
      const prevSnap = JSON.parse(sessionStorage.getItem("agdsStatusSnapshot") || "{}");
      const ags = JSON.parse(ev.newValue || "[]");
      let foundApproval = false;
      ags.forEach(a => {
        const prev = prevSnap[a.id];
        if (prev && prev !== a.status && a.status === "aprovada") {
          // nova aprovação
          foundApproval = true;
        }
      });
      // atualiza snapshot
      buildStatusSnapshot();
      if (foundApproval) {
        // mostra notificação ao usuário
        if (msgAgendar) {
          msgAgendar.textContent = "Agenda confirmada";
          setTimeout(()=> msgAgendar.textContent = "", 7000);
        }
        alert("Agenda confirmada");
      }
    }
  });

  // Focus/visibility recarrega (garante atualização quando volta à aba)
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

  // Atualiza horários ao mudar data (change event)
  if (document.getElementById("inputData")) {
    document.getElementById("inputData").addEventListener("change", atualizarSelectHora);
  }
});
