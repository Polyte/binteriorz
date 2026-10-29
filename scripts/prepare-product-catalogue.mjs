import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import XLSX from 'xlsx';

const workbookPath = process.argv[2];
const suppliedExtractDir = process.argv[3];
if (!workbookPath) throw new Error('Usage: node scripts/prepare-product-catalogue.mjs <catalogue.xlsx> [extracted-xlsx-dir]');

const root = process.cwd();
const imageDir = path.join(root, 'public', 'product-images');
const dataDir = path.join(root, 'catalogue-import');
const extractDir = suppliedExtractDir || fs.mkdtempSync(path.join(os.tmpdir(), 'b-interiors-catalogue-'));
fs.mkdirSync(imageDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

if (!suppliedExtractDir) execFileSync('unzip', ['-q', workbookPath, '-d', extractDir]);

const workbook = XLSX.readFile(workbookPath);
const productSheet = workbook.Sheets['Product Master'];
const gallerySheet = workbook.Sheets['Product Image Gallery'];
if (!productSheet || !gallerySheet) throw new Error('Workbook must contain Product Master and Product Image Gallery sheets.');

const productRows = XLSX.utils.sheet_to_json(productSheet, { defval: '' });
const galleryRows = XLSX.utils.sheet_to_json(gallerySheet, { defval: '' });

const drawingPath = path.join(extractDir, 'xl', 'drawings', 'drawing2.xml');
const relationshipPath = path.join(extractDir, 'xl', 'drawings', '_rels', 'drawing2.xml.rels');
if (!fs.existsSync(drawingPath) || !fs.existsSync(relationshipPath)) {
  throw new Error('The Product Image Gallery drawing relationships are missing from the workbook.');
}

const drawingXml = fs.readFileSync(drawingPath, 'utf8');
const relationshipXml = fs.readFileSync(relationshipPath, 'utf8');
const relationshipTargets = new Map();
for (const match of relationshipXml.matchAll(/<Relationship\b([^>]+)\/>/g)) {
  const attributes = match[1];
  const id = attributes.match(/\bId="([^"]+)"/)?.[1];
  const target = attributes.match(/\bTarget="([^"]+)"/)?.[1];
  if (id && target) relationshipTargets.set(id, target);
}

const galleryMediaByRow = new Map();
for (const match of drawingXml.matchAll(/<xdr:(?:oneCellAnchor|twoCellAnchor)>[\s\S]*?<xdr:from>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>[\s\S]*?<a:blip\s+r:embed="([^"]+)"[\s\S]*?<\/xdr:(?:oneCellAnchor|twoCellAnchor)>/g)) {
  const rowIndex = Number(match[1]);
  const target = relationshipTargets.get(match[2]);
  if (target) galleryMediaByRow.set(rowIndex, path.join(extractDir, target.replace(/^\//, '')));
}

const sanitizeFileName = (value) => path.basename(String(value || '').trim()).replace(/[^a-zA-Z0-9._-]/g, '-');
const parseMoney = (value) => {
  const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};
const splitList = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
const slugify = (value) => String(value || '').trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Workbook gallery pictures are often small embedded thumbnails that look blurry when enlarged on the site.
const MIN_GALLERY_WIDTH = 600;
const imageWidth = (filePath) => Number(execFileSync('magick', ['identify', '-format', '%w', `${filePath}[0]`]).toString());

const galleryBySku = new Map();
for (const [index, row] of galleryRows.entries()) {
  const sku = String(row['Internal SKU'] || '').trim();
  if (!sku) continue;
  const fileName = sanitizeFileName(row['Original Media File']);
  const worksheetRowIndex = Number.isInteger(row.__rowNum__) ? row.__rowNum__ : index + 1;
  const sourceImage = galleryMediaByRow.get(worksheetRowIndex);
  if (!sourceImage || !fs.existsSync(sourceImage)) {
    throw new Error(`Could not resolve embedded image for ${sku}, gallery row ${worksheetRowIndex + 1}.`);
  }
  fs.copyFileSync(sourceImage, path.join(imageDir, fileName));
  const galleryItem = {
    url: `/product-images/${fileName}`,
    type: 'image',
    fileName,
    position: Number(row['Image No.']) || 1,
  };
  const gallery = galleryBySku.get(sku) || [];
  gallery.push(galleryItem);
  galleryBySku.set(sku, gallery);
}

const roomByCategory = {
  Beds: ['bedroom'],
  Bedroom: ['bedroom'],
  Chairs: ['living-room', 'dining-room'],
  Curtains: ['living-room', 'bedroom'],
  Cushions: ['living-room', 'bedroom'],
  Decor: ['living-room', 'entryway'],
  Lamps: ['living-room', 'bedroom', 'home-office'],
  'Living Room': ['living-room'],
  Rugs: ['living-room', 'bedroom'],
  Tables: ['living-room', 'dining-room'],
};

const products = productRows.map((row, index) => {
  const originalId = String(row['Original ID'] || `BI-${String(index + 1).padStart(3, '0')}`).trim();
  const sku = String(row['Internal SKU'] || originalId).trim();
  const category = String(row.Category || 'Uncategorized').trim();
  const workbookGallery = (galleryBySku.get(sku) || []).sort((a, b) => a.position - b.position);
  const expectedGallery = splitList(row['Gallery Images']);
  const workbookImageCount = Number(row['Image Count']) || workbookGallery.length;
  if (workbookGallery.length !== workbookImageCount || (expectedGallery.length && workbookGallery.length !== expectedGallery.length)) {
    throw new Error(`Gallery count mismatch for ${sku}: expected ${workbookImageCount}, resolved ${workbookGallery.length}.`);
  }
  const highResolutionFileName = `${originalId.toLowerCase()}.jpg`;
  const highResolutionFilePath = path.join(imageDir, highResolutionFileName);
  if (!fs.existsSync(highResolutionFilePath)) {
    throw new Error(`High-resolution product image is missing for ${sku}: ${highResolutionFileName}`);
  }
  const highResolutionImage = {
    url: `/product-images/${highResolutionFileName}`,
    type: 'image',
    fileName: highResolutionFileName,
    position: 1,
    quality: 'high-resolution',
  };
  const sharpExtras = workbookGallery.slice(1).filter((item) => imageWidth(path.join(imageDir, item.fileName)) >= MIN_GALLERY_WIDTH);
  const gallery = [highResolutionImage, ...sharpExtras];
  const imageCount = gallery.length;
  const availability = String(row.Availability || '').trim();
  const searchTags = splitList(row['Search Tags']);
  const mainImage = gallery[0]?.url || '';
  const materialFinish = String(row['Material / Finish'] || '').trim();
  const productName = String(row['Website Product Name'] || '').trim();

  return {
    id: sku.toLowerCase(),
    originalId,
    sku,
    internalSku: sku,
    barcode: String(row['Barcode (Code 128)'] || sku).trim(),
    barcodeFormat: 'CODE128',
    barcodeType: 'Internal Code 128 (not retail GTIN)',
    category,
    name: productName,
    description: String(row['Product Description'] || '').trim(),
    color: String(row.Color || '').trim(),
    material: materialFinish,
    materialFinish,
    searchTags: String(row['Search Tags'] || '').trim(),
    tags: searchTags.map((tag) => tag.toLowerCase()),
    costPrice: parseMoney(row['Est. Cost (ZAR)']),
    price: parseMoney(row['Est. Selling (ZAR)']),
    currency: 'ZAR',
    availability,
    inStock: !/unavailable|out of stock|discontinued/i.test(availability),
    manageStock: false,
    stock: null,
    originalImageFilename: String(row['Original Image Filename'] || '').trim(),
    pricingSupplierNotes: String(row['Pricing / Supplier Notes'] || '').trim(),
    notes: String(row['Pricing / Supplier Notes'] || '').trim(),
    previousWebsiteCategory: String(row['Previous Website Category'] || '').trim(),
    mainImageFilename: String(row['Main Image'] || gallery[0]?.fileName || '').trim(),
    mainImage,
    image: mainImage,
    gallery,
    galleryImageFiles: expectedGallery,
    imageCount,
    workbookImageCount,
    rooms: roomByCategory[category] || [],
    slug: `${slugify(productName || sku)}-${slugify(sku)}`,
    sourceWorkbook: path.basename(workbookPath),
  };
});

const productSkus = new Set(products.map((product) => product.sku));
const orphanedGallerySkus = [...galleryBySku.keys()].filter((sku) => !productSkus.has(sku));
if (orphanedGallerySkus.length) throw new Error(`Gallery contains unknown SKUs: ${orphanedGallerySkus.join(', ')}`);

fs.writeFileSync(path.join(dataDir, 'products.json'), `${JSON.stringify(products, null, 2)}\n`);
fs.writeFileSync(
  path.join(root, 'src', 'app', 'data', 'catalogue.ts'),
  `// Generated from ${path.basename(workbookPath)}. Do not edit by hand.\nexport const PRODUCT_CATALOGUE_VERSION = '2026-10-23-product-master-v4';\nexport const productCatalogue = ${JSON.stringify(products, null, 2)};\n`,
);
fs.writeFileSync(path.join(dataDir, 'summary.json'), `${JSON.stringify({
  source: path.basename(workbookPath),
  products: products.length,
  images: [...galleryBySku.values()].reduce((sum, gallery) => sum + gallery.length, 0),
  fields: Object.keys(products[0] || {}),
  categories: Object.fromEntries([...new Set(products.map((product) => product.category))].sort().map((category) => [
    category,
    products.filter((product) => product.category === category).length,
  ])),
}, null, 2)}\n`);

if (!suppliedExtractDir) fs.rmSync(extractDir, { recursive: true, force: true });
console.log(`Prepared ${products.length} products and ${[...galleryBySku.values()].reduce((sum, gallery) => sum + gallery.length, 0)} gallery images.`);
