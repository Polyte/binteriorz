# B-Interiors product catalogue database

`b-interiors-products.sqlite` is generated from `products.json`, which is extracted from
`B_Interior_Product_Catalogue_With_Images.xlsx`.

The database contains:

- `products`: all Product Master columns plus storefront fields.
- `product_images`: ordered image metadata and the complete image files as BLOBs.
- `product_tags`: normalized search tags.
- `product_rooms`: normalized room assignments.
- `catalogue_metadata`: source checksum, generation time, and record counts.
- `product_catalogue`: a view that compares declared and stored image counts.

Regenerate the database after changing `products.json`:

```bash
npm run catalogue:sqlite
```

Regenerate the JSON, website images, server catalogue, and SQLite database directly from
the workbook:

```bash
node scripts/prepare-product-catalogue.mjs /path/to/B_Interior_Product_Catalogue_With_Images.xlsx
```

Example query:

```bash
sqlite3 -header -column catalogue-import/b-interiors-products.sqlite \
  "SELECT internal_sku, website_product_name, estimated_selling_zar FROM products ORDER BY internal_sku;"
```
