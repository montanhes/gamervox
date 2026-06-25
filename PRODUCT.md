# Product

## Register

product

## Users

Gamers que sentem falta de IPs antigas sem remake/continuação (ex: Breath of Fire) e querem demonstrar isso publicamente. Usam o site pra: descobrir jogos esquecidos cadastrados por outros, votar Sim/Não pelo retorno de uma IP, comentar, e cadastrar jogos que sentem falta. Contexto de uso é casual/comunidade — navegação em feed, sessões curtas, mobile e desktop.

## Product Purpose

Plataforma de votação onde a comunidade gamer demonstra, de forma agregada e visível, interesse pelo retorno de IPs esquecidas — pressão coletiva ("vox populi") direcionada a publishers. Sucesso = listagem confiável por saldo de votos, baixo atrito pra votar/comentar, e cadastro de jogos sem spam (via moderação automática por IA).

## Brand Personality

Moderno, elegante, vivo. Primeira direção (carimbo/cartucho, bordas grossas, rotação) foi testada, implementada e **rejeitada explicitamente pelo usuário** ("ficou uma bosta total" — cores ruins, botões tortos sem sentido, cantos quadrados demais). Direção corrigida com base em 4 referências reais apontadas pelo usuário: PlayerVox, Epic Games Store, PlayStation Store, Instant Gaming. Padrão comum extraído: fundo dark neutro (não quente), UI quase sem ornamento — o card art/conteúdo carrega a cor, não a UI —, cantos pequenos e consistentes (nunca pílula, nunca zero-radius "frio"), uma cor de destaque só usada com moderação, tipografia única limpa, motion sutil (hover lift, leve zoom, transição de cor) que dá vida sem chamar atenção pra si. Design serve a tarefa; identidade visual vem da execução refinada, não de um conceito literal sobreposto.

## Anti-references

- Default SaaS/shadcn: fundo branco, primary violeta genérico, border-radius padrão, sem personalidade — estado original do site, rejeitado ("horripilante").
- Conceito de "carimbo/cartucho" (bordas grossas 2px, rotação -8°, blocos sólidos, Anton + IBM Plex Mono): primeira tentativa de redesign, explicitamente rejeitada pelo usuário como "botões tortos que não tem nada a ver" e "cantos totalmente quadrados".
- Clichês de design gerado por IA citados durante o planejamento (cream+serif+terracota; broadsheet hairline+zero-radius): seguem banidos. **Exceção confirmada pelo usuário**: dark neutro + um único acento saturado (ex: PlayerVox usa preto+verde-neon) deixa de ser "clichê a evitar" e passa a ser direção válida, porque está ancorado em referência real nomeada pelo usuário, não escolhido por reflexo.

## Design Principles

- Linhas finas, não blocos grossos: borda 1px (hairline) é o padrão; 2px+ só em estados de foco/ênfase pontual.
- Cantos pequenos e consistentes: nunca 0 (frio demais) nem pílula/totalmente arredondado (genérico demais) — uma escala pequena (~6-10px) usada em todo lugar.
- Motion como sinal de vida, não decoração: hover lift, leve zoom em capa de jogo, transição de cor — sempre rápido (150-250ms), nunca coreografado.
- Conteúdo lidera a cor: a arte do jogo (capa) é a maior fonte de cor da tela; a UI em volta fica neutra pra não competir.
- Conteúdo real >> placeholder: toda decisão de design parte dos dados e fluxos já existentes (jogos, tags, votos, comentários), não de mockups genéricos.

## Accessibility & Inclusion

WCAG AA como piso: contraste de texto ≥4.5:1 (corpo) e ≥3:1 (texto grande), foco de teclado visível em todos os elementos interativos, `prefers-reduced-motion` respeitado em todo hover/transição. Sem requisito adicional declarado além do padrão AA.
