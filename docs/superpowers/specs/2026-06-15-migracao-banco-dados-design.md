# Migração para Banco de Dados (Supabase) — Design

## Objetivo

Hoje as vistorias salvas vivem exclusivamente no IndexedDB do navegador — sem sincronização entre dispositivos. O objetivo desta migração é permitir que o usuário acesse suas vistorias de qualquer dispositivo (celular, PC, tablet), mantendo o uso offline em campo que já existe hoje.

## Decisões aprovadas

- **Backend**: Supabase (Postgres + Auth + Storage), pelo baixo esforço de implementação e plano gratuito suficiente para o estágio atual do projeto.
- **Autenticação**: email + senha via Supabase Auth, com recuperação de senha por email (recurso nativo, sem código extra).
- **Modo offline**: offline-first com sincronização posterior — o app continua funcionando sem internet, e sincroniza automaticamente quando a conexão retorna.

## Arquitetura

### Modelo de dados (Postgres)

- `vehicle_inspections`: uma linha por vistoria — dados do veículo/proprietário (placa, marca, cor, proprietário, telefone, observações), `user_id` (FK para o usuário autenticado), timestamps de criação/atualização.
- `damages`: uma linha por avaria — FK para `vehicle_inspections`, vista (`lateral-left`/`lateral-right`/`frontal`/`traseira`), peça, tipo de dano, severidade, notas.
- Fotos: armazenadas no Supabase Storage (bucket por usuário), com a URL pública/assinada salva no registro de `damages` correspondente.

### Controle de acesso

- Row Level Security (RLS) do Supabase: cada usuário só lê/escreve linhas onde `user_id` é o seu próprio ID. Isso elimina a necessidade de checagem manual de permissão no front-end.

### Estratégia offline-first

- O IndexedDB deixa de ser a fonte única de verdade e passa a ser **cache local + fila de sincronização**.
- Toda escrita (criar/editar vistoria, adicionar/remover avaria) grava local primeiro, garantindo resposta instantânea mesmo sem internet, e entra em uma fila de "pendente de sincronização" persistida no IndexedDB.
- Ao detectar conexão (evento `online` do navegador + tentativa periódica em background), a fila é processada e enviada ao Supabase em ordem.
- **Resolução de conflito**: a versão com timestamp de atualização mais recente vence (last-write-wins). Não há merge de campos — simples e suficiente para o caso de uso (um único inspetor por vistoria, edição concorrente é rara).

### Autenticação e sessão

- Tela de login/cadastro (email + senha) é exibida antes de qualquer tela do app caso não haja sessão ativa.
- Sessão persistida via mecanismo nativo do Supabase client (`localStorage`), evitando login repetido a cada visita.
- Fluxo de "esqueci minha senha" usa o link de recuperação por email padrão do Supabase Auth.

### Feedback de estado ao usuário

- Indicador discreto no `Header` com 3 estados possíveis: "Sincronizado", "Pendente sincronização", "Offline".
- Falhas de sincronização (ex.: sem internet) não bloqueiam o uso do app — o item permanece na fila e a tentativa é refeita automaticamente, sem repetir alertas de erro.
- Falhas de login (senha incorreta, email não encontrado) mostram mensagem de erro clara no próprio formulário.

## Fora de escopo (por agora)

- Múltiplos usuários colaborando na mesma vistoria em tempo real.
- Papéis/permissões diferenciados (admin vs operador).
- Login social (Google) — pode ser adicionado depois sem mudar a arquitetura de dados.

## Validação

Não há suite de testes automatizados no projeto hoje; a validação é manual:
1. Criar conta nova e confirmar login.
2. Criar uma vistoria em modo avião (offline) e confirmar que ela aparece localmente.
3. Reconectar e confirmar que a vistoria sincronizou com o Supabase (consultar via dashboard do Supabase ou logar em outro navegador/aba).
4. Logar com a mesma conta em uma segunda aba/navegador e confirmar que a vistoria sincronizada aparece.
