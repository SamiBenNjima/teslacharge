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

  /**
   * Cancel a reservation.
   */
  async cancelReservation(reservationId: string) {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status: 'CANCELLED' })
      .eq('id', reservationId)
      .select();

    if (error) throw error;
    return data;
  }
};
