// 赛博朋克飞机大战游戏逻辑
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏状态
const gameState = {
    score: 0,
    lives: 3,
    gameOver: false,
    keys: {}
};

// 玩家飞机
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 40,
    speed: 5,
    color: '#0ff',
    shootCooldown: 0,
    shootDelay: 10
};

// 子弹数组
const bullets = [];

// 敌机数组
const enemies = [];

// 粒子效果数组
const particles = [];

// 星空背景粒子
const stars = [];

// 初始化星空背景
function initStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.5 + 0.1,
            brightness: Math.random() * 0.5 + 0.5
        });
    }
}

// 绘制赛博朋克风格的玩家飞机
function drawPlayer() {
    ctx.save();
    
    // 飞机主体
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width/2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // 飞机边缘发光效果
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 15;
    ctx.fill();
    
    // 飞机驾驶舱
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + player.width/2 - 8, player.y + 10, 16, 10);
    
    // 引擎喷射效果
    const gradient = ctx.createLinearGradient(player.x, player.y + player.height, player.x, player.y + player.height + 15);
    gradient.addColorStop(0, '#ff00ff');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width/2 - 10, player.y + player.height);
    ctx.lineTo(player.x + player.width/2, player.y + player.height + 15);
    ctx.lineTo(player.x + player.width/2 + 10, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// 绘制子弹
function drawBullets() {
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        
        ctx.save();
        ctx.fillStyle = '#ff0';
        ctx.shadowColor = '#ff0';
        ctx.shadowBlur = 10;
        
        // 绘制子弹主体
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制子弹尾焰
        const gradient = ctx.createRadialGradient(bullet.x, bullet.y, 1, bullet.x, bullet.y, 8);
        gradient.addColorStop(0, '#ff0');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 绘制敌机
function drawEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        
        ctx.save();
        
        // 敌机主体
        ctx.fillStyle = '#f0f';
        ctx.shadowColor = '#f0f';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y);
        ctx.lineTo(enemy.x + enemy.width, enemy.y);
        ctx.lineTo(enemy.x + enemy.width/2, enemy.y + enemy.height);
        ctx.closePath();
        ctx.fill();
        
        // 敌机核心
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 绘制粒子效果
function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 绘制星空背景
function drawStars() {
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        ctx.save();
        ctx.globalAlpha = star.brightness;
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 5;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 更新星空背景
function updateStars() {
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.y += star.speed;
        
        // 重置移出屏幕的星星
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }
}

// 创建爆炸粒子效果
function createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 3 + 1,
            speedX: Math.random() * 6 - 3,
            speedY: Math.random() * 6 - 3,
            color: color,
            alpha: 1,
            decay: Math.random() * 0.05 + 0.01
        });
    }
}

// 更新粒子效果
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= p.decay;
        
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

// 更新玩家状态
function updatePlayer() {
    // 处理移动
    if (gameState.keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (gameState.keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (gameState.keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (gameState.keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
    
    // 处理射击
    if (player.shootCooldown > 0) {
        player.shootCooldown--;
    }
    
    if (gameState.keys[' '] && player.shootCooldown === 0) {
        bullets.push({
            x: player.x + player.width / 2,
            y: player.y,
            width: 3,
            height: 10,
            speed: 7,
            color: '#ff0'
        });
        player.shootCooldown = player.shootDelay;
    }
}

// 更新子弹
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y -= bullet.speed;
        
        // 移除飞出屏幕的子弹
        if (bullet.y + bullet.height < 0) {
            bullets.splice(i, 1);
        }
    }
}

// 生成敌机
function spawnEnemy() {
    if (Math.random() < 0.02) { // 2% 概率生成敌机
        enemies.push({
            x: Math.random() * (canvas.width - 40),
            y: -40,
            width: 40,
            height: 30,
            speed: Math.random() * 2 + 1,
            color: '#f0f'
        });
    }
}

// 更新敌机
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemy.speed;
        
        // 移除飞出屏幕的敌机
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
        }
    }
}

// 碰撞检测
function checkCollisions() {
    // 子弹与敌机碰撞
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // 碰撞发生
                createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#f0f');
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                gameState.score += 100;
                updateScore();
                break;
            }
        }
    }
    
    // 玩家与敌机碰撞
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            // 碰撞发生
            createExplosion(player.x + player.width/2, player.y + player.height/2, '#0ff');
            createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#f0f');
            enemies.splice(i, 1);
            gameState.lives--;
            updateLives();
            
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
            }
            break;
        }
    }
}

// 更新得分显示
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
}

// 更新生命显示
function updateLives() {
    document.getElementById('lives').textContent = gameState.lives;
}

// 游戏主循环
function gameLoop() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 更新游戏状态
    if (!gameState.gameOver) {
        updatePlayer();
        updateBullets();
        updateEnemies();
        updateParticles();
        updateStars();
        spawnEnemy();
        checkCollisions();
    }
    
    // 绘制游戏元素
    drawStars();
    drawParticles();
    drawBullets();
    drawEnemies();
    drawPlayer();
    
    // 绘制游戏结束画面
    if (gameState.gameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '48px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f0f';
        ctx.shadowColor = '#f0f';
        ctx.shadowBlur = 15;
        ctx.fillText('游戏结束', canvas.width/2, canvas.height/2);
        
        ctx.font = '24px "Courier New", monospace';
        ctx.fillStyle = '#0ff';
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 10;
        ctx.fillText(`最终得分: ${gameState.score}`, canvas.width/2, canvas.height/2 + 50);
        
        ctx.font = '18px "Courier New", monospace';
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.fillText('按 R 键重新开始', canvas.width/2, canvas.height/2 + 100);
        ctx.restore();
    }
    
    // 继续游戏循环
    requestAnimationFrame(gameLoop);
}

// 键盘事件处理
document.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;
    
    // 重新开始游戏
    if (e.key === 'r' && gameState.gameOver) {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
});

// 重置游戏
function resetGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.gameOver = false;
    bullets.length = 0;
    enemies.length = 0;
    particles.length = 0;
    updateScore();
    updateLives();
}

// 初始化游戏
function init() {
    initStars();
    resetGame();
    gameLoop();
}

// 启动游戏
init();