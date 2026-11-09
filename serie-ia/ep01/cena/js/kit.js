// Ajudantes da cena. Tudo é uma função do tempo t: nada de Math.random nem relógio, porque o
// HyperFrames pede cada quadro fora de ordem e em paralelo. Um quadro tem que sair igual sempre.
import * as THREE from "three";

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, x) => a + (b - a) * x;
export const easeIO = (u) => (u = clamp(u), u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const easeOut = (u) => 1 - Math.pow(1 - clamp(u), 3);
// 0 antes de a, 1 depois de b, suave no meio
export const ramp = (t, a, b, ease = easeIO) => ease(clamp((t - a) / Math.max(1e-6, b - a)));

// Uma peça "pulando" para dentro: 0 -> 1,12 -> 1 em d segundos a partir de t0.
export function pop(t, t0, d = 0.3) {
  const u = (t - t0) / d;
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return u < 0.6 ? easeOut(u / 0.6) * 1.12 : lerp(1.12, 1, easeIO((u - 0.6) / 0.4));
}

// Uma peça "voando" até o lugar: sai de longe (de), faz um arco e assenta, em d segundos.
export function voar(t, t0, d = 0.45, de = [3, 2, 0]) {
  const u = clamp((t - t0) / d);
  if (u <= 0) return { visivel: false, pos: de, giro: 1 };
  const k = easeOut(u), arco = Math.sin(Math.PI * k) * 0.6;
  return { visivel: true, pos: [de[0] * (1 - k), de[1] * (1 - k) + arco, de[2] * (1 - k)], giro: 1 - k };
}

// Câmera em órbita: alvo, ângulo em volta (graus), altura (graus), distância, lente.
export function orbita(alvo, az, el, d, fov = 40) {
  const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
  return { p: [alvo[0] + d * Math.cos(e) * Math.sin(a), alvo[1] + d * Math.sin(e), alvo[2] + d * Math.cos(e) * Math.cos(a)], l: alvo, fov };
}
// Pontos-chave de câmera K(t, alvo, az, el, d) e a câmera em qualquer tempo, suave entre eles.
export const K = (t, alvo, az, el, d, fov = 40) => ({ t, alvo, az, el, d, fov });
export function camera(chaves, t) {
  if (t <= chaves[0].t) return orbita(chaves[0].alvo, chaves[0].az, chaves[0].el, chaves[0].d, chaves[0].fov);
  for (let i = 0; i < chaves.length - 1; i++) {
    const a = chaves[i], b = chaves[i + 1];
    if (t < b.t) {
      const e = easeIO((t - a.t) / Math.max(1e-6, b.t - a.t));
      return orbita([0, 1, 2].map((j) => lerp(a.alvo[j], b.alvo[j], e)), lerp(a.az, b.az, e), lerp(a.el, b.el, e), lerp(a.d, b.d, e), lerp(a.fov, b.fov, e));
    }
  }
  const z = chaves[chaves.length - 1];
  return orbita(z.alvo, z.az, z.el, z.d, z.fov);
}

export const material = (cor, o = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.55, ...o });
export function malha(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
