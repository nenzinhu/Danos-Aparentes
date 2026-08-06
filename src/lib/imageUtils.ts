export const LOCAL_PHOTO_MAX_WIDTH = 1600
export const LOCAL_PHOTO_QUALITY = 0.88

/**
 * Upload para Supabase Storage: qualidade alta (evidência).
 * Bytes ficam no Storage (não no Postgres). Limite evita só arquivos absurdos.
 */
export const STORAGE_PHOTO_MAX_WIDTH = 2048
export const STORAGE_PHOTO_QUALITY = 0.9
export const STORAGE_PHOTO_MAX_BYTES = 2_500_000

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return res.blob()
}

function drawBlobToCanvas(blob: Blob, maxWidth: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(blob)
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (result) => {
          if (result) resolve(result)
          else reject(new Error('Canvas toBlob failed'))
        },
        'image/jpeg',
        quality,
      )
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(img.src)
      reject(err)
    }
  })
}

export function compressImage(
  file: File,
  maxWidth = LOCAL_PHOTO_MAX_WIDTH,
  quality = LOCAL_PHOTO_QUALITY,
): Promise<Blob> {
  return drawBlobToCanvas(file, maxWidth, quality)
}

export function compressBlob(
  blob: Blob,
  maxWidth = STORAGE_PHOTO_MAX_WIDTH,
  quality = STORAGE_PHOTO_QUALITY,
): Promise<Blob> {
  return drawBlobToCanvas(blob, maxWidth, quality)
}

/**
 * Preserva qualidade: só reduz levemente se passar do teto de bytes.
 * Não desce para 640px / qualidade baixa (evidência veicular).
 */
export async function compressBlobForStorage(blob: Blob): Promise<Blob> {
  const attempts: Array<[number, number]> = [
    [STORAGE_PHOTO_MAX_WIDTH, STORAGE_PHOTO_QUALITY],
    [1920, 0.88],
    [1600, 0.85],
  ]

  let best = blob
  for (const [width, quality] of attempts) {
    best = await compressBlob(blob, width, quality)
    if (best.size <= STORAGE_PHOTO_MAX_BYTES) return best
  }
  return best
}
