
  # Ecommerce website for B-Interiors

  This is a code bundle for Ecommerce website for B-Interiors. The original project is available at https://www.figma.com/design/CnOmPd2YgjFS04ExFFj4Bx/Ecommerce-website-for-B-Interiors.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
# Cloudflare backend

The application runs on Cloudflare Pages Functions, D1, R2, and KV. Configure secrets with `wrangler pages secret put`; keep payment and email credentials out of `wrangler.jsonc`.

- D1 database: `binteriorz-db` (`APP_DB` binding)
- R2 bucket: `binteriorz-media` (`APP_MEDIA` binding)
- KV namespace: `PAYFAST_ORDERS`

Apply future schema changes with `wrangler d1 migrations apply binteriorz-db --remote`. The first account registered on a fresh database becomes the store owner.
