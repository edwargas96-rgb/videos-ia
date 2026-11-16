// O protagonista (você). Só aparece no espelho: a cabeça fica onde está a câmera.
// Mesmo estilo da Ana: cabeça grande, olhos redondos, contorno preto.
import * as THREE from "three";
import { peca, caixa, bola, cilindro, capsula } from "./estilo.js";

const PELE = 0x8a5a3c, CABELO = 0x1b1411, JAQUETA = 0x6f7d3c;

export function criarProtagonista() {
  const g = new THREE.Group();          // segue a cabeça (posição e giro da câmera)
  const cab = new THREE.Group();
  cab.position.set(0, 0.02, 0.075);     // o centro da cabeça fica atrás dos olhos
  cab.scale.setScalar(1.3);
  g.add(cab);
  // a frente do rosto é -Z
  const rosto = peca(bola(0.125, 40), PELE, { contorno: 0.005 });
  rosto.scale.set(1, 1.06, 0.97);
  cab.add(rosto);
  // cabelo curto, crespo: uma touca e bolinhas
  const touca = peca(bola(0.132, 32, ), CABELO, { contorno: 0.005 });
  touca.position.set(0, 0.035, 0.012); touca.scale.set(1.0, 0.82, 1.0);
  cab.add(touca);
  for (let i = 0; i < 9; i++) {
    const a = -1.1 + (i / 8) * 2.2;
    const b = peca(bola(0.03, 14), CABELO, { contorno: 0.003 });
    b.position.set(Math.sin(a) * 0.1, 0.09 + Math.cos(a) * 0.012, -0.055 - Math.cos(a) * 0.02);
    cab.add(b);
  }
  for (const s of [-1, 1]) {
    const orelha = peca(bola(0.022, 12), PELE, { contorno: 0.003 });
    orelha.position.set(s * 0.123, -0.01, 0.005);
    cab.add(orelha);
    const branco = peca(bola(0.032, 24), 0xffffff, { contorno: 0.003 });
    branco.position.set(s * 0.047, 0.005, -0.105); branco.scale.set(1, 1.15, 0.5);
    cab.add(branco);
    const pupila = new THREE.Mesh(bola(0.018, 20), new THREE.MeshBasicMaterial({ color: 0x0a0807 }));
    pupila.position.set(s * 0.047, 0.002, -0.119); pupila.scale.set(1, 1.1, 0.35);
    cab.add(pupila);
    const brilho = new THREE.Mesh(bola(0.005, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    brilho.position.set(s * 0.047 - 0.006, 0.011, -0.126);
    cab.add(brilho);
    const sob = peca(caixa(0.045, 0.011, 0.008, 0.004), CABELO, { contorno: 0 });
    sob.position.set(s * 0.048, 0.055, -0.108); sob.rotation.z = s * 0.08;
    cab.add(sob);
  }
  const nariz = peca(bola(0.014, 12), 0x75482e, { contorno: 0 });
  nariz.position.set(0, -0.02, -0.122);
  cab.add(nariz);
  const boca = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.004, 8, 20, Math.PI), new THREE.MeshBasicMaterial({ color: 0x2e120c }));
  boca.position.set(0, -0.052, -0.112); boca.rotation.z = Math.PI;
  cab.add(boca);
  const pesc = peca(cilindro(0.045, 0.05, 0.1), PELE, { contorno: 0.004 });
  pesc.position.set(0, -0.15, 0.075);
  g.add(pesc);
  const gola = peca(new THREE.TorusGeometry(0.065, 0.022, 10, 24), JAQUETA, { contorno: 0.004 });
  gola.position.set(0, -0.2, 0.075); gola.rotation.x = Math.PI / 2;
  g.add(gola);
  // braço esquerdo, solto do lado do corpo (o direito é a mão que pega a chave)
  const braco = new THREE.Group();
  const manga = peca(cilindro(0.05, 0.055, 0.55), JAQUETA, { contorno: 0.006 });
  manga.position.set(0, -0.27, 0);
  const mao = peca(bola(0.045, 16), PELE, { contorno: 0.004 });
  mao.position.set(0, -0.58, 0); mao.scale.set(0.9, 1.2, 0.8);
  braco.add(manga, mao);
  braco.position.set(-0.27, -0.25, 0.08); braco.rotation.z = -0.08;
  g.add(braco);
  g.userData.boca = boca;
  return g;
}
