// Library Management Tab
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const LibraryTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Library Management</h2>
          <p className="text-gray-600 mt-1">Manage books, borrowing, and member records</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Book
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">8,421</div>
            <p className="text-xs text-gray-600 mt-1">7,890 available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Books Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">531</div>
            <p className="text-xs text-gray-600 mt-1">Currently borrowed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">2,145</div>
            <p className="text-xs text-gray-600 mt-1">Active members</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="books" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="borrowing">Borrowing</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="books">
          <Card>
            <CardHeader>
              <CardTitle>Library Books</CardTitle>
              <div className="flex gap-2 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search books..." className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>ISBN</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { isbn: '978-3-16-1', title: 'Data Structures', author: 'Mark Allen', total: 5, available: 3 },
                      { isbn: '978-0-13-2', title: 'Clean Code', author: 'Robert Martin', total: 8, available: 2 },
                      { isbn: '978-0-596-3', title: 'JavaScript Guide', author: 'Kyle Simpson', total: 6, available: 4 },
                    ].map((book, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-50">
                        <TableCell className="text-sm text-gray-600">{book.isbn}</TableCell>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{book.total}</TableCell>
                        <TableCell className="font-semibold">{book.available}</TableCell>
                        <TableCell>
                          <Badge className={book.available > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {book.available > 0 ? 'Available' : 'Out of Stock'}
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

        <TabsContent value="borrowing">
          <Card>
            <CardHeader>
              <CardTitle>Active Borrowing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Member</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { member: 'Rahul Kumar', book: 'Data Structures', issued: '2024-01-05', due: '2024-01-20', status: 'On Time' },
                      { member: 'Priya Singh', book: 'Clean Code', issued: '2024-01-10', due: '2024-01-25', status: 'On Time' },
                      { member: 'Amit Patel', book: 'Algorithms', issued: '2023-12-25', due: '2024-01-10', status: 'Overdue' },
                    ].map((borrow, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{borrow.member}</TableCell>
                        <TableCell>{borrow.book}</TableCell>
                        <TableCell>{borrow.issued}</TableCell>
                        <TableCell>{borrow.due}</TableCell>
                        <TableCell>
                          <Badge className={borrow.status === 'On Time' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {borrow.status}
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

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Library Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">2,145 active members</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LibraryTab;
