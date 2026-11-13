// A Ana: cabeça grande, olhos redondos, contorno preto (o estilo de desenho em 3D da série).
// Ela tem a própria cena e a própria câmera: é o que o celular "gravou". A imagem vai para a tela.
import * as THREE from "three";
import { peca, mat, caixa, bola, cilindro, capsula } from "./estilo.js";
import { FALAS, E } from "./roteiro.js";
import { clamp, lerp, ramp, easeIO } from "./kit.js";

const PELE = 0xb8774e, CABELO = 0x241713, MOLETOM = 0x8b6fb8;

export function criarAna() {
  const cena = new THREE.Scene();
  const corpo = new THREE.Group();
  cena.add(corpo);

  // cabeça
  const cabeca = new THREE.Group();
  cabeca.position.set(0, 0, 0);
  corpo.add(cabeca);
  const rosto = peca(bola(0.11, 40), PELE, { contorno: 0.004 });
  rosto.scale.set(1, 1.08, 0.95);
  cabeca.add(rosto);
  // cabelo: um volume atrás e cachos na frente
  const volume = peca(bola(0.135, 32), CABELO, { contorno: 0.004 });
  volume.position.set(0, 0.03, -0.045); volume.scale.set(1.12, 1.08, 0.95);
  cabeca.add(volume);
  for (let i = 0; i < 11; i++) {
    const a = -1.15 + (i / 10) * 2.3;
    const c = peca(bola(0.034 + 0.006 * ((i * 7) % 3), 16), CABELO, { contorno: 0.003 });
    c.position.set(Math.sin(a) * 0.105, 0.075 + Math.cos(a) * 0.035, 0.035 + Math.cos(a) * 0.035);
    cabeca.add(c);
  }
  for (const s of [-1, 1]) {
    for (let j = 0; j < 3; j++) {
      const c = peca(bola(0.038, 16), CABELO, { contorno: 0.003 });
      c.position.set(s * (0.118 + j * 0.008), -0.01 - j * 0.055, -0.02 - j * 0.01);
      cabeca.add(c);
    }
    const orelha = peca(bola(0.018, 12), PELE, { contorno: 0.003 });
    orelha.position.set(s * 0.108, -0.005, 0.0);
    cabeca.add(orelha);
  }
  // olhos
  const olhos = [], pupilas = [];
  for (const s of [-1, 1]) {
    const branco = peca(bola(0.03, 24), 0xffffff, { contorno: 0.003 });
    branco.position.set(s * 0.043, 0.012, 0.093); branco.scale.set(1, 1.18, 0.5);
    cabeca.add(branco); olhos.push(branco);
    const pupila = new THREE.Mesh(bola(0.0175, 20), new THREE.MeshBasicMaterial({ color: 0x0a0807 }));
    pupila.position.set(s * 0.043, 0.01, 0.106); pupila.scale.set(1, 1.1, 0.35);
    cabeca.add(pupila); pupilas.push(pupila);
    const brilho = new THREE.Mesh(bola(0.0048, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    brilho.position.set(s * 0.043 + 0.006, 0.019, 0.1125);
    cabeca.add(brilho);
  }
  // sobrancelhas (preocupadas: o lado de dentro sobe)
  const sobr = [];
  for (const s of [-1, 1]) {
    const b = peca(caixa(0.038, 0.008, 0.006, 0.003), CABELO, { contorno: 0 });
    b.position.set(s * 0.044, 0.058, 0.098);
    cabeca.add(b); sobr.push({ b, s });
  }
  const nariz = peca(bola(0.011, 12), 0xa0633e, { contorno: 0 });
  nariz.position.set(0, -0.012, 0.106);
  cabeca.add(nariz);
  // boca: aberta (falando/chorando) e sorriso (na foto)
  const boca = new THREE.Mesh(bola(0.018, 16), new THREE.MeshBasicMaterial({ color: 0x3a1210 }));
  boca.position.set(0, -0.048, 0.098);
  cabeca.add(boca);
  const sorriso = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.0045, 8, 20, Math.PI), new THREE.MeshBasicMaterial({ color: 0x3a1210 }));
  sorriso.position.set(0, -0.036, 0.1); sorriso.rotation.z = Math.PI;
  cabeca.add(sorriso);
  // lágrimas
  const lagrimas = [0, 1].map((i) => {
    const l = new THREE.Mesh(bola(0.0055, 10), new THREE.MeshBasicMaterial({ color: 0x9fe0ff }));
    l.scale.set(1, 1.4, 1);
    cabeca.add(l);
    return l;
  });
  // pescoço e moletom
  const pesc = peca(cilindro(0.038, 0.042, 0.08), PELE, { contorno: 0.003 });
  pesc.position.set(0, -0.135, -0.01);
  corpo.add(pesc);
  const tronco = peca(caixa(0.36, 0.34, 0.2, 0.07), MOLETOM, { contorno: 0.004 });
  tronco.position.set(0, -0.33, -0.03);
  corpo.add(tronco);
  const capuz = peca(new THREE.TorusGeometry(0.075, 0.03, 10, 24), 0x7a60a6, { contorno: 0.003 });
  capuz.position.set(0, -0.17, -0.04); capuz.rotation.x = Math.PI / 2.3;
  corpo.add(capuz);

  // o quarto escuro atrás dela
  const quarto = new THREE.Group();
  cena.add(quarto);
  const parede = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), mat(0x2b2541));
  parede.position.set(0, 0, -1.1);
  quarto.add(parede);
  const janela = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.55), new THREE.MeshBasicMaterial({ color: 0x3c5d95 }));
  janela.position.set(-0.42, 0.22, -1.09);
  quarto.add(janela);
  for (const [w, h, x, y] of [[0.46, 0.03, -0.42, 0.5], [0.46, 0.03, -0.42, -0.06], [0.03, 0.58, -0.64, 0.22], [0.03, 0.58, -0.2, 0.22], [0.03, 0.55, -0.42, 0.22]]) {
    const f = peca(caixa(w, h, 0.02, 0.005), 0x16131f, { contorno: 0 });
    f.position.set(x, y, -1.08);
    quarto.add(f);
  }
  const vao = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.1), new THREE.MeshBasicMaterial({ color: 0x0d0b13 }));
  vao.position.set(0.48, -0.08, -1.09);
  quarto.add(vao);
  const batente = peca(caixa(0.5, 1.16, 0.03, 0.006), 0x3a3150, { contorno: 0.004 });
  batente.position.set(0.48, -0.08, -1.1);
  quarto.add(batente);
  // "ele": uma silhueta na porta, quase invisível, com dois pontos de luz
  const vulto = new THREE.Group();
  const vCab = new THREE.Mesh(bola(0.07, 16), new THREE.MeshBasicMaterial({ color: 0x030205 }));
  vCab.position.set(0, 0.28, 0);
  const vCorpo = new THREE.Mesh(capsula(0.09, 0.42), new THREE.MeshBasicMaterial({ color: 0x030205 }));
  vCorpo.position.set(0, -0.08, 0);
  const vOlhos = [-1, 1].map((s) => {
    const o = new THREE.Mesh(bola(0.008, 8), new THREE.MeshBasicMaterial({ color: 0xf2f2ff }));
    o.position.set(s * 0.024, 0.29, 0.065);
    return o;
  });
  vulto.add(vCab, vCorpo, ...vOlhos);
  vulto.position.set(0.48, -0.06, -1.05);
  quarto.add(vulto);
  // o reflexo dele no olho da Ana (aparece quando a câmera entra no olho)
  const refl = (() => {
    const k = document.createElement("canvas"); k.width = 128; k.height = 128;
    const x = k.getContext("2d");
    x.fillStyle = "rgba(210,215,235,0.85)";
    x.beginPath(); x.arc(64, 40, 15, 0, 7); x.fill();
    x.beginPath(); x.moveTo(40, 120); x.quadraticCurveTo(44, 58, 64, 56); x.quadraticCurveTo(84, 58, 88, 120); x.fill();
    x.fillStyle = "#000"; x.fillRect(56, 37, 4, 4); x.fillRect(68, 37, 4, 4);
    const t = new THREE.CanvasTexture(k); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.02), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false }));
    m.position.set(0.043 - 0.002, 0.008, 0.1132);
    cabeca.add(m);
    return m;
  })();
  // a mão que puxa o celular
  const mao = new THREE.Group();
  const palma = peca(caixa(0.2, 0.24, 0.06, 0.03), 0x1d1b22, { contorno: 0.005 });
  mao.add(palma);
  for (let i = 0; i < 4; i++) {
    const d = peca(capsula(0.022, 0.17), 0x1d1b22, { contorno: 0.004 });
    d.position.set(-0.07 + i * 0.047, 0.2, 0.0); d.rotation.z = (i - 1.5) * 0.08;
    mao.add(d);
  }
  mao.rotation.z = Math.PI / 2.4;
  cena.add(mao);

  // luzes
  const amb = new THREE.AmbientLight(0x4a5590, 0.7);
  const tela = new THREE.PointLight(0xb8ccff, 1.3, 3, 1.2);
  tela.position.set(0.02, -0.06, 0.38);
  const lua = new THREE.DirectionalLight(0x6f8fd8, 1.2);
  lua.position.set(-1, 0.6, -0.6);
  const sol = new THREE.DirectionalLight(0xfff0d8, 2.4);
  sol.position.set(0.6, 0.8, 1);
  const quente = new THREE.HemisphereLight(0xfff4e6, 0x9a7a60, 1.4);
  cena.add(amb, tela, lua, sol, quente);

  const cam = new THREE.PerspectiveCamera(52, 520 / 1080, 0.005, 10);
  const h = (n) => { const s = Math.sin(n * 91.7 + 3.1) * 43758.5; return s - Math.floor(s); };
  const sn = (t, f, s) => Math.sin(t * f + s) * 0.6 + Math.sin(t * f * 2.13 + s * 1.7) * 0.4;

  function falandoEm(t) {
    for (const f of FALAS) if (f.q === "ANA" && t >= f.t0 && t <= f.t1) return f;
    return null;
  }

  // modo "foto": de dia, sorrindo (a foto da tela de bloqueio). modo "video": o vídeo da galeria.
  function quadro(t, modo) {
    const foto = modo === "foto";
    sorriso.visible = foto; boca.visible = !foto;
    sol.visible = quente.visible = foto;
    amb.visible = tela.visible = lua.visible = !foto;
    parede.material.color.set(foto ? 0xe7c49c : 0x2b2541);
    janela.material.color.set(foto ? 0xbfe4ff : 0x3c5d95);
    vao.visible = batente.visible = !foto;
    cena.background = new THREE.Color(foto ? 0xe7c49c : 0x15121f);
    for (const { b, s } of sobr) b.rotation.z = foto ? s * -0.12 : s * -0.42;
    lagrimas.forEach((l) => (l.visible = !foto));
    vulto.visible = false; mao.visible = false; refl.material.opacity = 0;

    if (foto) {
      corpo.position.set(0, -0.02, 0); corpo.rotation.set(0, 0.12, 0); cabeca.rotation.set(0.05, 0, 0.06);
      cam.position.set(0, -0.02, 0.5); cam.up.set(0, 1, 0); cam.lookAt(0, -0.06, 0); cam.fov = 52;
      cam.updateProjectionMatrix();
      return cam;
    }
    // a fala: a boca abre e fecha; chorando, os ombros tremem
    const f = falandoEm(t);
    const choro = E.choro.some(([a, b]) => t > a && t < b);
    let abre = 0.25;
    if (f) abre = 0.35 + 0.65 * Math.abs(Math.sin((t - f.t0) * 13.5) * Math.sin((t - f.t0) * 4.1 + 0.6));
    if (choro) abre = 0.55 + 0.3 * Math.abs(Math.sin(t * 7));
    if (t > E.puxa) abre = 1.1;
    boca.scale.set(1.25, 0.3 + abre * 0.9, 0.45);
    const tremor = choro ? 0.006 * Math.sin(t * 38) : 0;
    corpo.position.set(0, tremor - 0.01, 0);
    corpo.rotation.set(0, 0, 0);
    cabeca.rotation.set(0.04 + 0.03 * sn(t, 0.7, 1), 0.06 * sn(t, 0.5, 2), 0.04 * sn(t, 0.6, 3));
    // lágrimas descendo
    lagrimas.forEach((l, i) => {
      const s = i ? 1 : -1, ciclo = 1.9, u = ((t + i * 0.8) % ciclo) / ciclo;
      l.position.set(s * 0.05, -0.012 - u * 0.09, 0.098 - u * 0.012);
    });
    // a câmera do celular dela: na mão, tremendo
    let pos = new THREE.Vector3(0.015 * sn(t, 1.3, 4), -0.02 + 0.012 * sn(t, 1.1, 5), 0.44);
    let alvo = new THREE.Vector3(0, -0.035, 0);
    let rolar = 0.05 * sn(t, 0.9, 6);
    // entrando no olho dela
    const ent = ramp(t, E.olho[0], E.olho[0] + 1.2), sai = ramp(t, E.olho[1] - 0.9, E.olho[1]);
    const k = ent * (1 - sai);
    if (k > 0) {
      const olho = new THREE.Vector3(0.043, 0.012, 0.11);
      cabeca.updateMatrixWorld(); corpo.updateMatrixWorld();
      const ow = olho.clone().applyMatrix4(cabeca.matrixWorld);
      pos.lerp(ow.clone().add(new THREE.Vector3(0, 0, 0.075)), k);
      alvo.lerp(ow, k);
      rolar *= 1 - k;
      refl.material.opacity = 0.9 * ramp(t, E.olho[0] + 1.4, E.olho[0] + 2.4) * (1 - sai);
    }
    // ele aparece na porta, atrás dela
    if (t >= E.vulto[0] && t < E.puxa) {
      vulto.visible = true;
      vulto.position.z = -1.05;
      vOlhos.forEach((o) => (o.visible = t > E.vulto[0] + 2.2 && Math.floor(t * 3) % 7 !== 0));
      vulto.scale.setScalar(1 + 0.15 * ramp(t, E.vulto[0], E.puxa));
    }
    // puxam o celular: a mão entra, e a imagem gira e cai
    if (t >= E.puxa - 0.6) {
      mao.visible = true;
      const u = ramp(t, E.puxa - 0.6, E.puxa + 0.25);
      mao.position.set(lerp(0.75, 0.12, u), lerp(-0.25, -0.04, u), 0.3);
    }
    if (t >= E.puxa + 0.2) {
      const u = clamp((t - E.puxa - 0.2) / 1.6);
      rolar += u * u * 9;
      pos.add(new THREE.Vector3(0.4 * u, -0.5 * u * u, 0.25 * u));
      alvo.add(new THREE.Vector3(1.2 * u, 0.6 * Math.sin(u * 7), -0.3 * u));
    }
    cam.position.copy(pos);
    cam.up.set(Math.sin(rolar), Math.cos(rolar), 0);
    cam.lookAt(alvo);
    cam.fov = 52 - 14 * k;
    cam.updateProjectionMatrix();
    return cam;
  }
  return { cena, cam, quadro };
}
