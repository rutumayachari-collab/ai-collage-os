import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { Hostel, HostelRoom, HostelAllocation } from "../types/hostel";

export class HostelService extends BaseService {
  async getHostels(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<Hostel[]> {
    return this.get<Hostel[]>(`${API_ENDPOINTS.HOSTEL}/hostels`, params ? { params } : undefined);
  }

  async getHostel(id: string): Promise<Hostel> {
    return this.get<Hostel>(`${API_ENDPOINTS.HOSTEL}/hostels/${id}`);
  }

  async createHostel(data: Partial<Hostel>): Promise<Hostel> {
    return this.post<Hostel>(`${API_ENDPOINTS.HOSTEL}/hostels`, data);
  }

  async updateHostel(id: string, data: Partial<Hostel>): Promise<Hostel> {
    return this.patch<Hostel>(`${API_ENDPOINTS.HOSTEL}/hostels/${id}`, data);
  }

  async getRooms(
    hostelId: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<HostelRoom[]> {
    return this.get<HostelRoom[]>(
      `${API_ENDPOINTS.HOSTEL}/${hostelId}/rooms`,
      params ? { params } : undefined,
    );
  }

  async createRoom(hostelId: string, data: Partial<HostelRoom>): Promise<HostelRoom> {
    return this.post<HostelRoom>(`${API_ENDPOINTS.HOSTEL}/${hostelId}/rooms`, data);
  }

  async updateRoom(
    hostelId: string,
    roomId: string,
    data: Partial<HostelRoom>,
  ): Promise<HostelRoom> {
    return this.patch<HostelRoom>(`${API_ENDPOINTS.HOSTEL}/${hostelId}/rooms/${roomId}`, data);
  }

  async getAllocations(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<HostelAllocation[]> {
    return this.get<HostelAllocation[]>(
      `${API_ENDPOINTS.HOSTEL}/allocations`,
      params ? { params } : undefined,
    );
  }

  async createAllocation(data: Partial<HostelAllocation>): Promise<HostelAllocation> {
    return this.post<HostelAllocation>(`${API_ENDPOINTS.HOSTEL}/allocations`, data);
  }

  async checkIn(id: string): Promise<HostelAllocation> {
    return this.post<HostelAllocation>(`${API_ENDPOINTS.HOSTEL}/allocations/${id}/check-in`, {});
  }

  async checkOut(id: string): Promise<HostelAllocation> {
    return this.post<HostelAllocation>(`${API_ENDPOINTS.HOSTEL}/allocations/${id}/check-out`, {});
  }
}

export const hostelService = new HostelService();
