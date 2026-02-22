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
  
  const [formData, setFormData] = useState({
    sku: '', lab: 'GLI', shape: 'ROUND', color: 'F', clarity: 'VS2', 
    carat: '', length: '', width: '', height: '', total_amount: '', status: 'In Stock'
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/admin/login')
      else setAuthorized(true)
    }
    checkUser()
  }, [router])

  const cleanNum = (val: any) => {
    if (val === undefined || val === null || val === '') return 0;
    let stringVal = String(val).replace(',', '.').replace(/[^-0-9.]/g, '');
    return parseFloat(stringVal) || 0;
  }

  // Akıllı Sütun Bulucu: Excel'deki benzer isimli sütunları yakalar
  const getExcelValue = (row: any, keywords: string[]) => {
    const key = Object.keys(row).find(k => 
      keywords.some(kw => k.toLowerCase().replace(/\s/g, '').includes(kw.toLowerCase()))
    );
    return key ? row[key] : null;
  }

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      setLoading(true);
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

        const processedData: any[] = [];
        const seenSkus = new Set();

        data.forEach((item: any) => {
          // Sütunları esnek bir şekilde buluyoruz
          const rawSkuValue = getExcelValue(item, ["stoneid", "id", "sku", "stone_id"]);
          const rawSku = String(rawSkuValue || "").trim().toUpperCase();
          
          if (rawSku && !seenSkus.has(rawSku)) {
            seenSkus.add(rawSku);
            processedData.push({
              sku: rawSku,
              lab: String(getExcelValue(item, ["lab", "cert"]) || "GLI").trim().toUpperCase(),
              shape: String(getExcelValue(item, ["shape", "cut"]) || "").trim().toUpperCase(),
              color: String(getExcelValue(item, ["color", "clr"]) || "").trim().toUpperCase(),
              clarity: String(getExcelValue(item, ["clarity", "cla"]) || "").trim().toUpperCase(),
              carat: cleanNum(getExcelValue(item, ["carat", "weight", "ct"])),
              length: cleanNum(getExcelValue(item, ["length", "len"])),
              width: cleanNum(getExcelValue(item, ["width", "wid"])),
              height: cleanNum(getExcelValue(item, ["height", "dep", "depth"])),
              total_amount: cleanNum(getExcelValue(item, ["amount", "price", "usd"])),
              status: 'In Stock'
            });
          }
        });

        if (processedData.length === 0) {
          // Kullanıcıya Excel'deki başlıkları gösterelim ki hata anlaşılsın
          const headers = data.length > 0 ? Object.keys(data[0]).join(", ") : "None";
          alert(`No valid data found. \n\nDetected Headers: [${headers}] \n\nPlease ensure your Excel has columns like 'Stone ID', 'Carat', and 'Amount $'.`);
          setLoading(false);
          return;
        }

        const skuList = processedData.map(d => d.sku);
        const { data: existingInDb } = await supabase.from('diamonds').select('sku').in('sku', skuList);

        if (existingInDb && existingInDb.length > 0) {
          const proceed = window.confirm(`${existingInDb.length} stones already exist. Update them?`);
          if (!proceed) {
            const newOnly = processedData.filter(d => !existingInDb.some(db => db.sku === d.sku));
            if (newOnly.length > 0) {
              await supabase.from('diamonds').insert(newOnly);
              alert(`${newOnly.length} new stones added.`);
            }
            setLoading(false);
            return;
          }
        }

        const { error } = await supabase.from('diamonds').upsert(processedData, { onConflict: 'sku' });
        if (error) throw error;
        alert(`Success! ${processedData.length} stones processed.`);

      } catch (err: any) {
        alert("Upload Error: " + err.message);
      } finally {
        setLoading(false);
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

  const inputClass = `w-full p-3 rounded-xl border transition-all text-sm outline-none ${
    darkMode ? 'bg-[#1c1c1e] border-[#38383a] text-white' : 'bg-white border-[#d1d1d6] text-slate-800 shadow-sm focus:border-blue-500'
  }`

  if (!authorized) return <div className="h-screen flex items-center justify-center font-black opacity-10 uppercase tracking-[0.5em]">Authenticating...</div>

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'} min-h-screen font-sans flex flex-col items-center justify-center p-6 transition-colors duration-500`}>
      <div className="w-full max-w-2xl flex justify-between items-end mb-6 px-2">
        <div className="flex flex-col">
            <img src="/logo.png" alt="GLI Logo" className="w-32 h-16 object-contain object-left" />
            <span className="text-[8px] font-black opacity-20 ml-1 tracking-widest uppercase italic">V1.4 Smart Column Mapping</span>
        </div>
        <div className="flex gap-4 italic font-black text-[10px] uppercase opacity-40">
            <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? 'Light' : 'Dark'}</button>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} className="text-red-500">Logout</button>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-[#1c1c1e] border-[#38383a]' : 'bg-white border-transparent'} w-full max-w-2xl rounded-[2.5rem] shadow-2xl border p-10 transition-all text-left`}>
        <h2 className="text-2xl font-black mb-8 tracking-tight italic uppercase underline decoration-blue-500 underline-offset-8">Stone Entry</h2>
        
        <form onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          const { error } = await supabase.from('diamonds').upsert([{...formData, sku: formData.sku.trim().toUpperCase()}], { onConflict: 'sku' });
          setLoading(false);
          if (error) alert(error.message); else { alert("Saved!"); setFormData({...formData, sku: '', carat: '', total_amount: ''}); }
        }} className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div><label className="text-[10px] font-black uppercase opacity-40 mb-1.5 block tracking-widest text-blue-500">Stone ID</label>
            <input required className={inputClass} placeholder="ID" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
            <div><label className="text-[10px] font-black uppercase opacity-40 mb-1.5 block tracking-widest">Weight (CT)</label>
            <input required type="number" step="0.01" className={inputClass} placeholder="0.00 ct" value={formData.carat} onChange={e => setFormData({...formData, carat: e.target.value})} /></div>
            <div><label className="text-[10px] font-black uppercase opacity-40 mb-1.5 block tracking-widest">Price (USD)</label>
            <input required type="number" className={`${inputClass} font-bold text-blue-500`} placeholder="$ 0" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} /></div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {['shape', 'color', 'clarity'].map((field) => (
               <div key={field}>
                <label className="text-[10px] font-black uppercase opacity-40 mb-1.5 block tracking-widest">{field}</label>
                <select className={inputClass} value={(formData as any)[field]} onChange={(e) => setFormData({...formData, [field]: e.target.value})}>
                  {field === 'shape' && ['ROUND','PEAR','OVAL','EMERALD','RADIANT','PRINCESS','MARQUISE'].map(s => <option key={s} value={s}>{s}</option>)}
                  {field === 'color' && ['D','E','F','G','H','I','J','K'].map(c => <option key={c} value={c}>{c}</option>)}
                  {field === 'clarity' && ['IF','VVS1','VVS2','VS1','VS2','SI1','SI2'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
               </div>
            ))}
          </div>

          <button type="button" onClick={() => setShowDetails(!showDetails)} className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] hover:opacity-60 transition-opacity">
            {showDetails ? "− Hide Details" : "+ Add Measurements & Lab"}
          </button>
          {showDetails && (
            <div className="grid grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
               {['length', 'width', 'height'].map(f => (
                 <div key={f}><label className="text-[9px] font-bold uppercase opacity-30 mb-1 block">{f} (mm)</label>
                 <input className={inputClass} placeholder="0.00" value={(formData as any)[f]} onChange={e => setFormData({...formData, [f]: e.target.value})} /></div>
               ))}
               <div><label className="text-[9px] font-bold uppercase opacity-30 mb-1 block">Lab</label>
               <input className={inputClass} value={formData.lab} onChange={e => setFormData({...formData, lab: e.target.value})} /></div>
            </div>
          )}

          <button disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] shadow-lg shadow-blue-500/20 active:scale-[0.97] transition-all">
            {loading ? "Processing..." : "Save to Inventory"}
          </button>
        </form>
      </div>

      <div className={`mt-8 w-full max-w-2xl p-6 rounded-3xl border border-dashed ${darkMode ? 'border-[#38383a] bg-white/5' : 'border-slate-200 bg-white shadow-sm'} flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <span className="text-xl text-blue-600 font-bold">📊</span>
            <div className="text-left">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-blue-600 italic">Smart Bulk Import</h3>
              <p className="text-[9px] opacity-40 italic">Flexible column detection (Stone ID, Weight, Price)</p>
            </div>
          </div>
          <input type="file" id="excel" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
          <label htmlFor="excel" className="bg-slate-100 dark:bg-slate-800 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            Upload XLS
          </label>
      </div>
    </div>
  )
}