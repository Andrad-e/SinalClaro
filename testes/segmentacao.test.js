// Começo e fim do sinal: a leitura começa quando a mão sobe, termina quando desce,
// descarta sinais rápidos demais e corta uma mão parada no ar depois de 4 s.
const assert = require('assert');
const { motor, segmentacao, mao, corpo } = require('./carregar');

const ctx = { cam: { purpose: 'teach', body: corpo(), msgUntil: 0 }, video: { videoWidth: 640, videoHeight: 480 }, saved: [], recog: [], status: '' };
const M = new Function('ctx', `
  var cam = ctx.cam, video = ctx.video;
  function clamp(x, a, b){ return x < a ? a : x > b ? b : x; }
  function setRing(){}
  function setStatus(t){ ctx.status = t; }
  function readyStatus(){ return 'pronto'; }
  function sign(g){ return { idx: 0, gloss: g, pt: g, thr: 0.8 }; }
  function saveTeach(s){ ctx.saved.push(s); }
  function recognized(r){ ctx.recog.push(r); }
  ${motor}
  ${segmentacao}
  return { Recog: Recog, realStep: realStep };
`)(ctx);

const SINAL = {
  OI: (t) => mao(0.4 + 0.06 * Math.sin(t * 12), 0.45, 1),
  SIM: (t) => mao(0.42, 0.62 + 0.05 * Math.abs(Math.sin(t * 9)), 0.3),
};
const DIREITA = [[{ categoryName: 'Right' }]];
let now = 1000;
function fazer(fn, quadros) {
  for (let i = 0; i < 12; i++) M.realStep((now += 33), [], []);
  for (let i = 0; i < quadros; i++) M.realStep((now += 33), [fn(i / (quadros - 1))], DIREITA);
  for (let i = 0; i < 20; i++) M.realStep((now += 33), [], []);
}

// ensinar: cada sinal feito e abaixado vira uma amostra
['OI', 'SIM'].forEach((g) => {
  for (let k = 0; k < 5; k++) fazer(SINAL[g], 35 + k * 6);
  ctx.saved.slice(-5).forEach((s) => { s.sinal = g; });
});
ctx.saved.forEach((s, i) => { s.id = 'x' + i; });
assert.strictEqual(ctx.saved.length, 10, 'cada sinal deveria virar uma amostra');
assert.ok(ctx.saved[0].quadros[0].corpo, 'a amostra guarda os pontos do corpo');
assert.ok(!('imagem' in ctx.saved[0]), 'a amostra não guarda imagem');
M.Recog.rebuild(ctx.saved);

// conversa: reconhece, recusa o desconhecido e descarta o rápido demais
ctx.cam.purpose = 'talk';
fazer(SINAL.OI, 50);
fazer(SINAL.SIM, 30);
fazer((t) => mao(0.6, 0.3 + t * 0.3, 0.6), 40);
fazer(SINAL.OI, 4);
const lidos = ctx.recog.map((r) => `${r.s.gloss} ${(r.conf * 100).toFixed(0)}%`);
console.log('leituras:', lidos.join(' | '), '· status final:', ctx.status);
assert.strictEqual(ctx.recog.length, 3, 'três leituras: o sinal rápido demais é descartado');
assert.strictEqual(ctx.recog[0].s.gloss, 'OI');
assert.strictEqual(ctx.recog[1].s.gloss, 'SIM');
assert.ok(ctx.recog[0].conf >= 0.8 && ctx.recog[1].conf >= 0.8, 'sinais ensinados com confiança alta');
assert.ok(ctx.recog[2].conf < 0.8, 'gesto desconhecido abaixo do limiar');
assert.match(ctx.status, /Rápido demais/);

// mão parada no ar: corta em 4 s e pede para abaixar
ctx.recog = [];
for (let i = 0; i < 12; i++) M.realStep((now += 33), [], []);
for (let i = 0; i < 200; i++) M.realStep((now += 33), [SINAL.OI(0.3)], DIREITA);
assert.strictEqual(ctx.recog.length, 1, 'uma leitura só, cortada em 4 s');
assert.match(ctx.status, /Abaixe as mãos/);

console.log('ok: segmentação');
