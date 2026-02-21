"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
    const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
      }
    }
    checkUser()
  }, [router])
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    sku: '', lab: 'GLI', shape: 'ROUND', color: 'F', clarity: 'VS2', 
    type: 'CVD', carat: '', length: '', width: '', height: '', 
    total_pcs: '1', price_per_carat: '', total_amount: '', image_url: ''
  })

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Kayıt işlemleri buraya gelecek
    setTimeout(() => { setLoading(false); alert("Saved!"); }, 1000)
  }

  // Apple stili input sınıfları - Yüksek kontrast ve netlik
  const inputClass = `w-full p-3 rounded-xl border transition-all text-sm outline-none ${
    darkMode 
    ? 'bg-[#1c1c1e] border-[#38383a] text-white focus:ring-1 focus:ring-blue-500' 
    : 'bg-white border-[#d1d1d6] text-slate-800 shadow-sm focus:border-blue-500'
  }`

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'} min-h-screen font-sans flex flex-col items-center justify-center p-6 transition-colors duration-500`}>
      
      {/* Header Area */}
      <div className="w-full max-w-2xl flex justify-between items-end mb-6 px-2">
        {/* LOGO: Boyutu korunmuş ve bozulması engellenmiş */}
        <div className="relative w-32 h-16">
          <img 
            src="/logo.png" 
            alt="GLI Logo" 
            className="w-full h-full object-contain object-left"
            onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/150x50?text=GLI+LOGO"
            }}
          />
        </div>

        {/* MODERN MINIMAL DARK MODE TOGGLE (Çerçevesiz) */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 hover:opacity-100 transition-opacity pb-2"
        >
          {darkMode ? 'Switch to Light' : 'Switch to Dark'}
        </button>
      </div>

      {/* Main Container */}
      <div className={`${darkMode ? 'bg-[#1c1c1e] border-[#38383a]' : 'bg-white border-transparent'} w-full max-w-2xl rounded-[2.5rem] shadow-2xl border p-10 transition-all`}>
        <h2 className="text-2xl font-black mb-8 tracking-tight italic uppercase">Stone Entry</h2>
        
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

          <div className="grid grid-cols-3 gap-6">
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

          {/* Details Section */}
          <div className="pt-4">
            <button 
              type="button" 
              onClick={() => setShowDetails(!showDetails)} 
              className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] hover:opacity-60 transition-opacity"
            >
              {showDetails ? "− Hide Technical Details" : "+ Add Measurements & Photo"}
            </button>

            {showDetails && (
              <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="grid grid-cols-4 gap-4">
                   {['lab', 'length', 'width', 'height'].map(f => (
                     <div key={f}>
                        <label className="text-[9px] font-bold uppercase opacity-30 mb-1 block tracking-widest ml-1">{f}</label>
                        <input className={inputClass} placeholder="0.00" onChange={e => setFormData({...formData, [f]: e.target.value})} />
                     </div>
                   ))}
                </div>

                {/* Sürükle Bırak Alanı - Daha Minimal */}
                <div className={`border rounded-2xl p-8 text-center transition-all border-dashed ${
                    darkMode ? 'border-[#38383a] bg-black/20' : 'border-[#d1d1d6] bg-[#f5f5f7]/50'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">📸 Drag & Drop Stone Photo</p>
                  <input type="file" id="photo" className="hidden" accept="image/*" />
                  <label htmlFor="photo" className="text-[9px] font-black text-blue-600 uppercase cursor-pointer block mt-2 hover:underline">Select File</label>
                </div>
              </div>
            )}
          </div>

          <button disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] shadow-lg shadow-blue-500/20 active:scale-[0.97] transition-all mt-4">
            {loading ? "Processing..." : "Save Stone to Inventory"}
          </button>
        </form>
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