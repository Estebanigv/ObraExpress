"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  nombre: string;
  telefono?: string;
  fechaRegistro: Date;
  comprasRealizadas: number;
  totalComprado: number;
  tieneDescuento: boolean;
  porcentajeDescuento: number;
  provider?: 'email' | 'google' | 'apple' | 'microsoft' | 'facebook';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  autoRegister: (email: string, nombre: string, telefono?: string) => User;
}

export interface RegisterData {
  email: string;
  password?: string;
  nombre: string;
  telefono?: string;
  provider?: 'email' | 'google' | 'apple' | 'microsoft' | 'facebook';
  tieneDescuento?: boolean;
  porcentajeDescuento?: number;
  fechaRegistro?: Date;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('polimax_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({
          ...userData,
          fechaRegistro: new Date(userData.fechaRegistro)
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('polimax_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Guardar usuario en localStorage cuando cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem('polimax_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('polimax_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simular autenticación - en producción sería una API
    const storedUsers = JSON.parse(localStorage.getItem('polimax_users') || '[]');
    const foundUser = storedUsers.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser({
        ...userWithoutPassword,
        fechaRegistro: new Date(userWithoutPassword.fechaRegistro)
      });
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Verificar si el usuario ya existe
      const storedUsers = JSON.parse(localStorage.getItem('polimax_users') || '[]');
      const existingUser = storedUsers.find((u: any) => u.email === userData.email);
      
      if (existingUser) {
        setIsLoading(false);
        return false; // Usuario ya existe
      }
      
      // Crear nuevo usuario
      const newUser: User & { password?: string } = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email,
        password: userData.password,
        nombre: userData.nombre,
        telefono: userData.telefono,
        fechaRegistro: userData.fechaRegistro || new Date(),
        comprasRealizadas: 0,
        totalComprado: 0,
        tieneDescuento: userData.tieneDescuento ?? true, // Descuento por registro
        porcentajeDescuento: userData.porcentajeDescuento ?? 5, // 5% de descuento por registrarse
        provider: userData.provider || 'email'
      };
      
      // Guardar en lista de usuarios
      storedUsers.push(newUser);
      localStorage.setItem('polimax_users', JSON.stringify(storedUsers));
      
      // Establecer como usuario actual (sin password)
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      setIsLoading(false);
      return false;
    }
  };

  const autoRegister = (email: string, nombre: string, telefono?: string): User => {
    // Registro automático para usuarios que hacen checkout sin registrarse
    const autoUser: User = {
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      nombre,
      telefono,
      fechaRegistro: new Date(),
      comprasRealizadas: 1,
      totalComprado: 0, // Se actualizará después del checkout
      tieneDescuento: true, // Descuento por primera compra
      porcentajeDescuento: 3 // 3% de descuento por primera compra
    };
    
    // Guardar en lista de usuarios
    const storedUsers = JSON.parse(localStorage.getItem('polimax_users') || '[]');
    storedUsers.push({ ...autoUser, password: 'auto_generated' });
    localStorage.setItem('polimax_users', JSON.stringify(storedUsers));
    
    setUser(autoUser);
    return autoUser;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Actualizar también en la lista de usuarios
      const storedUsers = JSON.parse(localStorage.getItem('polimax_users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        storedUsers[userIndex] = { ...storedUsers[userIndex], ...userData };
        localStorage.setItem('polimax_users', JSON.stringify(storedUsers));
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    autoRegister
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}