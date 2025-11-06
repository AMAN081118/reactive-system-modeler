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
      timeout: 10000,
    });

    // Error interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error("API Error:", error.message);
        throw error;
      },
    );
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<{ status: string; uptime: number }> {
    const response = await this.client.get<
      ApiResponse<{ status: string; uptime: number }>
    >("/health");
    if (!response.data.success) {
      throw new Error(response.data.error || "Health check failed");
    }
    return response.data.data!;
  }

  /**
   * Validate state machine
   */
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

  /**
   * Simulate state machine execution
   */
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

  /**
   * Generate test cases
   */
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

// Singleton instance
export const apiService = new ApiService();
