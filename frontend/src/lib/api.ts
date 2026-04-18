import { supabase } from './supabase';

export type DriverProfile = {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  active_vehicle?: any;
};

export type Station = {
  id: string;
  name: string;
  address: string;
  city: string;
  location: any;
  latitude: number;
  longitude: number;
  operator: string;
  total_connectors: number;
  available_connectors: number;
  amenities: any;
};

export const api = {
  // Custom Auth Endpoints (Spring Boot)
  async sendSignUpOtp(email: string, phone: string, vin: string, channel: 'EMAIL' | 'WHATSAPP' = 'EMAIL') {
    const res = await fetch('http://localhost:8082/api/auth/signup/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone, vin, channel })
    });
    if (!res.ok) throw new Error(await res.text());
  },
  
  async verifySignUpOtp(payload: any) {
    const res = await fetch('http://localhost:8082/api/auth/signup/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async sendSignInOtp(email: string, vin: string, channel: 'EMAIL' | 'WHATSAPP' = 'EMAIL') {
    const res = await fetch('http://localhost:8082/api/auth/signin/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, vin, channel })
    });
    if (!res.ok) throw new Error(await res.text());
  },

  async verifySignInOtp(email: string, otp: string) {
    const res = await fetch('http://localhost:8082/api/auth/signin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Station Endpoints (Spring Boot)
  async getNearbyStations(lat: number, lng: number, radius: number = 10, limit: number = 50) {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:8082/api/stations/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getStationDetails(stationId: string) {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:8082/api/stations/${stationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getAvailableConnectors(stationId: string) {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:8082/api/stations/${stationId}/connectors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Reservation Endpoints (Spring Boot)
  async createReservation(stationId: string, connectorId: string, scheduledStart: string, scheduledEnd: string) {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:8082/api/reservations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stationId,
        connectorId,
        scheduledStart,
        scheduledEnd
      })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getMyReservations() {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:8082/api/reservations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async cancelReservation(reservationId: string) {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:8082/api/reservations/${reservationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(await res.text());
  },

  async reportReservationIssue(reservationId: string, note: string) {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:8082/api/reservations/${reservationId}/report?note=${encodeURIComponent(note)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(await res.text());
  },

  /**
   * Fetch a driver's profile and their selected active vehicle.
   */
  async getDriverProfile(driverId: string) {
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', driverId)
      .single();

    if (driverError) throw driverError;

    const { data: vehicleSelection } = await supabase
      .from('driver_vehicles')
      .select('vehicle_id, vehicles(*)')
      .eq('driver_id', driverId)
      .eq('is_selected', true)
      .maybeSingle();

    return {
      ...driver,
      active_vehicle: vehicleSelection?.vehicles || null,
    };
  },

  /**
   * Fetch session statistics for a driver (count, energy, savings).
   */
  async getDriverStats(driverId: string) {
    const { data: sessions, error } = await supabase
      .from('charging_sessions')
      .select('energy_kwh, cost_eur')
      .eq('driver_id', driverId);

    if (error) throw error;

    const totalEnergy = sessions.reduce((sum, s) => sum + (Number(s.energy_kwh) || 0), 0);
    const totalCost = sessions.reduce((sum, s) => sum + (Number(s.cost_eur) || 0), 0);
    const co2Saved = totalEnergy * 0.4; // Rough estimate: 0.4kg per kWh

    return {
      sessionCount: sessions.length,
      totalEnergy: totalEnergy.toFixed(1),
      totalCost: totalCost.toFixed(2),
      co2Saved: co2Saved.toFixed(1),
    };
  },

  /**
   * Fetch recent charging sessions.
   */
  async getRecentSessions(driverId: string, limit = 5) {
    const { data, error } = await supabase
      .from('charging_sessions')
      .select(`
        *,
        charging_connectors (
          station_id,
          stations (name)
        )
      `)
      .eq('driver_id', driverId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Fetch all charging stations.
   */
  async getStations() {
    const { data, error } = await supabase
      .from('stations_with_coords')
      .select(`
        *,
        charging_connectors (*)
      `)
      .order('name');

    if (error) throw error;
    return data;
  },

  /**
   * Fetch reservations for a driver.
   */
  async getReservations(driverId: string) {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        stations (name, address),
        vehicles (model, license_plate)
      `)
      .eq('driver_id', driverId)
      .order('scheduled_start', { ascending: false });

    if (error) throw error;
    return data;
  },

};
