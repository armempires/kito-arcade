import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface ScheduleSlot {
  id: string;
  professional_id: string;
  day_of_week: number;
  time: string;
  available: boolean;
  created_at: string;
}

export const ALL_TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00'
];

const DEFAULT_TIME_SLOTS = [
  '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export function useProfessionalSchedules(professionalId?: string) {
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSchedules = useCallback(async () => {
    if (!professionalId) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('professional_schedules')
      .select('*')
      .eq('professional_id', professionalId)
      .order('day_of_week', { ascending: true })
      .order('time', { ascending: true });

    if (!error && data) {
      setSchedules(data as ScheduleSlot[]);
    }
    setLoading(false);
  }, [professionalId]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const createDefaultSchedules = useCallback(async (profId: string) => {
    const slots: any[] = [];
    for (let day = 1; day <= 7; day++) {
      DEFAULT_TIME_SLOTS.forEach((time) => {
        slots.push({
          professional_id: profId,
          day_of_week: day,
          time,
          available: true,
        });
      });
    }

    const { error } = await supabase.from('professional_schedules').insert(slots);
    if (!error) {
      await loadSchedules();
    }
    return !error;
  }, [loadSchedules]);

  const toggleSlot = useCallback(async (slotId: string, available: boolean) => {
    const { error } = await supabase
      .from('professional_schedules')
      .update({ available })
      .eq('id', slotId);

    if (!error) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === slotId ? { ...s, available } : s))
      );
    }
    return !error;
  }, []);

  const deleteSlot = useCallback(async (slotId: string) => {
    const { error } = await supabase
      .from('professional_schedules')
      .delete()
      .eq('id', slotId);

    if (!error) {
      setSchedules((prev) => prev.filter((s) => s.id !== slotId));
    }
    return !error;
  }, []);

  const addSlot = useCallback(async (profId: string, dayOfWeek: number, time: string) => {
    const { data, error } = await supabase
      .from('professional_schedules')
      .insert({
        professional_id: profId,
        day_of_week: dayOfWeek,
        time,
        available: true,
      })
      .select()
      .single();

    if (!error && data) {
      setSchedules((prev) => [...prev, data as ScheduleSlot]);
    }
    return !error;
  }, []);

  return {
    schedules,
    loading,
    loadSchedules,
    createDefaultSchedules,
    toggleSlot,
    deleteSlot,
    addSlot,
  };
}
