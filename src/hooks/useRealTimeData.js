import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useRealTimeData = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);

  useEffect(() => {
    // Initial data fetch
    fetchRealTimeData();

    // Set up real-time subscriptions
    const subscriptions = setupSubscriptions();

    // Update user session activity
    updateUserActivity();
    const activityInterval = setInterval(updateUserActivity, 30000); // Update every 30 seconds

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
      clearInterval(activityInterval);
    };
  }, []);

  const fetchRealTimeData = async () => {
    try {
      // Fetch online users (active sessions in last 5 minutes)
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select(`
          *,
          user:profiles!user_sessions_user_id_fkey(id, full_name, role, department)
        `)
        .eq('is_active', true)
        .gte('last_activity', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      setOnlineUsers(sessions || []);

      // Fetch today's attendance
      const { data: attendance } = await supabase
        .from('attendance_logs')
        .select(`
          *,
          employee:profiles!attendance_logs_employee_id_fkey(id, full_name, department)
        `)
        .eq('date', new Date().toISOString().split('T')[0])
        .order('check_in_time', { ascending: false });

      setAttendanceLogs(attendance || []);

      // Fetch active tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles!tasks_assigned_to_fkey(id, full_name, role)
        `)
        .neq('status', 'completed')
        .order('created_at', { ascending: false });

      setActiveTasks(tasks || []);

      // Fetch pending leaves
      const { data: leaves } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employee:profiles!leave_requests_employee_id_fkey(id, full_name, department)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setPendingLeaves(leaves || []);

    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const setupSubscriptions = () => {
    const subscriptions = [];

    // User sessions subscription
    const sessionSub = supabase
      .channel('user_sessions_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_sessions' 
      }, () => {
        fetchOnlineUsers();
      })
      .subscribe();

    // Attendance logs subscription
    const attendanceSub = supabase
      .channel('attendance_logs_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'attendance_logs' 
      }, () => {
        fetchTodayAttendance();
      })
      .subscribe();

    // Tasks subscription
    const tasksSub = supabase
      .channel('tasks_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tasks' 
      }, () => {
        fetchActiveTasks();
      })
      .subscribe();

    // Leave requests subscription
    const leavesSub = supabase
      .channel('leave_requests_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'leave_requests' 
      }, () => {
        fetchPendingLeaves();
      })
      .subscribe();

    subscriptions.push(sessionSub, attendanceSub, tasksSub, leavesSub);
    return subscriptions;
  };

  const updateUserActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Update or create user session
      const { data: existingSession } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .single();

      if (existingSession) {
        // Update existing session
        await supabase
          .from('user_sessions')
          .update({ last_activity: new Date().toISOString() })
          .eq('id', existingSession.id);
      } else {
        // Create new session
        await supabase
          .from('user_sessions')
          .insert({
            user_id: profile.id,
            is_active: true,
            last_activity: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  };

  const fetchOnlineUsers = async () => {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select(`
        *,
        user:profiles!user_sessions_user_id_fkey(id, full_name, role, department)
      `)
      .eq('is_active', true)
      .gte('last_activity', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    setOnlineUsers(sessions || []);
  };

  const fetchTodayAttendance = async () => {
    const { data: attendance } = await supabase
      .from('attendance_logs')
      .select(`
        *,
        employee:profiles!attendance_logs_employee_id_fkey(id, full_name, department)
      `)
      .eq('date', new Date().toISOString().split('T')[0])
      .order('check_in_time', { ascending: false });

    setAttendanceLogs(attendance || []);
  };

  const fetchActiveTasks = async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assigned_to_fkey(id, full_name, role)
      `)
      .neq('status', 'completed')
      .order('created_at', { ascending: false });

    setActiveTasks(tasks || []);
  };

  const fetchPendingLeaves = async () => {
    const { data: leaves } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employee:profiles!leave_requests_employee_id_fkey(id, full_name, department)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    setPendingLeaves(leaves || []);
  };

  const endUserSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      await supabase
        .from('user_sessions')
        .update({ 
          is_active: false, 
          session_end: new Date().toISOString() 
        })
        .eq('user_id', profile.id)
        .eq('is_active', true);
    } catch (error) {
      console.error('Error ending user session:', error);
    }
  };

  return {
    onlineUsers,
    attendanceLogs,
    activeTasks,
    pendingLeaves,
    updateUserActivity,
    endUserSession,
    refetch: fetchRealTimeData
  };
};