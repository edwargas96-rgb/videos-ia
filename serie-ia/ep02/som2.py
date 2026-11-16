#!/usr/bin/env python3
"""Efeitos do Ep02 (gerados em código): glitch do reinício, notificações, toques, ligação e enquete."""
import re, sys, wave
from pathlib import Path
import numpy as np
SR = 48000; DUR = 90.0; N = int(SR * DUR); mix = np.zeros(N); rng = np.random.default_rng(1208)
txt = (Path(__file__).parent / "cena" / "js" / "roteiro2.js").read_text()
num = lambda k: float(re.search(rf"\b{k}:\s*(-?[\d.]+)", txt).group(1))
lista = lambda k: [float(x) for x in re.search(rf"\b{k}:\s*\[([^\]]+)\]", txt).group(1).split(",")]
def put(t, x, g=1.0):
    i = int(t * SR)
    if 0 <= i < N: x = x[: N - i]; mix[i:i + len(x)] += x * g
ruido = lambda d: rng.standard_normal(int(d * SR))
tom = lambda f, d: np.sin(2 * np.pi * f * np.arange(int(d * SR)) / SR)
dec = lambda d, k=6: np.exp(-np.linspace(0, k, int(d * SR)))
lp = lambda x, fc: np.convolve(x, np.ones(max(1, int(SR / fc / 2))) / max(1, int(SR / fc / 2)), mode="same")
clique = lambda: (ruido(0.025) * 0.5 + tom(2600, 0.025)) * dec(0.025, 9)
put(0, lp(ruido(DUR), 400) * 0.02)                                   # ambiente
r0, r1 = lista("reset")
g = ruido(1.0); passo = 20; g = np.repeat(g[::passo], passo)[: int(SR)]; put(r0 - 0.4, g * 0.5)          # glitch
put(r0 + 0.6, tom(60, 0.5) * dec(0.5, 4), 0.6)                        # apaga
for k, f in enumerate([523, 659, 784]): put(r1 - 0.5 + k * 0.12, tom(f, 0.4) * dec(0.4, 4), 0.15)   # liga de novo
for t in lista("notifs"): put(t, (tom(1318, 0.12) + 0.6 * tom(1760, 0.12)) * dec(0.12, 5), 0.18)
for k in ["tapVlog", "tapRuim", "tapGal", "tapSpark", "tapChats", "tapMae"]: put(num(k), clique(), 0.35)
put(num("tapRuim") + 0.15, np.sign(tom(220, 0.25)) * dec(0.25, 5), 0.1)                      # erro
a, b = lista("rolar"); put(a, lp(ruido(b - a), 3000) * np.sin(np.linspace(0, np.pi, int((b - a) * SR))), 0.08)
for t in lista("msgs") + lista("msgsMae"): put(t, tom(980, 0.08) * dec(0.08, 6), 0.12)
m = lista("msgs"); put(m[2], np.repeat(ruido(0.3)[::30], 30)[: int(0.3 * SR)], 0.25)
L, Q = num("liga"), num("enquete")
t = L
while t < Q + 6:                                                      # toque + vibração
    put(t, (tom(880, 0.4) + tom(1100, 0.4)) * 0.5 * dec(0.4, 2), 0.25)
    put(t, tom(170, 0.5) * (0.6 + 0.4 * np.sign(tom(28, 0.5))), 0.12)
    t += 1.2
put(Q, tom(65, 1.5) * dec(1.5, 3), 0.6)
mix[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))
mix /= np.max(np.abs(mix)) / 0.9
with wave.open(sys.argv[1] if len(sys.argv) > 1 else "efeitos.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("efeitos prontos")
