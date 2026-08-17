import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { TransportRoute, Vehicle, Driver, Stop, StudentAssignment } from "../types/transport";

export class TransportService extends BaseService {
  async getTransports(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<unknown[]> {
    return this.get<unknown[]>(`${API_ENDPOINTS.TRANSPORT}`, params ? { params } : undefined);
  }

  async getTransport(id: string): Promise<unknown> {
    return this.get<unknown>(`${API_ENDPOINTS.TRANSPORT}/${id}`);
  }

  async createTransport(data: Record<string, unknown>): Promise<unknown> {
    return this.post<unknown>(`${API_ENDPOINTS.TRANSPORT}`, data);
  }

  async addRoute(transportId: string, data: Partial<TransportRoute>): Promise<unknown> {
    return this.post<unknown>(`${API_ENDPOINTS.TRANSPORT}/${transportId}/routes`, data);
  }

  async updateRoute(
    transportId: string,
    routeId: string,
    data: Partial<TransportRoute>,
  ): Promise<unknown> {
    return this.patch<unknown>(`${API_ENDPOINTS.TRANSPORT}/${transportId}/routes/${routeId}`, data);
  }

  async removeRoute(transportId: string, routeId: string): Promise<unknown> {
    return this.delete<unknown>(`${API_ENDPOINTS.TRANSPORT}/${transportId}/routes/${routeId}`);
  }

  async addVehicle(transportId: string, data: Partial<Vehicle>): Promise<unknown> {
    return this.post<unknown>(`${API_ENDPOINTS.TRANSPORT}/${transportId}/vehicles`, data);
  }

  async updateVehicle(
    transportId: string,
    vehicleId: string,
    data: Partial<Vehicle>,
  ): Promise<unknown> {
    return this.patch<unknown>(
      `${API_ENDPOINTS.TRANSPORT}/${transportId}/vehicles/${vehicleId}`,
      data,
    );
  }

  async removeVehicle(transportId: string, vehicleId: string): Promise<unknown> {
    return this.delete<unknown>(`${API_ENDPOINTS.TRANSPORT}/${transportId}/vehicles/${vehicleId}`);
  }

  async addStop(transportId: string, data: Partial<Stop>): Promise<unknown> {
    return this.post<unknown>(`${API_ENDPOINTS.TRANSPORT}/${transportId}/stops`, data);
  }

  async updateStop(transportId: string, stopId: string, data: Partial<Stop>): Promise<unknown> {
    return this.patch<unknown>(`${API_ENDPOINTS.TRANSPORT}/${transportId}/stops/${stopId}`, data);
  }

  async removeStop(transportId: string, stopId: string): Promise<unknown> {
    return this.delete<unknown>(`${API_ENDPOINTS.TRANSPORT}/${transportId}/stops/${stopId}`);
  }

  async assignStudent(
    transportId: string,
    data: { studentId: string; routeId?: string; stopId?: string; feeId?: string },
  ): Promise<unknown> {
    return this.post<unknown>(`${API_ENDPOINTS.TRANSPORT}/${transportId}/assign`, data);
  }

  async updateAssignmentStatus(
    transportId: string,
    assignmentId: string,
    status: string,
  ): Promise<unknown> {
    return this.patch<unknown>(
      `${API_ENDPOINTS.TRANSPORT}/${transportId}/assignments/${assignmentId}/status`,
      { status },
    );
  }

  async getStudentAssignment(transportId: string): Promise<unknown> {
    return this.get<unknown>(`${API_ENDPOINTS.TRANSPORT}/${transportId}/assignments/student`);
  }
}

export const transportService = new TransportService();
