/*
  # Leave Management System with Real-time Notifications

  1. New Tables
    - `leave_requests`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references profiles)
      - `leave_type` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `reason` (text)
      - `status` (enum: pending, approved, rejected)
      - `approved_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `message` (text)
      - `type` (text)
      - `read` (boolean)
      - `related_id` (uuid, optional reference)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
    - HR can manage all leave requests
    - Employees can only see their own requests

  3. Real-time
    - Enable real-time on notifications table
    - Enable real-time on leave_requests table
*/

-- Create leave status enum
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  leave_type text NOT NULL DEFAULT 'vacation',
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status leave_status DEFAULT 'pending',
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  related_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Leave requests policies
CREATE POLICY "Employees can view own leave requests"
  ON leave_requests
  FOR SELECT
  TO authenticated
  USING (
    employee_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR 
    (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('hr', 'admin')
  );

CREATE POLICY "Employees can create own leave requests"
  ON leave_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "HR can update leave requests"
  ON leave_requests
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('hr', 'admin')
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leave_requests_updated_at
    BEFORE UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification when leave request status changes
CREATE OR REPLACE FUNCTION notify_leave_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed from pending to approved/rejected
  IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (
      NEW.employee_id,
      'Leave Request ' || CASE 
        WHEN NEW.status = 'approved' THEN 'Approved'
        WHEN NEW.status = 'rejected' THEN 'Rejected'
      END,
      'Your leave request from ' || NEW.start_date || ' to ' || NEW.end_date || ' has been ' || NEW.status,
      CASE 
        WHEN NEW.status = 'approved' THEN 'success'
        WHEN NEW.status = 'rejected' THEN 'error'
      END,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leave_status_notification
  AFTER UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_leave_status_change();

-- Function to notify HR when new leave request is created
CREATE OR REPLACE FUNCTION notify_hr_new_leave_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify all HR users about new leave request
  INSERT INTO notifications (user_id, title, message, type, related_id)
  SELECT 
    p.id,
    'New Leave Request',
    'New leave request from ' || emp.full_name || ' for ' || NEW.leave_type || ' from ' || NEW.start_date || ' to ' || NEW.end_date,
    'info',
    NEW.id
  FROM profiles p
  CROSS JOIN profiles emp
  WHERE p.role = 'hr' 
    AND emp.id = NEW.employee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_leave_request_notification
  AFTER INSERT ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_hr_new_leave_request();