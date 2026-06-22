import { LEGAL_CONTACT_EMAIL } from '../components/LegalContent'

export const SITE_DOMAIN = 'https://danosaparentes.com.br'
export const SITE_LANDING_URL = `${SITE_DOMAIN}/`
export const SITE_APP_URL = `${SITE_DOMAIN}/app`

export const GOOGLE_ADS_POLICY_URL =
  'https://support.google.com/adspolicy/answer/15938071#phishing'

export const GOOGLE_ADS_APPEAL_TITLE =
  'Solicitação de revisão — Práticas comerciais inaceitáveis / Phishing'

export const GOOGLE_ADS_APPEAL_TEXT = `Solicitação de revisão — Google Ads
Política citada: Práticas comerciais inaceitáveis (Misrepresentation) e Phishing
Referência: ${GOOGLE_ADS_POLICY_URL}

Anunciante: Jeferson da Silva
Empresa: Danos Aparentes — Sistema de Vistoria Veicular Digital
Domínio principal: ${SITE_DOMAIN}
Landing page (destino do anúncio): ${SITE_LANDING_URL}
Aplicativo web (área logada): ${SITE_APP_URL}
E-mail de contato: ${LEGAL_CONTACT_EMAIL}
Responsável legal: Jeferson da Silva | CPF 057.408.599-80 | Florianópolis - SC

---

A. RESPOSTA DIRETA À POLÍTICA (PHISHING E PRÁTICAS INACEITÁVEIS)

Acreditamos que a suspensão foi um falso positivo relacionado à política de Phishing e/ou Práticas comerciais inaceitáveis. Declaramos expressamente:

• NÃO praticamos phishing: não pedimos cartão de crédito, CVV, senha bancária nem dados financeiros fingindo ser outra entidade.
• NÃO nos fazemos passar por banco, DETRAN, Denatran, governo, seguradora ou marca de terceiros.
• NÃO coletamos informações pessoais de forma enganosa para roubo de identidade ou fraude.
• SOMOS uma empresa legítima de software SaaS, com marca própria (Danos Aparentes), contato público e páginas legais.

O login em ${SITE_APP_URL} é exclusivamente para acesso ao nosso próprio serviço — cadastro com e-mail e senha criados pelo usuário em nossa plataforma, no mesmo modelo de qualquer aplicativo web com autenticação.

---

B. COMO O NEGÓCIO FUNCIONA (DETALHES SOLICITADOS PELO GOOGLE)

O Danos Aparentes é um software para vistoriadores veiculares registrarem avarias em diagramas digitais, anexarem fotos e gerarem laudos em PDF.

Estrutura do site (transparente e separada):

1) ${SITE_LANDING_URL}
   Landing page pública — destino dos anúncios. Apresenta o produto, planos (R$ 49,90/mês), FAQ, trial de 7 dias, Termos, Privacidade e Suporte. Sem formulário de cartão.

2) ${SITE_APP_URL}
   Aplicativo web com login obrigatório (e-mail + senha). Área restrita ao serviço contratado/testado.

3) Páginas legais e suporte:
   • ${SITE_DOMAIN}/termos
   • ${SITE_DOMAIN}/privacidade
   • ${SITE_DOMAIN}/suporte

Modelo comercial: 7 dias grátis após cadastro; plano PRO opcional (R$ 49,90/mês), informado na landing e no FAQ.

---

C. BOAS PRÁTICAS IMPLEMENTADAS (CONFORME ORIENTAÇÃO DO GOOGLE)

Conforme a página oficial de políticas do Google Ads, implementamos:

✓ Marca própria: nome "Danos Aparentes", logo e identidade visual próprios em todo o site
✓ Descrição clara do negócio: landing explica o que é o serviço, para quem é e como funciona
✓ Informações de contato atualizadas: ${LEGAL_CONTACT_EMAIL}, responsável legal no rodapé
✓ Parcerias e afiliações transparentes: aviso explícito de que NÃO temos vínculo com DETRAN, Denatran ou órgãos governamentais (consulta de placa é via API privada para preenchimento de checklist)
✓ Entrega do serviço: usuários do trial e assinantes acessam o aplicativo descrito no anúncio
✓ Sem impersonação: não usamos nome, logo ou identidade de terceiros para enganar usuários

---

D. O QUE MUDOU RECENTEMENTE (CORREÇÕES APÓS ANÁLISE INTERNA)

Identificamos que alguns textos e botões poderiam ser mal interpretados por revisão automatizada como indução a pagamento ou coleta financeira. Corrigimos:

- Removidos links "Assinar direto" e botões "Assinar agora" da landing e do app
- Landing simplificada: "Criar Conta Grátis" e "7 dias grátis" (sem menções confusas sobre cartão)
- Paywall não redireciona mais para checkout; orienta contato com ${LEGAL_CONTACT_EMAIL}
- Removida mensagem "Atualize seu cartão" da interface
- Reforçado aviso legal sobre consulta de placa (sem vínculo governamental)
- Adicionado e-mail oficial suporte@danosaparentes.com.br em rodapé, suporte e paywall

Confirmado em auditoria do código: não existe input de número de cartão, CVV, validade ou dados bancários em ${SITE_DOMAIN} ou ${SITE_APP_URL}.

---

E. FLUXO ATUAL DO USUÁRIO (SEM PHISHING)

1. Usuário clica no anúncio → ${SITE_LANDING_URL}
2. Lê sobre o produto, preço e trial de 7 dias
3. Clica em "Criar Conta Grátis" → ${SITE_APP_URL}
4. Cadastra-se com e-mail e senha (autenticação do nosso app, não de terceiros)
5. Usa o sistema por 7 dias sem solicitação de cartão no site
6. Após o trial, contato via suporte — sem formulário financeiro na interface

---

F. HISTÓRICO COM GOOGLE ADS

[INFORME AQUI, SE APLICÁVEL:]
• Primeira conta Google Ads / conta existente há X meses
• Anunciamos exclusivamente o software Danos Aparentes para vistoriadores
• Não houve troca de agência / não houve prática de phishing em contas anteriores
• Estamos dispostos a concluir a verificação do anunciante, se solicitado

---

G. PEDIDO DE REATIVAÇÃO

Solicitamos a reativação da conta. O Danos Aparentes é um negócio legítimo, com site transparente, marca própria, contato verificável e correções já aplicadas. Não praticamos phishing nem práticas comerciais enganosas.

Estamos à disposição para verificação adicional ou esclarecimentos.

Atenciosamente,
Jeferson da Silva
Responsável — Danos Aparentes
${LEGAL_CONTACT_EMAIL}
Florianópolis - SC`
