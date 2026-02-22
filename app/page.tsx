"use client"
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // SADECE alanadi.com/ yazınca çalışır. /admin yazınca çalışmaz.
    if (pathname === '/') {
      router.push('/katalog')
    }
  }, [pathname, router])

  return null
}