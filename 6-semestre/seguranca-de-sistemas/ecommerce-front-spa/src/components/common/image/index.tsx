import { ImageOff } from 'lucide-react'
import { useState, type ImgHTMLAttributes, type ReactNode } from 'react'

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
	src?: string
	fallback?: ReactNode
}

export function Image({ src, alt = '', fallback, className, onError, ...props }: ImageProps) {
	const [hasError, setHasError] = useState(!src)

	if (hasError) {
		return fallback ?? (
			<div role="img" aria-label={alt || 'Imagem indisponível'} className={`flex size-full items-center justify-center ${className ?? ''}`}>
				<ImageOff aria-hidden="true" className="size-10" />
			</div>
		)
	}

	return (
		<img
			{...props}
			src={src}
			alt={alt}
			className={className}
			onError={(event) => {
				setHasError(true)
				onError?.(event)
			}}
		/>
	)
}
