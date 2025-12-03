import NavMain from '@/components/NavMain';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from '@/hooks/use-toast';
import { photoURLChhatraKey, storageKey } from '@/utils';
import { apiUrl } from '@/utils/apiRoutes';
import axios from 'axios';
import exp from 'constants';
import React, { useEffect, useState } from 'react';
import { To, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const exportToExcel = (data: any[], filename: string = 'data.xlsx') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, filename);
};

const AdminDashboard: React.FC = () => {
    const token = localStorage.getItem(storageKey);
    const navigate = useNavigate();

    const [users, setUsers] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [userData, setUserData] = useState<any>(null)

    const handleMenuClick = (path: To) => {
        navigate(path)
    }

    const handleLogout = () => {
        localStorage.removeItem(storageKey)
        localStorage.removeItem(photoURLChhatraKey)
        navigate("/")
    }

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/userProfile/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    setUsers(response.data.data);
                }
            } catch (err) {
                setError('Failed to fetch users. Please try again later.');
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();

        const fetchUserData = async () => {
            const token = localStorage.getItem(storageKey)
            if (!token) {
                navigate("/")
                return
            }

            try {
                const response = await axios.get(`${apiUrl}/api/userProfile/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                setUserData(response.data.data)
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error fetching user data.",
                    description: "Please try again later.",
                })
            }
        }

        fetchUserData()
    }, []);

    if (loading) return (
        <Card className="p-4">
            <CardHeader>
                <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </CardContent>
        </Card>
    );

    if (error) return (
        <Card className="p-4">
            <CardContent className="text-red-500">{error}</CardContent>
        </Card>
    );

    if (userData.role !== 'admin') return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-4">
                <NavMain
                    userData={userData}
                    handleLogout={handleLogout}
                    handleMenuClick={handleMenuClick}
                />
                <Card className="p-4">
                    <CardContent>Unauthorized access</CardContent>
                </Card>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-4">
                <NavMain
                    userData={userData}
                    handleLogout={handleLogout}
                    handleMenuClick={handleMenuClick}
                />
                <Card className="p-4">

                    <CardHeader className='flex flex-row justify-between items-center align-middle'>
                        <CardTitle>User Management</CardTitle>
                        <Button variant='outline' onClick={()=>{exportToExcel(users)}}>Export to Excel</Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone No.</TableHead>
                                    <TableHead>Institute</TableHead>
                                    <TableHead>Stream</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Created At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user: any) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.fullName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phoneNumber}</TableCell>
                                        <TableCell>{user.instituteName}</TableCell>
                                        <TableCell>{user.stream}</TableCell>
                                        <TableCell>
                                            {/* {user.role !== 'admin' ? (
                                                <button
                                                    className="ml-2 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    onClick={async () => {
                                                        try {
                                                            const response = await axios.put(`${apiUrl}/api/userProfile/make-admin`,
                                                                { email: user.email },
                                                                { headers: { Authorization: `Bearer ${token}` } }
                                                            );
                                                            if (response.data.success) {
                                                                setUsers(users.map((u: any) =>
                                                                    u._id === user._id ? { ...u, role: 'admin' } : u
                                                                ));
                                                            }
                                                        } catch (err) {
                                                            console.error('Error making admin:', err);
                                                            alert('Failed to make user admin');
                                                        }
                                                    }}
                                                >
                                                    Make Admin
                                                </button>
                                            ) : <>{user.role}</>
                                            } */}
                                            {user.role}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;