import { Damage, VehicleInfo } from '../../types'
import { supabase, supabaseEnabled } from '../supabase'

/** QR Code via vendor script já presente no projeto */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    await new Promise<void>((resolve) => {
      if ((window as any).QRCode) { resolve(); return }
      const s = document.createElement('script')
      s.src = '/vendor/qrcode.min.js'
      s.onload = () => resolve()
      s.onerror = () => resolve()
      document.head.appendChild(s)
    })
    if (!(window as any).QRCode) return ''
    return await new Promise<string>((resolve) => {
      const wrap = document.createElement('div')
      wrap.style.cssText = 'position:absolute;left:-9999px;visibility:hidden;'
      document.body.appendChild(wrap)
      new (window as any).QRCode(wrap, {
        text,
        width: 96, height: 96,
        colorDark: '#141413', colorLight: '#ffffff',
        correctLevel: (window as any).QRCode?.CorrectLevel?.M ?? 0,
      })
      setTimeout(() => {
        const canvas = wrap.querySelector('canvas') as HTMLCanvasElement | null
        const url = canvas?.toDataURL('image/png') ?? ''
        document.body.removeChild(wrap)
        resolve(url)
      }, 300)
    })
  } catch { return '' }
}

/**
 * Hash de integridade (SHA-256, primeiros 32 hex).
 * Cobre todo o conteúdo do laudo — qualquer alteração depois de emitido
 * muda o hash e derruba a verificação no /verify.
 */
export async function computeHash(info: VehicleInfo, damages: Damage[], ts: number): Promise<string> {
  try {
    const geo = info.geo ? { lat: info.geo.lat, lng: info.geo.lng } : null
    const payload = JSON.stringify({
      ts,
      geo,
      info: {
        owner: info.owner, phone: info.phone, brand: info.brand, plate: info.plate,
        generalNotes: info.generalNotes,
        interiorNotes: info.interiorNotes, interiorPhotos: info.interiorPhotos, interiorPhotoNotes: info.interiorPhotoNotes,
        profile: info.profile, ref: info.ref,
        color: info.color, vehicleTypeDesc: info.vehicleTypeDesc, city: info.city, state: info.state,
        cpf: info.cpf, cnh: info.cnh, cnhCategory: info.cnhCategory,
        inspectorSignature: info.inspectorSignature, clientSignature: info.clientSignature,
        customFields: info.customFields,
      },
      damages: damages.map(d => ({
        vehicle: d.vehicle, view: d.view, partId: d.partId, partName: d.partName,
        type: d.type, typeName: d.typeName, severity: d.severity, notes: d.notes,
        photos: d.photos, photoNotes: d.photoNotes,
      })),
    })
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload))
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    return hex.slice(0, 32).toUpperCase()
  } catch { return 'N/D' }
}

/** Registra o hash no Supabase para a página /verify conferir depois */
export async function registerHash(hash: string, info: VehicleInfo, damages: Damage[], date: string, companyName?: string) {
  if (!supabaseEnabled || !supabase || hash === 'N/D') return
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    await supabase.from('report_hashes').insert({
      hash, user_id: session.user.id, plate: info.plate || '',
      ref: info.ref || '', issued_at: date, damages_count: damages.length,
      geo_lat: info.geo?.lat ?? null,
      geo_lng: info.geo?.lng ?? null,
      geo_accuracy: info.geo?.accuracy ?? null,
      geo_address: info.geo?.address ?? null,
      company_name: companyName || '',
    })
  } catch { /* best-effort — não bloqueia a geração do PDF */ }
}
