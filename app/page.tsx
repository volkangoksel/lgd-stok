"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    // ANA ADRESE (domain.com) GİRİLDİĞİNDE KALOGA YÖNLENDİR
    // ADMIN'E GİTTİĞİNDE GİRİŞ KONTROLÜ admin/page.tsx'de
    if (window.location.pathname === '/') {
      router.push('/katalog')
    }
  }, [router])

  return null // Boş component, sadece yönlendirme yapsın yeter
}