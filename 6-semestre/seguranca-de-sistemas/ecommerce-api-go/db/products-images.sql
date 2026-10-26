-- Imagens de demonstração para produtos sem vendedor e ainda sem imagens.
-- A lista anterior tinha slugs diferentes dos presentes em products.sql.
-- Preserva qualquer imagem existente e não duplica ao executar novamente.
INSERT INTO product_images (product_id, url, alt_text, sort_order)
SELECT p.id,
       'https://images.weserv.nl/?url=https://picsum.photos/seed/' ||
       p.slug || '/800/600&w=800&output=webp',
       p.name, 0
FROM products p
WHERE p.seller_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
