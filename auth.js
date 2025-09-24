(() => {
  const byId = id => document.getElementById(id);
  const qsa = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

  // ---------- Views ----------
  const views = {
    login: byId("viewLogin"),
    cadastro: byId("viewCadastro"),
    reset: byId("viewReset")
  };

  function go(view) {
    Object.values(views).forEach(v => v.classList.remove("is-active"));
    const target = views[view];
    if (target) target.classList.add("is-active");

    // limpa mensagens
    ["msgLogin","msgSignup","msgReset1","msgReset2"].forEach(id => {
      const el = byId(id);
      if(el) el.textContent = "";
    });
  }

  // ---------- Usuários ----------
  const LS_KEYS = { USERS:"checkup_users" };
  const loadUsers = () => JSON.parse(localStorage.getItem(LS_KEYS.USERS)||"[]");
  const saveUsers = arr => localStorage.setItem(LS_KEYS.USERS, JSON.stringify(arr));
  const emailNorm = e => (e||"").trim().toLowerCase();

  // ---------- Elementos ----------
  const el = {
    clientEmail: byId("clientEmail"),
    clientPass: byId("clientPass"),
    btnLoginCliente: byId("btnLoginCliente"),
    adminEmail: byId("adminEmail"),
    adminPass: byId("adminPass"),
    btnLoginAdmin: byId("btnLoginAdmin"),
    signupEmail: byId("signupEmail"),
    signupPass: byId("signupPass"),
    signupPass2: byId("signupPass2"),
    btnSignup: byId("btnSignup")
  };

  const msg = {
    login: byId("msgLogin"),
    signup: byId("msgSignup")
  };

  // ---------- Funções ----------
  function setText(el,text=""){ if(el) el.textContent=text; }

  function isValidEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
  function isValidPass(p){ return (p||"").length>=6; }

  function handleSignup(){
    const email=emailNorm(el.signupEmail.value);
    const pass=el.signupPass.value;
    const pass2=el.signupPass2.value;

    if(!isValidEmail(email)){ setText(msg.signup,"Informe um e-mail válido."); return; }
    if(!isValidPass(pass)){ setText(msg.signup,"A senha deve ter no mínimo 6 caracteres."); return; }
    if(pass!==pass2){ setText(msg.signup,"As senhas não conferem."); return; }

    const users=loadUsers();
    if(users.some(u=>u.email===email)){ setText(msg.signup,"E-mail já cadastrado."); return; }

    users.push({email,pass});
    saveUsers(users);
    setText(msg.signup,"Conta criada com sucesso!");
    setTimeout(()=>go("login"),800);
  }

  function handleLoginCliente(){
    const email=emailNorm(el.clientEmail.value);
    const pass=el.clientPass.value;
    if(!isValidEmail(email)){ setText(msg.login,"Informe um e-mail válido."); return; }
    if(!isValidPass(pass)){ setText(msg.login,"Senha inválida."); return; }

    const users=loadUsers();
    const user=users.find(u=>u.email===email);
    if(!user){ setText(msg.login,"E-mail não cadastrado."); return; }
    if(user.pass!==pass){ setText(msg.login,"Senha incorreta."); return; }

    setText(msg.login,"");
    window.location.href="client.html";
  }

  const ADMIN_EMAIL="admin@checkup.com", ADMIN_PASS="12345678";
  function handleLoginAdmin(){
    const email=emailNorm(el.adminEmail.value), pass=el.adminPass.value;
    if(email!==ADMIN_EMAIL){ setText(msg.login,"E-mail de admin inválido."); return; }
    if(pass!==ADMIN_PASS){ setText(msg.login,"Senha de admin incorreta."); return; }
    setText(msg.login,"");
    window.location.href="admin.html";
  }

  // ---------- Listeners ----------
  el.btnSignup.addEventListener("click", handleSignup);
  el.btnLoginCliente.addEventListener("click", handleLoginCliente);
  el.btnLoginAdmin.addEventListener("click", handleLoginAdmin);

  qsa("[data-nav]").forEach(btn=>{
    btn.addEventListener("click",()=>go(btn.getAttribute("data-nav")));
  });

  // Enter envia
  document.addEventListener("keydown",ev=>{
    if(ev.key!=="Enter") return;
    if(views.login.classList.contains("is-active")) handleLoginCliente();
    else if(views.cadastro.classList.contains("is-active")) handleSignup();
  });

  // Ano no rodapé
  const ano= new Date().getFullYear();
  const anoSpan=byId("anoLogin");
  if(anoSpan) anoSpan.textContent=ano;
})();








