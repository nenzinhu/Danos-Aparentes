import { sha256Hex } from '../pdf/integrityManifest'
import type { SealOnScreenInput, SignatureMeta } from './types'
import { ON_SCREEN_PROVIDER } from './types'

/** Strip data-URL prefix so hash is over raw base64/bytes payload. */
export function signatureImagePayload(dataUrl: string): string {
  const i = dataUrl.indexOf(',')
  return i >= 0 ? dataUrl.slice(i + 1) : dataUrl
}

export async function hashSignatureImage(dataUrl: string): Promise<string> {
  return sha256Hex(signatureImagePayload(dataUrl || ''))
}

/**
 * Seal an on-screen pad capture into immutable metadata.
 * Does not mutate the image; caller keeps imageDataUrl on VehicleInfo.
 */
export async function sealOnScreenSignature(input: SealOnScreenInput): Promise<SignatureMeta> {
  const name = input.signerName.trim()
  if (!name) {
    throw new Error('Informe o nome de quem assina')
  }
  if (!input.imageDataUrl || !input.imageDataUrl.startsWith('data:image')) {
    throw new Error('Assinatura na tela inválida ou vazia')
  }

  const contentHash = await hashSignatureImage(input.imageDataUrl)
  const userAgent =
    input.userAgent ??
    (typeof navigator !== 'undefined' ? navigator.userAgent : undefined)

  return {
    providerId: ON_SCREEN_PROVIDER.id,
    role: input.role,
    signerName: name,
    signerDocument: input.signerDocument?.trim() || undefined,
    capturedAt: input.capturedAt ?? Date.now(),
    userAgent,
    sessionId: input.sessionId,
    contentHash,
    documentHash: input.documentHash,
  }
}
