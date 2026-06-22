'use client';
import CopyableTextBlock from './CopyableTextBlock'
import { GOOGLE_ADS_APPEAL_TEXT, GOOGLE_ADS_APPEAL_TITLE } from '../content/googleAdsAppeal'

export default function GoogleAdsAppealBlock() {
  return (
    <CopyableTextBlock
      title={GOOGLE_ADS_APPEAL_TITLE}
      description="Texto pronto para colar na solicitação de revisão do Google Ads."
      text={GOOGLE_ADS_APPEAL_TEXT}
    />
  )
}
