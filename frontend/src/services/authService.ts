import type { User } from "../types/User";

const API_URL = "http://localhost:3000/api/auth";

type AuthResponse = {
  message: string;
  user: User;
};

type MeResponse = {
  user: User;
};

type ApiError = {
  error?: string;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data: ApiError = await response.json().catch(() => ({}));

    throw new Error(data.error || "Une erreur est survenue");
  }

  return response.json() as Promise<T>;
}

// INSCRIPTION
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  return handleResponse<AuthResponse>(response);
}

// CONNEXION
export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return handleResponse<AuthResponse>(response);
}

// UTILISATEUR CONNECTÉ
export async function getCurrentUser(): Promise<User | null> {
  const response = await fetch(`${API_URL}/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  const data = await handleResponse<MeResponse>(response);

  return data.user;
}

// DÉCONNEXION
export async function logout(): Promise<void> {
  const response = await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });

  await handleResponse<{ message: string }>(response);
}
