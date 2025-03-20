/**
 * Kalkulator Interaktif Modern
 * 
 * Fitur:
 * - Operasi dasar matematika (+, -, *, /)
 * - Animasi tombol dan UI modern
 * - Sound feedback
 * - Keyboard support
 * - Error handling
 * - Efek visual
 */

class Calculator {
    constructor() {
        // Elemen DOM
        this.displayElement = document.getElementById('display');
        this.historyElement = document.getElementById('historyDisplay');
        this.buttonsGrid = document.querySelector('.buttons-grid');
        this.soundToggle = document.getElementById('soundToggle');
        
        // State kalkulator
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.shouldResetInput = false;
        this.lastOperand = null;
        this.lastOperation = null;
        this.lastPressed = null;
        
        // Initialisasi Audio Context
        this.audioContext = null;
        this.initAudio();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    // Inisialisasi audio context untuk sound effects
    initAudio() {
        // Inisialisasi audio context saat user interaction
        const initAudioContext = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('click', initAudioContext);
        };
        
        document.addEventListener('click', initAudioContext);
    }
    
    // Membuat sound effect saat tombol ditekan
    playSound(frequency = 440, type = 'sine') {
        if (!this.audioContext || !this.soundToggle.checked) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
    
    // Setup event listeners untuk tombol kalkulator dan keyboard
    setupEventListeners() {
        // Event delegation untuk tombol
        this.buttonsGrid.addEventListener('click', (event) => {
            const target = event.target;
            
            if (!target.matches('.btn')) return;
            
            // Efek ripple
            this.createRippleEffect(event);
            
            // Highlight tombol yang ditekan
            this.highlightLastPressed(target);
            
            // Memproses tombol yang ditekan
            if (target.dataset.number) {
                this.playSound(330, 'sine');
                this.inputNumber(target.dataset.number);
            } else if (target.dataset.decimal) {
                this.playSound(350, 'sine');
                this.inputDecimal();
            } else if (target.dataset.action) {
                const action = target.dataset.action;
                
                switch (action) {
                    case 'clear':
                        this.playSound(220, 'square');
                        this.clear();
                        break;
                    case 'clear-entry':
                        this.playSound(250, 'square');
                        this.clearEntry();
                        break;
                    case 'calculate':
                        this.playSound(440, 'triangle');
                        this.calculate();
                        break;
                    case 'toggle-sign':
                        this.playSound(380, 'sine');
                        this.toggleSign();
                        break;
                    case 'percentage':
                        this.playSound(400, 'sine');
                        this.percentage();
                        break;
                    case 'add':
                    case 'subtract':
                    case 'multiply':
                    case 'divide':
                        this.playSound(400, 'sawtooth');
                        this.handleOperation(action);
                        break;
                }
            }
        });
        
        // Keyboard support
        document.addEventListener('keydown', (event) => {
            // Mengidentifikasi tombol yang sesuai dengan keyboard input
            let key = event.key;
            let targetBtn = null;
            
            if (/^[0-9]$/.test(key)) {
                targetBtn = document.querySelector(`[data-number="${key}"]`);
            } else {
                switch (key) {
                    case '.':
                        targetBtn = document.querySelector('[data-decimal]');
                        break;
                    case '+':
                        targetBtn = document.querySelector('[data-action="add"]');
                        break;
                    case '-':
                        targetBtn = document.querySelector('[data-action="subtract"]');
                        break;
                    case '*':
                    case 'x':
                    case 'X':
                        targetBtn = document.querySelector('[data-action="multiply"]');
                        break;
                    case '/':
                        targetBtn = document.querySelector('[data-action="divide"]');
                        break;
                    case '=':
                    case 'Enter':
                        targetBtn = document.querySelector('[data-action="calculate"]');
                        break;
                    case 'Escape':
                    case 'Delete':
                        targetBtn = document.querySelector('[data-action="clear"]');
                        break;
                    case 'Backspace':
                        targetBtn = document.querySelector('[data-action="clear-entry"]');
                        break;
                    case '%':
                        targetBtn = document.querySelector('[data-action="percentage"]');
                        break;
                }
            }
            
            // Jika tombol yang sesuai ditemukan, simulasikan klik
            if (targetBtn) {
                event.preventDefault();
                targetBtn.click();
                targetBtn.classList.add('active');
                setTimeout(() => {
                    targetBtn.classList.remove('active');
                }, 100);
            }
        });
    }
    
    // Menciptakan efek ripple saat tombol diklik
    createRippleEffect(event) {
        const button = event.target;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }
    
    // Highlight tombol terakhir yang ditekan
    highlightLastPressed(button) {
        if (this.lastPressed) {
            this.lastPressed.classList.remove('last-pressed');
        }
        
        button.classList.add('last-pressed');
        this.lastPressed = button;
    }
    
    // Update display
    updateDisplay() {
        this.displayElement.textContent = this.currentInput;
        
        // Truncate/ellipsis jika angka terlalu panjang
        if (this.currentInput.length > 12) {
            this.displayElement.style.fontSize = '22px';
        } else {
            this.displayElement.style.fontSize = '';
        }
    }
    
    // Update history display
    updateHistory(text = '') {
        this.historyElement.textContent = text;
    }
    
    // Input angka
    inputNumber(number) {
        if (this.shouldResetInput) {
            this.currentInput = '';
            this.shouldResetInput = false;
        }
        
        // Ganti '0' awal dengan angka yang diinput
        if (this.currentInput === '0') {
            this.currentInput = number;
        } else {
            this.currentInput += number;
        }
        
        this.updateDisplay();
    }
    
    // Input titik desimal
    inputDecimal() {
        if (this.shouldResetInput) {
            this.currentInput = '0';
            this.shouldResetInput = false;
        }
        
        // Tambahkan titik desimal jika belum ada
        if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
        
        this.updateDisplay();
    }
    
    // Toggle antara positif dan negatif
    toggleSign() {
        if (this.currentInput !== '0') {
            if (this.currentInput.startsWith('-')) {
                this.currentInput = this.currentInput.slice(1);
            } else {
                this.currentInput = '-' + this.currentInput;
            }
            this.updateDisplay();
        }
    }
    
    // Fungsi persen
    percentage() {
        const current = parseFloat(this.currentInput);
        
        if (this.operation && this.previousInput) {
            // Jika operasi sudah dipilih, hitung persentase dari angka sebelumnya
            const previous = parseFloat(this.previousInput);
            this.currentInput = (current * previous / 100).toString();
        } else {
            // Kalau tidak, konversi ke persentase saja (dibagi 100)
            this.currentInput = (current / 100).toString();
        }
        
        this.updateDisplay();
    }
    
    // Handle operasi matematika (+, -, *, /)
    handleOperation(operation) {
        if (this.operation && !this.shouldResetInput) {
            this.calculate();
        }
        
        this.previousInput = this.currentInput;
        this.operation = operation;
        this.shouldResetInput = true;
        
        // Update history display
        const operationSymbol = this.getOperationSymbol(operation);
        this.updateHistory(`${this.previousInput} ${operationSymbol}`);
    }
    
    // Mendapatkan simbol operasi dari nama operasi
    getOperationSymbol(operation) {
        switch (operation) {
            case 'add': return '+';
            case 'subtract': return '-';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    }
    
    // Eksekusi perhitungan
    calculate() {
        if (!this.operation || !this.previousInput) return;
        
        const previous = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        let result;
        
        switch (this.operation) {
            case 'add':
                result = previous + current;
                break;
            case 'subtract':
                result = previous - current;
                break;
            case 'multiply':
                result = previous * current;
                break;
            case 'divide':
                if (current === 0) {
                    this.showError();
                    return;
                }
                result = previous / current;
                break;
            default:
                return;
        }
        
        // Simpan operasi terakhir untuk penggunaan berulang dengan "="
        this.lastOperand = current;
        this.lastOperation = this.operation;
        
        // Update history dengan operasi lengkap
        const operationSymbol = this.getOperationSymbol(this.operation);
        this.updateHistory(`${this.previousInput} ${operationSymbol} ${this.currentInput} =`);
        
        // Format result
        this.currentInput = this.formatResult(result);
        this.operation = null;
        this.shouldResetInput = true;
        
        this.updateDisplay();
    }
    
    // Format hasil untuk menangani desimal panjang
    formatResult(number) {
        // Convert ke string dengan presisi yang cukup
        const result = number.toString();
        
        // Jika hasil terlalu panjang, gunakan notasi eksponensial
        if (result.length > 12 && !result.includes('e')) {
            return number.toExponential(6);
        }
        
        return result;
    }
    
    // Tampilkan error (untuk pembagian dengan nol)
    showError() {
        this.displayElement.textContent = 'Error';
        this.displayElement.classList.add('error');
        
        // Putar sound error
        this.playSound(150, 'square');
        
        setTimeout(() => {
            this.displayElement.classList.remove('error');
            this.clear();
        }, 1500);
    }
    
    // Clear semua (tombol C)
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.shouldResetInput = false;
        this.lastOperand = null;
        this.lastOperation = null;
        
        this.updateDisplay();
        this.updateHistory('');
    }
    
    // Clear entry (tombol CE) - hanya hapus input saat ini
    clearEntry() {
        this.currentInput = '0';
        this.updateDisplay();
    }
}

// Inisialisasi kalkulator saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new Calculator();
});
