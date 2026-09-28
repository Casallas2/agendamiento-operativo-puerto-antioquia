# 03 · Módulo Auth

Ruta: `Backend/src/modules/auth/`

Responsabilidad única: verificar la identidad del usuario y emitir la sesión. No sabe nada de
turnos, muelles ni flota.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `auth.controller.ts` | Los cuatro endpoints; es el único que escribe cookies en la respuesta |
| `auth.service.ts` | Validación de credenciales, firma del JWT y opciones de cookie |
| `mfa.service.ts` | Ciclo de vida del desafío de segundo factor |
| `sesion.constants.ts` | Duración de la sesión, compartida por el JWT y la cookie |
| `entities/desafio-mfa.entity.ts` | Tabla `desafios_mfa` |
| `dto/` | `LoginDto`, `VerificarMfaDto` |
| `types/` | Formas de respuesta |

## Flujo de inicio de sesión (RNF-02)

```
Cliente                        API                          Base de datos
  │                             │                                │
  │ POST /auth/login            │                                │
  ├────────────────────────────►│ bcrypt.compare                 │
  │                             ├───────────────────────────────►│ usuarios
  │                             │ borra desafíos previos         │
  │                             ├───────────────────────────────►│ desafios_mfa
  │ 200 { desafioId,            │                                │
  │       telefonoEnmascarado } │                                │
  │◄────────────────────────────┤                                │
  │                             │                                │
  │ POST /auth/mfa/verify       │                                │
  ├────────────────────────────►│ verifica código e intentos     │
  │                             ├───────────────────────────────►│ desafios_mfa
  │ 200 + Set-Cookie            │ firma el JWT                   │
  │◄────────────────────────────┤                                │
```

La contraseña nunca sale de la capa de datos: la columna `password_hash` está marcada con
`select: false` y solo se lee mediante `buscarPorCorreoConPassword`, que se usa exclusivamente
en este flujo.

## Decisiones

### Una cookie por área

Es la decisión de diseño más particular del módulo. El JWT se guarda en `puerto-sesion-cabina`
si el rol es `CONDUCTOR` y en `puerto-sesion-portal` en cualquier otro caso.

**Por qué:** la sustentación necesita mostrar al operador declarando un retraso y al conductor
recibiéndolo *al mismo tiempo, en el mismo navegador*. Con una sola cookie, la segunda sesión
pisaría a la primera. Con dos, conviven.

Como efecto secundario, `Frontend/src/proxy.ts` siguió funcionando sin un solo cambio: ya
comprobaba la presencia de esas dos cookies por nombre.

Para saber cuál leer, el cliente envía `X-Area-Sesion`, que el interceptor de Axios deduce de
la ruta actual (`/conductor` → `CABINA`). Sin esa cabecera, la estrategia intenta portal y
luego cabina.

### El perfil se relee en cada petición

`JwtStrategy.validate` no confía en los datos del token: busca el usuario por `sub` y devuelve
su estado actual. Cuesta una consulta por petición, pero significa que desactivar una cuenta
surte efecto de inmediato en lugar de esperar 8 horas a que caduque el JWT.

### Mensajes de error

- Usuario inexistente y contraseña errada devuelven **el mismo** mensaje: así la API no permite
  averiguar qué correos están registrados.
- El contador de intentos MFA se **persiste antes** de lanzar el error. Si se guardara después,
  el `throw` abortaría el guardado y el usuario tendría intentos infinitos.
- Al agotar los intentos, el desafío se borra: hay que volver a pasar por la contraseña.

### Cierre de sesión

`POST /auth/logout` es público a propósito: el interceptor del frontend lo llama justo después
de un `401`, cuando ya no hay sesión válida que presentar. Limpia únicamente la cookie del área
indicada en `X-Area-Sesion`, de modo que cerrar la cabina no derriba el portal abierto al lado.

## Configuración de la cookie

| Atributo | Desarrollo | Producción |
|---|---|---|
| `httpOnly` | `true` | `true` |
| `secure` | `false` | `true` |
| `sameSite` | `lax` | `strict` |
| `maxAge` | `JWT_EXPIRES_SECONDS` | igual |

`httpOnly` impide que un XSS lea el token. En desarrollo `sameSite` es `lax` porque el frontend
(puerto 3000) y el API (puerto 4000) son orígenes distintos.

## Notas para producción

El código MFA es fijo (`MFA_CODIGO_DEMO`) porque el prototipo no envía SMS. Al integrar un
proveedor real hay que generar un código aleatorio, guardar su *hash* en `desafios_mfa` y
compararlo igual que la contraseña. El resto del flujo no cambia.
