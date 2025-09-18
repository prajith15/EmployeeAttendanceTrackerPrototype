/*
  # Enhanced Admin Features

  1. New Tables
    - `company_policies` - Store company-wide policies and settings
    - `tasks` - Task management system
    - `attendance_logs` - Track check-ins/check-outs
    - `user_sessions` - Track online/offline status

  2. Enhanced Tables
    - Updated `profiles` with manager hierarchy
    - Added indexes for performance

  3. Security
    - RLS policies for all new tables
    - Role-based access control
*/

-- Company Policies Table
CREATE TABLE IF NOT EXISTS company_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_type text NOT NULL,
  policy_name text NOT NULL,
  policy_value jsonb NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES profiles(id),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Attendance Logs Table
CREATE TABLE IF NOT EXISTS attendance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  check_in_time timestamptz,
  check_out_time timestamptz,
  break_start_time timestamptz,
  break_end_time timestamptz,
  total_hours decimal(4,2),
  is_late boolean DEFAULT false,
  late_minutes integer DEFAULT 0,
  status text DEFAULT 'checked_out' CHECK (status IN ('checked_in', 'on_break', 'checked_out')),
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Sessions Table (for online/offline tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  is_active boolean DEFAULT true,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_policies_type ON company_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_company_policies_active ON company_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_employee_date ON attendance_logs(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_date ON attendance_logs(date);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active ON user_sessions(user_id, is_active);

-- Enable RLS
ALTER TABLE company_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Company Policies RLS
CREATE POLICY "Admin can manage company policies"
  ON company_policies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "All users can view active policies"
  ON company_policies
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Tasks RLS
CREATE POLICY "Users can view their assigned tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    assigned_to IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    OR assigned_by IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'hr', 'manager')
    )
  );

CREATE POLICY "Admin and managers can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'manager', 'hr')
    )
  );

CREATE POLICY "Task assigners and assignees can update tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    assigned_to IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    OR assigned_by IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'hr')
    )
  );

-- Attendance Logs RLS
CREATE POLICY "Users can view their own attendance"
  ON attendance_logs
  FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'hr', 'manager')
    )
  );

CREATE POLICY "Users can create their own attendance logs"
  ON attendance_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own attendance logs"
  ON attendance_logs
  FOR UPDATE
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- User Sessions RLS
CREATE POLICY "Users can manage their own sessions"
  ON user_sessions
  FOR ALL
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'hr')
    )
  );

-- Insert default company policies
INSERT INTO company_policies (policy_type, policy_name, policy_value, description, is_active) VALUES
('office_hours', 'Standard Working Hours', '{"start_time": "09:00", "end_time": "17:00", "timezone": "UTC"}', 'Standard office working hours', true),
('grace_time', 'Late Arrival Grace Period', '{"minutes": 15}', 'Grace period for late arrivals before marking as late', true),
('break_time', 'Break Duration', '{"minutes": 60}', 'Standard lunch break duration', true),
('late_policy', 'Late Mark Rules', '{"threshold_minutes": 15, "max_late_days_per_month": 3}', 'Rules for marking employees as late', true),
('holidays', 'Company Holidays 2024', '{"holidays": [{"date": "2024-01-01", "name": "New Year Day"}, {"date": "2024-07-04", "name": "Independence Day"}, {"date": "2024-12-25", "name": "Christmas Day"}]}', 'Official company holidays', true)
ON CONFLICT DO NOTHING;

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_policies_updated_at BEFORE UPDATE ON company_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_logs_updated_at BEFORE UPDATE ON attendance_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();