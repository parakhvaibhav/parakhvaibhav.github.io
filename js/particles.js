class GradientMesh {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.blobs = [];
    this.animationId = null;
    this.time = 0;
    this.isVisible = true;
    this.resize();
    this.init();
    this.animate();
    this.setupObserver();
    window.addEventListener('resize', () => this.resize());
  }

  init() {
    this.blobs = [
      { x: 0.3, y: 0.3, r: 0.4, color: [74, 58, 255], speed: 0.0003, phase: 0 },
      { x: 0.7, y: 0.6, r: 0.35, color: [123, 97, 255], speed: 0.0004, phase: 1.5 },
      { x: 0.5, y: 0.8, r: 0.45, color: [26, 16, 53], speed: 0.0002, phase: 3 },
      { x: 0.2, y: 0.7, r: 0.3, color: [40, 30, 120], speed: 0.0005, phase: 4.5 },
      { x: 0.8, y: 0.2, r: 0.35, color: [60, 40, 180], speed: 0.00035, phase: 2 },
    ];
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.canvas.offsetWidth * dpr;
    this.canvas.height = this.canvas.offsetHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = this.canvas.offsetWidth;
    this.height = this.canvas.offsetHeight;
  }

  setupObserver() {
    const observer = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
      if (this.isVisible && !this.animationId) this.animate();
    }, { threshold: 0.1 });
    observer.observe(this.canvas);
  }

  animate() {
    if (!this.isVisible) {
      this.animationId = null;
      return;
    }

    this.time++;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.blobs.forEach(blob => {
      const x = this.width * (blob.x + 0.1 * Math.sin(this.time * blob.speed + blob.phase));
      const y = this.height * (blob.y + 0.08 * Math.cos(this.time * blob.speed * 1.3 + blob.phase));
      const r = Math.min(this.width, this.height) * blob.r;

      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, r);
      const [cr, cg, cb] = blob.color;
      gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.4)`);
      gradient.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, 0.15)`);
      gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);

      this.ctx.globalCompositeOperation = 'screen';
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
    });

    this.ctx.globalCompositeOperation = 'source-over';
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-canvas');
  if (canvas) new GradientMesh(canvas);
});
