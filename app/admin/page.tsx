"use client"
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inventory, setInventory] = useState<any[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false) 
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
      } else {
        setAuthorized(true)
        fetchInventory()
      }
    }
    checkUser()
  }, [router])

  const fetchInventory = async () => {
    const { data } = await supabase.from('diamonds').select('*').order('priority', { ascending: false })
    if (data) setInventory(data)
  }

  // Arama filtresi
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [inventory, searchTerm])

  if (!authorized) return <div>Loading Admin Guard...</div>

return (
  <div className="...">
    <h1 className="text-[100px] text-red-600 font-black">ADMIN PANEL V2.1</h1> 
    {/* ... diğer kodlar */}

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'} min-h-screen font-sans transition-colors duration-500 text-left`}>
      <header className="sticky top-0 z-[100] backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-black/5">
        <div className="max-w-[1024px] mx-auto h-12 flex items-center justify-between px-6">
          <img src="/logo.png" className="h-5 object-contain" />
          <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest opacity-80">
            <span className="text-blue-600">Inventory Dashboard</span>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/admin/login'))} className="text-red-500 text-[10px] font-black uppercase">Logout</button>
        </div>
      </header>

      <main className="max-w-[1024px] mx-auto p-6 pt-12">
        <h1 className="text-4xl font-black tracking-tight mb-8 italic uppercase">Inventory Manager</h1>
        
        {/* Arama Kutusu */}
        <div className="mb-10 max-w-sm">
            <input 
                className="w-full bg-white dark:bg-[#1c1c1e] p-4 rounded-2xl shadow-sm border border-black/5 outline-none text-xs font-bold"
                placeholder="Find a stone by SKU..." 
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafa] dark:bg-black/20 text-[9px] font-black opacity-30 uppercase tracking-[0.2em] border-b border-black/5">
                <th className="p-6">Stone ID</th>
                <th className="p-6">Carat</th>
                <th className="p-6">Price</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs font-bold uppercase">
              {filteredInventory.map((stone) => (
                <tr key={stone.id} className="hover:bg-[#f5f5f7] transition-colors">
                  <td className="p-6 italic">{stone.sku}</td>
                  <td className="p-6">{stone.carat} CT</td>
                  <td className="p-6 text-blue-600">${stone.total_amount}</td>
                  <td className="p-6 text-right">
                    <button onClick={() => supabase.from('diamonds').delete().eq('id', stone.id).then(fetchInventory)} className="text-red-500">Delete</button>
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