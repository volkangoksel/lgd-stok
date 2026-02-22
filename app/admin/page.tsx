"use client"
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LayoutGrid, List, ChevronDown, Check, Plus, Trash2, Database, BarChart3 } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [inventory, setInventory] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [viewType, setViewType] = useState<'grid' | 'list'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCategory, setSearchCategory] = useState('sku')
  const [summaryType, setSummaryType] = useState('shape')
  const [sortConfig, setSortConfig] = useState({ key: 'priority', direction: 'desc' })

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

  const fetchInventory = async () => {
    const { data } = await supabase.from('diamonds').select('*').order('created_at', { ascending: false })
    if (data) setInventory(data)
  }

  const kpiData = useMemo(() => {
    const counts = inventory.reduce((acc: any, item) => {
      const key = item[summaryType] || 'N/A'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    return Object.entries(counts)
  }, [inventory, summaryType])

  const processedInventory = useMemo(() => {
    let items = inventory.filter(item => 
      String(item[searchCategory] || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    items.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return items
  }, [inventory, searchTerm, searchCategory, sortConfig])

  if (!authorized) return <div className="h-screen bg-[#F5F5F7] flex items-center justify-center font-black opacity-10 tracking-[0.5em] uppercase text-2xl">Authenticating...</div>

  return (
    <div className="flex min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased text-left">
      <aside className="w-80 bg-white border-r border-black/5 sticky top-0 h-screen p-8 flex flex-col gap-10">
        <img src="/logo.png" className="w-32 object-contain self-start" alt="Logo" />
        <div className="flex-1 space-y-10 overflow-y-auto scrollbar-hide">
          <section>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mb-4">Master Stats</p>
            <div className="bg-[#1D1D1F] text-white p-6 rounded-[2rem] shadow-xl">
               <p className="text-[10px] opacity-50 uppercase mb-1">Total Vault</p>
               <p className="text-4xl font-black italic">{inventory.length}</p>
            </div>
          </section>
          <section>
            <div className="flex justify-between items-center mb-4">
               <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Analytics</p>
               <select onChange={(e) => setSummaryType(e.target.value)} className="bg-transparent text-[10px] font-black text-blue-600 outline-none uppercase italic cursor-pointer">
                 <option value="shape">By Shape</option><option value="color">By Color</option><option value="lab">By Lab</option>
               </select>
            </div>
            <div className="space-y-2">
              {kpiData.map(([label, value]: any) => (
                <div key={label} className="flex justify-between p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold opacity-50 uppercase">{label}</span>
                  <span className="text-[11px] font-black text-blue-600">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <button onClick={() => setShowAddForm(true)} className="mt-auto bg-[#0071E3] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
          <Plus size={16} strokeWidth={3} /> New Gemstone
        </button>
      </aside>

      <main className="flex-1 p-10">
        <div className="flex items-center justify-between mb-10 gap-6">
           <div className="flex-1 flex items-center bg-white p-3 rounded-[2rem] shadow-sm border border-black/5 gap-4">
              <div className="bg-slate-100 p-2 px-4 rounded-xl flex items-center gap-3">
                <span className="text-[9px] font-black opacity-30 uppercase">Find By</span>
                <select onChange={(e) => setSearchCategory(e.target.value)} className="bg-transparent text-[10px] font-black uppercase text-blue-600 outline-none">
                  <option value="sku">ID</option><option value="carat">Carat</option><option value="total_amount">Price</option>
                </select>
              </div>
              <input className="flex-1 bg-transparent px-2 text-xs font-bold outline-none" placeholder={`Search...`} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           <button onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')} className="p-3.5 bg-white rounded-2xl shadow-sm border border-black/5 hover:bg-slate-50 transition-all">
              {viewType === 'grid' ? <List size={20} /> : <LayoutGrid size={20} />}
           </button>
           <button onClick={() => supabase.auth.signOut().then(() => router.push('/admin/login'))} className="text-red-500 font-bold text-[10px] uppercase ml-4 hover:underline">Logout</button>
        </div>

        {viewType === 'list' ? (
          <div className="bg-white rounded-[3rem] shadow-sm border border-black/5 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFAFA] text-[9px] font-black opacity-30 uppercase tracking-[0.2em] border-b">
                  <th className="p-7 cursor-pointer" onClick={() => setSortConfig({key:'sku', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'})}>SKU</th>
                  <th className="p-7">Specs</th>
                  <th className="p-7">Price</th>
                  <th className="p-7">Rank</th>
                  <th className="p-7 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03] text-[13px] font-black italic uppercase">
                {processedInventory.map(stone => (
                  <tr key={stone.id} className="hover:bg-[#F5F5F7] transition-colors group">
                    <td className="p-7">{stone.sku}</td>
                    <td className="p-7 opacity-50">{stone.carat}CT {stone.shape}</td>
                    <td className="p-7 text-blue-600 text-lg">${stone.total_amount}</td>
                    <td className="p-7 text-orange-500 font-bold">{stone.priority}</td>
                    <td className="p-7 text-right">
                      <button onClick={async () => { await supabase.from('diamonds').delete().eq('id', stone.id); fetchInventory(); }} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {processedInventory.map(stone => (
              <div key={stone.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5 group hover:shadow-2xl transition-all duration-700 relative flex flex-col">
                <div className="aspect-square bg-slate-50 rounded-2xl mb-6 flex items-center justify-center italic font-black opacity-10 overflow-hidden relative">
                   {stone.image_url ? <img src={stone.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Diamond" /> : 'GLI'}
                   <div className="absolute top-4 left-4 bg-white/90 px-2 py-1 rounded-lg text-[7px] font-black text-blue-600 border border-black/5 shadow-sm uppercase">{stone.lab}</div>
                </div>
                <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-1">{stone.sku}</p>
                <h2 className="text-base font-black italic uppercase text-blue-900 mb-6">{stone.carat}CT {stone.shape}</h2>
                <div className="flex justify-between items-center mt-auto pt-5 border-t border-black/5">
                   <span className="text-xl font-black italic tracking-tighter">${stone.total_amount}</span>
                   <span className="text-[9px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">R: {stone.priority}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showAddForm && (
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-4xl p-12 rounded-[4rem] shadow-2xl animate-in zoom-in duration-300 relative">
              <button onClick={() => setShowAddForm(false)} className="absolute top-8 right-8 text-2xl opacity-20 hover:opacity-100">&times;</button>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-10 text-left">New Stone.</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
                 <div className="bg-slate-50 p-10 rounded-[3rem] border border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                    <Database size={48} className="mx-auto mb-6 text-blue-600 opacity-20" />
                    <h3 className="text-xl font-black uppercase italic mb-4">Bulk Import</h3>
                    <p className="text-[10px] font-bold opacity-30 mb-8 max-w-xs mx-auto">Sync your manufacturer spreadsheet in seconds.</p>
                    <button className="bg-white px-8 py-3 rounded-xl border border-black/5 text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-all">Select Excel File</button>
                 </div>
                 <div className="flex items-center justify-center opacity-20 italic text-sm font-bold">Manual form details here...</div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}