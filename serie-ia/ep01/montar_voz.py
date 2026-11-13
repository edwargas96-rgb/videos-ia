#!/usr/bin/env python3
"""Corta as falas do narrador e da Ana (dos MP3 gerados na ElevenLabs) e coloca cada uma no
segundo certo do vídeo. Escreve voz/voz.wav (a trilha de vozes) e voz/falas.json (para as legendas).

Uso: python3 montar_voz.py
"""
import json, subprocess
from pathlib import Path
import numpy as np

SR = 48000
DUR = 96.0
AQUI = Path(__file__).parent / "voz"

def ler(arq):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(arq), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)

NARR = ler(AQUI / "narrador.wav")
# a pergunta final (gerada depois) entra no fim da narração, depois de 1 s de silêncio
FINAL_INI = len(NARR) / SR + 1.0
NARR = np.concatenate([NARR, np.zeros(SR, dtype=np.float32), ler(AQUI / "narrador-final.mp3")])
ANA = ler(AQUI / "ana-original.mp3")

# (quem, início no áudio original, fim, segundo no vídeo, legenda)
FALAS = [
    ("NARRADOR", 0.00, 2.95, 0.3, "Você acordou e estava se arrumando pra ir pro trabalho."),
    ("NARRADOR", 3.10, 7.65, 3.3, "Mas, quando abriu a porta, tinha um celular no chão, vibrando."),
    ("NARRADOR", 7.85, 9.68, 8.0, "Você pegou e ligou a tela."),
    ("NARRADOR", 9.80, 14.35, 9.9, "Uma chamada perdida, uma mensagem e a foto de uma menina: Ana."),
    ("NARRADOR", 14.55, 17.85, 14.5, "Pra desbloquear, a dica era: aniversário do Tobi."),
    ("NARRADOR", 17.96, 21.22, 17.8, "Você tentou zero, zero, zero, zero."),
    ("NARRADOR", 21.32, 22.76, 21.3, "E o celular travou."),
    ("NARRADOR", 22.86, 24.52, 22.8, "As horas começaram a voar."),
    ("NARRADOR", 24.60, 27.90, 25.0, "Alguém do outro lado escreveu HELP ME no teclado."),
    ("NARRADOR", 27.92, 30.16, 31.3, "Todas as teclas viraram o número um."),
    ("NARRADOR", 30.26, 32.14, 33.6, "Você apertou... virou oito."),
    ("NARRADOR", 32.24, 34.00, 35.6, "Apertou de novo... zero."),
    ("NARRADOR", 34.18, 35.50, 37.4, "Depois... sete."),
    ("NARRADOR", 35.60, 38.06, 38.9, "E o celular abriu. Dezoito do sete."),
    ("NARRADOR", 38.22, 40.16, 42.0, "Os aplicativos cheios de notificação."),
    ("NARRADOR", 40.62, 43.10, 44.0, "Você pensou em ligar pra alguém que conhecesse ela."),
    ("NARRADOR", 43.12, 44.88, 47.0, "Mas o celular travou de novo."),
    ("NARRADOR", 44.96, 46.70, 48.8, "A data pulou pro dia seguinte."),
    ("NARRADOR", 46.72, 50.72, 50.6, "E os aplicativos foram virando galeria, até sobrar só a galeria."),
    ("NARRADOR", 50.80, 52.52, 55.6, "Dentro, só vídeos dela."),
    ("ANA", 0.50, 4.98, 60.2, "Se você olhar nos meus olhos, você vai ver ele me olhando de volta."),
    ("ANA", 5.26, 7.80, 67.0, "Eu não quero que ele pegue mais ninguém."),
    ("ANA", 8.20, 10.10, 70.3, "Eu só queria ser feliz."),
    ("ANA", 10.42, 14.12, 75.0, "Se você está vendo esse vídeo... não venha me encontrar."),
    ("ANA", 14.32, 17.55, 80.6, "Não... não, não, não!"),
    ("NARRADOR", 52.62, 54.78, 84.8, "E o celular voltou pra tela inicial."),
    ("NARRADOR", FINAL_INI + 0.0, FINAL_INI + 5.95, 87.6, "E agora... o que você faria? Ajudar a Ana... ou largar o celular? Deixa nos comentários."),
]

def energia(x, passo):
    n = len(x) // passo
    return np.sqrt(np.mean(x[: n * passo].reshape(n, passo) ** 2, axis=1) + 1e-12)

def cortes_no_silencio(src, falas):
    """Para cada fala, acha onde cortar no silêncio de verdade (não no tempo da transcrição),
    para não comer o começo nem o fim das palavras."""
    passo = int(0.01 * SR)
    e = energia(src, passo)
    def minimo(t0, t1):
        i0, i1 = max(0, int(t0 / 0.01)), min(len(e) - 1, int(t1 / 0.01))
        if i1 <= i0: return t0
        return (i0 + int(np.argmin(e[i0:i1]))) * 0.01
    res = []
    for k, (a, b) in enumerate(falas):
        ini = 0.0 if k == 0 else minimo(falas[k - 1][1] - 0.05, a + 0.08)
        fim = len(src) / SR if k == len(falas) - 1 else minimo(b - 0.08, falas[k + 1][0] + 0.05)
        res.append((ini, fim))
    return res

RESPIRO = 0.12   # silêncio mínimo entre uma fala e a próxima

def main():
    mix = np.zeros(int(DUR * SR), dtype=np.float32)
    pecas = []
    for quem, src in (("NARRADOR", NARR), ("ANA", ANA)):
        idx = [i for i, f in enumerate(FALAS) if f[0] == quem]
        cortes = cortes_no_silencio(src, [(FALAS[i][1], FALAS[i][2]) for i in idx])
        for i, (ca, cb) in zip(idx, cortes):
            _, a, b, t, txt = FALAS[i]
            pecas.append(dict(q=quem, src=src, ca=ca, cb=cb, a=a, b=b, t=t, txt=txt))
    pecas.sort(key=lambda p: p["t"] - (p["a"] - p["ca"]))
    fim_ant = -1
    for p in pecas:
        ini = p["t"] - (p["a"] - p["ca"])
        voz_ini = p["t"] - 0.0                       # onde a fala de fato começa
        if voz_ini < fim_ant + RESPIRO:                  # empurra só o necessário
            d = fim_ant + RESPIRO - voz_ini
            p["t"] += d; ini += d
            print(f"empurrei {d:.2f} s: {p['txt'][:40]}")
        seg = p["src"][int(p["ca"] * SR):int(p["cb"] * SR)].copy()
        f = int(0.02 * SR)
        seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        j = int(ini * SR)
        mix[j:j + len(seg)] += seg[: len(mix) - j]
        fim_ant = p["t"] + (p["b"] - p["a"])             # onde a fala de fato termina
    mix /= max(1e-9, float(np.max(np.abs(mix)))) / 0.95
    out = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    import wave
    with wave.open(str(AQUI / "voz.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
    legendas = [{"q": p["q"], "t0": round(p["t"], 2), "t1": round(p["t"] + p["b"] - p["a"], 2), "txt": p["txt"]} for p in pecas]
    (AQUI / "falas.json").write_text(json.dumps(legendas, ensure_ascii=False, indent=1))
    for l in legendas:
        print(f"{l['t0']:6.2f}-{l['t1']:6.2f} {l['q']:8} {l['txt']}")

main()
