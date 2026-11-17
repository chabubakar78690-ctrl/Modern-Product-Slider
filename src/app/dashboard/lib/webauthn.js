// Client-side WebAuthn helpers (raw browser API, no extra dependency).
// The server speaks base64url JSON; the browser needs ArrayBuffers.

function b64ToBuf(s) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function credentialToJSON(cred) {
  const out = { id: cred.id, rawId: bufToB64(cred.rawId), type: cred.type, response: {} };
  const r = cred.response;
  if (r.clientDataJSON) out.response.clientDataJSON = bufToB64(r.clientDataJSON);
  if (r.attestationObject) out.response.attestationObject = bufToB64(r.attestationObject);
  if (r.authenticatorData) out.response.authenticatorData = bufToB64(r.authenticatorData);
  if (r.signature) out.response.signature = bufToB64(r.signature);
  if (r.userHandle) out.response.userHandle = bufToB64(r.userHandle);
  if (r.publicKeyAlgorithm !== undefined) out.response.publicKeyAlgorithm = r.publicKeyAlgorithm;
  if (r.publicKey) out.response.publicKey = bufToB64(r.publicKey);
  if (r.transports) out.response.transports = r.transports;
  return out;
}

async function post(step, body = {}) {
  const res = await fetch('/api/auth/passkey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, ...body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Passkey request failed.');
  return data;
}

// Sign in with a passkey on this device (discoverable credentials — no
// email needed). Throws a readable message on failure.
export async function loginWithPasskey() {
  if (!window.PublicKeyCredential) throw new Error('This browser does not support passkeys.');
  const options = await post('login-options');
  const cred = await navigator.credentials.get({
    publicKey: {
      ...options,
      challenge: b64ToBuf(options.challenge),
      allowCredentials: (options.allowCredentials || []).map((c) => ({ ...c, id: b64ToBuf(c.id) })),
    },
  });
  if (!cred) throw new Error('No passkey was selected.');
  return post('login-verify', { response: credentialToJSON(cred) });
}

// Add a passkey to the signed-in account (called from Profile).
export async function registerPasskey(name) {
  if (!window.PublicKeyCredential) throw new Error('This browser does not support passkeys.');
  const options = await post('register-options');
  const cred = await navigator.credentials.create({
    publicKey: {
      ...options,
      challenge: b64ToBuf(options.challenge),
      user: { ...options.user, id: b64ToBuf(options.user.id) },
      excludeCredentials: (options.excludeCredentials || []).map((c) => ({ ...c, id: b64ToBuf(c.id) })),
    },
  });
  if (!cred) throw new Error('Passkey was not created.');
  return post('register-verify', { response: credentialToJSON(cred), name });
}

export async function listPasskeys() {
  const res = await fetch('/api/auth/passkey');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not load passkeys.');
  return data;
}

export async function deletePasskey(credentialId) {
  const res = await fetch('/api/auth/passkey', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credentialId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not delete the passkey.');
  return data;
}
