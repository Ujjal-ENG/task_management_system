import React, { useState } from 'react';
import axios from 'axios';
import { User, Role } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Toaster } from '@/components/ui/sonner';

interface UserPermissionsProps {
    users: User[];
    roles: Role[];
}

interface Permission {
    name: string;
    description: string;
}

const UserPermissions: React.FC<UserPermissionsProps> = ({ users, roles }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedAction, setSelectedAction] = useState<{
        userId: number;
        roleId: number;
        action: 'assign' | 'remove';
    } | null>(null);

    // Define our permissions based on roles
    const permissionRoles = [
        { id: 1, name: 'create_task', description: 'Can create tasks' },
        { id: 2, name: 'read_task', description: 'Can view tasks' },
        { id: 3, name: 'update_task', description: 'Can update tasks' },
        { id: 4, name: 'delete_task', description: 'Can delete tasks' },
    ];

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRoleChange = (userId: number, roleId: number, currentlyHasRole: boolean) => {
        setSelectedAction({
            userId,
            roleId,
            action: currentlyHasRole ? 'remove' : 'assign'
        });
        setShowConfirmDialog(true);
    };

    const confirmRoleChange = async () => {
        if (!selectedAction) return;

        const { userId, roleId, action } = selectedAction;
        setIsSubmitting(true);

        try {
            const endpoint = action === 'assign' ? '/api/roles/assign' : '/api/roles/remove';
            await axios.post(endpoint, { user_id: userId, role_id: roleId });

            // Update the UI by refreshing the data
            // In a real app, you might want to update the state rather than reload
            window.location.reload();

            Toaster({
                title: "Success",
                description: `Permission ${action === 'assign' ? 'granted' : 'removed'} successfully.`,
            });
        } catch (error) {
            console.error('Error updating role:', error);
            Toaster({
                variant: "destructive",
                title: "Error",
                description: `Failed to ${action} role. Please try again.`,
            });
        } finally {
            setIsSubmitting(false);
            setShowConfirmDialog(false);
        }
    };

    // Helper function to check if a user has a specific role
    const hasRole = (user: User, roleName: string) => {
        return user.roles?.some(role => role.name === roleName) || false;
    };

    // Get the role ID by role name
    const getRoleId = (roleName: string) => {
        const role = roles.find(r => r.name === roleName);
        return role?.id || 0;
    };

    return (
        <div>
            <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-center">Create Tasks</TableHead>
                            <TableHead className="text-center">Read Tasks</TableHead>
                            <TableHead className="text-center">Update Tasks</TableHead>
                            <TableHead className="text-center">Delete Tasks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={hasRole(user, 'create_task')}
                                            onCheckedChange={() => handleRoleChange(
                                                user.id,
                                                getRoleId('create_task'),
                                                hasRole(user, 'create_task')
                                            )}
                                            disabled={user.roles?.some(role => role.name === 'admin')}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={hasRole(user, 'read_task')}
                                            onCheckedChange={() => handleRoleChange(
                                                user.id,
                                                getRoleId('read_task'),
                                                hasRole(user, 'read_task')
                                            )}
                                            disabled={user.roles?.some(role => role.name === 'admin')}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={hasRole(user, 'update_task')}
                                            onCheckedChange={() => handleRoleChange(
                                                user.id,
                                                getRoleId('update_task'),
                                                hasRole(user, 'update_task')
                                            )}
                                            disabled={user.roles?.some(role => role.name === 'admin')}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={hasRole(user, 'delete_task')}
                                            onCheckedChange={() => handleRoleChange(
                                                user.id,
                                                getRoleId('delete_task'),
                                                hasRole(user, 'delete_task')
                                            )}
                                            disabled={user.roles?.some(role => role.name === 'admin')}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Permission Change</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedAction?.action === 'assign'
                                ? 'Are you sure you want to grant this permission to the user?'
                                : 'Are you sure you want to remove this permission from the user?'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRoleChange}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default UserPermissions;
