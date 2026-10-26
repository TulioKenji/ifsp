import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Copy, Pause, Play, TicketPercent, Truck, Zap } from 'lucide-react'
import { Button } from '../Button'

const slides = [
  { title: 'Seu próximo upgrade começa aqui.', eyebrow: 'Seleção GreenStore', description: 'Tecnologia para estudar, criar e jogar. Monte seu próximo setup.', action: 'Explorar produtos', icon: Zap, tone: 'bg-surface-dark', accent: 'text-hulk' },
  { title: 'Mais tecnologia. Menos no total.', eyebrow: 'Cupom GREEN10', description: '10% de desconto, limitado a R$ 50 por pedido. Digite GREEN10 no checkout.', action: 'Copiar GREEN10', icon: TicketPercent, tone: 'bg-primary-900', accent: 'text-primary-200' },
  { title: 'Frete por nossa conta.', eyebrow: 'Entrega GreenStore', description: 'Frete grátis em todos os pedidos desta versão. Escolha seus produtos e aproveite.', action: 'Aproveitar frete grátis', icon: Truck, tone: 'bg-surface-darker', accent: 'text-hulk-light' },
]
export function PromotionSwiper() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [hover, setHover] = useState(false)
  const [focused, setFocused] = useState(false)
  const [copied, setCopied] = useState(false)
  const start = useRef<number | null>(null)
  const go = (offset: number) => setIndex((i) => (i + offset + slides.length) % slides.length)
  useEffect(() => {
    if (!playing || hover || focused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500)
    return () => window.clearInterval(timer)
  }, [playing, hover, focused])
  return <section id="promocoes" aria-label="Promoções GreenStore" aria-roledescription="carrossel" className="mb-10 scroll-mt-64 overflow-hidden rounded-3xl border border-primary-800 bg-surface-dark shadow-xl" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false) }} onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1) }}>
    <div className="overflow-hidden" onPointerDown={(e) => { start.current = e.clientX }} onPointerUp={(e) => { if (start.current !== null && Math.abs(e.clientX - start.current) > 60) go(e.clientX < start.current ? 1 : -1); start.current = null }} onPointerCancel={() => { start.current = null }} style={{ touchAction: 'pan-y' }}>
      <div className="flex transition-transform duration-700 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((slide, i) => <div key={slide.eyebrow} role="group" aria-roledescription="slide" aria-label={`${i + 1} de ${slides.length}`} aria-hidden={index !== i} inert={index !== i} className={`relative flex min-h-80 w-full shrink-0 items-center overflow-hidden px-7 py-10 text-text-inverse sm:px-12 ${slide.tone}`}>
          <div className="relative z-10 max-w-2xl"><p className={`mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] ${slide.accent}`}><slide.icon size={17} />{slide.eyebrow}</p><h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{slide.title}</h1><p className="mt-4 max-w-lg text-sm leading-6 text-text-dark sm:text-base">{slide.description}</p>
            <Button tone="brand" className="mt-6" onClick={() => { if (i === 1) { navigator.clipboard?.writeText('GREEN10').then(() => setCopied(true)).catch(() => setCopied(false)) } else document.getElementById('produtos')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) }}>{i === 1 && <Copy size={16} />}{i === 1 && copied ? 'Código copiado!' : slide.action}</Button>
          </div><slide.icon aria-hidden="true" className={`pointer-events-none absolute -right-8 -bottom-10 size-64 -rotate-12 opacity-10 sm:right-10 sm:size-80 ${slide.accent}`} />
        </div>)}
      </div>
    </div>
    <div className="flex items-center justify-between border-t border-primary-800 px-5 py-3 text-text-inverse"><div className="flex gap-2">{slides.map((s, i) => <button key={s.eyebrow} type="button" aria-label={`Ver promoção ${i + 1}`} aria-current={index === i ? 'true' : undefined} onClick={() => setIndex(i)} className={`h-2.5 rounded-full transition-all hover:bg-hulk focus-visible:outline-hulk ${index === i ? 'w-8 bg-hulk' : 'w-2.5 bg-primary-700'}`} />)}</div><div className="flex gap-1">{[{ label: 'Promoção anterior', action: () => go(-1), Icon: ChevronLeft }, { label: playing ? 'Pausar carrossel' : 'Reproduzir carrossel', action: () => setPlaying(!playing), Icon: playing ? Pause : Play }, { label: 'Próxima promoção', action: () => go(1), Icon: ChevronRight }].map(({ label, action, Icon }) => <button key={label} type="button" aria-label={label} onClick={action} className="rounded-full p-2 transition hover:bg-primary-800 hover:text-hulk focus-visible:outline-hulk"><Icon size={18} /></button>)}</div></div>
  </section>
}
