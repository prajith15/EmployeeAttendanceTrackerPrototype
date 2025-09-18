/*
  # Fix user creation database error

  1. Security Policy Updates
    - Add INSERT policy for profiles table to allow authenticated users to create their own profile
    - This fixes the "Database error creating new user" issue

  The handle_new_user trigger needs permission to insert into profiles table when a new user signs up.
*/

-- Add INSERT policy for profiles table
CREATE POLICY "Allow authenticated users to create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);