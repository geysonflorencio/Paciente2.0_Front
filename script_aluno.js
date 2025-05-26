// frontend/script_aluno.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Script Aluno: DOMContentLoaded - Iniciando script.");

    // Elementos da UI
    const nomePacienteEl = document.getElementById('nome-paciente');
    const displayNomePacienteEl = document.getElementById('display-nome-paciente'); 
    const idadePacienteEl = document.getElementById('idade-paciente');
    const queixaInicialPacienteEl = document.getElementById('queixa-inicial-paciente');
    const paragrafoQueixaInicialEl = document.getElementById('paragrafo-queixa-inicial');

    const conversaEl = document.getElementById('conversa');
    const btnFalar = document.getElementById('btn-falar');
    const statusMicrofoneEl = document.getElementById('status-microfone');

    const listaResultadosExamesEl = document.getElementById('lista-resultados-exames');
    const placeholderExamesEl = document.querySelector('#lista-resultados-exames .placeholder-exames');

    const modalImagemExame = document.getElementById('modal-imagem-exame');
    const imgModalGrandeEl = document.getElementById('imagem-exame-modal-grande');
    const tituloModalImagemEl = document.getElementById('titulo-modal-imagem-exame');
    const descModalImagemGrandeEl = document.getElementById('descricao-imagem-modal-grande');
    const btnFecharModalImagem = document.getElementById('fechar-modal-imagem');

    const btnRecomecar = document.getElementById('btn-recomecar');
    const btnAvaliar = document.getElementById('btn-avaliar');
    const modalAvaliacao = document.getElementById('modal-avaliacao');
    const conteudoAvaliacaoEl = document.getElementById('conteudo-avaliacao');
    const btnFecharModalAvaliacao = document.getElementById('fechar-modal-avaliacao');

    const audioPlayerEl = document.getElementById('audio-player-paciente');

    console.log("Elementos da UI (Aluno):", { 
        btnFalar, btnRecomecar, btnAvaliar, conversaEl, audioPlayerEl,
        modalImagemExame, btnFecharModalImagem, modalAvaliacao, btnFecharModalAvaliacao 
    });

    let simulacaoAtiva = false;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    async function carregarInfoPacienteUI() {
        console.log("ALUNO SCRIPT: carregarInfoPacienteUI - Iniciando...");
        if(btnFalar) btnFalar.disabled = true;
        if (btnRecomecar) btnRecomecar.disabled = true;
        if (btnAvaliar) btnAvaliar.disabled = true;
        if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Carregando simulação...";

        try {
            const response = await fetch('/api/get-configuracao-paciente');
            console.log("ALUNO SCRIPT: carregarInfoPacienteUI - Resposta de /api/get-configuracao-paciente status:", response.status);
            
            if (!response.ok) {
                let errorMsg = `Falha ao carregar configuração (HTTP ${response.status})`;
                try { const errorData = await response.json(); errorMsg = errorData.message || errorData.error || errorMsg; } catch (e) {}
                console.error("ALUNO SCRIPT: carregarInfoPacienteUI - Erro na resposta do fetch:", errorMsg);
                throw new Error(errorMsg);
            }
            const data = await response.json();
            console.log("ALUNO SCRIPT: carregarInfoPacienteUI - Dados recebidos do backend:", data);

            if (data.pacienteConfigurado) {
                if (nomePacienteEl) nomePacienteEl.textContent = data.nome;
                if (displayNomePacienteEl) displayNomePacienteEl.innerHTML = `<strong>${data.nome || "Paciente"}</strong>`;
                if (idadePacienteEl) idadePacienteEl.textContent = `${data.idade} anos`;
                
                console.log(`ALUNO SCRIPT: Simulação configurada para aluno ${data.tratamentoAluno || 'Dr(a).'} ${data.nomeAluno || '(Nome não definido)'} com paciente ${data.nome}`);

                if (data.queixaInicial && queixaInicialPacienteEl && paragrafoQueixaInicialEl) {
                    queixaInicialPacienteEl.textContent = data.queixaInicial;
                    paragrafoQueixaInicialEl.style.display = 'block';
                } else if (paragrafoQueixaInicialEl) {
                    paragrafoQueixaInicialEl.style.display = 'none';
                }

                simulacaoAtiva = true;
                console.log("ALUNO SCRIPT: carregarInfoPacienteUI - Simulação ATIVA.");

                if(conversaEl) conversaEl.innerHTML = ''; 
                if (listaResultadosExamesEl && placeholderExamesEl) {
                    listaResultadosExamesEl.innerHTML = ''; 
                    listaResultadosExamesEl.appendChild(placeholderExamesEl); 
                    placeholderExamesEl.style.display = 'block';
                }

                if (data.queixaInicial) { 
                    console.log("ALUNO SCRIPT: Paciente tem queixa inicial. Adicionando ao chat e falando.");
                    adicionarMensagem(data.queixaInicial, 'paciente');
                    await tocarAudioOpenAI(data.queixaInicial, 'onyx'); // Voz 'onyx' para queixa inicial
                } else {
                    console.log("ALUNO SCRIPT: Paciente SEM queixa inicial. Habilitando botão Falar.");
                    if(btnFalar) btnFalar.disabled = false;
                    if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Clique para falar...";
                }
                if (btnRecomecar) btnRecomecar.disabled = false;
                if (btnAvaliar) btnAvaliar.disabled = false;

            } else {
                simulacaoAtiva = false;
                console.log("ALUNO SCRIPT: carregarInfoPacienteUI - Paciente NÃO configurado.");
                if (nomePacienteEl) nomePacienteEl.textContent = "Não configurado";
                if (displayNomePacienteEl) displayNomePacienteEl.innerHTML = "<strong>Paciente</strong>";
                if (idadePacienteEl) idadePacienteEl.textContent = "N/A";
                if (paragrafoQueixaInicialEl) paragrafoQueixaInicialEl.style.display = 'none';
                adicionarMensagem(`Sistema: ${data.message || "Simulação não configurada pelo professor."}`, "sistema-erro");
                if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Simulação indisponível.";
            }
        } catch (error) {
            simulacaoAtiva = false;
            console.error("ALUNO SCRIPT: carregarInfoPacienteUI - Erro CRÍTICO:", error);
            adicionarMensagem(`Sistema: Erro crítico ao carregar simulação. ${error.message}`, "sistema-erro");
            if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Erro ao carregar simulação.";
        }
    }

    if (!recognition) {
        console.error("SpeechRecognition API não suportada.");
        if (statusMicrofoneEl) statusMicrofoneEl.textContent = "Navegador não suporta reconhecimento de voz.";
        if (btnFalar) btnFalar.disabled = true;
        if (btnRecomecar) btnRecomecar.disabled = true;
        if (btnAvaliar) btnAvaliar.disabled = true;
        if (conversaEl) adicionarMensagem("ERRO: Seu navegador não suporta Reconhecimento de Voz. Tente Chrome ou Edge.", "sistema-erro");
        return;
    }
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    function adicionarMensagem(texto, remetenteClasse) {
        if (!conversaEl) { console.error("Elemento 'conversa' não encontrado para adicionar mensagem."); return; }
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('mensagem', remetenteClasse);
        msgDiv.textContent = texto;
        conversaEl.appendChild(msgDiv);
        conversaEl.scrollTop = conversaEl.scrollHeight;
    }

    async function tocarAudioOpenAI(textoParaFalar, voz = 'onyx') { 
        console.log(`ALUNO SCRIPT: tocarAudioOpenAI - Solicitando áudio para: "${textoParaFalar ? textoParaFalar.substring(0,30) : 'VAZIO'}...", Voz: ${voz}`);
        if (!textoParaFalar || !audioPlayerEl) {
            console.warn(`ALUNO SCRIPT: tocarAudioOpenAI - Texto (${!textoParaFalar ? 'VAZIO' : 'OK'}) ou audioPlayerEl (${audioPlayerEl ? 'OK' : 'NÃO ENCONTRADO'}) inválido.`);
            if(simulacaoAtiva && btnFalar) btnFalar.disabled = false;
            if(statusMicrofoneEl) statusMicrofoneEl.textContent = simulacaoAtiva ? "Clique para falar..." : "Erro no áudio.";
            return;
        }

        if(btnFalar) btnFalar.disabled = true;
        if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Paciente preparando para falar...";

        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texto: textoParaFalar, voz: voz })
            });
            console.log("ALUNO SCRIPT: tocarAudioOpenAI - Resposta do /api/tts status:", response.status);

            if (!response.ok) {
                const errorResult = await response.json().catch(() => ({ error: "Falha ao parsear erro do TTS" }));
                console.error("ALUNO SCRIPT: tocarAudioOpenAI - Erro da API /api/tts:", errorResult);
                throw new Error(errorResult.error || `Falha ao gerar áudio (HTTP ${response.status})`);
            }

            const result = await response.json();
            if (result.success && result.audioUrl) {
                console.log(`ALUNO SCRIPT: tocarAudioOpenAI - Áudio URL recebido: ${result.audioUrl}`);
                audioPlayerEl.src = result.audioUrl;
                
                audioPlayerEl.play()
                    .then(() => {
                        console.log("ALUNO SCRIPT: tocarAudioOpenAI - Reprodução de áudio iniciada.");
                        if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Paciente falando...";
                    })
                    .catch(error => {
                        console.error("ALUNO SCRIPT: tocarAudioOpenAI - Erro ao chamar play() no áudio:", error);
                        if(simulacaoAtiva && btnFalar) btnFalar.disabled = false;
                        if(statusMicrofoneEl) statusMicrofoneEl.textContent = simulacaoAtiva ? "Clique para falar..." : "Erro na fala.";
                    });
                
                audioPlayerEl.onended = () => {
                    console.log("ALUNO SCRIPT: tocarAudioOpenAI - Reprodução finalizada.");
                    if(simulacaoAtiva && btnFalar) btnFalar.disabled = false;
                    if(statusMicrofoneEl) statusMicrofoneEl.textContent = simulacaoAtiva ? "Clique para falar..." : "Simulação indisponível.";
                };
                audioPlayerEl.onerror = (e) => {
                    console.error("ALUNO SCRIPT: tocarAudioOpenAI - Erro no elemento de áudio:", e);
                     if(simulacaoAtiva && btnFalar) btnFalar.disabled = false;
                    if(statusMicrofoneEl) statusMicrofoneEl.textContent = simulacaoAtiva ? "Clique para falar..." : "Erro ao tocar fala.";
                };

            } else {
                console.error("ALUNO SCRIPT: tocarAudioOpenAI - Resposta da API TTS não continha URL ou success:false.", result);
                throw new Error(result.error || "Resposta da API TTS inválida.");
            }
        } catch (error) {
            console.error("ALUNO SCRIPT: tocarAudioOpenAI - Erro CRÍTICO:", error);
            adicionarMensagem(`Sistema: Erro na síntese de fala (${error.message}).`, "sistema-erro");
            if(simulacaoAtiva && btnFalar) btnFalar.disabled = false;
            if(statusMicrofoneEl) statusMicrofoneEl.textContent = simulacaoAtiva ? "Clique para falar..." : "Erro na fala.";
        }
    }

    async function enviarParaBackend(textoFala) {
        console.log("ALUNO SCRIPT: enviarParaBackend - Texto do aluno:", textoFala);
        if (!simulacaoAtiva) { if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Simulação não está ativa."; return; }
        adicionarMensagem(textoFala, 'estudante');
        if(statusMicrofoneEl) statusMicrofoneEl.textContent = "IA processando...";
        if(btnFalar) btnFalar.disabled = true;
        const payload = { mensagemAluno: textoFala }; // nomeAluno não é mais enviado
        try {
            const response = await fetch('/api/interagir', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            console.log("[FRONTEND DEBUG] Backend respondeu (/api/interagir):", JSON.stringify(result, null, 2));
            if (response.ok) {
                adicionarMensagem(result.respostaPaciente, 'paciente');
                await tocarAudioOpenAI(result.respostaPaciente, 'onyx'); // Voz 'onyx' como padrão
                if (result.tipoResposta === "exame_resultado" && result.dadosExame) {
                    console.log("[FRONTEND DEBUG] Exibindo exame:", result.dadosExame.nomeExame);
                    exibirResultadoExameNaLista(result.dadosExame, result.respostaPaciente);
                }
            } else { 
                const errorMsg = result.error || result.details || 'Falha.';
                adicionarMensagem(`Erro Servidor: ${errorMsg}`, 'sistema-erro');
                await tocarAudioOpenAI("Desculpe, tive um problema.", 'onyx');
            }
        } catch (error) { 
            console.error('ALUNO SCRIPT: Erro ao chamar /api/interagir:', error);
            adicionarMensagem(`Erro de Rede: ${error.message || "Não foi possível conectar."}`, 'sistema-erro');
            await tocarAudioOpenAI("Desculpe, erro de conexão.", 'onyx');
        } finally { 
             if (audioPlayerEl && audioPlayerEl.paused && simulacaoAtiva && btnFalar) {
                 if(btnFalar) btnFalar.disabled = false;
                 if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Clique para falar...";
            }
        }
    }
    
    function exibirResultadoExameNaLista(dadosExame, _falaDeConfirmacaoDaIA) {
        console.log("ALUNO SCRIPT: exibirResultadoExameNaLista - Dados:", JSON.stringify(dadosExame, null, 2));
        if (!listaResultadosExamesEl) { console.error("Elemento 'listaResultadosExamesEl' não encontrado."); return; }
        if (placeholderExamesEl) placeholderExamesEl.style.display = 'none';
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('exame-resultado-item');
        const tituloH3 = document.createElement('h3');
        tituloH3.innerHTML = `<strong>${dadosExame.nomeExame || "Exame"}</strong>`;
        itemDiv.appendChild(tituloH3);
        const conteudoDiv = document.createElement('div');
        conteudoDiv.classList.add('conteudo-exame');
        if (dadosExame.tipoConteudo === "imagem" && dadosExame.imagemUrl) {
            const divMiniaturaContainer = document.createElement('div');
            divMiniaturaContainer.classList.add('miniatura-imagem-exame-container');
            const imgMiniatura = document.createElement('img');
            imgMiniatura.src = dadosExame.imagemUrl;
            imgMiniatura.alt = `Miniatura de ${dadosExame.nomeExame}`;
            imgMiniatura.classList.add('imagem-exame-miniatura');
            imgMiniatura.onerror = function() { console.error(`Erro ao carregar miniatura: ${this.src}`); this.alt = 'Falha ao carregar imagem';};
            imgMiniatura.onclick = () => {
                if (modalImagemExame && imgModalGrandeEl && tituloModalImagemEl && descModalImagemGrandeEl) {
                    tituloModalImagemEl.innerHTML = `Visualização de <strong>${dadosExame.nomeExame || "Exame"}</strong>`;
                    imgModalGrandeEl.src = dadosExame.imagemUrl;
                    imgModalGrandeEl.alt = `Imagem ampliada de ${dadosExame.nomeExame}`;
                    imgModalGrandeEl.onerror = function() { console.error(`Erro ao carregar imagem grande: ${this.src}`); this.alt = 'Falha ao carregar imagem ampliada';};
                    descModalImagemGrandeEl.textContent = dadosExame.descricaoImagem || "Detalhes da imagem do exame."; // Usa descricaoImagem para o modal
                    console.log("Abrindo modal de imagem:", dadosExame.nomeExame);
                    modalImagemExame.style.display = 'flex';
                } else {
                    console.error("Elementos do modal de imagem não encontrados ao tentar abrir.");
                }
            };
            divMiniaturaContainer.appendChild(imgMiniatura);
            conteudoDiv.appendChild(divMiniaturaContainer);
            const descricaoParaLista = dadosExame.descricaoImagem || "Clique na imagem para ampliar.";
            if (descricaoParaLista) {
                 const pDesc = document.createElement('p');
                 pDesc.classList.add('descricao-exame-item');
                 pDesc.textContent = descricaoParaLista.substring(0,150) + (descricaoParaLista.length > 150 ? "..." : "");
                 conteudoDiv.appendChild(pDesc);
            }
        } else if (dadosExame.tipoConteudo === "texto" && dadosExame.conteudo) {
            const preTexto = document.createElement('pre');
            preTexto.classList.add('texto-exame-item');
            preTexto.textContent = dadosExame.conteudo;
            conteudoDiv.appendChild(preTexto);
        }
        itemDiv.appendChild(conteudoDiv);
        listaResultadosExamesEl.appendChild(itemDiv);
        listaResultadosExamesEl.scrollTop = listaResultadosExamesEl.scrollHeight;
    }

    // --- EVENT LISTENERS ---
    if (recognition && btnFalar) {
        recognition.onstart = () => { if(btnFalar) btnFalar.disabled = true; if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Ouvindo..."; };
        recognition.onresult = (event) => { enviarParaBackend(event.results[0][0].transcript); };
        recognition.onspeechend = () => { if(recognition) recognition.stop(); };
        recognition.onnomatch = () => { if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Não entendi. Tente de novo."; if(simulacaoAtiva && btnFalar) btnFalar.disabled = false; };
        recognition.onerror = (event) => {
            console.error("Erro SpeechRecognition:", event.error, event.message);
            let msg = `Erro mic: ${event.error}. `;
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') msg += "Permita acesso.";
            else if (event.error === 'no-speech') msg = "Nenhuma fala detectada.";
            else if (event.error === 'audio-capture') msg = "Problema na captura de áudio.";
            else msg += "Tente novamente.";
            if(statusMicrofoneEl) statusMicrofoneEl.textContent = msg;
            if(simulacaoAtiva && btnFalar) btnFalar.disabled = false;
        };
        btnFalar.addEventListener('click', () => {
            console.log("Botão Falar clicado. Estado: disabled=", btnFalar.disabled, "simulacaoAtiva=", simulacaoAtiva);
            if (btnFalar.disabled || !simulacaoAtiva) return;
            if (audioPlayerEl && !audioPlayerEl.paused) { audioPlayerEl.pause(); audioPlayerEl.currentTime = 0; }
            try { if(recognition) recognition.start(); }
            catch (e) { console.error("Erro recognition.start:", e); if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Erro microfone."; if(simulacaoAtiva && btnFalar) btnFalar.disabled = false; }
        });
    } else {
        if (!btnFalar) console.error("Elemento 'btn-falar' não encontrado no DOM.");
        else if (!recognition) console.warn("SpeechRecognition não disponível, funcionalidade de fala desabilitada.");
    }

    if (btnRecomecar) {
        btnRecomecar.addEventListener('click', async () => {
            console.log("Botão Recomeçar clicado.");
            if (!simulacaoAtiva || !confirm("Tem certeza que deseja recomeçar a conversa com este paciente? O histórico será perdido.")) return;
            if(btnFalar) btnFalar.disabled = true; 
            if(btnRecomecar) btnRecomecar.disabled = true; 
            if(btnAvaliar) btnAvaliar.disabled = true;
            if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Reiniciando simulação...";
            try {
                const response = await fetch('/api/resetar-historico-aluno', { method: 'POST' });
                if (response.ok) {
                    if(conversaEl) conversaEl.innerHTML = '';
                    if (listaResultadosExamesEl && placeholderExamesEl) {
                        listaResultadosExamesEl.innerHTML = ''; listaResultadosExamesEl.appendChild(placeholderExamesEl);
                        placeholderExamesEl.style.display = 'block';
                    }
                    await carregarInfoPacienteUI();
                } else {
                    const errorData = await response.json();
                    adicionarMensagem(`Erro ao reiniciar: ${errorData.error || 'Tente novamente.'}`, 'sistema-erro');
                    if(simulacaoAtiva && btnFalar) { btnFalar.disabled = false; if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Clique para falar..."; }
                }
            } catch (error) {
                console.error("Erro de rede ao reiniciar:", error);
                adicionarMensagem(`Erro de rede ao reiniciar: ${error.message}`, 'sistema-erro');
                if(simulacaoAtiva && btnFalar) { btnFalar.disabled = false; if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Clique para falar..."; }
            } finally {
                if(simulacaoAtiva && btnRecomecar) btnRecomecar.disabled = false;
                if(simulacaoAtiva && btnAvaliar) btnAvaliar.disabled = false;
            }
        });
    } else { console.warn("Elemento 'btn-recomecar' não encontrado."); }

    if (btnAvaliar) {
        btnAvaliar.addEventListener('click', async () => {
            console.log("Botão Avaliar clicado.");
            if (!simulacaoAtiva || !confirm("Tem certeza que deseja finalizar a consulta e ver sua avaliação? Você não poderá mais interagir com este paciente.")) return;
            if(btnAvaliar) btnAvaliar.disabled = true; 
            if(btnFalar) btnFalar.disabled = true; 
            if(btnRecomecar) btnRecomecar.disabled = true;
            if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Processando sua avaliação...";
            try {
                const response = await fetch('/api/avaliar-desempenho', { method: 'POST' });
                const avaliacao = await response.json();
                if (response.ok) {
                    let html = `<p><strong>Pontuação dos Critérios:</strong> ${avaliacao.pontuacao || "N/A"}</p>
                                <p><strong>Total de Perguntas Feitas:</strong> ${avaliacao.totalPerguntasAluno !== undefined ? avaliacao.totalPerguntasAluno : "N/A"}</p>`;
                    if (avaliacao.criteriosDefinidos && avaliacao.criteriosDefinidos.length > 0) {
                        if (avaliacao.criteriosCobertos && avaliacao.criteriosCobertos.length > 0) {
                            html += "<h4>Critérios Essenciais Abordados:</h4><ul>" + avaliacao.criteriosCobertos.map(c => `<li>${c}</li>`).join('') + "</ul>";
                        } else { html += "<h4>Critérios Essenciais Abordados:</h4><p>Nenhum dos critérios essenciais foi abordado.</p>"; }
                        if (avaliacao.criteriosOmitidos && avaliacao.criteriosOmitidos.length > 0) {
                            html += "<h4>Critérios Essenciais Omitidos (Pontos de Melhoria):</h4><ul>" + avaliacao.criteriosOmitidos.map(c => `<li>${c}</li>`).join('') + "</ul>";
                        } else { html += "<h4>Critérios Essenciais Omitidos:</h4><p>Parabéns! Todos os critérios essenciais foram abordados.</p>"; }
                    } else { html += `<p>${avaliacao.message || "Não havia critérios de avaliação definidos para este caso."}</p>`; }
                    if(conteudoAvaliacaoEl) conteudoAvaliacaoEl.innerHTML = html;
                    if (modalAvaliacao) modalAvaliacao.style.display = 'flex';
                    if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Avaliação concluída. Para continuar, configure um novo paciente ou recomece.";
                } else {
                    adicionarMensagem(`Erro ao gerar avaliação: ${avaliacao.error || 'Tente novamente.'}`, 'sistema-erro');
                    if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Falha ao gerar avaliação.";
                    if(btnAvaliar) btnAvaliar.disabled = false;
                    if(simulacaoAtiva && btnFalar) btnFalar.disabled = false;
                    if(simulacaoAtiva && btnRecomecar) btnRecomecar.disabled = false;
                }
            } catch (error) {
                console.error("Erro de rede ao buscar avaliação:", error);
                adicionarMensagem(`Erro de rede ao buscar avaliação: ${error.message}`, 'sistema-erro');
                if(statusMicrofoneEl) statusMicrofoneEl.textContent = "Falha ao conectar para avaliação.";
                if(btnAvaliar) btnAvaliar.disabled = false;
                if(simulacaoAtiva && btnFalar) btnFalar.disabled = false;
                if(simulacaoAtiva && btnRecomecar) btnRecomecar.disabled = false;
            }
        });
    } else { console.warn("Elemento 'btn-avaliar' não encontrado."); }

    function setupModalClose(modalElement, closeButtonElement) {
        console.log(`[setupModalClose] Configurando para modal: ${modalElement ? modalElement.id : 'N/A'} e botão: ${closeButtonElement ? closeButtonElement.id : 'N/A'}`);
        if (modalElement && closeButtonElement) {
            const closeModalHandler = () => {
                modalElement.style.display = 'none';
                console.log(`Modal ${modalElement.id} fechado pelo botão X.`);
            };
            const overlayClickHandler = (e) => {
                if (e.target === modalElement) {
                    modalElement.style.display = "none";
                    console.log(`Modal ${modalElement.id} fechado pelo clique no overlay.`);
                }
            };
            // Limpa listeners antigos para evitar duplicação (se esta função for chamada mais de uma vez por engano)
            closeButtonElement.removeEventListener('click', closeModalHandler);
            modalElement.removeEventListener('click', overlayClickHandler);
            // Adiciona novos listeners
            closeButtonElement.addEventListener('click', closeModalHandler);
            modalElement.addEventListener('click', overlayClickHandler);
            console.log(`[setupModalClose] Listeners configurados para ${modalElement.id}.`);
        } else {
            if (!modalElement) console.warn(`[setupModalClose] Falha: Elemento do modal não encontrado.`);
            if (!closeButtonElement) console.warn(`[setupModalClose] Falha: Botão de fechar do modal não encontrado (para ${modalElement ? modalElement.id : 'modal desconhecido'}).`);
        }
    }
    setupModalClose(modalImagemExame, btnFecharModalImagem);
    setupModalClose(modalAvaliacao, btnFecharModalAvaliacao);
    
    console.log("Script Aluno: Configurando estado inicial da UI.");
    if (statusMicrofoneEl) statusMicrofoneEl.textContent = "Carregando simulação...";
    if (btnFalar) btnFalar.disabled = true;
    if (btnRecomecar) btnRecomecar.disabled = true;
    if (btnAvaliar) btnAvaliar.disabled = true;
    
    carregarInfoPacienteUI();
});