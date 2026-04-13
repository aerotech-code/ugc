// Hostel Management Tab
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const HostelTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hostel Management</h2>
          <p className="text-gray-600 mt-1">Manage hostels, rooms, and student allocations</p>
        </div>
        <Button className="bg-pink-600 hover:bg-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          New Allocation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hostels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-600">3</div>
            <p className="text-xs text-gray-600 mt-1">Boys, Girls, Co-ed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">128</div>
            <p className="text-xs text-gray-600 mt-1">Capacity: 420</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">85%</div>
            <p className="text-xs text-gray-600 mt-1">358 students</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hostels" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hostels">Hostels</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
        </TabsList>

        <TabsContent value="hostels">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Boys Hostel A', type: 'Boys', capacity: 150, occupancy: 142, status: 'Full' },
              { name: 'Girls Hostel B', type: 'Girls', capacity: 140, occupancy: 125, status: 'Available' },
              { name: 'Co-ed Hostel C', type: 'Co-ed', capacity: 130, occupancy: 91, status: 'Available' },
            ].map((hostel, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{hostel.name}</CardTitle>
                  <p className="text-sm text-gray-600">{hostel.type}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Occupancy</p>
                    <p className="text-2xl font-bold text-blue-600">{hostel.occupancy}/{hostel.capacity}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(hostel.occupancy / hostel.capacity) * 100}%` }}
                    />
                  </div>
                  <Badge className={hostel.status === 'Full' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                    {hostel.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <CardTitle>Hostel Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Room No.</TableHead>
                      <TableHead>Hostel</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Occupancy</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { room: '101', hostel: 'Boys A', floor: 1, type: 'Double', occupancy: '2/2', status: 'Full' },
                      { room: '102', hostel: 'Boys A', floor: 1, type: 'Triple', occupancy: '2/3', status: 'Available' },
                      { room: '201', hostel: 'Girls B', floor: 2, type: 'Double', occupancy: '1/2', status: 'Available' },
                    ].map((room, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-blue-600">{room.room}</TableCell>
                        <TableCell>{room.hostel}</TableCell>
                        <TableCell>{room.floor}</TableCell>
                        <TableCell>{room.type}</TableCell>
                        <TableCell>{room.occupancy}</TableCell>
                        <TableCell>
                          <Badge className={room.status === 'Full' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {room.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations">
          <Card>
            <CardHeader>
              <CardTitle>Current Allocations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">358 students allocated to hostel rooms</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HostelTab;
