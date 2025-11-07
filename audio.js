// 音效管理器
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.sfxVolume = 1.0;
        this.musicVolume = 0.7;
        this.init();
    }
    
    init() {
        // 创建音频上下文
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn("Web Audio API 不支持");
        }
        
        // 创建合成音效
        this.createShootSound();
        this.createExplosionSound();
    }
    
    // 创建射击音效
    createShootSound() {
        if (!this.audioContext) return;
        
        const sound = () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'square';
            oscillator.frequency.value = 800;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
        
        this.sounds.shoot = sound;
    }
    
    // 创建爆炸音效
    createExplosionSound() {
        if (!this.audioContext) return;
        
        const sound = () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
        
        this.sounds.explosion = sound;
    }
    
    // 播放音效
    playSound(name) {
        if (this.sounds[name]) {
            try {
                this.sounds[name]();
            } catch (e) {
                console.warn("无法播放音效:", name);
            }
        }
    }
    
    // 播放射击音效
    playShoot() {
        this.playSound('shoot');
    }
    
    // 播放爆炸音效
    playExplosion() {
        this.playSound('explosion');
    }
}

// 导出音频管理器
window.AudioManager = AudioManager;