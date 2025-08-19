"use client";

import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function TestSupabasePage() {
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    try {
      setResult('Probando conexión...');
      
      // Test 1: Verificar conexión básica y ver todos los usuarios
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        setResult(`❌ Error de conexión: ${error.message}`);
        return;
      }

      setResult(`✅ Conexión OK! 
Total usuarios en BD: ${allUsers?.length || 0}

Usuarios encontrados:
${allUsers?.map(user => 
  `- Email: ${user.email}
  - Nombre: ${user.nombre}
  - Hash: ${user.password_hash}
  - ID: ${user.id}`
).join('\n\n') || 'Ninguno'}

---

Intentando buscar admin específicamente...`);

      // Test 2: Buscar usuarios con email que contenga 'polimax'
      const { data: polimaxUsers, error: polimaxError } = await supabase
        .from('users')
        .select('*')
        .ilike('email', '%polimax%');

      if (polimaxError) {
        setResult(prev => prev + `\n❌ Error buscando polimax: ${polimaxError.message}`);
        return;
      }

      setResult(prev => prev + `\n\nUsuarios con 'polimax': ${polimaxUsers?.length || 0}
${polimaxUsers?.map(user => `- ${user.email}`).join('\n') || 'Ninguno'}`);

    } catch (error) {
      setResult(`❌ Error general: ${error}`);
    }
  };

  const testPasswordHash = () => {
    const password = 'polimax2025$$';
    const hash = btoa(password + 'polimax_salt_2025');
    setResult(`🔑 Hash generado para "${password}": ${hash}`);
  };

  const createAdminUser = async () => {
    try {
      setResult('Creando usuario admin...');

      // Primero eliminar cualquier usuario existente con ese email
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('email', 'polimax.store');

      if (deleteError) {
        setResult(`❌ Error eliminando usuario existente: ${deleteError.message}`);
        return;
      }

      // Crear nuevo usuario admin
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: 'polimax.store',
          password_hash: 'cG9saW1heDIwMjUkJHBvbGltYXhfc2FsdF8yMDI1',
          nombre: 'Polimax.store',
          telefono: '+56 9 0000 0000',
          compras_realizadas: 0,
          total_comprado: 0,
          tiene_descuento: true,
          porcentaje_descuento: 100,
          provider: 'email'
        })
        .select()
        .single();

      if (createError) {
        setResult(`❌ Error creando usuario: ${createError.message}`);
        return;
      }

      setResult(`✅ Usuario admin creado exitosamente!
Email: ${newUser.email}
Nombre: ${newUser.nombre}
ID: ${newUser.id}
Hash: ${newUser.password_hash}

¡Ahora puedes probar el login!`);

    } catch (error) {
      setResult(`❌ Error general: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Supabase</h1>
        
        <div className="space-y-4">
          <button
            onClick={testConnection}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Probar Conexión a Supabase
          </button>

          <button
            onClick={testPasswordHash}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
          >
            Generar Hash de Contraseña
          </button>

          <button
            onClick={createAdminUser}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
          >
            Crear Usuario Admin en Supabase
          </button>
        </div>

        {result && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Resultado:</h2>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}