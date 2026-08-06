# Cold email — Top 5 Hot (Danos Aparentes)

**Gerado:** 2026-08-06  
**Cadência:** Dia 0 → 3 → 7 → 14 → 21 (5 e-mails)  
**CTA padrão:** reply de 1 linha (interesse), não reunião de 30 min  
**Remetente:** Jeferson · `suporte@danosaparentes.com.br` (ver `remetente.md`)  
**Copiar E1 prontos:** `prontos_para_enviar.md`

## UTM (alinhar com disp_blog)

Padrão outbound:

```
utm_source=email
utm_medium=cold
utm_campaign=outbound_hot_2026_08
utm_content={slug_empresa}_e{n}
```

| Segmento | Link principal (recurso) | Landing produto |
|----------|--------------------------|-----------------|
| Valet / estacionamento | `/blog/vistoria-entrega-veiculo` | `/frotas` |
| Locadora | `/blog/checklist-vistoria-devolucao-locadora` | `/frotas` |
| Oficina frota | `/blog/avarias-preexistentes-como-provar` | `/oficinas` |

Exemplo completo:

```
https://danosaparentes.com.br/blog/checklist-vistoria-devolucao-locadora?utm_source=email&utm_medium=cold&utm_campaign=outbound_hot_2026_08&utm_content=fisa_e2
```

## Canais por lead

| Lead | Email público? | Canal recomendado |
|------|----------------|-------------------|
| Ultravalet | Sim — contato@ultravalet.com.br | E-mail |
| Fast Fleet | Sim — contato@fastfleet.com.br | E-mail |
| Madini | Não | WhatsApp (11) 3892-8295 + e-mail se descobrir |
| Fisa | Não | Telefone/WhatsApp (11) 2369-7135; adaptar copy |
| Movility | Não verificado | Confirmar contato no site antes |

## Arquivos

- `sequencia_valet.md` — Ultravalet + Madini
- `sequencia_locadora.md` — Fisa + Movility
- `sequencia_oficina.md` — Fast Fleet
- `whatsapp_curto.md` — versões 1-toque para Madini/Fisa
- `remetente.md` — De/Reply-To + assinatura
- `prontos_para_enviar.md` — E1 copy-paste para os 5 Hot
