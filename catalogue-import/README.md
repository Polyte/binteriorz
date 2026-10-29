# B Interior Designz product catalogue import

`products.json` and `src/app/data/catalogue.ts` are generated from
`B_Interior_Product_Catalogue_With_Images.xlsx`. Gallery images narrower than 600px are skipped.

Regenerate the JSON, website images and catalogue from the workbook:

```bash
node scripts/prepare-product-catalogue.mjs /path/to/B_Interior_Product_Catalogue_With_Images.xlsx
```

Load the catalogue into the Cloudflare D1 database:

```bash
node scripts/seed-cloudflare-catalogue.mjs
```
