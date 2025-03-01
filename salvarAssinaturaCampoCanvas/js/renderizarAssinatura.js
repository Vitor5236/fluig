/**
 * Converte um arquivo anexado em Base64 e processa sua exibição no canvas
 * @param {String} idDocumento ID do documento armazenado no servidor
 * @param {String} idInputOculto ID do campo hidden onde os dados Base64 serão armazenados
 * @param {String} idCanvas ID do elemento canvas onde a assinatura será desenhada
 * @returns {void} Nenhum valor é retornado
 * @author João Vitor Dourado
 */
document.addEventListener('DOMContentLoaded', (evento) => {
    setTimeout(() => {
        processarArquivosAnexados();
    }, 100);

    function arquivoParaBase64(idDocumento, idInputOculto, idCanvas) {
        const url = '/content-management/api/v2/documents/' + idDocumento + '/stream';
        
        fetch(url)
            .then(resposta => {
                if (!resposta.ok) {
                    throw new Error(`Erro no download do arquivo: ${resposta.statusText}`);
                }
                return resposta.blob();
            })
            .then(blob => {
                const leitor = new FileReader();
                leitor.onloadend = function () {
                    const dadosBase64 = leitor.result;
                    const inputOculto = document.getElementById(idInputOculto);

                    if (inputOculto) {
                        inputOculto.value = dadosBase64;
                        inputOculto.disabled = true;
                        ativarCanvasERenderizar(idCanvas, idInputOculto);
                    } else {
                        setTimeout(() => {
                            const tentativaInputOculto = document.getElementById(idInputOculto);
                            const botaoImprimir = document.getElementById("botaoImprimir");
                            if (tentativaInputOculto) {
                                tentativaInputOculto.value = dadosBase64;
                                tentativaInputOculto.disabled = true;
                                botaoImprimir.disabled = false;
                                ativarCanvasERenderizar(idCanvas, idInputOculto);
                            } else {
                                console.error(`Campo hidden ${idInputOculto} ainda não está disponível.`);
                            }
                        }, 100);
                    }
                };
                leitor.readAsDataURL(blob); 
            })
            .catch(erro => {
                console.error('Erro ao acessar o arquivo', erro);
            });
    }

    /**
     * Renderiza a assinatura salva em Base64 dentro do canvas
     * @param {String} idCanvas ID do canvas onde a assinatura será desenhada
     * @param {String} idInputOculto ID do input hidden contendo os dados da assinatura em Base64
     * @returns {void} Nenhum valor é retornado
     */
    function ativarCanvasERenderizar(idCanvas, idInputOculto) {
        const canvas = document.getElementById(idCanvas);

        if (canvas && canvas.getContext) {
            renderizarAssinaturaNoCanvas(idCanvas, idInputOculto);
            canvas.style.pointerEvents = 'none';
        } else {
            console.error(`Canvas ${idCanvas} não está pronto ou não foi encontrado.`);
        }
    }

    /**
     * Renderiza a imagem Base64 da assinatura dentro do canvas
     * @param {String} idCanvas ID do elemento canvas onde a assinatura será desenhada
     * @param {String} idInputOculto ID do input hidden contendo os dados da assinatura em Base64
     * @returns {void} Nenhum valor é retornado
     */
    function renderizarAssinaturaNoCanvas(idCanvas, idInputOculto) {
        const dadosBase64 = document.getElementById(idInputOculto).value;

        if (dadosBase64) {
            const canvas = document.getElementById(idCanvas);
            const contexto = canvas.getContext('2d');
            const imagem = new Image();

            canvas.width = 1025;  
            canvas.height = 200; 

            imagem.onload = function () {
                contexto.clearRect(0, 0, canvas.width, canvas.height);
                contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height); 
            };

            if (dadosBase64.startsWith('data:image')) {
                imagem.src = dadosBase64;
            } else {
                console.error('Dados Base64 inválidos ou faltando prefixo data:image.');
            }
        } else {
            console.error('Assinatura Base64 não encontrada no campo hidden.');
        }
    }

    /**
     * Processa os arquivos anexados e converte assinaturas para Base64
     * @returns {void} Nenhum valor é retornado
     */
    function processarArquivosAnexados() {
        const anexos = parent.ECM.attachmentTable.getData();

        anexos.forEach(anexo => {
            if (anexo.description === 'assinatura-funcionario.png') {
                arquivoParaBase64(anexo.documentId, 'dadosAssinaturaColaborador', 'assinaturaColaborador');
            } else if (anexo.description === 'assinatura-gestor.png') {
                arquivoParaBase64(anexo.documentId, 'dadosAssinaturaGestor', 'assinaturaGestor');
            }
        });
    }
});
