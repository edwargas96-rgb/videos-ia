#!/usr/bin/env python3
"""Os efeitos sonoros do Ep01, gerados em código (sem arquivos de fora): vibração, passos, porta,
toques na tela, glitches, estática e o clima de suspense. Os tempos vêm de cena/js/roteiro.js.

Uso: python3 som.py efeitos.wav
"""
import re, sys, wave
from pathlib import Path
import numpy as np

SR = 48000
DUR = 94.0
rng = np.random.default_rng(1807)
N = int(SR * DUR)
mix = np.zeros(N)

# lê os tempos do roteiro.js (os números de E)
txt = (Path(__file__).parent / "cena" / "js" / "roteiro.js").read_text()
def num(chave):
    m = re.search(rf"\b{chave}:\s*([\d.]+)", txt)
    return float(m.group(1))
def lista(chave):
    m = re.search(rf"\b{chave}:\s*\[([^\]]+)\]", txt)
    return [float(x) for x in m.group(1).split(",")]

def put(t, x, g=1.0):
    i = int(t * SR)
    if i >= N: return
    x = x[: N - i]
    mix[i:i + len(x)] += x * g

def env(n, a=0.005, r=0.05):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc; y[i] = acc
    return y

def lp_fast(x, fc):
    # passa-baixa por média móvel (rápido para trechos longos)
    k = max(1, int(SR / fc / 2))
    return np.convolve(x, np.ones(k) / k, mode="same")

def ruido(d): return rng.standard_normal(int(d * SR))
def tom(f, d, fase=0):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * f * t + fase)

def clique(f=2500, d=0.02):
    n = int(d * SR)
    return (ruido(d) * 0.5 + tom(f, d)) * np.exp(-np.linspace(0, 9, n))

# ---------- ambiente ----------
amb = lp_fast(ruido(DUR), 400) * 0.02
put(0, amb)
for t in [0.4, 1.1, 2.3]:          # passarinho lá fora
    d = 0.12
    f = 3200 + 900 * np.sin(np.linspace(0, 9, int(d * SR)))
    ph = np.cumsum(2 * np.pi * f / SR)
    put(t, np.sin(ph) * env(int(d * SR), 0.01, 0.05), 0.05)

# ---------- chave ----------
for k in range(4):
    put(0.95 + k * 0.05, clique(4200 + k * 600, 0.04), 0.25)

# ---------- vibração ----------
b0, b1 = num("buzz0"), num("buzz1")
abre = lista("porta")[0] + 0.3
t = b0
while t < b1:
    d = 0.5
    z = tom(170, d) * (0.6 + 0.4 * np.sign(tom(28, d))) * env(int(d * SR), 0.02, 0.04)
    if t < abre: z = lp_fast(z, 240) * 0.6
    put(t, z, 0.45 if t >= abre else 0.18)
    t += 1.0

# ---------- passos ----------
a0, a1 = lista("anda")
for i, t in enumerate(np.arange(a0 + 0.1, a1, 0.48)):
    put(t, lp_fast(ruido(0.09), 900) * np.exp(-np.linspace(0, 7, int(0.09 * SR))), 0.9)
for t in [6.5, 6.95]:
    put(t, lp_fast(ruido(0.09), 900) * np.exp(-np.linspace(0, 7, int(0.09 * SR))), 0.8)

# ---------- porta ----------
p0, p1 = lista("porta")
put(p0, clique(1800, 0.05), 0.6)
d = p1 - p0
f = 300 + 180 * np.sin(np.linspace(0, 3, int(d * SR)))
rang = np.sin(np.cumsum(2 * np.pi * f / SR)) * (0.5 + 0.5 * np.sin(np.linspace(0, 60, int(d * SR)))) * env(int(d * SR), 0.05, 0.2)
put(p0 + 0.15, lp_fast(rang + 0.3 * ruido(d), 1500), 0.12)

# ---------- pegar o celular, botão, deslizar ----------
put(num("pega"), lp_fast(ruido(0.25), 2000) * env(int(0.25 * SR), 0.02, 0.15), 0.12)
put(num("acorda"), clique(3000, 0.03), 0.4)
put(num("acorda") + 0.05, tom(880, 0.12) * env(int(0.12 * SR), 0.01, 0.08) * 0.5 + tom(1320, 0.12) * env(int(0.12 * SR), 0.01, 0.08) * 0.3, 0.2)
dz = 0.3
put(num("desliza") - 0.15, lp_fast(ruido(dz), 3000) * env(int(dz * SR), 0.1, 0.15), 0.15)

# ---------- toques ----------
toques = lista("zeros") + lista("codigo") + [num("appFone"), num("galeria"), num("play")]
for t in toques:
    put(t, clique(2600, 0.025), 0.35)

# ---------- glitch ----------
def glitch(d, forca=1.0):
    n = int(d * SR)
    x = ruido(d)
    # esmaga a resolução e liga/desliga em pedaços
    passo = rng.integers(6, 40)
    x = np.repeat(x[::passo], passo)[:n]
    gate = np.repeat(rng.random(n // 1200 + 1) > 0.35, 1200)[:n]
    y = x * gate + 0.4 * np.sign(tom(rng.integers(60, 900), d)) * gate
    return y * forca

g1a, g1b = lista("g1")
letras = num("letras")
t = g1a
while t < letras:
    put(t, glitch(0.18, 0.18), 1)
    t += 0.18 + 0.12 * rng.random()
for k in range(40):                      # o relógio disparando: tique acelerando
    tt = g1a + (letras - g1a) * (1 - (1 - k / 40) ** 1.6)
    put(tt, clique(5000, 0.012), 0.12)
put(letras - 0.2, glitch(0.5, 0.5), 1)
for t in lista("help"):                  # cada letra de HELP ME: um bipe torto
    d = 0.22
    f = 520 * np.exp(-np.linspace(0, 1.2, int(d * SR)))
    bip = np.sign(np.sin(np.cumsum(2 * np.pi * f / SR))) * env(int(d * SR), 0.005, 0.1)
    put(t, bip, 0.12)
    put(t, glitch(0.08, 0.2), 1)
e0, e1 = lista("estouro")
put(e0, glitch(e1 - e0, 0.55) * np.linspace(0.3, 1, int((e1 - e0) * SR)), 1)
# depois do estouro: silêncio total (até o ambiente some)
uns = num("uns")
i0, i1 = int(uns * SR), int((uns + 2.4) * SR)
mix[i0:i1] = 0

# o código: cada tecla que muda faz um "tum" grave
for t in lista("codigo"):
    put(t + 0.1, tom(70, 0.4) * np.exp(-np.linspace(0, 5, int(0.4 * SR))), 0.45)
dt = num("destrava")
for k, f in enumerate([523, 622, 784]):  # destravou (um acorde menor)
    put(dt + k * 0.08, tom(f, 0.5) * env(int(0.5 * SR), 0.01, 0.35), 0.1)

# segundo glitch
g2a, g2b = lista("g2")
put(g2a, glitch(1.2, 0.6), 1)
t = g2a + 1.2
while t < num("somem"):
    put(t, glitch(0.15, 0.2), 1); t += 0.3
for k in range(8):                       # cada app virando Gallery: um estalo
    put(num("somem") + k * 0.3, clique(1200 + 150 * k, 0.03), 0.35)
put(g2b - 0.5, tom(220, 0.6) * env(int(0.6 * SR), 0.2, 0.3), 0.08)

# ---------- o vídeo da Ana ----------
v0, v1 = lista("video")
dv = v1 - v0
drone = (tom(55, dv) + 0.5 * tom(82.5, dv, 1) + 0.3 * tom(110.3, dv, 2)) * np.linspace(0.3, 1, int(dv * SR))
put(v0, drone * env(int(dv * SR), 2, 0.3), 0.08)
put(v0, lp_fast(ruido(dv), 600) * 0.15, 1)   # o chiado do vídeo
for t in np.arange(v0 + 0.3, v0 + 2.6, 0.75):   # a respiração dela
    d = 0.5
    put(t, lp_fast(ruido(d), 1200) * np.sin(np.linspace(0, np.pi, int(d * SR))), 0.12)
for a, b in [(62.9, 65.4), (71.3, 73.8)]:      # soluços
    for t in np.arange(a, b, 0.42):
        d = 0.22
        put(t, lp_fast(ruido(d), 1500) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2, 0.18)
ol0, ol1 = lista("olho")
put(ol0, tom(40, ol1 - ol0) * env(int((ol1 - ol0) * SR), 1, 1), 0.25)   # grave quando entra no olho
vu0, _ = lista("vulto")
put(vu0 + 2.2, tom(1760, 1.5) * env(int(1.5 * SR), 0.6, 0.6) * 0.5 + tom(1864, 1.5) * env(int(1.5 * SR), 0.6, 0.6) * 0.5, 0.03)
pu = num("puxa")
put(pu, lp_fast(ruido(0.3), 300) * np.exp(-np.linspace(0, 4, int(0.3 * SR))), 1.2)   # o tranco
put(pu, tom(48, 0.8) * np.exp(-np.linspace(0, 4, int(0.8 * SR))), 0.7)
put(pu + 0.3, glitch(1.7, 0.3), 1)
s0, s1 = lista("estatica")
put(s0, ruido(s1 - s0) * 0.35, 1)
vo = num("volta")
i0, i1 = int(vo * SR), int((vo + 2.2) * SR)
mix[i0:i1] *= 0.05
for t in [vo + 0.6, vo + 1.4]:                  # coração
    for k, g in [(0, 0.9), (0.18, 0.6)]:
        put(t + k, tom(52, 0.18) * np.exp(-np.linspace(0, 6, int(0.18 * SR))), g * 0.6)

# ---------- a enquete ----------
en = num("enquete")
put(en, tom(65, 1.5) * np.exp(-np.linspace(0, 3, int(1.5 * SR))), 0.6)
put(en, lp_fast(ruido(0.4), 2500) * np.exp(-np.linspace(0, 6, int(0.4 * SR))), 0.36)
put(en, drone[: int(7 * SR)] * env(int(7 * SR), 0.5, 2.5), 0.06)

# fim: sai suave
mix[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))
mix /= max(1e-9, np.max(np.abs(mix))) / 0.9
out = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1] if len(sys.argv) > 1 else "efeitos.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print("efeitos prontos")
