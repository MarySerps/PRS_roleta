// === CONFIGURAÇÕES DA TV ===
const tvConfig = {
    polegadas: 86,
    horizontalPixels: 3840,
    verticalPixels: 2160,
    calcularTotalPixels: function() {
        return this.horizontalPixels * this.verticalPixels;
    }
};

console.log(`Configuração carregada para TV de ${tvConfig.polegadas}"`);
console.log(`Resolução: ${tvConfig.calcularTotalPixels()} pixels.`);

// === ÁUDIOS ===
const somGiro = new Audio("MP3/Roll.mp3");
const somGanhou = new Audio("MP3/Ganhou.mp3");
const somPerdeu = new Audio("MP3/Perdeu.mp3");

// Se o som do giro for muito curto, isso faz ele se repetir enquanto a roleta gira
somGiro.loop = true;

// === CONFIGURAÇÃO DOS PRÊMIOS E PORCENTAGENS ===
const configuracaoPremios = [
    { texto: "Agenda", chance: 5 }, 
    { texto: "Siga a PRS Reformas no Instagram e Ganhe uma Caneta!", chance: 5 },
    { texto: "Kit de Chaves", chance: 6 }, 
    { texto: "Siga a PRS Reformas no Instagram e Ganhe uma Caneta!", chance: 5},
    { texto: "Cuia de Chimarrão", chance: 4 }, 
    { texto: "Siga a PRS Reformas no Instagram e Ganhe uma Caneta!", chance: 5 },
    { texto: "Trena", chance: 4 }, 
    { texto: "Siga a PRS Reformas no Instagram e Ganhe uma Caneta!", chance: 5 }, 
    { texto: "Lanterna", chance: 1 },
    { texto: "Siga a PRS Reformas no Instagram e Ganhe uma Caneta!", chance: 5 }, 
    { texto: "Odarizador de Ambiente", chance: 4 }, 
    { texto: "Siga a PRS Reformas no Instagram e Ganhe uma Caneta!", chance: 5 }, 
    { texto: "Kit Multiuso", chance: 1 },
    { texto: "Siga a PRS Reformas no Instagram e Ganhe uma Caneta!", chance: 5 }, 
    { texto: "Lanterna", chance: 1 }, 
    { texto: "Siga a PRS Reformas no Instagram e Ganhe uma Caneta!", chance: 5 }, 
    { texto: "Chave Teste", chance: 1.5 },
    { texto: "Siga a PRS Reformas no Instagram e Ganhe uma Caneta!", chance: 5 },
    { texto: "Luva", chance: 0.5 },
    { texto: "Siga a PRS Reformas no Instagram e Ganhe uma Caneta!", chance: 5 }
];

// Extrai apenas os nomes para desenhar a roleta
const premios = configuracaoPremios.map(item => item.texto);

// As cores do fundo de cada fatia. (Exatamente 12 cores para 12 prêmios)
const cores = [
    "#000000", "#FFC72C", "#000000", "#FFC72C", 
    "#000000", "#FFC72C", "#000000", "#FFC72C",
    "#000000", "#FFC72C", "#000000", "#FFC72C"
];

// A cor do texto para dar contraste (Exatamente 12 cores)
const coresTexto = [
    "#FFFFFF", "#000000", "#FFFFFF", "#000000", 
    "#FFFFFF", "#000000", "#FFFFFF", "#000000",
    "#FFFFFF", "#000000", "#FFFFFF", "#000000"
];

// === VARIÁVEIS DO HTML ===
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const resultDiv = document.getElementById("result");
const wheelContainer = document.querySelector(".wheel-container");

let currentAngle = 0;
let isSpinning = false;

// Cálculo dos ângulos DEPOIS da lista de prêmios
const numSlices = premios.length;
const sliceAngle = (2 * Math.PI) / numSlices;
const tvPixelScale = Math.max(tvConfig.horizontalPixels / 1920, tvConfig.verticalPixels / 1080);

// === FUNÇÕES DA ROLETA ===
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
        
        const margemBorda = 20; 
        const espacoParaLogo = 90; 
        const larguraMaxima = radius - margemBorda - espacoParaLogo; 
        
        ctx.fillText(premios[i], radius - margemBorda, 6, larguraMaxima); 
        
        ctx.restore();
    }
}

function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;
    resultDiv.innerText = "Girando...";

    somGiro.currentTime = 0; 
    somGiro.play();

    const spinDuration = 5000; 
    const startSpinAngle = currentAngle;
    
    // --- LÓGICA DE SORTEIO POR PORCENTAGEM ---
    const somaChances = configuracaoPremios.reduce((acc, curr) => acc + curr.chance, 0);
    const numeroSorteado = Math.random() * somaChances;
    
    let indexGanhador = 0;
    let somaAtual = 0;
    for (let i = 0; i < configuracaoPremios.length; i++) {
        somaAtual += configuracaoPremios[i].chance;
        if (numeroSorteado <= somaAtual) {
            indexGanhador = i;
            break;
        }
    }

    // Variação para a roleta não parar exatamente no meio da fatia, ficando mais natural
    const variacaoAleatoria = (Math.random() * 0.8 + 0.1) * sliceAngle; 
    const anguloAlvo = (indexGanhador * sliceAngle) + variacaoAleatoria;
    
    let anguloParada = (1.5 * Math.PI) - anguloAlvo;
    if (anguloParada < 0) {
        anguloParada += 2 * Math.PI;
    }

    let diferencaParaParada = anguloParada - (startSpinAngle % (Math.PI * 2));
    if (diferencaParaParada < 0) {
        diferencaParaParada += 2 * Math.PI;
    }

    // 12 voltas completas + a diferença calculada para o prêmio certo
    const totalSpinAngle = startSpinAngle + (Math.PI * 2 * 12) + diferencaParaParada;
    // -----------------------------------------

    const startTime = performance.now();

    function animateSpin(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3.5); 
        
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
    
    somGiro.pause(); 

    const normalizedAngle = currentAngle % (2 * Math.PI);
    let winningAngle = (1.5 * Math.PI) - normalizedAngle;
    if (winningAngle < 0) {
        winningAngle += 2 * Math.PI;
    }

    const winningIndex = Math.floor(winningAngle / sliceAngle);
    const premioGanhador = premios[winningIndex];

    // Define o visual (e o som) se a pessoa não ganhou brinde físico
    // Define o visual se a pessoa cair na opção do Instagram
    if (premioGanhador === "Siga a PRS Reformas no Instagram e Ganhe uma Caneta!") {      
        somPerdeu.currentTime = 0;
        somPerdeu.play();   
        
        // Atualizado com o nome exato do arquivo que você salvou!
        resultDiv.innerHTML = `
            📲 ${premioGanhador} ✨<br>
            <img src="PNG/prs_reformas_qr.png" style="width: 200px; margin-top: 20px; border-radius: 15px; box-shadow: 0 0 15px rgba(255,255,255,0.3);">
        `; 
        
        resultDiv.style.color = "#ffffff";
        resultDiv.style.borderColor = "#555555";
        resultDiv.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.2)";
    } 
    // Define o visual se a pessoa ganhou o brinde físico
    else {
        somGanhou.currentTime = 0;
        somGanhou.play();
        
        resultDiv.innerText = `🎉 GANHOU: ${premioGanhador}! 🎉`;
        resultDiv.style.color = "#FFC72C";
        resultDiv.style.borderColor = "#FFC72C";
        resultDiv.style.boxShadow = "0 0 40px rgba(255, 199, 44, 0.9)";
    }

    resultDiv.classList.add("resultado-animado");

    setTimeout(() => {
        window.location.reload(); 
    }, 15000); 
}

setTimeout(resizeCanvas, 150);
window.addEventListener("resize", resizeCanvas);
spinBtn.addEventListener("click", spinWheel);