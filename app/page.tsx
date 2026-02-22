"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    // Sadece ana domaindeysen kataloğa atar
    if (window.location.pathname === '/') {
      router.push('/katalog')
    }
  }, [router])

  return null
}