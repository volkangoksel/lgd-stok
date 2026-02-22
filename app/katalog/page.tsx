"use client"
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

export default function KatalogPage() {
  const [diamonds, setDiamonds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [density, setDensity] = useState(3)
  const [cart, setCart] = useState<any[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  
  // Mobil Filtre Paneli Kontrolü
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const [sortBy, setSortBy] = useState('price-low')
  const [filters, setFilters] = useState<any>({
    shape: 'NONE', minCarat: '', maxCarat: '',
    minPrice: '', maxPrice: '', lab: 'NONE',
    color: 'NONE', clarity: 'NONE', cut: 'NONE'
  })

  useEffect(() => {
    async function getDiamonds() {
      const { data, error } = await supabase.from('diamonds').select('*').order('created_at', { ascending: false })
      if (!error && data) setDiamonds(data)
      setLoading(false)
    }
    getDiamonds()
  }, [])

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

  const sectionLabel = "text-[10px] font-black opacity-30 uppercase tracking-[0.2em] block mb-3 mt-6"
  const filterBtn = (field: string, val: string) => `px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${filters[field] === val ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-white/5 opacity-70 border border-black/5'}`

  if (loading) return <div className="h-screen flex items-center justify-center font-black opacity-10 tracking-[0.5em] text-xl">GLI INVENTORY</div>

  // SIDEBAR İÇERİĞİ (Hem masaüstü hem mobil için tek bir parça olarak tanımladık)
  const FilterContent = () => (
    <div className="space-y-2">
      <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-4 italic">Refine Search</h2>
      
      <label className={sectionLabel}>1. Shape</label>
      <div className="grid grid-cols-2 gap-2">
        {['NONE','ROUND','PEAR','OVAL','EMERALD','RADIANT','PRINCESS'].map(s => (
          <button key={s} onClick={() => setFilters({...filters, shape: s})} className={filterBtn('shape', s)}>{s}</button>
        ))}
      </div>

      <label className={sectionLabel}>2. Carat & 3. Price</label>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" placeholder="Min CT" className="bg-white dark:bg-white/5 p-3 rounded-xl text-[10px] font-bold border border-black/5 outline-none w-full" onChange={e => setFilters({...filters, minCarat: e.target.value})} />
        <input type="number" placeholder="Max CT" className="bg-white dark:bg-white/5 p-3 rounded-xl text-[10px] font-bold border border-black/5 outline-none w-full" onChange={e => setFilters({...filters, maxCarat: e.target.value})} />
      </div>

      <label className={sectionLabel}>4. Certificate</label>
      <div className="grid grid-cols-3 gap-2">
        {['NONE','IGI','GIA','GLI','HRD'].map(l => (
          <button key={l} onClick={() => setFilters({...filters, lab: l})} className={filterBtn('lab', l)}>{l}</button>
        ))}
      </div>

      <label className={sectionLabel}>5. Color</label>
      <div className="grid grid-cols-4 gap-1.5">
        {['NONE','D','E','F','G','H','I'].map(c => (
          <button key={c} onClick={() => setFilters({...filters, color: c})} className={filterBtn('color', c)}>{c}</button>
        ))}
      </div>

      <label className={sectionLabel}>8. Sort Results</label>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-white dark:bg-white/5 p-3 rounded-xl text-[10px] font-bold border border-black/5 outline-none italic uppercase">
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="carat-high">Carat: High to Low</option>
      </select>

      <div className="mt-10 pt-6 border-t border-black/5 hidden md:block">
        <h3 className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mb-4">9. Layout Density</h3>
        <input type="range" min="3" max="6" step="1" value={density} onChange={(e) => setDensity(parseInt(e.target.value))} className="w-full h-1 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
      </div>
    </div>
  )

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-[#F5F5F7] text-[#1d1d1f]'} min-h-screen font-sans transition-colors duration-500`}>
      
      {/* NAVBAR */}
      <nav className="p-4 md:p-6 flex justify-between items-center max-w-[1800px] mx-auto sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-black/5">
        <img src="/logo.png" alt="GLI Logo" className="h-8 md:h-10 w-auto object-contain" />
        
        <div className="flex items-center gap-3 md:gap-6">
            <button onClick={() => setShowMobileFilters(true)} className="md:hidden bg-white/50 dark:bg-white/10 px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                Filters
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="text-[10px] font-black uppercase opacity-40">
                {darkMode ? 'Light' : 'Dark'}
            </button>
            <button className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                Bag ({cart.length})
            </button>
        </div>
      </nav>

      <div className="max-w-[1800px] mx-auto flex px-4 md:px-8 py-6 md:py-10 gap-10">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="w-64 flex-shrink-0 hidden xl:block sticky top-32 h-[calc(100vh-160px)] overflow-y-auto pr-4 scrollbar-hide pb-20">
          <FilterContent />
        </aside>

        {/* MOBILE FILTER OVERLAY (DRAWER) */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm xl:hidden">
            <div className="absolute right-0 top-0 h-full w-[85%] bg-white dark:bg-[#1C1C1E] p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center mb-6">
                <span className="font-black text-sm uppercase italic">Search Filters</span>
                <button onClick={() => setShowMobileFilters(false)} className="text-2xl">&times;</button>
              </div>
              <FilterContent />
              <button onClick={() => setShowMobileFilters(false)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black mt-8 sticky bottom-0">APPLY FILTERS</button>
            </div>
          </div>
        )}

        {/* MAIN LISTING AREA */}
        <main className="flex-1">
          <div className="grid gap-4 md:gap-6" 
               style={{ 
                 display: 'grid',
                 // MOBİLDE 2 KOLON, DESKTOPTA 'density' KADAR KOLON
                 gridTemplateColumns: `repeat(var(--cols), minmax(0, 1fr))`,
               } as any}>
            <style jsx>{`
              div { --cols: 2; }
              @media (min-width: 1024px) { div { --cols: ${density}; } }
            `}</style>
            
            {processedDiamonds.map((diamond) => (
              <div key={diamond.id} className={`${darkMode ? 'bg-[#1C1C1E] border-white/5 shadow-2xl' : 'bg-white border-transparent shadow-sm hover:shadow-2xl'} group rounded-[1.5rem] md:rounded-[2.5rem] border transition-all duration-700 overflow-hidden relative text-left`}>
                
                {/* Image Area */}
                <div className="aspect-square bg-[#F2F2F7] dark:bg-black/40 flex items-center justify-center relative overflow-hidden">
                    {diamond.image_url ? (
                        <img src={diamond.image_url} alt={diamond.sku} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    ) : (
                        <span className="text-xl md:text-3xl opacity-5 font-black uppercase italic">GLI STOCK</span>
                    )}
                    
                    <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white/90 dark:bg-black/60 backdrop-blur-md px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-lg border border-black/5 shadow-sm">
                        <span className="text-[7px] md:text-[8px] font-black text-blue-600 uppercase">{diamond.lab}</span>
                    </div>

                    <button onClick={() => setFavorites(prev => prev.includes(diamond.id) ? prev.filter(i => i !== diamond.id) : [...prev, diamond.id])}
                      className={`absolute top-2 md:top-4 right-2 md:right-4 p-2 rounded-full transition-all z-10 ${favorites.includes(diamond.id) ? 'bg-red-500 text-white' : 'bg-white/40 opacity-0 group-hover:opacity-100'}`}>
                        ❤️
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-3 md:p-6">
                    <div className="mb-2 md:mb-4">
                        <span className="text-[6px] md:text-[7px] font-black opacity-30 uppercase tracking-[0.1em]">{diamond.sku}</span>
                        <h2 className={`font-black uppercase tracking-tight italic text-blue-900 dark:text-blue-400 leading-tight ${density > 4 ? 'text-[8px]' : 'text-xs md:text-base'}`}>
                            {diamond.carat}CT {diamond.shape}
                        </h2>
                    </div>

                    {/* Specs - Mobilde dikey veya daha küçük kutular */}
                    <div className="grid grid-cols-3 gap-1 mb-3 md:mb-5">
                        {[
                            {label: 'CLR', val: diamond.color},
                            {label: 'CLA', val: diamond.clarity},
                            {label: 'CUT', val: diamond.cut || 'EX'}
                        ].map(spec => (
                            <div key={spec.label} className="bg-[#F2F2F7] dark:bg-white/5 p-1 md:p-2 rounded-lg text-center border border-black/[0.03]">
                                <p className="text-[5px] md:text-[7px] font-black opacity-30 uppercase mb-0.5">{spec.label}</p>
                                <p className="text-[7px] md:text-[10px] font-black uppercase">{spec.val}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-black/5 pt-2 md:pt-4">
                        <p className={`font-black text-slate-900 dark:text-white italic ${density > 5 ? 'text-[8px]' : 'text-[10px] md:text-base'}`}>${diamond.total_amount}</p>
                        <button onClick={() => setCart(prev => prev.find(i => i.id === diamond.id) ? prev.filter(i => i.id !== diamond.id) : [...prev, diamond])}
                            className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[7px] md:text-[9px] font-black uppercase transition-all ${cart.find(i => i.id === diamond.id) ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
                           {cart.find(i => i.id === diamond.id) ? '✓' : 'Add'}
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>

          <footer className="mt-20 mb-10 text-center opacity-20 grayscale pointer-events-none scale-75">
            <img src="/logo.png" alt="GLI Logo" className="w-16 mx-auto mb-4" />
            <p className="text-[8px] font-medium tracking-widest uppercase italic max-w-xs mx-auto leading-loose">
                Dedicated to accurate grading services.
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}