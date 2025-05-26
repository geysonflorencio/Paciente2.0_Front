// frontend/script_login.js
document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login'); // Tenta pegar o formulário pelo ID
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    // const statusLoginEl = document.getElementById('login-status'); // Opcional para mensagens de status na página

    console.log("script_login.js: DOMContentLoaded - Script carregado.");

    if (!formLogin) {
        console.error("ERRO CRÍTICO: Formulário de login com id='form-login' não foi encontrado no DOM!");
        // Adicionar uma mensagem de erro visível para o usuário se o formulário não for encontrado
        const body = document.querySelector('body');
        if (body) {
            const errorMsg = document.createElement('p');
            errorMsg.textContent = "Erro crítico na página de login: formulário não encontrado. Contate o suporte.";
            errorMsg.style.color = "red";
            errorMsg.style.textAlign = "center";
            errorMsg.style.marginTop = "20px";
            // Tenta adicionar antes do primeiro script, ou no final do body
            const firstScript = body.querySelector('script');
            if (firstScript) {
                body.insertBefore(errorMsg, firstScript);
            } else {
                body.appendChild(errorMsg);
            }
        }
        return; // Interrompe a execução do script se o formulário não existe
    }

    if (!emailInput || !senhaInput) {
        console.error("ERRO CRÍTICO: Campos de input para email ou senha não encontrados!");
        // Adicionar feedback visual se os campos não forem encontrados
        // (similar ao acima, ou desabilitar o botão de submit)
        const submitButton = formLogin.querySelector('button[type="submit"]');
        if(submitButton) submitButton.disabled = true;
        return;
    }

    formLogin.addEventListener('submit', async (event) => {
        event.preventDefault(); // IMPEDE o envio padrão do formulário (que causa o recarregamento com query params)

        const email = emailInput.value.trim();
        const senha = senhaInput.value; // Senhas geralmente não devem ter .trim() automático na captura

        const submitButton = formLogin.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Entrando...';

        // if (statusLoginEl) statusLoginEl.textContent = ''; // Limpa status anterior

        console.log("Tentativa de login com:", { email, senha_length: senha.length });

        // --- SIMULAÇÃO DE AUTENTICAÇÃO ---
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay de rede

        let loginSucesso = false;
        const paginaDestino = "professor.html"; // Destino fixo após login bem-sucedido

        // Credenciais de teste (ajuste conforme necessário)
        if ((email.toLowerCase() === "admin@paciente20.com" && senha === "password123") ||
            (email.toLowerCase() === "professor@teste.com" && senha === "prof") ||
            (email.toLowerCase() === "aluno@teste.com" && senha === "aluno") // Para teste, todos vão para professor.html
           ) {
            loginSucesso = true;
        }

        if (loginSucesso) {
            console.log("Login bem-sucedido! Redirecionando para:", paginaDestino);
            localStorage.setItem('usuarioLogado', email); 
            
            // Define o tipo de usuário com base no email para este exemplo
            if (email.toLowerCase().includes('admin')) {
                localStorage.setItem('tipoUsuario', 'admin');
            } else if (email.toLowerCase().includes('professor')) {
                localStorage.setItem('tipoUsuario', 'professor');
            } else if (email.toLowerCase().includes('aluno')) {
                localStorage.setItem('tipoUsuario', 'aluno'); // Mesmo que redirecione para pág. professor
            } else {
                localStorage.setItem('tipoUsuario', 'desconhecido');
            }
            
            window.location.href = paginaDestino;
        } else {
            console.warn("Falha no login: Credenciais inválidas para o email:", email);
            // if (statusLoginEl) {
            //     statusLoginEl.textContent = "Email ou senha inválidos. Tente novamente.";
            //     statusLoginEl.style.color = "var(--color-danger)"; 
            // } else {
                alert("Email ou senha inválidos. Tente novamente.");
            // }
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
});
// --- FIM DO SCRIPT DE LOGIN ---
// Nota: Este script é para fins de demonstração e simulação de login.