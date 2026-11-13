// O relógio do Ep01: cada fala e cada acontecimento, em segundos.
// Sem voz ainda: os tempos das falas são os planejados. Quando a voz existir, só estes números mudam.

export const DURACAO = 96;

// q: quem fala (VOCE em branco, ANA em amarelo)
// tempos reais das vozes (escritos a partir de voz/falas.json, do montar_voz.py)
export const FALAS = [
  { q: "NARRADOR", t0: 0.3, t1: 3.25, txt: "Você acordou e estava se arrumando pra ir pro trabalho." },
  { q: "NARRADOR", t0: 3.3, t1: 7.85, txt: "Mas, quando abriu a porta, tinha um celular no chão, vibrando." },
  { q: "NARRADOR", t0: 8.0, t1: 9.83, txt: "Você pegou e ligou a tela." },
  { q: "NARRADOR", t0: 9.9, t1: 14.45, txt: "Uma chamada perdida, uma mensagem e a foto de uma menina: Ana." },
  { q: "NARRADOR", t0: 14.5, t1: 17.8, txt: "Pra desbloquear, a dica era: aniversário do Tobi." },
  { q: "NARRADOR", t0: 17.8, t1: 21.06, txt: "Você tentou zero, zero, zero, zero." },
  { q: "NARRADOR", t0: 21.3, t1: 22.74, txt: "E o celular travou." },
  { q: "NARRADOR", t0: 22.8, t1: 24.46, txt: "As horas começaram a voar." },
  { q: "NARRADOR", t0: 25.0, t1: 28.3, txt: "Alguém do outro lado escreveu HELP ME no teclado." },
  { q: "NARRADOR", t0: 31.3, t1: 33.54, txt: "Todas as teclas viraram o número um." },
  { q: "NARRADOR", t0: 33.6, t1: 35.48, txt: "Você apertou... virou oito." },
  { q: "NARRADOR", t0: 35.6, t1: 37.36, txt: "Apertou de novo... zero." },
  { q: "NARRADOR", t0: 37.4, t1: 38.72, txt: "Depois... sete." },
  { q: "NARRADOR", t0: 38.9, t1: 41.36, txt: "E o celular abriu. Dezoito do sete." },
  { q: "NARRADOR", t0: 42.0, t1: 43.94, txt: "Os aplicativos cheios de notificação." },
  { q: "NARRADOR", t0: 44.0, t1: 46.48, txt: "Você pensou em ligar pra alguém que conhecesse ela." },
  { q: "NARRADOR", t0: 47.0, t1: 48.76, txt: "Mas o celular travou de novo." },
  { q: "NARRADOR", t0: 48.8, t1: 50.54, txt: "A data pulou pro dia seguinte." },
  { q: "NARRADOR", t0: 50.6, t1: 54.6, txt: "E os aplicativos foram virando galeria, até sobrar só a galeria." },
  { q: "NARRADOR", t0: 55.6, t1: 57.32, txt: "Dentro, só vídeos dela." },
  { q: "ANA", t0: 60.2, t1: 64.68, txt: "Se você olhar nos meus olhos, você vai ver ele me olhando de volta." },
  { q: "ANA", t0: 67.0, t1: 69.54, txt: "Eu não quero que ele pegue mais ninguém." },
  { q: "ANA", t0: 70.3, t1: 72.2, txt: "Eu só queria ser feliz." },
  { q: "ANA", t0: 75.0, t1: 78.7, txt: "Se você está vendo esse vídeo... não venha me encontrar." },
  { q: "ANA", t0: 80.6, t1: 83.83, txt: "Não... não, não, não!" },
  { q: "NARRADOR", t0: 84.8, t1: 86.96, txt: "E o celular voltou pra tela inicial." },
];

// Os acontecimentos
export const E = {
  buzz0: 1.4, buzz1: 7.6,          // o celular vibrando lá fora
  vira: [1.9, 2.5],                // vira a cabeça para a porta
  anda: [2.5, 4.0],                // anda até a porta
  porta: [4.0, 4.8],               // abre a porta
  olhaChao: [4.5, 5.2],
  abaixa: [7.2, 8.1], pega: 8.3, levanta: [8.4, 9.4],
  acorda: 9.6,                     // aperta o botão: tela de bloqueio
  desliza: 14.6,                   // tela de senha
  zeros: [18.7, 19.34, 20.14, 20.58], // junto com cada "zero" falado
  g1: [22.1, 31.0],                // primeiro glitch ("e o celular travou")
  letras: 24.8,                    // o celular é hackeado: HELP ME no teclado
  help: [25.6, 26.3, 27.0, 27.7, 28.4, 29.1],
  estouro: [29.8, 31.0],
  uns: 31.0,                       // todas as teclas viram 1
  codigo: [34.0, 35.7, 37.9, 39.2],// 1 -> 8 -> 0 -> 7 -> abre
  destrava: 39.4, inicio: 41.6,    // tela inicial
  appFone: 46.6,
  g2: [46.8, 54.4],                // segundo glitch: os apps viram Gallery
  somem: 50.9,
  galeria: 55.0, play: 57.5,
  video: [57.8, 82.9],             // o vídeo da Ana
  olho: [61.4, 66.2],              // a câmera entra no olho dela
  choro: [[64.8, 66.9], [72.3, 74.8]],
  vulto: [74.4, 80.4],             // alguém na porta, atrás dela
  puxa: 80.4,                      // puxam o celular dela
  estatica: [82.4, 84.4],
  volta: 84.4,                     // volta para a tela inicial
  enquete: 87.4,
};
