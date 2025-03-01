/**
 * Configura e gerencia a assinatura digital no canvas
 * @param {String} canvasId ID do elemento canvas onde a assinatura será desenhada
 * @param {String} botaoLimparId ID do botão que limpa o canvas
 * @param {String} inputOcultoId ID do input oculto onde os dados da assinatura serão armazenados
 * @returns {void} Nenhum valor é retornado
 * @author João Vitor Dourado
 */
document.addEventListener('DOMContentLoaded', function () {

    function configurarAssinatura(canvasId, botaoLimparId, inputOcultoId) {
        const canvas = document.getElementById(canvasId);
        const botaoLimpar = document.getElementById(botaoLimparId);
        const inputOculto = document.getElementById(inputOcultoId);

        const contexto = canvas.getContext('2d');
        let desenhando = false;
        let ultimaX = 0;
        let ultimaY = 0;

        // Função para começar a desenhar
        function iniciarDesenho(e) {
            desenhando = true;
            ultimaX = e.offsetX || (e.touches && e.touches[0].clientX - canvas.getBoundingClientRect().left);
            ultimaY = e.offsetY || (e.touches && e.touches[0].clientY - canvas.getBoundingClientRect().top);
            contexto.beginPath();
            contexto.moveTo(ultimaX, ultimaY);
        }

        // Função para desenhar enquanto o mouse ou dedo se move
        function desenhar(e) {
            if (!desenhando) return;

            let x = e.offsetX || (e.touches && e.touches[0].clientX - canvas.getBoundingClientRect().left);
            let y = e.offsetY || (e.touches && e.touches[0].clientY - canvas.getBoundingClientRect().top);

            contexto.lineTo(x, y);
            contexto.stroke();
            ultimaX = x;
            ultimaY = y;
        }

        function pararDesenho() {
            desenhando = false;
            const assinaturaDados = canvas.toDataURL('image/png'); 
            if(inputOcultoId == "dadosAssinaturaColaborador") {
                document.getElementById('dadosAssinaturaColaborador').value = assinaturaDados;
                console.log("Parando desenho e salvando assinatura");
            } else {
                document.getElementById('dadosAssinaturaGestor').value = assinaturaDados;
                console.log("Parando desenho e salvando assinatura");
            }
        }

        // Eventos de mouse
        canvas.addEventListener('mousedown', iniciarDesenho);
        canvas.addEventListener('mousemove', desenhar);
        canvas.addEventListener('mouseup', pararDesenho);
        canvas.addEventListener('mouseout', pararDesenho);

        // Eventos de toque (para dispositivos móveis)
        canvas.addEventListener('touchstart', iniciarDesenho);
        canvas.addEventListener('touchmove', function (e) {
            e.preventDefault();
            desenhar(e);
        });
        canvas.addEventListener('touchend', pararDesenho);

        // Limpar o canvas
        botaoLimpar.addEventListener('click', function () {
            contexto.clearRect(0, 0, canvas.width, canvas.height);
            inputOculto.value = ''; // Limpa o valor do input oculto
        });
    }

    /**
     * Redimensiona o canvas para manter a qualidade da assinatura
     * @param {HTMLCanvasElement} canvas Elemento canvas que será redimensionado
     * @returns {void} Nenhum valor é retornado
     */
    function redimensionarCanvas(canvas) {
        const proporcao = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * proporcao;
        canvas.height = canvas.offsetHeight * proporcao;
        const contexto = canvas.getContext('2d');
        contexto.scale(proporcao, proporcao);
    }

    window.onload = function () {
        const canvasColaborador = document.getElementById('assinaturaColaborador');
        const canvasGestor = document.getElementById('assinaturaGestor');
        redimensionarCanvas(canvasColaborador);
        redimensionarCanvas(canvasGestor);

        configurarAssinatura('assinaturaColaborador', 'limparAssinaturaColaborador', 'dadosAssinaturaColaborador');
        configurarAssinatura('assinaturaGestor', 'limparAssinaturaGestor', 'dadosAssinaturaGestor');
    };

});