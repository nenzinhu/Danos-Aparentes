// Avisa o Bing IndexNow (também usado por Yahoo/MSN, que compartilham o
// índice do Bing) que as URLs do sitemap podem ter mudado, pra indexação
// rápida sem esperar o rastreamento orgânico.
//
// Rode manualmente depois de cada deploy de produção que publica conteúdo
// novo: `npm run indexnow`. Não há CI/CD nem CMS neste projeto — o blog é
// editado direto no código e o deploy é manual — então não existe um gancho
// automático de "publicação" pra disparar isso sozinho.

const SITE_URL = 'https://danosaparentes.com.br'
const INDEXNOW_KEY = 'da454fa0f0b8bb1eebe6044a61071250'

async function main() {
  const sitemapRes = await fetch(`${SITE_URL}/sitemap.xml`)
  if (!sitemapRes.ok) {
    throw new Error(`Falha ao buscar sitemap.xml: ${sitemapRes.status}`)
  }
  const xml = await sitemapRes.text()
  const urlList = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])

  if (urlList.length === 0) {
    throw new Error('Nenhuma URL encontrada no sitemap.xml')
  }

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  })

  if (!res.ok && res.status !== 202) {
    const body = await res.text().catch(() => '')
    throw new Error(`IndexNow respondeu ${res.status}: ${body}`)
  }

  console.log(`✅ IndexNow: ${urlList.length} URLs enviadas ao Bing (status ${res.status}).`)
}

main().catch(err => {
  console.error('❌ Falha ao notificar IndexNow:', err.message)
  process.exit(1)
})
