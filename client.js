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
      localStorage.removeItem("usuario");
      window.location.href = "https://rei00001.github.io/TabralhoFrontEnd-ClinicaOdontologica/";
    });
  }

  // Dados simulados
  if (!localStorage.getItem("servicos")) {
    localStorage.setItem("servicos", JSON.stringify([
      { id: 1, nome: "Consulta/CheckUp", duracao: 30, preco: 120.00 },
      { id: 2, nome: "Limpeza/Profilaxia", duracao: 60, preco: 180.00 },
      { id: 3, nome: "Restauração Simples", duracao: 60, preco: 250.00 },
      { id: 4, nome: "Urgência (dor)", duracao: 60, preco: 200.00 }
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

  if (!localStorage.getItem("contatos")) {
    localStorage.setItem("contatos", JSON.stringify({
      endereco: "Rua Exemplo, 123, Bairro Central",
      whatsapp: "(21) 90000-0000",
      email: "contato@checkup.com",
      mapaUrl: ""
    }));
  }

  // Elementos globais
  const inputData = document.getElementById("inputData");
  const selectHora = document.getElementById("selectHora");
  const msgAgendar = document.getElementById("msgAgendar");

  // Funções auxiliares
  function formatarDiaMes(d) {
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth()+1).padStart(2, "0");
    return `${dia}/${mes}`;
  }

  function ehPausaAlmoco(horaObj) {
    return horaObj[0] === 12;
  }

  // Carregamento de serviços
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

  // Carregamento de contatos
  function carregarContatos() {
    const contatos = JSON.parse(localStorage.getItem("contatos") || "{}");
    const enderecoEl = document.getElementById("contatoEndereco");
    const whatsEl = document.getElementById("contatoWhats");
    const emailEl = document.getElementById("contatoEmail");
    if(enderecoEl) enderecoEl.textContent = contatos.endereco || "—";
    if(whatsEl) whatsEl.textContent = contatos.whatsapp || "—";
    if(emailEl) emailEl.textContent = contatos.email || "—";

    const mapaWrap = document.getElementById("mapaWrap");
    if (mapaWrap) {
      mapaWrap.innerHTML = contatos.mapaUrl
        ? `<iframe src="${contatos.mapaUrl}" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`
        : "";
    }
    renderInicioChips();
  }

  // Render início chips
  function renderInicioChips() {
    const inicioCard = document.querySelector('.view[data-view="inicio"] .card');
    if (!inicioCard) return;
    let stack = inicioCard.querySelector('.stack.mt-2') || inicioCard.querySelector('.stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'stack mt-2';
      inicioCard.appendChild(stack);
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
    spans[0].textContent = diasAtendimento === "—" ? "Horário indisponível" : `${diasAtendimento} ${disp.inicio || ""}–${disp.fim || ""}`;
    spans[1].textContent = contatos.endereco || "Bairro Central";
    spans[2].textContent = "Estacionamento";
  }

  // Gerar horários livres
  function gerarHorariosLivres() {
    if (!inputData) return;
    const disponibilidade = JSON.parse(localStorage.getItem("disponibilidade") || "{}");
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    const lista = document.getElementById("listaHorariosLivres");
    if(!lista) return;
    lista.innerHTML = "";
    if(!disponibilidade.dias) return;

    const datas = [new Date(), new Date(Date.now() + 86400000)];
    datas.forEach(d => {
      if (!disponibilidade.dias.includes(d.getDay())) return;
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
          div.addEventListener("click", () => {
            if(inputData && selectHora){
              inputData.value = dataStr;
              atualizarSelectHora();
              selectHora.value = hStr;
            }
            if(msgAgendar){
              msgAgendar.textContent = "Agenda feita! Por favor, aguarde confirmação";
              setTimeout(()=> msgAgendar.textContent = "", 5000);
            }
          });
          lista.appendChild(div);
        }

        hora[1] += disponibilidade.intervalo;
        if (hora[1] >= 60) {
          hora[0] += Math.floor(hora[1]/60);
          hora[1] %= 60;
        }
      }
    });
  }

  // Atualizar select de horas
  function atualizarSelectHora() {
    if(!inputData || !selectHora) return;
    selectHora.innerHTML = '<option value="" disabled selected>Selecione a data</option>';
    if(!inputData.value) return;

    const disponibilidade = JSON.parse(localStorage.getItem("disponibilidade") || "{}");
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    const diaSemana = new Date(inputData.value).getDay();
    if(!disponibilidade.dias || !disponibilidade.dias.includes(diaSemana)) return;

    let hora = disponibilidade.inicio.split(":").map(Number);
    const fim = disponibilidade.fim.split(":").map(Number);

    while(hora[0] < fim[0] || (hora[0] === fim[0] && hora[1] + disponibilidade.intervalo <= fim[1])){
      if(ehPausaAlmoco(hora)) hora = [13,0];
      const hStr = hora.map(n => String(n).padStart(2,"0")).join(":");
      const ocupado = agendamentos.some(a => a.data===inputData.value && a.hora===hStr && a.status!=="cancelada");
      if(!ocupado) selectHora.innerHTML += `<option value="${hStr}">${hStr}</option>`;
      hora[1] += disponibilidade.intervalo;
      if(hora[1] >= 60){
        hora[0] += Math.floor(hora[1]/60);
        hora[1] %= 60;
      }
    }
  }

  // Atualizar input data
  function atualizarInputData(){
    if(!inputData) return;
    const disponibilidade = JSON.parse(localStorage.getItem("disponibilidade") || "{}");
    if(!disponibilidade.dias) return;
    const hoje = new Date();
    inputData.setAttribute("min", hoje.toISOString().split("T")[0]);
    inputData.addEventListener("input", () => {
      if(!inputData.value){ atualizarSelectHora(); return; }
      const dataSelecionada = new Date(inputData.value);
      if(!disponibilidade.dias.includes(dataSelecionada.getDay())){
        alert("Esta data não está disponível para agendamento!");
        inputData.value = "";
      }
      atualizarSelectHora();
    });
  }

  // Inicialização
  carregarServicos();
  carregarContatos();
  gerarHorariosLivres();
  atualizarInputData();
  atualizarSelectHora();
});


