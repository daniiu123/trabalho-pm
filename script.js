document.addEventListener('DOMContentLoaded', () => {
    // Lista de palavras-alvo (5 letras)
    const words = [
        "ABRIR", "AMIGO", "BANHO", "CAIXA", "DIZER",
        "FALAR", "GOSTO", "HORAS", "JOGAR", "LIVRO", 
        "NOITE", "OCUPA", "PAPEL", "QUASE",
        "RADIO", "SABER", "TARDE", "UNIDO", "VIVER"
    ];

    // Elementos do DOM
    const board = document.getElementById('board');
    const message = document.getElementById('message');
    const usedLettersContainer = document.getElementById('used-letters');
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeBtn = document.querySelector('.close');

    // NOVOS ELEMENTOS DO DOM PARA ESTATÍSTICAS E MODO ESCURO
    const body = document.body;
    const botaoModo = document.getElementById('botaoModo');
    // CONEXÃO COM SEU HTML:
    const winsEl = document.getElementById('wins'); 
    const lossesEl = document.getElementById('losses'); 


    // Variáveis do jogo
    let targetWord = '';
    let currentRow = 0;
    let currentCell = 0;
    let gameOver = false;
    let usedLetters = new Set();
    let activeCell = null;
    
    // NOVAS VARIÁVEIS PARA ESTATÍSTICAS
    let wins = 0;
    let losses = 0;


    // ----------------------------------------------------------------------------------
    // FUNÇÕES DO CONTADOR (ESTATÍSTICAS)
    // ----------------------------------------------------------------------------------

    function atualizarExibicaoEstatisticas() {
        winsEl.textContent = `Vitórias: ${wins}`;
        lossesEl.textContent = `Derrotas: ${losses}`;
    }

    function salvarEstatisticas() {
        localStorage.setItem('termoWins', wins);
        localStorage.setItem('termoLosses', losses);
    }

    function carregarEstatisticas() {
        const savedWins = localStorage.getItem('termoWins');
        const savedLosses = localStorage.getItem('termoLosses');

        if (savedWins) {
            wins = parseInt(savedWins);
        }
        if (savedLosses) {
            losses = parseInt(savedLosses);
        }
        
        atualizarExibicaoEstatisticas();
    }

    function incrementarVitoria() {
        wins++;
        salvarEstatisticas();
        atualizarExibicaoEstatisticas();
    }

    function incrementarDerrota() {
        losses++;
        salvarEstatisticas();
        atualizarExibicaoEstatisticas();
    }


    // ----------------------------------------------------------------------------------
    // FUNÇÕES DO MODO ESCURO
    // ----------------------------------------------------------------------------------

    function toggleModoEscuro() {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('tema', 'escuro');
            botaoModo.textContent = 'Desativar Modo Escuro';
        } else {
            localStorage.setItem('tema', 'claro');
            botaoModo.textContent = 'Ativar Modo Escuro';
        }
    }


    // ----------------------------------------------------------------------------------
    // FLUXO PRINCIPAL DO JOGO (initGame, handleKeyPress)
    // ----------------------------------------------------------------------------------

    function initGame() {
        // Selecionar palavra aleatória
        targetWord = words[Math.floor(Math.random() * words.length)];
        console.log("Palavra: " + targetWord); // Útil para testes

        // Resetar variáveis
        currentRow = 0;
        currentCell = 0;
        gameOver = false;
        usedLetters = new Set();
        message.textContent = '';
        usedLettersContainer.textContent = '';

        // Criar tabuleiro (Código omitido para brevidade, mas deve estar aqui)
        board.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            row.dataset.row = i;
            for (let j = 0; j < 5; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.cell = j;
                cell.addEventListener('click', () => { /* ... lógica de clique ... */ });
                row.appendChild(cell);
            }
            board.appendChild(row);
        }

        // Definir primeira célula como ativa
        activeCell = document.querySelector('.cell');
        activeCell.classList.add('active');
    }

    function handleKeyPress(key) {
        if (gameOver) return;
        // ... (todo o seu código handleKeyPress) ...
        const currentRowElement = document.querySelector(`.row[data-row="${currentRow}"]`);
        const currentRowCells = currentRowElement ? Array.from(currentRowElement.querySelectorAll('.cell')) : [];

        if (key === 'Enter') {
            const allFilled = currentRowCells.every(cell => cell.textContent);
            if (allFilled) {
                checkGuess();
            } else {
                message.textContent = "Preencha todas as letras!";
                setTimeout(() => message.textContent = '', 2000);
            }
        } else if (key === 'Backspace') {
            // ... (seu código de Backspace) ...
            if (activeCell && activeCell.textContent) {
                activeCell.textContent = '';
                activeCell.classList.remove('filled');
            } else if (currentCell > 0) {
                currentCell--;
                activeCell = currentRowCells[currentCell];
                activeCell.classList.add('active');
                if (activeCell.textContent) {
                    activeCell.textContent = '';
                    activeCell.classList.remove('filled');
                }
            }
        } else if (/^[A-Za-z]$/.test(key)) {
            // ... (seu código de entrada de letra) ...
            if (activeCell) {
                activeCell.textContent = key.toUpperCase();
                activeCell.classList.add('filled');
                if (currentCell < 4) {
                    activeCell.classList.remove('active');
                    currentCell++;
                    activeCell = currentRowCells[currentCell];
                    activeCell.classList.add('active');
                }
            }
        }
    }

    // ----------------------------------------------------------------------------------
    // VERIFICAÇÃO DO PALPITE (INTEGRAÇÃO DA ESTATÍSTICA)
    // ----------------------------------------------------------------------------------

    function checkGuess() {
        const currentRowElement = document.querySelector(`.row[data-row="${currentRow}"]`);
        const currentRowCells = currentRowElement.querySelectorAll('.cell');
        let guess = '';
        currentRowCells.forEach(cell => { guess += cell.textContent; });

        if (guess.length !== 5) {
            message.textContent = "A palavra deve ter 5 letras!";
            shakeRow(currentRow);
            return;
        }

        // ... (seu código de checagem de letras e classes: right, place, wrong) ...

        const targetLetters = targetWord.split('');
        const guessLetters = guess.split('');
        const result = Array(5).fill('');

        // 1ª passada: corretas
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                result[i] = 'right';
                targetLetters[i] = null;
            }
        }

        // 2ª passada: em posição errada
        for (let i = 0; i < 5; i++) {
            if (result[i] === 'right') continue;
            const index = targetLetters.indexOf(guessLetters[i]);
            if (index !== -1) {
                result[i] = 'place';
                targetLetters[index] = null;
            } else {
                result[i] = 'wrong';
                usedLetters.add(guessLetters[i]);
            }
        }

        // Atualizar células
        for (let i = 0; i < 5; i++) {
            currentRowCells[i].classList.add(result[i]);
        }

        updateUsedLetters();

        // 🏆 INTEGRANDO VITÓRIA 🏆
        if (guess === targetWord) {
            message.textContent = "Acertou!";
            gameOver = true;
            incrementarVitoria(); // CHAMA A FUNÇÃO DE VITÓRIA
            setTimeout(() => { initGame(); }, 2000);
            return;
        }

        currentRow++;
        currentCell = 0;

        // Definir próxima linha ativa
        if (currentRow < 6) {
            document.querySelectorAll('.cell.active').forEach(c => c.classList.remove('active')); // remove a classe 'active' da linha anterior
            activeCell = document.querySelector(`.row[data-row="${currentRow}"] .cell`);
            activeCell.classList.add('active');
        }

        // 😞 INTEGRANDO DERROTA 😞
        if (currentRow === 6) {
            message.textContent = `Tente novamente! A palavra era ${targetWord}`;
            gameOver = true;
            incrementarDerrota(); // CHAMA A FUNÇÃO DE DERROTA
            setTimeout(() => { initGame(); }, 2000);
        }
    }

    // ... (Seu código original de updateUsedLetters e shakeRow) ...
    function updateUsedLetters() {
        if (usedLetters.size > 0) {
            usedLettersContainer.textContent = 'Letras não usadas: ' +
                [...usedLetters].sort().join(', ');
        }
    }

    function shakeRow(row) {
        const rowElement = document.querySelector(`.row[data-row="${row}"]`);
        rowElement.style.animation = 'shake 0.5s';

        setTimeout(() => {
            rowElement.style.animation = '';
        }, 500);
    }

    // Event listeners
    document.addEventListener('keydown', (e) => {
        e.preventDefault(); 
        handleKeyPress(e.key);
    });

    // Event listener do Modo Escuro
    botaoModo.addEventListener('click', toggleModoEscuro);

    helpBtn.addEventListener('click', () => {
        helpModal.style.display = 'flex';
        helpModal.classList.add('align-center-flex');
    });

    closeBtn.addEventListener('click', () => {
        helpModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });

    // ----------------------------------------------------------------------------------
    // CHAMADAS DE INICIALIZAÇÃO (GARANTINDO A ORDEM)
    // ----------------------------------------------------------------------------------

    // 1. Carrega as estatísticas para exibir o contador na tela
    carregarEstatisticas(); 

    // 2. Verifica e aplica o modo escuro salvo
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'escuro') {
        body.classList.add('dark-mode');
        botaoModo.textContent = 'Desativar Modo Escuro';
    }

    // 3. Inicia o jogo
    initGame();
});
