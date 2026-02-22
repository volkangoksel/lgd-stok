"use client"
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false) // Başarı Animasyonu
  const [inventory, setInventory] = useState<any[]>([])
  const [darkMode, setDarkMode] = useState(false)
  
  // Arama ve Filtreleme State'leri
  const [searchTerm, setSearchTerm] = useState('')
  const [filterShape, setFilterShape] = useState('ALL')

  const [formData, setFormData] = useState({
    sku: '', lab: 'GLI', shape: 'ROUND', color: 'D', clarity: 'IF', 
    carat: '', total_amount: '', priority: '0', status: 'In Stock'
  })

  useEffect(() => { fetchInventory() }, [])

  const fetchInventory = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/admin/login')
    else {
      setAuthorized(true)
      const { data } = await supabase.from('diamonds').select('*').order('priority', { ascending: false })
      if (data) setInventory(data)
    }
  }

  // MANUEL KAYIT (SAVE) ÇALIŞTIRMA VE ANİMASYON
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('diamonds').upsert([
      {...formData, sku: formData.sku.trim().toUpperCase(), carat: parseFloat(formData.carat), total_amount: parseFloat(formData.total_amount), priority: parseInt(formData.priority)}
    ], { onConflict: 'sku' })
    
    setLoading(false)
    if (error) alert("Error: " + error.message)
    else {
      setShowSuccess(true) // Animasyonu başlat
      setTimeout(() => setShowSuccess(false), 3000) // 3 saniye sonra kapat
      setFormData({ ...formData, sku: '', carat: '', total_amount: '' })
      fetchInventory()
    }
  }

  // TABLO FİLTRELEME MANTIĞI
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchShape = filterShape === 'ALL' || item.shape === filterShape
      return matchSearch && matchShape
    })
  }, [inventory, searchTerm, filterShape])

  const deleteStone = async (id: string) => {
    if (window.confirm("Delete this stone?")) {
      await supabase.from('diamonds').delete().eq('id', id)
      fetchInventory()
    }
  }

  if (!authorized) return null

  const inputClass = `w-full p-3 rounded-xl border transition-all text-sm outline-none dark:bg-black dark:border-white/10 dark:text-white`

  return (
    <div className={`${darkMode ? 'bg-black' : 'bg-[#F5F5F7]'} min-h-screen font-sans p-4 md:p-10 transition-colors`}>
      
      {/* BAŞARI BİLDİRİMİ (TOAST ANİMASYONU) */}
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
          <div className="bg-green-500 text-white px-8 py-4 rounded-full shadow-2xl font-black flex items-center gap-3">
            <span className="text-2xl">✅</span> STONE SAVED SUCCESSFULLY!
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* HEADER & KPI */}
        <div className="flex justify-between items-center mb-10">
          <img src="/logo.png" className="w-24 object-contain" />
          <div className="flex gap-4">
            <div className="bg-white dark:bg-[#1c1c1e] px-6 py-3 rounded-2xl shadow-sm border border-black/5 text-center">
              <p className="text-[10px] font-black opacity-30 uppercase">In Stock</p>
              <p className="text-xl font-black text-blue-600 italic">{inventory.length}</p>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-4 bg-white dark:bg-white/5 rounded-2xl shadow-sm">
                {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* GENİŞLETİLMİŞ GİRİŞ FORMU */}
        <div className="bg-white dark:bg-[#1c1c1e] p-10 rounded-[3rem] shadow-2xl mb-12 border border-black/5">
          <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter">Stone Registration</h2>
          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div>
              <label className="text-[10px] font-bold opacity-40 uppercase ml-1">Stone ID</label>
              <input required className={inputClass} placeholder="SKU-101" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold opacity-40 uppercase ml-1">Weight (CT)</label>
              <input required type="number" step="0.01" className={inputClass} placeholder="1.00" value={formData.carat} onChange={e => setFormData({...formData, carat: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold opacity-40 uppercase ml-1">Price (USD)</label>
              <input required type="number" className={`${inputClass} font-black text-blue-600`} placeholder="2500" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold opacity-40 uppercase ml-1 text-orange-500">Catalog Rank (High = First)</label>
              <input type="number" className={inputClass} placeholder="0" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} />
            </div>

            {/* Diğer Kriterler */}
            {['shape', 'color', 'clarity'].map(f => (
              <div key={f}>
                <label className="text-[10px] font-bold opacity-40 uppercase ml-1">{f}</label>
                <select className={inputClass} value={(formData as any)[f]} onChange={e => setFormData({...formData, [f]: e.target.value})}>
                  {f === 'shape' && ['ROUND','PEAR','OVAL','EMERALD','RADIANT'].map(opt => <option key={opt}>{opt}</option>)}
                  {f === 'color' && ['D','E','F','G','H','I'].map(opt => <option key={opt}>{opt}</option>)}
                  {f === 'clarity' && ['IF','VVS1','VVS2','VS1','VS2','SI1'].map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            ))}

            <div className="md:pt-5">
              <button disabled={loading} className="w-full h-[50px] bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/30 active:scale-95 transition-all">
                {loading ? "SAVING..." : "SAVE STONE"}
              </button>
            </div>
          </form>
        </div>

        {/* STOK TAKİP VE FİLTRELEME ARAÇLARI */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
          <div className="p-8 border-b border-black/5 flex flex-col md:flex-row justify-between gap-6">
            <h3 className="font-black italic uppercase text-lg">Inventory Tracking</h3>
            <div className="flex gap-4 flex-1 max-w-2xl">
                <input 
                  className="flex-1 bg-[#F5F5F7] dark:bg-black p-3 rounded-xl outline-none text-xs font-bold" 
                  placeholder="Search by SKU..." 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                  className="bg-[#F5F5F7] dark:bg-black p-3 rounded-xl outline-none text-xs font-bold"
                  onChange={(e) => setFilterShape(e.target.value)}
                >
                  <option value="ALL">All Shapes</option>
                  <option value="ROUND">Round</option>
                  <option value="PEAR">Pear</option>
                  <option value="OVAL">Oval</option>
                </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-black/20 text-[9px] font-black opacity-30 uppercase tracking-[0.2em] border-b border-black/5">
                  <th className="p-6">SKU / Stone ID</th>
                  <th className="p-6">Specifications</th>
                  <th className="p-6">Price (USD)</th>
                  <th className="p-6 text-center text-orange-500">Rank</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredInventory.map((stone) => (
                  <tr key={stone.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-6 font-black text-sm italic">{stone.sku}</td>
                    <td className="p-6">
                      <p className="text-xs font-bold">{stone.carat}CT {stone.shape}</p>
                      <p className="text-[10px] opacity-40">{stone.color} / {stone.clarity} / {stone.lab}</p>
                    </td>
                    <td className="p-6 font-black text-blue-600 italic text-lg">${stone.total_amount}</td>
                    <td className="p-6 text-center font-bold text-orange-500">{stone.priority}</td>
                    <td className="p-6 text-right">
                      <button onClick={() => deleteStone(stone.id)} className="text-[10px] font-black uppercase text-red-500 hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}