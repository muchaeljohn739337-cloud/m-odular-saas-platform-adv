export async function ensureToken() {
  let token = localStorage.getItem("token");
  const refresh = localStorage.getItem("refreshToken");
  if (!token && refresh) {
    const res = await fetch("/api/auth/admin/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refresh }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      token = data.accessToken;
    } else {
      localStorage.clear();
    }
  }
  return token;
}

export function logout(router: any) {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  router.push("/admin/login");
}

export async function checkAdminAuth(router: any): Promise<boolean> {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/admin/login");
    return false;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "admin") {
      router.push("/dashboard");
      return false;
    }
    return true;
  } catch {
    router.push("/admin/login");
    return false;
  }
}
