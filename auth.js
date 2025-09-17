// auth.js
(() => {
  // ---------- Utilidades ----------
  const qs = (sel, ctx = document) => ctx.querySelector(sel); // seleciona um elemento
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]; // seleciona vários elementos
  const byId = (id) => document.getElementById(id); // seleciona por ID
  const now = () => Date.now(); // pega a hora atual

  // Armazenamento simples (localStorage)
  const LS_KEYS = {
    USERS: "checkup_users",         // array de {email, pass}
    RESET: "checkup_reset_codes",   // obj: { [email]: { code, exp } }
  };

  const loadUsers = () => JSON.parse(localStorage.getItem(LS_KEYS.USERS) || "[]"); // array
  const saveUsers = (arr) => localStorage.setItem(LS_KEYS.USERS, JSON.stringify(arr)); // array

  const loadResetMap = () => JSON.parse(localStorage.getItem(LS_KEYS.RESET) || "{}"); // obj
  const saveResetMap = (obj) => localStorage.setItem(LS_KEYS.RESET, JSON.stringify(obj)); // obj

  const emailNorm = (e) => (e || "").trim().toLowerCase(); // normaliza email

  const show = (el) => el && (el.hidden = false); // mostra elemento
  const hide = (el) => el && (el.hidden = true); // esconde elemento

  const setText = (el, text = "") => { // seta texto e esconde se vazio
    if (!el) return; // segurança
    el.textContent = text; // pode ser innerText também
    el.hidden = !text; // esconde se vazio
  };

  // Navegação entre as 3 telas
  const views = { // as 3 views principais
    login: byId("viewLogin"), // pode ser null se a view não existir
    cadastro: byId("viewCadastro"), // pode ser null se a view não existir
    reset: byId("viewReset"), // pode ser null se a view não existir
  };
  function go(view) { // "login", "cadastro", "reset"
    Object.values(views).forEach(hide); // esconde todas
    switch (view) { // mostra a desejada
      case "login": show(views.login); break; // default
      case "cadastro": show(views.cadastro); break; // cadastro
      case "reset": show(views.reset); break; // reset
    }
    // limpar mensagens quando muda de tela
    setText(byId("msgLogin"), ""); // limpa todas
    setText(byId("msgSignup"), "");
    setText(byId("msgReset1"), ""); 
    setText(byId("msgReset2"), ""); 
  }

  // Mensagens
  const msg = { // elementos de mensagem
    login: byId("msgLogin"), // pode ser null se a view não existir
    signup: byId("msgSignup"), 
    reset1: byId("msgReset1"), 
    reset2: byId("msgReset2"), 
  };

  // ---------- Elementos ----------
  const el = { // elementos principais
    // Login Cliente
    clientEmail: byId("clientEmail"), // pode ser null se a view não existir
    clientPass: byId("clientPass"), 
    btnLoginCliente: byId("btnLoginCliente"), 

    // Login Admin
    adminEmail: byId("adminEmail"), // pode ser null se a view não existir
    adminPass: byId("Atendimento"),
    btnLoginAdmin: byId("btnLoginAdmin"), 

    // Cadastro
    signupEmail: byId("signupEmail"), // pode ser null se a view não existir
    signupPass: byId("signupPass"), 
    signupPass2: byId("signupPass2"), 
    btnSignup: byId("btnSignup"),

    // Reset passo 1
    resetEmail: byId("resetEmail"), // pode ser null se a view não existir
    btnResetSend: byId("btnResetSend"), // envia código

    // Reset passo 2
    resetStep1: byId("resetStep1"), // passo 1
    resetStep2: byId("resetStep2"), // passo 2
    resetCode: byId("resetCode"), // input do código
    resetPass: byId("resetPass"), // input da nova senha
    resetPass2: byId("resetPass2"), // input da nova senha 2
    btnResetApply: byId("btnResetApply"), // aplica nova senha
    devCodeHint: byId("devCodeHint"), // dica de dev (protótipo)
  };

  // ---------- Validações ----------
  function isValidEmail(e) { // regex simples
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }
  function isValidPass(p) { // mínimo 6 caracteres
    return (p || "").length >= 6;
  }

  // ---------- Cadastro Cliente ----------
  function handleSignup() { // cria conta
    const email = emailNorm(el.signupEmail.value);
    const pass = el.signupPass.value;
    const pass2 = el.signupPass2.value;

    if (!isValidEmail(email)) { // validações
      setText(msg.signup, "Informe um e-mail válido.");
      return;
    }
    if (!isValidPass(pass)) { // mínimo 6 caracteres
      setText(msg.signup, "A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (pass !== pass2) { // senhas conferem
      setText(msg.signup, "As senhas não conferem.");
      return;
    }

    const users = loadUsers(); // carrega usuários
    if (users.some(u => u.email === email)) {
      setText(msg.signup, "E-mail já cadastrado.");
      return;
    }

    users.push({ email, pass }); // adiciona novo usuário
    saveUsers(users);

    setText(msg.signup, "Conta criada com sucesso! Você já pode fazer login.");
    // opcional: já redirecionar para login
    setTimeout(() => go("login"), 800);
  }

  // Login do cliente 
  function handleLoginCliente() { // tenta logar
  const email = emailNorm(el.clientEmail.value);
  const pass = el.clientPass.value;

  if (!isValidEmail(email)) { // validações
    setText(msg.login, "Informe um e-mail válido.");
    return;
  }
  if (!isValidPass(pass)) { // mínimo 6 caracteres
    setText(msg.login, "Senha inválida.");
    return;
  }

  const users = loadUsers(); // carrega usuários
  const user = users.find(u => u.email === email);

  if (!user) { // não achou
    setText(msg.login, "E-mail não cadastrado.");
    return;
  }
  if (user.pass !== pass) { // senha incorreta
    setText(msg.login, "Senha incorreta.");
    return;
  }

  setText(msg.login, ""); // limpa mensagem
  // ✅ redireciona para página do cliente
  window.location.href = "client.html";
}

  // Login Admin
 const ADMIN_FIXED_EMAIL = "admin@checkup.com"; // email fixo
const ADMIN_FIXED_PASS = "12345678"; // senha fixa (pode mudar se quiser)

function handleLoginAdmin() { // tenta logar admin
  const email = emailNorm(el.adminEmail.value);
  const pass = el.adminPass.value;

  // Nada de validação de formato aqui.
  if (email !== ADMIN_FIXED_EMAIL) {
    // Como o campo é readonly, isso só dispara se alguém mudar via DevTools.
    setText(msg.login, "E-mail de admin inválido.");
    return;
  }

  if (pass !== ADMIN_FIXED_PASS) {
    setText(msg.login, "Senha de admin incorreta.");
    return;
  }

  setText(msg.login, "");
  window.location.href = "admin.html";
}



  // ---------- Reset de senha ----------
  const RESET_TTL_MS = 10 * 60 * 1000; // 10 minutos

  function genCode() {
    return String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos
  }

  function handleResetSend() {
    const email = emailNorm(el.resetEmail.value);
    if (!isValidEmail(email)) {
      setText(msg.reset1, "Informe um e-mail válido.");
      return;
    }

    const users = loadUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      setText(msg.reset1, "E-mail não cadastrado.");
      return;
    }

    const code = genCode();
    const map = loadResetMap();
    map[email] = { code, exp: now() + RESET_TTL_MS };
    saveResetMap(map);

    // Troca para passo 2
    hide(el.resetStep1);
    show(el.resetStep2);

    // Mensagens e dica de dev
    setText(msg.reset1, "");
    setText(msg.reset2, "Enviamos um código de 6 dígitos (protótipo: exibido abaixo).");
    el.devCodeHint.hidden = false;
    el.devCodeHint.textContent = `Código para ${email}: ${code}`;
  }

  function handleResetApply() {
    const email = emailNorm(el.resetEmail.value);
    const codeInput = (el.resetCode.value || "").trim();
    const newPass = el.resetPass.value;
    const newPass2 = el.resetPass2.value;

    if (!codeInput || codeInput.length !== 6) {
      setText(msg.reset2, "Informe o código de 6 dígitos.");
      return;
    }
    if (!isValidPass(newPass)) {
      setText(msg.reset2, "A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPass !== newPass2) {
      setText(msg.reset2, "As senhas não conferem.");
      return;
    }

    const map = loadResetMap();
    const entry = map[email];
    if (!entry) {
      setText(msg.reset2, "Solicite um novo código.");
      return;
    }
    if (now() > entry.exp) {
      delete map[email];
      saveResetMap(map);
      setText(msg.reset2, "Código expirado. Solicite um novo.");
      return;
    }
    if (entry.code !== codeInput) {
      setText(msg.reset2, "Código inválido.");
      return;
    }

    // Atualiza senha
    const users = loadUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) {
      setText(msg.reset2, "E-mail não cadastrado.");
      return;
    }
    users[idx].pass = newPass;
    saveUsers(users);

    // Limpa o código usado
    delete map[email];
    saveResetMap(map);

    setText(msg.reset2, "Senha redefinida com sucesso! Você já pode fazer login.");
    setTimeout(() => {
      // Volta ao login
      el.resetEmail.value = "";
      el.resetCode.value = "";
      el.resetPass.value = "";
      el.resetPass2.value = "";
      el.devCodeHint.hidden = true;
      go("login");
    }, 900);
  }

  // ---------- Navegação por data-nav ----------
  qsa("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const dest = btn.getAttribute("data-nav");
      if (dest === "login") go("login");
      if (dest === "cadastro") go("cadastro");
      if (dest === "reset") {
        // Sempre abrir reset no passo 1 limpo
        show(el.resetStep1);
        hide(el.resetStep2);
        setText(msg.reset1, "");
        setText(msg.reset2, "");
        el.devCodeHint.hidden = true;
        go("reset");
      }
    });
  });

  // ---------- Listeners principais ----------
  el.btnSignup.addEventListener("click", handleSignup);
  el.btnLoginCliente.addEventListener("click", handleLoginCliente);
  el.btnLoginAdmin.addEventListener("click", handleLoginAdmin);
  el.btnResetSend.addEventListener("click", handleResetSend);
  el.btnResetApply.addEventListener("click", handleResetApply);

  // Enter para enviar (qualquer campo dentro da view visível)
  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    // Decide ação com base na tela visível
    if (!views.login.hidden) {
      // Prioriza cliente por padrão
      handleLoginCliente();
    } else if (!views.cadastro.hidden) {
      handleSignup();
    } else if (!views.reset.hidden) {
      if (!el.resetStep2.hidden) handleResetApply();
      else handleResetSend();
    }
  });

  // ---------- Ano no rodapé ----------
  const ano = new Date().getFullYear();
  const anoSpan = byId("anoLogin");
  if (anoSpan) anoSpan.textContent = ano;

  // ---------- Qualidade de vida ----------
  // Prefill e manter foco inicial
  if (el.clientEmail) el.clientEmail.autocomplete = "email";
  if (el.signupEmail) el.signupEmail.autocomplete = "email";
  if (el.clientPass) el.clientPass.autocomplete = "current-password";
  if (el.signupPass) el.signupPass.autocomplete = "new-password";
  if (el.signupPass2) el.signupPass2.autocomplete = "new-password";
  if (el.adminPass) el.adminPass.autocomplete = "current-password";

  // Foco inicial
  if (!views.login.hidden && el.clientEmail) el.clientEmail.focus();
})();


