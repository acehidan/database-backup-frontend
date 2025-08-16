import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // For demo purposes, we'll simulate a login API call
      // In a real app, you would make an API call to your authentication endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

      // Hardcoded credentials for frontend authentication
      const validCredentials = [
        { email: "admin@backup.com", password: "admin123" },
        { email: "user@backup.com", password: "user123" },
        { email: "demo@backup.com", password: "demo123" },
      ];

      // Check if provided credentials match any valid credentials
      const isValidUser = validCredentials.some(
        (cred) => cred.email === email && cred.password === password
      );

      if (isValidUser) {
        const mockUser: User = {
          id: "1",
          email: email,
          name: email.split("@")[0] || "User",
        };

        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
