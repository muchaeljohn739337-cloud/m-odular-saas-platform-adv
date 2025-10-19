// Custom authentication service for static export
export const auth = {
  async signIn(credentials: { email: string; password: string }) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  },

  async signOut() {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  },

  async getSession() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });

      if (!response.ok) {
        throw new Error('Session invalid');
      }

      const data = await response.json();
      return data;
    } catch {
      localStorage.removeItem('token');
      return null;
    }
  }
};