import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const root = process.cwd();
const productsPath = process.argv[2] || path.join(root, 'catalogue-import', 'products.json');
const databasePath = process.argv[3] || path.join(root, 'catalogue-import', 'b-interiors-products.sqlite');
const temporaryPath = `${databasePath}.tmp`;

if (!fs.existsSync(productsPath)) {
  throw new Error(`Catalogue JSON not found: ${productsPath}`);
}

const productsJson = fs.readFileSync(productsPath, 'utf8');
const products = JSON.parse(productsJson);
if (!Array.isArray(products) || products.length === 0) {
  throw new Error('Catalogue JSON must contain at least one product.');
}

fs.mkdirSync(path.dirname(databasePath), { recursive: true });
fs.rmSync(temporaryPath, { force: true });

const database = new DatabaseSync(temporaryPath);
database.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = DELETE;

  CREATE TABLE catalogue_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE products (
    id TEXT PRIMARY KEY,
    original_id TEXT,
    internal_sku TEXT NOT NULL UNIQUE,
    barcode TEXT NOT NULL UNIQUE,
    barcode_format TEXT NOT NULL DEFAULT 'CODE128',
    barcode_type TEXT,
    category TEXT NOT NULL,
    website_product_name TEXT NOT NULL,
    product_description TEXT,
    color TEXT,
    material_finish TEXT,
    search_tags TEXT,
    estimated_cost_zar REAL NOT NULL DEFAULT 0 CHECK (estimated_cost_zar >= 0),
    estimated_selling_zar REAL NOT NULL DEFAULT 0 CHECK (estimated_selling_zar >= 0),
    currency TEXT NOT NULL DEFAULT 'ZAR',
    availability TEXT,
    in_stock INTEGER NOT NULL DEFAULT 1 CHECK (in_stock IN (0, 1)),
    manage_stock INTEGER NOT NULL DEFAULT 0 CHECK (manage_stock IN (0, 1)),
    stock INTEGER,
    original_image_filename TEXT,
    pricing_supplier_notes TEXT,
    previous_website_category TEXT,
    main_image_filename TEXT,
    main_image_path TEXT,
    gallery_images TEXT,
    image_count INTEGER NOT NULL DEFAULT 0 CHECK (image_count >= 0),
    workbook_image_count INTEGER NOT NULL DEFAULT 0 CHECK (workbook_image_count >= 0),
    rooms_json TEXT NOT NULL DEFAULT '[]',
    slug TEXT,
    source_workbook TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position > 0),
    file_name TEXT NOT NULL,
    public_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    image_data BLOB NOT NULL,
    UNIQUE (product_id, position),
    UNIQUE (product_id, file_name)
  );

  CREATE TABLE product_tags (
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    PRIMARY KEY (product_id, tag)
  );

  CREATE TABLE product_rooms (
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    room TEXT NOT NULL,
    PRIMARY KEY (product_id, room)
  );

  CREATE INDEX products_category_idx ON products(category);
  CREATE INDEX products_availability_idx ON products(availability);
  CREATE INDEX product_images_product_idx ON product_images(product_id, position);

  CREATE VIEW product_catalogue AS
  SELECT
    p.*,
    COUNT(i.id) AS stored_image_count
  FROM products p
  LEFT JOIN product_images i ON i.product_id = p.id
  GROUP BY p.id;
`);

const insertMetadata = database.prepare('INSERT INTO catalogue_metadata (key, value) VALUES (?, ?)');
const insertProduct = database.prepare(`
  INSERT INTO products (
    id, original_id, internal_sku, barcode, barcode_format, barcode_type,
    category, website_product_name, product_description, color, material_finish,
    search_tags, estimated_cost_zar, estimated_selling_zar, currency,
    availability, in_stock, manage_stock, stock, original_image_filename,
    pricing_supplier_notes, previous_website_category, main_image_filename,
    main_image_path, gallery_images, image_count, workbook_image_count, rooms_json, slug,
    source_workbook, created_at, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);
const insertImage = database.prepare(`
  INSERT INTO product_images (product_id, position, file_name, public_path, mime_type, image_data)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const insertTag = database.prepare('INSERT OR IGNORE INTO product_tags (product_id, tag) VALUES (?, ?)');
const insertRoom = database.prepare('INSERT OR IGNORE INTO product_rooms (product_id, room) VALUES (?, ?)');

const mimeTypeFor = (fileName) => {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.gif') return 'image/gif';
  return 'image/jpeg';
};

const generatedAt = new Date().toISOString();
let storedImages = 0;

database.exec('BEGIN IMMEDIATE');
try {
  insertMetadata.run('schema_version', '2');
  insertMetadata.run('generated_at', generatedAt);
  insertMetadata.run('source_json', path.relative(root, productsPath));
  insertMetadata.run('source_sha256', createHash('sha256').update(productsJson).digest('hex'));
  insertMetadata.run('product_count', String(products.length));

  for (const product of products) {
    insertProduct.run(
      product.id,
      product.originalId || '',
      product.internalSku || product.sku,
      product.barcode || product.sku,
      product.barcodeFormat || 'CODE128',
      product.barcodeType || '',
      product.category,
      product.name,
      product.description || '',
      product.color || '',
      product.materialFinish || product.material || '',
      product.searchTags || '',
      Number(product.costPrice) || 0,
      Number(product.price) || 0,
      product.currency || 'ZAR',
      product.availability || '',
      product.inStock === false ? 0 : 1,
      product.manageStock ? 1 : 0,
      product.stock ?? null,
      product.originalImageFilename || '',
      product.pricingSupplierNotes || product.notes || '',
      product.previousWebsiteCategory || '',
      product.mainImageFilename || product.gallery?.[0]?.fileName || '',
      product.mainImage || product.image || '',
      (product.galleryImageFiles || []).join(', '),
      Number(product.imageCount) || 0,
      Number(product.workbookImageCount) || 0,
      JSON.stringify(product.rooms || []),
      product.slug || '',
      product.sourceWorkbook || '',
      generatedAt,
      generatedAt,
    );

    for (const tag of product.tags || []) insertTag.run(product.id, tag);
    for (const room of product.rooms || []) insertRoom.run(product.id, room);

    for (const [index, image] of (product.gallery || []).entries()) {
      const publicPath = image.url;
      const imagePath = path.join(root, 'public', publicPath.replace(/^\//, ''));
      if (!fs.existsSync(imagePath)) throw new Error(`Missing image for ${product.sku}: ${imagePath}`);
      const fileName = image.fileName || path.basename(publicPath);
      insertImage.run(
        product.id,
        Number(image.position) || index + 1,
        fileName,
        publicPath,
        mimeTypeFor(fileName),
        fs.readFileSync(imagePath),
      );
      storedImages += 1;
    }
  }

  insertMetadata.run('image_count', String(storedImages));
  database.exec('COMMIT');
  database.exec('VACUUM');
} catch (error) {
  database.exec('ROLLBACK');
  database.close();
  fs.rmSync(temporaryPath, { force: true });
  throw error;
}

const integrity = database.prepare('PRAGMA integrity_check').get();
database.close();

fs.rmSync(databasePath, { force: true });
fs.renameSync(temporaryPath, databasePath);

console.log(`Created ${databasePath} with ${products.length} products and ${storedImages} embedded images (${integrity.integrity_check}).`);
