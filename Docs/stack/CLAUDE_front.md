# Plantilla de Reglas Globales - Next.js 16 + TypeScript + Tailwind + React Query

Lea siempre este archivo al inicio de una nueva conversación para comprender la arquitectura, los objetivos, el estilo y las limitaciones del proyecto.

## 🧱 Estructura y modularidad del código

Principios fundamentales:

- **App Router**: Usamos el directorio `app` solo para enrutamiento y layouts.
- **Feature Driven**: Toda la lógica de negocio y UI compleja vive en `@/modules`.
- **Server vs Client**: Por defecto, Next.js usa Server Components. Agregue `"use client"` al inicio de los archivos solo cuando use hooks (useState, useEffect, React Query, Zustand) o interactividad del navegador.

### Estructura de Directorios Objetivo

```
src/
├── app/                        # Enrutamiento (App Router)
│   ├── layout.tsx              # Layout raíz (Providers van aquí)
│   ├── page.tsx                # Landing/Home
│   └── dashboard/              # Rutas protegidas
│       ├── layout.tsx          # Layout del Dashboard (Sidebar/Navbar)
│       └── [modulo]/           # Carpetas de rutas (ej: /dashboard/usuarios)
│           └── page.tsx        # Server Component que renderiza la vista del módulo
│
├── components/                 # Componentes compartidos
│   ├── ui/                     # Componentes de Shadcn UI (Button, Input, etc.)
│   └── shared/                 # Componentes globales personalizados (DataTable, Loader)
│
├── core/                       # Configuración del núcleo
│   ├── api/                    # Instancia de Axios (api.ts)
│   ├── config/                 # Variables de entorno y constantes
│   └── store/                  # Stores de Zustand (authStore.ts)
│
├── lib/                        # Utilidades y librerías (estándar Shadcn)
│   ├── utils.ts                # Utilidad 'cn' de Shadcn
│   └── validators.ts           # Esquemas Zod compartidos
│
└── modules/                    # Lógica de Negocio (Feature Folders)
    ├── auth/
    └── dashboard/              # Módulos del panel de administración
        ├── [ModuloNombre]/     # Ej: usuarios
        │   ├── components/     # Componentes UI locales
        │   │   └── [Modulo]CellTemplates.tsx
        │   ├── hooks/          # Hooks personalizados y React Query ("use client")
        │   │   ├── use[Modulo].ts
        │   │   ├── useCreate[Modulo].ts
        │   │   └── useEdit[Modulo].ts
        │   ├── services/       # Llamadas a API (Axios)
        │   │   └── [modulo].service.ts
        │   ├── types/          # Definiciones TypeScript
        │   │   └── [modulo].types.ts
        │   └── views/          # Componentes Vista (Page Content)
        │       ├── [Modulo]View.tsx       # Vista principal (Lista)
        │       ├── Create[Modulo]View.tsx # Vista de creación
        │       └── Edit[Modulo]View.tsx   # Vista de edición
```

## 📋 Regla de Módulos (Feature Architecture)

Para mantener la escalabilidad, separamos la **Ruta (Next.js)** de la **Vista (React puro)**.

### 1. El Archivo de Ruta (`src/app/dashboard/usuarios/page.tsx`)

Actúa como un contenedor simple. Puede ser un Server Component (para metadata) que renderiza el componente cliente.

```typescript
import { Metadata } from 'next';
import { UsuariosView } from '@/modules/dashboard/usuarios/views/UsuariosView';

export const metadata: Metadata = {
  title: 'Gestión de Usuarios | AgroScan',
};

export default function UsuariosPage() {
  return <UsuariosView />;
}
```

### 2. La Vista del Módulo (`src/modules/.../views/UsuariosView.tsx`)

Contiene la UI y usa los hooks. Debe tener `"use client"` si usa hooks.

```typescript
'use client';
import { useUsuariosPage } from '../hooks/useUsuarios';
// ... imports UI
export const UsuariosView = () => {
   const { usuarios, ... } = useUsuariosPage();
   // render...
}
```

## 📝 Convenciones de Nomenclatura

- **Carpetas de Ruta (app/)**: kebab-case (ej: `dashboard/gestion-cultivos`).
- **Carpetas de Módulo (modules/)**: camelCase (ej: `usuarios`, `monitoreoCultivos`).
- **Hooks**: `use[Nombre].ts` (siempre `.ts`, nunca `.tsx`).
- **Vistas**: `[Nombre]View.tsx` (PascalCase).
- **Servicios**: `[nombre].service.ts`.
- **Tipos**: `[nombre].types.ts`.

## 🛠️ Stack Tecnológico y Prácticas

### 1. Next.js 16 Specifics

- **Navegación**: Usar `useRouter` de `next/navigation` (NO `next/router` ni `react-router-dom`).
- **Imágenes**: Usar siempre `<Image />` de `next/image` con dimensiones o `fill`.
- **Fuentes**: Usar `next/font/google`.
- **Links**: Usar `<Link href="...">` de `next/link`.

### 2. React Query + Axios

Aunque Next.js tiene `fetch` extendido, usaremos React Query para el estado asíncrono del cliente (loading, error, caching, revalidation) en el dashboard.

**Ubicación de Hooks**: Los hooks de React Query deben estar en `modules/[modulo]/hooks/`.

```typescript
// modules/dashboard/usuarios/hooks/useUsuarios.ts
'use client'; // Obligatorio porque usa hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuarios.service';

export const useGetUsuarios = () => {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: usuariosService.obtenerUsuarios,
  });
};
```

### 3. Shadcn UI + Tailwind

- Los componentes base están en `@/components/ui`.
- Usar la función `cn()` para combinar clases condicionales.
- NO crear CSS personalizado. Usar clases de utilidad de Tailwind.
- Ejemplo: `className={cn("flex gap-2", isActive && "bg-primary")}`.

### 4. Zustand (Estado Global)

Para estado global de cliente (ej. Sidebar colapsado, Sesión de usuario).

```typescript
// core/store/uiStore.ts
import { create } from 'zustand';

interface UiState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
```

## 🎯 Estándares de Código Obligatorios

- **Typescript Estricto**: No usar `any`. Definir interfaces en la carpeta `types` del módulo.
- **Exportaciones Nombradas**: Preferir `export const Componente` sobre `export default`. (Excepción: `page.tsx` y `layout.tsx` de Next.js requieren `export default`).
- **Hooks "Puros"**: Los hooks en `.ts` no deben retornar JSX, solo datos y funciones. Si necesitas retornar UI desde una lógica repetitiva, crea un componente en `components/`.
- **Manejo de Errores**: Axios debe tener un interceptor en `@/core/api/api.ts` para manejar errores 401/403 globalmente. En los hooks de mutación, usar `toast` (de Shadcn/Sonner) para feedback.

### Ejemplo de Configuración de Axios (`core/api/api.ts`)

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  // Lógica para adjuntar token desde Zustand o Cookies
  return config;
});
```

## 🔒 Seguridad y Escalabilidad

- **Variables de Entorno**: Usar prefijo `NEXT_PUBLIC_` solo para variables expuestas al navegador.
- **Server Actions vs API**: Si el proyecto requiere conectar con un backend externo vía Axios, se hará desde el cliente (React Query). Si se requiere ocultar keys o lógica, usar Server Actions o Route Handlers como proxy.
- **Lazy Loading**: Usar `dynamic` de Next.js para componentes pesados en el dashboard (ej. mapas o gráficos grandes).

```typescript
const MapaCultivo = dynamic(() => import('./MapaCultivo'), { ssr: false });
```

## 🧠 Comportamiento del Agente

- Al crear un nuevo módulo, genere primero la estructura de carpetas y archivos.
- Verifique siempre si el componente necesita `"use client"`.
- Asuma que Shadcn UI ya está instalado; sugiera el uso de sus componentes (Card, Table, Form, etc.).
- Si se pide refactorizar, priorice dividir componentes grandes en sub-componentes dentro de la carpeta del módulo.

---

## 🔐 Estructura del Módulo de Autenticación (modules/auth)

El módulo de Autenticación (Auth) requiere un tratamiento especial porque es la "puerta de entrada" y afecta el estado global de toda la aplicación (tokens, redirecciones, protección de rutas).

Para mantener la coherencia con la arquitectura Next.js 16 + Zustand + React Query, estructuraremos el login y register separando la persistencia del estado (Zustand) de las mutaciones de red (React Query).

Usaremos un **Route Group** en Next.js `(auth)` para aislar el layout de autenticación (pantalla centrada, sin sidebar) del layout del dashboard.

```
src/
├── app/
│   ├── (auth)/                 # Grupo de rutas (no afecta URL)
│   │   ├── layout.tsx          # Layout Auth (Centrado, background)
│   │   ├── login/
│   │   │   └── page.tsx        # Ruta /login
│   │   └── register/
│   │   │   └── page.tsx        # Ruta /register
│
├── core/
│   ├── store/
│   │   └── authStore.ts        # Estado global (Token, User, isAuth)
│   └── api/
│   │   └── api.ts              # Interceptor para inyectar Token
│
└── modules/
    └── auth/
        ├── components/         # LoginForm, RegisterForm, AuthCard
        ├── hooks/              # useLogin.ts, useRegister.ts
        ├── services/           # auth.service.ts
        ├── types/              # auth.types.ts
        └── views/              # LoginView.tsx, RegisterView.tsx
```

### 1. Estado Global con Zustand (`core/store/authStore.ts`)

Usamos Zustand con el middleware `persist` para mantener la sesión activa aunque se recargue la página.

**IMPORTANTE**: El método `logout` también debe eliminar la cookie para que el Middleware funcione correctamente.

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User } from '@/modules/auth/types/auth.types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => {
        Cookies.remove('auth-token'); // Eliminar cookie
        set({ token: null, user: null, isAuthenticated: false }); // Limpiar estado
      },
    }),
    {
      name: 'auth-storage', // Nombre en localStorage
    }
  )
);
```

### 2. Integración en Axios (`core/api/api.ts`)

Configuramos el interceptor para leer el token desde Zustand automáticamente en cada petición.

```typescript
import axios from 'axios';
import { useAuthStore } from '@/core/store/authStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor de Request: Inyectar Token
api.interceptors.request.use(config => {
  // Leemos el token directamente del estado de Zustand (no es un hook, funciona aquí)
  const token = useAuthStore.getState().token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Response: Manejar 401 (Token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login'; // Redirección forzada al login
    }
    return Promise.reject(error);
  }
);
```

### 3. Hooks de Autenticación (`modules/auth/hooks/useAuth.ts`)

Aquí unimos React Query (para la petición) con Zustand (para guardar el resultado) y Next Navigation (para redirigir).

**IMPORTANTE**: Usamos cookies para que el Middleware de Next.js pueda leer el token en el servidor.

```typescript
'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/core/store/authStore';
import { LoginPayload, RegisterPayload } from '../types/auth.types';

export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginPayload) => authService.login(credentials),
    onSuccess: (data) => {
      // 1. Guardar en Cookie (Para el Middleware)
      // 'auth-token' es el nombre, expira en 7 días
      Cookies.set('auth-token', data.token, { expires: 7, secure: true, sameSite: 'strict' });

      // 2. Guardar en Zustand (Para Axios y UI)
      setAuth(data.token, data.user);
      
      // 3. Feedback visual
      toast.success(`Bienvenido, ${data.user.name}`);
      
      // 4. Redirección
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  });
};

export const useRegister = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: (data: RegisterPayload) => authService.register(data),
    onSuccess: () => {
      toast.success('Cuenta creada. Por favor inicia sesión.');
      router.push('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error en el registro');
    }
  });
};
```

### 4. Implementación de la Vista (`modules/auth/views/LoginView.tsx`)

Usamos Shadcn UI y React Hook Form + Zod (recomendado para formularios).

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validators'; // Esquema Zod
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogin } from '../hooks/useAuth';
import type { LoginPayload } from '../types/auth.types';

export const LoginView = () => {
  const { mutate: login, isPending } = useLogin();
  
  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = (data: LoginPayload) => {
    login(data);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Iniciar Sesión</h2>
        <p className="text-muted-foreground mt-2">Accede a tu panel de AgroScan</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Input 
            placeholder="Correo electrónico" 
            type="email" 
            {...form.register('email')} 
          />
          {form.formState.errors.email && (
            <span className="text-sm text-red-500">{form.formState.errors.email.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Input 
            placeholder="Contraseña" 
            type="password" 
            {...form.register('password')} 
          />
        </div>

        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>
    </div>
  );
};
```

### 5. Configuración de Rutas Next.js

**`src/app/(auth)/login/page.tsx`**

```typescript
import { Metadata } from 'next';
import { LoginView } from '@/modules/auth/views/LoginView';

export const metadata: Metadata = {
  title: 'Login | AgroScan',
  description: 'Inicia sesión en la plataforma de monitoreo',
};

export default function LoginPage() {
  return <LoginView />;
}
```

**`src/app/(auth)/layout.tsx`**

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Contenedor centralizado compartido para login y register */}
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        {children}
      </div>
    </div>
  );
}
```

## 🛡️ Middleware en Next.js (Seguridad Implementada)

Dado que Next.js ejecuta Middleware en el servidor (Edge Runtime), no puede acceder a `localStorage` (donde Zustand guarda el token). Por eso usamos **cookies** para que el Middleware pueda leer el token en el servidor.

### Implementación Completa

#### 1. Instalar Dependencia

Necesitarás `js-cookie` para manejar cookies desde el cliente fácilmente:

```bash
npm install js-cookie @types/js-cookie
```

#### 2. Middleware (`src/middleware.ts`)

Este archivo es mágico en Next.js. Vive en la raíz `src/middleware.ts` y protege tus rutas desde el servidor.

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener el token de las cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // Definir rutas protegidas
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

  // CASO 1: Usuario NO logueado intenta entrar al dashboard
  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // CASO 2: Usuario YA logueado intenta entrar al login/register
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
```

### Flujo de Autenticación con Cookies

1. **Login exitoso**: Se guarda el token en cookie (`auth-token`) y en Zustand
2. **Middleware verifica**: En cada request a `/dashboard/*`, el Middleware lee la cookie
3. **Sin token**: Redirige a `/login` antes de renderizar
4. **Con token**: Permite el acceso
5. **Logout**: Elimina cookie y limpia Zustand

### Ventajas de esta Implementación

- ✅ **Sin parpadeo**: El Middleware redirige antes de renderizar
- ✅ **Seguro**: El token está disponible en el servidor para validación
- ✅ **Sincronizado**: Cookie y Zustand se mantienen sincronizados
- ✅ **Automático**: Protección automática de rutas sin código adicional

---

## 📎 Estilo y convenciones

Utilice TypeScript como lenguaje principal.
Siga las reglas de ESLint y Prettier configuradas en el proyecto.
Utilice Tailwind CSS para estilos, evitando CSS personalizado innecesario.

### 🎯 **ESTÁNDARES DE CÓDIGO OBLIGATORIOS**

#### **Punto y Coma (SEMICOLON) - OBLIGATORIO**
- **SIEMPRE** usar punto y coma al final de cada declaración, importación, función, variable, etc.
- **NUNCA** omitir punto y coma, incluso en JavaScript moderno

#### **camelCase - OBLIGATORIO**
- **SIEMPRE** usar camelCase para variables y funciones
- **NUNCA** usar snake_case, kebab-case o PascalCase para variables/funciones
- Ejemplos:
  ```typescript
  // ✅ CORRECTO
  const nombreCompleto = 'Juan Pérez';
  const calcularValorTotal = () => {};
  const listaUsuarios = [];

  // ❌ INCORRECTO
  const nombre_completo = 'Juan Pérez';
  const calcular-valor-total = () => {};
  const ListaUsuarios = [];
  ```

#### **Nombres Descriptivos - OBLIGATORIO**
- **SIEMPRE** usar nombres descriptivos y claros
- **NUNCA** usar letras sueltas, números o caracteres mínimos
- **EVITAR** nombres ambiguos como `x`, `temp`, `data`, `i`, `j`, `n`, `obj`
- Ejemplos:
  ```typescript
  // ✅ CORRECTO
  const usuarioAutenticado = true;
  const listaProductos = [];
  const fechaCreacion = new Date();
  const contadorIntentos = 0;

  // ❌ INCORRECTO
  const x = true;
  const temp = [];
  const data = new Date();
  const n = 0;
  const obj = {};
  ```

#### **Estructura de Funciones - OBLIGATORIO**
- **SIEMPRE** seguir estructura **verbo + objeto** para funciones
- Ejemplos:
  ```typescript
  // ✅ CORRECTO
  const calcularTotal = () => {};
  const enviarNotificacion = () => {};
  const obtenerUsuario = () => {};
  const validarFormulario = () => {};

  // ❌ INCORRECTO
  const total = () => {};
  const notificacion = () => {};
  const usuario = () => {};
  ```

#### **Declaración de Variables - OBLIGATORIO**
- **PRIORIZAR** `const` por defecto
- **USAR** `let` solo cuando sea estrictamente necesario reasignar
- **NUNCA** usar `var`
- Ejemplos:
  ```typescript
  // ✅ CORRECTO
  const nombreUsuario = 'Juan';
  const listaProductos = [];
  let contador = 0; // Solo cuando necesites reasignar
  contador++;

  // ❌ INCORRECTO
  var nombreUsuario = 'Juan';
  let nombreUsuario = 'Juan'; // Cuando no necesitas reasignar
  ```

#### **Comentarios - OBLIGATORIO**
- **EVITAR** comentarios obvios que no aporten valor
- **SOLO** comentar funciones grandes, robustas o lógica compleja no obvia
- **NUNCA** comentar código simple o autoexplicativo
- Ejemplos:
  ```typescript
  // ✅ CORRECTO - Comentario útil
  // Calcular el hash SHA-256 para verificar integridad del archivo
  const calcularHashArchivo = (contenido: string) => {
    // Implementación compleja de hash...
  };

  // ✅ CORRECTO - Sin comentario obvio
  const nombreUsuario = 'Juan';
  const listaProductos = [];

  // ❌ INCORRECTO - Comentario obvio innecesario
  // Asignar nombre de usuario
  const nombreUsuario = 'Juan';
  // Crear lista de productos
  const listaProductos = [];
  // Incrementar contador
  contador++;
  ```

### Convenciones de nomenclatura:

- Componentes: PascalCase (ej: `UserProfile.tsx`)
- Archivos/funciones: camelCase (ej: `fetchUserData.ts`)
- Constantes: UPPER_SNAKE_CASE (ej: `API_BASE_URL`)
- CSS classes: kebab-case (siguiendo Tailwind)

Utilice interfaces TypeScript para props y tipos de datos:

```typescript
interface UserProfileProps {
  user: User;
  onEdit?: () => void;
}
```

## 🔗 Aliases de importación (tsconfig.json)

Están configurados los siguientes aliases para importaciones absolutas:

- `@` → `src/`
- `@components` → `src/components`
- `@modules` → `src/modules`
- `@core` → `src/core`
- `@shared` → `src/shared`
- `@lib` → `src/lib`

Ejemplos:

```typescript
import { Button } from "@/components/ui/button";
import { UsuariosView } from "@/modules/dashboard/usuarios/views/UsuariosView";
import { useAuthStore } from "@/core/store/authStore";
import { cn } from "@/lib/utils";
```

## 📚 Documentación y explicabilidad

Actualizar README.md cuando se agregan nuevas funciones, dependencias cambian o se modifican los pasos de configuración.

Comente código no obvio y asegúrese de que todo sea comprensible para un desarrollador de nivel medio.
Al escribir lógica compleja, añadir comentarios `// Reason:` explicando el por qué, no sólo el qué.

## ⚛️ Reglas específicas de React

Utilice hooks personalizados para lógica reutilizable.
Mantenga componentes puros cuando sea posible.
Utilice React.memo() para optimización cuando sea necesario.
Evite prop drilling - use Context API / Zustand estado global para datos compartidos.
Utilice Suspense para carga lazy de componentes.
Prefiera composition sobre inheritance.

## 🔄 React Query (TanStack Query)

React Query se utiliza para manejo de estado del servidor, caché y sincronización de datos.

### Configuración

Configurar el QueryClient en el provider de la aplicación:

```typescript
// En app/layout.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutos
      },
    },
  }));

  return (
    <html lang="es">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### Convenciones de uso:

- **SIEMPRE** usar React Query para peticiones a APIs y datos del servidor
- **NUNCA** usar useState para datos que provienen del servidor
- **NOMBRAR** queries con prefijo `use` seguido de lo que obtiene: `useGetUsuarios`, `useGetProductos`
- **NOMBRAR** mutations con prefijo `use` seguido de la acción: `useCreateUsuario`, `useUpdateProducto`

### Directrices:

- Usar `queryKey` descriptivos y consistentes para facilitar invalidación
- Invalidar queries relacionadas después de mutaciones exitosas
- Usar `select` para transformar datos cuando sea necesario
- Manejar estados de loading y error correctamente en componentes
- Agrupar queries relacionadas por entidad (ej: `['usuarios']`, `['usuarios', usuarioId]`)

## 🎨 Reglas de Tailwind CSS

Utilice clases de Tailwind en lugar de CSS personalizado.
Extraiga componentes cuando las clases se repitan mucho.
Use el archivo `tailwind.config.js` para personalizar el tema.

## 🧠 Reglas de comportamiento de la IA

Nunca asuma que falta contexto. Haga preguntas si no está seguro.
Nunca alucine librerías o APIs – utilice únicamente paquetes npm conocidos y verificados.
Confirme siempre las rutas de los archivos y nombres de componentes antes de hacer referencia a ellos.
Nunca elimine ni sobrescriba código existente a menos que se le indique explícitamente
Siempre proporcione tipos TypeScript para nuevas funciones y componentes.
Verifique compatibilidad de dependencias con la versión de Next.js y otras librerías del proyecto.

---

## 🔐 Arquitectura de Seguridad Implementada

Esta sección documenta las decisiones de seguridad activas en el proyecto. **No modificar sin revisión.**

### Autenticación — httpOnly Cookie (sin token en cliente)

- El token JWT viaja en una cookie `httpOnly` seteada por el backend. JS **no puede leerla**.
- El frontend **no almacena token** en localStorage ni en Zustand.
- `withCredentials: true` en Axios — el browser envía la cookie automáticamente en cada request.
- Al hacer logout se llama `POST /auth/logout` al backend para limpiar la cookie desde el servidor.

### authStore — Zustand con _hasHydrated

```typescript
// core/store/authStore.ts
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;  // true cuando Zustand termina de leer localStorage
}
```

- **`_hasHydrated`**: Evita flash de UI antes de conocer el estado real de sesión.
- **NUNCA** agregar `token` al store — la cookie httpOnly lo reemplaza.
- `gcTime: 0` en useMe — al hacer logout el caché de `/auth/me` se borra inmediatamente.

### api.ts — Interceptor 401

```typescript
// Excluye login Y logout del redirect para evitar loops infinitos
const isLoginRequest = requestUrl.includes('/auth/login');
const isLogoutRequest = requestUrl.includes('/auth/logout');

if (error.response?.status === 401 && !isLoginRequest && !isLogoutRequest) {
  // Usa axios directo (no la instancia api) para evitar ciclos
  await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {}, { withCredentials: true });
  useAuthStore.getState().logout();
  window.location.href = '/login';
}
```

- **SIEMPRE** excluir `/auth/logout` del interceptor de 401.
- **SIEMPRE** usar `axios` directo (no `api`) para llamar logout desde el interceptor.

### useMe — Sincronización del rol desde el servidor

```typescript
// modules/auth/hooks/useMe.ts
useQuery({
  queryKey: ['auth', 'me'],
  queryFn: authService.me,
  enabled: isAuthenticated,   // No hace fetch en páginas públicas
  retry: false,
  staleTime: 30 * 1000,
  gcTime: 0,                  // Caché se borra al logout
});
```

- El rol del usuario **siempre viene del servidor**, nunca del localStorage.
- Impide ataques donde el usuario edita localStorage para cambiar su rol.

### Dashboard Layout — Protección de rutas por rol

```typescript
// app/dashboard/layout.tsx
const SUPERADMIN_ONLY_ROUTES = ['/dashboard/admin'];
const PASTORAL_ONLY_ROUTES = [
  '/dashboard/ministerios', '/dashboard/subministerios',
  '/dashboard/comunidades', '/dashboard/rebanios',
  '/dashboard/personas', '/dashboard/reuniones',
  '/dashboard/roles', '/dashboard/usuarios',
];
```

**Flujo de protección** (en orden):
1. `!_hasHydrated` → `return null` (espera rehidratación de Zustand)
2. `!isAuthenticated` → `return null` + `useEffect` redirige a `/login`
3. `isMeLoading` → `return null` (espera datos verificados del servidor)
4. `enforceRoleRoute()` → redirige según rol verificado

- **NUNCA** renderizar el dashboard antes de que `useMe` resuelva — evita mostrar nav equivocado con datos stale del localStorage.
- **NUNCA** confiar en el rol del localStorage para proteger rutas — siempre esperar `isMeLoading: false`.

### proxy.ts — Middleware de Next.js

- Cookie que verifica el middleware: `sine-auth` (debe coincidir con el nombre que setea el backend).
- Protege rutas `/dashboard/*` en el servidor antes de renderizar.

### Reglas de seguridad activas

- **NUNCA** agregar `token` al authStore
- **NUNCA** leer el rol desde localStorage para decisiones de acceso
- **NUNCA** omitir el guard `isMeLoading` en el layout — causa flash de UI con rol incorrecto
- **SIEMPRE** excluir `/auth/logout` del interceptor 401
- **SIEMPRE** usar `axios` directo (no `api`) en el interceptor de logout
- **SIEMPRE** esperar `_hasHydrated` antes de redirigir
