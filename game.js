class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 音频管理器
        this.audioManager = new AudioManager();
        
        // 游戏状态
        this.running = false;
        this.score = 0;
        this.particles = [];
        
        // 玩家飞机
        this.player = {
            x: this.width / 2 - 25,
            y: this.height - 100,
            width: 50,
            height: 50,
            speed: 5,
            color: '#0ff',
            shootCooldown: 0
        };
        
        // 游戏对象数组
        this.bullets = [];
        this.enemies = [];
        
        // 控制相关
        this.keys = {};
        this.setupEventListeners();
        
        // 开始游戏
        this.start();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    start() {
        this.running = true;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.running) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // 处理玩家输入
        this.handleInput();
        
        // 更新射击冷却
        if (this.player.shootCooldown > 0) {
            this.player.shootCooldown--;
        }
        
        // 更新子弹
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= this.bullets[i].speed;
            
            // 移除超出屏幕的子弹
            if (this.bullets[i].y < 0) {
                this.bullets.splice(i, 1);
            }
        }
        
        // 生成敌机
        if (Math.random() < 0.02) {
            this.enemies.push({
                x: Math.random() * (this.width - 50),
                y: -50,
                width: 50,
                height: 50,
                speed: 2 + Math.random() * 2,
                color: '#f0f'
            });
        }
        
        // 更新敌机
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].y += this.enemies[i].speed;
            
            // 移除超出屏幕的敌机
            if (this.enemies[i].y > this.height) {
                this.enemies.splice(i, 1);
                continue;
            }
            
            // 检查碰撞（简化版）
            if (this.checkCollision(this.player, this.enemies[i])) {
                this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, this.player.color);
                
                // 播放爆炸音效
                this.audioManager.playExplosion();
                this.gameOver();
                return;
            }
            
            // 检查子弹与敌机碰撞
            for (let j = this.bullets.length - 1; j >= 0; j--) {
                if (this.checkCollision(this.bullets[j], this.enemies[i])) {
                    // 创建爆炸效果
                    this.createExplosion(
                        this.enemies[i].x + this.enemies[i].width/2, 
                        this.enemies[i].y + this.enemies[i].height/2, 
                        this.enemies[i].color
                    );
                    
                    // 播放爆炸音效
                    this.audioManager.playExplosion();
                    
                    this.bullets.splice(j, 1);
                    this.enemies.splice(i, 1);
                    this.score += 100;
                    break;
                }
            }
        }
        
        // 更新粒子效果
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].x += this.particles[i].vx;
            this.particles[i].y += this.particles[i].vy;
            this.particles[i].life--;
            
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    handleInput() {
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.x = Math.min(this.width - this.player.width, this.player.x + this.player.speed);
        }
        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.player.y = Math.max(0, this.player.y - this.player.speed);
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.player.y = Math.min(this.height - this.player.height, this.player.y + this.player.speed);
        }
        if (this.keys[' '] && this.player.shootCooldown <= 0) {
            this.shoot();
            this.player.shootCooldown = 10; // 设置射击冷却时间
        }
    }
    
    shoot() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2.5,
            y: this.player.y,
            width: 5,
            height: 15,
            speed: 10,
            color: '#0ff'
        });
        
        // 添加射击特效
        this.createExplosion(this.player.x + this.player.width / 2, this.player.y, '#0ff', 5);
        
        // 播放射击音效
        this.audioManager.playShoot();
    }
    
    createExplosion(x, y, color, particleCount = 20) {
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const life = 20 + Math.random() * 20;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1 + Math.random() * 3,
                color: color,
                life: life,
                maxLife: life
            });
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制粒子效果
        for (const particle of this.particles) {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / particle.maxLife;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }
        
        // 绘制玩家飞机
        this.drawNeonRect(this.player.x, this.player.y, this.player.width, this.player.height, this.player.color);
        
        // 绘制子弹
        for (const bullet of this.bullets) {
            this.drawNeonRect(bullet.x, bullet.y, bullet.width, bullet.height, bullet.color);
        }
        
        // 绘制敌机
        for (const enemy of this.enemies) {
            this.drawNeonRect(enemy.x, enemy.y, enemy.width, enemy.height, enemy.color);
        }
        
        // 绘制得分
        this.ctx.fillStyle = '#0ff';
        this.ctx.font = '20px "Courier New", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#0ff';
        this.ctx.fillText('得分: ' + this.score, 20, 50);
        this.ctx.shadowBlur = 0;
    }
    
    drawNeonRect(x, y, width, height, color) {
        // 绘制主体
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        
        // 绘制霓虹边框
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = color;
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.shadowBlur = 0;
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    createExplosion(x, y, color, particleCount = 20) {
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const life = 20 + Math.random() * 20;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1 + Math.random() * 3,
                color: color,
                life: life,
                maxLife: life
            });
        }
    }
    
    gameOver() {
        this.running = false;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#0ff';
        this.ctx.font = '40px "Courier New", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#0ff';
        this.ctx.fillText('游戏结束', this.width / 2, this.height / 2 - 30);
        this.ctx.font = '25px "Courier New", monospace';
        this.ctx.fillText('最终得分: ' + this.score, this.width / 2, this.height / 2 + 20);
        this.ctx.fillText('刷新页面重新开始', this.width / 2, this.height / 2 + 60);
        this.ctx.shadowBlur = 0;
    }
}

// 启动游戏
window.addEventListener('load', () => {
    new Game();
});
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    createExplosion(x, y, color, particleCount = 20) {
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const life = 20 + Math.random() * 20;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1 + Math.random() * 3,
                color: color,
                life: life,
                maxLife: life
            });
        }
    }
}

// 启动游戏
    gameOver() {
        this.running = false;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#0ff';
        this.ctx.font = '40px "Courier New", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#0ff';
        this.ctx.fillText('游戏结束', this.width / 2, this.height / 2 - 30);
        this.ctx.font = '25px "Courier New", monospace';
        this.ctx.fillText('最终得分: ' + this.score, this.width / 2, this.height / 2 + 20);
        this.ctx.fillText('刷新页面重新开始', this.width / 2, this.height / 2 + 60);
        this.ctx.shadowBlur = 0;
    }