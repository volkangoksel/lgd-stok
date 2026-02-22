"use client"
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { 
  LayoutGrid, List, ChevronDown, Check, Plus, Search, 
  Trash2, Database, Moon, Sun, BarChart2, TrendingUp, UploadCloud, X, Activity 
} from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Dashboard & Filter States
  const [metric, setMetric] = useState<'items' | 'price' | 'carat'>('items')
  const [opStatus, setOpStatus] = useState<'In Stock' | 'Sold' | 'ALL'>('ALL')
  const [sidebarShapeFilter, setSidebarShapeFilter] = useState('ALL') // Tıklanabilir şekil filtresi
  const [mediaType, setMediaType] = useState<'photo' | 'video' | 'excel'>('photo')

  // Search & Sort States
  const [searchCategory, setSearchCategory] = useState('sku')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'priority', direction: 'desc' })

  const [formData, setFormData] = useState({
    sku: '', carat: '', total_amount: '', priority: '0',
    shape: 'ROUND', color: 'D', clarity: 'IF', cut: 'EX', lab: 'GLI',
    length: '', width: '', height: '', image_url: '', video_url: '', status: 'In Stock'
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/admin/login')
      else { setAuthorized(true); fetchInventory(); }
    }
    checkUser()
  }, [router])

  const fetchInventory = async () => {
    const { data } = await supabase.from('diamonds').select('*').order('created_at', { ascending: false })
    if (data) setInventory(data)
  }

  // --- 1. SIDEBAR REPORT LOGIC (NO SCROLL & INTERACTIVE) ---
  const report = useMemo(() => {
    const filteredByStatus = inventory.filter(i => opStatus === 'ALL' ? true : i.status === opStatus)
    
    let displayVal: string | number = 0
    let label = ""
    if (metric === 'items') { displayVal = filteredByStatus.length; label = "Stones Count"; }
    else if (metric === 'price') {
      const sum = filteredByStatus.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0)
      displayVal = sum > 1000000 ? `${(sum / 1000000).toFixed(1)}M` : `$${(sum / 1000).toFixed(0)}K`
      label = "Total Value";
    } else if (metric === 'carat') {
      const sum = filteredByStatus.reduce((acc, i) => acc + (Number(i.carat) || 0), 0)
      displayVal = `${sum.toFixed(1)}ct`; label = "Total Weight";
    }

    const shapes = filteredByStatus.reduce((acc: any, s) => {
      acc[s.shape] = (acc[s.shape] || 0) + 1;
      return acc;
    }, {})

    return { displayVal, label, shapes: Object.entries(shapes).sort((a: any, b: any) => b[1] - a[1]) }
  }, [inventory, metric, opStatus])

  // --- 2. TABLE FILTERING (INCLUDING SIDEBAR SHAPE CLICK) ---
  const processedInventory = useMemo(() => {
    let items = inventory.filter(i => {
      const matchSearch = String(i[searchCategory] || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchSidebarShape = sidebarShapeFilter === 'ALL' || i.shape === sidebarShapeFilter
      return matchSearch && matchSidebarShape
    })
    items.sort((a, b) => {
      const aVal = a[sortConfig.key]; const bVal = b[sortConfig.key]
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return items
  }, [inventory, searchTerm, searchCategory, sortConfig, sidebarShapeFilter])

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.from('diamonds').upsert([{...formData, sku: formData.sku.trim().toUpperCase()}], { onConflict: 'sku' })
    if (!error) { setShowSuccess(true); setTimeout(() => setShowSuccess(false), 3000); setShowAddForm(false); fetchInventory(); }
    setLoading(false)
  }

  if (!authorized) return null

  const inputClass = `w-full p-2.5 rounded-xl border transition-all text-xs outline-none ${darkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'} font-sans antialiased transition-colors duration-500 text-left`}>
      
      {/* SUCCESS NOTIFICATION */}
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[400] animate-in fade-in slide-in-from-top-4">
          <div className="bg-green-600 text-white px-8 py-4 rounded-full shadow-2xl font-black flex items-center gap-3">
            <Check size={20} /> STONE SAVED SUCCESSFULLY
          </div>
        </div>
      )}

      {/* --- SIDEBAR: COMPACT EXECUTIVE DASHBOARD --- */}
      <aside className={`w-80 border-r flex flex-col p-5 overflow-hidden ${darkMode ? 'bg-[#111111] border-white/5' : 'bg-white border-black/5'}`}>
        
        {/* LOGO (Küçültüldü ki scroll gerekmesin) */}
        <img src="/logo.png" className="w-28 object-contain self-start mb-6 opacity-90" alt="Logo" />
        
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <section>
            <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest italic">Inventory</p>
                <div className="flex gap-1">
                    {['items', 'price', 'carat'].map((m) => (
                        <button key={m} onClick={() => setMetric(m as any)} className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black border transition-all ${metric === m ? 'bg-blue-600 border-blue-600 text-white' : 'opacity-30'}`}>{m[0].toUpperCase()}</button>
                    ))}
                </div>
            </div>
            <div className={`p-5 rounded-[2rem] shadow-sm relative overflow-hidden transition-all ${darkMode ? 'bg-blue-900/10 border border-blue-800/20' : 'bg-blue-50 border border-blue-100'}`}>
               <p className="text-[8px] text-blue-600 uppercase font-black tracking-widest mb-0.5">{report.label}</p>
               <p className="text-4xl font-black italic tracking-tighter text-blue-600 leading-none">{report.displayVal}</p>
               <Activity className="absolute -right-3 -bottom-3 text-blue-600/10" size={80} />
            </div>
            {/* Status Switcher - Hover Rengi Düzeltildi */}
            <div className={`flex p-1 rounded-xl mt-3 gap-1 ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                {['ALL', 'In Stock', 'Sold'].map((s) => (
                    <button key={s} onClick={() => setOpStatus(s as any)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${opStatus === s ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}>{s === 'In Stock' ? 'Live' : s}</button>
                ))}
            </div>
          </section>

          {/* INTERACTIVE SHAPE SUMMARY (Tıklanabilir) */}
          <section className="flex-1 overflow-hidden flex flex-col pt-3 border-t border-black/5">
             <div className="flex justify-between items-center mb-3 px-1">
                <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] italic text-blue-600">Shape Summary</p>
                {sidebarShapeFilter !== 'ALL' && <button onClick={() => setSidebarShapeFilter('ALL')} className="text-[8px] font-black text-red-500 uppercase">Clear</button>}
             </div>
             <div className="space-y-1 overflow-y-auto scrollbar-hide pr-1">
                {report.shapes.map(([name, count]: any) => (
                    <button 
                        key={name} 
                        onClick={() => setSidebarShapeFilter(name)}
                        className={`w-full flex justify-between items-center p-2.5 rounded-xl transition-all ${sidebarShapeFilter === name ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 dark:bg-white/5 hover:bg-blue-50'}`}
                    >
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${sidebarShapeFilter === name ? 'text-white' : 'opacity-60'}`}>{name}</span>
                        <span className={`text-[10px] font-black italic ${sidebarShapeFilter === name ? 'text-white' : 'text-blue-600'}`}>{count}</span>
                    </button>
                ))}
             </div>
          </section>
        </div>

        {/* NEW ENTRY BUTTON (Mavi Dolgulu & Çalışıyor) */}
        <button 
          onClick={() => setShowAddForm(true)}
          className="mt-6 bg-[#0071E3] text-white w-full py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#0077ED] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} strokeWidth={3} /> NEW ENTRY
        </button>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 flex flex-col overflow-hidden text-left">
        <div className={`p-8 flex items-center justify-between gap-6 border-b ${darkMode ? 'bg-[#0A0A0A]/50 border-white/5' : 'bg-white/50 border-black/5'} backdrop-blur-md z-10`}>
           <div className={`flex-1 flex items-center p-3 rounded-2xl shadow-sm border gap-3 ${darkMode ? 'bg-black border-white/10' : 'bg-white border-black/5'}`}>
              <div className="bg-slate-50 dark:bg-white/10 p-1.5 px-3 rounded-lg flex items-center gap-2">
                <span className="text-[8px] font-black opacity-30 uppercase">Find</span>
                <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} className="bg-transparent text-[9px] font-black uppercase text-blue-600 outline-none">
                  <option value="sku">ID</option><option value="total_amount">Price</option><option value="carat">Carat</option>
                </select>
              </div>
              <input className="flex-1 bg-transparent text-xs font-bold outline-none" placeholder="Search gems..." onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           <button onClick={() => setDarkMode(!darkMode)} className={`p-4 rounded-full border transition-all ${darkMode ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-white border-black/5 shadow-sm'}`}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
           </button>
        </div>

        {/* INVENTORY TABLE */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className={`rounded-[3.5rem] shadow-sm border overflow-hidden ${darkMode ? 'bg-[#141414] border-white/5' : 'bg-white border-black/5'}`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[9px] font-black opacity-30 uppercase tracking-[0.2em] border-b ${darkMode ? 'bg-white/5 border-white/5' : 'bg-[#FAFAFA] border-black/5'}`}>
                  {['sku', 'shape', 'carat', 'color', 'total_amount', 'priority'].map(k => (
                    <th key={k} className="p-7 cursor-pointer group hover:bg-slate-50 dark:hover:bg-white/10 transition-all" onClick={() => setSortConfig({key:k, direction: sortConfig.key === k && sortConfig.direction === 'desc' ? 'asc' : 'desc'})}>
                      <div className="flex items-center gap-2 font-black">
                        {k === 'total_amount' ? 'Price' : k} <ChevronDown size={10} className="opacity-40 ml-1" />
                      </div>
                    </th>
                  ))}
                  <th className="p-7 text-right opacity-30 font-black">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-[13px] font-black italic uppercase ${darkMode ? 'divide-white/5' : 'divide-black/[0.03]'}`}>
                {processedInventory.map(stone => (
                  <tr key={stone.id} className={`transition-colors group ${darkMode ? 'hover:bg-white/5' : 'hover:bg-[#F5F5F7]'} ${stone.status === 'Sold' ? 'opacity-20' : ''}`}>
                    <td className="p-7 text-blue-600">{stone.sku}</td>
                    <td className="p-7 opacity-40 text-[11px]">{stone.shape}</td>
                    <td className="p-7">{stone.carat} CT</td>
                    <td className="p-7 opacity-40">{stone.color}</td>
                    <td className="p-7 font-black tracking-tighter text-lg text-blue-600">${stone.total_amount}</td>
                    <td className="p-7 text-orange-500 font-bold">{stone.priority}</td>
                    <td className="p-7 text-right">
                        <button onClick={() => supabase.from('diamonds').delete().eq('id', stone.id).then(fetchInventory)} className="text-red-500 opacity-0 group-hover:opacity-100 hover:scale-125 transition-all"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- ADD NEW MODAL (TAM DONANIMLI) --- */}
      {showAddForm && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className={`w-full max-w-5xl p-10 rounded-[4rem] shadow-2xl relative text-left ${darkMode ? 'bg-[#111111] border border-white/5 text-white' : 'bg-white text-slate-900'}`}>
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter underline decoration-blue-600 underline-offset-8">Stone Registration.</h2>
                <button onClick={() => setShowAddForm(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:rotate-90 transition-all font-black text-2xl opacity-40">&times;</button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <form onSubmit={handleManualSubmit} className="space-y-6">
                    <p className="text-[10px] font-black uppercase opacity-20 tracking-widest border-b pb-2">Technical Specifications</p>
                    <div className="grid grid-cols-2 gap-3">
                       <input required className={inputClass} placeholder="Stone ID (SKU)" onChange={e => setFormData({...formData, sku: e.target.value})} />
                       <input required className={inputClass} placeholder="Weight (Carat)" onChange={e => setFormData({...formData, carat: e.target.value})} />
                       <input required className={inputClass} placeholder="Price (USD)" onChange={e => setFormData({...formData, total_amount: e.target.value})} />
                       <input className={inputClass} placeholder="Priority Rank" onChange={e => setFormData({...formData, priority: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                       {['shape', 'color', 'clarity', 'cut', 'lab'].map(f => (
                         <input key={f} className={inputClass} placeholder={f.toUpperCase()} onChange={e => setFormData({...formData, [f]: e.target.value.toUpperCase()})} />
                       ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3 border-t border-black/5 pt-4">
                       {['length', 'width', 'height'].map(f => (
                         <input key={f} className={inputClass} placeholder={`${f.toUpperCase()} mm`} onChange={e => setFormData({...formData, [f]: e.target.value})} />
                       ))}
                    </div>
                    <button className="w-full bg-[#0071E3] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Commit to Vault</button>
                 </form>

                 <div className="bg-slate-50 dark:bg-white/5 p-12 rounded-[3.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 text-center flex flex-col items-center justify-center min-h-[300px] group hover:border-blue-500 transition-all">
                    <Database size={60} className="mx-auto mb-6 text-blue-600 opacity-20 group-hover:opacity-100 transition-all" />
                    <p className="text-sm font-bold opacity-30 mb-8 uppercase tracking-widest italic">Bulk XLS Sync</p>
                    <button className="bg-white dark:bg-black px-12 py-4 rounded-2xl border border-black/5 text-[10px] font-black uppercase shadow-xl hover:scale-105 transition-all">Upload Spreadsheet</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}