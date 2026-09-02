# Kanban — Danos-Aparentes

Orquestração de 4 pessoas trabalhando em features, design, bugs, refactoring, inovações e documentação.

---

## Estados (Colunas)

| Estado | Entrada | Saída |
|--------|---------|-------|
| **Backlog** | Idea | Owner + branch atribuído |
| **Ready** | Critérios definidos | Owner começa |
| **Running** | Em andamento | Tests + diff OK |
| **Review** | Aguardando gates | Gates passam |
| **Blocked** | Dependência | Owner remove bloqueador |
| **Merged** | PR merged | ✓ Feito |

---

## Template Simplificado

```json
{
  "id": "task-NNN",
  "title": "Descrição breve",
  "owner": "Pessoa A|B|C|D",
  "type": "feature|design|bug|refactor|inovacao|doc",
  "state": "backlog|ready|running|review|blocked|merged",
  "branch": "type/task-nnn",
  "merge_gate": "testes pass + review OK"
}
```

---

## Sumário Final (Relatório Diário/Semanal)

No final de cada período, gere este relatório:

```markdown
## Sumário de Trabalho

**Período**: YYYY-MM-DD até YYYY-MM-DD

### Pessoa A
- Merged: 2 features, 1 bug (branches: feature/auth, feature/cache, bugfix/login)
- Running: 1 feature (refactor/api)
- Blocked: 1 (aguardando task-005)

### Pessoa B
- Merged: 1 design, 2 docs
- Running: 3 features (design system updates)
- Ready: 1 inovacao

### Pessoa C
- Merged: 1 refactor, 2 bugfixes
- Running: 1 feature, 1 refactor
- Review: 1 feature

### Pessoa D
- Merged: 2 features
- Running: 1 feature
- Blocked: 0

**Total**: 11 merged, 6 running, 1 review, 1 blocked
```

---

## Checklist Mínimo

- [ ] Task tem owner atribuído
- [ ] Branch criado com nome consistente
- [ ] Merge gate definido (não vago)
- [ ] Moved para Ready quando pronto
- [ ] Moved para Review quando testes OK
- [ ] Merged quando gates passam
- [ ] Sumário gerado ao final

---

## Regras Simples

1. Um owner por task
2. Merge gate sempre específico (não "pronto")
3. Blocked = bloqueador tem owner
4. Review nunca fica > 2 dias
5. Sumário diário/semanal (5 min)

