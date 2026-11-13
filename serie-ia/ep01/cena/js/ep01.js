// Ep01, O celular da Ana: a cena em primeira pessoa.
// Tudo é função do tempo t. A câmera é a sua cabeça; o corpo, as mãos e o celular seguem a câmera.
import * as THREE from "three";
import { clamp, lerp, ramp, easeIO, easeOut } from "./kit.js";
import { peca, mat, caixa, bola, cilindro, capsula, entre, texturaCanvas } from "./estilo.js";
import { criarTela, SW, SH, TECLA, teclaLetra } from "./tela.js";
import { criarAna } from "./ana.js";
import { criarProtagonista } from "./protagonista.js";
import { FALAS, E, DURACAO } from "./roteiro.js";

const W = 1080, H = 1920, RW = 1080, RH = 1920;  // a cena é desenhada no tamanho final
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const sn = (t, f, s) => Math.sin(t * f + s) * 0.6 + Math.sin(t * f * 2.31 + s * 1.3) * 0.4;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const PELE = 0xa86b45, JAQUETA = 0x6f7d3c, JEANS = 0x2f3d5c;

export function criarCena(canvas, raiz) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  r.setPixelRatio(1);
  r.setSize(W, H, false);
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.outputColorSpace = THREE.SRGBColorSpace;

  // ---------------- o cenário ----------------
  const cena = new THREE.Scene();
  cena.background = new THREE.Color(0x111111);
  cena.add(new THREE.HemisphereLight(0xfff3e0, 0x6a5848, 0.6));
  const sol = new THREE.DirectionalLight(0xffe2b8, 0.55);
  // luz do lustre (quarto) e da lâmpada do corredor, com sombra
  const luzSombra = (cor, int, pos, alvo) => {
    const l = new THREE.SpotLight(cor, int, 8, 1.15, 0.7, 1.4);
    l.position.set(...pos); l.target.position.set(...alvo);
    l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.0006; l.shadow.normalBias = 0.02;
    l.shadow.camera.near = 0.2; l.shadow.camera.far = 8;
    cena.add(l, l.target);
    return l;
  };
  luzSombra(0xffeccc, 16, [0, 2.42, -0.9], [0, 0, -0.9]);
  luzSombra(0xeef4ff, 13, [0.3, 2.5, -4.1], [0.3, 0, -4.1]);
  sol.position.set(3, 4, 2);
  cena.add(sol);

  const ruido = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const reboco = (base, var_) => texturaCanvas(256, 256, (x, w, h) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const a = ruido(i * 3.1), b = ruido(i * 7.7), c = ruido(i * 1.3);
      x.fillStyle = c > 0.5 ? `rgba(255,255,255,${0.05 * var_})` : `rgba(0,0,0,${0.06 * var_})`;
      x.fillRect(a * w, b * h, 1 + c * 3, 1 + c * 3);
    }
  }, [3, 2]);
  const parede = mat(0xffffff, { map: reboco("#e8dcc4", 1) }), faixa = mat(0xffffff, { map: reboco("#5f8a72", 1.4) }), madeira = 0x7a4b2b;
  const veio = texturaCanvas(256, 512, (x, w, h) => {
    x.fillStyle = "#7a4b2b"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      const xx = ruido(i * 5.3) * w, ww = 1 + ruido(i * 2.1) * 3;
      x.fillStyle = ruido(i) > 0.5 ? "rgba(40,20,8,0.25)" : "rgba(160,110,70,0.18)";
      x.beginPath(); x.moveTo(xx, 0);
      for (let y = 0; y <= h; y += 32) x.lineTo(xx + Math.sin(y * 0.02 + i) * 6, y);
      x.lineTo(xx + ww, h); x.lineTo(xx + ww, 0); x.fill();
    }
  });
  const chaoQuarto = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.2), mat(0xffffff, {
    map: texturaCanvas(512, 512, (x, w, h) => {
      x.fillStyle = "#a8774e"; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? "#9d6d46" : "#b07f55"; x.fillRect(0, i * 64, w, 62); x.fillStyle = "#6e4a2f"; x.fillRect(0, i * 64 + 62, w, 2); x.fillRect(((i * 197) % 400) + 40, i * 64, 2, 64); }
    }, [2, 2]),
  }));
  chaoQuarto.rotation.x = -Math.PI / 2; chaoQuarto.position.set(0, 0, -0.9);
  cena.add(chaoQuarto);
  const teto = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.2), mat(0xf3eee4));
  teto.rotation.x = Math.PI / 2; teto.position.set(0, 2.6, -0.9);
  cena.add(teto);
  // paredes do quarto (a da frente tem o vão da porta)
  const paredeCaixa = (w, h, x, y, z, ry = 0) => {
    const g = new THREE.Group();
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), parede);
    p.position.y = h / 2; g.add(p);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.9), faixa);
    f.position.set(0, 0.45, 0.006); g.add(f);
    const rod = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.05), mat(0x3f5f4e));
    rod.position.set(0, 0.92, 0.009); g.add(rod);
    g.position.set(x, y, z); g.rotation.y = ry;
    cena.add(g);
    return g;
  };
  paredeCaixa(4.4, 2.6, 0, 0, 1.2, Math.PI);           // atrás
  paredeCaixa(4.2, 2.6, -2.2, 0, -0.9, Math.PI / 2);   // esquerda
  paredeCaixa(4.2, 2.6, 2.2, 0, -0.9, -Math.PI / 2);   // direita (cômoda e espelho)
  paredeCaixa(1.75, 2.6, -1.325, 0, -3.0);             // frente, à esquerda da porta
  paredeCaixa(1.75, 2.6, 1.325, 0, -3.0);              // frente, à direita da porta
  const sobrePorta = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.55), parede);
  sobrePorta.position.set(0, 2.325, -3.0); cena.add(sobrePorta);
  // batente
  for (const [w, h, x, y] of [[0.08, 2.1, -0.49, 1.05], [0.08, 2.1, 0.49, 1.05], [1.06, 0.08, 0, 2.09]]) {
    const b = peca(caixa(w, h, 0.16, 0.01), 0xf5f1ea, { contorno: 0.008 });
    b.position.set(x, y, -3.0); cena.add(b);
  }
  // a porta (dobradiça à esquerda, abre para dentro)
  const porta = new THREE.Group();
  porta.position.set(-0.45, 0, -3.0);
  const folha = peca(caixa(0.9, 2.04, 0.05, 0.01), 0xffffff, { contorno: 0.008, extra: { map: veio } });
  folha.position.set(0.45, 1.02, 0);
  porta.add(folha);
  for (const y of [0.55, 1.45]) {
    const alm = peca(caixa(0.62, 0.62, 0.012, 0.01), 0x6b3f22, { contorno: 0.004 });
    alm.position.set(0.45, y, 0.03); porta.add(alm);
  }
  const macaneta = peca(bola(0.035, 16), 0xd8b24a, { contorno: 0.005 });
  macaneta.position.set(0.8, 1.0, 0.06);
  porta.add(macaneta);
  cena.add(porta);
  // a cômoda com o espelho (à direita), a cama (à esquerda), a janela (atrás)
  const comoda = peca(caixa(0.5, 0.85, 1.1, 0.03), 0x8a5a36, { contorno: 0.01 });
  comoda.position.set(1.93, 0.425, -0.2); cena.add(comoda);
  for (let i = 0; i < 3; i++) {
    const g = peca(caixa(0.02, 0.2, 0.95, 0.01), 0x9c6a42, { contorno: 0.004 });
    g.position.set(1.67, 0.17 + i * 0.25, -0.2); cena.add(g);
  }
  const espelhoMold = peca(caixa(0.04, 1.18, 0.86, 0.02), 0xd8b24a, { contorno: 0.008 });
  espelhoMold.position.set(2.17, 1.48, -0.2); cena.add(espelhoMold);
  // o espelho: uma câmera refletida (atrás do vidro) filma o quarto pela "janela" do espelho
  const EX = 2.145, EY = 1.48, EZ = -0.2, EW = 0.76, EH = 1.08;
  const rtEsp = new THREE.WebGLRenderTarget(512, 728);
  rtEsp.texture.colorSpace = THREE.SRGBColorSpace;
  rtEsp.texture.wrapS = THREE.RepeatWrapping; rtEsp.texture.repeat.x = -1; rtEsp.texture.offset.x = 1;
  const espelho = new THREE.Mesh(new THREE.PlaneGeometry(EW, EH), new THREE.MeshBasicMaterial({ map: rtEsp.texture, color: 0xdfe8ee, toneMapped: false }));
  espelho.position.set(EX, EY, EZ); espelho.rotation.y = -Math.PI / 2; cena.add(espelho);
  const camEsp = new THREE.PerspectiveCamera();
  const voce = criarProtagonista(); voce.visible = false; cena.add(voce);
  function renderEspelho(cam) {
    const P = cam.position, d = 2 * EX - P.x - EX;          // distância do olho refletido até o vidro
    camEsp.position.set(2 * EX - P.x, P.y, P.z);
    camEsp.up.set(0, 1, 0); camEsp.lookAt(camEsp.position.x - 1, P.y, P.z);
    const n = Math.max(0.02, d - 0.004), k = n / d;
    // cantos do vidro no espaço da câmera refletida (direita = -Z do mundo)
    const xl0 = -((EZ + EW / 2) - P.z), xl1 = -((EZ - EW / 2) - P.z);
    const yb = EY - EH / 2 - P.y, yt = EY + EH / 2 - P.y;
        // projeção fora do eixo (pela "janela" do espelho), montada com setViewOffset
    const L = xl0 * k, Rr = xl1 * k, T = yt * k, B = yb * k;
    const mx = Math.max(Math.abs(L), Math.abs(Rr)), my = Math.max(Math.abs(T), Math.abs(B));
    camEsp.near = n; camEsp.far = 40;
    camEsp.aspect = mx / my;
    camEsp.fov = THREE.MathUtils.radToDeg(2 * Math.atan(my / n));
    camEsp.setViewOffset(2 * mx, 2 * my, mx + L, my - T, Rr - L, T - B);
    camEsp.updateMatrixWorld();
    espelho.visible = false; espelhoMold.visible = false; voce.visible = true;
    r.setRenderTarget(rtEsp); r.render(cena, camEsp); r.setRenderTarget(null);
    espelho.visible = true; espelhoMold.visible = true; voce.visible = false;
  }
  const chave = peca(caixa(0.06, 0.012, 0.025, 0.004), 0xc9c9c9, { contorno: 0.003 });
  chave.position.set(1.76, 0.86, -0.12); cena.add(chave);
  const cama = peca(caixa(1.3, 0.45, 2.0, 0.08), 0x4f6fa8, { contorno: 0.01 });
  cama.position.set(-1.5, 0.225, -0.6); cena.add(cama);
  const trav = peca(caixa(0.6, 0.15, 0.4, 0.06), 0xf1ece3, { contorno: 0.008 });
  trav.position.set(-1.5, 0.52, 0.15); cena.add(trav);
  const janela = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.0), new THREE.MeshBasicMaterial({ color: 0xbfe6ff }));
  janela.position.set(-1.0, 1.6, -2.995); cena.add(janela);
  for (const [w, h, x, y] of [[1.18, 0.06, -1.0, 2.1], [1.18, 0.06, -1.0, 1.1], [0.06, 1.06, -1.56, 1.6], [0.06, 1.06, -0.44, 1.6], [0.04, 1.0, -1.0, 1.6]]) {
    const b = peca(caixa(w, h, 0.05, 0.01), 0xffffff, { contorno: 0.006 });
    b.position.set(x, y, -2.98); cena.add(b);
  }
  const cartaz = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), new THREE.MeshBasicMaterial({
    map: texturaCanvas(256, 360, (x, w, h) => {
      x.fillStyle = "#e2457a"; x.fillRect(0, 0, w, h); x.fillStyle = "#ffd21f"; x.beginPath(); x.arc(w / 2, 150, 70, 0, 7); x.fill();
      x.fillStyle = "#1b1b1b"; x.font = "900 40px Arial"; x.textAlign = "center"; x.fillText("ROCK", w / 2, 300);
    }),
  }));
  cartaz.position.set(-2.19, 1.6, -1.0); cartaz.rotation.y = Math.PI / 2; cena.add(cartaz);
  const lustre = peca(cilindro(0.18, 0.12, 0.1), 0xf7f1e0, { contorno: 0.006 });
  lustre.position.set(0, 2.52, -0.9); cena.add(lustre);

  // o corredor do prédio, lá fora
  const corredor = new THREE.Group();
  const chaoCorr = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.2), mat(0xffffff, {
    map: texturaCanvas(256, 256, (x, w, h) => {
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? "#b9b2a4" : "#d4cdbd"; x.fillRect(i * 64, j * 64, 64, 64); }
    }, [10, 2.2]),
  }));
  chaoCorr.rotation.x = -Math.PI / 2; chaoCorr.position.set(0, 0, -4.1);
  corredor.add(chaoCorr);
  const paredeCorr = mat(0xffffff, { map: reboco("#c9d3c4", 1) }), faixaCorr = mat(0xffffff, { map: reboco("#3f5a6b", 1.4) });
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.6), paredeCorr);
  pf.position.set(0, 1.3, -5.2); corredor.add(pf);
  const ff = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.0), faixaCorr);
  ff.position.set(0, 0.5, -5.185); corredor.add(ff);
  const pfora = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.6), paredeCorr);
  pfora.position.set(0, 1.3, -3.05); pfora.rotation.y = Math.PI; corredor.add(pfora);
  const tetoC = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.2), mat(0xe9e6df));
  tetoC.rotation.x = Math.PI / 2; tetoC.position.set(0, 2.6, -4.1); corredor.add(tetoC);
  for (const x of [-1.6, 1.6]) {
    const lamp = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.15), new THREE.MeshBasicMaterial({ color: 0xfffbe8 }));
    lamp.rotation.x = Math.PI / 2; lamp.position.set(x, 2.59, -4.1); corredor.add(lamp);
  }
  // a porta do vizinho, em frente
  const portaViz = peca(caixa(0.9, 2.04, 0.05, 0.01), 0xb08a70, { contorno: 0.008, extra: { map: veio } });
  portaViz.position.set(0.2, 1.02, -5.17); corredor.add(portaViz);
  const numero = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.12), new THREE.MeshBasicMaterial({
    map: texturaCanvas(128, 64, (x, w, h) => { x.fillStyle = "#d8b24a"; x.fillRect(0, 0, w, h); x.fillStyle = "#2a1a10"; x.font = "900 44px Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("304", w / 2, h / 2 + 2); }),
  }));
  numero.position.set(0.2, 1.75, -5.14); corredor.add(numero);
  const capacho = peca(caixa(0.75, 0.025, 0.48, 0.01), 0x7a2f2a, { contorno: 0.006 });
  capacho.position.set(0.08, 0.012, -3.5); corredor.add(capacho);
  cena.add(corredor);

  cena.traverse((o) => { if (o.isMesh && o.material && o.material.side !== THREE.BackSide && !o.material.isMeshBasicMaterial) { o.receiveShadow = true; } });

  // ---------------- o seu corpo: tronco, pernas, mãos ----------------
  const corpo = new THREE.Group();
  const tronco = peca(caixa(0.44, 0.62, 0.26, 0.08), JAQUETA, { contorno: 0.01 });
  tronco.position.set(0, 1.1, 0.06);
  corpo.add(tronco);
  const ziper = new THREE.Mesh(new THREE.PlaneGeometry(0.014, 0.6), new THREE.MeshBasicMaterial({ color: 0x2b2b2b }));
  ziper.position.set(0, 1.1, -0.072); ziper.rotation.y = Math.PI; corpo.add(ziper);
  const camiseta = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.6), new THREE.MeshBasicMaterial({ color: 0xe9e9e9 }));
  camiseta.position.set(0, 1.1, -0.071); camiseta.rotation.y = Math.PI; corpo.add(camiseta);
  const puxador = peca(caixa(0.022, 0.04, 0.012, 0.004), 0xcfcfcf, { contorno: 0.003 });
  corpo.add(puxador);
  for (const s of [-1, 1]) {
    const perna = peca(caixa(0.17, 0.82, 0.18, 0.05), JEANS, { contorno: 0.01 });
    perna.position.set(s * 0.11, 0.41, 0.04); corpo.add(perna);
    const tenis = peca(caixa(0.13, 0.08, 0.28, 0.03), 0xf2f2f2, { contorno: 0.008 });
    tenis.position.set(s * 0.11, 0.04, -0.04); corpo.add(tenis);
    const sola = peca(caixa(0.135, 0.025, 0.285, 0.01), 0xd8463b, { contorno: 0 });
    sola.position.set(s * 0.11, 0.012, -0.04); corpo.add(sola);
  }
  cena.add(corpo);

  // uma mão aberta (para o zíper e a maçaneta). Os dedos apontam para -Z.
  function maoAberta() {
    const g = new THREE.Group();
    const manga = peca(cilindro(0.055, 0.06, 0.5), JAQUETA, { contorno: 0.008 });
    manga.rotation.x = Math.PI / 2; manga.position.set(0, 0, 0.31); g.add(manga);
    const punho = peca(cilindro(0.056, 0.056, 0.04), 0x56612d, { contorno: 0.006 });
    punho.rotation.x = Math.PI / 2; punho.position.set(0, 0, 0.07); g.add(punho);
    const palma = peca(caixa(0.085, 0.03, 0.09, 0.014), PELE, { contorno: 0.006 });
    g.add(palma);
    for (let i = 0; i < 4; i++) {
      const d = peca(capsula(0.0105, 0.05), PELE, { contorno: 0.004 });
      d.rotation.x = Math.PI / 2; d.position.set(-0.03 + i * 0.02, 0, -0.075);
      g.add(d);
    }
    const ded = peca(capsula(0.012, 0.04), PELE, { contorno: 0.004 });
    ded.rotation.set(Math.PI / 2, 0, 0.9); ded.position.set(-0.055, 0, -0.02);
    g.add(ded);
    cena.add(g);
    return g;
  }
  const maoE = maoAberta(), maoD = maoAberta();

  // ---------------- o celular ----------------
  const fotoCanvas = document.createElement("canvas"); fotoCanvas.width = SW; fotoCanvas.height = SH;
  const ana = criarAna();
  const rtAna = new THREE.WebGLRenderTarget(SW, SH, { samples: 4 });
  rtAna.texture.colorSpace = THREE.SRGBColorSpace;
  {   // a foto da Ana para a tela de bloqueio: renderiza uma vez e lê os pixels
    const rtF = new THREE.WebGLRenderTarget(SW, SH);
    rtF.texture.colorSpace = THREE.SRGBColorSpace;
    const camF = ana.quadro(0, "foto");
    r.setRenderTarget(rtF); r.render(ana.cena, camF); r.setRenderTarget(null);
    const px = new Uint8Array(SW * SH * 4);
    r.readRenderTargetPixels(rtF, 0, 0, SW, SH, px);
    const img = new ImageData(SW, SH);
    for (let y = 0; y < SH; y++) img.data.set(px.subarray((SH - 1 - y) * SW * 4, (SH - y) * SW * 4), y * SW * 4);
    fotoCanvas.getContext("2d").putImageData(img, 0, 0);
    rtF.dispose();
  }
  const tela = criarTela(fotoCanvas);
  const texTela = new THREE.CanvasTexture(tela.cv); texTela.colorSpace = THREE.SRGBColorSpace;
  const texOv = new THREE.CanvasTexture(tela.ov); texOv.colorSpace = THREE.SRGBColorSpace;

  const PW = 0.075, PH = 0.156, PD = 0.009, TW = 0.069, TH = 0.1435;
  const celular = new THREE.Group();
  const corpoCel = peca(caixa(PW, PH, PD, 0.009, 4), 0x1a1a1e, { contorno: 0.0018 });
  celular.add(corpoCel);
  const matTela = new THREE.MeshBasicMaterial({ map: texTela, toneMapped: false });
  const telaM = new THREE.Mesh(new THREE.PlaneGeometry(TW, TH), matTela);
  telaM.position.z = PD / 2 + 0.0004; celular.add(telaM);
  const ovM = new THREE.Mesh(new THREE.PlaneGeometry(TW, TH), new THREE.MeshBasicMaterial({ map: texOv, transparent: true, toneMapped: false, depthWrite: false }));
  ovM.position.z = PD / 2 + 0.0007; celular.add(ovM);
  const brilhoTela = new THREE.PointLight(0xbfd8ff, 0, 1.2, 1.5);
  brilhoTela.position.set(0, 0, 0.08); celular.add(brilhoTela);
  cena.add(celular);
  const telaPx = (u, v, z = PD / 2 + 0.003) => V((u / SW - 0.5) * TW, (0.5 - v / SH) * TH, z);

  // a mão que segura o celular (filha do celular): palma atrás, dedos na borda esquerda, dedão à direita
  const maoCel = new THREE.Group();
  {
    const palma = peca(caixa(0.062, 0.074, 0.026, 0.012), PELE, { contorno: 0.0028 });
    palma.position.set(0.006, -0.052, -0.019); maoCel.add(palma);
    // quatro dedos dobrados na borda esquerda: a parte de trás e a ponta que aparece na frente
    for (let i = 0; i < 4; i++) {
      const y = -0.01 - i * 0.017;
      const base = peca(capsula(0.0062, 0.011), PELE, { contorno: 0.002 });
      base.position.set(-PW / 2 - 0.0035, y, -0.004); base.rotation.x = Math.PI / 2;
      const ponta = peca(capsula(0.0056, 0.005), PELE, { contorno: 0.002 });
      ponta.position.set(-PW / 2 + 0.0015, y - 0.001, PD / 2 + 0.0035); ponta.rotation.z = Math.PI / 2;
      const unha = new THREE.Mesh(new THREE.CircleGeometry(0.0035, 12), new THREE.MeshBasicMaterial({ color: 0xd9a07e }));
      unha.position.set(-PW / 2 + 0.006, y - 0.001, PD / 2 + 0.009);
      maoCel.add(base, ponta, unha);
    }
    const pulso = peca(cilindro(0.022, 0.025, 0.06), PELE, { contorno: 0.0028 });
    pulso.position.set(0.02, -0.1, -0.03); pulso.rotation.set(0.35, 0, 0.42); maoCel.add(pulso);
    const punho = peca(cilindro(0.033, 0.033, 0.03), 0x56612d, { contorno: 0.003 });
    punho.position.set(0.036, -0.135, -0.042); punho.rotation.set(0.35, 0, 0.42); maoCel.add(punho);
    const manga = peca(cilindro(0.035, 0.045, 0.34), JAQUETA, { contorno: 0.0035 });
    manga.position.set(0.1, -0.29, -0.1); manga.rotation.set(0.35, 0, 0.42); maoCel.add(manga);
    const costura = peca(cilindro(0.0355, 0.0355, 0.006), 0x4d5826, { contorno: 0 });
    costura.position.set(0.05, -0.17, -0.055); costura.rotation.set(0.35, 0, 0.42); maoCel.add(costura);
  }
  const dedao = peca(capsula(0.0078, 1), PELE, { contorno: 0.0022 });
  maoCel.add(dedao);
  celular.add(maoCel);

  // ---------------- a câmera (a sua cabeça) ----------------
  const cam = new THREE.PerspectiveCamera(80, RW / RH, 0.02, 60);
  // pontos-chave da cabeça: [t, x, y, z, giro(graus), inclinação(graus)]
  const CH = [
    [0.0, 1.2, 1.62, -0.25, -90, -16], [1.7, 1.2, 1.62, -0.25, -88, -13],
    [E.vira[0], 1.2, 1.62, -0.25, -88, -12], [E.vira[1], 1.05, 1.62, -0.3, -8, -6],
    [E.anda[1], 0.32, 1.62, -2.05, -2, -4], [E.porta[1], 0.3, 1.62, -2.0, 0, -8],
    [E.olhaChao[1], 0.3, 1.62, -2.0, 0, -46], [E.abaixa[0], 0.3, 1.62, -2.05, 0, -46],
    [E.abaixa[1], 0.16, 0.98, -2.85, 0, -68], [E.pega + 0.05, 0.16, 0.95, -2.88, 0, -70],
    [E.levanta[1], 0.16, 1.6, -2.9, 0, -14], [DURACAO, 0.16, 1.6, -2.9, -6, -12],
  ];
  function cabeca(t) {
    let i = 0;
    while (i < CH.length - 2 && t >= CH[i + 1][0]) i++;
    const a = CH[i], b = CH[i + 1];
    const u = easeIO(clamp((t - a[0]) / Math.max(1e-6, b[0] - a[0])));
    const k = [1, 2, 3, 4, 5].map((j) => lerp(a[j], b[j], u));
    // balanço dos passos
    const andando = t >= E.anda[0] && t < E.anda[1];
    if (andando) { const f = (t - E.anda[0]) * 2 * Math.PI * 2; k[1] += 0.03 * Math.abs(Math.sin(f)); k[0] += 0.02 * Math.sin(f / 2); }
    // respiração
    k[1] += 0.004 * Math.sin(t * 1.6);
    k[3] += 0.6 * sn(t, 0.4, 1); k[4] += 0.5 * sn(t, 0.35, 2);
    return k;
  }

  // ---------------- a passagem final (olho de peixe, glitch, chuvisco) ----------------
  const rt = new THREE.WebGLRenderTarget(RW, RH, { samples: 4, type: THREE.HalfFloatType });
  const pos = new THREE.ShaderMaterial({
    uniforms: { tCena: { value: rt.texture }, uT: { value: 0 }, uG: { value: 0 }, uPeixe: { value: 0.32 }, uFade: { value: 0 }, uEsc: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `
      uniform sampler2D tCena; uniform float uT, uG, uPeixe, uFade, uEsc; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec2 c = vUv - 0.5; c.x *= 0.5625;
        float r2 = dot(c, c);
        vec2 d = c * (1.0 + uPeixe * r2) / (1.0 + uPeixe * 0.33);
        d.x /= 0.5625;
        vec2 uv = 0.5 + d;
        float q = floor(uT * 24.0);
        float fx = floor(uv.y * 48.0);
        if (h(vec2(fx, q)) < uG * 0.45) uv.x += (h(vec2(q, fx)) - 0.5) * 0.12 * uG;
        float sep = 0.006 * uG;
        vec3 col = vec3(texture2D(tCena, uv + vec2(sep, 0.0)).r, texture2D(tCena, uv).g, texture2D(tCena, uv - vec2(sep, 0.0)).b);
        col += (h(vUv * 1000.0 + q) - 0.5) * (0.008 + 0.12 * uG);
        col *= 1.0 - 0.45 * smoothstep(0.12, 0.42, length(c * vec2(1.0, 0.8)));
        col = mix(col, vec3(0.0), uEsc);
        col = mix(col, vec3(0.0), uFade);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
    depthTest: false, depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), pos);
  const cenaPos = new THREE.Scene(); cenaPos.add(quad);
  const camPos = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // ---------------- os textos por cima ----------------
  const css = document.createElement("style");
  css.textContent = `
    .camada{position:absolute;inset:0;pointer-events:none;font-family:"Arial Black",Arial,sans-serif}
    .parte{position:absolute;top:270px;left:50%;transform:translateX(-50%);background:#c8231f;color:#fff;font-weight:900;font-size:44px;padding:10px 30px;border-radius:12px;letter-spacing:2px;border:4px solid #14110f}
    .leg{position:absolute;left:70px;right:170px;top:1290px;text-align:center;font-weight:900;font-size:54px;line-height:1.15;-webkit-text-stroke:11px #14110f;paint-order:stroke fill}
    .VOCE{color:#fff}.NARRADOR{color:#fff}.ANA{color:#ffd21f}
    .enq{position:absolute;left:70px;right:170px;top:420px;text-align:center}
    .enq h1{color:#fff;font-weight:900;font-size:84px;line-height:1.02;-webkit-text-stroke:14px #14110f;paint-order:stroke fill;margin-bottom:40px}
    .bt{display:flex;align-items:center;gap:22px;color:#fff;font-weight:900;font-size:52px;text-align:left;padding:30px 36px;border-radius:24px;border:6px solid #14110f;margin:0 0 28px;line-height:1.05}
    .bt.v{background:#c8231f}.bt.a{background:#2c5d7c}
    .com{color:#ffd21f;font-weight:900;font-size:50px;-webkit-text-stroke:10px #14110f;paint-order:stroke fill;margin-top:8px}`;
  document.head.appendChild(css);
  const camada = document.createElement("div"); camada.className = "camada"; raiz.appendChild(camada);
  const parte = document.createElement("div"); parte.className = "parte"; parte.textContent = "PARTE 01"; camada.appendChild(parte);
  const leg = document.createElement("div"); leg.className = "leg"; camada.appendChild(leg);
  const enq = document.createElement("div"); enq.className = "enq";
  enq.innerHTML = `<h1>O QUE VOCÊ<br>FARIA?</h1><div class="bt v">🏃 AJUDAR<br>A ANA</div><div class="bt a">📵 LARGAR<br>O CELULAR</div><div class="com">Comenta aqui 👇</div>`;
  camada.appendChild(enq);

  // ---------------- o dedão: onde ele toca em cada momento ----------------
  const TOQUES = [
    ...E.zeros.map((t) => [t, TECLA.zero]),
    ...E.codigo.map((t) => [t, TECLA.um]),
    [E.appFone, TECLA.fone],
    [E.galeria, TECLA.galeria], [E.play, TECLA.video1],
  ];
  const REPOUSO = { u: 470, v: 1000 };
  function dedaoEm(t) {
    // desliza para cima em E.desliza
    if (t >= E.desliza - 0.4 && t < E.desliza + 0.4) {
      const u = ramp(t, E.desliza - 0.25, E.desliza + 0.2);
      const chega = ramp(t, E.desliza - 0.4, E.desliza - 0.25) * (1 - ramp(t, E.desliza + 0.2, E.desliza + 0.4));
      return { p: { u: 260, v: lerp(1010, 640, u) }, k: chega, aperta: chega };
    }
    let melhor = null;
    for (const [tt, alvo] of TOQUES) {
      if (t >= tt - 0.35 && t < tt + 0.3) {
        const ida = ramp(t, tt - 0.35, tt - 0.05), volta = ramp(t, tt + 0.1, tt + 0.3);
        const k = ida * (1 - volta);
        const aperta = clamp(1 - Math.abs(t - tt) / 0.08);
        if (!melhor || k > melhor.k) melhor = { p: alvo, k, aperta };
      }
    }
    return melhor || { p: REPOUSO, k: 0, aperta: 0 };
  }

  // ---------------- cada quadro ----------------
  const mCel = new THREE.Matrix4(), q = new THREE.Quaternion(), qc = new THREE.Quaternion();
  const CEL_MAO = { pos: V(0.0, -0.022, -0.2), rot: new THREE.Euler(0.1, 0, 0) };
  function quadro(t) {
    // a cabeça
    const [x, y, z, giro, incl] = cabeca(t);
    cam.position.set(x, y, z);
    const g = THREE.MathUtils.degToRad(giro), ic = THREE.MathUtils.degToRad(incl);
    let rolar = 0;
    // tremor nos glitches
    const gl = glitch(t);
    rolar += gl * 0.012 * Math.sin(t * 47);
    cam.rotation.set(ic + gl * 0.01 * Math.sin(t * 61), g + gl * 0.01 * Math.sin(t * 53), rolar, "YXZ");
    cam.fov = 80;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();

    // o corpo acompanha a cabeça (sem a inclinação); some quando você se abaixa
    corpo.position.set(x + Math.sin(g) * 0.0, 0, z);
    corpo.position.y = y - 1.62;
    corpo.rotation.y = g;
    corpo.visible = !(t > E.abaixa[0] + 0.3 && t < E.levanta[1] - 0.2);
    // o zíper sobe
    const zu = 1;
    puxador.position.set(0, lerp(0.84, 1.38, zu), -0.08); puxador.visible = false;
    camiseta.visible = zu < 0.98;
    camiseta.scale.set(1, Math.max(0.01, 1 - zu), 1); camiseta.position.y = 1.4 - (0.6 * (1 - zu)) / 2;

    // você no espelho: cabeça na câmera, girando com ela
    voce.position.set(x, y, z);
    voce.rotation.set(0, g, 0, "YXZ");
    voce.children[0].rotation.x = ic * 0.5;
    voce.userData.boca.scale.set(t >= E.buzz0 + 0.3 ? 0.6 : 1, 1, 1);

    // a porta abre
    porta.rotation.y = -THREE.MathUtils.degToRad(78) * ramp(t, E.porta[0] + 0.15, E.porta[1], easeOut);

    // mãos livres (em coordenadas da câmera ou do mundo)
    const noMundoDaCam = (v) => v.clone().applyMatrix4(cam.matrixWorld);
    const maoNaCam = (m, v, rx = 0, ry = 0, rz = 0) => {
      m.position.copy(noMundoDaCam(v));
      m.quaternion.copy(cam.quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)));
    };
    const pegandoChave = t < 1.9;
    maoE.visible = false;
    maoD.visible = t < E.pega + 0.05;
    if (pegandoChave) {
      // a mão vai até a chave em cima da cômoda, pega e traz
      const ida = ramp(t, 0.25, 0.95), volta = ramp(t, 1.15, 1.8);
      const pChave = V(1.76, 0.9, -0.12);
      const perto = noMundoDaCam(V(0.16, -0.36, -0.32));
      const p = perto.clone().lerp(pChave.clone().add(V(-0.04, 0.03, 0.0)), ida).lerp(noMundoDaCam(V(0.24, -0.55, -0.25)), volta);
      maoD.position.copy(p);
      maoD.quaternion.copy(cam.quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.25, 0.15, -0.2)));
      maoD.visible = ida > 0.02 && volta < 0.97;
      chave.visible = !(t > 0.95 && volta > 0.97);
      if (t > 0.95) chave.position.copy(p).add(V(0, -0.02, 0));
      else chave.position.set(1.76, 0.86, -0.12);
    } else if (t < E.vira[1] + 0.2) {
      maoD.visible = false;
    } else if (t < E.abaixa[0]) {
      // a mão direita vai até a maçaneta e abre
      const ida = ramp(t, E.anda[1] - 0.6, E.porta[0]);
      const desc = V(0.18, -0.35, -0.25);
      porta.updateMatrixWorld();
      const mac = V(0.8, 1.0, 0.1).applyMatrix4(porta.matrixWorld);
      const pc = noMundoDaCam(desc);
      const p = pc.clone().lerp(mac.clone().add(V(0.02, 0, 0.09)), ida);
      const solta = ramp(t, E.porta[1] - 0.1, E.porta[1] + 0.4);
      p.lerp(noMundoDaCam(V(0.25, -0.5, -0.2)), solta);
      maoD.position.copy(p);
      maoD.quaternion.copy(cam.quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0, -1.3)));
      maoD.visible = ida > 0.02 && solta < 0.98;
    } else {
      // abaixa e pega o celular no capacho
      const ida = ramp(t, E.abaixa[0] + 0.4, E.pega);
      const pChao = V(0.12, 0.05, -3.48);
      const p = noMundoDaCam(V(0.15, -0.42, -0.3)).lerp(pChao.clone().add(V(0.03, 0.04, 0.05)), ida);
      maoD.position.copy(p);
      maoD.quaternion.copy(cam.quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.8, 0.1, -0.2)));
      maoD.visible = ida > 0.02 && t < E.pega;
    }

    // o celular: no capacho, vibrando; depois sobe para a mão
    const vibra = t >= E.buzz0 && t < E.buzz1 && (Math.floor((t - E.buzz0) / 0.5) % 2 === 0);
    const noChao = V(0.12 + (vibra ? 0.003 * Math.sin(t * 190) : 0), 0.025, -3.48 + (vibra ? 0.002 * Math.sin(t * 170) : 0));
    const qChao = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0.35));
    // na mão: posição na câmera (com aproximação no vídeo da Ana e balanço)
    const perto = ramp(t, E.video[0] + 1.5, E.olho[0] + 0.6) * (1 - ramp(t, E.olho[1], E.olho[1] + 1.2)) * 0.035
      + ramp(t, E.vulto[0], E.puxa) * 0.025 - ramp(t, E.volta, E.volta + 1) * 0.025;
    const lp = CEL_MAO.pos.clone().add(V(0.002 * sn(t, 0.9, 3), 0.002 * sn(t, 0.8, 4), perto));
    const naMao = noMundoDaCam(lp);
    qc.copy(cam.quaternion).multiply(new THREE.Quaternion().setFromEuler(CEL_MAO.rot));
    const sobe = ramp(t, E.pega, E.levanta[1] - 0.25, easeOut);
    celular.position.copy(noChao).lerp(naMao, sobe);
    celular.quaternion.copy(qChao).slerp(qc, sobe);
    maoCel.visible = t >= E.pega;

    // o dedão
    const d = dedaoEm(t);
    const base = V(PW / 2 + 0.008, -0.06, 0.0);
    const ponta = d.k > 0 ? V(PW / 2 + 0.02, -0.03, 0.012).lerp(telaPx(d.p.u, d.p.v, PD / 2 + 0.006 - 0.0035 * d.aperta), d.k) : V(PW / 2 + 0.02, -0.03, 0.012);
    const comp = entre(dedao, base, ponta);
    dedao.scale.set(1, Math.max(0.01, comp / 1.016), 1);

    // a tela
    const st = tela.desenhar(t);
    texTela.needsUpdate = true; texOv.needsUpdate = true;
    if (st.video && t < E.estatica[0] + 0.4) {
      const camA = ana.quadro(t, "video");
      r.setRenderTarget(rtAna); r.render(ana.cena, camA); r.setRenderTarget(null);
      matTela.map = rtAna.texture;
    } else matTela.map = texTela;
    telaM.visible = st.acesa || st.video;
    brilhoTela.intensity = telaM.visible ? (t > E.pega ? 0.25 : 0.5) : 0;

    // luz do corredor mais fria
    sol.intensity = 1.0;

    // desenha (o espelho só enquanto está à vista)
    if (t < E.vira[1] + 0.3) renderEspelho(cam);
    r.setRenderTarget(rt); r.render(cena, cam); r.setRenderTarget(null);
    pos.uniforms.uT.value = t;
    pos.uniforms.uG.value = gl;
    pos.uniforms.uEsc.value = 0.55 * ramp(t, E.enquete - 0.3, E.enquete + 0.4);
    pos.uniforms.uFade.value = Math.max(1 - ramp(t, 0, 0.25), ramp(t, DURACAO - 0.4, DURACAO));
    r.render(cenaPos, camPos);

    // textos
    parte.style.display = t < 3.6 ? "" : "none";
    parte.style.transform = `translateX(-50%) scale(${t < 0.15 ? 0.5 + t * 3 : 1})`;
    const f = FALAS.find((f) => t >= f.t0 && t < f.t1 + 0.35);
    if (f) { leg.textContent = f.txt; leg.className = "leg " + f.q; leg.style.display = ""; }
    else leg.style.display = "none";
    const en = ramp(t, E.enquete, E.enquete + 0.35, easeOut);
    enq.style.display = t >= E.enquete ? "" : "none";
    enq.style.transform = `scale(${0.6 + 0.4 * en})`;
    enq.style.opacity = en;
  }

  // força do glitch na imagem toda
  function glitch(t) {
    let g = 0;
    if (t >= E.g1[0] && t < E.uns) g = 0.25 + 0.2 * Math.abs(Math.sin(t * 7));
    if (t >= E.letras - 0.3 && t < E.letras + 0.3) g = 0.9;
    if (t >= E.help[0] && t < E.estouro[0]) g = 0.15;
    if (t >= E.estouro[0] && t < E.uns) g = 0.5 + 0.5 * ramp(t, E.estouro[0], E.uns);
    if (t >= E.g2[0] && t < E.g2[0] + 1.2) g = 0.7;
    if (t >= E.g2[0] + 1.2 && t < E.g2[1]) g = 0.15;
    if (t >= E.puxa && t < E.volta) g = 0.25 + 0.5 * ramp(t, E.estatica[0], E.volta);
    return g;
  }
  return { quadro };
}
