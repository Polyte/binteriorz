import type { Env } from '../../_lib/payfast';
import { isSandbox, json, paymentUrl } from '../../_lib/payfast';

export const onRequestGet: PagesFunction<Env> = ({ env }) => json({
  configured: Boolean(env.PAYFAST_MERCHANT_ID && env.PAYFAST_MERCHANT_KEY),
  sandbox: isSandbox(env),
  paymentUrl: paymentUrl(env),
});
