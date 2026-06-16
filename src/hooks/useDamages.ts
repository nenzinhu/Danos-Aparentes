import { useState, useEffect } from 'react'
import { Damage } from '../types'
import { db } from '../lib/db'

export function useDamages() {
  const [damages, setDamages] = useState<Damage[]>([])

  useEffect(() => {
    db.getAllDamages().then(setDamages)
  }, [])

  async function addDamage(d: Damage) {
    await db.putDamage(d)
    setDamages(prev => [...prev, d])
  }

  async function removeDamage(id: string) {
    await db.deleteDamage(id)
    setDamages(prev => prev.filter(d => d.id !== id))
  }

  async function updateDamage(id: string, patch: Partial<Damage>) {
    setDamages(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, ...patch } : d)
      const target = updated.find(d => d.id === id)
      if (target) db.putDamage(target)
      return updated
    })
  }

  async function clearDamages() {
    await db.clearDamages()
    setDamages([])
  }

  return { damages, addDamage, removeDamage, updateDamage, clearDamages }
}
