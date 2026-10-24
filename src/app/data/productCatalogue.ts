import {
  productCatalogue,
  PRODUCT_CATALOGUE_VERSION,
} from './catalogue';

export { PRODUCT_CATALOGUE_VERSION };

export const PRODUCT_CATALOGUE_SOURCE = 'B_Interior_Product_Catalogue_With_Images.xlsx';

export const normalizeProducts = (products: any[]) => products.map((product: any) => ({
  ...product,
  id: product.id || product.internalSku?.toLowerCase() || product.sku?.toLowerCase(),
  sku: product.sku || product.internalSku || '',
  internalSku: product.internalSku || product.sku || '',
  mainImage: product.mainImage || product.image || product.image_url || '',
  image: product.image || product.mainImage || product.image_url || '',
  gallery: Array.isArray(product.gallery) ? product.gallery : [],
  tags: Array.isArray(product.tags) ? product.tags : [],
  rooms: Array.isArray(product.rooms) ? product.rooms : [],
}));

export const bundledProductCatalogue = normalizeProducts(productCatalogue);

/**
 * Accept product responses from the current catalogue API only. This prevents an
 * older deployed function containing placeholder products from replacing the
 * workbook catalogue bundled with the frontend.
 */
export const resolveProductCatalogue = (data: unknown, responseVersion?: string | null) => {
  if (!Array.isArray(data)) return bundledProductCatalogue;

  const normalized = normalizeProducts(data);
  const isCurrentVersion = responseVersion === PRODUCT_CATALOGUE_VERSION;
  const containsWorkbookProducts = normalized.some(
    (product) => product.sourceWorkbook === PRODUCT_CATALOGUE_SOURCE,
  );

  if (isCurrentVersion || containsWorkbookProducts) return normalized;
  return bundledProductCatalogue;
};
