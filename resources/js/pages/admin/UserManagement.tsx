import React, { useState } from 'react';
import axios from 'axios';
import { User, Role } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {  RefreshCw, CheckCircle } from 'lucide-react';

interface UserManagementProps {
    users: User[];
    roles: Role[];
}

const UserManagement: React.FC<UserManagementProps> = ({ users: initialUsers, roles: initialRoles }) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [roles, setRoles] = useState<Role[]>(initialRoles);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showRoleDialog, setShowRoleDialog] = useState(false);

    // Refresh users and roles
    const refreshData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                axios.get('/api/users'),
                axios.get('/api/roles')
            ]);
            setUsers(usersRes.data.users || []);
            setRoles(rolesRes.data || []);
            toast.success('Data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing data:', error);
            toast.error('Failed to refresh data');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if user has role
    const hasRole = (user: User, roleName: string) => {
        return user.roles?.some(role => role.name === roleName) || false;
    };

    // Handle role toggle
    const handleRoleToggle = async (user: User, roleName: string) => {
        const roleId = roles.find(r => r.name === roleName)?.id;
        if (!roleId) return;

        const hasTheRole = hasRole(user, roleName);
        const endpoint = hasTheRole ? '/api/roles/remove' : '/api/roles/assign';

        setIsLoading(true);
        try {
            await axios.post(endpoint, {
                user_id: user.id,
                role_id: roleId
            });

            // Update local state
            const updatedUsers = users.map(u => {
                if (u.id === user.id) {
                    if (hasTheRole) {
                        return {
                            ...u,
                            roles: u.roles?.filter(r => r.name !== roleName)
                        };
                    } else {
                        return {
                            ...u,
                            roles: [...(u.roles || []), { id: roleId, name: roleName }]
                        };
                    }
                }
                return u;
            });

            setUsers(updatedUsers);
            toast.success(`Role ${hasTheRole ? 'removed from' : 'assigned to'} user`);
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update role');
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize permissions
    const initializePermissions = async () => {
        setIsLoading(true);
        try {
            await axios.post('/api/permissions/initialize');
            await refreshData();
            toast.success('Permissions initialized successfully');
        } catch (error) {
            console.error('Error initializing permissions:', error);
            toast.error('Failed to initialize permissions');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                />
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        onClick={refreshData}
                        disabled={isLoading}
                        className="flex items-center gap-1"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button
                        variant="default"
                        onClick={initializePermissions}
                        disabled={isLoading}
                        className="flex items-center gap-1"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Initialize Permissions
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage users and their roles in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles?.map(role => (
                                                        <Badge key={role.id} variant={
                                                            role.name === 'admin' ? 'destructive' :
                                                                role.name === 'manager' ? 'default' : 'outline'
                                                        }>
                                                            {role.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowRoleDialog(true);
                                                    }}
                                                >
                                                    Manage Roles
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Role Management Dialog */}
            <Dialog open={showRoleDialog && !!selectedUser} onOpenChange={(open) => {
                setShowRoleDialog(open);
                if (!open) setSelectedUser(null);
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Roles for {selectedUser?.name}</DialogTitle>
                        <DialogDescription>
                            Toggle roles for this user. Admin users automatically have all permissions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {roles.map(role => (
                            <div key={role.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{role.name}</p>
                                    <p className="text-sm text-gray-500">{role.description}</p>
                                </div>
                                <Checkbox
                                    id={`role-${role.id}`}
                                    checked={selectedUser ? hasRole(selectedUser, role.name) : false}
                                    onCheckedChange={() => {
                                        if (selectedUser) {
                                            handleRoleToggle(selectedUser, role.name);
                                        }
                                    }}
                                    disabled={isLoading || (role.name === 'admin' && selectedUser?.email === 'admin@example.com')}
                                />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowRoleDialog(false)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;
