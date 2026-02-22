"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert("Error: " + error.message)
      setLoading(false)
    } else {
      router.push('/admin') // Başarılı girişte ADMİN'E GİDER
    }
  }

  return (
    <div className="h-screen bg-[#F5F5F7] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-white p-12 rounded-[2.5rem] shadow-2xl text-center border border-black/[0.03]">
        <img src="/logo.png" alt="GLI" className="w-24 mx-auto mb-10 object-contain" />
        <h1 className="text-xl font-black uppercase italic tracking-tighter mb-8 text-slate-800">Admin Access</h1>
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <input type="email" placeholder="Email Address" required className="w-full p-4 rounded-2xl border border-slate-200 bg-[#F5F5F7] outline-none text-center font-medium" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="w-full p-4 rounded-2xl border border-slate-200 bg-[#F5F5F7] outline-none text-center font-bold" onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
            {loading ? "VERIFYING..." : "UNLOCK INVENTORY"}
          </button>
        </form>
      </div>
    </div>
  )
}