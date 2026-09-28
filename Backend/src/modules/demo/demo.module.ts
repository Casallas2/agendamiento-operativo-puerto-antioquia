import { Module } from '@nestjs/common';
import { SemillaService } from 'src/shared/database/seeds/semilla.service';
import { DemoController } from './demo.controller';

@Module({
  controllers: [DemoController],
  providers: [SemillaService],
})
export class DemoModule {}
