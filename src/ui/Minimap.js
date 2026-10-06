/**
 * MINIMAP — a horizontal cross-section of the eye seen from above, with a dot showing
 * where you are and which way you're looking. Drawn from the same anatomy profiles
 * as the 3D model.
 */
import * as A from '../config/anatomy.js';

export class Minimap {
  constructor(canvas, nerveSamplesWorld) {
    this.c = canvas;
    this.g = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.size = 174;
    canvas.width = this.size * dpr;
    canvas.height = this.size * dpr;
    this.g.scale(dpr, dpr);
    this.nerve = nerveSamplesWorld; // [{x,z}]
    this.bg = this.renderBackground();
  }

  // world x (nasal +) -> canvas x ; world z (front +) -> canvas y (front at top)
  map(x, z) {
    const s = this.size / 46;
    return [this.size / 2 + x * s, this.size * 0.44 - z * s];
  }

  renderBackground() {
    const off = document.createElement('canvas');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    off.width = off.height = this.size * dpr;
    const g = off.getContext('2d');
    g.scale(dpr, dpr);
    const draw = (pts, fill, stroke, mirror = true) => {
      for (const side of mirror ? [1, -1] : [1]) {
        g.beginPath();
        pts.forEach(([r, y], i) => {
          const [px, py] = this.map(r * side, y);
          if (i === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        });
        g.closePath();
        if (fill) {
          g.fillStyle = fill;
          g.fill();
        }
        if (stroke) {
          g.strokeStyle = stroke;
          g.lineWidth = 1;
          g.stroke();
        }
      }
    };
    // optic nerve
    g.strokeStyle = 'rgba(234,220,192,0.55)';
    g.lineWidth = 6;
    g.lineCap = 'round';
    g.beginPath();
    this.nerve.forEach((p, i) => {
      const [px, py] = this.map(p.x, p.z);
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    });
    g.stroke();
    // vitreous
    g.fillStyle = 'rgba(40, 70, 110, 0.35)';
    g.beginPath();
    const [cx, cy] = this.map(0, 0);
    g.arc(cx, cy, (A.DIMS.retinaInnerR * this.size) / 46, 0, Math.PI * 2);
    g.fill();
    draw(A.scleraProfile(), 'rgba(235,228,218,0.85)', null);
    draw(A.retinaProfile(), 'rgba(224,138,108,0.9)', null);
    draw(A.corneaProfile(), 'rgba(140,210,240,0.55)', 'rgba(140,210,240,0.8)');
    draw(A.ciliaryProfile(), 'rgba(120,55,38,0.95)', null);
    draw(A.lensProfile(), 'rgba(245,225,160,0.6)', 'rgba(245,225,160,0.9)');
    draw(A.irisProfile().loop, 'rgba(110,80,55,1)', null);
    // labels
    g.fillStyle = 'rgba(200,220,240,0.55)';
    g.font = '9px IBM Plex Sans, sans-serif';
    g.textAlign = 'center';
    g.fillText('FRONT', this.size / 2, 9);
    g.save();
    g.translate(this.size - 6, this.size * 0.44);
    g.rotate(Math.PI / 2);
    g.fillText('NOSE', 0, 0);
    g.restore();
    return off;
  }

  draw(camPos, camDir, eyeScale = 1) {
    const g = this.g;
    g.clearRect(0, 0, this.size, this.size);
    g.drawImage(this.bg, 0, 0, this.size, this.size);
    const [px, py] = this.map(camPos.x / eyeScale, camPos.z / eyeScale);
    const inside = px > -10 && px < this.size + 10 && py > -10 && py < this.size + 10;
    const x = Math.max(6, Math.min(this.size - 6, px));
    const y = Math.max(6, Math.min(this.size - 6, py));
    // view cone
    const ang = Math.atan2(-camDir.z, camDir.x);
    g.fillStyle = 'rgba(94, 227, 255, 0.22)';
    g.beginPath();
    g.moveTo(x, y);
    g.arc(x, y, 30, ang - 0.5, ang + 0.5);
    g.closePath();
    g.fill();
    g.fillStyle = inside ? '#5ee3ff' : '#ffbd4a';
    g.shadowColor = '#5ee3ff';
    g.shadowBlur = 8;
    g.beginPath();
    g.arc(x, y, 4, 0, Math.PI * 2);
    g.fill();
    g.shadowBlur = 0;
  }
}
