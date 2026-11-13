// O relógio do Ep01: cada fala e cada acontecimento, em segundos.
// Sem voz ainda: os tempos das falas são os planejados. Quando a voz existir, só estes números mudam.

export const DURACAO = 94;

// q: quem fala (VOCE em branco, ANA em amarelo)
export const FALAS = [
  { q: "NARRADOR", t0: 0.3, t1: 2.9, txt: "Você acordou e estava se arrumando pra ir pro trabalho." },
  { q: "NARRADOR", t0: 3.0, t1: 5.3, txt: "Mas, quando abriu a porta, tinha um celular no chão." },
  { q: "NARRADOR", t0: 5.5, t1: 6.5, txt: "Vibrando." },
  { q: "NARRADOR", t0: 7.4, t1: 8.8, txt: "Você pegou e ligou a tela." },
  { q: "NARRADOR", t0: 9.0, t1: 11.5, txt: "Uma chamada perdida, uma mensagem... e a foto de uma menina: Ana." },
  { q: "NARRADOR", t0: 12.2, t1: 14.8, txt: "Pra desbloquear, a dica era: aniversário do Tobi." },
  { q: "NARRADOR", t0: 15.0, t1: 16.8, txt: "Você tentou zero, zero, zero, zero." },
  { q: "NARRADOR", t0: 17.6, t1: 20.2, txt: "E o celular travou. As horas começaram a voar." },
  { q: "NARRADOR", t0: 21.2, t1: 23.6, txt: "Alguém, do outro lado, escreveu no teclado." },
  { q: "NARRADOR", t0: 27.3, t1: 29.4, txt: "Todas as teclas viraram o número um." },
  { q: "NARRADOR", t0: 29.8, t1: 31.4, txt: "Você apertou... virou oito." },
  { q: "NARRADOR", t0: 31.8, t1: 33.4, txt: "Apertou de novo... zero." },
  { q: "NARRADOR", t0: 33.8, t1: 35.4, txt: "Depois... sete." },
  { q: "NARRADOR", t0: 35.8, t1: 38.2, txt: "E o celular abriu. Dezoito do sete." },
  { q: "NARRADOR", t0: 38.8, t1: 40.9, txt: "Os aplicativos cheios de notificação." },
  { q: "NARRADOR", t0: 41.1, t1: 43.3, txt: "Você pensou em ligar pra alguém que conhecesse ela." },
  { q: "NARRADOR", t0: 44.4, t1: 46.4, txt: "Mas o celular travou de novo." },
  { q: "NARRADOR", t0: 46.8, t1: 49.6, txt: "A data pulou pro dia seguinte. E os aplicativos foram virando galeria." },
  { q: "NARRADOR", t0: 50.0, t1: 52.2, txt: "Até sobrar só a galeria." },
  { q: "NARRADOR", t0: 52.6, t1: 54.2, txt: "Dentro, só vídeos dela." },
  { q: "ANA", t0: 56.8, t1: 59.4, txt: "Se você olhar nos meus olhos..." },
  { q: "ANA", t0: 60.0, t1: 62.8, txt: "...você vai ver ele me olhando de volta." },
  { q: "ANA", t0: 65.6, t1: 68.4, txt: "Eu não quero que ele pegue mais ninguém." },
  { q: "ANA", t0: 69.4, t1: 71.2, txt: "Eu só queria ser feliz." },
  { q: "ANA", t0: 74.0, t1: 76.2, txt: "Se você está vendo esse vídeo..." },
  { q: "ANA", t0: 76.8, t1: 78.8, txt: "...não venha me encontrar." },
  { q: "ANA", t0: 79.9, t1: 81.6, txt: "Não... não, não, não!" },
  { q: "NARRADOR", t0: 83.8, t1: 85.6, txt: "E o celular voltou pra tela inicial." },
];

// Os acontecimentos
export const E = {
  buzz0: 1.4, buzz1: 6.5,          // o celular vibrando lá fora
  vira: [1.9, 2.5],                // vira a cabeça para a porta
  anda: [2.5, 4.0],                // anda até a porta
  porta: [4.0, 4.8],               // abre a porta
  olhaChao: [4.5, 5.2],
  abaixa: [6.4, 7.3], pega: 7.5, levanta: [7.6, 8.6],
  acorda: 8.8,                     // aperta o botão: tela de bloqueio
  desliza: 11.6,                   // tela de senha
  zeros: [15.0, 15.5, 16.0, 16.5],
  g1: [17.2, 27.0],                // primeiro glitch
  letras: 20.2,                    // o celular é hackeado: HELP ME no teclado
  help: [21.2, 21.9, 22.6, 23.3, 24.0, 24.7], // H E L P M E
  estouro: [25.8, 27.0],
  uns: 27.0,                       // todas as teclas viram 1
  codigo: [29.6, 31.6, 33.6, 35.6],// 1 8 0 7
  destrava: 35.8, inicio: 38.4,    // tela inicial
  appFone: 43.4,
  g2: [43.6, 51.2],                // segundo glitch: os apps viram Gallery
  somem: 46.0,
  galeria: 52.4, play: 54.0,
  video: [54.3, 81.8],             // o vídeo da Ana
  olho: [59.4, 63.6],              // a câmera entra no olho dela
  vulto: [73.6, 79.4],             // alguém na porta, atrás dela
  puxa: 79.4,                      // puxam o celular dela
  estatica: [81.4, 83.4],
  volta: 83.4,                     // volta para a tela inicial
  enquete: 86.0,
};
