"use client";
import Demo from '@/src/views/Demo'
import { DirectionalTransition } from '../DirectionalTransition'

export default function DemoPage() {
  return (
    <DirectionalTransition>
      <Demo />
    </DirectionalTransition>
  )
}
