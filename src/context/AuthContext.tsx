import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  loginUser,
  registerDonor,
  registerPatient,
  logoutUser,
  getStoredUser,
  isLoggedIn,
  User,
} from '../services/authService';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuthContextType {
  user:         User | null;
  token:        string | null;
  loading:      boolean;
  login:        (email: string, password: string) => Promise<void>;
  register:     (name: string, email: string, password: string, role: string, extraData?: Record<string, unknown>) => Promise<void>;
  logout:       () => void;
  isAuthenticated: boolean;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load stored user on app start
  useEffect(() => {
    const storedUser  = getStoredUser();
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await loginUser(email, password);
      setUser(response.user);
      setToken(response.token);

      // Redirect based on role
      switch (response.user.role) {
        case 'coordinator': navigate('/admin');   break;
        case 'donor':       navigate('/donor');   break;
        case 'patient':     navigate('/patient'); break;
        default:            navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Register ────────────────────────────────────────────────────────────────
  const register = async (
    name: string,
    email: string,
    password: string,
    role: string,
    extraData?: Record<string, unknown>
  ) => {
    setLoading(true);
    try {
      const payload = { name, email, password, ...extraData };
      let response;

      if (role === 'donor') {
        response = await registerDonor(payload);
      } else if (role === 'patient') {
        response = await registerPatient(payload);
      } else {
        throw new Error('Invalid role');
      }

      setUser(response.user);
      setToken(response.token);

      // Redirect based on role
      navigate(role === 'patient' ? '/patient' : '/donor');

    } finally {
      setLoading(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}