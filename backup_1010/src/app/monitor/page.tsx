'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Activity, Database, AlertTriangle, Clock, Globe } from 'lucide-react';

interface ApiLogEntry {
  id?: number;
  method: string;
  url: string;
  pathname: string;
  statusCode: number;
  duration: number;
  userAgent?: string;
  ip?: string;
  userId?: number;
  error?: string;
  requestBody?: any;
  responseBody?: any;
  timestamp: string;
}

interface ApiStats {
  totalRequests: number;
  averageDuration: number;
  errorRate: number;
  statusCodes: Record<number, number>;
  slowestRoutes: Array<{ pathname: string; avgDuration: number; count: number }>;
}

interface HealthData {
  memory: ApiStats;
  database: {
    totalRequests: number;
    averageDuration: number;
    errorRate: number;
    recentLogs: ApiLogEntry[];
  };
  health: {
    status: string;
    uptime: number;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    timestamp: string;
  };
}

export default function MonitorPage() {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = async (type: 'memory' | 'database' | 'health' = 'memory') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/monitor?type=${type}`);
      const data = await response.json();

      if (data.success) {
        if (type === 'memory') {
          setLogs(data.data.logs || []);
          setStats(data.data.stats || null);
        } else if (type === 'health') {
          setHealth(data.data);
        }
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      const response = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-logs' }),
      });
      
      if (response.ok) {
        await fetchData('memory');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear logs');
    }
  };

  useEffect(() => {
    fetchData('memory');
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData('memory');
      }, 5000); // Обновляем каждые 5 секунд

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'bg-green-100 text-green-800';
    if (statusCode >= 300 && statusCode < 400) return 'bg-blue-100 text-blue-800';
    if (statusCode >= 400 && statusCode < 500) return 'bg-yellow-100 text-yellow-800';
    if (statusCode >= 500) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Monitor</h1>
          <p className="text-gray-600">Real-time API performance monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}</span>
          </Button>
          <Button onClick={() => fetchData('memory')} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => fetchData('health')} variant="outline">
            <Activity className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRequests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.errorRate}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status Codes</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {Object.entries(stats.statusCodes).map(([code, count]) => (
                      <div key={code} className="flex justify-between text-sm">
                        <span className={getStatusColor(Number(code))}>
                          {code}
                        </span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {stats?.slowestRoutes && stats.slowestRoutes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Slowest Routes</CardTitle>
                <CardDescription>Routes with highest average response time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.slowestRoutes.map((route, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <code className="text-sm font-mono">{route.pathname}</code>
                        <div className="text-xs text-gray-500">{route.count} requests</div>
                      </div>
                      <Badge variant="outline">
                        {formatDuration(route.avgDuration)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent API Logs</h3>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Clear Memory Logs
            </Button>
          </div>
          
          <div className="space-y-2">
            {logs.map((log, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getMethodColor(log.method)}>
                      {log.method}
                    </Badge>
                    <Badge className={getStatusColor(log.statusCode)}>
                      {log.statusCode}
                    </Badge>
                    <code className="text-sm font-mono">{log.pathname}</code>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span>{formatDuration(log.duration)}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
                {log.error && (
                  <div className="mt-2 text-sm text-red-600">
                    Error: {log.error}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          {health && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={health.health.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {health.health.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span>{formatUptime(health.health.uptime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory RSS:</span>
                    <span>{formatBytes(health.health.memory.rss)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heap Used:</span>
                    <span>{formatBytes(health.health.memory.heapUsed)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Requests:</span>
                    <span>{health.database.totalRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Duration:</span>
                    <span>{formatDuration(health.database.averageDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate:</span>
                    <span>{health.database.errorRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
