class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 60;
        this.speed = 300; // 像素/秒
        this.life = 3;
    }
    
    update(keys, canvasWidth, canvasHeight) {
        // 处理移动
        if (keys['ArrowLeft'] || keys['a']) {
            this.x -= this.speed / 60; // 假设60FPS
        }
        if (keys['ArrowRight'] || keys['d']) {
            this.x += this.speed / 60;
        }
        if (keys['ArrowUp'] || keys['w']) {
            this.y -= this.speed / 60;
        }
        if (keys['ArrowDown'] || keys['s']) {
            this.y += this.speed / 60;
        }
        
        // 边界检测
        if (this.x < 0) this.x = 0;
        if (this.x > canvasWidth - this.width) this.x = canvasWidth - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > canvasHeight - this.height) this.y = canvasHeight - this.height;
    }
    
    shoot(bullets) {
        // 发射子弹
        bullets.push(new Bullet(this.x + this.width/2 - 2, this.y, 0, -500));
    }
    
    render(ctx) {
        // 绘制赛博朋克风格的玩家飞机
        ctx.fillStyle = '#0ff'; // 青色
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y); // 顶部
        ctx.lineTo(this.x, this.y + this.height); // 左下
        ctx.lineTo(this.x + this.width/2, this.y + this.height - 15); // 中下
        ctx.lineTo(this.x + this.width, this.y + this.height); // 右下
        ctx.closePath();
        ctx.fill();
        
        // 绘制飞机细节
        ctx.fillStyle = '#f0f'; // 紫色
        ctx.fillRect(this.x + this.width/2 - 15, this.y + this.height - 20, 30, 10);
        
        // 绘制能量核心
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + 15, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制光晕效果
        const gradient = ctx.createRadialGradient(
            this.x + this.width/2, this.y + 15, 5,
            this.x + this.width/2, this.y + 15, 15
        );
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}