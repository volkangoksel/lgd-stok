"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [inventory, setInventory] = useState<any[]>([])
  const [darkMode, setDarkMode] = useState(false)
  
  const [formData, setFormData] = useState({
    sku: '', lab: 'GLI', shape: 'ROUND', color: 'F', clarity: 'VS2', 
    carat: '', length: '', width: '', height: '', total_amount: '', image_url: '', status: 'In Stock'
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/admin/login')
    else {
      setAuthorized(true)
      const { data } = await supabase.from('diamonds').select('*').order('created_at', { ascending: false })
      if (data) setInventory(data)
    }
  }

  // Stok Durumu Güncelleme (Yayına al/kaldır)
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'In Stock' ? 'Hidden' : 'In Stock'
    const { error } = await supabase.from('diamonds').update({ status: newStatus }).eq('id', id)
    if (!error) fetchInventory()
  }

  // Stok Silme
  const deleteStone = async (id: string) => {
    if (window.confirm("Are you sure you want to PERMANENTLY delete this stone?")) {
      const { error } = await supabase.from('diamonds').delete().eq('id', id)
      if (!error) fetchInventory()
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('diamonds').upsert([{...formData, sku: formData.sku.trim().toUpperCase()}], { onConflict: 'sku' })
    if (!error) {
      alert("Saved!");
      setFormData({ ...formData, sku: '', carat: '', total_amount: '', image_url: '' })
      fetchInventory()
    }
    setLoading(false)
  }

  const cleanNum = (val: any) => {
    if (!val) return 0;
    let s = String(val).replace(/\s/g, '').replace('$', '').replace(',', '.');
    return parseFloat(s) || 0;
  }

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      const processedData = data.map((item: any) => ({
        sku: String(item["SKU"] || item["Stone ID"] || "").trim().toUpperCase(),
        image_url: String(item["Photo link"] || item["Photo"] || ""),
        lab: String(item["Sertificate"] || item["Lab"] || "GLI").toUpperCase(),
        carat: cleanNum(item["Carat"]),
        color: String(item["Color"] || "").toUpperCase(),
        clarity: String(item["Clarity"] || "").toUpperCase(),
        shape: String(item["Shape"] || "").toUpperCase(),
        total_amount: cleanNum(item["Price"]),
        status: 'In Stock'
      }));
      await supabase.from('diamonds').upsert(processedData, { onConflict: 'sku' });
      alert("Inventory Sync Complete!");
      fetchInventory();
      setLoading(false);
    }
    reader.readAsBinaryString(file);
  }

  if (!authorized) return null

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-[#F5F5F7] text-[#1d1d1f]'} min-h-screen font-sans p-4 md:p-8 transition-colors duration-500`}>
      
      {/* 1. TOP NAV & KPI */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <img src="/logo.png" alt="GLI Logo" className="w-24 h-12 object-contain mb-2" />
          <h1 className="text-sm font-black opacity-30 tracking-[0.3em] uppercase italic">Inventory Manager V2.0</h1>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white dark:bg-[#1c1c1e] px-6 py-3 rounded-2xl shadow-sm border border-black/5">
            <p className="text-[10px] font-bold opacity-40 uppercase">Total Stones</p>
            <p className="text-xl font-black text-blue-600 italic">{inventory.length}</p>
          </div>
          <div className="bg-white dark:bg-[#1c1c1e] px-6 py-3 rounded-2xl shadow-sm border border-black/5">
            <p className="text-[10px] font-bold opacity-40 uppercase">Live in Catalog</p>
            <p className="text-xl font-black text-green-500 italic">{inventory.filter(i => i.status === 'In Stock').length}</p>
          </div>
          <button onClick={() => setShowEntryForm(!showEntryForm)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
            {showEntryForm ? "Close Form" : "Add New Stone"}
          </button>
        </div>
      </div>

      {/* 2. COLLAPSIBLE ENTRY FORM */}
      {showEntryForm && (
        <div className="max-w-4xl mx-auto bg-white dark:bg-[#1c1c1e] p-8 rounded-[2.5rem] shadow-2xl mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
           <h2 className="text-xl font-black mb-6 italic underline decoration-blue-500">Fast Entry</h2>
           <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input className="p-3 rounded-xl border dark:bg-black dark:border-white/10 outline-none" placeholder="Stone ID" onChange={e => setFormData({...formData, sku: e.target.value})} />
              <input type="number" step="0.01" className="p-3 rounded-xl border dark:bg-black dark:border-white/10 outline-none" placeholder="Carat" onChange={e => setFormData({...formData, carat: e.target.value})} />
              <input type="number" className="p-3 rounded-xl border dark:bg-black dark:border-white/10 outline-none text-blue-600 font-bold" placeholder="Price $" onChange={e => setFormData({...formData, total_amount: e.target.value})} />
              <div className="col-span-full flex gap-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase">Save to Database</button>
                <input type="file" id="bulk" className="hidden" onChange={handleFileUpload} />
                <label htmlFor="bulk" className="flex-1 bg-slate-100 dark:bg-white/5 py-3 rounded-xl font-black text-[10px] uppercase text-center cursor-pointer hover:bg-slate-200">Import Excel</label>
              </div>
           </form>
        </div>
      )}

      {/* 3. INVENTORY TABLE (MÜŞTERİ GÖRÜNÜMÜNÜN ADMİN HALİ) */}
      <div className="max-w-7xl mx-auto bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-black/40 text-[10px] font-black opacity-40 uppercase tracking-widest border-b border-black/5">
                <th className="p-6">Photo</th>
                <th className="p-6">Stone ID</th>
                <th className="p-6">Specs</th>
                <th className="p-6">Price</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {inventory.map((stone) => (
                <tr key={stone.id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${stone.status === 'Hidden' ? 'opacity-40 grayscale' : ''}`}>
                  <td className="p-6">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-black rounded-lg overflow-hidden flex items-center justify-center">
                      {stone.image_url ? (
                        <img src={stone.image_url} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/50?text=Error")} />
                      ) : (
                        <span className="text-[10px] font-bold opacity-20">No Pix</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 font-black text-sm uppercase italic">{stone.sku}</td>
                  <td className="p-6">
                    <p className="text-xs font-bold">{stone.carat}CT {stone.shape}</p>
                    <p className="text-[10px] opacity-40">{stone.color} / {stone.clarity} / {stone.lab}</p>
                  </td>
                  <td className="p-6 font-black text-blue-600 italic text-lg">${stone.total_amount}</td>
                  <td className="p-6 text-center">
                    <button onClick={() => toggleStatus(stone.id, stone.status)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${stone.status === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                      {stone.status === 'In Stock' ? '● Public' : '○ Hidden'}
                    </button>
                  </td>
                  <td className="p-6 text-right space-x-3">
                    {stone.image_url && <a href={stone.image_url} target="_blank" className="text-blue-500 text-[10px] font-bold uppercase underline">Link</a>}
                    <button onClick={() => deleteStone(stone.id)} className="text-red-500 text-[10px] font-black uppercase">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}