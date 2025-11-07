// 创建音频上下文
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

// 音效生成器
class SoundFX {
    static init() {
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
    }
    
    // 播放射击音效
    static shoot() {
        this.init();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
        oscillator.stop(audioCtx.currentTime + 0.1);
    }
    
    // 播放爆炸音效
    static explode() {
        this.init();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 200;
        gainNode.gain.value = 0.2;
        
        oscillator.start();
        oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
        oscillator.stop(audioCtx.currentTime + 0.3);
    }
    
    // 播放背景音乐
    static background() {
        this.init();
        // 简单的背景音乐序列
        const notes = [200, 250, 300, 250, 350, 200];
        const duration = 0.3;
        
        notes.forEach((freq, i) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.type = 'triangle';
            oscillator.frequency.value = freq;
            gainNode.gain.value = 0.05;
            
            oscillator.start(audioCtx.currentTime + i * duration);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + i * duration + duration - 0.01);
            oscillator.stop(audioCtx.currentTime + i * duration + duration);
        });
    }
}

// 修改Player类以添加射击音效
class PlayerWithSound extends Player {
    shoot(bullets) {
        // 播放射击音效
        SoundFX.shoot();
        // 调用父类方法
        super.shoot(bullets);
    }
}

// 修改Game类以添加音效
class GameWithSound extends Game {
    init() {
        // 初始化音频
        SoundFX.init();
        // 播放背景音乐循环
        setInterval(() => SoundFX.background(), 2000);
        // 调用父类方法
        super.init();
    }
    
    createExplosion(x, y) {
        // 播放爆炸音效
        SoundFX.explode();
        // 调用父类方法
        super.createExplosion(x, y);
    }
}