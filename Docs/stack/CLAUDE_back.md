# 📋 Reglas Globales de Trabajo - Claude Assistant & NestJS Backend

**Lea siempre este archivo al inicio de cada conversación para mantener consistencia en comunicación, arquitectura y metodología de trabajo.**

## 🎯 **Filosofía de Trabajo**

- **Tono**: Profesional pero accesible, directo y colaborativo
- **Idioma**: Código en inglés, mensajes de usuario en español
- **Enfoque**: Soluciones prácticas inmediatas con mejores prácticas
- **Gestión de dependencias**: Usar `yarn` exclusivamente

## 🏗️ Arquitectura y Estructura Modular

### Estructura de Directorios Backend
```
src/
├── app.module.ts                 # Módulo raíz de la aplicación
├── main.ts                      # Punto de entrada de la aplicación
│
├── common/                      # Recursos compartidos globales
│   ├── decorators/              # Decoradores personalizados
│   │   ├── roles.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── index.ts
│   ├── guards/                  # Guards de autenticación y autorización
│   │   ├── auth.guard.ts
│   │   ├── roles.guard.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── index.ts
│   ├── filters/                 # Filtros globales
│   │   ├── http-exception.filter.ts
│   │   └── index.ts
│   └── strategies/              # Estrategias de autenticación
│       ├── jwt.strategy.ts
│       └── index.ts
│
├── modules/                     # Módulos de funcionalidad
│   ├── auth/                    # Módulo de autenticación
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── entities/            # Entidades específicas del módulo
│   │   │   ├── auth.entity.ts
│   │   │   └── index.ts
│   │   ├── dto/                 # DTOs con class-validator (validación entrada)
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── index.ts
│   │   ├── types/               # Types/Interfaces (manejo interno)
│   │   │   ├── auth-response.type.ts
│   │   │   ├── auth-payload.type.ts
│   │   │   └── index.ts
│   │
│   ├── users/                   # Módulo de usuarios
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   └── index.ts
│   │   ├── dto/                 # DTOs con class-validator (validación entrada)
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── index.ts
│   │   ├── types/               # Types/Interfaces (manejo interno)
│   │   │   ├── user-response.type.ts
│   │   │   ├── user-payload.type.ts
│   │   │   └── index.ts
│   │
│   └── [feature-module]/        # Otros módulos de funcionalidad
│       ├── [feature].module.ts
│       ├── [feature].controller.ts
│       ├── [feature].service.ts
│       ├── entities/
│       │   ├── [feature].entity.ts
│       │   └── index.ts
│       ├── dto/                 # DTOs con class-validator (validación entrada)
│       │   ├── create-[feature].dto.ts
│       │   ├── update-[feature].dto.ts
│       │   └── index.ts
│       ├── types/               # Types/Interfaces (manejo interno)
│       │   ├── [feature]-response.type.ts
│       │   ├── [feature]-payload.type.ts
│       │   └── index.ts
│
└── shared/                      # Servicios compartidos
│   ├── database/                # Servicio de base de datos
│   │   ├── database.module.ts
│   │   ├── database.service.ts
│   │   ├── migrations/          # Migraciones de TypeORM
│   │   │   ├── 001-initial-schema.ts
│   │   │   └── index.ts
│   ├── cache/                   # Servicio de caché
│   │   ├── cache.module.ts
│   │   └── cache.service.ts
│   ├── email/                   # Servicio de email
│   │   ├── email.module.ts
│   │   └── email.service.ts
│   └── storage/                 # Servicio de almacenamiento
│       ├── storage.module.ts
│       └── storage.service.ts
```

### Reglas de Modularidad

1. **Límite de líneas**: Nunca cree archivos de más de 300 líneas. Si se acerca a este límite, refactorice dividiendo en servicios, utilidades más pequeñas.

2. **Separación de responsabilidades**: Cada módulo debe tener una responsabilidad única y bien definida.

3. **Dependencias**: Los módulos solo pueden depender de módulos de nivel inferior o del mismo nivel.

4. **Inyección de dependencias**: Use siempre inyección de dependencias de NestJS, evite instanciación manual.

5. **Entidades por módulo**: Cada módulo debe contener sus propias entidades específicas.

6. **DTOs vs Types**: Use DTOs con class-validator para validación de entrada. Use Types/Interfaces para tipado interno, respuestas y manejo de datos.

7. **Convenciones de idioma**:
   - **Código**: Variables, funciones, clases → INGLÉS
   - **Mensajes de usuario**: Errores, éxitos, validaciones → ESPAÑOL
   - **Comentarios**: Explicaciones de lógica → ESPAÑOL
   - **Swagger**: Descriptions en español, examples en inglés

## 📝 DTOs vs Types - Guía de Uso

### Cuándo usar DTOs:
- **Validación de entrada**: Datos que vienen del cliente (request body, query params)
- **Transformación de datos**: Cuando necesitas modificar o limpiar datos
- **Documentación**: Para Swagger/OpenAPI documentation
- **Seguridad**: Para sanitización y validación estricta

### Cuándo usar Types/Interfaces:
- **Respuestas de API**: OBLIGATORIO usar patrón `{ status, message, data }`
- **Tipado interno**: Para variables, parámetros de funciones internas
- **Contratos de servicios**: Interfaces entre servicios
- **Configuración**: Para objetos de configuración
- **Payloads internos**: Datos transformados para uso interno
- **Mapeo de datos**: Transformaciones entre entidades y respuestas

### ⚡ **PATRÓN OBLIGATORIO de Respuestas API**:
```typescript
// ✅ SIEMPRE usar esta estructura para respuestas
export type EntityCreatedResponse = {
  status: 201;                    // Código HTTP específico
  message: string;                // Mensaje en ESPAÑOL
  data: EntityData;               // Datos de la entidad
};

export type EntityResponse = {
  status: number;                 // Código HTTP
  message: string;                // Mensaje en ESPAÑOL
  data?: EntityData | EntityData[]; // Datos opcionales
};

// ✅ Separar los datos de la entidad
export type EntityData = {
  id: string;
  // ... campos de la entidad
  createdAt: string;             // SIEMPRE como string ISO
  updatedAt: string;             // SIEMPRE como string ISO
};
```

### Ejemplos prácticos:

```typescript
// ✅ DTO para validación de entrada (carpeta dto/)
export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email único del usuario'
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Contraseña del usuario (mínimo 8 caracteres)'
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;
}

// ✅ Type para respuesta de API (carpeta types/) - PATRÓN OBLIGATORIO
export type UserCreatedResponse = {
  status: number;
  message: string;
  data: UserData;
};

export type UserResponse = {
  status: number;
  message: string;
  data?: UserData | UserData[];
};

export type UserData = {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

```

## 🔐 Seguridad y Autenticación

### Reglas de Seguridad Prioritarias

1. **Validación de entrada**:
   - Use DTOs con class-validator para todas las entradas
   - Implemente sanitización de datos
   - Valide tipos, formatos y rangos
   - Use DTOs en lugar de pipes para validación

2. **Autorización**:
   - Implemente guards basados en roles
   - Use decoradores para control de acceso granular
   - Valide permisos a nivel de recurso
   - Implemente JWT con refresh tokens

3. **Protección de datos sensibles**:
   - Nunca loguee contraseñas o tokens
   - Use hashing para contraseñas (bcrypt con salt rounds >= 12)
   - Implemente rate limiting
   - Use prepared statements para prevenir SQL injection
   - Encripte datos sensibles en base de datos

### Patrones de Seguridad

```typescript
// Decorador de roles con guards
@Roles('admin', 'user')
@UseGuards(BaseAuthGuard, RolesGuard)
@Post('protected-route')
async protectedRoute() {}
```

## 🚀 Rendimiento y Escalabilidad

### Reglas de Rendimiento

1. **Caché inteligente**:
   - Implemente caché para consultas frecuentes
   - Use TTL apropiados
   - Invalide caché cuando sea necesario
   - Use Redis para caché distribuido

2. **Paginación**:
   - Implemente paginación en todas las listas
   - Use cursor-based pagination para grandes datasets
   - Límite máximo de 100 elementos por página
   - Use índices de base de datos para consultas eficientes

3. **Optimización de base de datos**:
   - Use índices apropiados en columnas frecuentemente consultadas
   - Implemente lazy loading para relaciones
   - Use query builder para consultas complejas
   - Monitoree slow queries

4. **Compresión y serialización**:
   - Use compresión gzip
   - Serialice solo datos necesarios
   - Implemente transform interceptors

### Patrones de Escalabilidad

```typescript
// Paginación estándar
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// Caché con Redis
@Cacheable('users', 300) // 5 minutos
async findUsers(): Promise<User[]> {
  return this.userRepository.find();
}

// Query optimizada con índices
async findUsersByRole(role: string, pagination: PaginationDto): Promise<[User[], number]> {
  return this.userRepository.findAndCount({
    where: { role },
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit,
    order: { createdAt: 'DESC' }
  });
}

// Transacción de base de datos
async createUserWithProfile(userData: CreateUserDto, profileData: CreateProfileDto): Promise<User> {
  return this.userRepository.manager.transaction(async manager => {
    const user = manager.create(User, userData);
    const savedUser = await manager.save(user);

    const profile = manager.create(Profile, { ...profileData, userId: savedUser.id });
    await manager.save(profile);

    return savedUser;
  });
}
```

## 🧪 Testing y Documentación

### Estrategia de Testing

1. **Cobertura mínima**: 80% para servicios críticos, 60% para el resto
2. **Tipos de tests**:
   - Unit tests para servicios y utilidades
   - E2E tests para flujos completos

3. **Mocking**:
   - Mock servicios externos
   - Use test doubles para base de datos
   - Aísle dependencias
   - Use test database para integration tests

### Patrones de Testing

```typescript
// Test de servicio
describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should create a user', async () => {
    const userData = { email: 'test@example.com', password: 'password123' };
    const expectedUser = { id: 1, ...userData };

    jest.spyOn(repository, 'save').mockResolvedValue(expectedUser);

    const result = await service.create(userData);
    expect(result).toEqual(expectedUser);
  });
});
```

## 📚 Documentación y Mantenibilidad

### Reglas de Documentación

1. **Swagger/OpenAPI**:
   - Documente todos los endpoints
   - Use decoradores de Swagger
   - Mantenga ejemplos actualizados

2. **Comentarios de código**:
   - Documente lógica compleja
   - Explique decisiones de negocio
   - Mantenga README actualizado


### Patrones de Documentación

```typescript
@ApiTags('Usuarios')
@Controller('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(BaseAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo usuario',
    description: 'Crea un usuario con validaciones completas y rol asignado'
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      admin: {
        summary: 'Usuario administrador',
        value: {
          email: 'admin@example.com',
          password: 'SecurePass123!',
          role: 'admin'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    schema: {
      example: {
        status: 201,
        message: 'Usuario creado exitosamente',
        data: {
          id: 'uuid-here',
          email: 'admin@example.com',
          role: 'admin',
          isActive: true,
          createdAt: '2025-10-02T12:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['El email debe ser válido', 'La contraseña es requerida'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserCreatedResponse> {
    return this.usersService.create(createUserDto);
  }
}
```

## 🗄️ TypeORM y Base de Datos

### Configuración de TypeORM

1. **Configuración de conexión**:
   - Use variables de entorno para configuración
   - Implemente múltiples entornos (dev, test, prod)
   - Configure pool de conexiones apropiado
   - **IMPORTANTE**: Habilite la extensión `uuid-ossp` en PostgreSQL para usar UUIDs

2. **Entidades**:
   - Use decoradores apropiados para columnas
   - Implemente relaciones correctamente
   - Use índices para optimización
   - **SIEMPRE incluir**: `id`, `createdAt`, `updatedAt`
   - **Nombres de columna**: usar `snake_case` en base de datos

### Patrones de TypeORM

```typescript
// Configuración de TypeORM
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
  ],
})
export class DatabaseModule {}

// ✅ Entidad siguiendo PATRÓN OBLIGATORIO
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false, name: 'password_hash' })
  password: string;

  @Column({ type: 'enum', enum: ['admin', 'user'], default: 'user' })
  role: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}

// Repositorio personalizado
@Injectable()
export class UserRepository extends Repository<User> {
  async findActiveUsers(): Promise<User[]> {
    return this.find({ where: { isActive: true } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }
}
```

## 🔧 Convenciones de Código

### Nomenclatura

- **Archivos**: kebab-case (user.service.ts)
- **Clases**: PascalCase (UserService)
- **Métodos/variables**: camelCase (createUser)
- **Constantes**: UPPER_SNAKE_CASE (API_BASE_URL)
- **Types**: PascalCase con prefijo I (IUserService) o sin prefijo (UserService)
- **Entidades**: PascalCase (User, Post)
- **Repositorios**: PascalCase + Repository (UserRepository)

### Estructura de Archivos

```typescript
// Estructura estándar de un módulo
@Module({
  imports: [
    /* módulos importados */
  ],
  controllers: [FeatureController],
  providers: [FeatureService /* otros providers */],
  exports: [FeatureService],
})
export class FeatureModule {}

@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}
}

@Injectable()
export class FeatureService {
  // Implementación del servicio
}
```

## 🤖 Reglas de Comportamiento de Claude

### 📝 **Comunicación y Respuestas**
1. **Tono profesional pero accesible** - Directo, colaborativo y proactivo
2. **Estructura clara**: Respuesta directa → Implementación → Consideraciones → Próximos pasos
3. **Usar emojis categorizadores**: 🔧 implementación, 📋 lista, ⚡ rápido, 🚀 mejora
4. **Ejemplos funcionales**: Código que se pueda copiar y usar directamente
5. **Anticipar necesidades**: Ofrecer alternativas y mejoras sin ser solicitado

### 🔧 **Implementación Técnica**
6. **Nunca asuma contexto faltante** - Preguntar si no está seguro
7. **Solo paquetes yarn verificados** - No alucinar librerías
8. **Confirmar rutas y nombres** antes de referenciarlos
9. **Nunca eliminar código existente** sin confirmación explícita
10. **Siempre proporcionar tipos TypeScript** para nuevas funciones
11. **Verificar compatibilidad** de dependencias con NestJS y TypeORM

### 🛡️ **Seguridad y Calidad**
12. **Implementar manejo de errores** en todas las operaciones
13. **Usar inyección de dependencias** en lugar de instanciación manual
14. **Validar todas las entradas** con DTOs y class-validator
15. **Separar DTOs de Types** - DTOs para validación, Types para manejo interno
16. **Implementar logging** para operaciones críticas
17. **Usar transacciones** para operaciones que afecten múltiples entidades

### 📊 **Base de Datos y Performance**
18. **Siempre usar repositorios** en lugar de acceso directo a DataSource
19. **Implementar soft deletes** cuando sea apropiado
20. **Usar índices de base de datos** para optimizar consultas frecuentes
21. **Implementar paginación** en listados por defecto

### 🌍 **Convenciones de Idioma**
22. **Código en INGLÉS**: Variables, funciones, clases, constantes
23. **Mensajes en ESPAÑOL**: Errores, validaciones, respuestas al usuario
24. **Comentarios en ESPAÑOL**: Explicaciones de lógica y documentación
25. **Swagger**: Descriptions en español, examples en inglés

### 📊 **Patrón de Respuestas OBLIGATORIO**
26. **SIEMPRE usar estructura**: `{ status, message, data }`
27. **Status**: Código HTTP numérico exacto (200, 201, 400, etc.)
28. **Message**: Mensaje descriptivo en ESPAÑOL
29. **Data**: Datos de la entidad o array, OPCIONAL en errores
30. **Fechas**: SIEMPRE como string ISO, nunca como Date en responses

## 🎯 Prioridades de Implementación

1. **Seguridad** (Crítico) - Autenticación, autorización, validación
2. **Base de datos** (Crítico) - Configuración TypeORM, entidades, migraciones
3. **Manejo de errores** (Alto) - Filtros, excepciones, logging
4. **Validación** (Alto) - DTOs, class-validator, sanitización
5. **Rendimiento** (Medio) - Caché, paginación, optimización de queries
6. **Testing** (Medio) - Cobertura, mocking, E2E
7. **Documentación** (Bajo) - Swagger, comentarios, README

## 🔄 Patrones de Migración y Evolución

1. **Versionado de API**: Use `/api/v1/`, `/api/v2/` para versiones
2. **Feature flags**: Implemente para rollouts graduales
3. **Database migrations**: Use TypeORM migrations para cambios de esquema
4. **Backward compatibility**: Mantenga compatibilidad por al menos 2 versiones
5. **Deprecation warnings**: Notifique cambios futuros con anticipación

### 🔧 **Servicios - Patrón de Respuestas OBLIGATORIO**

```typescript
// ✅ SIEMPRE implementar este patrón en servicios
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserCreatedResponse> {
    // Lógica de creación...
    const user = await this.userRepository.save(newUser);

    // ✅ SIEMPRE retornar con este patrón
    return {
      status: 201,
      message: 'Usuario creado exitosamente',
      data: user
    };
  }

  async findAll(): Promise<UserResponse> {
    const users = await this.userRepository.find();

    return {
      status: 200,
      message: 'Usuarios obtenidos exitosamente',
      data: users
    };
  }

  async remove(id: string): Promise<UserResponse> {
    await this.userRepository.delete(id);

    return {
      status: 200,
      message: 'Usuario eliminado exitosamente',
      // ⚡ Sin data en operaciones de eliminación
    };
  }
}
```

### 📊 **Reglas de Mapeo de Datos**

1. **Fechas**: SIEMPRE convertir `Date` a `string` con `.toISOString()`
2. **IDs**: SIEMPRE incluir en responses
3. **Campos sensibles**: NUNCA incluir passwords, tokens en responses
4. **Status codes**: Usar códigos HTTP específicos (201 para creación, 200 para éxito)
5. **Messages**: SIEMPRE en español, descriptivos y consistentes

### Patrones de Migración TypeORM

```typescript
// ✅ Migración siguiendo convenciones del proyecto
export class CreateUsersTable1234567890123 implements MigrationInterface {
  name = 'CreateUsersTable1234567890123'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ⚡ OBLIGATORIO: Habilitar extensión UUID
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password_hash',        // ⚡ snake_case en BD
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'user'],
            default: "'user'",
          },
          {
            name: 'is_active',           // ⚡ snake_case en BD
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',          // ⚡ OBLIGATORIO
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',          // ⚡ OBLIGATORIO
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ⚡ Crear índices para performance
    await queryRunner.createIndex('users', new Index('IDX_USER_EMAIL', ['email']));
    await queryRunner.createIndex('users', new Index('IDX_USER_ROLE', ['role']));
    await queryRunner.createIndex('users', new Index('IDX_USER_ACTIVE', ['is_active']));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

## 📋 **Checklist de Aplicación**

Antes de cada respuesta, verificar:

- [ ] ¿El tono es profesional pero accesible?
- [ ] ¿La estructura es clara y fácil de seguir?
- [ ] ¿El nivel de detalle es apropiado para la pregunta?
- [ ] ¿Incluí código funcional cuando es relevante?
- [ ] ¿Los mensajes de error están en español?
- [ ] ¿Las variables y funciones están en inglés?
- [ ] ¿Usé el patrón `{ status, message, data }` en responses?
- [ ] ¿Las fechas están como string ISO en responses?
- [ ] ¿La respuesta es inmediatamente accionable?
- [ ] ¿Anticipé posibles preguntas de seguimiento?
- [ ] ¿Sugerí mejoras o próximos pasos?
- [ ] ¿Usé el formato y emojis apropiados?

## 🎯 **Formato de Respuesta Estándar**

```markdown
## 🎯 **Respuesta Directa**
[Solución concreta al problema planteado]

## 📋 **Implementación**
[Código funcional con patrón { status, message, data }]

## ⚡ **Consideraciones Adicionales**
[Optimizaciones, alternativas, mejores prácticas]

## 🚀 **Próximos Pasos**
[Sugerencias para continuar o mejorar]
```

## 🔥 **REGLAS NO NEGOCIABLES**

1. **SIEMPRE** usar patrón `{ status, message, data }` en responses
2. **NUNCA** retornar `Date` objects, siempre `string` ISO
3. **SIEMPRE** mensajes en español para el usuario
4. **SIEMPRE** código en inglés (variables, funciones, clases)
5. **SIEMPRE** incluir `createdAt` y `updatedAt` en entidades
6. **SIEMPRE** usar `snake_case` para nombres de columnas en BD
7. **SIEMPRE** transacciones para operaciones críticas
8. **SIEMPRE** validaciones con DTOs para entrada de datos

---