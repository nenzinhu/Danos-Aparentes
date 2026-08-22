'use client';
import { useEffect, useState } from 'react'
import {
  PhotoUploadProgressState,
  subscribePhotoUploadProgress,
} from '../lib/photoUploadProgress'

export function usePhotoUploadProgress(): PhotoUploadProgressState {
  const [progress, setProgress] = useState<PhotoUploadProgressState>(() => ({
    active: false,
    phase: 'idle',
    current: 0,
    total: 0,
    label: '',
  }))

  useEffect(() => subscribePhotoUploadProgress(setProgress), [])

  return progress
}
