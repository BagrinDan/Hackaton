import { Injectable } from '@nestjs/common';
import { computeCurrentDay } from './simulation-clock';

@Injectable()
export class SimulationService {
  private readonly simulationStartTime =
    process.env.SIMULATION_START_TIME ?? new Date().toISOString();

  private readonly gameSpeed = parseInt(process.env.GAME_SPEED ?? '300', 10);

  currentDay(): number {
    return computeCurrentDay(
      Date.now(),
      this.simulationStartTime,
      this.gameSpeed,
    );
  }
}
