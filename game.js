// 赛博朋克飞机大战游戏逻辑

// 获取canvas元素和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏状态
const gameState = {
    player: {
        x: canvas.width / 2 - 25,
        y: canvas.height - 60,
        width: 50,
        height: 50,
        speed: 5,
        color: '#0ff',
        shootCooldown: 0
    },
    bullets: [],
    enemies: [],
    score: 0,
    gameOver: false
};

// 按键状态
const keys = {};

// 事件监听器
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 创建敌人
function createEnemy() {
    const size = Math.random() * 30 + 20;
    gameState.enemies.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: Math.random() * 2 + 1,
        color: `hsl(${Math.random() * 60 + 180}, 100%, 50%)`
    });
}

// 更新玩家位置
function updatePlayer() {
    if (keys['ArrowLeft'] || keys['a']) {
        gameState.player.x = Math.max(0, gameState.player.x - gameState.player.speed);
    }
    if (keys['ArrowRight'] || keys['d']) {
        gameState.player.x = Math.min(canvas.width - gameState.player.width, gameState.player.x + gameState.player.speed);
    }
    if (keys['ArrowUp'] || keys['w']) {
        gameState.player.y = Math.max(0, gameState.player.y - gameState.player.speed);
    }
    if (keys['ArrowDown'] || keys['s']) {
        gameState.player.y = Math.min(canvas.height - gameState.player.height, gameState.player.y + gameState.player.speed);
    }
    
    // 射击冷却
    if (gameState.player.shootCooldown > 0) {
        gameState.player.shootCooldown--;
    }
    
    // 射击
    if ((keys[' '] || keys['Enter']) && gameState.player.shootCooldown === 0) {
        gameState.bullets.push({
            x: gameState.player.x + gameState.player.width / 2 - 2.5,
            y: gameState.player.y,
            width: 5,
            height: 15,
            speed: 7,
            color: '#f0f'
        });
        gameState.player.shootCooldown = 10;
    }
}

// 更新子弹位置
function updateBullets() {
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const bullet = gameState.bullets[i];
        bullet.y -= bullet.speed;
        
        // 移除超出屏幕的子弹
        if (bullet.y + bullet.height < 0) {
            gameState.bullets.splice(i, 1);
        }
    }
}

// 更新敌人位置
function updateEnemies() {
    // 定期生成新敌人
    if (Math.random() < 0.03) {
        createEnemy();
    }
    
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        enemy.y += enemy.speed;
        
        // 移除超出屏幕的敌人
        if (enemy.y > canvas.height) {
            gameState.enemies.splice(i, 1);
        }
    }
}

// 碰撞检测
function checkCollisions() {
    // 子弹与敌人碰撞
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const bullet = gameState.bullets[i];
        
        for (let j = gameState.enemies.length - 1; j >= 0; j--) {
            const enemy = gameState.enemies[j];
            
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // 碰撞发生
                gameState.bullets.splice(i, 1);
                gameState.enemies.splice(j, 1);
                gameState.score += 10;
                break;
            }
        }
    }
    
    // 玩家与敌人碰撞
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        
        if (
            gameState.player.x < enemy.x + enemy.width &&
            gameState.player.x + gameState.player.width > enemy.x &&
            gameState.player.y < enemy.y + enemy.height &&
            gameState.player.y + gameState.player.height > enemy.y
        ) {
            // 游戏结束
            gameState.gameOver = true;
            break;
        }
    }
}

// 绘制玩家飞机
function drawPlayer() {
    ctx.fillStyle = gameState.player.color;
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    
    // 绘制赛博朋克风格细节
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    
    // 绘制飞机翼
    ctx.fillStyle = '#0ff';
    ctx.fillRect(gameState.player.x - 10, gameState.player.y + 20, 10, 10);
    ctx.fillRect(gameState.player.x + gameState.player.width, gameState.player.y + 20, 10, 10);
}

// 绘制子弹
function drawBullets() {
    for (const bullet of gameState.bullets) {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // 添加光效
        ctx.fillStyle = '#fff';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, 2);
    }
}

// 绘制敌人
function drawEnemies() {
    for (const enemy of gameState.enemies) {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // 添加霓虹光效
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
}

// 绘制游戏界面
function draw() {
    // 清空画布
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景
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
    
    // 绘制游戏元素
    if (!gameState.gameOver) {
        drawPlayer();
        drawBullets();
        drawEnemies();
    }
    
    // 绘制分数
    ctx.fillStyle = '#0f0';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillText(`分数: ${gameState.score}`, 20, 30);
    
    // 绘制游戏结束画面
    if (gameState.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#f00';
        ctx.font = '48px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = '#0f0';
        ctx.font = '24px "Courier New", monospace';
        ctx.fillText(`最终分数: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText('按R键重新开始', canvas.width / 2, canvas.height / 2 + 100);
        ctx.textAlign = 'left';
    }
}

// 游戏主循环
function gameLoop() {
    if (!gameState.gameOver) {
        updatePlayer();
        updateBullets();
        updateEnemies();
        checkCollisions();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// 重新开始游戏
function restartGame() {
    gameState.player.x = canvas.width / 2 - 25;
    gameState.player.y = canvas.height - 60;
    gameState.bullets = [];
    gameState.enemies = [];
    gameState.score = 0;
    gameState.gameOver = false;
}

// 重新开始按键监听
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        restartGame();
    }
});

// 启动游戏
gameLoop();