import React, { useRef, useEffect } from 'react';

const LiveBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Resize handler
        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', resize);
        resize();

        // 3D Capsule Class
        class Capsule {
            constructor() {
                this.init();
            }

            init() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.z = Math.random() * 2 + 0.5; // Depth scale
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02;
                this.size = (Math.random() * 20 + 30) * this.z;
                this.color1 = Math.random() > 0.5 ? '#0d9488' : '#3b82f6'; // Teal or Blue
                this.color2 = '#ffffff'; // White
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.rotation += this.rotationSpeed;

                // Wrap around screen
                if (this.x < -100) this.x = width + 100;
                if (this.x > width + 100) this.x = -100;
                if (this.y < -100) this.y = height + 100;
                if (this.y > height + 100) this.y = -100;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.scale(this.z, this.z);

                // Shadow
                ctx.shadowColor = 'rgba(0,0,0,0.1)';
                ctx.shadowBlur = 15;

                // Draw Capsule Body (split in two)
                const w = this.size; // Width (long side)
                const h = this.size * 0.4; // Height (short side)
                const r = h / 2; // Radius

                // Clip for rounded shape
                ctx.beginPath();
                ctx.roundRect(-w / 2, -h / 2, w, h, r);
                ctx.clip();

                // Left Half (Color)
                ctx.fillStyle = this.color1;
                ctx.fillRect(-w / 2, -h / 2, w / 2, h);

                // Right Half (White)
                ctx.fillStyle = this.color2;
                ctx.fillRect(0, -h / 2, w / 2, h);

                // Gloss/Reflection
                ctx.beginPath();
                ctx.ellipse(-w / 4, -h / 4, w / 4, h / 4, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fill();

                ctx.restore();
            }
        }

        // Particle Class (Microscopic dust)
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.size = Math.random() * 2 + 0.5;
                this.alpha = Math.random() * 0.3 + 0.1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(148, 163, 184, ${this.alpha})`;
                ctx.fill();
            }
        }

        // Init Items
        const capsules = Array.from({ length: 6 }, () => new Capsule());
        const particles = Array.from({ length: 30 }, () => new Particle());

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw Particles first (background)
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw Capsules
            capsules.forEach(c => {
                c.update();
                c.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 -z-20 pointer-events-none opacity-60" />;
};

export default LiveBackground;
