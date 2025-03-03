
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
// @ts-ignore
import AdminLayout from '@/Layouts/AdminLayout';
// @ts-ignore
import UserPermissions from '@/Components/Admin/UserPermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Role } from '@/types';

interface AdminDashboardProps {
    auth: {
        user: User;
    };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ auth }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [usersResponse, rolesResponse] = await Promise.all([
                    axios.get('/api/users'),
                    axios.get('/api/roles')
                ]);

                setUsers(usersResponse.data.users || []);
                setRoles(rolesResponse.data || []);
                setError(null);
            } catch (err) {
                setError('Failed to load dashboard data. Please try again.');
                console.error('Error loading dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <AdminLayout user={auth.user}>
            <Head title="Admin Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Tabs defaultValue="permissions" className="w-full">
                        <TabsList>
                            <TabsTrigger value="permissions">User Permissions</TabsTrigger>
                            <TabsTrigger value="stats">System Statistics</TabsTrigger>
                        </TabsList>

                        <TabsContent value="permissions">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Manage User Permissions</CardTitle>
                                    <CardDescription>
                                        Assign or remove task permissions (create, read, update, delete) for your users
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="py-8 text-center">Loading users and roles...</div>
                                    ) : (
                                        <UserPermissions users={users} roles={roles} />
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="stats">
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Statistics</CardTitle>
                                    <CardDescription>
                                        Overview of system usage and activity
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <div className="text-sm text-blue-600">Total Users</div>
                                            <div className="text-2xl font-bold">{users.length}</div>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <div className="text-sm text-green-600">Total Roles</div>
                                            <div className="text-2xl font-bold">{roles.length}</div>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-lg">
                                            <div className="text-sm text-purple-600">Admin Users</div>
                                            <div className="text-2xl font-bold">
                                                {users.filter(user =>
                                                    user.roles?.some(role => role.name === 'admin')
                                                ).length}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
