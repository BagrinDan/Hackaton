import { Global, Module } from '@nestjs/common';
import { SimulationService } from './simulation.service';

@Global()
@Module({
  providers: [SimulationService],
  exports: [SimulationService],
})
export class SimulationModule {}
