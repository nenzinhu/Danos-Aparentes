import { Damage, VehicleInfo } from '../types'

const VIEW_LABEL: Record<string, string> = {
  'lateral-left': 'Lat. Esq.', 'lateral-right': 'Lat. Dir.', frontal: 'Frontal', traseira: 'Traseira'
}
const SEV_LABEL: Record<string, string> = { low: 'Leve', medium: 'Média', high: 'Grave' }

export function formatReport(info: VehicleInfo, damages: Damage[]): string {
  const date = new Date().toLocaleString('pt-BR')
  let txt = `RELATÓRIO DE VISTORIA VEICULAR\n${date}\n━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  txt += `Proprietário: ${info.owner || 'N/I'}\n`
  txt += `Telefone: ${info.phone || 'N/I'}\n`
  txt += `Veículo: ${info.brand || 'N/I'}\n`
  txt += `Placa: ${info.plate || 'N/I'}\n`
  if (info.customFields?.length) {
    info.customFields.forEach(f => { if (f.value) txt += `${f.label}: ${f.value}\n` })
  }
  if (info.generalNotes) txt += `Obs.: ${info.generalNotes}\n`
  txt += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  if (damages.length === 0) {
    txt += `Nenhuma avaria registrada.\n`
  } else {
    txt += `AVARIAS (${damages.length}):\n\n`
    damages.forEach((d, i) => {
      txt += `${i + 1}. ${d.partName} [${VIEW_LABEL[d.view] || d.view}]\n`
      txt += `   Tipo: ${d.typeName} | Grau: ${SEV_LABEL[d.severity]}\n`
      if (d.notes) txt += `   Obs: ${d.notes}\n`
      txt += '\n'
    })
  }
  txt += `━━━━━━━━━━━━━━━━━━━━━━━━━\nGerado por Danos Aparentes`
  return txt
}

export function copyReport(info: VehicleInfo, damages: Damage[]): Promise<void> {
  return navigator.clipboard.writeText(formatReport(info, damages))
}

export function downloadTxt(info: VehicleInfo, damages: Damage[]) {
  const blob = new Blob([formatReport(info, damages)], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vistoria-${info.plate || 'sem-placa'}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export function sendWhatsApp(info: VehicleInfo, damages: Damage[]) {
  const phone = info.phone.replace(/\D/g, '')
  const text = encodeURIComponent(formatReport(info, damages))
  const url = phone ? `https://wa.me/55${phone}?text=${text}` : `https://wa.me/?text=${text}`
  window.open(url, '_blank')
}
