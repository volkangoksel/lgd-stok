"use client"
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LayoutGrid, List, Plus, Trash2, Search } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [inventory, setInventory] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
      } else {
        setAuthorized(true)
        const { data } = await supabase.from('diamonds').select('*').order('created_at', { ascending: false })
        if (data) setInventory(data)
      }
    }
    checkUser()
  }, [router])

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [inventory, searchTerm])

  if (!authorized) return <div className="h-screen bg-[#F5F5F7] flex items-center justify-center font-black opacity-10 uppercase tracking-[0.5em]">Auth...</div>

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased text-left">
      <header className="fixed top-0 w-full h-12 bg-white/80 backdrop-blur-md border-b border-black/5 z-[100] flex items-center">
        <div className="max-w-[1000px] mx-auto w-full px-6 flex justify-between items-center">
          <img src="/logo.png" className="h-4 object-contain" alt="Logo" />
          <nav className="flex gap-6 text-[10px] font-black uppercase tracking-widest opacity-30">
            <span className="text-black opacity-100">Inventory</span>
          </nav>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} className="text-red-500 text-[10px] font-black uppercase">Logout</button>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto pt-24 px-6 pb-20">
        <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-10">Manager.</h1>
        <input 
          className="w-full max-w-sm mb-10 bg-white border border-slate-200 p-4 rounded-2xl text-xs font-bold outline-none shadow-sm" 
          placeholder="Find SKU..." 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />

        <div className="bg-white rounded-[3rem] shadow-sm border border-black/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] text-[9px] font-black opacity-30 uppercase border-b">
                <th className="p-7">SKU ID</th>
                <th className="p-7">Price</th>
                <th className="p-7 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] text-sm font-bold uppercase">
              {filteredInventory.map(stone => (
                <tr key={stone.id} className="hover:bg-[#F5F5F7] transition-colors group">
                  <td className="p-7 italic">{stone.sku}</td>
                  <td className="p-7 text-blue-600">${stone.total_amount}</td>
                  <td className="p-7 text-right">
                    <button onClick={async () => { await supabase.from('diamonds').delete().eq('id', stone.id); window.location.reload(); }} className="text-red-500">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}