---
name: Gamervox
description: Plataforma de votação onde a comunidade gamer decide se uma IP esquecida merece voltar.
colors:
  deep-black: "#0b0e11"
  charcoal: "#161b22"
  texto-claro: "#f0f6fc"
  texto-secundario: "#8b949e"
  borda: "#30363d"
  roxo-neon: "#9d4edd"
  roxo-neon-hover: "#b06ee6"
  amarelo-eletrico: "#ffd60a"
  amarelo-eletrico-hover: "#e6c009"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.03em"
rounded:
  control: "6px"
  surface: "10px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.roxo-neon}"
    textColor: "{colors.deep-black}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.roxo-neon-hover}"
  vote-yes:
    backgroundColor: "{colors.roxo-neon}"
    textColor: "{colors.deep-black}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  vote-no:
    backgroundColor: "{colors.amarelo-eletrico}"
    textColor: "{colors.deep-black}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  tag-chip:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.texto-claro}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  card:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.texto-claro}"
    rounded: "{rounded.surface}"
    padding: "16px"
---

# Design System: Gamervox

## 1. Overview

**Creative North Star: "O Painel Neon do Discord/Steam"**

Terceira iteração de paleta. A v1 (carimbo/cartucho) foi rejeitada pelo usuário. A v2 (grafite + âmbar, inspirada em PlayerVox/Epic/PlayStation/Instant Gaming) validou a estrutura — bordas finas, cantos pequenos, tipografia única, motion discreto — mas o usuário pediu uma paleta de cor diferente, fornecendo hex exatos baseados num componente de referência (chips de tag + pills de voto com glow neon) e numa estética "Discord/Steam" (fundo quase preto com leve tom azulado).

Mantém-se toda a estrutura validada na v2 (ver seções 3-5), troca-se só a cor: âmbar sai, entram **roxo neon** (#9d4edd) e **amarelo elétrico** (#ffd60a) como os dois acentos do sistema, sobre um fundo "deep black" levemente azulado em vez do grafite neutro anterior.

**Key Characteristics:**
- Fundo "Deep Black" azulado (#0b0e11), não preto neutro nem grafite quente.
- Roxo Neon = estado ativo, foco, ação positiva (botão primário, voto Sim, status Aprovado, tags).
- Amarelo Elétrico = elemento de atenção (voto Não, status Rejeitado/erro).
- Pills de voto e tags ganham **glow** sutil (exceção deliberada à regra flat) — é o elemento de assinatura desta paleta.
- Bordas finas (#30363d), cantos pequenos, tipografia única (Inter) — herdados da v2, inalterados.

## 2. Colors

Dois acentos neon sobre fundo quase-preto azulado — disciplina de cor estrita: cada acento tem um significado fixo, nunca decorativo.

### Primary
- **Roxo Neon** (#9d4edd): ação positiva/ativa — botão primário (CTA, links, logo), voto "Sim", status "Aprovado", borda de foco, borda de tag.

### Secondary
- **Amarelo Elétrico** (#ffd60a): elemento de atenção — voto "Não", status "Rejeitado", mensagem de erro/validação.

### Neutral
- **Deep Black** (#0b0e11): fundo da aplicação. Preto levemente azulado, não neutro puro.
- **Charcoal** (#161b22): cards, inputs, header, chips — um nível acima do fundo.
- **Texto Claro** (#f0f6fc): texto principal, quase branco puro.
- **Texto Secundário** (#8b949e): tags secundárias, metadados, placeholders.
- **Borda** (#30363d): divisores e bordas — a "linha fina" padrão do sistema.

### Named Rules
**The Two-Accent Discipline Rule.** Só existem dois acentos no sistema: roxo (positivo/ativo) e amarelo (atenção). Nenhum terceiro acento — nem para decoração, nem para uma terceira categoria de status.

**The Content-Leads-Color Rule** (herdada da v2). A capa do jogo é a maior fonte de cor da tela; a UI ao redor fica neutra (Deep Black/Charcoal), só os dois acentos pontuam.

## 3. Typography

Sem alteração em relação à v2: Inter como família única.

**Character:** Uma família só, hierarquia construída por peso e tamanho.

### Hierarchy
- **Display** (700, `clamp(1.75rem, 3vw, 2.5rem)`, 1.15, tracking -0.01em): título de página, nome do jogo na página de detalhe.
- **Title** (600, 1.125rem, 1.3): título de jogo no card do feed, nome de usuário.
- **Body** (400, 1rem, 1.55): descrição do jogo, comentários. Máximo 70ch.
- **Label** (600, 0.75rem, tracking 0.03em): badges de status, contadores, metadados.

## 4. Elevation

Sistema flat por padrão (herdado da v2) com uma exceção deliberada: pills de voto preenchidas (Sim/Não) carregam um **glow estático** na cor do próprio acento — não é hover, é a assinatura visual da paleta neon.

### Shadow Vocabulary
- **neon-glow-roxo** (`box-shadow: 0 0 10px rgba(157,78,221,0.45)`): pill de voto "Sim" preenchida, sempre visível (não só hover).
- **neon-glow-amarelo** (`box-shadow: 0 0 10px rgba(255,214,10,0.45)`): pill de voto "Não" preenchida, sempre visível.
- **card-hover** (`border-color` para Roxo Neon): card de jogo no hover troca só a cor da borda — sem sombra, sem elevação.
- **focus-ring** (`outline: 2px solid var(--primary)`): foco de teclado, sempre visível.

### Named Rules
**The Neon Glow Exception.** Só as pills de voto preenchidas (Sim/Não) têm glow permanente. Todo o resto do sistema (cards, botões secundários, inputs) continua flat — o glow é reservado pro elemento de assinatura, não generalizado.

## 5. Components

### Buttons
- **Shape:** cantos de 6px.
- **Primary:** fundo Roxo Neon (#9d4edd), texto Deep Black (#0b0e11). Hover clareia pra #b06ee6.
- **Hover / Focus:** hover só troca de cor; focus usa anel de 2px (`outline`) em Roxo Neon, sempre visível.
- **Secondary / Ghost:** fundo transparente, borda 1px Borda (#30363d), texto Texto Claro; hover troca borda pra Texto Claro.

### Vote Pills (componente de assinatura)
Pills totalmente arredondadas (`rounded-full`), preenchidas (não outline): "Sim" em Roxo Neon com glow, "Não" em Amarelo Elétrico com glow, texto/ícone sempre em Deep Black (contraste invertido). Pill de Saldo no meio é outline (borda Roxo Neon, fundo Charcoal, texto Roxo Neon) — não preenchida, é informativa, não uma ação. Clique dá feedback de `scale(0.9)` via `:active` (150ms), com fallback instantâneo sob `prefers-reduced-motion`.

### Tag Chip
Pill totalmente arredondada, fundo Charcoal, borda 1px Roxo Neon a 70% de opacidade, texto Texto Claro. Hover leva a borda a 100% de opacidade. Mesmo estilo em todo lugar que exibe tag (card do feed, página de detalhe, filtro ativo).

### Status Badge
Pill com cantos de 6px (não totalmente arredondada — diferencia de voto/tag): fundo Charcoal, borda 1px e texto na cor do status (Roxo Neon=aprovado, Amarelo Elétrico=rejeitado, Borda+Texto Secundário=pendente). Não interativo. **Restrito a "Minhas publicações"/Perfil — não aparece na página pública de detalhe do jogo** (decisão do usuário: status de moderação é informação do autor, não da vitrine pública).

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** Charcoal (#161b22) sobre Deep Black (#0b0e11).
- **Shadow Strategy:** nenhuma, nem no hover — hover troca só `border-color` pra Roxo Neon (substituiu o `translateY`+sombra da v2 por pedido do usuário).
- **Border:** 1px solid Borda (#30363d) em repouso.
- **Internal Padding:** 16px.
- **Capa do jogo:** zoom sutil (`scale(1.05)`) no hover, contido com `overflow: hidden`.

### Inputs / Fields
- **Style:** fundo Deep Black, borda 1px Borda, cantos de 6px.
- **Focus:** borda passa pra Roxo Neon, sem glow (glow é exclusivo das vote pills).
- **Error:** borda/texto Amarelo Elétrico.

### Navigation
Header em Charcoal sobre Deep Black, borda inferior 1px. Logo em Roxo Neon, Display weight 700. Links de navegação como texto simples (sem borda), menu de usuário é dropdown (avatar + chevron) com nome/Perfil/Sair.

## 6. Do's and Don'ts

### Do:
- **Do** usar Roxo Neon (#9d4edd) pra toda ação positiva/ativa: botão primário, voto Sim, status Aprovado, foco, tag.
- **Do** usar Amarelo Elétrico (#ffd60a) só pra atenção: voto Não, status Rejeitado, erro.
- **Do** manter o glow (`box-shadow` colorido) exclusivo das vote pills preenchidas — não generalizar pra outros componentes (Neon Glow Exception).
- **Do** manter borda 1px como padrão; cantos pequenos (6px controles, 10px cards, pill em voto/tag).
- **Do** restringir o badge de status de moderação a "Minhas publicações"/Perfil — nunca na página pública de detalhe.

### Don't:
- **Don't** introduzir um terceiro acento de cor (Two-Accent Discipline Rule).
- **Don't** usar glow em elementos que não são vote pills (cards, botões comuns, inputs continuam flat).
- **Don't** voltar à paleta âmbar/grafite da v2 nem à paleta shadcn genérica original.
- **Don't** usar bordas grossas (2px+) como padrão de superfície, nem rotação decorativa — v1 rejeitada permanece banida.
- **Don't** usar mais de uma família tipográfica de exibição — Inter sozinha cobre título, corpo e label.
- **Don't** usar gradiente em texto (`background-clip: text`) nem `border-left`/`border-right` colorido como indicador de estado.
