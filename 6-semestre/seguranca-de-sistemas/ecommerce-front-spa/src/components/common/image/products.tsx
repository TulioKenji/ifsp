import noImageProduct from '../../../assets/no-image-product.png'
import { Image } from './index'

export function ProductImage({ product, className }: { product: Product; className?: string }) {
	return (
		<Image
			src={product.url??undefined}
			alt={product.name}
			className={className}
			fallback={<img src={noImageProduct} alt={`${product.name} sem imagem`} className={className} />}
		/>
	)
}
