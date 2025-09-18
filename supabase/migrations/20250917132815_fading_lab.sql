/*
  # Fix RLS policies for leave management system

  1. Security Updates
    - Fix RLS policies for leave_requests table
    - Update profile policies to work with auth.uid()
    - Add proper INSERT policies for authenticated users

  2. Authentication
    - Ensure proper user-profile relationship
    - Fix employee_id references in policies
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Employees can create own leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Employees can view own leave requests" ON leave_requests;
DROP POLICY IF EXISTS "HR can update leave requests" ON leave_requests;

-- Recreate leave_requests policies with correct logic
CREATE POLICY "Users can create leave requests"
  ON leave_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id = (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view relevant leave requests"
  ON leave_requests
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own requests
    employee_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR
    -- HR and admin can see all requests
    (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('hr', 'admin')
    OR
    -- Managers can see their team's requests
    (
      (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'manager'
      AND employee_id IN (
        SELECT id FROM profiles WHERE manager_id = (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "HR and admin can update leave requests"
  ON leave_requests
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('hr', 'admin')
  );

-- Fix profiles policies
DROP POLICY IF EXISTS "Allow authenticated users to create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Ensure notifications policies work correctly
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add sample users function to help with testing
CREATE OR REPLACE FUNCTION create_sample_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function can be called to create sample users for testing
  -- Note: In production, users should be created through Supabase Auth UI
  
  -- Insert sample profiles (these will be linked when users sign up)
  INSERT INTO profiles (id, user_id, email, full_name, role, employee_id, department, is_active)
  VALUES 
    (gen_random_uuid(), gen_random_uuid(), 'admin@company.com', 'System Administrator', 'admin', 'ADM001', 'IT', true),
    (gen_random_uuid(), gen_random_uuid(), 'hr@company.com', 'HR Manager', 'hr', 'HR001', 'Human Resources', true),
    (gen_random_uuid(), gen_random_uuid(), 'manager@company.com', 'Department Manager', 'manager', 'MGR001', 'Operations', true),
    (gen_random_uuid(), gen_random_uuid(), 'employee@company.com', 'John Employee', 'employee', 'EMP001', 'Operations', true)
  ON CONFLICT (email) DO NOTHING;
END;
$$;