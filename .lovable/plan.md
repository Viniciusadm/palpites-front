# Plano: App de Bolões da Copa (UI only, dados mockados)

App SaaS-style para bolões da Copa do Mundo. Apenas frontend com dados mockados — sem backend, auth, ou banco.

## Identidade visual

- Tema escuro: fundo `#0B0F14` / superfícies `#141A22` / bordas `#1F2630`
- Dourado destaque: `#F5C518` (primary) com glow sutil
- Texto: branco/cinza claro, dourado em destaques
- Tipografia: Inter (corpo) + Space Grotesk (títulos/placares)
- Cards rounded-2xl, sombras suaves, micro-interações em hover/tap
- Mobile-first: bottom-nav no mobile, sidebar fixa no desktop

Tokens definidos em `src/styles.css` (HSL/oklch) e mapeados em `@theme inline`.

## Rotas (TanStack Router, file-based)

```
src/routes/
  __root.tsx                    layout shell (Outlet)
  index.tsx                     landing: Entrar / Criar bolão
  bolao.criar.tsx               formulário + tela pós-criação (link + participantes)
  bolao.entrar.tsx              código/link + botão entrar
  _app.tsx                      layout autenticado (sidebar desktop + bottom nav mobile)
  _app.palpites.tsx             tela principal (abas: Próximos, Meus palpites, Encerrados)
  _app.jogos.tsx                listagem geral de jogos por data
  _app.ranking.tsx              tabela/cards de classificação
  _app.participantes.tsx        lista + ações do criador
  _app.configuracoes.tsx        preferências do bolão (mock)
  _app.historico.tsx            histórico de palpites (futuros, anteriores, acertos, erros)
  admin.tsx                     layout admin (Outlet com sub-abas)
  admin.selecoes.tsx            CRUD seleções (mock)
  admin.partidas.tsx            CRUD partidas (mock)
```

Cada rota define `head()` com title/description próprios.

## Componentes principais (shadcn + custom)

- `AppShell` — sidebar desktop + bottom nav mobile + topbar com nome do bolão
- `MatchCard` — bandeiras (emoji 🇧🇷 ou SVG), nomes, data/hora, status badge, inputs de placar ou exibição de palpite vs resultado
- `MatchStatusBadge` — Não iniciado / Ao vivo (pulse) / Encerrado
- `GuessInput` — par de inputs numéricos com `x` no meio, validação simples
- `RankingRow` / `RankingCard` — posição (medalha top 3), nome, pontos, acertos
- `ParticipantModal` — detalhes + histórico de palpites com pontos por jogo
- `CreateBolaoModal`, `CreateSelecaoModal`, `CreatePartidaModal`
- `ShareLinkBox` — link + botão copiar (toast)
- `EmptyState`, `Skeleton` para listas, `Toaster` (sonner) global
- `TabsFilter` reaproveitável (Próximos / Meus / Encerrados)

## Dados mockados (`src/mocks/`)

- `selecoes.ts` — 32 países, grupos A–H, bandeiras (emoji unicode)
- `partidas.ts` — fase de grupos completa + alguns mata-matas, com status variados (futuros, ao vivo, encerrados com placar)
- `participantes.ts` — 10+ usuários com avatar (initials), data de entrada
- `palpites.ts` — palpites do usuário atual + dos outros para histórico
- `ranking.ts` — derivado/precomputado a partir de palpites vs resultados
- `currentUser.ts` — usuário "logado" mock, marcado como criador do bolão

Estado em memória com Zustand (ou Context simples) para refletir mudanças (salvar palpite, criar partida) durante a sessão.

## Fluxos chave

1. **Landing** (`/`): hero com logo, 2 CTAs grandes (Criar / Entrar).
2. **Criar bolão**: form → após submit mostra card com link mock + lista de participantes + contador.
3. **Entrar**: input código → redireciona para `/palpites`.
4. **Palpites**: agrupados por data, abas de filtro, inputs bloqueados se status ≠ "não iniciado", mostra resultado oficial + palpite quando encerrado.
5. **Ranking**: lista ordenada, clique abre `ParticipantModal` com breakdown.
6. **Participantes**: lista com badge de status, ações de admin (remover/copiar convite) visíveis para o criador.
7. **Admin**: tabelas com CRUD em modais, alterações persistem só em memória.

## Detalhes técnicos

- Toasts: `sonner`
- Ícones: `lucide-react`
- Form: react-hook-form + zod (já no stack)
- Sem chamadas de rede; tudo síncrono via stores
- Skeletons exibidos brevemente (setTimeout) para sensação de carregamento real
- Acessibilidade: labels, foco visível dourado, contraste AA

## Fora de escopo

- Backend, auth real, persistência entre sessões
- Upload real de bandeiras (apenas preview local no modal admin)
- Notificações em tempo real
