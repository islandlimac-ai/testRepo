class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 150; // 像素/秒
        this.color = `hsl(${Math.random() * 60 + 300}, 100%, 60%)`; // 紫红色调
    }
    
    update(deltaTime) {
        // 向下移动
        this.y += this.speed * (deltaTime / 1000);
    }
    
    render(ctx) {
        // 绘制赛博朋克风格的敌机
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y); // 顶部
        ctx.lineTo(this.x + this.width, this.y); // 右上
        ctx.lineTo(this.x + this.width/2, this.y + this.height); // 底部
        ctx.closePath();
        ctx.fill();
        
        // 绘制细节
        ctx.fillStyle = '#0ff'; // 青色
        ctx.fillRect(this.x + this.width/2 - 8, this.y + 10, 16, 8);
        
        // 绘制能量核心
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + 30, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制光晕效果
        const gradient = ctx.createRadialGradient(
            this.x + this.width/2, this.y + 30, 4,
            this.x + this.width/2, this.y + 30, 12
        );
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + 30, 12, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Bullet {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 15;
        this.vx = vx; // 水平速度
        this.vy = vy; // 垂直速度
    }
    
    update(deltaTime) {
        // 更新位置
        this.x += this.vx * (deltaTime / 1000);
        this.y += this.vy * (deltaTime / 1000);
    }
    
    render(ctx) {
        // 绘制赛博朋克风格的子弹
        ctx.fillStyle = '#0ff'; // 青色
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制光晕效果
        const gradient = ctx.createRadialGradient(
            this.x + this.width/2, this.y + this.height/2, 1,
            this.x + this.width/2, this.y + this.height/2, 8
        );
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 200; // 随机水平速度
        this.vy = (Math.random() - 0.5) * 200; // 随机垂直速度
        this.life = 1.0; // 生命值 (0-1)
        this.decay = Math.random() * 0.05 + 0.01; // 衰减速度
        this.size = Math.random() * 5 + 2; // 大小
        this.color = `hsl(${Math.random() * 60 + 300}, 100%, 70%)`; // 紫红色调
    }
    
    update(deltaTime) {
        // 更新位置
        this.x += this.vx * (deltaTime / 1000);
        this.y += this.vy * (deltaTime / 1000);
        
        // 更新生命值
        this.life -= this.decay * (deltaTime / 16); // 标准化到60FPS
        
        // 逐渐减速
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
    
    render(ctx) {
        // 绘制粒子
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}