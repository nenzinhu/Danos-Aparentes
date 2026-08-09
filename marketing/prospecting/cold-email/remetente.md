# Remetente oficial — outbound

Dados do site (`/sobre`, schema.org):

| Campo | Valor |
|-------|-------|
| **Nome** | Jeferson |
| **Cargo** | Proprietário |
| **Empresa** | Danos Aparentes |
| **E-mail** | suporte@danosaparentes.com.br |
| **WhatsApp** | (48) 99203-2348 |
| **Domínio** | danosaparentes.com.br |

## Configuração no cliente de e-mail

```
De: Jeferson <suporte@danosaparentes.com.br>
Responder para: suporte@danosaparentes.com.br
Nome de exibição: Jeferson · Danos Aparentes
```

**Assinatura padrão** (colar no final de cada e-mail):

```
Jeferson
Proprietário · Danos Aparentes
suporte@danosaparentes.com.br
(48) 99203-2348
danosaparentes.com.br
```

## Boas práticas

- Enviar de `suporte@danosaparentes.com.br` (domínio verificado), não Gmail pessoal.
- SPF/DKIM do domínio devem estar ok na Vercel/host de e-mail antes do volume.
- WhatsApp outbound (Madini/Fisa): usar o número (48) 99203-2348 como retorno, não o WhatsApp do prospect.
