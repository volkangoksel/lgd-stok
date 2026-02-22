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
  
  // Dashboard & Analytics States
  const [metric, setMetric] = useState<'items' | 'price' | 'carat'>('items')
  const [opStatus, setOpStatus] = useState<'In Stock' | 'Sold' | 'ALL'>('ALL')
  const [mediaType, setMediaType] = useState<'photo' | 'video' | 'excel'>('photo')

  // Table & Search States
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

  // --- 1. SIDEBAR REPORT LOGIC (DİNAMİK SENKRONİZASYON) ---
  const report = useMemo(() => {
    // Önce statüye göre (ALL/LIVE/SOLD) filtreliyoruz
    const filteredByStatus = inventory.filter(i => opStatus === 'ALL' ? true : i.status === opStatus)
    
    // Üst kutu değeri hesaplama
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

    // Shape Summary: Sadece seçili statüdeki taşların şekil dağılımı
    const shapes = filteredByStatus.reduce((acc: any, s) => {
      acc[s.shape] = (acc[s.shape] || 0) + 1;
      return acc;
    }, {})

    return { displayVal, label, shapes: Object.entries(shapes).sort((a: any, b: any) => b[1] - a[1]).slice(0, 6) }
  }, [inventory, metric, opStatus])

  // --- 2. TABLE LOGIC ---
  const processedInventory = useMemo(() => {
    let items = inventory.filter(i => String(i[searchCategory] || '').toLowerCase().includes(searchTerm.toLowerCase()))
    items.sort((a, b) => {
      const aVal = a[sortConfig.key]; const bVal = b[sortConfig.key]
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return items
  }, [inventory, searchTerm, searchCategory, sortConfig])

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.from('diamonds').upsert([{...formData, sku: formData.sku.trim().toUpperCase()}], { onConflict: 'sku' })
    if (!error) { setShowAddForm(false); fetchInventory(); }
    setLoading(false)
  }

  if (!authorized) return <div className="h-screen flex items-center justify-center font-black opacity-10 tracking-[0.5em] uppercase">Authenticating...</div>

  const inputClass = `w-full p-2.5 rounded-xl border transition-all text-xs outline-none ${darkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`
  const dropdownItem = "w-full text-left px-5 py-2 text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all uppercase"

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'} font-sans antialiased transition-colors duration-500 text-left`}>
      
      {/* --- SIDEBAR: EXECUTIVE DASHBOARD --- */}
      <aside className={`w-85 border-r flex flex-col p-6 overflow-hidden ${darkMode ? 'bg-[#141414] border-white/5' : 'bg-white border-black/5'}`}>
        <img src="/logo.png" className="w-44 object-contain self-start mb-8 opacity-90" alt="Logo" />
        
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <section>
            <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic font-black">Total</p>
                <div className="flex gap-1">
                    {['items', 'price', 'carat'].map((m) => (
                        <button key={m} onClick={() => setMetric(m as any)} className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black border transition-all ${metric === m ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'opacity-40'}`}>{m[0].toUpperCase()}</button>
                    ))}
                </div>
            </div>
            <div className={`p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden transition-all ${darkMode ? 'bg-blue-900/10 border border-blue-800/20' : 'bg-blue-50 border border-blue-100'}`}>
               <p className="text-[9px] text-blue-600 uppercase font-black tracking-widest mb-1">{report.label}</p>
               <p className="text-5xl font-black italic tracking-tighter text-blue-600 leading-none">{report.displayVal}</p>
               <Activity className="absolute -right-3 -bottom-3 text-blue-600/10" size={100} />
            </div>
            <div className={`flex p-1 rounded-2xl mt-4 gap-1 ${darkMode ? 'bg-white/5' : 'bg-slate-200/50'}`}>
                {['ALL', 'In Stock', 'Sold'].map((s) => (
                    <button key={s} onClick={() => setOpStatus(s as any)} className={`flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${opStatus === s ? 'bg-white dark:bg-[#1C1C1E] shadow-sm text-blue-600 font-bold' : 'opacity-40'}`}>{s === 'In Stock' ? 'Live' : s}</button>
                ))}
            </div>
          </section>

          {/* SHAPE SUMMARY (DİNAMİK RAKAMLAR) */}
          <section className="flex-1 overflow-hidden flex flex-col pt-4 border-t border-black/5">
             <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mb-4 italic text-blue-600">Shape Summary</p>
             <div className="space-y-1.5 overflow-y-auto scrollbar-hide pr-1">
                {report.shapes.map(([name, count]: any) => (
                    <div key={name} className={`flex justify-between items-center p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-slate-100/50 hover:bg-white transition-all'}`}>
                        <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter">{name}</span>
                        <span className="text-[11px] font-black text-blue-600 italic leading-none">{count}</span>
                    </div>
                ))}
             </div>
          </section>
        </div>

        <button onClick={() => setShowAddForm(true)} className="mt-6 bg-[#0071E3] text-white w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#0077ED] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
          <Plus size={18} strokeWidth={3} /> NEW ENTRY
        </button>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className={`p-8 flex items-center justify-between gap-6 border-b ${darkMode ? 'bg-[#0A0A0A]/50 border-white/5' : 'bg-white/50 border-black/5'} backdrop-blur-md z-10`}>
           <div className={`flex-1 flex items-center p-3 rounded-2xl shadow-sm border gap-3 ${darkMode ? 'bg-black border-white/10' : 'bg-white border-black/5'}`}>
              <div className="bg-slate-50 dark:bg-white/10 p-1.5 px-3 rounded-lg flex items-center gap-2">
                <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Find By</span>
                <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} className="bg-transparent text-[10px] font-black uppercase text-blue-600 outline-none">
                  <option value="sku">ID</option><option value="total_amount">Price</option><option value="carat">Carat</option>
                </select>
              </div>
              <input className="flex-1 bg-transparent text-xs font-bold outline-none" placeholder="Search inventory..." onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           <button onClick={() => setDarkMode(!darkMode)} className={`p-4 rounded-full border transition-all ${darkMode ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-white border-black/5 shadow-sm'}`}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide text-left">
          <div className={`rounded-[3.5rem] shadow-sm border overflow-hidden ${darkMode ? 'bg-[#141414] border-white/5' : 'bg-white border-black/5'}`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[9px] font-black opacity-30 uppercase tracking-[0.2em] border-b ${darkMode ? 'bg-white/5 border-white/5' : 'bg-[#FAFAFA] border-black/5'}`}>
                  {['sku', 'shape', 'carat', 'color', 'total_amount', 'priority'].map(k => (
                    <th key={k} className="p-7 group relative cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-all border-b border-black/5" onClick={() => setSortConfig({key:k, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'})}>
                      <div className="flex items-center gap-2 font-black">
                        {k === 'total_amount' ? 'Price' : k} <ChevronDown size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </th>
                  ))}
                  <th className="p-7 text-right opacity-30 font-black">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-[13px] font-black italic uppercase ${darkMode ? 'divide-white/5' : 'divide-black/[0.03]'}`}>
                {processedInventory.map(stone => (
                  <tr key={stone.id} className={`transition-colors group ${darkMode ? 'hover:bg-white/5' : 'hover:bg-[#F5F5F7]'} ${stone.status === 'Sold' ? 'opacity-20' : ''}`}>
                    <td className="p-7 text-blue-900 dark:text-blue-400">{stone.sku}</td>
                    <td className="p-7 opacity-40 text-[11px]">{stone.shape}</td>
                    <td className="p-7">{stone.carat} CT</td>
                    <td className="p-7 opacity-40">{stone.color}</td>
                    <td className="p-7 font-black tracking-tighter text-lg text-blue-600">${stone.total_amount}</td>
                    <td className="p-7 text-orange-500 font-bold">{stone.priority}</td>
                    <td className="p-7 text-right"><button onClick={() => supabase.from('diamonds').delete().eq('id', stone.id).then(fetchInventory)} className="text-red-500 opacity-0 group-hover:opacity-100 hover:scale-125 transition-all"><Trash2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}