let appointments = [
  { status: 'Confirmado', data: '2025-09-25', hora: '10:00', nome: 'Ana Silva', contato: '99329-1234', servico: 'Consulta', obs: '' },
  { status: 'Pendente', data: '2025-09-26', hora: '11:30', nome: 'Carlos Souza', contato: '98488-4321', servico: 'Limpeza', obs: 'Trazer exames' },
  { status: 'Cancelado', data: '2025-09-27', hora: '14:00', nome: 'Marina Costa', contato: '94377-9876', servico: 'Clareamento', obs: '' }
];

function renderAppointments() {
  const tbody = document.getElementById("appointmentTable");
  const search = document.getElementById("search").value.toLowerCase();
  tbody.innerHTML = "";

  appointments
    .filter(a => a.nome.toLowerCase().includes(search) || a.data.includes(search))
    .forEach((a, index) => {
      tbody.innerHTML += `
        <tr>
          <td>${a.status}</td>
          <td>${a.data}</td>
          <td>${a.hora}</td>
          <td><input type="text" value="${a.nome}" onchange="updateName(${index}, this.value)" /></td>
          <td>${a.contato}</td>
          <td>${a.servico}</td>
          <td>${a.obs}</td>
          <td><button onclick="deleteAppointment(${index})">Remover</button></td>
        </tr>
      `;
    });
}

function updateName(index, newName) {
  appointments[index].nome = newName;
  renderAppointments();
}

function deleteAppointment(index) {
  if (confirm("Deseja remover este agendamento?")) {
    appointments.splice(index, 1);
    renderAppointments();
  }
}

function exportCSV() {
  const headers = "Status,Data,Hora,Nome,Contato,Serviço,Obs\n";
  const rows = appointments.map(a =>
    `${a.status},${a.data},${a.hora},${a.nome},${a.contato},${a.servico},${a.obs}`
  ).join("\n");

  const blob = new Blob([headers + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "agendamentos.csv";
  link.click();
}

renderAppointments();