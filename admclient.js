// ===== JAVASCRIPT SIMPLES PARA OS BOTÕES =====
// Faz os botões "Agendar consulta" e "Ver serviços" funcionarem

document.addEventListener('DOMContentLoaded', function() {
    
    // Encontrar os botões pelos atributos data-section
    const btnAgendar = document.querySelector('button[data-section="agendar"]');
    const btnServicos = document.querySelector('button[data-section="servicos"]');
    
    // Botão "Agendar consulta"
    if (btnAgendar) {
        btnAgendar.addEventListener('click', function() {
            // Clica no link "Agendar" do menu
            const linkAgendar = document.querySelector('nav a[data-section="agendar"]');
            if (linkAgendar) {
                linkAgendar.click();
            }
        });
    }
    
    // Botão "Ver serviços"  
    if (btnServicos) {
        btnServicos.addEventListener('click', function() {
            // Clica no link "Serviços" do menu
            const linkServicos = document.querySelector('nav a[data-section="servicos"]');
            if (linkServicos) {
                linkServicos.click();
            }
        });
    }
    
});
