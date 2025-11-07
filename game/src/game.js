class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.score = 0;
        this.gameRunning = true;
        this.keys = {};
        this.lastTime = 0;
        this.enemySpawnTimer = 0;
        
        this.init();
    }
    
    init() {
        // 初始化玩家飞机
        this.player = new Player(this.width/2, this.height-100);
        
        // 事件监听
        this.setupEventListeners();
        
        // 开始游戏循环
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.player.shoot(this.bullets);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    update(deltaTime) {
        if (!this.gameRunning) return;
        
        // 更新玩家
        this.player.update(this.keys, this.width, this.height);
        
        // 生成敌机
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer > 1000) { // 每秒生成一个敌机
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        
        // 更新敌机
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(deltaTime);
            return enemy.y < this.height + 50; // 移除屏幕外的敌机
        });
        
        // 更新子弹
        this.bullets = this.bullets.filter(bullet => {
            bullet.update(deltaTime);
            return bullet.y > -10; // 移除屏幕外的子弹
        });
        
        // 更新粒子效果
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });
        
        // 碰撞检测
        this.checkCollisions();
    }
    
    spawnEnemy() {
        const x = Math.random() * (this.width - 50);
        this.enemies.push(new Enemy(x, -50));
    }
    
    checkCollisions() {
        // 子弹与敌机碰撞
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    // 移除子弹和敌机
                    this.bullets.splice(bulletIndex, 1);
                    this.enemies.splice(enemyIndex, 1);
                    
                    // 增加分数
                    this.score += 100;
                    
                    // 产生爆炸效果
                    this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                }
            });
        });
        
        // 玩家与敌机碰撞
        this.enemies.forEach((enemy, enemyIndex) => {
            if (this.isColliding(this.player, enemy)) {
                // 游戏结束
                this.gameRunning = false;
                this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
            }
        });
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    createExplosion(x, y) {
        // 创建粒子效果
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(x, y));
        }
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制星云背景
        this.drawBackground();
        
        // 绘制玩家
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // 绘制敌机
        this.enemies.forEach(enemy => {
            enemy.render(this.ctx);
        });
        
        // 绘制子弹
        this.bullets.forEach(bullet => {
            bullet.render(this.ctx);
        });
        
        // 绘制粒子效果
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
        
        // 绘制UI
        this.drawUI();
    }
    
    drawBackground() {
        // 绘制动态星云背景
        for (let i = 0; i < 50; i++) {
            const x = (Math.random() * this.width) | 0;
            const y = (Math.random() * this.height) | 0;
            const size = Math.random() * 3;
            const opacity = Math.random() * 0.5 + 0.1;
            
            this.ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
            this.ctx.fillRect(x, y, size, size);
        }
    }
    
    drawUI() {
        // 绘制分数
        this.ctx.fillStyle = '#0ff';
        this.ctx.font = '20px "Courier New", monospace';
        this.ctx.fillText(`分数: ${this.score}`, 20, 30);
        
        // 绘制生命值
        this.ctx.fillText(`生命: ${this.player ? this.player.life : 0}`, 20, 60);
        
        // 游戏结束提示
        if (!this.gameRunning) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#f0f';
            this.ctx.font = '48px "Courier New", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏结束', this.width/2, this.height/2);
            
            this.ctx.fillStyle = '#0ff';
            this.ctx.font = '24px "Courier New", monospace';
            this.ctx.fillText(`最终分数: ${this.score}`, this.width/2, this.height/2 + 50);
            this.ctx.fillText('按F5重新开始', this.width/2, this.height/2 + 100);
            this.ctx.textAlign = 'left';
        }
    }
    
    gameLoop(timestamp) {
        // 计算帧时间差
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // 更新游戏状态
        this.update(deltaTime);
        
        // 渲染游戏画面
        this.render();
        
        // 继续游戏循环
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// 启动游戏
window.addEventListener('load', () => {
    new Game();
});