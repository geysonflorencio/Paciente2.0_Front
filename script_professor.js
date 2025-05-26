// frontend/script_professor.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("script_professor.js: DOMContentLoaded - Carregado e pronto.");

    const formConfigPaciente = document.getElementById('form-config-paciente');
    const statusEl = document.getElementById('status');

    // Referências aos inputs principais do formulário
    const nomePacienteInput = document.getElementById('nome');
    const idadePacienteInput = document.getElementById('idade');
    const comorbidadesInput = document.getElementById('comorbidades');
    // const doencaSelect = document.getElementById('doenca'); // LINHA ANTIGA - SERÁ SUBSTITUÍDA
    const doencaInput = document.getElementById('doencaInput');     // NOVA LINHA - Referência ao input de texto para doença
    const queixaInicialTextarea = document.getElementById('queixaInicial');
    const nomeAlunoInput = document.getElementById('nomeAluno');
    const tratamentoAlunoSelect = document.getElementById('tratamentoAluno');

    // DEBUG: Verificar se os elementos foram encontrados
    console.log("Elementos do formulário:", {
        formConfigPaciente, statusEl, nomePacienteInput, idadePacienteInput, 
        comorbidadesInput, doencaInput, queixaInicialTextarea, 
        nomeAlunoInput, tratamentoAlunoSelect
    });
    // Adicionar verificação específica para doencaInput
    if (!doencaInput) {
        console.error("ERRO CRÍTICO: Elemento com id='doencaInput' (para Doença Principal) não foi encontrado no DOM!");
        if(statusEl) {
             statusEl.textContent = "Erro de configuração da página: campo 'Doença Principal' não encontrado. Verifique o HTML.";
             statusEl.className = 'error';
        }
        // Considerar desabilitar o formulário ou o botão de submit se este campo crucial faltar
        if(formConfigPaciente) formConfigPaciente.querySelector('button[type="submit"]').disabled = true;
        return; 
    }


    const listaExamesConfigEl = document.getElementById('lista-exames-config');
    const btnAdicionarExame = document.getElementById('btn-adicionar-exame');
    const listaCriteriosEl = document.getElementById('lista-criterios-avaliacao');
    const btnAdicionarCriterio = document.getElementById('btn-adicionar-criterio');

    let contadorExames = 0;

    function adicionarCampoExame() {
        contadorExames++;
        const exameId = `exame-${contadorExames}`;
        const novoExameDiv = document.createElement('div');
        novoExameDiv.classList.add('exame-item-config');
        novoExameDiv.id = exameId;
        novoExameDiv.innerHTML = `
            <h4>Exame ${contadorExames}</h4>
            <label for="nomeExame-${exameId}">Nome do Exame:</label>
            <input type="text" id="nomeExame-${exameId}" name="nomeExame" placeholder="Ex: Tomografia de Tórax" required>

            <label for="tipoExame-${exameId}">Tipo de Conteúdo do Exame:</label>
            <select id="tipoExame-${exameId}" name="tipoExame">
                <option value="texto" selected>Resultado Textual</option>
                <option value="imagem">Imagem (Upload do Computador)</option>
            </select>

            <div class="resultado-container" id="resultadoContainer-${exameId}" style="margin-top: 10px;">
                <!-- Campos dinâmicos aqui -->
            </div>
            <button type="button" class="btn btn-danger btn-remover" data-remover="${exameId}">Remover Exame</button>
        `;
        if (listaExamesConfigEl) listaExamesConfigEl.appendChild(novoExameDiv);
        atualizarCamposResultadoExame(exameId, 'texto'); 

        const selectTipoExame = novoExameDiv.querySelector('select[name="tipoExame"]');
        if (selectTipoExame) {
            selectTipoExame.addEventListener('change', (e) => {
                atualizarCamposResultadoExame(exameId, e.target.value);
            });
        }
    }

    function atualizarCamposResultadoExame(exameId, tipoConteudo) {
        const container = document.getElementById(`resultadoContainer-${exameId}`);
        if (!container) return;

        if (tipoConteudo === 'imagem') {
            container.innerHTML = `
                <label for="uploadImagem-${exameId}">Selecionar Imagem do Computador:</label>
                <input type="file" id="uploadImagem-${exameId}" name="uploadImagem" accept="image/png, image/jpeg, image/gif, image/webp">
                <small>Formatos: PNG, JPG, GIF, WebP. Tamanho máx: 5MB.</small>
                
                <label for="descricaoImagem-${exameId}" style="margin-top:10px;">Descrição da Imagem (para IA narrar):</label>
                <textarea id="descricaoImagem-${exameId}" name="descricaoImagem" rows="3" placeholder="Descreva o que a IA (paciente) deve dizer sobre a imagem."></textarea>
            `;
        } else { 
            container.innerHTML = `
                <label for="resultadoTextual-${exameId}">Resultado Textual do Exame:</label>
                <textarea id="resultadoTextual-${exameId}" name="resultadoTextual" rows="4" placeholder="Digite o resultado textual completo do exame aqui."></textarea>
            `;
        }
    }
    
    function adicionarCampoCriterio() {
        const novoCriterioDiv = document.createElement('div');
        novoCriterioDiv.classList.add('criterio-item-config');
        novoCriterioDiv.innerHTML = `
            <input type="text" name="criterioAvaliacao" placeholder="Digite um critério ou pergunta chave" required style="flex-grow:1;">
            <button type="button" class="btn btn-danger btn-remover" style="margin-left: 10px; padding: 8px 12px; font-size: 0.9em; flex-shrink:0;">Remover</button>
        `;
        // Estilos para alinhar na mesma linha (devem estar no CSS, mas pode forçar aqui se necessário)
        novoCriterioDiv.style.display = "flex";
        novoCriterioDiv.style.alignItems = "center";
        novoCriterioDiv.style.gap = "10px";
        novoCriterioDiv.style.marginBottom = "10px";
        if(listaCriteriosEl) listaCriteriosEl.appendChild(novoCriterioDiv);
    }

    if (btnAdicionarExame && listaExamesConfigEl) {
        btnAdicionarExame.addEventListener('click', adicionarCampoExame);
        listaExamesConfigEl.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-remover') && event.target.dataset.remover) {
                const exameParaRemover = document.getElementById(event.target.dataset.remover);
                if (exameParaRemover) exameParaRemover.remove();
            }
        });
    } else {
        console.warn("Botão 'Adicionar Exame' ou 'lista-exames-config' não encontrado no DOM.");
    }

    if (btnAdicionarCriterio && listaCriteriosEl) {
        btnAdicionarCriterio.addEventListener('click', adicionarCampoCriterio);
        listaCriteriosEl.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-remover')) {
                event.target.closest('.criterio-item-config').remove();
            }
        });
    } else {
        console.warn("Botão 'Adicionar Critério' ou 'lista-criterios-avaliacao' não encontrado no DOM.");
    }


    if (formConfigPaciente) {
        formConfigPaciente.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = formConfigPaciente.querySelector('button[type="submit"]');
            if (!submitButton) {
                console.error("Botão de submit não encontrado no formulário!");
                return;
            }
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner"></span> Configurando...';

            if(statusEl) { statusEl.textContent = "Processando configuração..."; statusEl.className = 'info'; }

            // Validação para garantir que os elementos principais existem antes de ler .value
            if (!nomePacienteInput || !idadePacienteInput || !comorbidadesInput || 
                !doencaInput || !queixaInicialTextarea || !nomeAlunoInput || !tratamentoAlunoSelect) {
                console.error("Um ou mais campos principais do formulário não foram encontrados ao submeter!");
                if(statusEl) { statusEl.textContent = "Erro interno: Campos do formulário ausentes."; statusEl.className = 'error'; }
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                return;
            }

            const arrayPromessasUpload = [];
            const examesParaEnviar = []; 

            document.querySelectorAll('#lista-exames-config .exame-item-config').forEach((item, index) => {
                const nomeExame = item.querySelector('input[name="nomeExame"]')?.value.trim();
                const tipo = item.querySelector('select[name="tipoExame"]')?.value;
                
                const exameData = { 
                    nomeExame, tipo, 
                    localImagem: null, descricaoImagem: null, resultadoTextual: null, 
                    _tempId: `upload_${index}` 
                };

                if (nomeExame && tipo) {
                    if (tipo === 'imagem') {
                        exameData.descricaoImagem = item.querySelector('textarea[name="descricaoImagem"]')?.value.trim();
                        const uploadImagemInput = item.querySelector('input[name="uploadImagem"]');
                        if (uploadImagemInput && uploadImagemInput.files.length > 0) {
                            const arquivoParaUpload = uploadImagemInput.files[0];
                            const formData = new FormData();
                            formData.append('exameImagem', arquivoParaUpload);
                            
                            arrayPromessasUpload.push(
                                fetch('/api/upload-exame-imagem', { method: 'POST', body: formData })
                                    .then(response => response.json()) 
                                    .then(result => {
                                        if (!result.success) return Promise.reject(result);
                                        const exameOriginal = examesParaEnviar.find(e => e._tempId === exameData._tempId);
                                        if(exameOriginal) exameOriginal.localImagem = result.filePath;
                                    })
                                    .catch(uploadError => {
                                        console.error(`Falha no upload para ${exameData.nomeExame}:`, uploadError);
                                        return Promise.reject(new Error(`Upload do exame "${exameData.nomeExame}" falhou.`));
                                    })
                            );
                        } else {
                             console.warn(`Exame de imagem "${nomeExame}" não tem arquivo selecionado para upload.`);
                        }
                    } else if (tipo === 'texto') {
                        exameData.resultadoTextual = item.querySelector('textarea[name="resultadoTextual"]')?.value.trim();
                    }
                    examesParaEnviar.push(exameData);
                }
            });

            try {
                console.log(`Aguardando ${arrayPromessasUpload.length} uploads...`);
                await Promise.all(arrayPromessasUpload); 
                console.log("Todos os uploads (se houver) foram concluídos.");
                
                const criteriosAvaliacao = [];
                if (listaCriteriosEl) { // Verifica se listaCriteriosEl existe
                    listaCriteriosEl.querySelectorAll('.criterio-item-config input[type="text"]').forEach(input => {
                        const criterio = input.value.trim();
                        if (criterio) criteriosAvaliacao.push(criterio);
                    });
                }
                
                const dadosConfiguracaoFinal = {
                    nome: nomePacienteInput.value.trim(), 
                    idade: idadePacienteInput.value.trim(),
                    comorbidades: comorbidadesInput.value.trim(),
                    doenca: doencaInput.value.trim(), // Usando doencaInput.value
                    queixaInicial: queixaInicialTextarea.value.trim(),
                    nomeAluno: nomeAlunoInput.value.trim(), 
                    tratamentoAluno: tratamentoAlunoSelect.value,
                    exames: examesParaEnviar.map(ex => { 
                        const {_tempId, ...resto} = ex; 
                        return resto;
                    }),
                    criteriosAvaliacao: criteriosAvaliacao
                };

                console.log("Dados Finais da Configuração a Enviar:", JSON.stringify(dadosConfiguracaoFinal, null, 2));

                const response = await fetch('/api/configurar-paciente', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosConfiguracaoFinal)
                });
                const result = await response.json();

                if (response.ok) {
                    if(statusEl) { 
                        statusEl.className = 'success'; 
                        statusEl.textContent = result.message || "Simulação configurada com sucesso! Os dados foram enviados e mantidos na tela para revisão."; 
                    }
                    console.log("Configuração enviada com sucesso:", result);
                    document.querySelectorAll('#lista-exames-config input[type="file"]').forEach(input => input.value = '');
                    // Não limpar outros campos principais, exames ou critérios
                } else {
                    if(statusEl) { statusEl.className = 'error'; statusEl.textContent = `Erro ao configurar: ${result.error || 'Falha desconhecida.'}`; }
                }

            } catch (error) { 
                console.error("Erro no processo de configuração:", error);
                if(statusEl) {
                    statusEl.className = 'error';
                    statusEl.textContent = `Erro na configuração: ${error.message || 'Verifique os dados e tente novamente.'}`;
                }
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    } else {
        console.error("Elemento do formulário principal 'form-config-paciente' não encontrado no DOM!");
    }
});