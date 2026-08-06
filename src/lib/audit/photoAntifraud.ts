/**
 * FASE 20 — Antifraude de evidências fotográficas.
 *
 * Funções puras (sem DOM/rede) para:
 * - average hash (aHash) 8×8
 * - distância de Hamming
 * - reuso exato (SHA-256) e perceptual
 * - inconsistência de GPS / horário
 *
 * Alertas alimentam a trilha de auditoria e o selo de confiabilidade.
 * Não bloqueiam emissão no piloto.
 */

export const PERCEPTUAL_MATCH_MAX_DISTANCE = 5
/** Distância máxima (km) entre GPS da foto e GPS da vistoria. */
export const GPS_MAX_DISTANCE_KM = 5
/** Foto pode estar até 7 dias antes/depois da janela da vistoria. */
export const TIME_MAX_SKEW_MS = 7 * 24 * 60 * 60 * 1000

export type PhotoFingerprint = {
  id: string
  sha256: string
  perceptualHash?: string | null
  inspectionId?: string | null
  capturedAt?: number | null
  gps?: { lat: number; lng: number } | null
}

export type ReuseMatch = {
  kind: 'exact' | 'perceptual'
  candidateId: string
  candidateInspectionId: string | null
  distance?: number
}

export type ContextAlert = {
  kind: 'gps_mismatch' | 'time_mismatch'
  detail: string
}

export type AntifraudFinding = {
  photoId: string
  reuses: ReuseMatch[]
  context: ContextAlert[]
}

/** Empacota 64 bits (MSB first) em hex de 16 caracteres. */
export function bitsToHex64(bits: boolean[]): string {
  if (bits.length !== 64) throw new Error('bitsToHex64 expects 64 bits')
  let n = 0n
  for (let i = 0; i < 64; i++) {
    if (bits[i]) n |= 1n << BigInt(63 - i)
  }
  return n.toString(16).padStart(16, '0')
}

/**
 * Average hash 8×8 a partir de 64 amostras de luminância (0–255).
 * Bit = 1 quando o pixel é ≥ média (clássico aHash).
 */
export function averageHashFromGray8x8(gray64: number[]): string {
  if (gray64.length !== 64) throw new Error('averageHashFromGray8x8 expects 64 samples')
  const avg = gray64.reduce((s, v) => s + v, 0) / 64
  const bits = gray64.map((v) => v >= avg)
  return bitsToHex64(bits)
}

/**
 * Reduz uma imagem em escala de cinza (row-major) para 8×8 por média de blocos.
 */
export function downsampleToGray8x8(
  pixels: number[],
  width: number,
  height: number,
): number[] {
  if (width < 1 || height < 1 || pixels.length < width * height) {
    throw new Error('invalid grayscale buffer')
  }
  const out: number[] = []
  for (let by = 0; by < 8; by++) {
    for (let bx = 0; bx < 8; bx++) {
      const x0 = Math.floor((bx * width) / 8)
      const x1 = Math.floor(((bx + 1) * width) / 8)
      const y0 = Math.floor((by * height) / 8)
      const y1 = Math.floor(((by + 1) * height) / 8)
      let sum = 0
      let count = 0
      for (let y = y0; y < Math.max(y1, y0 + 1); y++) {
        for (let x = x0; x < Math.max(x1, x0 + 1); x++) {
          sum += pixels[y * width + x] ?? 0
          count++
        }
      }
      out.push(count > 0 ? sum / count : 0)
    }
  }
  return out
}

export function hammingDistanceHex(a: string, b: string): number {
  const aa = a.toLowerCase().replace(/^0x/, '')
  const bb = b.toLowerCase().replace(/^0x/, '')
  if (aa.length !== bb.length || !/^[0-9a-f]+$/.test(aa) || !/^[0-9a-f]+$/.test(bb)) {
    return Number.POSITIVE_INFINITY
  }
  const x = BigInt(`0x${aa}`) ^ BigInt(`0x${bb}`)
  let n = x
  let count = 0
  while (n > 0n) {
    count += Number(n & 1n)
    n >>= 1n
  }
  return count
}

export function isPerceptualMatch(
  a: string,
  b: string,
  maxDistance = PERCEPTUAL_MATCH_MAX_DISTANCE,
): boolean {
  return hammingDistanceHex(a, b) <= maxDistance
}

/** Distância haversine em km. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Procura reuso em candidatos de outras vistorias.
 * Ignora o próprio registro e a mesma inspeção.
 */
export function findReuseMatches(
  probe: PhotoFingerprint,
  candidates: PhotoFingerprint[],
  opts?: { maxHamming?: number },
): ReuseMatch[] {
  const maxH = opts?.maxHamming ?? PERCEPTUAL_MATCH_MAX_DISTANCE
  const matches: ReuseMatch[] = []
  for (const c of candidates) {
    if (c.id === probe.id) continue
    if (
      probe.inspectionId
      && c.inspectionId
      && probe.inspectionId === c.inspectionId
    ) {
      continue
    }
    if (c.sha256 && probe.sha256 && c.sha256 === probe.sha256) {
      matches.push({
        kind: 'exact',
        candidateId: c.id,
        candidateInspectionId: c.inspectionId ?? null,
      })
      continue
    }
    if (probe.perceptualHash && c.perceptualHash) {
      const d = hammingDistanceHex(probe.perceptualHash, c.perceptualHash)
      if (d <= maxH) {
        matches.push({
          kind: 'perceptual',
          candidateId: c.id,
          candidateInspectionId: c.inspectionId ?? null,
          distance: d,
        })
      }
    }
  }
  return matches
}

export function checkGpsConsistency(
  photoGps: { lat: number; lng: number } | null | undefined,
  inspectionGps: { lat: number; lng: number } | null | undefined,
  maxKm = GPS_MAX_DISTANCE_KM,
): ContextAlert | null {
  if (!photoGps || !inspectionGps) return null
  if (
    !Number.isFinite(photoGps.lat)
    || !Number.isFinite(photoGps.lng)
    || !Number.isFinite(inspectionGps.lat)
    || !Number.isFinite(inspectionGps.lng)
  ) {
    return null
  }
  const km = haversineKm(photoGps, inspectionGps)
  if (km > maxKm) {
    return {
      kind: 'gps_mismatch',
      detail: `GPS da foto a ${km.toFixed(1)} km do local da vistoria (limite ${maxKm} km)`,
    }
  }
  return null
}

export function checkTimeConsistency(
  photoCapturedAt: number | null | undefined,
  inspectionAnchorAt: number | null | undefined,
  maxSkewMs = TIME_MAX_SKEW_MS,
): ContextAlert | null {
  if (
    photoCapturedAt == null
    || inspectionAnchorAt == null
    || !Number.isFinite(photoCapturedAt)
    || !Number.isFinite(inspectionAnchorAt)
  ) {
    return null
  }
  const delta = Math.abs(photoCapturedAt - inspectionAnchorAt)
  if (delta > maxSkewMs) {
    const days = Math.round(delta / (24 * 60 * 60 * 1000))
    return {
      kind: 'time_mismatch',
      detail: `Horário da foto diverge ~${days} dia(s) do registro da vistoria`,
    }
  }
  return null
}

export function evaluatePhotoAntifraud(args: {
  photo: PhotoFingerprint
  candidates: PhotoFingerprint[]
  inspectionGps?: { lat: number; lng: number } | null
  inspectionAnchorAt?: number | null
}): AntifraudFinding {
  const reuses = findReuseMatches(args.photo, args.candidates)
  const context: ContextAlert[] = []
  const gpsAlert = checkGpsConsistency(args.photo.gps, args.inspectionGps)
  if (gpsAlert) context.push(gpsAlert)
  const timeAlert = checkTimeConsistency(args.photo.capturedAt, args.inspectionAnchorAt)
  if (timeAlert) context.push(timeAlert)
  return { photoId: args.photo.id, reuses, context }
}

/** Agrega findings — true se há qualquer alerta. */
export function hasAntifraudAlerts(findings: AntifraudFinding[]): boolean {
  return findings.some((f) => f.reuses.length > 0 || f.context.length > 0)
}

/**
 * aHash a partir de ImageData-like (RGBA). Best-effort no browser;
 * retorna null se dimensões inválidas.
 */
export function averageHashFromRgba(
  data: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
): string | null {
  if (width < 1 || height < 1 || data.length < width * height * 4) return null
  const gray: number[] = new Array(width * height)
  for (let i = 0, p = 0; i < gray.length; i++, p += 4) {
    // luminância rec. 601
    gray[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]
  }
  return averageHashFromGray8x8(downsampleToGray8x8(gray, width, height))
}

/**
 * Computa aHash de um Blob via canvas (browser). Em Node / sem canvas → null.
 */
export async function computePerceptualHashFromBlob(
  blob: Blob,
): Promise<string | null> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') return null
  try {
    const url = URL.createObjectURL(blob)
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image()
        el.onload = () => resolve(el)
        el.onerror = () => reject(new Error('image load failed'))
        el.src = url
      })
      const canvas = document.createElement('canvas')
      // Desenha já em 32×32 para baratear; downsample final vai a 8×8.
      canvas.width = 32
      canvas.height = 32
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.drawImage(img, 0, 0, 32, 32)
      const imageData = ctx.getImageData(0, 0, 32, 32)
      return averageHashFromRgba(imageData.data, 32, 32)
    } finally {
      URL.revokeObjectURL(url)
    }
  } catch {
    return null
  }
}
