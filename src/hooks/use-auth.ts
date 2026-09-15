"use client";

import { useCallback, useEffect, useState } from "react";

type StoredUser = { id: string; name: string; email: string; password: string };
type AuthState = { users: StoredUser[]; sessionUserId: string | null };

const STORAGE_KEY = "waie:auth:v1";
const emptyState: AuthState = { users: [], sessionUserId: null };

function readState(): AuthState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyState, ...JSON.parse(raw) } : emptyState;
  } catch {
    return emptyState;
  }
}

function writeState(state: AuthState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing, storage full, etc. — the UI still works for this session.
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export type AuthUser = { id: string; name: string; email: string };
export type AuthResult = { ok: true } | { ok: false; error: string };

/**
 * Local, per-device stand-in for a real account system — mirrors the shape
 * of hooks/use-library.ts. Accounts and sessions live only in this browser's
 * localStorage (no hashing, no server): good enough to demo the full
 * login/signup UI, not a real auth backend. Swap the internals for a real
 * session provider later without touching the components that call it.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>(emptyState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setState(readState());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setState(readState());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const user: AuthUser | null = (() => {
    const found = state.users.find((u) => u.id === state.sessionUserId);
    return found ? { id: found.id, name: found.name, email: found.email } : null;
  })();

  const signup = useCallback((name: string, email: string, password: string): AuthResult => {
    const normalized = normalizeEmail(email);
    const current = readState();
    if (current.users.some((u) => u.email === normalized)) {
      return { ok: false, error: "هذا البريد الإلكتروني مسجّل بالفعل، جرّب تسجيل الدخول." };
    }
    const newUser: StoredUser = { id: crypto.randomUUID(), name: name.trim(), email: normalized, password };
    const next: AuthState = { users: [...current.users, newUser], sessionUserId: newUser.id };
    writeState(next);
    setState(next);
    return { ok: true };
  }, []);

  const login = useCallback((email: string, password: string): AuthResult => {
    const normalized = normalizeEmail(email);
    const current = readState();
    const match = current.users.find((u) => u.email === normalized);
    if (!match || match.password !== password) {
      return { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
    }
    const next: AuthState = { ...current, sessionUserId: match.id };
    writeState(next);
    setState(next);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    const current = readState();
    const next: AuthState = { ...current, sessionUserId: null };
    writeState(next);
    setState(next);
  }, []);

  const requestPasswordReset = useCallback((email: string): AuthResult => {
    const normalized = normalizeEmail(email);
    const current = readState();
    const exists = current.users.some((u) => u.email === normalized);
    if (!exists) {
      return { ok: false, error: "لا يوجد حساب مرتبط بهذا البريد الإلكتروني." };
    }
    return { ok: true };
  }, []);

  return { isHydrated, user, signup, login, logout, requestPasswordReset };
}
