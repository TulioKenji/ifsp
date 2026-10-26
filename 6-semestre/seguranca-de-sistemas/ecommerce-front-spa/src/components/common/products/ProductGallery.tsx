import { useState } from 'react'
import { Image } from '../image'
import fallback from '../../../assets/no-image-product.png'

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [selected, setSelected] = useState(0)
  const source = images[selected]
  return <div><div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-10"><Image key={source} src={source} alt={name} className="max-h-full w-full object-contain" fallback={<img src={fallback} alt={`${name} sem imagem`} className="max-h-full w-full object-contain" />} /></div>
    {images.length > 1 && <div className="mt-4 flex gap-3 overflow-x-auto p-1" aria-label="Imagens do produto">{images.map((src, i) => <button key={`${src}-${i}`} type="button" aria-label={`Ver imagem ${i + 1} de ${name}`} aria-pressed={i === selected} onClick={() => setSelected(i)} className={`size-20 shrink-0 overflow-hidden rounded-xl border bg-surface p-2 transition hover:border-primary-600 ${i === selected ? 'border-primary-600 ring-2 ring-primary-200' : 'border-border'}`}><Image src={src} alt="" loading="lazy" className="size-full object-contain" /></button>)}</div>}
  </div>
}
