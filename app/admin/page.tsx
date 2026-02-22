"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    sku: '', lab: 'GLI', shape: 'ROUND', color: 'F', clarity: 'VS2', 
    type: 'CVD', carat: '', length: '', width: '', height: '', 
    total_pcs: '1', price_per_carat: '', total_amount: '', image_url: ''
  })

  // 1. KRİTİK GİRİŞ KONTROLÜ (KAPI BEKÇİSİ)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Eğer giriş yapılmamışsa LOGIN sayfasına at
        router.push('/admin/login')
      } else {
        // Giriş yapılmışsa formu göster
        setAuthorized(true)
      }
    }
    checkUser()
  }, [router])

  // 2. ÇIKIŞ YAPMA FONKSİYONU
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  // 3. MANUEL KAYIT FONKSİYONU
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('diamonds').insert([formData])
      if (error) throw error
      alert("Success: Stone added to inventory!")
      setFormData({ ...formData, sku: '', carat: '', total_amount: '' })
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 4. EXCEL YÜKLEME FONKSİYONU
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = async (evt) => {
      setLoading(true)
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
        const formattedData = data.map((item: any) => ({
          sku: String(item["Stone ID"] || ""),
          lab: item["Lab"] || "GLI",
          shape: item["Shape"], color: item["Color"], clarity: item["Clarity"],
          carat: item["Carat"], length: item["Length"], width: item["Width"],
          height: item["Height"], total_amount: item["Amount $"],
          status: 'In Stock'
        }))
        const { error } = await supabase.from('diamonds').insert(formattedData)
        if (error) throw error
        alert(`${formattedData.length} stones imported successfully!`)
      } catch (err: any) {
        alert("Excel Error: " + err.message)
      } finally {
        setLoading(false)
      }
    }
    reader.readAsBinaryString(file)
  }

  const inputClass = `w-full p-2.5 rounded-xl border transition-all text-sm outline-none ${
    darkMode ? 'bg-[#1c1c1e] border-[#38383a] text-white' : 'bg-white border-[#d1d1d6] text-slate-800 shadow-sm focus:border-blue-500'
  }`

  // YETKİ KONTROLÜ SIRASINDA GÖSTERİLECEK EKRAN
  if (!authorized) {
    return (
      <div className="h-screen bg-[#F5F5F7] flex items-center justify-center font-black opacity-10 uppercase tracking-[0.5em]">
        Verifying Access...
      </div>
    )
  }

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'} min-h-screen font-sans flex flex-col items-center justify-center p-6 transition-colors duration-500`}>
      
      {/* Header Area */}
      <div className="w-full max-w-2xl flex justify-between items-end mb-6 px-2">
        <img src="/logo.png" alt="GLI Logo" className="w-32 h-16 object-contain object-left" />
        <div className="flex gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 italic">
                {darkMode ? 'Light' : 'Dark'}
            </button>
            <button onClick={handleLogout} className="text-[10px] font-black uppercase text-red-500 opacity-60 hover:opacity-100 italic">
                Logout
            </button>
        </div>
      </div>

      {/* Entry Form Card */}
      <div className={`${darkMode ? 'bg-[#1c1c1e] border-[#38383a]' : 'bg-white border-transparent'} w-full max-w-2xl rounded-[2.5rem] shadow-2xl border p-10 transition-all`}>
        <h2 className="text-2xl font-black mb-8 tracking-tight italic uppercase text-left">Stone Entry</h2>
        
        <form onSubmit={handleManualSubmit} className="space-y-6 text-left">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase opacity-40 mb-1.5 block tracking-widest ml-1">Stone ID</label>
              <input required className={inputClass} placeholder="ID..." value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase opacity-40 mb-1.5 block tracking-widest ml-1">Carat</label>
              <input required type="number" step="0.01" className={inputClass} placeholder="0.00" value={formData.carat} onChange={e => setFormData({...formData, carat: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase opacity-40 mb-1.5 block tracking-widest ml-1">Amount $</label>
              <input required type="number" className={`${inputClass} font-bold text-blue-500`} placeholder="0" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-xs">
            {['shape', 'color', 'clarity'].map((field) => (
               <div key={field}>
                <label className="text-[10px] font-black uppercase opacity-40 mb-1.5 block tracking-widest ml-1">{field}</label>
                <select className={inputClass} onChange={(e) => setFormData({...formData, [field]: e.target.value})}>
                  {field === 'shape' && ['ROUND','PEAR','OVAL','EMERALD'].map(s => <option key={s}>{s}</option>)}
                  {field === 'color' && ['D','E','F','G','H'].map(c => <option key={c}>{c}</option>)}
                  {field === 'clarity' && ['IF','VVS1','VVS2','VS1','VS2'].map(c => <option key={c}>{c}</option>)}
                </select>
               </div>
            ))}
          </div>

          {/* Collapsible Details */}
          <div className="pt-2">
            <button type="button" onClick={() => setShowDetails(!showDetails)} className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] hover:opacity-60">
              {showDetails ? "− Hide Details" : "+ Add Measurements & Photo"}
            </button>
            {showDetails && (
              <div className="mt-6 grid grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                 {['lab', 'length', 'width', 'height'].map(f => (
                   <div key={f}>
                      <label className="text-[9px] font-bold uppercase opacity-30 mb-1 block">{f}</label>
                      <input className={inputClass} placeholder="0.00" onChange={e => setFormData({...formData, [f]: e.target.value})} />
                   </div>
                 ))}
              </div>
            )}
          </div>

          <button disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] shadow-lg shadow-blue-500/20 active:scale-[0.97] transition-all">
            {loading ? "Processing..." : "Save to Inventory"}
          </button>
        </form>
      </div>

      {/* Excel Upload Area */}
      <div className={`mt-8 w-full max-w-2xl p-6 rounded-3xl border border-dashed ${darkMode ? 'border-[#38383a] bg-white/5' : 'border-slate-200 bg-white shadow-sm'} flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <span className="text-xl">📊</span>
            <div className="text-left">
              <h3 className="font-black text-[10px] uppercase tracking-widest">Bulk Import</h3>
              <p className="text-[9px] opacity-40 italic">Select Excel (.xlsx) file</p>
            </div>
          </div>
          <input type="file" id="excel" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
          <label htmlFor="excel" className="bg-slate-100 dark:bg-slate-800 px-5 py-2 rounded-xl text-[9px] font-black uppercase cursor-pointer hover:bg-blue-600 hover:text-white transition-all">
            Choose File
          </label>
      </div>

      {/* Footer Text */}
      <div className="mt-12 text-center max-w-sm px-6">
        <p className={`text-[11px] leading-relaxed italic font-medium opacity-30 ${darkMode ? 'text-white' : 'text-black'}`}>
          "At GLI, we are dedicated to providing accurate and reliable diamond grading and certification services."
        </p>
      </div>
    </div>
  )
}