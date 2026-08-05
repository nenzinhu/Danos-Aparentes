/**
 * FASE 7 — Modular signature architecture.
 * On-screen drawing is the first provider; external / advanced providers can plug in later.
 * Does NOT claim legal validity or qualified-signature equivalence.
 */

export type SignatureProviderId = 'on_screen' | (string & {})

export type SignatureRole = 'inspector' | 'client'

/** Frozen metadata recorded when a signature is sealed (image itself stays on VehicleInfo). */
export type SignatureMeta = {
  providerId: SignatureProviderId
  role: SignatureRole
  signerName: string
  signerDocument?: string
  capturedAt: number
  userAgent?: string
  sessionId?: string
  /** SHA-256 hex of the signature image payload. */
  contentHash: string
  /** Optional hash of the document/content being signed (when known at capture time). */
  documentHash?: string
}

export type SealOnScreenInput = {
  role: SignatureRole
  imageDataUrl: string
  signerName: string
  signerDocument?: string
  sessionId?: string
  documentHash?: string
  /** Injected for tests; defaults to browser navigator.userAgent. */
  userAgent?: string
  capturedAt?: number
}

export interface SignatureProvider {
  id: SignatureProviderId
  label: string
  /** True when the provider opens an external flow (DocuSign-like). */
  supportsExternalFlow: boolean
}

export const ON_SCREEN_PROVIDER: SignatureProvider = {
  id: 'on_screen',
  label: 'Assinatura na tela',
  supportsExternalFlow: false,
}

/** Registry — add future providers here without rewriting FinalizePanel. */
export const SIGNATURE_PROVIDERS: readonly SignatureProvider[] = [ON_SCREEN_PROVIDER]

export function getSignatureProvider(id: SignatureProviderId): SignatureProvider | undefined {
  return SIGNATURE_PROVIDERS.find((p) => p.id === id)
}
