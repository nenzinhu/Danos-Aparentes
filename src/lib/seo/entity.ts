/**
 * Entidades canônicas do Knowledge Graph / GEO.
 * Fonte única para Organization, Person e WebSite — usada no layout
 * site-wide e referenciada por BlogPosting / SoftwareApplication via @id.
 */
import { LEGAL_CNPJ, LEGAL_COMPANY_NAME, LEGAL_CONTACT_EMAIL } from '@/src/components/LegalContent'
import { WHATSAPP_PHONE } from '@/src/lib/whatsapp'

export const SITE_URL = 'https://danosaparentes.com.br'

export const ORG_ID = `${SITE_URL}/#organization`
export const PERSON_ID = `${SITE_URL}/#/schema/person/jeferson`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const SOFTWARE_ID = `${SITE_URL}/#software`

export const FOUNDER_NAME = 'Jeferson da Silva'
export const FOUNDER_JOB_TITLE = 'Fundador'
export const FOUNDER_LINKEDIN = 'https://www.linkedin.com/in/jeferson-da-silva-732316420/'
export const COMPANY_LINKEDIN = 'https://www.linkedin.com/company/135247961/'

export const NAP = {
  locality: 'Florianópolis',
  region: 'SC',
  country: 'BR',
  email: LEGAL_CONTACT_EMAIL,
  telephone: `+${WHATSAPP_PHONE}`,
  telephoneDisplay: '(48) 99203-2348',
} as const

const postalAddress = {
  '@type': 'PostalAddress' as const,
  addressLocality: NAP.locality,
  addressRegion: NAP.region,
  addressCountry: NAP.country,
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  name: LEGAL_COMPANY_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo-full.png`,
  },
  description:
    'Plataforma de vistoria digital de avarias veiculares: marque os danos no diagrama do veículo, anexe fotos e gere laudos em PDF com QR Code de verificação.',
  email: NAP.email,
  taxID: LEGAL_CNPJ,
  address: postalAddress,
  founder: {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: FOUNDER_NAME,
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: NAP.email,
    telephone: NAP.telephone,
    availableLanguage: ['Portuguese'],
    areaServed: 'BR',
  },
  sameAs: [COMPANY_LINKEDIN],
}

export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': PERSON_ID,
  name: FOUNDER_NAME,
  jobTitle: FOUNDER_JOB_TITLE,
  description:
    'Fundador do Danos Aparentes. Desenvolve a plataforma de vistoria digital de avarias veiculares em Florianópolis/SC.',
  url: `${SITE_URL}/sobre`,
  worksFor: { '@id': ORG_ID },
  address: postalAddress,
  sameAs: [FOUNDER_LINKEDIN],
}

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: LEGAL_COMPANY_NAME,
  url: SITE_URL,
  inLanguage: 'pt-BR',
  publisher: { '@id': ORG_ID },
}

/** Author block reutilizável em BlogPosting (mesmo @id do Person site-wide). */
export const blogAuthorJsonLd = {
  '@type': 'Person' as const,
  '@id': PERSON_ID,
  name: FOUNDER_NAME,
  jobTitle: FOUNDER_JOB_TITLE,
  url: `${SITE_URL}/sobre`,
  worksFor: { '@id': ORG_ID },
  sameAs: [FOUNDER_LINKEDIN],
}
