"use client"
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

export default function KatalogPage() {
  const [diamonds, setDiamonds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  
  // Layout & Global States
  const [density, setDensity] = useState(3) // 3 to 6
  const [cart, setCart] = useState<any[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  
  // Detaylı Filtre ve Sort State'leri
  const [sortBy, setSortBy] = useState('price-low')
  const [filters, setFilters] = useState({
    shape: 'NONE',
    minCarat: '', maxCarat: '',
    minPrice: '', maxPrice: '',
    lab: 'NONE',
    color: 'NONE',
    clarity: 'NONE',
    cut: 'NONE'
  })

  useEffect(() => {
    async function getDiamonds() {
      const { data, error } = await supabase.from('diamonds').select('*')
      if (!error && data) setDiamonds(data)
      setLoading(false)
    }
    getDiamonds()
  }, [])

  // Gelişmiş Filtreleme ve Sıralama Mantığı
  const processedDiamonds = useMemo(() => {
    let result = diamonds.filter(d => {
      return (filters.shape === 'NONE' || d.shape === filters.shape) &&
             (filters.lab === 'NONE' || d.lab === filters.lab) &&
             (filters.color === 'NONE' || d.color === filters.color) &&
             (filters.clarity === 'NONE' || d.clarity === filters.clarity) &&
             (filters.cut === 'NONE' || d.cut === filters.cut) &&
             (filters.minCarat === '' || d.carat >= parseFloat(filters.minCarat)) &&
             (filters.maxCarat === '' || d.carat <= parseFloat(filters.maxCarat)) &&
             (filters.minPrice === '' || d.total_amount >= parseFloat(filters.minPrice)) &&
             (filters.maxPrice === '' || d.total_amount <= parseFloat(filters.maxPrice))
    })

    if (sortBy === 'price-low') result.sort((a, b) => a.total_amount - b.total_amount)
    if (sortBy === 'price-high') result.sort((a, b) => b.total_amount - a.total_amount)
    if (sortBy === 'carat-low') result.sort((a, b) => a.carat - b.carat)
    if (sortBy === 'carat-high') result.sort((a, b) => b.carat - a.carat)
    
    return result
  }, [diamonds, filters, sortBy])

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const sectionLabel = "text-[9px] font-black opacity-30 uppercase tracking-[0.2em] block mb-3 mt-8"
  const filterBtn = (field: any, val: any) => `px-2 py-1.5 rounded-md text-[9px] font-bold transition-all ${filters[field as keyof typeof filters] === val ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-white/5 opacity-60 hover:opacity-100'}`

  if (loading) return <div className="h-screen flex items-center justify-center font-black opacity-10 tracking-[0.5em] uppercase italic text-2xl">Luxury Inventory Loading...</div>

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-[#F5F5F7] text-[#1d1d1f]'} min-h-screen font-sans transition-colors duration-500 text-left`}>
      
      {/* NAVBAR */}
      <nav className="p-6 flex justify-between items-center max-w-[1800px] mx-auto sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-black/5">
        <img src="/logo.png" alt="GLI Logo" className="h-10 w-auto object-contain" />
        <div className="flex items-center gap-6">
            <button onClick={() => setDarkMode(!darkMode)} className="text-[10px] font-black uppercase opacity-40 italic">{darkMode ? 'Light' : 'Dark'}</button>
            <div className="flex items-center gap-6">
                <div className="relative cursor-pointer opacity-80 text-lg">❤️ <span className="absolute -top-2 -right-2 bg-red-500 text-[8px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">{favorites.length}</span></div>
                <button onClick={() => window.open(`https://wa.me/905...`)} className="bg-blue-600 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                    Get Quote ({cart.length})
                </button>
            </div>
        </div>
      </nav>

      <div className="max-w-[1800px] mx-auto flex px-8 py-10 gap-12">
        
        {/* SIDEBAR: İSTEDİĞİN SIRALAMA İLE */}
        <aside className="w-64 flex-shrink-0 hidden xl:block sticky top-32 h-[calc(100vh-160px)] overflow-y-auto pr-4 scrollbar-hide pb-20">
          
          <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] italic mb-2">Refine Search</h2>

          {/* 1. SHAPE */}
          <div>
            <label className={sectionLabel}>1. Shape</label>
            <div className="grid grid-cols-2 gap-2">
              {[,'ROUND','PEAR','OVAL','EMERALD','RADIANT','PRINCESS'].map(s => (
                <button key={s} onClick={() => setFilters({...filters, shape: s})} className={filterBtn('shape', s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* 2. CARAT */}
          <div>
            <label className={sectionLabel}>2. Carat Range</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" className="w-1/2 bg-white dark:bg-white/5 p-2.5 rounded-lg text-[10px] font-bold outline-none border border-black/5" onChange={e => setFilters({...filters, minCarat: e.target.value})} />
              <input type="number" placeholder="Max" className="w-1/2 bg-white dark:bg-white/5 p-2.5 rounded-lg text-[10px] font-bold outline-none border border-black/5" onChange={e => setFilters({...filters, maxCarat: e.target.value})} />
            </div>
          </div>

          {/* 3. PRICE */}
          <div>
            <label className={sectionLabel}>3. Price Range ($)</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" className="w-1/2 bg-white dark:bg-white/5 p-2.5 rounded-lg text-[10px] font-bold outline-none border border-black/5" onChange={e => setFilters({...filters, minPrice: e.target.value})} />
              <input type="number" placeholder="Max" className="w-1/2 bg-white dark:bg-white/5 p-2.5 rounded-lg text-[10px] font-bold outline-none border border-black/5" onChange={e => setFilters({...filters, maxPrice: e.target.value})} />
            </div>
          </div>

          {/* 4. CERTIFICATE (LAB) */}
          <div>
            <label className={sectionLabel}>4. Certificate</label>
            <div className="grid grid-cols-3 gap-2">
              {['NONE','IGI','GIA','GLI','HRD'].map(l => (
                <button key={l} onClick={() => setFilters({...filters, lab: l})} className={filterBtn('lab', l)}>{l}</button>
              ))}
            </div>
          </div>

          {/* 5. COLOR */}
          <div>
            <label className={sectionLabel}>5. Color</label>
            <div className="grid grid-cols-4 gap-2">
              {['NONE','D','E','F','G','H','I'].map(c => (
                <button key={c} onClick={() => setFilters({...filters, color: c})} className={filterBtn('color', c)}>{c}</button>
              ))}
            </div>
          </div>

          {/* 6. CLARITY */}
          <div>
            <label className={sectionLabel}>6. Clarity</label>
            <div className="grid grid-cols-3 gap-2">
              {['NONE','IF','VVS1','VVS2','VS1','VS2','SI1'].map(c => (
                <button key={c} onClick={() => setFilters({...filters, clarity: c})} className={filterBtn('clarity', c)}>{c}</button>
              ))}
            </div>
          </div>

          {/* 7. CUT (DROPDOWN) */}
          <div>
            <label className={sectionLabel}>7. Cut Quality</label>
            <select className="w-full bg-white dark:bg-white/5 p-2.5 rounded-lg text-[10px] font-bold outline-none border border-black/5" onChange={e => setFilters({...filters, cut: e.target.value})}>
              <option value="NONE">NONE</option>
              <option value="EX">EXCELLENT</option>
              <option value="VG">VERY GOOD</option>
              <option value="G">GOOD</option>
            </select>
          </div>

          {/* 8. SORT (4 OPTIONS) */}
          <div>
            <label className={sectionLabel}>8. Sort Results</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-white dark:bg-white/5 p-2.5 rounded-lg text-[10px] font-bold outline-none border border-black/5 italic">
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="carat-low">Carat: Low to High</option>
                <option value="carat-high">Carat: High to Low</option>
            </select>
          </div>

          {/* 9. LAYOUT (GRID DENSITY) */}
          <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/10">
            <h3 className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mb-4">9. Display Layout</h3>
            <div className="flex justify-between text-[8px] font-black opacity-40 mb-2 uppercase italic tracking-widest">
                <span>Wide (3)</span>
                <span>Dense (6)</span>
            </div>
            <input type="range" min="3" max="6" step="1" value={density} onChange={(e) => setDensity(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          </div>
        </aside>

        {/* MAIN INVENTORY GRID */}
        <main className="flex-1">
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${density}, minmax(0, 1fr))`, gap: '1.5rem' }}>
            {processedDiamonds.map((diamond) => (
              <div key={diamond.id} className={`${darkMode ? 'bg-[#1C1C1E] border-white/5 shadow-2xl' : 'bg-white border-transparent shadow-sm hover:shadow-2xl'} group rounded-[2.5rem] border transition-all duration-700 overflow-hidden relative`}>
                
                {/* Image Area */}
                <div className="aspect-square bg-[#F2F2F7] dark:bg-black/40 flex items-center justify-center relative overflow-hidden">
                    {diamond.image_url ? (
                        <img src={diamond.image_url} alt={diamond.sku} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    ) : (
                        <span className="text-3xl opacity-5 font-black uppercase italic tracking-widest leading-none">GLI STOCK</span>
                    )}
                    
                    {/* LAB BADGE */}
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-black/5 shadow-sm">
                        <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{diamond.lab}</span>
                    </div>

                    {/* FAVORITE BUTTON (KALP İKONU) */}
                    <button 
                        onClick={() => toggleFavorite(diamond.id)}
                        className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all z-10 ${favorites.includes(diamond.id) ? 'bg-red-500 text-white shadow-lg' : 'bg-white/40 hover:bg-white text-slate-900 opacity-0 group-hover:opacity-100'}`}
                    >
                        {favorites.includes(diamond.id) ? '❤️' : '♡'}
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <span className="text-[7px] font-black opacity-30 uppercase tracking-[0.2em]">{diamond.sku}</span>
                        <h2 className={`font-black uppercase tracking-tight italic text-blue-900 dark:text-blue-400 ${density > 4 ? 'text-[10px]' : 'text-base'}`}>
                            {diamond.carat}CT {diamond.shape}
                        </h2>
                    </div>

                    {/* 4C Specs Boxes */}
                    {density < 6 && (
                        <div className="grid grid-cols-3 gap-1.5 mb-5 animate-in fade-in zoom-in duration-500">
                            {[
                                {label: 'CLR', val: diamond.color},
                                {label: 'CLA', val: diamond.clarity},
                                {label: 'CUT', val: diamond.cut || 'EX'}
                            ].map(spec => (
                                <div key={spec.label} className="bg-[#F2F2F7] dark:bg-white/5 p-2 rounded-xl text-center border border-black/[0.03]">
                                    <p className="text-[7px] font-black opacity-30 uppercase mb-0.5">{spec.label}</p>
                                    <p className="text-[10px] font-black uppercase tracking-tighter">{spec.val}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-auto border-t border-black/5 dark:border-white/5 pt-4">
                        <p className={`font-black text-slate-900 dark:text-white italic ${density > 5 ? 'text-[10px]' : 'text-base leading-none'}`}>${diamond.total_amount}</p>
                        <button onClick={() => setCart(prev => prev.find(i => i.id === diamond.id) ? prev.filter(i => i.id !== diamond.id) : [...prev, diamond])}
                            className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${cart.find(i => i.id === diamond.id) ? 'bg-green-500 text-white' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/10 active:scale-90 hover:bg-blue-500'}`}>
                           {cart.find(i => i.id === diamond.id) ? 'Added' : 'Add'}
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>

          <footer className="mt-40 mb-20 text-center opacity-30 grayscale pointer-events-none">
            <img src="/logo.png" alt="GLI Logo" className="w-20 mx-auto mb-6" />
            <p className="text-[10px] font-medium tracking-widest uppercase italic max-w-xs mx-auto">
                "At GLI, we are dedicated to providing accurate and reliable diamond grading and certification services."
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}