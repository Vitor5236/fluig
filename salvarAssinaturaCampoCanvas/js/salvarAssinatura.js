/**
 * Captura e anexa a assinatura digital em formato Base64
 * @param {String} idInputOculto ID do input oculto onde os dados da assinatura serão armazenados
 * @param {String} nomeArquivo Nome do arquivo a ser gerado com a assinatura
 * @returns {void} Nenhum valor é retornado
 * @author João Vitor Dourado
 */
document.addEventListener('DOMContentLoaded', (evento) => {
    setTimeout(() => {
        processarArquivosAnexados();
    }, 100);

    function capturarAssinaturaEAnexar(idInputOculto, nomeArquivo) {
        const inputOculto = document.getElementById(idInputOculto);
        
        if (inputOculto) {
            const dadosAssinatura = inputOculto.value;
            console.log("Base64 capturado: ", dadosAssinatura);

            const byteString = atob(dadosAssinatura.split(',')[1]);
            const tipoMime = dadosAssinatura.split(',')[0].split(':')[1].split(';')[0];
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uintArray = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
                uintArray[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([arrayBuffer], { type: tipoMime });

            console.log("Blob gerado: ", blob);

            let formData = new FormData();
            formData.append('arquivo', blob, nomeArquivo);

            realizarUploadComFormData(formData);
        } else {
            console.error(`Elemento ${idInputOculto} não encontrado.`);
        }
    }

    /**
     * Realiza o upload do arquivo gerado com a assinatura
     * @param {FormData} formData Objeto FormData contendo o arquivo a ser enviado
     * @returns {void} Nenhum valor é retornado
     */
    function realizarUploadComFormData(formData) {
        try {
            var elementoUpload = parent && parent.document ? parent.document.getElementById("ecm-navigation-inputFile-clone") : document.getElementById("ecm-navigation-inputFile-clone");

            if (elementoUpload) {
                var arquivo = formData.get('arquivo');
                var dataTransfer = new DataTransfer();
                var arquivoInput = new File([arquivo], arquivo.name, { type: arquivo.type });
                dataTransfer.items.add(arquivoInput);

                elementoUpload.files = dataTransfer.files;

                var eventoAlteracao = new Event('change', { bubbles: true });
                elementoUpload.dispatchEvent(eventoAlteracao);
                console.log(`Arquivo ${arquivo.name} anexado com sucesso.`);
            } else {
                console.error("Elemento de upload de arquivo não encontrado.");
            }
        } catch (e) {
            console.error("Houve um erro ao anexar o arquivo");
            console.error(e);
        }
    }

    /**
     * Adiciona eventos de clique e toque a um elemento
     * @param {String} idElemento ID do elemento ao qual os eventos serão adicionados
     * @param {Function} callback Função a ser executada no evento
     * @returns {void} Nenhum valor é retornado
     */
    function adicionarEventoClickETouch(idElemento, callback) {
        const elemento = document.getElementById(idElemento);
        if (elemento) {
            elemento.addEventListener('click', callback);
            elemento.addEventListener('touchstart', callback);
        }
    }

    adicionarEventoClickETouch('salvarAssinaturaColaborador', function () {
        capturarAssinaturaEAnexar('dadosAssinaturaColaborador', 'assinatura-colaborador.png');
    });

    adicionarEventoClickETouch('salvarAssinaturaGestor', function () {
        capturarAssinaturaEAnexar('dadosAssinaturaGestor', 'assinatura-gestor.png');
    });
});
