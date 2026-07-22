// src/features/interns/hooks/useInternAuth.js

const INTERN_TOKEN_KEY = 'intern_token';

function parsePayload(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function getInternToken() {
  return localStorage.getItem(INTERN_TOKEN_KEY);
}

export function saveInternToken(token) {
  localStorage.setItem(INTERN_TOKEN_KEY, token);
}

export function clearInternToken() {
  localStorage.removeItem(INTERN_TOKEN_KEY);
}

export function getInternPayload() {
  const token = getInternToken();
  if (!token) return null;
  return parsePayload(token);
}

export function isInternTokenValid() {
  const payload = getInternPayload();
  if (!payload) return false;
  return payload.exp * 1000 > Date.now();
}

export function useInternAuth() {
  const token = getInternToken();
  console.log("🚀 ~ useInternAuth ~ token:", token)
  const payload = token ? parsePayload(token) : null;
  const isValid = payload ? payload.exp * 1000 > Date.now() : false;

  return {
    token,
    isValid,
    internId:     payload?.sub          ?? null,  // ✅ sub not id
    internName:   payload?.name         ?? null,  // name not in token — fetch from /me
    internStatus: payload?.status       ?? null,
    internType:   payload?.intern_type  ?? null,
  };
}