// === CONFIGURAÇÕES DOS PRÊMIOS ===

// Adicionando os novos itens no final da lista
const tvConfig = {
    polegadas: 86,
    horizontalPixels: 3840,
    verticalPixels: 2160,
    calcularTotalPixels: function() {
        return this.horizontalPixels * this.verticalPixels;
    }
};

const somGiro = new Audio("MP3/Roll.mp3");
const somGanhou = new Audio("MP3/Ganhou.mp3");
const somPerdeu = new Audio("MP3/Perdeu.mp3");

// Se o som do giro for muito curto, isso faz ele se repetir enquanto a roleta gira
somGiro.loop = true;

console.log(`Configuração carregada para TV de ${tvConfig.polegadas}"`);
console.log(`Resolução: ${tvConfig.calcularTotalPixels()} pixels.`);

const premios = [
    "Agenda",
    "Tente Novamente",
    "Kit de Chaves",
    "Que pena! Não foi dessa vez!",
    "Cuia de Chimarrão",
    "Tente Novamente",
    "Trena",
    "Que pena! Não foi dessa vez!",
    "Caneta",
    "Tente Novamente",
    "Luva",
    "Chave Teste"
];

// As cores do fundo de cada fatia. Tem que ter a MESMA quantidade que os prêmios.
// Intercalando: "#000000" (Preto) e "#FFC72C" (Amarelo)
const cores = [
    "#000000", "#FFC72C", "#000000", "#FFC72C", 
    "#000000", "#FFC72C", "#000000", "#FFC72C",
    // --- CORES PARA AS NOVAS FATIAS ---
    "#000000", // Fundo Preto
    "#FFC72C"  // Fundo Amarelo
];

// A cor do texto para dar contraste com o fundo
// "#FFFFFF" (Branco no fundo preto) e "#000000" (Preto no fundo amarelo)
const coresTexto = [
    "#FFFFFF", "#000000", "#FFFFFF", "#000000", 
    "#FFFFFF", "#000000", "#FFFFFF", "#000000",
    // --- CORES DO TEXTO PARA AS NOVAS FATIAS ---
    "#FFFFFF", 
    "#000000"
];
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const resultDiv = document.getElementById("result");
const wheelContainer = document.querySelector(".wheel-container");

let currentAngle = 0;
let isSpinning = false;

const numSlices = premios.length;
const sliceAngle = (2 * Math.PI) / numSlices;
const tvPixelScale = Math.max(tvConfig.horizontalPixels / 1920, tvConfig.verticalPixels / 1080);

function resizeCanvas() {
    const size = wheelContainer.clientWidth;
    const pixelRatio = Math.max(window.devicePixelRatio || 1, tvPixelScale);

    canvas.width = Math.floor(size * pixelRatio);
    canvas.height = Math.floor(size * pixelRatio);

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    drawWheel();

    document.body.classList.add('ready');
}

function drawWheel() {
    const size = wheelContainer.clientWidth;

    ctx.clearRect(0, 0, size, size);
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;
    
    // AJUSTE 1: Diminuí levemente o multiplicador da fonte de 0.033 para 0.025
    // e o tamanho mínimo de 24 para 18 para ajudar as frases longas
    const fontSize = Math.max(18, Math.round(size * 0.025)); 

    for (let i = 0; i < numSlices; i++) {
        const startAngle = currentAngle + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = cores[i % cores.length];
        ctx.fill();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        
        ctx.textAlign = "right";
        ctx.fillStyle = coresTexto[i % coresTexto.length];
        ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
        
        // AJUSTE 2: Limite de espaço para o texto
        const margemBorda = 20; // Mantém o texto afastado da borda externa
        const espacoParaLogo = 90; // Área de proteção no centro para a logo
        const larguraMaxima = radius - margemBorda - espacoParaLogo; 
        
        // O 4º parâmetro (larguraMaxima) impede que o texto chegue no centro!
        ctx.fillText(premios[i], radius - margemBorda, 6, larguraMaxima); 
        
        ctx.restore();
    }
}

function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;
    resultDiv.innerText = "Girando...";

    somGiro.currentTime = 0; // Zera o áudio para garantir que comece do início
    somGiro.play();

    const spinDuration = 5000; // 5 segundos de giro para dar mais emoção
    const startSpinAngle = currentAngle;
    const randomExtraAngle = Math.random() * 2 * Math.PI;
    const totalSpinAngle = startSpinAngle + (Math.PI * 2 * 12) + randomExtraAngle; // 12 voltas
    
    const startTime = performance.now();

    function animateSpin(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3.5); // Desaceleração mais suave
        
        currentAngle = startSpinAngle + (totalSpinAngle - startSpinAngle) * easeOut;
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animateSpin);
        } else {
            finishSpin();
        }
    }

    requestAnimationFrame(animateSpin);
}

function finishSpin() {
    isSpinning = false;
    spinBtn.disabled = false;
    
    somGiro.pause(); // Pausa o som do giro

    const normalizedAngle = currentAngle % (2 * Math.PI);
    let winningAngle = (1.5 * Math.PI) - normalizedAngle;
    if (winningAngle < 0) {
        winningAngle += 2 * Math.PI;
    }

    const winningIndex = Math.floor(winningAngle / sliceAngle);
    const premioGanhador = premios[winningIndex];

    // Define o visual (e o som) se a pessoa perdeu
    if (premioGanhador === "Tente Novamente" || premioGanhador === "Que pena! Não foi dessa vez!") {      
        // Toca som de derrota
        somPerdeu.currentTime = 0;
        somPerdeu.play();   
        
        resultDiv.innerText = premioGanhador; 
        resultDiv.style.color = "#ffffff";
        resultDiv.style.borderColor = "#555555";
        resultDiv.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.2)";
    } 
    // Define o visual (e o som) se a pessoa ganhou
    else {
        // Toca som de vitória
        somGanhou.currentTime = 0;
        somGanhou.play();
        
        resultDiv.innerText = `🎉 GANHOU: ${premioGanhador}! 🎉`;
        resultDiv.style.color = "#FFC72C";
        resultDiv.style.borderColor = "#FFC72C";
        resultDiv.style.boxShadow = "0 0 40px rgba(255, 199, 44, 0.9)";
    }

    // Ativa a animação de Pop-up
    resultDiv.classList.add("resultado-animado");

    // Reinicia a página após 7 segundos
    setTimeout(() => {
        window.location.reload(); 
    }, 7000); 
}

setTimeout(resizeCanvas, 150);
window.addEventListener("resize", resizeCanvas);
spinBtn.addEventListener("click", spinWheel);