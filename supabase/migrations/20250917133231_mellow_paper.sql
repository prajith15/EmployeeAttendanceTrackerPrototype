/*
  # Fix RLS policies for leave requests

  1. Security Updates
    - Drop existing problematic policies
    - Create proper INSERT policy for authenticated users
    - Ensure users can only create requests for themselves
    - Fix employee_id validation logic

  2. Policy Changes
    - Allow authenticated users to insert their own leave requests
    - Validate employee_id matches user's profile
    - Maintain existing SELECT and UPDATE policies
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can create leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Users can view relevant leave requests" ON leave_requests;
DROP POLICY IF EXISTS "HR and admin can update leave requests" ON leave_requests;

-- Enable RLS (should already be enabled, but ensuring it)
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Policy for INSERT: Allow authenticated users to create their own leave requests
CREATE POLICY "Allow authenticated users to insert their own leave requests"
  ON leave_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE profiles.id = leave_requests.employee_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Policy for SELECT: Users can view relevant leave requests
CREATE POLICY "Users can view relevant leave requests"
  ON leave_requests
  FOR SELECT
  TO authenticated
  USING (
    -- Employee can see their own requests
    employee_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    OR
    -- HR and admin can see all requests
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('hr', 'admin')
    )
    OR
    -- Managers can see their team's requests
    (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND role = 'manager'
      )
      AND
      employee_id IN (
        SELECT id FROM profiles 
        WHERE manager_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Policy for UPDATE: HR and admin can update leave requests
CREATE POLICY "HR and admin can update leave requests"
  ON leave_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('hr', 'admin', 'manager')
    )
  );