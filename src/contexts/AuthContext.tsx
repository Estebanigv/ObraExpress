"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { safeLocalStorage } from '@/lib/client-utils';
import { AuthStorage } from '@/lib/auth-storage';
import { initializeAdminUser } from '@/lib/admin-setup';
import { SupabaseAuth } from '@/lib/supabase-auth';

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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setUser: (user: User | null) => void;
  autoRegister: (email: string, nombre: string, telefono?: string) => User;
  isSessionValid: () => boolean;
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

  // Cargar usuario desde sesión válida al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('🔄 Cargando usuario al iniciar...');
        
        // Primero verificar si hay datos en localStorage para respuesta inmediata
        const localUser = AuthStorage.getCurrentUser();
        if (localUser) {
          console.log('👤 Usuario encontrado en localStorage:', localUser.email);
          setUser(localUser);
        }

        // Luego verificar sesión en Supabase para validar
        const supabaseUser = await SupabaseAuth.verifySession();
        
        if (supabaseUser) {
          console.log('✅ Sesión verificada en Supabase:', supabaseUser.email);
          // Solo actualizar si es diferente del usuario local
          if (!localUser || localUser.id !== supabaseUser.id) {
            setUser(supabaseUser);
          }
        } else if (!localUser) {
          // Solo si no hay usuario local, intentar con localStorage fallback
          console.log('🔄 Verificando localStorage como fallback...');
          initializeAdminUser();
          
          const currentUser = AuthStorage.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            AuthStorage.clearSession();
          }
        }
      } catch (error) {
        console.error('❌ Error cargando usuario:', error);
        // En caso de error, usar localStorage como fallback
        initializeAdminUser();
        const currentUser = AuthStorage.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          AuthStorage.clearSession();
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Nota: El guardado de sesión se maneja en AuthStorage automáticamente

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    console.log('🔐 Intentando login con:', { email });
    
    // Determinar qué sistema de auth usar según el entorno
    const authMode = process.env.NEXT_PUBLIC_AUTH_MODE || 'localStorage';
    const isStaticExport = process.env.STATIC_EXPORT === 'true';
    
    console.log('🔧 Configuración de auth:', { authMode, isStaticExport });
    
    try {
      // Si es export estático (Hostinger) O authMode es 'hostinger', usar Supabase
      if (isStaticExport || authMode === 'hostinger') {
        console.log('🔐 Usando Supabase para login (Hostinger)...');
        const supabaseUser = await SupabaseAuth.login(email, password, rememberMe);
        
        if (supabaseUser) {
          console.log('✅ Login exitoso en Supabase:', supabaseUser.email);
          setUser(supabaseUser);
          setIsLoading(false);
          return true;
        }
        
        console.log('❌ Login fallido en Supabase');
        setIsLoading(false);
        return false;
      } 
      
      // Para Vercel u otros entornos, usar localStorage
      else {
        console.log('🔐 Usando localStorage para login (Vercel/Desarrollo)...');
        const foundUser = AuthStorage.findUser(email, password);
        
        if (foundUser) {
          console.log('✅ Login exitoso en localStorage:', foundUser.email);
          setUser(foundUser);
          AuthStorage.saveSession(foundUser, rememberMe);
          setIsLoading(false);
          return true;
        }
        
        console.log('❌ Login fallido en localStorage');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      logger.error('Error during login:', error);
      console.log('❌ Error en login:', error);
      setIsLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Iniciando login con Google...');
      
      // Usar Supabase OAuth para login con Google
      const result = await SupabaseAuth.loginWithGoogle();
      
      if (result.error) {
        console.log('❌ Error en login con Google:', result.error);
        setIsLoading(false);
        return { success: false, error: result.error };
      }
      
      if (result.url) {
        console.log('🔄 Redirigiendo a Google OAuth...');
        // Redirigir al usuario a la página de autenticación de Google
        window.location.href = result.url;
        
        // El estado de loading se mantendrá hasta que regrese del callback
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: 'No se pudo iniciar el proceso de autenticación' };
      
    } catch (error) {
      console.error('❌ Error en loginWithGoogle:', error);
      setIsLoading(false);
      return { success: false, error: 'Error interno del sistema' };
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Verificar si el usuario ya existe
      const existingUser = AuthStorage.findUser(userData.email);
      
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
      
      // Guardar usuario y crear sesión
      AuthStorage.saveUser(newUser);
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      AuthStorage.saveSession(userWithoutPassword, true); // Auto "recordarme" para nuevos usuarios
      
      setIsLoading(false);
      return true;
    } catch (error) {
      logger.error('Error registering user:', error);
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
    const storedUsers = JSON.parse(safeLocalStorage.getItem('polimax_users') || '[]');
    storedUsers.push({ ...autoUser, password: 'auto_generated' });
    safeLocalStorage.setItem('polimax_users', JSON.stringify(storedUsers));
    
    setUser(autoUser);
    return autoUser;
  };

  const logout = async () => {
    try {
      // Logout de Supabase
      await SupabaseAuth.logout();
    } catch (error) {
      console.error('Error en logout Supabase:', error);
    }
    
    // Limpiar localStorage como fallback
    AuthStorage.clearSession();
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Actualizar sesión y almacenamiento
      AuthStorage.saveSession(updatedUser, AuthStorage.hasRememberMe());
      
      // Actualizar en la lista de usuarios
      const users = AuthStorage.getAllUsers();
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userData };
        // Guardamos todos los usuarios actualizados
        users.forEach(u => AuthStorage.saveUser(u));
      }
    }
  };

  const isSessionValid = (): boolean => {
    return AuthStorage.isSessionValid();
  };

  const setUserState = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      // Guardar en AuthStorage para persistencia
      AuthStorage.saveSession(newUser, true);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
    setUser: setUserState,
    autoRegister,
    isSessionValid
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