// A tela do celular da Ana, desenhada a cada quadro a partir do tempo t (nada aleatório de verdade:
// o "ruído" vem de um hash do tempo, então um quadro sai sempre igual).
import { E } from "./roteiro.js";
import { clamp, lerp, ramp, easeOut } from "./kit.js";

export const SW = 520, SH = 1080;   // a tela, em pixels (proporção do celular)

const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const FONTE = '"Helvetica Neue", Arial, sans-serif';

// Posição das teclas na tela (usada também pelo dedão)
export const TECLA = {
  num: (i) => ({ u: 130 + (i % 3) * 130, v: 560 + Math.floor(i / 3) * 120 }), // i: 0..11 (1..9, vazio, 0, apagar)
  zero: { u: 260, v: 920 },
  um: { u: 260, v: 680 },
  fone: { u: 66, v: 900 },
  galeria: { u: 324, v: 900 },
  video1: { u: 92, v: 330 },
};
export function teclaLetra() { return { u: SW / 2, v: 700 }; }

// os apps da tela inicial (como o celular de referência): nome e notificações
const APPS = [["Spark", 16], ["Jabbr", 71], ["Vloggr", 3], ["Surfer", 0], ["Phone", 9], ["Chats", 43], ["Gallery", 0], ["Mail", 2]];
const posApp = (i) => ({ u: 66 + (i % 4) * 129, v: 760 + Math.floor(i / 4) * 140 });
// a ordem em que os apps viram Gallery no segundo glitch
const ORDEM_VIRA = [3, 6, 0, 5, 2, 7, 4, 1];

// relógio: terça, 11 de agosto, 07:12. No glitch 1 voa até 15:15; no glitch 2 passa da meia-noite e vai a quarta, 12, 23:39
function relogio(t) {
  const u = (a, b) => Math.pow(clamp((t - a) / (b - a)), 1.8);
  let m = 7 * 60 + 12;
  if (t >= E.g2[0]) m = 915 + 1944 * u(E.g2[0], E.g2[1]);
  else if (t >= E.uns) m = 915;
  else if (t >= E.g1[0]) m = 432 + 483 * u(E.g1[0], E.uns);
  const total = Math.floor(m), dia = 11 + Math.floor(total / 1440), md = total % 1440;
  const p2 = (x) => String(x).padStart(2, "0");
  const SEM = { 11: "terça", 12: "quarta", 13: "quinta" };
  return { hora: `${p2(Math.floor(md / 60))}:${p2(md % 60)}`, data: `${SEM[dia] || "quarta"}, ${dia} de agosto` };
}

export function criarTela(foto) {
  const cv = document.createElement("canvas"); cv.width = SW; cv.height = SH;
  const ov = document.createElement("canvas"); ov.width = SW; ov.height = SH;
  const tmp = document.createElement("canvas"); tmp.width = SW; tmp.height = SH;
  const c = cv.getContext("2d"), o = ov.getContext("2d"), tc = tmp.getContext("2d");

  // fundos prontos: a foto borrada (tela de bloqueio) e a mesma, mais escura (tela inicial)
  const fundo = (blur, escuro) => {
    const k = document.createElement("canvas"); k.width = SW; k.height = SH;
    const x = k.getContext("2d");
    x.filter = `blur(${blur}px)`;
    x.drawImage(foto, -30, -30, SW + 60, SH + 60);
    x.filter = "none";
    x.fillStyle = `rgba(5,8,18,${escuro})`; x.fillRect(0, 0, SW, SH);
    return k;
  };
  const fBloq = fundo(9, 0.25), fSenha = fundo(26, 0.55), fInicio = fundo(0, 0.0);
  const thumbs = [0, 1, 2, 3, 4, 5].map((i) => {
    const k = document.createElement("canvas"); k.width = 150; k.height = 210;
    const x = k.getContext("2d");
    x.filter = `brightness(${0.35 + 0.08 * (i % 3)}) saturate(0.6) blur(${i ? 1.5 : 0}px)`;
    x.drawImage(foto, -60 - i * 12, -140 + i * 20, 300, 620);
    return k;
  });

  const txt = (s, x, y, tam, cor = "#fff", peso = 500, al = "center") => {
    c.font = `${peso} ${tam}px ${FONTE}`; c.fillStyle = cor; c.textAlign = al; c.textBaseline = "middle"; c.fillText(s, x, y);
  };
  const ret = (x, y, w, h, r, cor, ctx = c) => {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = cor; ctx.fill();
  };
  const barra = (t, hora) => {
    txt(hora, 40, 32, 22, "#fff", 600, "left");
    txt("▮▮▮  ◔  82%", SW - 40, 32, 19, "#fff", 500, "right");
  };

  function bloqueio(t) {
    c.drawImage(fBloq, 0, 0);
    const r = relogio(t);
    barra(t, r.hora);
    txt("Bem-vinda, Ana", SW / 2, 120, 30, "#fff", 600);
    txt(r.hora, SW / 2, 235, 112, "#fff", 300);
    txt(r.data, SW / 2, 318, 26, "rgba(255,255,255,0.9)", 500);
    ret(30, 560, SW - 60, 98, 26, "rgba(20,22,30,0.62)");
    txt("📞  Chamada perdida", 60, 592, 24, "#fff", 700, "left");
    txt("Mãe · 07:09", 60, 628, 21, "rgba(255,255,255,0.75)", 500, "left");
    ret(30, 674, SW - 60, 98, 26, "rgba(20,22,30,0.62)");
    txt("💬  1 nova mensagem", 60, 706, 24, "#fff", 700, "left");
    txt("Número desconhecido · agora", 60, 742, 21, "rgba(255,255,255,0.75)", 500, "left");
    txt("deslize para desbloquear", SW / 2, 1010, 21, "rgba(255,255,255,0.8)");
    ret(SW / 2 - 70, 1040, 140, 6, 3, "rgba(255,255,255,0.85)");
  }

  // a tela de senha. modo: "num" | "letras" | "uns"
  function senha(t, modo) {
    if (modo !== "num") { hack(t, modo); return; }
    c.drawImage(fSenha, 0, 0);
    const r = relogio(t);
    barra(t, r.hora);
    const glitch1 = t >= E.g1[0] && t < E.uns;
    if (glitch1) {           // o relógio grande disparando, a data girando
      txt(r.hora, SW / 2, 150, 92, "#fff", 300);
      txt(r.data, SW / 2, 214, 24, "rgba(255,255,255,0.9)", 600);
    } else {
      txt("🔒", SW / 2, 150, 46);
      txt("Digite a senha", SW / 2, 240, 30, "#fff", 600);
    }
    // os quatro espaços da senha
    let cheios = 0, digitos = null, verde = false;
    if (t < E.g1[0]) cheios = E.zeros.filter((z) => t >= z + 0.05).length;
    if (t >= E.codigo[0]) {
      digitos = ["1", "8", "0", "7"].slice(0, E.codigo.filter((z) => t >= z + 0.05).length);
      verde = t >= E.destrava;
    }
    for (let i = 0; i < 4; i++) {
      const x = SW / 2 - 105 + i * 70, y = 318;
      if (digitos) {
        if (digitos[i]) txt(digitos[i], x, y, 44, verde ? "#3ee07a" : "#fff", 700);
        else { c.beginPath(); c.arc(x, y, 11, 0, 7); c.strokeStyle = "#fff"; c.lineWidth = 2.5; c.stroke(); }
      } else {
        c.beginPath(); c.arc(x, y, 11, 0, 7);
        if (i < cheios) { c.fillStyle = "#fff"; c.fill(); } else { c.strokeStyle = "#fff"; c.lineWidth = 2.5; c.stroke(); }
      }
    }
    if (!glitch1 || modo !== "letras") txt("Dica: aniversário do Tobi", SW / 2, 410, 23, "rgba(255,255,255,0.85)", 500);
    if (modo === "letras") {
      // o teclado de letras; as teclas de HELP ME acendem uma por uma
      const n = E.help.filter((h) => t >= h).length;
      ret(40, 380, SW - 80, 70, 14, "rgba(0,0,0,0.45)");
      txt("HELP ME".replace(/\s/g, "").slice(0, n).replace(/^(HELP)(.*)$/, "$1 $2"), SW / 2, 415, 40, "#ff4a4a", 800);
      QWERTY.forEach((row, ri) => {
        [...row].forEach((ch) => {
          const p = teclaLetra(ch);
          const aceso = E.help.some((h, k) => HELP[k] === ch && t >= h && t < h + 0.6);
          ret(p.u - 22, p.v - 38, 44, 76, 9, aceso ? "#ff3b3b" : "rgba(255,255,255,0.18)");
          txt(ch, p.u, p.v, 30, "#fff", 600);
        });
      });
      ret(SW / 2 - 150, 862, 300, 72, 10, "rgba(255,255,255,0.18)");
      return;
    }
    for (let i = 0; i < 12; i++) {
      if (i === 9) continue;
      const p = TECLA.num(i);
      let rot = i === 11 ? "⌫" : i === 10 ? "0" : String(i + 1);
      if (modo === "uns" && i !== 11) rot = "1";
      if (modo === "uns" && i === 0) {     // a tecla que você aperta muda depois de cada toque
        const k = E.codigo.filter((z) => t >= z + 0.12).length;
        rot = ["1", "8", "0", "7", "7"][k];
      }
      const toque = (i === 10 && E.zeros.some((z) => t >= z && t < z + 0.18)) || (i === 0 && modo === "uns" && E.codigo.some((z) => t >= z && t < z + 0.18));
      if (i !== 11) {
        c.beginPath(); c.arc(p.u, p.v, 50, 0, 7);
        c.fillStyle = toque ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.16)"; c.fill();
      }
      txt(rot, p.u, p.v - (i === 11 ? 0 : 2), i === 11 ? 36 : 46, "#fff", 400);
    }
  }

  // ---- o visual hackeado: listras coloridas, grade branca, letras com as cores separadas ----
  function fundoHack(t, forca = 1) {
    const q = Math.floor(t * 12);
    const CORES = ["170,20,30", "30,40,170", "20,120,60", "120,30,150", "0,0,0", "0,0,0"];
    for (let y = 0; y < SH;) {
      const h = 2 + Math.floor(hash(q * 3.1 + y * 0.7) * 9);
      c.fillStyle = `rgba(${CORES[Math.floor(hash(y * 1.3 + q) * 6)]},${(0.3 + 0.55 * hash(y + q * 7.7)) * forca})`;
      c.fillRect(0, y, SW, h); y += h;
    }
  }
  function grade(t) {
    const q = Math.floor(t * 12);
    c.fillStyle = "rgba(255,255,255,0.85)";
    for (const x of [195, 325]) {
      for (let y = 500; y < 1000; y += 20) {
        const dx = hash(q + y * 0.3 + x) < 0.15 ? (hash(q + y) - 0.5) * 8 : 0;
        c.fillRect(x + dx, y, 2.5, 20);
        if (hash(q * 1.7 + y + x) < 0.12) { c.fillStyle = hash(y) < 0.5 ? "rgba(80,160,255,0.9)" : "rgba(255,160,40,0.9)"; c.fillRect(x - 6, y, 4, 14); c.fillStyle = "rgba(255,255,255,0.85)"; }
      }
    }
    for (const y of [620, 740, 860]) c.fillRect(20, y, SW - 40, 2.5);
  }
  function letraHack(ch, u, v, tam, q) {
    if (!ch) return;
    const dx = hash(q * 5.1 + u + v) < 0.2 ? (hash(q + u) - 0.5) * 14 : 0;
    c.font = `300 ${tam}px ${FONTE}`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillStyle = "rgba(255,40,40,0.85)"; c.fillText(ch, u + dx - 4, v);
    c.fillStyle = "rgba(40,120,255,0.85)"; c.fillText(ch, u + dx + 4, v);
    c.fillStyle = "#fff"; c.fillText(ch, u + dx, v);
  }
  // o teclado numérico hackeado: HELP ME piscando (modo "letras") ou todas as teclas iguais (modo "uns")
  const VARIANTES = [
    ["H", "E", "?", "L", "L", "", "M", "E", "P", "", "5", ""],
    ["H", "E", "", "L", "", "", "?", "", "P", "", "5", ""],
    ["H", "?", "", "", "", "", "M", "", "", "", "H", ""],
  ];
  function hack(t, modo) {
    c.fillStyle = "#040206"; c.fillRect(0, 0, SW, SH);
    fundoHack(t);
    grade(t);
    const q = Math.floor(t * 8);
    const r = relogio(t);
    if (modo === "letras") {
      // o relógio voando no alto
      letraHack(r.hora, SW / 2, 170, 86, q);
      c.font = `500 24px ${FONTE}`; c.fillStyle = "#fff"; c.textAlign = "center"; c.fillText(r.data, SW / 2, 240);
      const h = hash(q * 2.3);
      const V = h < 0.6 ? VARIANTES[0] : h < 0.82 ? VARIANTES[1] : VARIANTES[2];
      for (let i = 0; i < 12; i++) {
        let ch = V[i];
        if (ch && hash(q * 13.1 + i) < 0.1) ch = "?";
        const p = TECLA.num(i);
        letraHack(ch, p.u, p.v, 74, q);
      }
      return;
    }
    // modo "uns": a senha. Cada toque troca TODAS as teclas: 1 -> 8 -> 0 -> 7
    const k = E.codigo.filter((z) => t >= z + 0.12).length;
    const rot = ["1", "8", "0", "7", "7"][k];
    const troca = E.codigo.some((z) => t >= z + 0.08 && t < z + 0.3);
    txt("Dica: aniversário do Tobi", SW / 2, 410, 23, "rgba(255,255,255,0.85)", 500);
    const digitos = ["1", "8", "0", "7"].slice(0, E.codigo.filter((z) => t >= z + 0.05).length);
    const verde = t >= E.destrava;
    for (let i = 0; i < 4; i++) {
      const x = SW / 2 - 105 + i * 70, y = 318;
      if (digitos[i]) letraHack(digitos[i], x, y, 48, verde ? 0 : q);
      else { c.beginPath(); c.arc(x, y, 11, 0, 7); c.strokeStyle = "#fff"; c.lineWidth = 2.5; c.stroke(); }
    }
    if (verde) { c.fillStyle = "rgba(60,224,122,0.35)"; c.fillRect(SW / 2 - 140, 285, 280, 66); }
    for (let i = 0; i < 12; i++) {
      if (i === 9 || i === 11) continue;
      const p = TECLA.num(i);
      const apertou = E.codigo.some((z) => t >= z && t < z + 0.18) && p.u === TECLA.um.u && p.v === TECLA.um.v;
      if (apertou) { c.fillStyle = "rgba(255,255,255,0.35)"; c.fillRect(p.u - 64, p.v - 58, 128, 116); }
      letraHack(rot, p.u + (troca ? (hash(q + i) - 0.5) * 30 : 0), p.v, 74, troca ? q + i : q);
    }
  }

  // ---- a tela inicial (como o celular de referência) ----
  function icone(nome, u, v, s = 1) {
    c.save(); c.translate(u, v); c.scale(s, s);
    const L = 96, x0 = -L / 2, y0 = -L / 2;
    const caixa = (cor) => ret(x0, y0, L, L, 22, cor);
    if (nome === "Spark") {
      caixa("#e8456b");
      c.fillStyle = "#fff"; c.beginPath(); c.moveTo(0, 26);
      c.bezierCurveTo(-46, -6, -26, -40, 0, -16); c.bezierCurveTo(26, -40, 46, -6, 0, 26); c.fill();
    } else if (nome === "Jabbr") {
      caixa("#3fa9f5"); txt("❞", 0, 8, 72, "#fff", 900);
    } else if (nome === "Vloggr") {
      const g = c.createLinearGradient(x0, y0, -x0, -y0); g.addColorStop(0, "#5a1fe0"); g.addColorStop(1, "#b44cff");
      ret(x0, y0, L, L, 22, g); txt("V", 2, 4, 66, "#fff", 900);
    } else if (nome === "Surfer") {
      caixa("#16203e");
      c.lineWidth = 9; c.strokeStyle = "#2f8bf0"; c.beginPath(); c.arc(0, 0, 26, 0.4, 5.6); c.stroke();
      c.strokeStyle = "#5fd0ff"; c.beginPath(); c.arc(4, 4, 13, 3.6, 8.6); c.stroke();
    } else if (nome === "Phone") {
      caixa("#2fc44f"); txt("📞", 0, 4, 50);
    } else if (nome === "Chats") {
      caixa("#f28a2e");
      ret(-30, -26, 60, 44, 20, "#fff"); c.beginPath(); c.moveTo(-14, 14); c.lineTo(-24, 32); c.lineTo(4, 16); c.fill();
    } else if (nome === "Gallery") {
      caixa("#f7f7f9");
      const cores = ["#f44336", "#ff9800", "#ffeb3b", "#4caf50", "#00bcd4", "#2196f3", "#9c27b0", "#e91e63"];
      cores.forEach((cor, i) => {
        c.save(); c.rotate((i / 8) * Math.PI * 2); c.fillStyle = cor; c.globalAlpha = 0.85;
        c.beginPath(); c.ellipse(0, -16, 10, 17, 0, 0, 7); c.fill(); c.restore();
      });
    } else if (nome === "Mail") {
      caixa("#2a8ee8");
      ret(-30, -20, 60, 42, 6, "#fff"); c.strokeStyle = "#2a8ee8"; c.lineWidth = 4;
      c.beginPath(); c.moveTo(-28, -18); c.lineTo(0, 6); c.lineTo(28, -18); c.stroke();
    }
    c.restore();
  }
  function selo(n, u, v) {
    if (!n) return;
    c.beginPath(); c.arc(u + 44, v - 44, 18, 0, 7); c.fillStyle = "#d7e64a"; c.fill();
    txt(String(n), u + 44, v - 43, 19, "#1d1d1d", 800);
  }
  function inicio(t, viraGaleria = false) {
    c.drawImage(fInicio, 0, 0);
    if (viraGaleria) { c.globalAlpha = 0.9; fundoHack(t, 1); c.globalAlpha = 1; }
    // faixas escuras no alto e embaixo
    let g = c.createLinearGradient(0, 0, 0, 140); g.addColorStop(0, "rgba(0,0,0,0.55)"); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; c.fillRect(0, 0, SW, 140);
    g = c.createLinearGradient(0, 700, 0, SH); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.6)");
    c.fillStyle = g; c.fillRect(0, 700, SW, SH - 700);
    const r = relogio(t);
    txt(r.hora, 26, 44, 40, "#fff", 500, "left");
    txt(r.data, 26, 86, 21, "rgba(255,255,255,0.9)", 500, "left");
    txt("●●●○○  ◠", SW - 80, 40, 16, "#fff", 600, "right");
    ret(SW - 70, 31, 40, 18, 4, "#fff");
    ret(SW - 12, 26, 8, 28, 2, "#e6e255");
    APPS.forEach(([nome, n], i) => {
      const p = posApp(i);
      let vira = false;
      if (viraGaleria) vira = t >= E.somem + ORDEM_VIRA.indexOf(i) * 0.3;
      const nm = vira ? "Gallery" : nome;
      const tremor = viraGaleria && hash(Math.floor(t * 10) + i) < 0.25 ? (hash(t + i) - 0.5) * 10 : 0;
      icone(nm, p.u + tremor, p.v);
      if (!vira) selo(n, p.u, p.v);
      txt(nm, p.u + tremor, p.v + 66, 20, "#fff", 500);
    });
  }

  function galeria(t) {
    c.fillStyle = "#0b0c10"; c.fillRect(0, 0, SW, SH);
    barra(t, relogio(t).hora);
    txt("Vídeos", 34, 130, 42, "#fff", 800, "left");
    txt("6 vídeos · Ana", 34, 176, 22, "rgba(255,255,255,0.6)", 500, "left");
    const durs = ["0:41", "1:12", "0:09", "2:03", "0:33", "0:58"];
    thumbs.forEach((k, i) => {
      const x = 17 + (i % 3) * 164, y = 225 + Math.floor(i / 3) * 222;
      c.drawImage(k, x, y);
      txt(durs[i], x + 128, y + 192, 18, "#fff", 700, "right");
      txt("▶", x + 22, y + 192, 18, "#fff", 700, "left");
    });
    if (t >= E.play && t < E.play + 0.25) ret(17, 225, 150, 210, 0, "rgba(255,255,255,0.25)");
  }

  // ruído de glitch por cima da tela: faixas deslocadas, cores separadas, chuvisco
  function sujar(t, forca) {
    if (forca <= 0) return;
    tc.clearRect(0, 0, SW, SH); tc.drawImage(cv, 0, 0);
    const q = Math.floor(t * 24);
    const nf = 3 + Math.floor(forca * 14);
    for (let i = 0; i < nf; i++) {
      const y = hash(q * 7.1 + i) * SH, h = 8 + hash(q * 3.3 + i * 1.7) * 70 * forca;
      const dx = (hash(q * 1.9 + i * 5.3) - 0.5) * 160 * forca;
      c.drawImage(tmp, 0, y, SW, h, dx, y, SW, h);
    }
    c.globalCompositeOperation = "screen";
    c.globalAlpha = 0.35 * forca;
    c.drawImage(tmp, 10 * forca, 0);
    c.globalCompositeOperation = "source-over"; c.globalAlpha = 1;
    for (let i = 0; i < 6 * forca; i++) {
      const y = hash(q * 4.7 + i * 9.1) * SH;
      c.fillStyle = ["rgba(0,255,230,0.35)", "rgba(255,0,120,0.35)", "rgba(255,255,255,0.3)"][i % 3];
      c.fillRect(0, y, SW, 2 + hash(q + i) * 10);
    }
  }
  function chuvisco(ctx, t, forca) {
    const q = Math.floor(t * 30);
    ctx.fillStyle = "#000"; ctx.globalAlpha = 0.7 * forca; ctx.fillRect(0, 0, SW, SH); ctx.globalAlpha = 1;
    for (let y = 0; y < SH; y += 6) {
      for (let x = 0; x < SW; x += 8) {
        const v = hash(q * 13.7 + x * 0.37 + y * 1.13);
        if (v > 0.55) { ctx.fillStyle = `rgba(${200 + 55 * v | 0},${200 + 55 * v | 0},${200 + 55 * v | 0},${forca})`; ctx.fillRect(x, y, 8, 6); }
      }
    }
  }

  // forca do glitch na tela em cada momento
  function forcaGlitch(t) {
    let f = 0;
    if (t >= E.g1[0] && t < E.uns) {
      f = 0.35 + 0.25 * Math.sin(t * 9) ** 2;
      if (t >= E.letras - 0.25 && t < E.letras + 0.25) f = 1;
      if (t >= E.estouro[0]) f = 0.7 + 0.3 * ramp(t, E.estouro[0], E.estouro[1]);
      if (t >= E.help[0] && t < E.estouro[0]) f *= 0.45;
    }
    if (t >= E.g2[0] && t < E.g2[1]) f = t < E.somem ? 0.75 : 0.25 + 0.2 * Math.sin(t * 11) ** 2;
    return f;
  }

  // desenha a tela no tempo t; devolve { video: true } quando a tela deve mostrar o vídeo da Ana
  function desenhar(t) {
    o.clearRect(0, 0, SW, SH);
    let video = false, acesa = true;
    if (t < E.buzz1) bloqueio(t);
    else if (t < E.acorda) acesa = false;
    else if (t < E.desliza) bloqueio(t);
    else if (t < E.desliza + 0.35) {      // a tela de bloqueio sobe
      const u = ramp(t, E.desliza, E.desliza + 0.35);
      senha(t, "num");
      c.save(); c.globalAlpha = 1 - u; c.translate(0, -u * SH * 0.6);
      bloqueio(t); c.restore();
    }
    else if (t < E.letras) senha(t, "num");
    else if (t < E.uns) senha(t, "letras");
    else if (t < E.destrava + 0.9) senha(t, "uns");
    else if (t < E.inicio) { senha(t, "uns"); c.fillStyle = `rgba(0,0,0,${ramp(t, E.destrava + 0.9, E.inicio)})`; c.fillRect(0, 0, SW, SH); }
    else if (t < E.g2[0]) inicio(t);
    else if (t < E.galeria + 0.25) inicio(t, true);
    else if (t < E.play + 0.3) galeria(t);
    else if (t < E.estatica[0]) { video = true; }
    else if (t < E.volta) { video = true; }
    else inicio(t, true);

    if (!video && acesa) sujar(t, forcaGlitch(t));
    if (t >= E.estouro[0] && t < E.uns) chuvisco(c, t, 0.4 + 0.6 * ramp(t, E.estouro[0], E.uns));
    if (t >= E.g2[0] && t < E.g2[0] + 0.9) chuvisco(c, t, 0.5);
    if (t >= E.volta && t < E.volta + 0.5) chuvisco(c, t, 1 - ramp(t, E.volta, E.volta + 0.5));

    // por cima do vídeo: a barra do player, e depois a estática
    if (video) {
      const vt = t - E.video[0], dur = 41;
      o.fillStyle = "rgba(0,0,0,0.35)"; o.fillRect(0, SH - 90, SW, 90);
      o.fillStyle = "rgba(255,255,255,0.35)"; o.fillRect(30, SH - 50, SW - 60, 5);
      o.fillStyle = "#fff"; o.fillRect(30, SH - 50, (SW - 60) * clamp(vt / dur), 5);
      o.beginPath(); o.arc(30 + (SW - 60) * clamp(vt / dur), SH - 48, 10, 0, 7); o.fill();
      o.font = `600 18px ${FONTE}`; o.textAlign = "left"; o.fillText(`0:${String(Math.floor(vt)).padStart(2, "0")}`, 30, SH - 74);
      o.textAlign = "right"; o.fillText("0:41", SW - 30, SH - 74);
      o.textAlign = "left"; o.font = `700 20px ${FONTE}`; o.fillText("REC ●", 30, 70);
      if (t >= E.estatica[0]) chuvisco(o, t, t < E.puxa + 2.4 ? 0.6 : 1);
    }
    return { video, acesa };
  }
  return { cv, ov, desenhar };
}
