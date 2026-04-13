import { useEffect, useState } from 'react';
import { useERPStore, type ERPProcurement } from '@/stores/erpStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function ProcurementTab() {
  const { procurement, loadingProcurement, fetchProcurement, createProcurement } = useERPStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    vendorName: '',
    poNumber: '',
    dueDate: '',
    items: [{ description: '', quantity: 0, unitPrice: 0 }],
    notes: '',
  });

  useEffect(() => {
    fetchProcurement();
  }, [fetchProcurement]);

  const handleSubmit = async () => {
    await createProcurement({
      vendorId: '',
      ...formData,
      dueDate: new Date(formData.dueDate),
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as ERPProcurement);
    setFormData({ vendorName: '', poNumber: '', dueDate: '', items: [{ description: '', quantity: 0, unitPrice: 0 }], notes: '' });
    setIsOpen(false);
  };

  const statusColors: Record<string, string> = {
    Pending: 'bg-edu-amber-100 text-edu-amber-700',
    Approved: 'bg-edu-blue-100 text-edu-blue-700',
    Received: 'bg-edu-green-100 text-edu-green-700',
    Closed: 'bg-edu-gray-100 text-edu-gray-700',
    Cancelled: 'bg-edu-rose-100 text-edu-rose-700',
  };

  const totalPOValue = procurement.reduce((sum, po) => {
    const poValue = po.items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0);
    return sum + poValue;
  }, 0);

  const pendingPOs = procurement.filter(p => p.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-edu-rose-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Total POs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-rose-900">{procurement.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-edu-amber-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Pending</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-amber-900">{pendingPOs}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-edu-blue-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Total Value</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-blue-900">
              ${totalPOValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-edu-green-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-green-900">
              {procurement.filter(p => p.status === 'Closed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center pt-4 border-t border-edu-rose-200">
        <div>
          <h2 className="text-2xl font-bold text-edu-rose-900">Purchase Orders</h2>
          <p className="text-edu-gray-600 mt-1">Manage vendor orders and procurement</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-edu-rose-600 hover:bg-edu-rose-700">
              <Plus className="h-4 w-4" />
              Create PO
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
              <DialogDescription>Add a new purchase order for vendor procurement</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label className="text-edu-rose-900 font-semibold">Vendor Name</Label>
                <Input
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  placeholder="e.g., ABC Supplies"
                  className="mt-1 border-edu-rose-300"
                />
              </div>
              <div>
                <Label className="text-edu-rose-900 font-semibold">PO Number</Label>
                <Input
                  value={formData.poNumber}
                  onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                  placeholder="e.g., PO-2024-001"
                  className="mt-1 border-edu-rose-300"
                />
              </div>
              <div>
                <Label className="text-edu-rose-900 font-semibold">Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-1 border-edu-rose-300"
                />
              </div>
              <div>
                <Label className="text-edu-rose-900 font-semibold">Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special instructions or notes"
                  className="mt-1 border-edu-rose-300"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full bg-edu-rose-600 hover:bg-edu-rose-700">
                Create Purchase Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* POs Table */}
      {loadingProcurement ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          </CardContent>
        </Card>
      ) : procurement.length === 0 ? (
        <Card className="border-edu-rose-200 bg-edu-rose-50">
          <CardContent className="pt-8 text-center">
            <Package className="h-12 w-12 text-edu-rose-300 mx-auto mb-3" />
            <p className="text-edu-gray-600">No purchase orders found. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {procurement.map(po => {
                const poTotal = po.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                return (
                  <div 
                    key={po.id} 
                    className="border border-edu-rose-200 rounded-lg p-4 hover:bg-edu-rose-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-edu-rose-900">{po.vendorName}</h3>
                        <p className="text-sm text-edu-rose-600 font-mono">{po.poNumber}</p>
                      </div>
                      <Badge className={statusColors[po.status]}>
                        {po.status}
                      </Badge>
                    </div>
                    
                    <div className="bg-edu-rose-50 rounded p-3 mb-3">
                      <div className="text-sm space-y-1">
                        <p className="text-edu-gray-700">
                          <span className="font-semibold">Items:</span> {po.items.length}
                        </p>
                        <p className="text-edu-gray-700">
                          <span className="font-semibold">Due:</span> {new Date(po.dueDate).toLocaleDateString()}
                        </p>
                        <p className="font-bold text-edu-rose-700 text-lg">
                          Total: ${poTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {po.items.length > 0 && (
                      <div className="bg-white border border-edu-rose-100 rounded p-2 text-sm">
                        <p className="font-semibold text-edu-rose-900 mb-2">Items:</p>
                        <ul className="space-y-1">
                          {po.items.map((item, idx) => (
                            <li key={idx} className="text-edu-gray-700">
                              {item.description} × {item.quantity} @ ${item.unitPrice.toFixed(2)}
                              = ${(item.quantity * item.unitPrice).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
