"use client"
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

export default function KatalogPage() {
  const [diamonds, setDiamonds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [density, setDensity] = useState(3) // Satırdaki ürün sayısı (3-6)
  const [cart, setCart] = useState<any[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
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

  // Filtreleme ve Sıralama Mantığı
  const processedDiamonds = useMemo(() => {
    let result = diamonds.filter(d => {
      return (filters.shape === 'NONE' || d.shape === filters.shape) &&
             (filters.lab === 'NONE' || d.lab === filters.lab) &&
             (filters.color === 'NONE' || d.color === filters.color) &&
             (filters.clarity === 'NONE' || d.clarity === filters.clarity) &&
             (filters.cut === 'NONE' || d.cut === filters.cut) &&
             (filters.minCarat === '' || d.carat >= parseFloat(filters.minCarat)) &&
             (filters.maxCarat === '' || d.carat <= parseFloat(filters.maxCarat))
    })

    if (sortBy === 'price-low') result.sort((a, b) => a.total_amount - b.total_amount)
    if (sortBy === 'price-high') result.sort((a, b) => b.total_amount - a.total_amount)
    if (sortBy === 'carat-low') result.sort((a, b) => a.carat - b.carat)
    if (sortBy === 'carat-high') result.sort((a, b) => b.carat - a.carat)
    
    return result
  }, [diamonds, filters, sortBy])

  const handleGetQuote = () => {
    if (cart.length === 0) return alert("Please select items first!")
    const items = cart.map(d => `- ${d.sku} | ${d.carat}ct ${d.color}/${d.clarity}`).join('%0A')
    const message = `Hello, I'm interested in these items:%0A${items}`
    window.open(`https://wa.me/905XXXXXXXXXX?text=${message}`, '_blank')
  }

  const sectionLabel = "text-[9px] font-black opacity-30 uppercase tracking-[0.2em] block mb-3 mt-8"
  const filterBtnClass = (field: string, val: string) => `px-2 py-1.5 rounded-md text-[9px] font-bold transition-all ${filters[field] === val ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-white/5 opacity-60 hover:opacity-100'}`

  // Sidebar İçeriği
  const SidebarContent = () => (
    <div className="text-left">
      <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] italic mb-2">Search Filters</h2>
      
      <label className={sectionLabel}>1. Shape</label>
      <div className="grid grid-cols-2 gap-2">
        {['NONE','ROUND','PEAR','OVAL','EMERALD','RADIANT','PRINCESS'].map(s => (
          <button key={s} onClick={() => setFilters({...filters, shape: s})} className={filterBtnClass('shape', s)}>{s}</button>
        ))}
      </div>

      <label className={sectionLabel}>2. Carat Range</label>
      <div className="flex gap-2">
        <input type="number" placeholder="Min" className="w-1/2 bg-white dark:bg-white/5 p-2.5 rounded-lg text-[10px] font-bold outline-none border border-black/5" onChange={e => setFilters({...filters, minCarat: e.target.value})} />
        <input type="number" placeholder="Max" className="w-1/2 bg-white dark:bg-white/5 p-2.5 rounded-lg text-[10px] font-bold outline-none border border-black/5" onChange={e => setFilters({...filters, maxCarat: e.target.value})} />
      </div>

      <label className={sectionLabel}>4. Certificate</label>
      <div className="grid grid-cols-3 gap-2">
        {['NONE','IGI','GIA','GLI','HRD'].map(l => (
          <button key={l} onClick={() => setFilters({...filters, lab: l})} className={filterBtnClass('lab', l)}>{l}</button>
        ))}
      </div>

      <label className={sectionLabel}>5. Color</label>
      <div className="grid grid-cols-4 gap-2">
        {['NONE','D','E','F','G','H','I'].map(c => (
          <button key={c} onClick={() => setFilters({...filters, color: c})} className={filterBtnClass('color', c)}>{c}</button>
        ))}
      </div>

      <label className={sectionLabel}>8. Sort By</label>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-white dark:bg-white/5 p-2.5 rounded-lg text-[10px] font-bold border border-black/5 outline-none italic uppercase">
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="carat-high">Carat: High to Low</option>
      </select>

      <div className="mt-12 pt-8 border-t border-black/5 hidden lg:block">
        <h3 className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mb-4">9. Grid Density</h3>
        <div className="flex justify-between text-[8px] font-black opacity-40 mb-2 uppercase italic tracking-widest">
            <span>Wide</span>
            <span>Dense</span>
        </div>
        <input type="range" min="3" max="6" step="1" value={density} onChange={(e) => setDensity(parseInt(e.target.value))} className="w-full h-1 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
      </div>
    </div>
  )

  if (loading) return <div className="h-screen flex items-center justify-center font-black opacity-10 tracking-[0.5em] text-2xl uppercase italic">GLI Luxury Inventory</div>

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-[#F5F5F7] text-[#1d1d1f]'} min-h-screen font-sans transition-colors duration-500`}>
      
      {/* NAVBAR */}
      <nav className="p-4 md:p-6 flex justify-between items-center max-w-[1800px] mx-auto sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-black/5">
        <img src="/logo.png" alt="GLI Logo" className="h-8 md:h-10 w-auto object-contain" />
        <div className="flex items-center gap-3 md:gap-8">
            <button onClick={() => setShowMobileFilters(true)} className="lg:hidden bg-white/50 dark:bg-white/10 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Filters</button>
            <button onClick={() => setDarkMode(!darkMode)} className="text-[10px] font-black uppercase opacity-40 italic">{darkMode ? 'Light' : 'Dark'}</button>
            <div className="flex items-center gap-4">
                <div className="relative opacity-80 text-lg cursor-pointer">❤️ <span className="absolute -top-2 -right-2 bg-red-500 text-[8px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">{favorites.length}</span></div>
                <button onClick={handleGetQuote} className="bg-blue-600 text-white px-5 py-2 md:px-7 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                    Quote ({cart.length})
                </button>
            </div>
        </div>
      </nav>

      <div className="max-w-[1800px] mx-auto flex px-4 md:px-8 py-6 md:py-10 gap-12">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="w-64 flex-shrink-0 hidden lg:block sticky top-32 h-[calc(100vh-160px)] overflow-y-auto pr-4 scrollbar-hide pb-20">
          <SidebarContent />
        </aside>

        {/* MOBILE FILTER OVERLAY */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden">
            <div className="absolute right-0 top-0 h-full w-[85%] bg-white dark:bg-[#1C1C1E] p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center mb-8">
                <span className="font-black text-sm uppercase italic">Filters</span>
                <button onClick={() => setShowMobileFilters(false)} className="text-2xl">&times;</button>
              </div>
              <SidebarContent />
              <button onClick={() => setShowMobileFilters(false)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black mt-10 sticky bottom-0">Apply</button>
            </div>
          </div>
        )}

        {/* MAIN LIST */}
        <main className="flex-1">
          <div 
            className="grid gap-4 md:gap-6"
            style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(var(--cols), minmax(0, 1fr))`,
            } as any}
          >
            <style jsx>{`
              div { --cols: 2; }
              @media (min-width: 1024px) { div { --cols: ${density}; } }
            `}</style>

            {processedDiamonds.map((diamond) => (
              <div key={diamond.id} className={`${darkMode ? 'bg-[#1C1C1E] border-white/5 shadow-2xl' : 'bg-white border-transparent shadow-sm hover:shadow-2xl'} group rounded-[1.8rem] md:rounded-[2.5rem] border transition-all duration-700 overflow-hidden relative text-left`}>
                
                <div className="aspect-square bg-[#F2F2F7] dark:bg-black/40 flex items-center justify-center relative overflow-hidden italic">
                    {diamond.image_url ? (
                        <img src={diamond.image_url} alt={diamond.sku} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    ) : (
                        <span className="text-2xl md:text-3xl opacity-5 font-black uppercase tracking-widest leading-none">GLI STOCK</span>
                    )}
                    <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 dark:bg-black/60 backdrop-blur-md px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg border border-black/5 shadow-sm">
                        <span className="text-[7px] md:text-[8px] font-black text-blue-600 uppercase tracking-widest">{diamond.lab}</span>
                    </div>
                    <button onClick={() => setFavorites(prev => prev.includes(diamond.id) ? prev.filter(i => i !== diamond.id) : [...prev, diamond.id])}
                      className={`absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full transition-all z-10 ${favorites.includes(diamond.id) ? 'bg-red-500 text-white shadow-lg' : 'bg-white/40 hover:bg-white text-slate-900 md:opacity-0 group-hover:opacity-100'}`}>
                        ❤️
                    </button>
                </div>

                <div className="p-4 md:p-6">
                    <div className="mb-2 md:mb-4">
                        <span className="text-[6px] md:text-[7px] font-black opacity-30 uppercase tracking-[0.1em]">{diamond.sku}</span>
                        <h2 className={`font-black uppercase tracking-tight italic text-blue-900 dark:text-blue-400 ${density > 4 ? 'text-[8px]' : 'text-xs md:text-base leading-tight'}`}>
                            {diamond.carat}CT {diamond.shape}
                        </h2>
                    </div>

                    {density < 6 && (
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
                    )}

                    <div className="flex justify-between items-center mt-auto border-t border-black/5 pt-3 md:pt-4">
                        <p className={`font-black text-slate-900 dark:text-white italic ${density > 5 ? 'text-[9px]' : 'text-xs md:text-xl leading-none'}`}>${diamond.total_amount}</p>
                        <button onClick={() => setCart(prev => prev.find(i => i.id === diamond.id) ? prev.filter(i => i.id !== diamond.id) : [...prev, diamond])}
                            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[7px] md:text-[9px] font-black uppercase tracking-widest transition-all ${cart.find(i => i.id === diamond.id) ? 'bg-green-500 text-white' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/10 active:scale-90'}`}>
                           {cart.find(i => i.id === diamond.id) ? 'Added' : 'Add'}
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>

          <footer className="mt-40 mb-20 text-center opacity-20 grayscale pointer-events-none">
            <img src="/logo.png" alt="GLI Logo" className="w-16 mx-auto mb-6" />
            <p className="text-[9px] font-medium tracking-[0.2em] uppercase italic max-w-xs mx-auto">
                "Dedicated to providing accurate and reliable diamond grading."
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}