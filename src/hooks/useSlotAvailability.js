import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSlotAvailability = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSlotCounts = async () => {
    try {
      setLoading(true);
      
      // Fetch all slots with their max_registrations
      const { data: slotsData, error: slotsError } = await supabase
        .from('slots')
        .select('*')
        .order('slot_order', { ascending: true });

      if (slotsError) throw slotsError;
      setAllSlots(slotsData);

      // Fetch registrations
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('registrations')
        .select('slot_id');

      if (registrationsError) throw registrationsError;

      // Count registrations per slot
      const slotCounts = {};
      slotsData.forEach((slot) => {
        slotCounts[slot.id] = 0;
      });

      registrationsData.forEach((registration) => {
        if (slotCounts[registration.slot_id] !== undefined) {
          slotCounts[registration.slot_id]++;
        }
      });

      // Filter available slots based on each slot's individual max_registrations
      const available = slotsData.filter((slot) => {
        const maxForSlot = slot.max_registrations || 15;
        return slotCounts[slot.id] < maxForSlot;
      });

      setAvailableSlots(available);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching slot availability:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotCounts();

    const registrationsChannel = supabase
      .channel('registrations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        () => {
          fetchSlotCounts();
        }
      )
      .subscribe();

    const slotsChannel = supabase
      .channel('slots-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'slots' },
        () => {
          fetchSlotCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(registrationsChannel);
      supabase.removeChannel(slotsChannel);
    };
  }, []);

  return { availableSlots, allSlots, loading, error, refetch: fetchSlotCounts };
};
