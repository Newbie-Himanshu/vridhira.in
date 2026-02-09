'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import {
    Activity,
    RefreshCw,
    Download,
    Trash2,
    Search,
    AlertCircle,
    User,
    Package,
    ShoppingCart,
    Settings,
    Eye,
    LogIn,
    AlertTriangle,
    Calendar as CalendarIcon,
    Info
} from 'lucide-react';

interface ActivityLog {
    id: string;
    user_id: string | null;
    user_email: string | null;
    user_role: string | null;
    ip_address: string | null;
    user_agent: string | null;
    action: string;
    action_category: string;
    severity: 'info' | 'warning' | 'critical';
    target_type: string | null;
    target_id: string | null;
    target_name: string | null;
    details: Record<string, unknown>;
    changes: { before: Record<string, unknown>; after: Record<string, unknown> } | null;
    created_at: string;
}

interface LogStats {
    total: number;
    today: number;
    thisWeek: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    storage: { entries: number; estimatedMB: number };
}

const categoryIcons: Record<string, React.ReactNode> = {
    auth: <LogIn className="h-4 w-4" />,
    user: <User className="h-4 w-4" />,
    product: <Package className="h-4 w-4" />,
    order: <ShoppingCart className="h-4 w-4" />,
    cart: <ShoppingCart className="h-4 w-4" />,
    admin: <Settings className="h-4 w-4" />,
    page: <Eye className="h-4 w-4" />,
    system: <AlertCircle className="h-4 w-4" />,
};

const severityColors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-amber-100 text-amber-800',
    critical: 'bg-red-100 text-red-800',
};

export default function ActivityPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [stats, setStats] = useState<LogStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [category, setCategory] = useState<string>('');
    const [severity, setSeverity] = useState<string>('');
    const [search, setSearch] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteRange, setDeleteRange] = useState({ start: '', end: '' });
    const { toast } = useToast();

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '50',
            });
            if (category) params.set('category', category);
            if (severity) params.set('severity', severity);
            if (search) params.set('search', search);

            if (dateRange?.from) {
                params.set('startDate', dateRange.from.toISOString());
            }
            if (dateRange?.to) {
                // Set end date to end of day if it's the same as start or just generally to be inclusive
                const endDate = new Date(dateRange.to);
                endDate.setHours(23, 59, 59, 999);
                params.set('endDate', endDate.toISOString());
            } else if (dateRange?.from) {
                // If only start date is selected, assume single day filter (start to end of that day)
                const endDate = new Date(dateRange.from);
                endDate.setHours(23, 59, 59, 999);
                params.set('endDate', endDate.toISOString());
            }

            const response = await fetch(`/api/logs?${params}`);
            if (!response.ok) throw new Error('Failed to fetch logs');

            const data = await response.json();
            setLogs(data.logs || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load activity logs',
            });
        } finally {
            setLoading(false);
        }
    }, [page, category, severity, search, dateRange, toast]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch('/api/logs/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, []);

    useEffect(() => {
        // Debounce search slightly
        const timer = setTimeout(() => {
            fetchLogs();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchLogs]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleExport = async (format: 'json' | 'csv') => {
        try {
            const response = await fetch('/api/logs/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    format,
                    category: category || undefined,
                    startDate: dateRange?.from?.toISOString(),
                    endDate: dateRange?.to?.toISOString(),
                }),
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `activity_logs.${format}`;
            a.click();
            URL.revokeObjectURL(url);

            toast({
                title: 'Export Complete',
                description: `Logs exported as ${format.toUpperCase()}`,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Export Failed',
                description: 'Could not export logs',
            });
        }
    };

    const handleDeletePeriod = async () => {
        if (!deleteRange.start || !deleteRange.end) {
            toast({
                variant: 'destructive',
                title: 'Invalid Range',
                description: 'Please select both start and end dates',
            });
            return;
        }

        try {
            const response = await fetch('/api/logs', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: new Date(deleteRange.start).toISOString(),
                    endDate: new Date(deleteRange.end).toISOString(),
                    confirmText: deleteConfirmText,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast({
                    variant: 'destructive',
                    title: 'Delete Failed',
                    description: data.error || 'Could not delete logs',
                });
                return;
            }

            toast({
                title: 'Logs Deleted',
                description: data.message,
            });

            setIsDeleteDialogOpen(false);
            setDeleteConfirmText('');
            // Reset delete range
            setDeleteRange({ start: '', end: '' });
            fetchLogs();
            fetchStats();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete logs',
            });
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Activity className="h-8 w-8" />
                        Activity Monitor
                    </h1>
                    <p className="text-muted-foreground">Track all platform events in real-time</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => fetchLogs()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('json')}>
                        <Download className="h-4 w-4 mr-2" />
                        JSON
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('csv')}>
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                    </Button>
                    <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Period
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Logs</CardDescription>
                            <CardTitle className="text-2xl">{stats.total.toLocaleString()}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Today</CardDescription>
                            <CardTitle className="text-2xl">{stats.today.toLocaleString()}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>This Week</CardDescription>
                            <CardTitle className="text-2xl">{stats.thisWeek.toLocaleString()}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Storage</CardDescription>
                            <CardTitle className="text-2xl">{stats.storage.estimatedMB} MB</CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <Input
                                placeholder="Search actions, users, targets..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[260px] justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                                {format(dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        <Select value={category || 'all'} onValueChange={(val) => setCategory(val === 'all' ? '' : val)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="auth">Auth</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="order">Order</SelectItem>
                                <SelectItem value="cart">Cart</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="page">Page</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={severity || 'all'} onValueChange={(val) => setSeverity(val === 'all' ? '' : val)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Severities</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" onClick={() => {
                            setSearch('');
                            setCategory('');
                            setSeverity('');
                            setDateRange(undefined);
                            setPage(1);
                        }}>
                            Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No activity logs found matching your criteria.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer border transition-colors"
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <div className="flex-shrink-0">
                                        {categoryIcons[log.action_category] || <Info className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{log.action}</span>
                                            <Badge className={severityColors[log.severity]}>
                                                {log.severity}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground truncate">
                                            {log.user_email || 'Anonymous'} • {log.target_name || log.target_type || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                                        {formatDate(log.created_at)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Previous
                            </Button>
                            <span className="py-2 px-4 text-sm flex items-center">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Log Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Log Details</DialogTitle>
                        <DialogDescription>
                            {selectedLog?.action} at {selectedLog && formatDate(selectedLog.created_at)}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <strong>Action:</strong> {selectedLog.action}
                                </div>
                                <div>
                                    <strong>Category:</strong> {selectedLog.action_category}
                                </div>
                                <div>
                                    <strong>User:</strong> {selectedLog.user_email || 'Anonymous'}
                                </div>
                                <div>
                                    <strong>Role:</strong> {selectedLog.user_role || 'N/A'}
                                </div>
                                <div>
                                    <strong>IP:</strong> {selectedLog.ip_address || 'N/A'}
                                </div>
                                <div>
                                    <strong>Device:</strong> {selectedLog.user_agent || 'N/A'}
                                </div>
                                <div>
                                    <strong>Target:</strong> {selectedLog.target_name || selectedLog.target_id || 'N/A'}
                                </div>
                                <div>
                                    <strong>Severity:</strong>{' '}
                                    <Badge className={severityColors[selectedLog.severity]}>
                                        {selectedLog.severity}
                                    </Badge>
                                </div>
                            </div>

                            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                                <div>
                                    <strong>Details:</strong>
                                    <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-[200px]">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.changes && (
                                <div>
                                    <strong>Changes:</strong>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Before:</span>
                                            <pre className="p-2 bg-red-50 rounded text-xs overflow-auto max-h-[150px]">
                                                {JSON.stringify(selectedLog.changes.before, null, 2)}
                                            </pre>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">After:</span>
                                            <pre className="p-2 bg-green-50 rounded text-xs overflow-auto max-h-[150px]">
                                                {JSON.stringify(selectedLog.changes.after, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Period Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete Log Period
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. All logs in the selected period will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Start Date</label>
                                <Input
                                    type="date"
                                    value={deleteRange.start}
                                    onChange={(e) => setDeleteRange((r) => ({ ...r, start: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">End Date</label>
                                <Input
                                    type="date"
                                    value={deleteRange.end}
                                    onChange={(e) => setDeleteRange((r) => ({ ...r, end: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">
                                Type &quot;delete X logs&quot; to confirm:
                            </label>
                            <Input
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="delete X logs"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeletePeriod}>
                            Delete Logs
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
