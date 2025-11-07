class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 游戏状态
        this.gameState = 'stopped'; // 'stopped', 'running', 'paused'
        this.score = 0;
        this.health = 3;
        
        // 玩家飞机
        this.player = {
            x: this.width / 2 - 25,
            y: this.height - 60,
            width: 50,
            height: 40,
            speed: 5
        };
        
        // 子弹数组
        this.bullets = [];
        
        // 敌机数组
        this.enemies = [];
        
        // 性能优化：时间控制
        this.lastTime = 0;
        this.enemySpawnRate = 0.02; // 敌机生成概率
        
        // 初始化事件监听器
        this.initEventListeners();
    }
    
    initEventListeners() {
        // 键盘事件
        this.keys = {};
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // 按钮事件
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pauseButton').addEventListener('click', () => {
            this.togglePause();
        });
    }
    
    startGame() {
        if (this.gameState === 'stopped' || this.gameState === 'paused') {
            this.gameState = 'running';
            if (this.health <= 0) {
                // 重新开始游戏
                this.score = 0;
                this.health = 3;
                this.bullets = [];
                this.enemies = [];
            }
            this.updateUI();
            // 重置时间
            this.lastTime = 0;
            this.gameLoop(0);
        }
    }
    
    togglePause() {
        if (this.gameState === 'running') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'running';
            this.gameLoop();
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = `得分: ${this.score}`;
        document.getElementById('health').textContent = `生命: ${this.health}`;
    }
    
    movePlayer() {
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
        
        // 射击 (限制射击频率)
        if ((this.keys[' '] || this.keys['j']) && this.canShoot()) {
            this.shoot();
            this.lastShootTime = Date.now();
        }
    }
    
    // 检查是否可以射击
    canShoot() {
        const now = Date.now();
        return !this.lastShootTime || now - this.lastShootTime > 150; // 150ms射击间隔
    }
    
    shoot() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 7
        });
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= this.bullets[i].speed;
            
            // 移除超出屏幕的子弹
            if (this.bullets[i].y + this.bullets[i].height < 0) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    // 生成敌机
    spawnEnemy() {
        // 随机生成敌机
        const enemy = {
            x: Math.random() * (this.width - 40),
            y: -40,
            width: 40,
            height: 30,
            speed: 2 + Math.random() * 2
        };
        
        this.enemies.push(enemy);
    }
    
    // 更新敌机位置
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].y += this.enemies[i].speed;
            
            // 移除超出屏幕的敌机
            if (this.enemies[i].y > this.height) {
                this.enemies.splice(i, 1);
            }
        }
    }
    
    // 碰撞检测
    checkCollisions() {
        // 子弹与敌机碰撞检测
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.isColliding(this.bullets[i], this.enemies[j])) {
                    // 移除子弹和敌机
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    
                    // 增加得分
                    this.score += 10;
                    this.updateUI();
                    break;
                }
            }
        }
        
        // 玩家与敌机碰撞检测
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.isColliding(this.player, this.enemies[i])) {
                // 移除敌机
                this.enemies.splice(i, 1);
                
                // 减少生命值
                this.health -= 1;
                this.updateUI();
                
                // 检查游戏是否结束
                if (this.health <= 0) {
                    this.gameOver();
                }
                break;
            }
        }
    }
    
    // 矩形碰撞检测
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    // 游戏结束
    gameOver() {
        this.gameState = 'stopped';
        alert(`游戏结束! 最终得分: ${this.score}`);
        // 显示重新开始按钮
        document.getElementById('startButton').textContent = '重新开始';
    }
    
    drawPlayer() {
        // 绘制霓虹效果的飞机
        this.ctx.shadowColor = '#0ff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#0ff';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // 绘制飞机细节
        this.ctx.fillStyle = '#f0f';
        this.ctx.fillRect(this.player.x + 10, this.player.y + 10, 30, 20);
        
        // 重置阴影
        this.ctx.shadowBlur = 0;
    }
    
    drawBullets() {
        // 绘制霓虹效果的子弹
        this.ctx.shadowColor = '#ff0';
        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = '#ff0';
        for (let bullet of this.bullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        // 重置阴影
        this.ctx.shadowBlur = 0;
    }
    
    // 绘制敌机
    drawEnemies() {
        for (let enemy of this.enemies) {
            // 绘制霓虹效果的敌机
            this.ctx.shadowColor = '#f00';
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = '#f00';
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 绘制敌机细节
            this.ctx.shadowColor = '#00f';
            this.ctx.shadowBlur = 5;
            this.ctx.fillStyle = '#00f';
            this.ctx.fillRect(enemy.x + 5, enemy.y + 5, 30, 20);
        }
        // 重置阴影
        this.ctx.shadowBlur = 0;
    }
    
    gameLoop(timestamp) {
        if (this.gameState !== 'running') return;
        
        // 计算时间差用于平滑动画
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 更新游戏对象
        this.movePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.checkCollisions();
        
        // 根据时间差调整敌机生成概率
        if (Math.random() < this.enemySpawnRate * (deltaTime / 16)) {
            this.spawnEnemy();
        }
        
        // 绘制游戏对象
        this.drawPlayer();
        this.drawBullets();
        this.drawEnemies();
        
        // 继续游戏循环
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
}

// 启动游戏
window.addEventListener('load', () => {
    const game = new Game();
    window.game = game; // 为了调试方便
});