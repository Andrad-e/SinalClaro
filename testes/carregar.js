// Extrai partes do script do protótipo (prototipo/index.html) para testar no Node,
// sem navegador: o motor de reconhecimento e a detecção de começo/fim do sinal.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'prototipo', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const app = scripts[scripts.length - 1];

function trecho(inicio, fim) {
  const a = app.indexOf(inicio);
  const b = app.indexOf(fim, a);
  if (a < 0 || b < 0) throw new Error('Trecho não encontrado no protótipo: ' + inicio);
  return app.slice(a, b);
}

const motor = trecho('  var Recog = (function(){', '  /* ================= dados');
const segmentacao = trecho('  var seg = { on: false', '  function camLoop(now){');

function carregarMotor() {
  return new Function(motor + '\nreturn Recog;')();
}

// mão sintética: 21 pontos com o pulso em (x, y); curl < 1 dobra os dedos
function mao(x, y, curl = 1) {
  const pts = [];
  for (let i = 0; i < 21; i++) {
    const f = Math.floor((i - 1) / 4), k = (i - 1) % 4;
    const dx = i === 0 ? 0 : (f - 2) * 0.02;
    const dy = i === 0 ? 0 : -(k + 1) * 0.025 * (f === 0 ? 1 : curl);
    pts.push({ x: x + dx, y: y + dy, z: 0 });
  }
  return pts;
}

// corpo sintético no formato do Pose Landmarker (33 pontos)
function corpo() {
  const b = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  b[0] = { x: 0.5, y: 0.45, z: 0 };
  b[11] = { x: 0.62, y: 0.7, z: 0 };
  b[12] = { x: 0.38, y: 0.7, z: 0 };
  return b;
}

module.exports = { carregarMotor, segmentacao, motor, mao, corpo };
