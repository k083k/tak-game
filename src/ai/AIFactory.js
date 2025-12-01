import { ComputerAI } from './ComputerAI';

/**
 * Factory for creating AI instances
 */
export class AIFactory {
  /**
   * Create a computer AI instance
   */
  static createAI() {
    return new ComputerAI();
  }
}
