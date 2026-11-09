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
  um: { u: 130, v: 560 },
  fone: { u: 75, v: 300 },
  mae: { u: 260, v: 262 },
  ligar: { u: 260, v: 760 },
  galeria: { u: 260, v: 560 },
  video1: { u: 92, v: 330 },
};
const QWERTY = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
export function teclaLetra(ch) {
  for (let r = 0; r < 3; r++) {
    const i = QWERTY[r].indexOf(ch);
    if (i >= 0) {
      const n = QWERTY[r].length, w = 49, x0 = SW / 2 - (n * w) / 2 + w / 2;
      return { u: x0 + i * w, v: 600 + r * 100 };
    }
  }
  return { u: SW / 2, v: 900 };
}
const HELP = "HELPME";

const APPS = [
  ["Telefone", "#2fbf5b", "📞"], ["Mensagens", "#3aa0ff", "💬"], ["Câmera", "#5b5f6b", "📷"], ["Galeria", "#f4a52a", "🖼️"],
  ["Relógio", "#20232b", "⏰"], ["Agenda", "#e8473b", "📅"], ["Mapas", "#4cb37a", "🗺️"], ["Música", "#e2457a", "🎵"],
  ["Notas", "#f2cf3a", "📝"], ["Ajustes", "#7d8391", "⚙️"], ["Clima", "#4a8de0", "⛅"], ["Contatos", "#9a7bd0", "👤"],
];
const posApp = (i) => ({ u: 75 + (i % 4) * 123.3, v: 300 + Math.floor(i / 4) * 150 });
// a ordem em que os apps somem no segundo glitch (a Galeria, índice 3, fica)
const ORDEM_SOME = [9, 0, 6, 11, 1, 8, 4, 10, 2, 7, 5];

// relógio: 07:12, e nos glitches ele dispara
function relogio(t) {
  let min = 7 * 60 + 12, dia = 12, mes = 7;
  const corre = (a, b) => {
    const u = clamp((t - a) / (b - a));
    return Math.floor((Math.exp(u * 7.5) - 1) * 40);
  };
  if (t >= E.g1[0] && t < E.uns) min += corre(E.g1[0], E.uns);
  else if (t >= E.uns && t < E.g2[0]) min += 1;
  else if (t >= E.g2[0] && t < E.g2[1]) min += 1 + corre(E.g2[0], E.g2[1]) * 0.6;
  else if (t >= E.g2[1]) min += 2;
  const total = Math.floor(min);
  dia = 12 + Math.floor(total / 1440);
  const h = Math.floor(total / 60) % 24, m = total % 60;
  const d = ((dia - 1) % 30) + 1, mm = mes + Math.floor((dia - 1) / 30);
  const p2 = (x) => String(x).padStart(2, "0");
  const SEM = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  return { hora: `${p2(h)}:${p2(m)}`, data: `${SEM[(dia + 1) % 7]}, ${d} de ${["", "", "", "", "", "", "", "julho", "agosto", "setembro", "outubro"][((mm - 1) % 12) + 1] || "julho"}`, curta: `${p2(d)}/${p2(((mm - 1) % 12) + 1)}` };
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
  const fBloq = fundo(9, 0.25), fSenha = fundo(26, 0.55), fInicio = fundo(22, 0.45);
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

  function inicio(t, somePor = null) {
    c.drawImage(fInicio, 0, 0);
    const r = relogio(t);
    barra(t, r.hora);
    APPS.forEach(([nome, cor, emo], i) => {
      let p = posApp(i), s = 1;
      if (somePor) {
        const k = ORDEM_SOME.indexOf(i);
        if (k >= 0) {
          const t0 = E.somem + k * 0.28;
          s = 1 - ramp(t, t0, t0 + 0.18);
          if (s <= 0.001) return;
        } else {            // a Galeria vai para o meio
          const u = ramp(t, E.g2[1] - 0.6, E.g2[1]);
          p = { u: lerp(p.u, TECLA.galeria.u, u), v: lerp(p.v, TECLA.galeria.v, u) };
          s = 1 + 0.35 * u;
        }
      }
      c.save(); c.translate(p.u, p.v); c.scale(s, s);
      ret(-42, -42, 84, 84, 22, cor);
      txt(emo, 0, 2, 42);
      txt(nome, 0, 64, 18, "#fff", 500);
      c.restore();
    });
    if (!somePor) {
      ret(26, 900, SW - 52, 120, 34, "rgba(255,255,255,0.18)");
      [["📞", "#2fbf5b"], ["💬", "#3aa0ff"], ["🌐", "#4a8de0"], ["📷", "#5b5f6b"]].forEach(([e, cor], i) => {
        ret(58 + i * 112, 918, 84, 84, 22, cor); txt(e, 100 + i * 112, 962, 40);
      });
    }
  }

  function contatos(t) {
    c.fillStyle = "#0f1116"; c.fillRect(0, 0, SW, SH);
    barra(t, relogio(t).hora);
    txt("Favoritos", 40, 130, 40, "#fff", 800, "left");
    const nomes = [["Mãe", "❤️"], ["Lari", ""], ["Pai", ""], ["Vó Cida", ""], ["Escola", ""]];
    nomes.forEach(([n, e], i) => {
      const y = 262 + i * 110;
      const toque = i === 0 && t >= E.contato && t < E.contato + 0.25;
      if (toque) { c.fillStyle = "rgba(255,255,255,0.12)"; c.fillRect(0, y - 52, SW, 104); }
      c.beginPath(); c.arc(80, y, 34, 0, 7); c.fillStyle = ["#e2457a", "#3aa0ff", "#4cb37a", "#f4a52a", "#7d8391"][i]; c.fill();
      txt(n[0], 80, y, 30, "#fff", 700);
      txt(`${n} ${e}`, 136, y, 30, "#fff", 500, "left");
      c.fillStyle = "rgba(255,255,255,0.12)"; c.fillRect(136, y + 52, SW - 136, 2);
    });
  }

  function perfilMae(t) {
    c.fillStyle = "#0f1116"; c.fillRect(0, 0, SW, SH);
    barra(t, relogio(t).hora);
    c.beginPath(); c.arc(SW / 2, 330, 110, 0, 7); c.fillStyle = "#e2457a"; c.fill();
    txt("M", SW / 2, 330, 110, "#fff", 700);
    txt("Mãe ❤️", SW / 2, 500, 44, "#fff", 700);
    txt("celular · 14 chamadas", SW / 2, 556, 22, "rgba(255,255,255,0.6)");
    const toque = t >= E.ligar && t < E.ligar + 0.2;
    c.beginPath(); c.arc(TECLA.ligar.u, TECLA.ligar.v, toque ? 66 : 60, 0, 7); c.fillStyle = "#2fbf5b"; c.fill();
    txt("📞", TECLA.ligar.u, TECLA.ligar.v + 2, 52);
    txt("Ligar", TECLA.ligar.u, TECLA.ligar.v + 98, 24, "#fff", 600);
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
    else if (t < E.appFone + 0.25) inicio(t);
    else if (t < E.contato + 0.3) contatos(t);
    else if (t < E.g2[0]) perfilMae(t);
    else if (t < E.somem) { if (t < E.g2[0] + 0.9) perfilMae(t); else inicio(t, true); }
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
