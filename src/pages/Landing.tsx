import Logo from '../components/Logo'
import VehicleDefs from '../components/vehicles/VehicleDefs'
import CarLateralLeft from '../components/vehicles/CarLateralLeft'

const noop = () => {}

const FEATURES = [
  { icon: '🚗', title: 'Mapa 3D do veículo', desc: 'Marque avarias direto no modelo, com rotação 3D entre as 4 vistas.' },
  { icon: '📷', title: 'Fotos anexadas', tag: 'NOVO', desc: 'Anexe uma ou mais fotos de cada avaria, direto da câmera ou galeria.' },
  { icon: '📄', title: 'Laudo em PDF', desc: 'Relatório pericial completo com fotos, hash e QR Code de verificação.' },
  { icon: '📡', title: 'Funciona offline', desc: 'Sincroniza automaticamente quando a conexão voltar.' },
]

const STEPS = [
  'Selecione o tipo e a vista do veículo',
  'Marque as avarias direto no modelo 3D (com foto, se quiser)',
  'Revise a lista de avarias e gere o laudo',
  'Exporte em PDF, compartilhe por WhatsApp ou link',
]

const sectionStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 1100,
  margin: '0 auto',
  padding: '64px 20px',
}

const ctaButton: React.CSSProperties = {
  background: '#00aaff',
  color: '#02101e',
  fontWeight: 800,
  fontSize: '0.95rem',
  padding: '13px 28px',
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'Outfit,sans-serif',
  textDecoration: 'none',
  display: 'inline-block',
}

const ctaSecondary: React.CSSProperties = {
  border: '1px solid rgba(0,170,255,0.4)',
  color: '#00aaff',
  fontWeight: 700,
  fontSize: '0.95rem',
  padding: '13px 28px',
  borderRadius: 10,
  background: 'transparent',
  cursor: 'pointer',
  fontFamily: 'Outfit,sans-serif',
  textDecoration: 'none',
  display: 'inline-block',
}

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', color: 'var(--text-main)', fontFamily: 'Outfit,sans-serif', overflowX: 'hidden' }}>
      <VehicleDefs />

      {/* Hero — full-bleed com veículo 3D de fundo */}
      <section style={{ position: 'relative', padding: '28px 20px 90px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)',
          width: 'min(900px, 140vw)', opacity: 0.16, pointerEvents: 'none',
        }}>
          <CarLateralLeft damages={[]} selectedPartId={null} onPartClick={noop} onPartHover={noop} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60 }}>
            <Logo size={34} />
            <div style={{ display: 'flex', gap: 10 }}>
              <a href="/app.html" style={{ ...ctaSecondary, padding: '8px 18px', fontSize: '0.82rem' }}>Entrar</a>
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: '40px 0' }}>
            <div style={{
              display: 'inline-block', background: 'rgba(0,170,255,0.12)', border: '1px solid rgba(0,170,255,0.3)',
              color: '#00d4ff', fontSize: '0.7rem', fontWeight: 700, padding: '5px 14px', borderRadius: 20, marginBottom: 18,
            }}>
              NOVO: SINCRONIZAÇÃO EM NUVEM
            </div>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
              Cada avaria, <span style={{ color: '#00aaff' }}>registrada e provada</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: 30 }}>
              Inspeção visual completa com PDF pericial, hash de integridade e QR Code de verificação. Para oficinas, seguradoras e locadoras.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="/app.html" style={ctaButton}>Criar conta grátis</a>
              <a href="/app.html" style={ctaSecondary}>Entrar</a>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades — grid de 4 cards */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, marginBottom: 40 }}>
          Tudo o que você precisa pra uma vistoria <span style={{ color: '#00aaff' }}>profissional</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14,
              padding: 22, backdropFilter: 'blur(12px)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: 'rgba(0,170,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14,
              }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                {f.title}
                {f.tag && <span style={{ background: '#00aaff', color: '#02101e', fontSize: '0.62rem', fontWeight: 800, padding: '2px 7px', borderRadius: 6 }}>{f.tag}</span>}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona — passo a passo */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, marginBottom: 40 }}>
          Como <span style={{ color: '#00aaff' }}>funciona</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ textAlign: 'center', padding: '0 12px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,170,255,0.12)',
                border: '1px solid rgba(0,170,255,0.3)', color: '#00aaff', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.1rem',
              }}>{i + 1}</div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section style={{ ...sectionStyle, textAlign: 'center', paddingBottom: 100 }}>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 14 }}>
          Comece a vistoriar com precisão hoje
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
          Grátis para começar. Sem cartão de crédito.
        </p>
        <a href="/app.html" style={ctaButton}>Criar conta grátis</a>
      </section>

      <footer style={{ textAlign: 'center', padding: '24px 20px', color: 'var(--text-muted)', fontSize: '0.78rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        © {new Date().getFullYear()} Danos Aparentes — App de Inspeção e Registro
      </footer>
    </div>
  )
}
