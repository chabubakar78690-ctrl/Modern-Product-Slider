// Real passkey (WebAuthn) sign-in.
// GET    /api/auth/passkey            -> the signed-in user's passkeys
// POST   /api/auth/passkey {step: 'register-options' | 'register-verify'}   (signed in)
// POST   /api/auth/passkey {step: 'login-options' | 'login-verify'}         (signed out)
// DELETE /api/auth/passkey {credentialId}                                   (signed in)
// The table is `passkeys` — run supabase/migration-add-passkeys.sql once in
// the Supabase SQL Editor so the table exists in production.
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { getDb } from '../../lib/db';
import { json, requireUser, createSession, sessionCookie } from '../../lib/auth';
import { signChallenge, readChallenge, clearChallengeCookie, rpFromReq } from '../../lib/passkey';

export const dynamic = 'force-dynamic';

const RP_NAME = 'Modern Product Slider';

async function listPasskeys(db, userId) {
  try {
    const rows = await db.all('passkeys');
    return rows.filter((r) => r.user_id === userId);
  } catch {
    return null; // table missing (migration not run yet)
  }
}

export async function GET(req) {
  const { session, error } = requireUser(req);
  if (error) return error;
  const db = getDb();
  const rows = await listPasskeys(db, session.uid);
  if (rows === null) return json({ passkeys: [], setupNeeded: true });
  return json({ passkeys: rows.map((r) => ({ id: r.credential_id, name: r.name || 'Passkey', created_at: r.created_at })) });
}

export async function DELETE(req) {
  const { session, error } = requireUser(req);
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const credentialId = String(body.credentialId || '');
  if (!credentialId) return json({ error: 'credentialId is required' }, 400);
  const db = getDb();
  const row = await db.find('passkeys', 'credential_id', credentialId).catch(() => null);
  if (!row || row.user_id !== session.uid) return json({ error: 'Passkey not found' }, 404);
  await db.remove('passkeys', 'credential_id', credentialId);
  return json({ ok: true });
}

export async function POST(req) {
  const db = getDb();
  const body = await req.json().catch(() => ({}));
  const step = body.step;
  const { rpID, origin } = rpFromReq(req);

  if (step === 'register-options') {
    const { session, error } = requireUser(req);
    if (error) return error;
    const existing = (await listPasskeys(db, session.uid)) || [];
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID,
      userID: new TextEncoder().encode(session.uid),
      userName: session.email,
      userDisplayName: session.name || session.email,
      userVerification: 'preferred',
      authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
      excludeCredentials: existing.map((r) => ({ id: r.credential_id })),
    });
    const res = json(options);
    res.headers.set('Set-Cookie', signChallenge({ challenge: options.challenge, email: session.email, type: 'register' }));
    return res;
  }

  if (step === 'register-verify') {
    const { session, error } = requireUser(req);
    if (error) return error;
    const ch = readChallenge(req);
    if (!ch || ch.type !== 'register' || ch.email !== session.email) {
      return json({ error: 'Passkey challenge expired. Please try again.' }, 400);
    }
    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body.response,
        expectedChallenge: ch.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: false,
      });
    } catch (e) {
      return json({ error: 'Passkey could not be verified: ' + e.message }, 400);
    }
    if (!verification.verified || !verification.registrationInfo) {
      return json({ error: 'Passkey verification failed.' }, 400);
    }
    const { credential } = verification.registrationInfo;
    const name = String(body.name || '').trim() || `Passkey ${new Date().toISOString().slice(0, 10)}`;
    await db.insert('passkeys', {
      id: 'pk-' + Math.random().toString(36).slice(2, 10),
      user_id: session.uid,
      email: session.email,
      credential_id: credential.id,
      public_key: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter || 0,
      transports: credential.transports || [],
      name,
      created_at: new Date().toISOString().slice(0, 10),
    }).catch(() => null);
    const res = json({ ok: true });
    res.headers.set('Set-Cookie', clearChallengeCookie());
    return res;
  }

  if (step === 'login-options') {
    // Discoverable credentials: the browser shows the device's passkeys
    // for this site, so no email is needed up front.
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
    });
    const res = json(options);
    res.headers.set('Set-Cookie', signChallenge({ challenge: options.challenge, type: 'login' }));
    return res;
  }

  if (step === 'login-verify') {
    const ch = readChallenge(req);
    if (!ch || ch.type !== 'login') {
      return json({ error: 'Passkey challenge expired. Please try again.' }, 400);
    }
    const credentialId = String(body.response?.id || '');
    if (!credentialId) return json({ error: 'No passkey response received.' }, 400);
    const stored = await db.find('passkeys', 'credential_id', credentialId).catch(() => null);
    if (!stored) return json({ error: 'No passkey is registered for this device. Sign in with email first, then add a passkey in Profile.' }, 401);
    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body.response,
        expectedChallenge: ch.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: stored.credential_id,
          publicKey: Buffer.from(stored.public_key, 'base64url'),
          counter: stored.counter || 0,
          transports: stored.transports || [],
        },
      });
    } catch (e) {
      return json({ error: 'Passkey could not be verified: ' + e.message }, 400);
    }
    if (!verification.verified) return json({ error: 'Passkey verification failed.' }, 401);
    await db.update('passkeys', 'credential_id', stored.credential_id, { counter: verification.authenticationInfo.newCounter }).catch(() => null);
    const user = await db.find('users', 'id', stored.user_id);
    if (!user) return json({ error: 'Account not found for this passkey.' }, 401);
    const res = json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    res.headers.append('Set-Cookie', sessionCookie(createSession(user)));
    res.headers.append('Set-Cookie', clearChallengeCookie());
    return res;
  }

  return json({ error: 'Unknown passkey step' }, 400);
}
