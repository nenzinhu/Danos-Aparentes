import type { Metadata } from 'next'
import Image from 'next/image'
import MaintenanceMotion from '@/src/components/MaintenanceMotion'
import styles from './maintenance.module.css'

export const metadata: Metadata = {
  title: 'Atualização em andamento | Danos Aparentes',
  description:
    'A Danos Aparentes está preparando uma nova geração de soluções para inteligência histórica veicular.',
  robots: { index: false, follow: false },
}

const telemetry = [
  { label: 'Experiência', value: 'Evoluindo' },
  { label: 'Tecnologia', value: 'Inovando' },
  { label: 'Plataforma', value: 'Preparando' },
]

export default function HomePage() {
  return (
    <MaintenanceMotion>
      <main className={styles.shell} data-maintenance-shell>
        <div className={styles.ambient} aria-hidden="true">
          <span className={`${styles.orb} ${styles.orbPrimary}`} data-orb="primary" />
          <span className={`${styles.orb} ${styles.orbSignal}`} data-orb="signal" />
          <span className={styles.grid} />
          <span className={styles.scanline} data-scanline />
        </div>

        <div className={styles.frame} aria-hidden="true">
          <span className={`${styles.corner} ${styles.cornerTopLeft}`} />
          <span className={`${styles.corner} ${styles.cornerTopRight}`} />
          <span className={`${styles.corner} ${styles.cornerBottomLeft}`} />
          <span className={`${styles.corner} ${styles.cornerBottomRight}`} />
        </div>

        <header className={styles.header} data-reveal>
          <Image
            src="/brand/logo-full-dark.svg"
            width={224}
            height={54}
            alt="Danos Aparentes"
            priority
            className={styles.logo}
          />
          <span className={styles.headerCode}>DA / NEXT 01</span>
        </header>

        <section className={styles.content} aria-labelledby="maintenance-title">
          <div className={styles.eyebrow} data-reveal>
            <span className={styles.statusDot} aria-hidden="true" />
            Evolução em andamento
          </div>

          <h1 id="maintenance-title" className={styles.title}>
            <span className={styles.titleMuted} data-title-line>Aguarde</span>
            <span className={styles.titleAccent} data-title-line>atualização</span>
          </h1>

          <p className={styles.lead} data-reveal>
            Implementações inovadoras estão chegando.
          </p>
          <p className={styles.description} data-reveal>
            Estamos redesenhando cada detalhe para entregar uma experiência mais inteligente,
            precisa e surpreendente para o futuro da inteligência histórica veicular.
          </p>

          <div className={styles.telemetry} data-reveal aria-label="Status da atualização">
            {telemetry.map((item, index) => (
              <div className={styles.telemetryItem} key={item.label}>
                <span className={styles.telemetryIndex}>0{index + 1}</span>
                <span className={styles.telemetryLabel}>{item.label}</span>
                <span className={styles.telemetryValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className={styles.footer} data-reveal>
          <span>Danos Aparentes</span>
          <span className={styles.footerLine} aria-hidden="true" />
          <span>Inteligência histórica veicular</span>
        </footer>
      </main>
    </MaintenanceMotion>
  )
}
