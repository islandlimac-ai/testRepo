// 赛博朋克飞机大战游戏逻辑

// 获取canvas元素和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏对象
const game = {
    player: null,
    enemies: [],
    bullets: [],
    score: 0,
    gameOver: false,
    keys: {}
};

// 玩家飞机类
class Player {
    constructor() {
        this.width = 50;
        this.height = 40;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.speed = 5;
        this.color = '#0ff';
        this.shootCooldown = 0;
    }

    draw() {
        // 绘制赛博朋克风格的飞机
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 飞机细节
        ctx.fillStyle = '#f0f';
        ctx.fillRect(this.x + 10, this.y - 10, 10, 10);
        ctx.fillRect(this.x + 30, this.y - 10, 10, 10);
        
        // 发光效果
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    update() {
        // 移动控制
        if (game.keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (game.keys['ArrowRight'] && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
        if (game.keys['ArrowUp'] && this.y > 0) {
            this.y -= this.speed;
        }
        if (game.keys['ArrowDown'] && this.y < canvas.height - this.height) {
            this.y += this.speed;
        }
        
        // 射击冷却
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
        
        // 射击
        if (game.keys[' '] && this.shootCooldown === 0) {
            this.shoot();
            this.shootCooldown = 15;
        }
    }

    shoot() {
        game.bullets.push(new Bullet(this.x + this.width / 2 - 2.5, this.y, 0, -10));
    }
}

// 敌机类
class Enemy {
    constructor() {
        this.width = 40;
        this.height = 30;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 2 + Math.random() * 3;
        this.color = '#f0f';
    }

    draw() {
        // 绘制赛博朋克风格的敌机
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 敌机细节
        ctx.fillStyle = '#0ff';
        ctx.fillRect(this.x + 5, this.y + 20, 10, 5);
        ctx.fillRect(this.x + 25, this.y + 20, 10, 5);
        
        // 发光效果
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    update() {
        this.y += this.speed;
        
        // 移除离开屏幕的敌机
        if (this.y > canvas.height) {
            const index = game.enemies.indexOf(this);
            if (index > -1) {
                game.enemies.splice(index, 1);
            }
        }
    }
}

// 子弹类
class Bullet {
    constructor(x, y, dx, dy) {
        this.width = 5;
        this.height = 15;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.color = '#0ff';
    }

    draw() {
        // 绘制赛博朋克风格的子弹
        ctx.fillStyle = this.color;
        
        // 发光效果
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        
        // 移除离开屏幕的子弹
        if (this.y < -this.height) {
            const index = game.bullets.indexOf(this);
            if (index > -1) {
                game.bullets.splice(index, 1);
            }
        }
    }
}

// 初始化游戏
function init() {
    game.player = new Player();
    
    // 事件监听
    window.addEventListener('keydown', (e) => {
        game.keys[e.key] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        game.keys[e.key] = false;
    });
    
    // 开始游戏循环
    gameLoop();
}

// 游戏循环
function gameLoop() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景网格
    drawBackground();
    
    // 生成敌机
    if (Math.random() < 0.02) {
        game.enemies.push(new Enemy());
    }
    
    // 更新和绘制玩家
    if (game.player) {
        game.player.update();
        game.player.draw();
    }
    
    // 更新和绘制敌机
    game.enemies.forEach(enemy => {
        enemy.update();
        enemy.draw();
    });
    
    // 更新和绘制子弹
    game.bullets.forEach(bullet => {
        bullet.update();
        bullet.draw();
    });
    
    // 碰撞检测
    checkCollisions();
    
    // 显示分数
    drawScore();
    
    // 继续游戏循环
    if (!game.gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// 绘制背景网格
function drawBackground() {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // 垂直线
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 水平线
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 碰撞检测
function checkCollisions() {
    // 子弹与敌机碰撞
    for (let i = game.bullets.length - 1; i >= 0; i--) {
        for (let j = game.enemies.length - 1; j >= 0; j--) {
            if (isColliding(game.bullets[i], game.enemies[j])) {
                game.bullets.splice(i, 1);
                game.enemies.splice(j, 1);
                game.score += 100;
                break;
            }
        }
    }
    
    // 玩家与敌机碰撞
    for (let i = game.enemies.length - 1; i >= 0; i--) {
        if (isColliding(game.player, game.enemies[i])) {
            game.gameOver = true;
            alert(`游戏结束! 最终得分: ${game.score}`);
            break;
        }
    }
}

// 碰撞检测辅助函数
function isColliding(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// 绘制分数
function drawScore() {
    ctx.fillStyle = '#0f0';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillText(`得分: ${game.score}`, 20, 30);
}

// 启动游戏
init();