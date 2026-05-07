'use client'

import { useEffect } from 'react'

export default function IosZoomFix() {
  useEffect(() => {
    const handleBlur = () => {
      const viewport = document.querySelector('meta[name=viewport]')
      if (!viewport) return
      const original = viewport.getAttribute('content') || ''
      viewport.setAttribute('content', original + ',maximum-scale=1.0')
      setTimeout(() => viewport.setAttribute('content', original), 300)
    }
    document.addEventListener('blur', handleBlur, true)
    return () => document.removeEventListener('blur', handleBlur, true)
  }, [])

  return null
}
