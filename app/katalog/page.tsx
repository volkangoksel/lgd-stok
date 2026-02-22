"use client"
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { LayoutGrid, List, ChevronDown, Check } from 'lucide-react'

export default function KatalogPage() {
  const [diamonds, setDiamonds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [density, setDensity] = useState(3)
  const [cart, setCart] = useState<any[]>([])
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<any>({ shape: 'NONE', lab: 'NONE' })

  useEffect(() => {
    async function getDiamonds() {
      const { data } = await supabase.from('diamonds').select('*').order('priority', { ascending: false })
      if (data) setDiamonds(data)
      setLoading(false)
    }
    getDiamonds()
  }, [])

  if (loading) return <div className="h-screen flex items-center justify-center font-black opacity-10 tracking-[0.5em] text-2xl uppercase">Opening GLI Vault...</div>

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'} min-h-screen font-sans antialiased text-left pb-20`}>
      {/* Vitrin Navbar */}
      <nav className="fixed top-0 w-full h-14 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 z-[100] flex items-center">
        <div className="max-w-[1400px] mx-auto w-full px-6 flex justify-between items-center">
          <img src="/logo.png" className="h-6 object-contain" />
          <div className="flex items-center gap-8">
            <button onClick={() => setDarkMode(!darkMode)} className="text-[10px] font-black uppercase opacity-40 italic">{darkMode ? 'Light' : 'Dark'}</button>
            <button className="bg-[#0071E3] text-white px-6 py-2 rounded-full text-[10px] font-black shadow-lg">Bag ({cart.length})</button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto flex pt-24 px-6 gap-12">
        <aside className="w-64 hidden lg:block sticky top-24 h-fit text-left">
           <h1 className="text-4xl font-black tracking-tighter italic uppercase mb-10">Store.</h1>
           <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mb-4 italic text-blue-600">Refine Search</p>
           {/* Filtreleme butonlarını buraya ekleyebilirsin */}
        </aside>

        <main className="flex-1">
          <div className={viewType === 'grid' ? `grid gap-6 grid-cols-2 lg:grid-cols-${density}` : "flex flex-col gap-3"}>
            {diamonds.map(diamond => (
              <div key={diamond.id} className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-black/[0.02] text-left">
                <div className="aspect-square bg-slate-50 dark:bg-black/40 rounded-2xl mb-6 flex items-center justify-center overflow-hidden italic font-black opacity-10">
                    {diamond.image_url ? <img src={diamond.image_url} className="w-full h-full object-cover" /> : 'GLI'}
                </div>
                <h2 className="text-lg font-black leading-tight italic uppercase text-blue-900">{diamond.carat}CT {diamond.shape}</h2>
                <div className="flex justify-between items-center mt-6 pt-5 border-t border-black/5">
                   <span className="text-2xl font-black italic tracking-tighter">${diamond.total_amount}</span>
                   <button onClick={() => setCart([...cart, diamond.id])} className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">+</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}