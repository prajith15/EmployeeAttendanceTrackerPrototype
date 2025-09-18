import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useLeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    fetchLeaveRequests();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('leave_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_requests',
        },
        (payload) => {
          console.log('Leave request change:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Only add if user can see this request
            if (user.role === 'hr' || user.role === 'admin' || payload.new.employee_id === user.id) {
              fetchLeaveRequests(); // Refetch to get employee details
            }
          } else if (payload.eventType === 'UPDATE') {
            setLeaveRequests(prev => 
              prev.map(request => 
                request.id === payload.new.id 
                  ? { ...request, ...payload.new }
                  : request
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, user?.role]);

  const fetchLeaveRequests = async () => {
    if (!user?.id) return;

    try {
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          employee:profiles!leave_requests_employee_id_fkey(
            id,
            full_name,
            email,
            employee_id,
            department
          ),
          approver:profiles!leave_requests_approved_by_fkey(
            id,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      // Filter based on user role
      if (user.role === 'employee') {
        query = query.eq('employee_id', user.id);
      }
      // HR and admin can see all requests (no additional filter needed)

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leave requests:', error);
        return;
      }

      setLeaveRequests(data || []);
    } catch (error) {
      console.error('Error in fetchLeaveRequests:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLeaveRequest = async (leaveData) => {
    try {
      // Get current user's profile to get the profile ID
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error getting user profile:', profileError);
        return { error: { message: 'Error fetching user profile' } };
      }

      if (!profiles || profiles.length === 0) {
        console.error('No profile found for user:', user.id);
        return { error: { message: 'User profile not found. Please contact administrator.' } };
      }

      const profile = profiles[0];
      console.log('Creating leave request for profile:', profile.id, 'user:', user.id);

      const { data, error } = await supabase
        .from('leave_requests')
        .insert({
          employee_id: profile.id,
          ...leaveData,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating leave request:', error);
        return { error };
      }

      console.log('Leave request created successfully');
      return { data, error: null };
    } catch (error) {
      console.error('Error in createLeaveRequest:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const updateLeaveRequestStatus = async (requestId, status, approvedBy = null) => {
    try {
      const updateData = {
        status,
        approved_at: new Date().toISOString(),
      };

      if (approvedBy) {
        updateData.approved_by = approvedBy;
      }

      const { data, error } = await supabase
        .from('leave_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        console.error('Error updating leave request:', error);
        return { error };
      }

      console.log('Leave request updated successfully');
      return { data, error: null };
    } catch (error) {
      console.error('Error in updateLeaveRequestStatus:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  return {
    leaveRequests,
    loading,
    createLeaveRequest,
    updateLeaveRequestStatus,
    refetch: fetchLeaveRequests,
  };
};