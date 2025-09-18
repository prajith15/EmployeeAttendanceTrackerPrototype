import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import DashboardStats from '../components/dashboard/DashboardStats';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { Users, Building2, TrendingUp, Shield, UserPlus, ClipboardList as ClipboardDocumentList, Cog as Cog6Tooth, BarChart as ChartBar, Calendar, Bell, Key, Clock, CheckCircle, XCircle, Eye, Trash2, Edit, Plus } from 'lucide-react';

const AdminDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    employeeId: '',
    managerId: '',
    hrId: ''
  });
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: ''
  });

  const [newPolicy, setNewPolicy] = useState({
    policyType: 'office_hours',
    policyName: '',
    policyValue: '',
    description: ''
  });

  useEffect(() => {
    if (authLoading || !user) return;
    fetchData();
    const cleanup = setupRealTimeSubscriptions();
    return cleanup;
  }, [authLoading, user]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchTasks(),
        fetchAttendanceLogs(),
        fetchOnlineUsers(),
        fetchPolicies()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error('Supabase configuration missing');
        setUsers([]);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        return;
      }
      setUsers(data || []);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      setUsers([]);
    }
  };

  const fetchTasks = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error('Supabase configuration missing');
        setTasks([]);
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles!tasks_assigned_to_fkey(id, full_name, role),
          assigner:profiles!tasks_assigned_by_fkey(id, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
        return;
      }
      setTasks(data || []);
    } catch (error) {
      console.error('Error in fetchTasks:', error);
      setTasks([]);
    }
  };

  const fetchAttendanceLogs = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error('Supabase configuration missing');
        setAttendanceLogs([]);
        return;
      }

      const { data, error } = await supabase
        .from('attendance_logs')
        .select(`
          *,
          employee:profiles!attendance_logs_employee_id_fkey(id, full_name, department)
        `)
        .eq('date', new Date().toISOString().split('T')[0])
        .order('check_in_time', { ascending: false });
      
      if (error) {
        console.error('Error fetching attendance logs:', error);
        setAttendanceLogs([]);
        return;
      }
      setAttendanceLogs(data || []);
    } catch (error) {
      console.error('Error in fetchAttendanceLogs:', error);
      setAttendanceLogs([]);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error('Supabase configuration missing');
        setOnlineUsers([]);
        return;
      }

      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          user:profiles!user_sessions_user_id_fkey(id, full_name, role, department)
        `)
        .eq('is_active', true)
        .gte('last_activity', new Date(Date.now() - 5 * 60 * 1000).toISOString());
      
      if (error) {
        console.error('Error fetching online users:', error);
        setOnlineUsers([]);
        return;
      }
      setOnlineUsers(data || []);
    } catch (error) {
      console.error('Error in fetchOnlineUsers:', error);
      setOnlineUsers([]);
    }
  };

  const fetchPolicies = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error('Supabase configuration missing');
        setPolicies([]);
        return;
      }

      const { data, error } = await supabase
        .from('company_policies')
        .select('*')
        .eq('is_active', true)
        .order('policy_type');
      
      if (error) {
        console.error('Error fetching policies:', error);
        setPolicies([]);
        return;
      }
      setPolicies(data || []);
    } catch (error) {
      console.error('Error in fetchPolicies:', error);
      setPolicies([]);
    }
  };

  const setupRealTimeSubscriptions = () => {
    const sessionSubscription = supabase
      .channel('user_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_sessions' }, () => {
        fetchOnlineUsers();
      })
      .subscribe();

    const attendanceSubscription = supabase
      .channel('attendance_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_logs' }, () => {
        fetchAttendanceLogs();
      })
      .subscribe();

    return () => {
      sessionSubscription.unsubscribe();
      attendanceSubscription.unsubscribe();
    };
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </Layout>
    );
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      console.log('Creating user with data:', newUser);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          fullName: newUser.fullName,
          role: newUser.role,
          employeeId: newUser.employeeId,
          department: newUser.department,
          managerId: newUser.managerId || null,
          hrId: newUser.hrId || null,
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      setSuccess(`User ${newUser.fullName} created successfully!`);
      setShowCreateUserModal(false);
      setNewUser({
        fullName: '',
        email: '',
        password: '',
        role: 'employee',
        department: '',
        employeeId: '',
        managerId: '',
        hrId: ''
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Error creating user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName,
        }),
      });

      const result = await response.json();
      console.log('Response result:', result);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      fetchUsers();
      setSuccess(result.message);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error deleting user: ' + error.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: currentUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id)
        .single();

      const { error } = await supabase
        .from('tasks')
        .insert({
          title: newTask.title,
          description: newTask.description,
          assigned_to: newTask.assignedTo,
          assigned_by: currentUser.id,
          priority: newTask.priority,
          due_date: newTask.dueDate || null
        });

      if (error) throw error;

      setShowCreateTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: ''
      });
      fetchTasks();
      setSuccess('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Error creating task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let policyValue;
      try {
        policyValue = JSON.parse(newPolicy.policyValue);
      } catch {
        policyValue = { value: newPolicy.policyValue };
      }

      const { data: currentUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id)
        .single();

      const { error } = await supabase
        .from('company_policies')
        .insert({
          policy_type: newPolicy.policyType,
          policy_name: newPolicy.policyName,
          policy_value: policyValue,
          description: newPolicy.description,
          created_by: currentUser.id
        });

      if (error) throw error;

      setShowPolicyModal(false);
      setNewPolicy({
        policyType: 'office_hours',
        policyName: '',
        policyValue: '',
        description: ''
      });
      fetchPolicies();
      setSuccess('Policy created successfully!');
    } catch (error) {
      console.error('Error creating policy:', error);
      setError('Error creating policy: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const adminStats = [
    {
      title: 'Total Users',
      value: users.length.toString(),
      change: '+12%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Online Now',
      value: onlineUsers.length.toString(),
      change: `${Math.round((onlineUsers.length / Math.max(users.length, 1)) * 100)}%`,
      trend: 'up',
      icon: Building2,
    },
    {
      title: 'Present Today',
      value: attendanceLogs.filter(log => log.status === 'checked_in').length.toString(),
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'Active Tasks',
      value: tasks.filter(task => task.status !== 'completed').length.toString(),
      change: '-5%',
      trend: 'down',
      icon: Shield,
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <DashboardStats stats={adminStats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-green-600" />
              Online Users ({onlineUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {onlineUsers.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <div>
                    <p className="font-medium">{session.user?.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{session.user?.role} • {session.user?.department}</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              ))}
              {onlineUsers.length === 0 && (
                <p className="text-gray-500 text-center py-4">No users currently online</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-600" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {attendanceLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div>
                    <p className="font-medium">{log.employee?.full_name}</p>
                    <p className="text-xs text-gray-500">
                      {log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString() : 'Not checked in'}
                      {log.is_late && <span className="text-red-500 ml-1">(Late)</span>}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    log.status === 'checked_in' ? 'bg-green-100 text-green-800' :
                    log.status === 'on_break' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {log.status.replace('_', ' ')}
                  </div>
                </div>
              ))}
              {attendanceLogs.length === 0 && (
                <p className="text-gray-500 text-center py-4">No attendance records today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => setShowCreateUserModal(true)}
              className="p-4 h-auto flex flex-col items-center bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-6 h-6 mb-2" />
              <span>Create User</span>
            </Button>
            <Button
              onClick={() => setShowCreateTaskModal(true)}
              className="p-4 h-auto flex flex-col items-center bg-green-600 hover:bg-green-700"
            >
              <ClipboardDocumentList className="w-6 h-6 mb-2" />
              <span>Assign Task</span>
            </Button>
            <Button
              onClick={() => setShowPolicyModal(true)}
              className="p-4 h-auto flex flex-col items-center bg-purple-600 hover:bg-purple-700"
            >
              <Cog6Tooth className="w-6 h-6 mb-2" />
              <span>Set Policy</span>
            </Button>
            <Button
              onClick={() => setActiveSection('analytics')}
              className="p-4 h-auto flex flex-col items-center bg-orange-600 hover:bg-orange-700"
            >
              <ChartBar className="w-6 h-6 mb-2" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button onClick={() => setShowCreateUserModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((userData) => (
                  <tr key={userData.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{userData.full_name}</div>
                        <div className="text-sm text-gray-500">{userData.email}</div>
                        <div className="text-xs text-gray-400">ID: {userData.employee_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        userData.role === 'admin' ? 'bg-red-100 text-red-800' :
                        userData.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        userData.role === 'hr' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {userData.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{userData.department || 'Not assigned'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        userData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {userData.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(userData);
                            setShowEditUserModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userData.user_id, userData.full_name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPolicies = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Company Policies</h2>
        <Button onClick={() => setShowPolicyModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map((policy) => (
          <Card key={policy.id}>
            <CardHeader>
              <CardTitle className="text-lg">{policy.policy_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Type:</span>
                  <span className="ml-2 capitalize">{policy.policy_type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Value:</span>
                  <pre className="ml-2 text-sm bg-gray-100 p-2 rounded mt-1">
                    {JSON.stringify(policy.policy_value, null, 2)}
                  </pre>
                </div>
                {policy.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Description:</span>
                    <p className="ml-2 text-sm">{policy.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'employee').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((attendanceLogs.length / Math.max(users.filter(u => u.role === 'employee').length, 1)) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceLogs.filter(log => log.is_late).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <ClipboardDocumentList className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(task => task.status !== 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(new Set(users.map(u => u.department).filter(Boolean))).map(dept => {
              const deptUsers = users.filter(u => u.department === dept);
              const deptAttendance = attendanceLogs.filter(log => 
                deptUsers.some(u => u.id === log.employee_id)
              );
              const attendanceRate = Math.round((deptAttendance.length / Math.max(deptUsers.length, 1)) * 100);
              
              return (
                <div key={dept} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{dept}</h4>
                    <p className="text-sm text-gray-600">{deptUsers.length} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{attendanceRate}%</p>
                    <p className="text-sm text-gray-600">Attendance</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Complete system administration and management</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={activeSection === 'overview' ? 'primary' : 'outline'}
                onClick={() => setActiveSection('overview')}
              >
                Overview
              </Button>
              <Button 
                variant={activeSection === 'users' ? 'primary' : 'outline'}
                onClick={() => setActiveSection('users')}
              >
                Users
              </Button>
              <Button 
                variant={activeSection === 'policies' ? 'primary' : 'outline'}
                onClick={() => setActiveSection('policies')}
              >
                Policies
              </Button>
              <Button 
                variant={activeSection === 'analytics' ? 'primary' : 'outline'}
                onClick={() => setActiveSection('analytics')}
              >
                Analytics
              </Button>
            </div>
          </div>

          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'users' && renderUserManagement()}
          {activeSection === 'policies' && renderPolicies()}
          {activeSection === 'analytics' && renderAnalytics()}

          {/* Create User Modal */}
          {showCreateUserModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
                <CardHeader>
                  <CardTitle>Create New User</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        value={newUser.fullName}
                        onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                        required
                      />
                      <Input
                        label="Employee ID"
                        value={newUser.employeeId}
                        onChange={(e) => setNewUser({...newUser, employeeId: e.target.value})}
                        required
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        required
                      />
                      <Input
                        label="Password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        required
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="employee">Employee</option>
                          <option value="hr">HR</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <Input
                        label="Department"
                        value={newUser.department}
                        onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button type="submit" loading={loading}>Create User</Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateUserModal(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Create Task Modal */}
          {showCreateTaskModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Assign New Task</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <Input
                      label="Task Title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows="3"
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                      <select
                        value={newTask.assignedTo}
                        onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Select User</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.full_name} ({user.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select 
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <Input
                      label="Due Date"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button type="submit" loading={loading}>Assign Task</Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateTaskModal(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Create Policy Modal */}
          {showPolicyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Create Company Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreatePolicy} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type</label>
                      <select
                        value={newPolicy.policyType}
                        onChange={(e) => setNewPolicy({...newPolicy, policyType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="office_hours">Office Hours</option>
                        <option value="grace_time">Grace Time</option>
                        <option value="break_time">Break Time</option>
                        <option value="late_policy">Late Policy</option>
                        <option value="holidays">Holidays</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <Input
                      label="Policy Name"
                      value={newPolicy.policyName}
                      onChange={(e) => setNewPolicy({...newPolicy, policyName: e.target.value})}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Policy Value (JSON)</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        rows="4"
                        value={newPolicy.policyValue}
                        onChange={(e) => setNewPolicy({...newPolicy, policyValue: e.target.value})}
                        placeholder='{"key": "value"}'
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows="2"
                        value={newPolicy.description}
                        onChange={(e) => setNewPolicy({...newPolicy, description: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button type="submit" loading={loading}>Create Policy</Button>
                      <Button type="button" variant="outline" onClick={() => setShowPolicyModal(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;