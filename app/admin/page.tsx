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

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/admin/login')
      else setAuthorized(true)
    }
    checkUser()
  }, [router])

  // Sayısal verileri temizleme fonksiyonu (Virgülü noktaya çevirir)
  const cleanNum = (val: any) => {
    if (!val) return 0;
    let stringVal = String(val).replace(',', '.');
    return parseFloat(stringVal) || 0;
  }

  // 4. EXCEL YÜKLEME VE ONAY MEKANİZMASI
  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return;

    const reader = new FileReader()
    reader.onload = async (evt) => {
      setLoading(true)
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
        
        const formattedData = data.map((item: any) => ({
          sku: String(item["Stone ID"] || item["StoneID"] || "").trim(),
          lab: String(item["Lab"] || "GLI"),
          shape: String(item["Shape"] || "").toUpperCase(),
          color: String(item["Color"] || "").toUpperCase(),
          clarity: String(item["Clarity"] || "").toUpperCase(),
          carat: cleanNum(item["Carat"]),
          length: cleanNum(item["Length"]),
          width: cleanNum(item["Width"]),
          height: cleanNum(item["Height"]),
          total_amount: cleanNum(item["Amount $"]),
          status: 'In Stock'
        }))

        // ÇAKIŞMA KONTROLÜ: Veritabanındaki mevcut SKU'ları çek
        const skusInExcel = formattedData.map(d => d.sku)
        const { data: existingStones } = await supabase
          .from('diamonds')
          .select('sku')
          .in('sku', skusInExcel)

        if (existingStones && existingStones.length > 0) {
          const existingList = existingStones.map(s => s.sku).join(', ')
          const confirmUpdate = window.confirm(
            `Warning: The following Stone IDs already exist: [${existingList}]. \n\nParameters might have changed. Do you want to OVERWRITE and update these records?`
          )
          if (!confirmUpdate) {
            setLoading(false)
            return;
          }
        }

        const { error } = await supabase
          .from('diamonds')
          .upsert(formattedData, { onConflict: 'sku' })

        if (error) throw error
        alert(`${formattedData.length} stones processed successfully.`)
      } catch (err: any) {
        alert("Upload Error: " + err.message)
      } finally {
        setLoading(false)
        e.target.value = null
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const inputClass = `w-full p-3 rounded-xl border transition-all text-sm outline-none ${
    darkMode ? 'bg-[#1c1c1e] border-[#38383a] text-white' : 'bg-white border-[#d1d1d6] text-slate-800 shadow-sm focus:border-blue-500'
  }`

  if (!authorized) return <div className="h-screen flex items-center justify-center font-black opacity-10 uppercase tracking-[0.5em]">Verifying...</div>

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'} min-h-screen font-sans flex flex-col items-center justify-center p-6 transition-colors duration-500`}>
      
      {/* Header */}
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

      {/* Main Entry Form */}
      <div className={`${darkMode ? 'bg-[#1c1c1e] border-[#38383a]' : 'bg-white border-transparent'} w-full max-w-2xl rounded-[2.5rem] shadow-2xl border p-10 transition-all`}>
        <h2 className="text-2xl font-black mb-8 tracking-tight italic uppercase text-left underline decoration-blue-500 underline-offset-8">Stone Entry</h2>
        
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6 text-left">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase opacity-40 mb-1.5 block tracking-widest ml-1">Stone ID</label>
              <input className={inputClass} placeholder="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase opacity-40 mb-1.5 block tracking-widest ml-1">Weight (CT)</label>
              <input type="number" step="0.01" className={inputClass} placeholder="0.00 ct" value={formData.carat} onChange={e => setFormData({...formData, carat: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase opacity-40 mb-1.5 block tracking-widest ml-1">Price (USD)</label>
              <input type="number" className={`${inputClass} font-bold text-blue-500`} placeholder="$ 0.00" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {['shape', 'color', 'clarity'].map((field) => (
               <div key={field}>
                <label className="text-[10px] font-black uppercase opacity-40 mb-1.5 block tracking-widest ml-1">{field}</label>
                <select className={inputClass} value={(formData as any)[field]} onChange={(e) => setFormData({...formData, [field]: e.target.value})}>
                  {field === 'shape' && ['ROUND','PEAR','OVAL','EMERALD','RADIANT','PRINCESS'].map(s => <option key={s} value={s}>{s}</option>)}
                  {field === 'color' && ['D','E','F','G','H','I'].map(c => <option key={c} value={c}>{c}</option>)}
                  {field === 'clarity' && ['IF','VVS1','VVS2','VS1','VS2','SI1'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
               </div>
            ))}
          </div>

          <div className="pt-2">
            <button type="button" onClick={() => setShowDetails(!showDetails)} className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] hover:opacity-60 transition-opacity">
              {showDetails ? "− Hide Measurements" : "+ Add Dimensions (mm) & Photo"}
            </button>
            {showDetails && (
              <div className="mt-6 grid grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                 {['length', 'width', 'height'].map(f => (
                   <div key={f}>
                      <label className="text-[9px] font-bold uppercase opacity-30 mb-1 block">{f} (mm)</label>
                      <input className={inputClass} placeholder="0.00" onChange={e => setFormData({...formData, [f]: e.target.value})} />
                   </div>
                 ))}
                 <div>
                    <label className="text-[9px] font-bold uppercase opacity-30 mb-1 block">Lab</label>
                    <input className={inputClass} value={formData.lab} onChange={e => setFormData({...formData, lab: e.target.value})} />
                 </div>
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
              <h3 className="font-black text-[10px] uppercase tracking-widest text-blue-600">Bulk Manufacturer Import</h3>
              <p className="text-[9px] opacity-40 italic">Units: Weight(CT), Dim(mm), Price(USD)</p>
            </div>
          </div>
          <input type="file" id="excel" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
          <label htmlFor="excel" className="bg-slate-100 dark:bg-slate-800 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            Choose XLS
          </label>
      </div>

      <div className="mt-12 text-center max-w-sm px-6 opacity-30">
        <p className="text-[10px] leading-relaxed italic font-medium">
          "Dedicated to providing accurate and reliable diamond grading."
        </p>
      </div>
    </div>
  )
}