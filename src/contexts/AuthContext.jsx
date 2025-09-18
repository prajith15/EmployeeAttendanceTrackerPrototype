import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('=== GETTING INITIAL SESSION ===');
        setLoading(true);
        setError(null);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session result:', { session: !!session, user: session?.user?.email, error: sessionError });
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setUser(null);
          setSupabaseUser(null);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('Session found for user:', session.user.email);
          setSupabaseUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No session found');
          setUser(null);
          setSupabaseUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 AUTH STATE CHANGE');
      console.log('Event:', event, 'Session:', !!session, 'User:', session?.user?.email);
      console.log('=== AUTH STATE CHANGE ===');
      console.log('Event:', event);
      console.log('Session:', !!session);
      console.log('User:', session?.user?.email);
      
      setLoading(true);
      setError(null);
      
      if (session?.user) {
        console.log('🔐 Setting supabase user and fetching profile...');
        console.log('Setting supabase user and fetching profile...');
        setSupabaseUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        console.log('🚪 No session, clearing user data...');
        console.log('No session, clearing user data...');
        setUser(null);
        setSupabaseUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    console.log('=== FETCHING USER PROFILE ===');
    console.log('User ID:', userId);
    
    try {
      console.log('🔍 About to query profiles table...');
      console.log('🔍 Supabase client status:', { 
        url: supabase.supabaseUrl, 
        hasClient: !!supabase 
      });
      
      // Verify Supabase client configuration
      console.log('🔍 Detailed Supabase client check:', {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
        clientReady: !!supabase,
        clientMethods: {
          hasFrom: typeof supabase.from === 'function',
          hasAuth: !!supabase.auth
        }
      });

      // Log the exact query we're about to make
      console.log('🔍 Attempting to query profiles with:', {
        table: 'profiles',
        select: '*',
        filter: `user_id=eq.${userId}`,
        method: 'single'
      });

      // Try to construct the query step by step
      console.log('🔍 Step 1: Creating base query...');
      const baseQuery = supabase.from('profiles');
      console.log('🔍 Base query created:', !!baseQuery);

      console.log('🔍 Step 2: Adding select...');
      const selectQuery = baseQuery.select('*');
      console.log('🔍 Select query created:', !!selectQuery);

      console.log('🔍 Step 3: Adding filter...');
      const filterQuery = selectQuery.eq('user_id', userId);
      console.log('🔍 Filter query created:', !!filterQuery);

      console.log('🔍 Step 4: Adding single...');
      const finalQuery = filterQuery.single();
      console.log('🔍 Final query created:', !!finalQuery);

      console.log('🔍 Step 5: Executing query...');
      
      // Add a timeout to the Supabase query
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const timeoutPromise = new Promise((resolve, reject) =>
        setTimeout(() => reject(new Error('Supabase profile query timed out after 10 seconds')), 10000)
      );

      const { data: profile, error: profileError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]);

      console.log('🔍 Profile query completed!');
      console.log('Profile query result:', { profile, error: profileError });

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        console.error('🚨 Profile error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116' || (profileError.message && profileError.message.includes('0 rows'))) {
          console.log('Profile not found, creating new profile...');
          await createUserProfile(userId);
          return;
        }
        
        // For other errors, set error and stop loading
        setError(`Profile fetch error: ${profileError.message}`);
        setUser(null);
        setSupabaseUser(null);
        setLoading(false);
        return;
      }

      // Handle the single profile response
      if (profile) {
        console.log('Profile loaded successfully:', profile);
        console.log('🔍 Profile role details:', {
          role: profile.role,
          roleType: typeof profile.role,
          email: profile.email,
          fullName: profile.full_name
        });
        
        // Check if user should be admin based on email but has different role
        if (supabaseUser?.email?.toLowerCase() === 'admin@company.com' && profile.role !== 'admin') {
          console.log('🔧 Email suggests admin role but profile role is:', profile.role);
          console.log('🔧 Updating profile role to admin...');
          
          try {
            const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('user_id', userId)
              .select()
              .single();
            
            if (updateError) {
              console.error('Error updating profile role:', updateError);
              // Continue with original profile if update fails
              setUser(profile);
            } else {
              console.log('✅ Profile role updated to admin successfully');
              setUser(updatedProfile);
            }
          } catch (updateErr) {
            console.error('Unexpected error updating profile role:', updateErr);
            // Continue with original profile if update fails
            setUser(profile);
          }
        } else {
          setUser(profile);
        }
        
        setError(null);
        setLoading(false);
      } else {
        console.log('No profile returned from query, attempting to create one.');
        await createUserProfile(userId);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      console.error('🚨 Unexpected error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Check if this is a network/connection error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🚨 This appears to be a network/fetch error');
        setError('Network error: Unable to connect to database');
        setUser(null);
        setSupabaseUser(null);
      } else if (error.message.includes('supabase')) {
        console.error('🚨 This appears to be a Supabase client error');
        setError('Database client error: ' + error.message);
        setUser(null);
        setSupabaseUser(null);
      } else {
        setError(`Profile fetch failed: ${error.message}`);
        setUser(null);
        setSupabaseUser(null);
      }
      setLoading(false);
    }
  };

  const createUserProfile = async (userId) => {
    console.log('=== CREATING USER PROFILE ===');
    console.log('User ID:', userId);
    
    try {
      setLoading(true);
      
      // Get user email from Supabase auth with error handling
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !authUser) {
        console.error('No auth user found when creating profile:', userError);
        setError('Authentication error - please sign in again');
        setUser(null);
        setSupabaseUser(null);
        setLoading(false);
        return;
      }

      console.log('Auth user found:', authUser.email);

      // Determine role based on email (for demo purposes)
      let role = 'employee'; // Default role
      let employeeIdPrefix = 'EMP';
      let department = 'General';
      let fullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
      
      console.log('🔍 Email check for role assignment:', authUser.email);
      
      if (authUser.email?.toLowerCase() === 'admin@company.com') {
        role = 'admin';
        employeeIdPrefix = 'ADM';
        department = 'IT';
        fullName = 'Admin User';
        console.log('✅ Admin role assigned');
      } else if (authUser.email?.toLowerCase().includes('hr')) {
        role = 'hr';
        employeeIdPrefix = 'HR';
        department = 'Human Resources';
        fullName = 'HR Manager';
        console.log('✅ HR role assigned');
      } else if (authUser.email?.toLowerCase().includes('manager')) {
        role = 'manager';
        employeeIdPrefix = 'MGR';
        department = 'Operations';
        fullName = 'Department Manager';
        console.log('✅ Manager role assigned');
      } else {
        console.log('⚠️ No specific role match, defaulting to employee');
        fullName = 'Employee User';
      }

      let employeeId = employeeIdPrefix + Math.random().toString(36).substr(2, 3).toUpperCase();

      console.log('Creating profile with:', { fullName, role, employeeId, department });

      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: authUser.email,
          full_name: fullName,
          role: role,
          employee_id: employeeId,
          department: department,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        setError(`Profile creation failed: ${error.message}`);
        setUser(null);
        setSupabaseUser(null);
        setLoading(false);
        return;
      }

      console.log('Profile created successfully:', profile);
      setUser(profile);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      setError(`Profile creation failed: ${error.message}`);
      setUser(null);
      setSupabaseUser(null);
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      console.log('=== SIGN IN ATTEMPT ===');
      console.log('Email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        setError(error.message);
        return { error };
      }

      console.log('Sign in successful:', data.user?.email);
      console.log('Session created:', !!data.session);
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      setError('An unexpected error occurred during sign in');
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const signUp = async (email, password, metadata) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        setLoading(false);
        return { error };
      }

      setLoading(false);
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      setLoading(false);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        setLoading(false);
        return { error };
      }
      
      setUser(null);
      setSupabaseUser(null);
      setError(null);
      setLoading(false);
      // Redirect to login portal after logout
      window.location.href = '/';
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      setLoading(false);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const value = {
    user,
    supabaseUser,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};