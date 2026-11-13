// O estilo "desenho em 3D": cor chapada em 3 tons e contorno preto por fora de cada peça.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

let gradiente = null;
function grad() {
  if (gradiente) return gradiente;
  const d = new Uint8Array([90, 170, 255]);
  gradiente = new THREE.DataTexture(d, 3, 1, THREE.RedFormat);
  gradiente.minFilter = gradiente.magFilter = THREE.NearestFilter;
  gradiente.needsUpdate = true;
  return gradiente;
}
const contornos = new Map();
function contorno(esp) {
  const k = esp.toFixed(4);
  if (contornos.has(k)) return contornos.get(k);
  const m = new THREE.MeshBasicMaterial({ color: 0x14110f, side: THREE.BackSide });
  m.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>\n transformed += normalize(normal) * ${k};`);
  };
  m.customProgramCacheKey = () => "contorno" + k;
  contornos.set(k, m);
  return m;
}

export const mat = (cor, o = {}) => new THREE.MeshToonMaterial({ color: cor, gradientMap: grad(), ...o });

// uma peça com contorno: devolve um grupo (a peça + a casca preta)
export function peca(geo, cor, o = {}) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, o.material || mat(cor, o.extra || {}));
  g.add(m);
  if (o.contorno !== 0) g.add(new THREE.Mesh(geo, contorno(o.contorno ?? 0.012)));
  g.userData.malha = m;
  return g;
}
export const caixa = (w, h, d, r = 0.02, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2.01, h / 2.01, d / 2.01));
export const bola = (r, s = 24) => new THREE.SphereGeometry(r, s, Math.round(s * 0.75));
export const cilindro = (r1, r2, h, s = 20) => new THREE.CylinderGeometry(r1, r2, h, s);
export const capsula = (r, h) => new THREE.CapsuleGeometry(r, h, 6, 12);

// posiciona um objeto (de eixo Y) entre dois pontos
export function entre(obj, a, b) {
  const d = new THREE.Vector3().subVectors(b, a);
  obj.position.copy(a).add(b).multiplyScalar(0.5);
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  return d.length();
}

// textura feita num canvas
export function texturaCanvas(w, h, desenho, repetir = null) {
  const k = document.createElement("canvas"); k.width = w; k.height = h;
  desenho(k.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(k);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repetir) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repetir); }
  return t;
}
