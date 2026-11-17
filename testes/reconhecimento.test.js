// Motor de reconhecimento: acerta sinais ensinados, recusa gestos desconhecidos
// e reconhece o mesmo sinal feito com a outra mão (exemplos espelhados).
const assert = require('assert');
const { carregarMotor, mao } = require('./carregar');

const Recog = carregarMotor();
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const CORPO = [0.5, 0.45, 0, 0.48, 0.43, 0, 0.52, 0.43, 0, 0.49, 0.5, 0, 0.51, 0.5, 0, 0.62, 0.7, 0, 0.38, 0.7, 0, 0.7, 0.9, 0, 0.3, 0.9, 0];
const SINAIS = {
  OI: (t) => mao(0.4 + 0.06 * Math.sin(t * 12), 0.45, 1),
  SIM: (t) => mao(0.42, 0.62 + 0.05 * Math.abs(Math.sin(t * 9)), 0.3),
  NÃO: (t) => mao(0.36 + 0.08 * Math.sin(t * 14), 0.55, 0.5),
  ONDE: (t) => mao(0.3 + 0.12 * t, 0.6 - 0.15 * t, 0.7),
};

function amostra(sinal, fn, { lado = 'Right', ruido = 0.004 } = {}) {
  const n = Math.round(30 + rnd() * 30);
  const dx = (rnd() - 0.5) * 0.06;
  const quadros = [];
  for (let f = 0; f < n; f++) {
    const p = [];
    fn(f / (n - 1)).forEach((q) => p.push(q.x + dx + (rnd() - 0.5) * ruido, q.y + (rnd() - 0.5) * ruido, 0));
    quadros.push({ t: f * 33, maos: [{ lado, p }], corpo: CORPO.map((v, i) => (i % 3 === 0 ? v + dx : v)) });
  }
  return { id: sinal + rnd(), sinal, aspecto: 4 / 3, quadros };
}

// treino: 5 exemplos de cada sinal, feitos com a mão direita
const treino = [];
Object.entries(SINAIS).forEach(([s, fn]) => { for (let i = 0; i < 5; i++) treino.push(amostra(s, fn)); });
Recog.rebuild(treino);
assert.deepStrictEqual(Object.keys(Recog.glosses()).sort(), Object.keys(SINAIS).sort(), 'os sinais ensinados aparecem na biblioteca');

// 1) acerta os sinais ensinados, com confiança alta
let acertos = 0, total = 0;
Object.entries(SINAIS).forEach(([s, fn]) => {
  for (let i = 0; i < 10; i++) {
    const r = Recog.classify(amostra(s, fn));
    total++;
    if (r.gloss === s && r.conf >= 0.8) acertos++;
  }
});
console.log(`sinais ensinados: ${acertos}/${total} certos com confiança ≥ 80%`);
assert.ok(acertos / total >= 0.9, 'deveria acertar pelo menos 90% dos sinais ensinados');

// 2) um gesto que não foi ensinado não passa do limiar
const desconhecido = Recog.classify(amostra('X', (t) => mao(0.7, 0.2 + t * 0.4, 0.2)));
console.log(`gesto desconhecido: confiança ${(desconhecido.conf * 100).toFixed(0)}%`);
assert.ok(desconhecido.conf < 0.8, 'gesto desconhecido deveria ficar abaixo do limiar');

// 3) o mesmo sinal feito com a outra mão (canhoto) é reconhecido pelos exemplos espelhados
let canhoto = 0;
Object.entries(SINAIS).forEach(([s, fn]) => {
  const espelhado = Recog.mirror(amostra(s, fn));
  espelhado.quadros.forEach((q) => q.maos.forEach((m) => { m.lado = 'Left'; }));
  const r = Recog.classify(espelhado);
  if (r.gloss === s && r.conf >= 0.8) canhoto++;
});
console.log(`mão esquerda: ${canhoto}/${Object.keys(SINAIS).length} certos`);
assert.strictEqual(canhoto, Object.keys(SINAIS).length, 'deveria reconhecer todos os sinais feitos com a outra mão');

// 4) desempenho: uma classificação com a biblioteca toda
const t0 = Date.now();
for (let i = 0; i < 20; i++) Recog.classify(amostra('OI', SINAIS.OI));
const ms = (Date.now() - t0) / 20;
console.log(`tempo por classificação: ${ms.toFixed(1)} ms`);
assert.ok(ms < 100, 'classificar deveria levar menos de 100 ms (RNF-001)');

console.log('ok: reconhecimento');
