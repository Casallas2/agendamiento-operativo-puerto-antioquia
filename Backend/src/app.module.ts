import { Module, type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { FiltroExcepcionesHttp } from './common/filters';
import { JwtAuthGuard } from './common/guards';
import { AuthModule } from './modules/auth/auth.module';
import { ConductorModule } from './modules/conductor/conductor.module';
import { DemoModule } from './modules/demo/demo.module';
import { EventosModule } from './modules/eventos/eventos.module';
import { FlotaModule } from './modules/flota/flota.module';
import { MuellesModule } from './modules/muelles/muelles.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { TurnosModule } from './modules/turnos/turnos.module';
import { UsersModule } from './modules/users/users.module';
import { ValidacionModule } from './modules/validacion/validacion.module';
import { ValidacionDocumentalService } from './modules/validacion/validacion-documental.service';
import { DatabaseModule } from './shared/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    // Límite general de peticiones; los endpoints sensibles lo ajustan con @Throttle
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    DatabaseModule,

    UsersModule,
    AuthModule,
    EventosModule,
    NotificacionesModule,
    FlotaModule,
    MuellesModule,
    ValidacionModule,
    TurnosModule,
    ConductorModule,
    ReportesModule,
    DemoModule,
  ],
  providers: [
    // Toda la API exige sesión salvo lo marcado con @Publico()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: FiltroExcepcionesHttp },
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly validacionService: ValidacionDocumentalService) {}

  /** Retoma las validaciones que quedaron a medias si el servidor se reinició */
  async onApplicationBootstrap(): Promise<void> {
    await this.validacionService.reanudarPendientes();
  }
}
