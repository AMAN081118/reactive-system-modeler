import { StateMachine } from "../models/types";

const STORAGE_KEY = "reactive_state_machines";
const CURRENT_MACHINE_KEY = "current_machine";

export interface StoredMachine {
  id: string;
  name: string;
  timestamp: number;
  data: StateMachine;
}

export class StorageService {
  /**
   * Save state machine to localStorage
   */
  static saveMachine(machine: StateMachine): void {
    try {
      const allMachines = this.getAllMachines();

      // Check if machine already exists
      const existingIndex = allMachines.findIndex((m) => m.id === machine.id);

      const storedMachine: StoredMachine = {
        id: machine.id,
        name: machine.name,
        timestamp: Date.now(),
        data: machine,
      };

      if (existingIndex >= 0) {
        allMachines[existingIndex] = storedMachine;
      } else {
        allMachines.push(storedMachine);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allMachines));

      // Save as current machine
      localStorage.setItem(CURRENT_MACHINE_KEY, JSON.stringify(machine));

      console.log(`Machine "${machine.name}" saved successfully`);
    } catch (error) {
      console.error("Error saving machine:", error);
      throw new Error("Failed to save state machine");
    }
  }

  /**
   * Load all saved machines
   */
  static getAllMachines(): StoredMachine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading machines:", error);
      return [];
    }
  }

  /**
   * Load specific machine by ID
   */
  static loadMachine(id: string): StateMachine | null {
    try {
      const allMachines = this.getAllMachines();
      const stored = allMachines.find((m) => m.id === id);
      return stored ? stored.data : null;
    } catch (error) {
      console.error("Error loading machine:", error);
      return null;
    }
  }

  /**
   * Load the current/last saved machine
   */
  static loadCurrentMachine(): StateMachine | null {
    try {
      const data = localStorage.getItem(CURRENT_MACHINE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading current machine:", error);
      return null;
    }
  }

  /**
   * Delete machine
   */
  static deleteMachine(id: string): void {
    try {
      const allMachines = this.getAllMachines().filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allMachines));
      console.log("Machine deleted successfully");
    } catch (error) {
      console.error("Error deleting machine:", error);
      throw new Error("Failed to delete state machine");
    }
  }

  /**
   * Export machine as JSON
   */
  static exportAsJSON(machine: StateMachine): string {
    return JSON.stringify(machine, null, 2);
  }

  /**
   * Import machine from JSON
   */
  static importFromJSON(jsonString: string): StateMachine {
    try {
      const parsed = JSON.parse(jsonString);

      // Validate structure
      if (!parsed.id || !parsed.name || !parsed.states || !parsed.transitions) {
        throw new Error("Invalid state machine structure");
      }

      return parsed as StateMachine;
    } catch (error) {
      console.error("Error importing machine:", error);
      throw new Error("Failed to import state machine: Invalid JSON format");
    }
  }

  /**
   * Clear all saved machines
   */
  static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CURRENT_MACHINE_KEY);
      console.log("All machines cleared");
    } catch (error) {
      console.error("Error clearing machines:", error);
    }
  }
}
