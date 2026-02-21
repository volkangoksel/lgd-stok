"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else router.push('/admin')
  }

  return (
    <div className="h-screen bg-[#F5F5F7] flex items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm bg-white p-12 rounded-[2.5rem] shadow-2xl">
        <h1 className="text-xl font-black uppercase italic mb-8">Admin Access</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full p-4 rounded-2xl border bg-[#F5F5F7]" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full p-4 rounded-2xl border bg-[#F5F5F7]" onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase">Login</button>
        </form>
      </div>
    </div>
  )
}