let audioCtx: AudioContext | null = null

/** Beep curto (sem asset) confirmando uma ação, tipo registro de avaria. */
export function playConfirmBeep() {
  if (typeof window === 'undefined') return
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    if (!audioCtx) audioCtx = new Ctx()
    const ctx = audioCtx
    if (ctx.state === 'suspended') void ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)
  } catch { /* best-effort — silencioso se áudio não estiver disponível */ }
}

/** Vibração curta em dispositivos móveis compatíveis. */
export function vibrateConfirm() {
  if (typeof window === 'undefined') return
  try {
    navigator.vibrate?.(40)
  } catch { /* best-effort */ }
}

/** Dispara feedback sonoro + tátil juntos ao registrar uma avaria. */
export function playDamageAddedFeedback() {
  playConfirmBeep()
  vibrateConfirm()
}
