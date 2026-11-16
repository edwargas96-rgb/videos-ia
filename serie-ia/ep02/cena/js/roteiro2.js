// O relógio do Ep02 (tempos planejados; quando a voz chegar, só estes números mudam).
export const DURACAO = 90;

export const FALAS = [
  { q: "NARRADOR", t0: 0.4, t1: 2.4, txt: "Vocês escolheram ajudar a Ana." },
  { q: "NARRADOR", t0: 3.0, t1: 6.0, txt: "O celular travou... reiniciou... e voltou ao normal." },
  { q: "NARRADOR", t0: 6.8, t1: 9.6, txt: "E as mensagens não paravam. Todas do Greg." },
  { q: "NARRADOR", t0: 10.6, t1: 12.2, txt: "O vídeo foi gravado ontem." },
  { q: "NARRADOR", t0: 12.8, t1: 16.6, txt: "Será que levaram a Ana... e o celular caiu na sua porta?" },
  { q: "NARRADOR", t0: 18.6, t1: 23.0, txt: "No diário dela, só o último vídeo abria. O resto, corrompido." },
  { q: "NARRADOR", t0: 24.6, t1: 27.6, txt: "Na galeria, um cachorro em quase todas as fotos." },
  { q: "NARRADOR", t0: 28.4, t1: 30.6, txt: "O Tobi... era o cachorro dela." },
  { q: "NARRADOR", t0: 31.6, t1: 35.0, txt: "E um cara. Abraçado com ela. O namorado." },
  { q: "NARRADOR", t0: 36.6, t1: 40.8, txt: "Mas... se ela tinha namorado, por que tava no Spark?" },
  { q: "NARRADOR", t0: 43.0, t1: 45.0, txt: "O Greg era o namorado." },
  { q: "NARRADOR", t0: 46.0, t1: 50.6, txt: "Ela tinha mexido nas coisas dele... e ele queria explicar." },
  { q: "NARRADOR", t0: 52.4, t1: 54.8, txt: "Ele tava traindo ela." },
  { q: "NARRADOR", t0: 58.8, t1: 61.4, txt: "Com a mãe, ela falava todo dia." },
  { q: "NARRADOR", t0: 62.4, t1: 66.4, txt: "Até ontem. Ontem... ela parou de responder." },
  { q: "NARRADOR", t0: 69.4, t1: 72.0, txt: "E foi aí... que o celular tocou." },
  { q: "NARRADOR", t0: 73.4, t1: 75.0, txt: "Era o Greg." },
  { q: "NARRADOR", t0: 80.8, t1: 86.0, txt: "Você atenderia o Greg... ou recusaria? Deixa nos comentários." },
];

export const E = {
  // --- novos do Ep02 ---
  faixa: [0, 3.4],                 // "VOCÊS ESCOLHERAM: AJUDAR A ANA"
  reset: [3.4, 7.0],               // trava, "Reiniciando...", volta
  notifs: [7.4, 8.1, 8.8, 9.5],    // notificações do Greg chegando
  notas: [10.4, 17.4],             // o bloco de notas com as pistas
  tapVlog: 17.8, vlog: [18.0, 23.6], tapRuim: 20.4,
  tapGal: 24.0, gal: [24.2, 36.0], rolar: [30.4, 31.4],
  tapSpark: 36.2, spark: [36.4, 42.0],
  tapChats: 42.4, greg: [42.6, 57.4], msgs: [43.2, 44.8, 46.6, 48.6, 50.4, 52.2],
  tapMae: 58.0, mae: [58.2, 68.6], msgsMae: [61.6, 63.2, 64.8],
  liga: 69.0,
  enquete: 80.0,
  // --- do Ep01, desligados (o celular já está na mão desde o começo) ---
  buzz0: -99, buzz1: -98, vira: [-5, -4], anda: [-9, -8], porta: [-7, -6], olhaChao: [-7, -6],
  abaixa: [-6, -5.5], pega: -5, levanta: [-4.9, -4.5], acorda: -99, desliza: -99,
  zeros: [], g1: [-99, -98], letras: -99, help: [], estouro: [-99, -98], uns: -98, codigo: [],
  destrava: -98, inicio: -98, appFone: -99, g2: [-99, -98], somem: -99, galeria: -99, play: -99,
  video: [-99, -98], olho: [-99, -98], choro: [], vulto: [999, 999], puxa: 999, estatica: [999, 999], volta: 999,
};
