// O relógio do Ep01: cada fala e cada acontecimento, em segundos.
// Sem voz ainda: os tempos das falas são os planejados. Quando a voz existir, só estes números mudam.

export const DURACAO = 94;

// q: quem fala (VOCE em branco, ANA em amarelo)
export const FALAS = [
  { q: "VOCE", t0: 5.4, t1: 6.6, txt: "De quem é isso?" },
  { q: "VOCE", t0: 10.2, t1: 11.0, txt: "Ana?" },
  { q: "VOCE", t0: 13.0, t1: 14.8, txt: "Aniversário do Tobi..." },
  { q: "VOCE", t0: 29.6, t1: 30.6, txt: "Um..." },
  { q: "VOCE", t0: 31.6, t1: 32.6, txt: "...oito..." },
  { q: "VOCE", t0: 33.6, t1: 34.6, txt: "...zero..." },
  { q: "VOCE", t0: 35.6, t1: 36.6, txt: "...sete." },
  { q: "VOCE", t0: 37.4, t1: 38.9, txt: "Dezoito do sete." },
  { q: "VOCE", t0: 40.8, t1: 43.0, txt: "Vou ligar pra alguém que conhece ela." },
  { q: "ANA", t0: 56.8, t1: 59.4, txt: "Se você olhar nos meus olhos..." },
  { q: "ANA", t0: 60.0, t1: 62.8, txt: "...você vai ver ele me olhando de volta." },
  { q: "ANA", t0: 65.6, t1: 68.4, txt: "Eu não quero que ele pegue mais ninguém." },
  { q: "ANA", t0: 69.4, t1: 71.2, txt: "Eu só queria ser feliz." },
  { q: "ANA", t0: 74.0, t1: 76.2, txt: "Se você está vendo esse vídeo..." },
  { q: "ANA", t0: 76.8, t1: 78.8, txt: "...não venha me encontrar." },
  { q: "ANA", t0: 79.9, t1: 81.6, txt: "Não... não, não, não!" },
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
  letras: 20.2,                    // o teclado vira letras
  help: [21.2, 21.9, 22.6, 23.3, 24.0, 24.7], // H E L P M E
  estouro: [25.8, 27.0],
  uns: 27.0,                       // todas as teclas viram 1
  codigo: [29.6, 31.6, 33.6, 35.6],// 1 8 0 7
  destrava: 35.8, inicio: 38.4,    // tela inicial
  appFone: 43.4, contato: 44.4, ligar: 45.2,
  g2: [45.6, 51.2],                // segundo glitch: os apps somem
  somem: 47.6,
  galeria: 52.4, play: 54.0,
  video: [54.3, 81.8],             // o vídeo da Ana
  olho: [59.4, 63.6],              // a câmera entra no olho dela
  vulto: [73.6, 79.4],             // alguém na porta, atrás dela
  puxa: 79.4,                      // puxam o celular dela
  estatica: [81.4, 83.4],
  volta: 83.4,                     // volta para a tela inicial
  enquete: 86.0,
};
