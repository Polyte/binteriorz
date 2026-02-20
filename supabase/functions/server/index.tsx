import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { Resend } from 'npm:resend';
import { createClient } from 'npm:@supabase/supabase-js';
import Stripe from 'npm:stripe';
import { createHash } from 'node:crypto';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Global Middleware
app.use('*', cors());
app.use('*', logger(console.log));

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Auth Middleware for Admin Routes
const ROLE_HIERARCHY: Record<string, number> = { owner: 3, admin: 2, editor: 1 };

const adminOnly = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401);

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return c.json({ error: 'Unauthorized', details: error?.message }, 401);
  }

  // Check if admin_roles exists — if empty, first authenticated user becomes owner
  let roles: any = await kv.get('b_interiors_admin_roles') || {};
  if (Object.keys(roles).length === 0) {
    roles[user.id] = 'owner';
    await kv.set('b_interiors_admin_roles', roles);
    console.log(`Auto-assigned owner role to first user: ${user.email}`);
  }

  const role = roles[user.id];
  if (!role) {
    return c.json({ error: 'Access denied. You are not in the admin team.', code: 'NOT_ADMIN' }, 403);
  }

  c.set('user', user);
  c.set('role', role);
  await next();
};

// Middleware: requires at least 'admin' role
const adminOrOwner = async (c: any, next: any) => {
  const role = c.get('role');
  if (!role || ROLE_HIERARCHY[role] < ROLE_HIERARCHY['admin']) {
    return c.json({ error: 'Insufficient permissions. Admin or Owner role required.' }, 403);
  }
  await next();
};

// Middleware: requires 'owner' role
const ownerOnly = async (c: any, next: any) => {
  const role = c.get('role');
  if (role !== 'owner') {
    return c.json({ error: 'Insufficient permissions. Owner role required.' }, 403);
  }
  await next();
};

// ─── Activity Log Helper ─────────────────────────────────────
const LOG_MAX = 500;
const logActivity = async (c: any, action: string, details: string, metadata?: any) => {
  try {
    const user = c.get('user');
    const role = c.get('role');
    const existing: any[] = await kv.get('b_interiors_activity_log') || [];
    const entry = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'system',
      email: user?.email || 'system',
      role: role || 'system',
      action,
      details,
      metadata: metadata || null,
      timestamp: new Date().toISOString(),
    };
    const updated = [entry, ...existing].slice(0, LOG_MAX);
    await kv.set('b_interiors_activity_log', updated);
  } catch (err) {
    console.log('Activity log write failed (non-fatal):', err);
  }
};

// ─── Notification Helper ─────────────────────────────────────
const NOTIF_MAX = 200;
const createNotification = async (type: string, title: string, message: string, actionTab?: string, meta?: any) => {
  try {
    const existing: any[] = await kv.get('b_interiors_notifications') || [];
    const notif = {
      id: Math.random().toString(36).substr(2, 12),
      type,
      title,
      message,
      actionTab: actionTab || null,
      meta: meta || null,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [notif, ...existing].slice(0, NOTIF_MAX);
    await kv.set('b_interiors_notifications', updated);
    console.log(`Notification created: [${type}] ${title}`);
  } catch (err) {
    console.log('Notification write failed (non-fatal):', err);
  }
};

// ─── PayFast Settings Helper ─────────────────────────────────
const getPayFastConfig = async () => {
  const kvSettings: any = await kv.get('b_interiors_payfast_settings');
  return {
    merchantId: kvSettings?.merchantId || Deno.env.get('PAYFAST_MERCHANT_ID') || '',
    merchantKey: kvSettings?.merchantKey || Deno.env.get('PAYFAST_MERCHANT_KEY') || '',
    passphrase: kvSettings?.passphrase || Deno.env.get('PAYFAST_PASSPHRASE') || '',
    sandbox: kvSettings?.sandbox !== undefined ? kvSettings.sandbox : ((Deno.env.get('PAYFAST_MODE') || 'sandbox') === 'sandbox'),
  };
};

const PREFIX = '/make-server-710d82e2';
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { apiVersion: '2024-12-18.acacia' });

// PayFast config is now loaded dynamically via getPayFastConfig() (KV → env fallback)

function generatePayFastSignature(data: Record<string, string>, passphrase?: string): string {
  const paramString = Object.entries(data)
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, '+')}`)
    .join('&');

  const signatureString = passphrase
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`
    : paramString;

  return createHash('md5').update(signatureString).digest('hex');
}

const initialProducts = [
  {
    id: 'p1',
    name: "Velvet Crescent Ottoman",
    price: 4500,
    category: "Seating",
    subcategory: "Ottomans",
    material: "Velvet",
    color: "Emerald",
    colorHex: "#064e3b",
    image: "https://images.unsplash.com/photo-1755325541565-aca7a68f6e66?auto=format&fit=crop&q=80&w=800",
    rooms: ["living-room", "bedroom"],
    tags: ["velvet", "ottoman", "handcrafted", "luxury"]
  },
  {
    id: 'p2',
    name: "Walnut Executive Desk",
    price: 18200,
    category: "Office",
    subcategory: "Desks",
    material: "Walnut",
    color: "Dark Wood",
    colorHex: "#451a03",
    image: "https://images.unsplash.com/photo-1704655295066-681e61ecca6b?auto=format&fit=crop&q=80&w=800",
    rooms: ["home-office"],
    tags: ["walnut", "desk", "executive", "office", "custom"]
  },
  {
    id: 'p3',
    name: "Heritage Leather Armchair",
    price: 12800,
    category: "Seating",
    subcategory: "Chairs",
    material: "Leather",
    color: "Cognac",
    colorHex: "#9a3412",
    image: "https://images.unsplash.com/photo-1702865263661-9da5ecf2f374?auto=format&fit=crop&q=80&w=800",
    rooms: ["living-room", "home-office"],
    tags: ["leather", "armchair", "heritage", "handcrafted"]
  },
  {
    id: 'p4',
    name: "Marble Halo Dining Table",
    price: 32500,
    category: "Tables",
    subcategory: "Dining Tables",
    material: "Marble & Brass",
    color: "White",
    colorHex: "#f5f5f4",
    image: "https://images.unsplash.com/photo-1643558544531-bff73bbffc28?auto=format&fit=crop&q=80&w=800",
    rooms: ["dining-room"],
    tags: ["marble", "dining", "table", "brass", "luxury", "bespoke"]
  },
  {
    id: 'p5',
    name: "Linen Cloud Sofa",
    price: 24800,
    category: "Seating",
    subcategory: "Sofas",
    material: "Belgian Linen",
    color: "Natural",
    colorHex: "#d6d3d1",
    image: "https://images.unsplash.com/photo-1730580015629-d07e58d81c32?auto=format&fit=crop&q=80&w=800",
    rooms: ["living-room"],
    tags: ["linen", "sofa", "cloud", "comfort", "modular"]
  },
  {
    id: 'p6',
    name: "Brass Arc Floor Lamp",
    price: 8900,
    category: "Lighting",
    subcategory: "Floor Lamps",
    material: "Brass",
    color: "Gold",
    colorHex: "#b45309",
    image: "https://images.unsplash.com/photo-1759722665648-4b8501599042?auto=format&fit=crop&q=80&w=800",
    rooms: ["living-room", "bedroom", "home-office"],
    tags: ["brass", "lamp", "arc", "lighting", "floor"]
  },
  {
    id: 'p7',
    name: "Oak Floating Nightstand",
    price: 3200,
    category: "Storage",
    subcategory: "Nightstands",
    material: "European Oak",
    color: "Light Wood",
    colorHex: "#a16207",
    image: "https://images.unsplash.com/photo-1737467016100-68cd7759d93c?auto=format&fit=crop&q=80&w=800",
    rooms: ["bedroom"],
    tags: ["oak", "nightstand", "floating", "minimal", "bedroom"]
  },
  {
    id: 'p8',
    name: "Teak Outdoor Lounge Set",
    price: 38500,
    category: "Outdoor",
    subcategory: "Lounge Sets",
    material: "Teak",
    color: "Natural Teak",
    colorHex: "#78716c",
    image: "https://images.unsplash.com/photo-1768527339600-3127e34acdad?auto=format&fit=crop&q=80&w=800",
    rooms: ["outdoor"],
    tags: ["teak", "outdoor", "lounge", "patio", "weatherproof"]
  },
  {
    id: 'p9',
    name: "Handwoven Moroccan Rug",
    price: 6700,
    category: "Textiles",
    subcategory: "Rugs",
    material: "Wool",
    color: "Sand",
    colorHex: "#d4b896",
    image: "https://images.unsplash.com/photo-1627726997943-6e397135f78a?auto=format&fit=crop&q=80&w=800",
    rooms: ["living-room", "bedroom", "dining-room"],
    tags: ["rug", "moroccan", "handwoven", "wool", "artisan"]
  },
  {
    id: 'p10',
    name: "Brushed Steel Bookshelf",
    price: 14500,
    category: "Storage",
    subcategory: "Bookshelves",
    material: "Steel & Oak",
    color: "Silver",
    colorHex: "#71717a",
    image: "https://images.unsplash.com/photo-1581166931041-b62d92d52852?auto=format&fit=crop&q=80&w=800",
    rooms: ["living-room", "home-office"],
    tags: ["bookshelf", "steel", "industrial", "oak", "modern"]
  },
  {
    id: 'p11',
    name: "Velvet Dining Chair (Set of 2)",
    price: 7400,
    category: "Seating",
    subcategory: "Dining Chairs",
    material: "Velvet & Walnut",
    color: "Sage",
    colorHex: "#4d7c0f",
    image: "https://images.unsplash.com/photo-1551298370-9d3d53740c72?auto=format&fit=crop&q=80&w=800",
    rooms: ["dining-room"],
    tags: ["velvet", "dining", "chair", "walnut", "set"]
  },
  {
    id: 'p12',
    name: "Porcelain Pendant Light",
    price: 5200,
    category: "Lighting",
    subcategory: "Pendants",
    material: "Porcelain",
    color: "White",
    colorHex: "#fafaf9",
    image: "https://images.unsplash.com/photo-1601882761114-7af07cb40163?auto=format&fit=crop&q=80&w=800",
    rooms: ["dining-room", "bedroom", "living-room"],
    tags: ["porcelain", "pendant", "lighting", "minimal", "ceramic"]
  },
];

const routes = new Hono();

routes.get('/health', (c) => c.json({ status: 'ok' }));

// Stripe Config — exposes the publishable key to the frontend
routes.get('/stripe/config', (c) => {
  const publishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY');
  if (!publishableKey) {
    return c.json({ error: 'Stripe publishable key not configured' }, 500);
  }
  return c.json({ publishableKey });
});

// Stripe PaymentIntent — creates a PaymentIntent for the given amount (ZAR cents)
routes.post('/create-payment-intent', async (c) => {
  try {
    const { amount, currency, metadata } = await c.req.json();
    if (!amount || amount <= 0) {
      return c.json({ error: 'Invalid amount for payment intent' }, 400);
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in cents
      currency: currency || 'zar',
      metadata: metadata || {},
      automatic_payment_methods: { enabled: true },
    });
    return c.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err: any) {
    console.log('Stripe PaymentIntent creation error:', err.message);
    return c.json({ error: `Failed to create payment intent: ${err.message}` }, 500);
  }
});

routes.post('/seed', async (c) => {
  await kv.set('b_interiors_products', initialProducts);
  return c.json({ success: true });
});

// Products API
routes.get('/products', async (c) => {
  const products = await kv.get('b_interiors_products');
  return c.json(products || initialProducts);
});

// Admin-Protected Products Routes
routes.post('/products', adminOnly, async (c) => {
  const product = await c.req.json();
  const existing = await kv.get('b_interiors_products') || initialProducts;
  const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
  await kv.set('b_interiors_products', [...existing, newProduct]);
  await logActivity(c, 'product.create', `Created product "${newProduct.name}"`, { productId: newProduct.id });
  return c.json(newProduct);
});

routes.put('/products/:id', adminOnly, async (c) => {
  const id = c.req.param('id');
  const updates = await c.req.json();
  const existing = await kv.get('b_interiors_products') || initialProducts;
  const product = existing.find((p: any) => p.id === id);
  const updated = existing.map((p: any) => p.id === id ? { ...p, ...updates } : p);
  await kv.set('b_interiors_products', updated);
  await logActivity(c, 'product.update', `Updated product "${product?.name || id}"`, { productId: id });
  return c.json({ success: true });
});

routes.delete('/products/:id', adminOnly, adminOrOwner, async (c) => {
  const id = c.req.param('id');
  const existing = await kv.get('b_interiors_products') || initialProducts;
  const product = existing.find((p: any) => p.id === id);
  const updated = existing.filter((p: any) => p.id !== id);
  await kv.set('b_interiors_products', updated);
  await logActivity(c, 'product.delete', `Deleted product "${product?.name || id}"`);
  return c.json({ success: true });
});

// Orders API
routes.get('/orders', adminOnly, async (c) => {
  const orders = await kv.get('b_interiors_orders') || [];
  return c.json(orders);
});

routes.patch('/orders/:id', adminOnly, async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  const existing = await kv.get('b_interiors_orders') || [];
  const updated = existing.map((o: any) => o.orderId === id ? { ...o, status } : o);
  await kv.set('b_interiors_orders', updated);
  await logActivity(c, 'order.update', `Updated order ${id} status to "${status}"`);
  return c.json({ success: true });
});

// Vendor Applications API
routes.get('/vendors', adminOnly, async (c) => {
  const vendors = await kv.get('b_interiors_vendors') || [];
  return c.json(vendors);
});

routes.post('/vendors/apply', async (c) => {
  const application = await c.req.json();
  const existing = await kv.get('b_interiors_vendors') || [];
  const newVendor = { 
    ...application, 
    id: Math.random().toString(36).substr(2, 9),
    status: 'pending',
    appliedAt: new Date().toISOString() 
  };
  await kv.set('b_interiors_vendors', [...existing, newVendor]);

  await createNotification('vendor', 'New Guild Application',
    `${application.businessName || application.name || 'A new artisan'} applied to join the Artisan Guild`,
    'vendors', { vendorId: newVendor.id, businessName: application.businessName });

  return c.json({ success: true });
});

// Full vendor profile update (status + profile fields + admin notes)
routes.patch('/vendors/:id', adminOnly, async (c) => {
  const id = c.req.param('id');
  const updates = await c.req.json();
  const existing = await kv.get('b_interiors_vendors') || [];
  const vendor = existing.find((v: any) => v.id === id);
  
  if (!vendor) return c.json({ error: 'Vendor not found' }, 404);

  const status = updates.status || vendor.status;
  const updatedVendor = { ...vendor, ...updates, updatedAt: new Date().toISOString() };
  const updated = existing.map((v: any) => v.id === id ? updatedVendor : v);
  await kv.set('b_interiors_vendors', updated);

  // Build descriptive log message
  const changedFields = Object.keys(updates).filter(k => k !== 'id');
  if (updates.status && updates.status !== vendor.status) {
    await logActivity(c, 'vendor.update', `Changed vendor "${vendor.businessName || id}" status from "${vendor.status}" to "${updates.status}"`);
  } else {
    await logActivity(c, 'vendor.update', `Updated vendor "${vendor.businessName || id}" profile (${changedFields.join(', ')})`);
  }

  // Automated Email Notification for Approval
  if (updates.status === 'approved' && updates.status !== vendor.status && vendor.email) {
    try {
      await resend.emails.send({
        from: 'B-Interiors Guild <onboarding@resend.dev>',
        to: vendor.email,
        subject: 'Welcome to the B-Interiors Artisan Guild',
        html: `
          <div style="font-family: 'Josefin Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #171717; background-color: #fafaf9;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 28px; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 300; margin: 0;">Artisan Guild</h1>
              <div style="height: 1px; width: 60px; background-color: #171717; margin: 24px auto;"></div>
              <p style="font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase; color: #737373;">Invitation to the Inner Circle</p>
            </div>

            <div style="margin-bottom: 40px;">
              <p style="font-size: 18px; line-height: 1.6; color: #171717;">
                Welcome, ${vendor.businessName}.
              </p>
              <p style="font-size: 16px; line-height: 1.8; color: #404040;">
                Your application to join the B-Interiors Artisan Guild has been meticulously reviewed and approved by our curation board. You are now part of an elite ecosystem dedicated to the pursuit of quiet luxury.
              </p>
            </div>

            <div style="background-color: #ffffff; border: 1px solid #e5e5e5; padding: 30px; margin-bottom: 40px;">
              <h2 style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 20px; color: #737373;">Your Guild Access</h2>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 12px; font-size: 14px; color: #171717;">• Verified Artisan Profile</li>
                <li style="margin-bottom: 12px; font-size: 14px; color: #171717;">• Collection Management Dashboard</li>
                <li style="margin-bottom: 12px; font-size: 14px; color: #171717;">• White-Glove Logistics Access</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="https://b-interiors.design/artisan-portal" style="display: inline-block; padding: 18px 36px; background-color: #171717; color: #ffffff; text-decoration: none; font-size: 10px; font-weight: bold; letter-spacing: 0.3em; text-transform: uppercase;">Finalize Your Profile</a>
              <p style="font-size: 12px; color: #a3a3a3; margin-top: 24px;">
                Our onboarding team will contact you shortly to coordinate your first collection drop.
              </p>
            </div>

            <div style="text-align: center; border-top: 1px solid #e5e5e5; padding-top: 40px; margin-top: 40px;">
              <p style="font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #a3a3a3;">
                &copy; 2026 B-Interiors Studio. Alberton, SA.
              </p>
            </div>
          </div>
        `
      });
      console.log(`Approval email sent to ${vendor.email}`);
    } catch (emailErr) {
      console.error('Failed to send approval email:', emailErr);
    }
  }

  // Automated Email Notification for Rejection
  if (updates.status === 'rejected' && updates.status !== vendor.status && vendor.email) {
    try {
      await resend.emails.send({
        from: 'B-Interiors Guild <onboarding@resend.dev>',
        to: vendor.email,
        subject: 'B-Interiors Artisan Guild — Application Update',
        html: `
          <div style="font-family: 'Josefin Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #171717; background-color: #fafaf9;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 28px; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 300; margin: 0;">Artisan Guild</h1>
              <div style="height: 1px; width: 60px; background-color: #171717; margin: 24px auto;"></div>
              <p style="font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase; color: #737373;">Application Update</p>
            </div>

            <div style="margin-bottom: 40px;">
              <p style="font-size: 18px; line-height: 1.6; color: #171717;">
                Dear ${vendor.businessName},
              </p>
              <p style="font-size: 16px; line-height: 1.8; color: #404040;">
                Thank you for your interest in the B-Interiors Artisan Guild. After careful consideration by our curation board, we are unable to extend an invitation at this time.
              </p>
              <p style="font-size: 16px; line-height: 1.8; color: #404040;">
                This decision does not diminish the quality of your craft. Our selection criteria are highly specific to our current collection direction, and we encourage you to reapply in the future as our portfolio evolves.
              </p>
            </div>

            <div style="background-color: #ffffff; border: 1px solid #e5e5e5; padding: 30px; margin-bottom: 40px;">
              <h2 style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 20px; color: #737373;">What You Can Do</h2>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 12px; font-size: 14px; color: #171717;">&bull; Refine your portfolio and brand presentation</li>
                <li style="margin-bottom: 12px; font-size: 14px; color: #171717;">&bull; Reapply after 90 days with updated materials</li>
                <li style="margin-bottom: 12px; font-size: 14px; color: #171717;">&bull; Contact us for detailed feedback on your application</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="https://b-interiors.design/guild" style="display: inline-block; padding: 18px 36px; background-color: #171717; color: #ffffff; text-decoration: none; font-size: 10px; font-weight: bold; letter-spacing: 0.3em; text-transform: uppercase;">Reapply to the Guild</a>
            </div>

            <div style="text-align: center; border-top: 1px solid #e5e5e5; padding-top: 40px; margin-top: 40px;">
              <p style="font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #a3a3a3;">
                &copy; 2026 B-Interiors Studio. Alberton, SA.
              </p>
            </div>
          </div>
        `
      });
      console.log(`Rejection email sent to ${vendor.email}`);
    } catch (emailErr) {
      console.error('Failed to send rejection email:', emailErr);
    }
  }

  // Automated Email Notification for Suspension
  if (updates.status === 'suspended' && updates.status !== vendor.status && vendor.email) {
    try {
      await resend.emails.send({
        from: 'B-Interiors Guild <onboarding@resend.dev>',
        to: vendor.email,
        subject: 'B-Interiors Artisan Guild — Account Suspended',
        html: `
          <div style="font-family: 'Josefin Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #171717; background-color: #fafaf9;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 28px; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 300; margin: 0;">Artisan Guild</h1>
              <div style="height: 1px; width: 60px; background-color: #171717; margin: 24px auto;"></div>
              <p style="font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase; color: #737373;">Account Notice</p>
            </div>

            <div style="margin-bottom: 40px;">
              <p style="font-size: 18px; line-height: 1.6; color: #171717;">
                Dear ${vendor.businessName},
              </p>
              <p style="font-size: 16px; line-height: 1.8; color: #404040;">
                Your membership in the B-Interiors Artisan Guild has been temporarily suspended. During this period, your profile and product listings will not be visible on the platform.
              </p>
              <p style="font-size: 16px; line-height: 1.8; color: #404040;">
                If you believe this was in error, or if you would like to discuss the circumstances, please reach out to our partnerships team directly. We value your craftsmanship and hope to resolve this promptly.
              </p>
            </div>

            <div style="background-color: #ffffff; border: 1px solid #e5e5e5; padding: 30px; margin-bottom: 40px;">
              <h2 style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 20px; color: #737373;">During Suspension</h2>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 12px; font-size: 14px; color: #171717;">&bull; Your product listings are hidden from the storefront</li>
                <li style="margin-bottom: 12px; font-size: 14px; color: #171717;">&bull; Pending orders will still be fulfilled</li>
                <li style="margin-bottom: 12px; font-size: 14px; color: #171717;">&bull; Your profile data is preserved for reinstatement</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="mailto:guild@b-interiors.co.za" style="display: inline-block; padding: 18px 36px; background-color: #171717; color: #ffffff; text-decoration: none; font-size: 10px; font-weight: bold; letter-spacing: 0.3em; text-transform: uppercase;">Contact Partnerships Team</a>
            </div>

            <div style="text-align: center; border-top: 1px solid #e5e5e5; padding-top: 40px; margin-top: 40px;">
              <p style="font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #a3a3a3;">
                &copy; 2026 B-Interiors Studio. Alberton, SA.
              </p>
            </div>
          </div>
        `
      });
      console.log(`Suspension email sent to ${vendor.email}`);
    } catch (emailErr) {
      console.error('Failed to send suspension email:', emailErr);
    }
  }

  return c.json({ success: true });
});

// Delete vendor (admin/owner only)
routes.delete('/vendors/:id', adminOnly, adminOrOwner, async (c) => {
  try {
    const id = c.req.param('id');
    const existing = await kv.get('b_interiors_vendors') || [];
    const vendor = existing.find((v: any) => v.id === id);
    const updated = existing.filter((v: any) => v.id !== id);
    await kv.set('b_interiors_vendors', updated);
    await logActivity(c, 'vendor.delete', `Deleted vendor "${vendor?.businessName || id}"`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error deleting vendor:', err.message);
    return c.json({ error: 'Failed to delete vendor' }, 500);
  }
});

// Common APIs
routes.get('/news', async (c) => {
  const apiKey = Deno.env.get('NEWS_API_KEY');
  if (!apiKey) {
    return c.json({ 
      articles: [
        {
          title: "The Renaissance of Brutalist Woodwork",
          description: "Exploring how raw, heavy timber is making a comeback in high-end residential projects across the globe.",
          urlToImage: "https://images.unsplash.com/photo-1758448755778-90ebf4d0f1e7?auto=format&fit=crop&q=80&w=800",
          url: "#",
          publishedAt: new Date().toISOString()
        }
      ]
    });
  }
  try {
    const response = await fetch(`https://newsapi.org/v2/everything?q=luxury+furniture+interior+design&sortBy=publishedAt&language=en&pageSize=12&apiKey=${apiKey}`);
    const data = await response.json();
    return c.json(data);
  } catch (err) {
    return c.json({ error: 'Failed to fetch news' }, 500);
  }
});

routes.get('/discussions', async (c) => {
  try {
    const discussions = await kv.get('b_interiors_discussions') || [];
    return c.json(discussions);
  } catch (err) {
    console.log('Error fetching discussions:', err);
    return c.json([], 200);
  }
});

routes.post('/discussions', async (c) => {
  try {
    const { name, text } = await c.req.json();
    if (!name || !text) {
      return c.json({ error: 'Name and text are required' }, 400);
    }
    const existing = await kv.get('b_interiors_discussions') || [];
    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      text,
      createdAt: new Date().toISOString()
    };
    await kv.set('b_interiors_discussions', [...existing, newComment]);
    return c.json(newComment);
  } catch (err) {
    console.log('Error posting discussion:', err);
    return c.json({ error: 'Failed to post discussion' }, 500);
  }
});

routes.post('/checkout', async (c) => {
  try {
    const { items, total, customerInfo, paymentIntentId } = await c.req.json();
    const orderId = `BI-${Math.floor(100000 + Math.random() * 900000)}`;
    const order = { orderId, items, total, customerInfo, paymentIntentId, status: 'confirmed', createdAt: new Date().toISOString() };
    const existingOrders = await kv.get('b_interiors_orders') || [];
    await kv.set('b_interiors_orders', [...existingOrders, order]);

    // Create admin notification
    await createNotification('order', 'New Order Received',
      `Order ${orderId} from ${customerInfo?.firstName || ''} ${customerInfo?.lastName || ''} — R ${total?.toLocaleString()}`,
      'orders', { orderId, total });

    // Send order confirmation email via Resend
    if (customerInfo?.email) {
      try {
        const itemsHtml = items.map((item: any) => `
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #f5f5f5;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <img src="${item.image}" alt="${item.name}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px;" />
                <div>
                  <p style="margin: 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #171717;">${item.name}</p>
                  <p style="margin: 4px 0 0; font-size: 11px; color: #737373;">Qty: ${item.quantity}${item.material ? ' &bull; ' + item.material : ''}</p>
                </div>
              </div>
            </td>
            <td style="padding: 16px 0; border-bottom: 1px solid #f5f5f5; text-align: right; font-size: 14px; font-weight: 600; color: #171717;">
              R ${(item.price * item.quantity).toLocaleString()}
            </td>
          </tr>
        `).join('');

        await resend.emails.send({
          from: 'B-Interiors <onboarding@resend.dev>',
          to: customerInfo.email,
          subject: `Order Confirmed — ${orderId}`,
          html: `
            <div style="font-family: 'Josefin Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 0; color: #171717; background-color: #ffffff;">
              
              <!-- Header -->
              <div style="background-color: #171717; padding: 48px 40px; text-align: center;">
                <h1 style="font-size: 18px; letter-spacing: 0.35em; text-transform: uppercase; font-weight: 300; margin: 0; color: #ffffff;">B-Interiors</h1>
                <div style="height: 1px; width: 40px; background-color: #525252; margin: 20px auto;"></div>
                <p style="font-size: 9px; letter-spacing: 0.5em; text-transform: uppercase; color: #a3a3a3; margin: 0;">Alberton Studio &bull; Est. 2026</p>
              </div>

              <!-- Confirmation Banner -->
              <div style="padding: 48px 40px; text-align: center; background-color: #fafaf9; border-bottom: 1px solid #f5f5f5;">
                <div style="width: 56px; height: 56px; border-radius: 50%; background-color: #171717; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: #ffffff; font-size: 24px;">&#10003;</span>
                </div>
                <h2 style="font-size: 28px; font-weight: 300; margin: 0 0 8px; color: #171717; letter-spacing: -0.02em;">Order Confirmed</h2>
                <p style="font-size: 12px; color: #737373; margin: 0; letter-spacing: 0.1em;">Thank you for your acquisition, ${customerInfo.firstName}.</p>
              </div>

              <!-- Order Details -->
              <div style="padding: 40px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #f5f5f5;">
                  <div>
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #a3a3a3; margin: 0 0 4px;">Order Reference</p>
                    <p style="font-size: 16px; font-weight: 700; letter-spacing: 0.15em; color: #171717; margin: 0;">${orderId}</p>
                  </div>
                  <div style="text-align: right;">
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #a3a3a3; margin: 0 0 4px;">Date</p>
                    <p style="font-size: 14px; color: #171717; margin: 0;">${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <table style="width: 100%; border-collapse: collapse;">
                  ${itemsHtml}
                </table>

                <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #171717;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-size: 12px; color: #737373;">Subtotal</td>
                      <td style="padding: 8px 0; text-align: right; font-size: 12px; color: #737373;">R ${total.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 12px; color: #737373;">White-Glove Delivery</td>
                      <td style="padding: 8px 0; text-align: right; font-size: 12px; color: #059669; font-weight: 600;">Complimentary</td>
                    </tr>
                    <tr>
                      <td style="padding: 16px 0 0; font-size: 18px; font-weight: 600; color: #171717; border-top: 1px solid #f5f5f5;">Total Investment</td>
                      <td style="padding: 16px 0 0; text-align: right; font-size: 18px; font-weight: 700; color: #171717; border-top: 1px solid #f5f5f5;">R ${total.toLocaleString()}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Shipping Info -->
              <div style="padding: 32px 40px; background-color: #fafaf9; border-top: 1px solid #f5f5f5;">
                <h3 style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #a3a3a3; margin: 0 0 16px;">Delivery Address</h3>
                <p style="font-size: 14px; color: #171717; margin: 0; line-height: 1.8;">
                  ${customerInfo.firstName} ${customerInfo.lastName}<br/>
                  ${customerInfo.address}<br/>
                  ${customerInfo.city}, ${customerInfo.postalCode}
                </p>
              </div>

              <!-- Service Badges -->
              <div style="padding: 32px 40px; display: flex; gap: 32px;">
                <div style="flex: 1; text-align: center; padding: 24px 16px; background-color: #fafaf9; border-radius: 12px;">
                  <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #737373; margin: 0 0 4px;">&#9733; Studio Warranty</p>
                  <p style="font-size: 11px; color: #a3a3a3; margin: 0;">Lifetime craftsmanship guarantee</p>
                </div>
                <div style="flex: 1; text-align: center; padding: 24px 16px; background-color: #fafaf9; border-radius: 12px;">
                  <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #737373; margin: 0 0 4px;">&#128666; White-Glove</p>
                  <p style="font-size: 11px; color: #a3a3a3; margin: 0;">Premium nationwide logistics</p>
                </div>
              </div>

              <!-- Footer -->
              <div style="padding: 40px; text-align: center; background-color: #171717;">
                <p style="font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #737373; margin: 0;">
                  &copy; 2026 B-Interiors Studio &bull; 35 Radio Street, Alberton, SA
                </p>
              </div>
            </div>
          `
        });
        console.log(`Order confirmation email sent to ${customerInfo.email} for order ${orderId}`);
      } catch (emailErr: any) {
        console.error(`Failed to send order confirmation email for ${orderId}:`, emailErr.message);
        // Don't fail the checkout if email fails
      }
    }

    return c.json({ success: true, orderId });
  } catch (err) {
    console.log('Checkout error:', err);
    return c.json({ error: 'Checkout failed' }, 500);
  }
});

// Inquiries API — Contact / Consultation form
routes.post('/inquiries', async (c) => {
  try {
    const inquiry = await c.req.json();
    if (!inquiry.name || !inquiry.email) {
      return c.json({ error: 'Name and email are required for inquiries' }, 400);
    }
    const existing = await kv.get('b_interiors_inquiries') || [];
    const newInquiry = {
      ...inquiry,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    await kv.set('b_interiors_inquiries', [...existing, newInquiry]);

    await createNotification('inquiry', 'New Inquiry',
      `${inquiry.name} sent a message: "${(inquiry.message || '').substring(0, 80)}${(inquiry.message || '').length > 80 ? '...' : ''}"`,
      'customers', { inquiryId: newInquiry.id, name: inquiry.name, email: inquiry.email });

    return c.json({ success: true, id: newInquiry.id });
  } catch (err: any) {
    console.log('Error saving inquiry:', err.message);
    return c.json({ error: 'Failed to save inquiry' }, 500);
  }
});

// Newsletter Subscriptions API
routes.post('/newsletter', async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) {
      return c.json({ error: 'Email is required for newsletter subscription' }, 400);
    }
    const existing: any[] = await kv.get('b_interiors_newsletter') || [];
    // Prevent duplicate subscriptions
    if (existing.some((sub: any) => sub.email === email)) {
      return c.json({ success: true, message: 'Already subscribed' });
    }
    const subscription = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      subscribedAt: new Date().toISOString()
    };
    await kv.set('b_interiors_newsletter', [...existing, subscription]);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error saving newsletter subscription:', err.message);
    return c.json({ error: 'Failed to subscribe' }, 500);
  }
});

// ─── Customer Auth (Sign Up) ─────────────────────────────────
routes.post('/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'customer' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    if (error) {
      console.log('Signup error:', error.message);
      return c.json({ error: error.message }, 400);
    }
    return c.json({ success: true, user: { id: data.user.id, email: data.user.email } });
  } catch (err: any) {
    console.log('Signup error:', err.message);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// ─── Customer Order History ──────────────────────────────────
routes.get('/my-orders', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return c.json({ error: 'Unauthorized' }, 401);
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const allOrders: any[] = await kv.get('b_interiors_orders') || [];
    const userOrders = allOrders.filter(
      (o: any) => o.customerInfo?.email?.toLowerCase() === user.email?.toLowerCase()
    );
    return c.json(userOrders);
  } catch (err: any) {
    console.log('Error fetching customer orders:', err.message);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// ─── Product Reviews API ─────────────────────────────────────
routes.get('/reviews/:productId', async (c) => {
  try {
    const productId = c.req.param('productId');
    const allReviews: any[] = await kv.get('b_interiors_reviews') || [];
    const productReviews = allReviews.filter((r: any) => r.productId === productId);
    return c.json(productReviews);
  } catch (err: any) {
    console.log('Error fetching reviews:', err.message);
    return c.json([], 200);
  }
});

routes.post('/reviews', async (c) => {
  try {
    const { productId, name, rating, comment } = await c.req.json();
    if (!productId || !name || !rating) {
      return c.json({ error: 'productId, name, and rating are required' }, 400);
    }
    const existing: any[] = await kv.get('b_interiors_reviews') || [];
    const newReview = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      name,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment || '',
      createdAt: new Date().toISOString()
    };
    await kv.set('b_interiors_reviews', [...existing, newReview]);

    await createNotification('review', 'New Product Review',
      `${name} left a ${rating}-star review${comment ? ': "' + comment.substring(0, 60) + (comment.length > 60 ? '...' : '') + '"' : ''}`,
      'reviews', { reviewId: newReview.id, productId, rating });

    return c.json(newReview);
  } catch (err: any) {
    console.log('Error saving review:', err.message);
    return c.json({ error: 'Failed to save review' }, 500);
  }
});

// ─── Admin: Inquiries + Newsletter + Reviews (for dashboard) ──
routes.get('/inquiries', adminOnly, async (c) => {
  const data = await kv.get('b_interiors_inquiries') || [];
  return c.json(data);
});

routes.get('/newsletter-subs', adminOnly, async (c) => {
  const data = await kv.get('b_interiors_newsletter') || [];
  return c.json(data);
});

routes.get('/all-reviews', adminOnly, async (c) => {
  const data = await kv.get('b_interiors_reviews') || [];
  return c.json(data);
});

// ─── Admin: Delete Review ─────────────────────────────────────
routes.delete('/reviews/:id', adminOnly, adminOrOwner, async (c) => {
  try {
    const id = c.req.param('id');
    const existing: any[] = await kv.get('b_interiors_reviews') || [];
    const filtered = existing.filter((r: any) => r.id !== id);
    await kv.set('b_interiors_reviews', filtered);
    await logActivity(c, 'review.delete', `Deleted review ${id}`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error deleting review:', err.message);
    return c.json({ error: 'Failed to delete review' }, 500);
  }
});

// ─── Admin: Delete Newsletter Subscriber ──────────────────────
routes.delete('/newsletter-subs/:id', adminOnly, adminOrOwner, async (c) => {
  try {
    const id = c.req.param('id');
    const existing: any[] = await kv.get('b_interiors_newsletter') || [];
    const filtered = existing.filter((s: any) => s.id !== id);
    await kv.set('b_interiors_newsletter', filtered);
    await logActivity(c, 'subscriber.delete', `Removed newsletter subscriber ${id}`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error deleting subscriber:', err.message);
    return c.json({ error: 'Failed to delete subscriber' }, 500);
  }
});

// ─── Admin: Delete / Update Inquiry ───────────────────────────
routes.delete('/inquiries/:id', adminOnly, adminOrOwner, async (c) => {
  try {
    const id = c.req.param('id');
    const existing: any[] = await kv.get('b_interiors_inquiries') || [];
    const filtered = existing.filter((i: any) => i.id !== id);
    await kv.set('b_interiors_inquiries', filtered);
    await logActivity(c, 'inquiry.delete', `Deleted inquiry ${id}`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error deleting inquiry:', err.message);
    return c.json({ error: 'Failed to delete inquiry' }, 500);
  }
});

routes.patch('/inquiries/:id', adminOnly, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing: any[] = await kv.get('b_interiors_inquiries') || [];
    const updated = existing.map((i: any) => i.id === id ? { ...i, ...updates } : i);
    await kv.set('b_interiors_inquiries', updated);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error updating inquiry:', err.message);
    return c.json({ error: 'Failed to update inquiry' }, 500);
  }
});

// ─── Pages CMS API ───────────────────────────────────────────
routes.get('/pages', adminOnly, async (c) => {
  const pages = await kv.get('b_interiors_pages') || [];
  return c.json(pages);
});

routes.post('/pages', adminOnly, async (c) => {
  try {
    const page = await c.req.json();
    const existing: any[] = await kv.get('b_interiors_pages') || [];
    const newPage = {
      ...page,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await kv.set('b_interiors_pages', [...existing, newPage]);
    await logActivity(c, 'page.create', `Created page "${newPage.title || newPage.id}"`);
    return c.json(newPage);
  } catch (err: any) {
    console.log('Error creating page:', err.message);
    return c.json({ error: 'Failed to create page' }, 500);
  }
});

routes.put('/pages/:id', adminOnly, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing: any[] = await kv.get('b_interiors_pages') || [];
    const updated = existing.map((p: any) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    await kv.set('b_interiors_pages', updated);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error updating page:', err.message);
    return c.json({ error: 'Failed to update page' }, 500);
  }
});

routes.delete('/pages/:id', adminOnly, adminOrOwner, async (c) => {
  try {
    const id = c.req.param('id');
    const existing: any[] = await kv.get('b_interiors_pages') || [];
    const page = existing.find((p: any) => p.id === id);
    const updated = existing.filter((p: any) => p.id !== id);
    await kv.set('b_interiors_pages', updated);
    await logActivity(c, 'page.delete', `Deleted page "${page?.title || id}"`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error deleting page:', err.message);
    return c.json({ error: 'Failed to delete page' }, 500);
  }
});

// ─── Public Page by Slug (no auth required) ──────────────────
routes.get('/page/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const pages: any[] = await kv.get('b_interiors_pages') || [];
    const page = pages.find((p: any) => p.slug === slug && p.status === 'published');
    if (!page) return c.json({ error: 'Page not found' }, 404);
    return c.json(page);
  } catch (err: any) {
    console.log('Error fetching public page:', err.message);
    return c.json({ error: 'Failed to fetch page' }, 500);
  }
});

// ─── Page Templates API ──────────────────────────────────────
routes.get('/page-templates', adminOnly, async (c) => {
  const templates = await kv.get('b_interiors_page_templates') || [];
  return c.json(templates);
});

routes.post('/page-templates', adminOnly, async (c) => {
  try {
    const template = await c.req.json();
    const existing: any[] = await kv.get('b_interiors_page_templates') || [];
    const newTemplate = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    await kv.set('b_interiors_page_templates', [...existing, newTemplate]);
    return c.json(newTemplate);
  } catch (err: any) {
    console.log('Error creating page template:', err.message);
    return c.json({ error: 'Failed to create template' }, 500);
  }
});

routes.delete('/page-templates/:id', adminOnly, async (c) => {
  try {
    const id = c.req.param('id');
    const existing: any[] = await kv.get('b_interiors_page_templates') || [];
    const updated = existing.filter((t: any) => t.id !== id);
    await kv.set('b_interiors_page_templates', updated);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error deleting page template:', err.message);
    return c.json({ error: 'Failed to delete template' }, 500);
  }
});

// ─── Media Library API ───────────────────────────────────────
const MEDIA_BUCKET = 'make-710d82e2-media';

// Idempotent bucket creation
(async () => {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === MEDIA_BUCKET);
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(MEDIA_BUCKET, { public: false });
      console.log(`Created storage bucket: ${MEDIA_BUCKET}`);
    }
  } catch (err) {
    console.log('Bucket creation check error (non-fatal):', err);
  }
})();

routes.get('/media', adminOnly, async (c) => {
  const media = await kv.get('b_interiors_media') || [];
  return c.json(media);
});

routes.post('/media/upload', adminOnly, async (c) => {
  try {
    const { fileName, fileType, fileSize, base64Data } = await c.req.json();
    if (!fileName || !base64Data) {
      return c.json({ error: 'fileName and base64Data are required' }, 400);
    }

    // Decode base64 to binary
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const storagePath = `uploads/${Date.now()}_${fileName}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(MEDIA_BUCKET)
      .upload(storagePath, bytes, { contentType: fileType || 'application/octet-stream' });

    if (uploadError) {
      console.log('Storage upload error:', uploadError.message);
      return c.json({ error: `Upload failed: ${uploadError.message}` }, 500);
    }

    // Create signed URL (7 days)
    const { data: signedData } = await supabaseAdmin.storage
      .from(MEDIA_BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

    const mediaItem = {
      id: Math.random().toString(36).substr(2, 9),
      fileName,
      fileType: fileType || 'unknown',
      fileSize: fileSize || 0,
      storagePath,
      url: signedData?.signedUrl || '',
      uploadedAt: new Date().toISOString(),
    };

    const existing: any[] = await kv.get('b_interiors_media') || [];
    await kv.set('b_interiors_media', [...existing, mediaItem]);

    return c.json(mediaItem);
  } catch (err: any) {
    console.log('Media upload error:', err.message);
    return c.json({ error: `Media upload failed: ${err.message}` }, 500);
  }
});

routes.post('/media/refresh-urls', adminOnly, async (c) => {
  try {
    const existing: any[] = await kv.get('b_interiors_media') || [];
    const refreshed = await Promise.all(
      existing.map(async (item: any) => {
        const { data } = await supabaseAdmin.storage
          .from(MEDIA_BUCKET)
          .createSignedUrl(item.storagePath, 60 * 60 * 24 * 7);
        return { ...item, url: data?.signedUrl || item.url };
      })
    );
    await kv.set('b_interiors_media', refreshed);
    return c.json(refreshed);
  } catch (err: any) {
    console.log('URL refresh error:', err.message);
    return c.json({ error: 'Failed to refresh URLs' }, 500);
  }
});

routes.delete('/media/:id', adminOnly, adminOrOwner, async (c) => {
  try {
    const id = c.req.param('id');
    const existing: any[] = await kv.get('b_interiors_media') || [];
    const item = existing.find((m: any) => m.id === id);

    if (item?.storagePath) {
      await supabaseAdmin.storage.from(MEDIA_BUCKET).remove([item.storagePath]);
    }

    const updated = existing.filter((m: any) => m.id !== id);
    await kv.set('b_interiors_media', updated);
    await logActivity(c, 'media.delete', `Deleted media "${item?.fileName || id}"`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Media delete error:', err.message);
    return c.json({ error: 'Failed to delete media' }, 500);
  }
});

// ─── Site Settings API ───────────────────────────────────────
routes.get('/site-settings', adminOnly, async (c) => {
  const settings = await kv.get('b_interiors_settings') || {
    siteName: 'B-Interiors',
    tagline: 'Quiet Luxury, Crafted in Alberton',
    contactEmail: 'hello@b-interiors.co.za',
    contactPhone: '+27 11 123 4567',
    address: '123 Design Quarter, Alberton, South Africa',
    currency: 'ZAR',
    freeShippingThreshold: 5000,
    enableReviews: true,
    enableNewsletter: true,
    maintenanceMode: false,
  };
  return c.json(settings);
});

routes.put('/site-settings', adminOnly, async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set('b_interiors_settings', settings);
    await logActivity(c, 'settings.update', 'Updated site settings');
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Settings update error:', err.message);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// ─── Admin Role Management API ───────────────────────────────
// Get current user's role
routes.get('/admin-role', adminOnly, async (c) => {
  const user = c.get('user');
  const role = c.get('role');
  return c.json({ userId: user.id, email: user.email, role });
});

// Get all admin team members (owner only)
routes.get('/admin-roles', adminOnly, ownerOnly, async (c) => {
  try {
    const roles: any = await kv.get('b_interiors_admin_roles') || {};
    // Resolve emails for each user ID
    const team = await Promise.all(
      Object.entries(roles).map(async ([userId, role]) => {
        try {
          const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
          return { userId, email: user?.email || 'unknown', role, name: user?.user_metadata?.name || '' };
        } catch {
          return { userId, email: 'unknown', role, name: '' };
        }
      })
    );
    return c.json(team);
  } catch (err: any) {
    console.log('Error fetching admin roles:', err.message);
    return c.json({ error: 'Failed to fetch admin roles' }, 500);
  }
});

// Add/update a team member by email (owner only)
routes.post('/admin-roles', adminOnly, ownerOnly, async (c) => {
  try {
    const { email, role } = await c.req.json();
    if (!email || !role || !ROLE_HIERARCHY[role]) {
      return c.json({ error: 'Valid email and role (owner, admin, editor) required' }, 400);
    }
    // Look up user by email
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    const targetUser = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (!targetUser) {
      return c.json({ error: `No account found for ${email}. They must sign up first.` }, 404);
    }
    const roles: any = await kv.get('b_interiors_admin_roles') || {};
    roles[targetUser.id] = role;
    await kv.set('b_interiors_admin_roles', roles);
    await logActivity(c, 'team.update', `Set ${email} as ${role}`);
    return c.json({ success: true, userId: targetUser.id, email: targetUser.email, role });
  } catch (err: any) {
    console.log('Error updating admin role:', err.message);
    return c.json({ error: `Failed to update role: ${err.message}` }, 500);
  }
});

// Remove a team member (owner only, cannot remove self)
routes.delete('/admin-roles/:userId', adminOnly, ownerOnly, async (c) => {
  try {
    const targetId = c.req.param('userId');
    const currentUser = c.get('user');
    if (targetId === currentUser.id) {
      return c.json({ error: 'You cannot remove yourself from the admin team.' }, 400);
    }
    const roles: any = await kv.get('b_interiors_admin_roles') || {};
    delete roles[targetId];
    await kv.set('b_interiors_admin_roles', roles);
    await logActivity(c, 'team.remove', `Removed team member ${targetId}`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error removing admin role:', err.message);
    return c.json({ error: 'Failed to remove team member' }, 500);
  }
});

// Reset all admin roles — next authenticated user auto-becomes owner
routes.post('/reset-admin-roles', async (c) => {
  try {
    const { secret } = await c.req.json();
    const expected = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    console.log('Reset attempt — secret provided:', !!secret, 'expected exists:', !!expected);
    if (!secret || !expected || secret.trim() !== expected.trim()) {
      return c.json({ error: 'Forbidden — invalid reset secret' }, 403);
    }
    await kv.set('b_interiors_admin_roles', {});
    console.log('Admin roles have been reset. Next authenticated user will become owner.');
    return c.json({ success: true, message: 'Admin roles cleared. The next authenticated user to access /admin will be auto-assigned as owner.' });
  } catch (err: any) {
    console.log('Error resetting admin roles:', err.message);
    return c.json({ error: 'Failed to reset admin roles' }, 500);
  }
});

// ─── Bulk Product Import API ─────────────────────────────────
routes.post('/products/bulk', adminOnly, async (c) => {
  try {
    const { products: importProducts } = await c.req.json();
    if (!Array.isArray(importProducts) || importProducts.length === 0) {
      return c.json({ error: 'products array is required and must not be empty' }, 400);
    }
    const existing: any[] = await kv.get('b_interiors_products') || initialProducts;
    const newProducts = importProducts.map((p: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: p.name || p.Name || 'Untitled',
      price: Number(p.price || p.Price || p['Price (ZAR)'] || 0),
      category: p.category || p.Category || 'Uncategorized',
      material: p.material || p.Material || '',
      color: p.color || p.Color || '',
      stock: Number(p.stock || p.Stock || 0),
      description: p.description || p.Description || '',
      image: p.image || p['Image URL'] || p.image_url || '',
      gallery: [],
      rooms: Array.isArray(p.rooms) ? p.rooms : (p.rooms || p.Rooms || '').split(',').map((r: string) => r.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean),
      tags: Array.isArray(p.tags) ? p.tags : (p.tags || p.Tags || '').split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean),
    }));
    await kv.set('b_interiors_products', [...existing, ...newProducts]);
    await logActivity(c, 'product.bulk_import', `Imported ${newProducts.length} products via CSV/Excel`);
    return c.json({ success: true, imported: newProducts.length });
  } catch (err: any) {
    console.log('Bulk import error:', err.message);
    return c.json({ error: `Bulk import failed: ${err.message}` }, 500);
  }
});

// ─── Activity Log API ────────────────────────────────────────
routes.get('/activity-log', adminOnly, async (c) => {
  try {
    const logs: any[] = await kv.get('b_interiors_activity_log') || [];
    return c.json(logs);
  } catch (err: any) {
    console.log('Error fetching activity log:', err.message);
    return c.json([], 200);
  }
});

// ─── PayFast Payment Gateway ─────────────────────────────────
routes.get('/payfast/config', async (c) => {
  const pf = await getPayFastConfig();
  const configured = !!(pf.merchantId && pf.merchantKey);
  const paymentUrl = pf.sandbox ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
  return c.json({ configured, sandbox: pf.sandbox, paymentUrl });
});

routes.post('/payfast/generate', async (c) => {
  try {
    const pf = await getPayFastConfig();
    if (!pf.merchantId || !pf.merchantKey) {
      return c.json({ error: 'PayFast is not configured. Set Merchant ID and Merchant Key in Admin → Settings → PayFast.' }, 500);
    }
    const { items, total, customerInfo, returnUrl, cancelUrl } = await c.req.json();
    if (!items || !total || !customerInfo) {
      return c.json({ error: 'items, total, and customerInfo are required' }, 400);
    }
    const orderId = `BI-${Math.floor(100000 + Math.random() * 900000)}`;
    const order = {
      orderId, items, total, customerInfo,
      paymentMethod: 'payfast', status: 'pending_payment',
      createdAt: new Date().toISOString(),
    };
    const existingOrders: any[] = await kv.get('b_interiors_orders') || [];
    await kv.set('b_interiors_orders', [...existingOrders, order]);

    const paymentUrl = pf.sandbox ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const notifyUrl = `${supabaseUrl}/functions/v1/make-server-710d82e2/payfast/notify`;
    const itemNames = items.map((i: any) => i.name).join(', ');
    const itemDescription = itemNames.length > 255 ? itemNames.substring(0, 252) + '...' : itemNames;

    const pfData: Record<string, string> = {
      merchant_id: pf.merchantId,
      merchant_key: pf.merchantKey,
      return_url: returnUrl || '',
      cancel_url: cancelUrl || '',
      notify_url: notifyUrl,
      name_first: customerInfo.firstName || '',
      name_last: customerInfo.lastName || '',
      email_address: customerInfo.email || '',
      cell_number: (customerInfo.phone || '').replace(/[^0-9]/g, ''),
      m_payment_id: orderId,
      amount: total.toFixed(2),
      item_name: `B-Interiors Order ${orderId}`,
      item_description: itemDescription,
    };
    Object.keys(pfData).forEach((key) => { if (pfData[key] === '') delete pfData[key]; });
    const signature = generatePayFastSignature(pfData, pf.passphrase || undefined);
    pfData.signature = signature;
    console.log(`PayFast payment generated for order ${orderId}, amount R${total.toFixed(2)}, mode: ${pf.sandbox ? 'sandbox' : 'live'}`);
    return c.json({ orderId, paymentUrl, formData: pfData });
  } catch (err: any) {
    console.log('PayFast generate error:', err.message);
    return c.json({ error: `Failed to generate PayFast payment: ${err.message}` }, 500);
  }
});

routes.post('/payfast/notify', async (c) => {
  try {
    const body = await c.req.text();
    const params = new URLSearchParams(body);
    const pfData: Record<string, string> = {};
    params.forEach((value, key) => { pfData[key] = value; });
    console.log('PayFast ITN received:', JSON.stringify(pfData));

    const orderId = pfData.m_payment_id;
    const paymentStatus = pfData.payment_status;
    const pfPaymentId = pfData.pf_payment_id;
    const amountGross = pfData.amount_gross;
    if (!orderId) { console.log('PayFast ITN: missing m_payment_id'); return c.text('INVALID', 400); }

    const pf = await getPayFastConfig();
    const receivedSignature = pfData.signature;
    delete pfData.signature;
    const expectedSignature = generatePayFastSignature(pfData, pf.passphrase || undefined);
    if (receivedSignature && receivedSignature !== expectedSignature && !pf.sandbox) {
      console.log(`PayFast ITN: signature mismatch for ${orderId}`);
      return c.text('INVALID_SIGNATURE', 400);
    }

    const existingOrders: any[] = await kv.get('b_interiors_orders') || [];
    const orderIndex = existingOrders.findIndex((o: any) => o.orderId === orderId);
    if (orderIndex === -1) { console.log(`PayFast ITN: order ${orderId} not found`); return c.text('ORDER_NOT_FOUND', 404); }

    const order = existingOrders[orderIndex];
    if (paymentStatus === 'COMPLETE') {
      existingOrders[orderIndex] = {
        ...order, status: 'confirmed', paymentMethod: 'payfast',
        pfPaymentId, amountPaid: amountGross, paidAt: new Date().toISOString(),
      };
      await kv.set('b_interiors_orders', existingOrders);

      await createNotification('order', 'PayFast Payment Confirmed',
        `Order ${orderId} paid via PayFast — R ${amountGross}`,
        'orders', { orderId, amount: amountGross });

      if (order.customerInfo?.email) {
        try {
          const itemsHtml = (order.items || []).map((item: any) => `
            <tr><td style="padding:12px 0;border-bottom:1px solid #f5f5f5;">
              <p style="margin:0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#171717;">${item.name}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#737373;">Qty: ${item.quantity}</p>
            </td><td style="padding:12px 0;border-bottom:1px solid #f5f5f5;text-align:right;font-size:14px;font-weight:600;color:#171717;">R ${(item.price * item.quantity).toLocaleString()}</td></tr>
          `).join('');
          await resend.emails.send({
            from: 'B-Interiors <onboarding@resend.dev>', to: order.customerInfo.email,
            subject: `Order Confirmed — ${orderId}`,
            html: `<div style="font-family:'Josefin Sans',sans-serif;max-width:600px;margin:0 auto;color:#171717;background:#fff;">
              <div style="background:#171717;padding:48px 40px;text-align:center;"><h1 style="font-size:18px;letter-spacing:0.35em;text-transform:uppercase;font-weight:300;margin:0;color:#fff;">B-Interiors</h1></div>
              <div style="padding:48px 40px;text-align:center;background:#fafaf9;"><h2 style="font-size:28px;font-weight:300;margin:0 0 8px;">Payment Confirmed</h2><p style="font-size:12px;color:#737373;">Thank you, ${order.customerInfo.firstName}. Paid via PayFast.</p></div>
              <div style="padding:40px;"><p style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#a3a3a3;">Order Reference</p><p style="font-size:16px;font-weight:700;letter-spacing:0.15em;margin:0 0 24px;">${orderId}</p>
              <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
              <div style="margin-top:24px;padding-top:16px;border-top:2px solid #171717;"><p style="font-size:18px;font-weight:700;text-align:right;">Total: R ${order.total.toLocaleString()}</p></div></div>
              <div style="padding:40px;text-align:center;background:#171717;"><p style="font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:#737373;">&copy; 2026 B-Interiors Studio</p></div></div>`,
          });
          console.log(`PayFast confirmation email sent for order ${orderId}`);
        } catch (emailErr: any) { console.log(`Failed to send PayFast email for ${orderId}:`, emailErr.message); }
      }
      console.log(`PayFast ITN: order ${orderId} confirmed, pf_payment_id: ${pfPaymentId}`);
    } else if (paymentStatus === 'CANCELLED') {
      existingOrders[orderIndex] = { ...order, status: 'cancelled', cancelledAt: new Date().toISOString() };
      await kv.set('b_interiors_orders', existingOrders);
      console.log(`PayFast ITN: order ${orderId} cancelled`);
    } else {
      console.log(`PayFast ITN: order ${orderId} status ${paymentStatus}`);
    }
    return c.text('OK', 200);
  } catch (err: any) {
    console.log('PayFast ITN error:', err.message);
    return c.text('ERROR', 500);
  }
});

routes.get('/orders/lookup/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const allOrders: any[] = await kv.get('b_interiors_orders') || [];
    const order = allOrders.find((o: any) => o.orderId === orderId);
    if (!order) return c.json({ error: 'Order not found' }, 404);
    return c.json({
      orderId: order.orderId, status: order.status, total: order.total,
      items: order.items, customerName: `${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`.trim(),
      email: order.customerInfo?.email || '', paymentMethod: order.paymentMethod || 'stripe', createdAt: order.createdAt,
    });
  } catch (err: any) {
    console.log('Order lookup error:', err.message);
    return c.json({ error: 'Failed to look up order' }, 500);
  }
});

// ─── Notifications API ───────────────────────────────────────
routes.get('/notifications', adminOnly, async (c) => {
  try {
    const notifications: any[] = await kv.get('b_interiors_notifications') || [];
    return c.json(notifications);
  } catch (err: any) {
    console.log('Notifications fetch error:', err.message);
    return c.json([], 200);
  }
});

routes.patch('/notifications/:id/read', adminOnly, async (c) => {
  try {
    const id = c.req.param('id');
    const notifications: any[] = await kv.get('b_interiors_notifications') || [];
    const idx = notifications.findIndex((n: any) => n.id === id);
    if (idx === -1) return c.json({ error: 'Notification not found' }, 404);
    notifications[idx].read = true;
    await kv.set('b_interiors_notifications', notifications);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Notification mark-read error:', err.message);
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});

routes.post('/notifications/read-all', adminOnly, async (c) => {
  try {
    const notifications: any[] = await kv.get('b_interiors_notifications') || [];
    const updated = notifications.map((n: any) => ({ ...n, read: true }));
    await kv.set('b_interiors_notifications', updated);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Notification read-all error:', err.message);
    return c.json({ error: 'Failed to mark all as read' }, 500);
  }
});

routes.delete('/notifications/:id', adminOnly, async (c) => {
  try {
    const id = c.req.param('id');
    const notifications: any[] = await kv.get('b_interiors_notifications') || [];
    const filtered = notifications.filter((n: any) => n.id !== id);
    await kv.set('b_interiors_notifications', filtered);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Notification delete error:', err.message);
    return c.json({ error: 'Failed to delete notification' }, 500);
  }
});

routes.delete('/notifications', adminOnly, async (c) => {
  try {
    await kv.set('b_interiors_notifications', []);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Clear notifications error:', err.message);
    return c.json({ error: 'Failed to clear notifications' }, 500);
  }
});

// ─── PayFast Settings API ────────────────────────────────────
routes.get('/payfast/settings', adminOnly, async (c) => {
  try {
    const kvSettings: any = await kv.get('b_interiors_payfast_settings') || {};
    const envConfigured = !!(Deno.env.get('PAYFAST_MERCHANT_ID') && Deno.env.get('PAYFAST_MERCHANT_KEY'));
    const kvConfigured = !!(kvSettings.merchantId && kvSettings.merchantKey);
    return c.json({
      merchantId: kvSettings.merchantId || '',
      merchantKey: kvSettings.merchantKey ? '••••' + kvSettings.merchantKey.slice(-4) : '',
      passphrase: kvSettings.passphrase ? '••••••••' : '',
      sandbox: kvSettings.sandbox !== undefined ? kvSettings.sandbox : true,
      envConfigured,
      kvConfigured,
      activeSource: kvConfigured ? 'admin' : envConfigured ? 'env' : 'none',
    });
  } catch (err: any) {
    console.log('PayFast settings fetch error:', err.message);
    return c.json({ error: 'Failed to fetch PayFast settings' }, 500);
  }
});

routes.put('/payfast/settings', adminOnly, async (c) => {
  try {
    const role = c.get('role');
    if (role !== 'owner' && role !== 'admin') {
      return c.json({ error: 'Only admin or owner can update PayFast settings' }, 403);
    }
    const body = await c.req.json();
    const existing: any = await kv.get('b_interiors_payfast_settings') || {};
    const updated: any = { ...existing };
    if (body.merchantId !== undefined) updated.merchantId = body.merchantId;
    if (body.merchantKey !== undefined && !body.merchantKey.startsWith('••••')) updated.merchantKey = body.merchantKey;
    if (body.passphrase !== undefined && !body.passphrase.startsWith('••••')) updated.passphrase = body.passphrase;
    if (body.sandbox !== undefined) updated.sandbox = body.sandbox;
    await kv.set('b_interiors_payfast_settings', updated);
    await logActivity(c, 'settings.payfast', `Updated PayFast settings (mode: ${updated.sandbox ? 'sandbox' : 'live'})`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('PayFast settings update error:', err.message);
    return c.json({ error: 'Failed to update PayFast settings' }, 500);
  }
});

app.route(PREFIX, routes);
app.route('/', routes);

Deno.serve(app.fetch);