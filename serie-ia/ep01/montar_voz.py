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
]

def main():
    mix = np.zeros(int(DUR * SR), dtype=np.float32)
    legendas = []
    for quem, a, b, t, txt in FALAS:
        src = NARR if quem == "NARRADOR" else ANA
        seg = src[int(a * SR):int(b * SR)].copy()
        f = int(0.015 * SR)                       # entrada e saída suaves (sem estalo)
        seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        i = int(t * SR)
        mix[i:i + len(seg)] += seg[: len(mix) - i]
        legendas.append({"q": quem, "t0": round(t, 2), "t1": round(t + (b - a), 2), "txt": txt})
    mix /= max(1e-9, float(np.max(np.abs(mix)))) / 0.95
    out = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    import wave
    with wave.open(str(AQUI / "voz.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
    (AQUI / "falas.json").write_text(json.dumps(legendas, ensure_ascii=False, indent=1))
    for l in legendas:
        print(f"{l['t0']:6.2f}-{l['t1']:6.2f} {l['q']:8} {l['txt']}")

main()
