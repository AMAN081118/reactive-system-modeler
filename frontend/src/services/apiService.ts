import axios, { AxiosInstance, AxiosError } from "axios";
import { StateMachine } from "../models/types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 100000,
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error("API Error:", error.message);
        throw error;
      },
    );
  }

  async checkHealth(): Promise<{
    status: string;
    uptime: number;
    verifierAvailable: boolean;
  }> {
    const response = await this.client.get<
      ApiResponse<{
        status: string;
        uptime: number;
        verifierAvailable: boolean;
      }>
    >("/health");
    if (!response.data.success) {
      throw new Error(response.data.error || "Health check failed");
    }
    return response.data.data!;
  }

  /**
   * Verify state machine with C++ engine
   */
  async verifyMachine(stateMachine: StateMachine): Promise<{
    isValid: boolean;
    reachableStates: number;
    totalStates: number;
    errors: string[];
    warnings: string[];
    deadlocks: string[];
    summary: string;
  }> {
    const response = await this.client.post<
      ApiResponse<{
        isValid: boolean;
        reachableStates: number;
        totalStates: number;
        errors: string[];
        warnings: string[];
        deadlocks: string[];
        summary: string;
      }>
    >("/verify", stateMachine);

    if (!response.data.success) {
      throw new Error(response.data.error || "Verification failed");
    }
    return response.data.data!;
  }

  /**
   * Check if state is reachable
   */
  async checkReachability(
    stateMachine: StateMachine,
    stateId: string,
  ): Promise<{ isReachable: boolean; message: string }> {
    const response = await this.client.post<
      ApiResponse<{ isReachable: boolean; message: string }>
    >("/check-reachability", { stateMachine, stateId });

    if (!response.data.success) {
      throw new Error(response.data.error || "Reachability check failed");
    }
    return response.data.data!;
  }

  /**
   * Find deadlock states
   */
  async findDeadlocks(stateMachine: StateMachine): Promise<string[]> {
    const response = await this.client.post<
      ApiResponse<{ deadlocks: string[] }>
    >("/find-deadlocks", stateMachine);

    if (!response.data.success) {
      throw new Error(response.data.error || "Deadlock detection failed");
    }
    return response.data.data!.deadlocks;
  }

  async validateMachine(
    stateMachine: StateMachine,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const response = await this.client.post<
      ApiResponse<{ valid: boolean; errors: string[] }>
    >("/validate", stateMachine);
    if (!response.data.success) {
      throw new Error(response.data.error || "Validation failed");
    }
    return response.data.data!;
  }

  async simulateMachine(
    stateMachine: StateMachine,
    inputs: string[],
  ): Promise<{
    isValid: boolean;
    initialState: string;
    finalState: string;
    steps: any[];
    totalSteps: number;
  }> {
    const response = await this.client.post<
      ApiResponse<{
        isValid: boolean;
        initialState: string;
        finalState: string;
        steps: any[];
        totalSteps: number;
      }>
    >("/simulate", { stateMachine, inputs });

    if (!response.data.success) {
      throw new Error(response.data.error || "Simulation failed");
    }
    return response.data.data!;
  }
  async generateTests(
    stateMachine: StateMachine,
  ): Promise<{ testCases: any[]; count: number }> {
    const response = await this.client.post<
      ApiResponse<{ testCases: any[]; count: number }>
    >("/generate-tests", stateMachine);

    if (!response.data.success) {
      throw new Error(response.data.error || "Test generation failed");
    }
    return response.data.data!;
  }
}

export const apiService = new ApiService();
