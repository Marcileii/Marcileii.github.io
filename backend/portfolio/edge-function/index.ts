import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import postgres from 'npm:postgres@3.4.7'

const ALLOWED_ORIGIN = 'https://marcileii.github.io'
const RECIPIENT = 'marcileibrandao922@gmail.com'
const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { prepare: false, max: 1, idle_timeout: 10 })

const cors = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : '',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
})

const json = (body: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: cors(origin) })

const text = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max)
const esc = (value: string) => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    if (origin !== ALLOWED_ORIGIN) return json({ error: 'origin_not_allowed' }, 403, origin)
    return new Response(null, { status: 204, headers: cors(origin) })
  }

  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin)
  if (origin !== ALLOWED_ORIGIN) return json({ error: 'origin_not_allowed' }, 403, origin)

  const contentLength = Number(req.headers.get('content-length') || 0)
  if (contentLength > 16_384) return json({ error: 'payload_too_large' }, 413, origin)

  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400, origin)
  }

  // Honeypot: pessoas reais nunca preenchem esse campo.
  if (text(payload.website, 300)) return json({ ok: true }, 200, origin)

  const startedAt = Number(payload.started_at || 0)
  const age = Date.now() - startedAt
  if (!Number.isFinite(startedAt) || age < 2_500 || age > 7_200_000) {
    return json({ error: 'invalid_form_timing' }, 400, origin)
  }

  const name = text(payload.name, 120)
  const company = text(payload.company, 160) || null
  const email = text(payload.email, 254).toLowerCase()
  const phone = text(payload.phone, 60) || null
  const projectType = text(payload.type, 80)
  const budget = text(payload.budget, 80)
  const deadline = text(payload.deadline, 80)
  const description = text(payload.description, 5000)
  const references = text(payload.references, 2500) || null

  if (name.length < 2 || !emailOk(email) || !projectType || !budget || !deadline || description.length < 30) {
    return json({ error: 'validation_failed' }, 400, origin)
  }

  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const clientIp = req.headers.get('cf-connecting-ip') || forwarded || 'unknown'
  const userAgent = text(req.headers.get('user-agent'), 300)
  const fingerprint = await sha256(`${clientIp}|${userAgent}`)

  await sql`delete from portfolio.rate_limits where created_at < now() - interval '1 day'`
  const [rate] = await sql<{ count: number }[]>`
    select count(*)::int as count
    from portfolio.rate_limits
    where fingerprint = ${fingerprint}
      and created_at > now() - interval '15 minutes'
  `

  if ((rate?.count ?? 0) >= 5) {
    return json({ error: 'rate_limited' }, 429, origin)
  }

  await sql`insert into portfolio.rate_limits (fingerprint) values (${fingerprint})`

  const metadata = JSON.stringify({
    user_agent: userAgent,
    origin,
    received_via: 'edge-function',
  })

  const [lead] = await sql<{ id: string; created_at: string }[]>`
    insert into portfolio.leads
      (name, company, email, phone, project_type, budget, deadline, description, references, metadata)
    values
      (${name}, ${company}, ${email}, ${phone}, ${projectType}, ${budget}, ${deadline}, ${description}, ${references}, ${sql.json(metadata)})
    returning id::text, created_at::text
  `

  const resendKey = Deno.env.get('RESEND_API_KEY')
  let emailSent = false

  if (resendKey) {
    const subject = `Novo projeto pelo portfólio — ${company || name}`
    const plain = [
      `Novo briefing recebido pelo portfólio`,
      ``,
      `Nome: ${name}`,
      `Empresa: ${company || 'Não informado'}`,
      `Email: ${email}`,
      `Telefone/WhatsApp: ${phone || 'Não informado'}`,
      ``,
      `Tipo: ${projectType}`,
      `Investimento: ${budget}`,
      `Prazo: ${deadline}`,
      ``,
      `CONTEXTO`,
      description,
      ``,
      `REFERÊNCIAS`,
      references || 'Não informado',
      ``,
      `Lead ID: ${lead.id}`,
    ].join('\n')

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111">
        <h2>Novo projeto pelo portfólio</h2>
        <p><strong>${esc(name)}</strong>${company ? ` · ${esc(company)}` : ''}</p>
        <p><strong>Email:</strong> ${esc(email)}<br><strong>Telefone:</strong> ${esc(phone || 'Não informado')}</p>
        <hr>
        <p><strong>Tipo:</strong> ${esc(projectType)}<br><strong>Investimento:</strong> ${esc(budget)}<br><strong>Prazo:</strong> ${esc(deadline)}</p>
        <h3>Contexto</h3><p style="white-space:pre-wrap">${esc(description)}</p>
        <h3>Referências</h3><p style="white-space:pre-wrap">${esc(references || 'Não informado')}</p>
        <hr><small>Lead ID: ${esc(lead.id)}</small>
      </div>`

    try {
      const resend = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Portfolio Marcilei <onboarding@resend.dev>',
          to: [RECIPIENT],
          reply_to: email,
          subject,
          text: plain,
          html,
        }),
      })
      emailSent = resend.ok
    } catch {
      emailSent = false
    }
  }

  await sql`
    update portfolio.leads
    set email_status = ${emailSent ? 'sent' : resendKey ? 'failed' : 'pending'}
    where id = ${lead.id}::uuid
  `

  return json({ ok: true, lead_id: lead.id, email_sent: emailSent }, 201, origin)
})
