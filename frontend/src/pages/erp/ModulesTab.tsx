import { useEffect, useState } from 'react';
import { useERPStore, type ERPModule } from '@/stores/erpStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ModulesTab() {
  const { modules, loadingModules, fetchModules, createModule, updateModule } = useERPStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    moduleCode: '',
    moduleName: '',
    description: '',
    version: '1.0.0',
  });

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleSubmit = async () => {
    if (editingId) {
      await updateModule(editingId, formData);
      setEditingId(null);
    } else {
      await createModule({
        ...formData,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as ERPModule);
    }
    setFormData({ moduleCode: '', moduleName: '', description: '', version: '1.0.0' });
    setIsOpen(false);
  };

  const handleEdit = (module: ERPModule) => {
    setEditingId(module.id);
    setFormData({
      moduleCode: module.moduleCode,
      moduleName: module.moduleName,
      description: module.description,
      version: module.version,
    });
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-edu-blue-900">System Modules</h2>
          <p className="text-edu-gray-600 mt-1">Manage core ERP system modules</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gap-2 bg-edu-blue-600 hover:bg-edu-blue-700"
              onClick={() => {
                setEditingId(null);
                setFormData({ moduleCode: '', moduleName: '', description: '', version: '1.0.0' });
              }}
            >
              <Plus className="h-4 w-4" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Module' : 'Create Module'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update module details' : 'Add a new ERP system module'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-edu-blue-900 font-semibold">Module Code</Label>
                <Input
                  value={formData.moduleCode}
                  onChange={(e) => setFormData({ ...formData, moduleCode: e.target.value })}
                  placeholder="e.g., ACC, INV, HR"
                  className="mt-1 border-edu-blue-300"
                />
              </div>
              <div>
                <Label className="text-edu-blue-900 font-semibold">Module Name</Label>
                <Input
                  value={formData.moduleName}
                  onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                  placeholder="e.g., Accounting, Inventory"
                  className="mt-1 border-edu-blue-300"
                />
              </div>
              <div>
                <Label className="text-edu-blue-900 font-semibold">Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Module description"
                  className="mt-1 border-edu-blue-300"
                />
              </div>
              <div>
                <Label className="text-edu-blue-900 font-semibold">Version</Label>
                <Input
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g., 1.0.0"
                  className="mt-1 border-edu-blue-300"
                />
              </div>
              <Button 
                onClick={handleSubmit}
                className="w-full bg-edu-blue-600 hover:bg-edu-blue-700"
              >
                {editingId ? 'Update Module' : 'Create Module'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modules Grid */}
      {loadingModules ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : modules.length === 0 ? (
        <Card className="border-edu-blue-200 bg-edu-blue-50">
          <CardContent className="pt-8 text-center">
            <p className="text-edu-gray-600">No modules found. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(module => (
            <Card 
              key={module.id} 
              className="border-l-4 border-l-edu-blue-600 hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-edu-blue-900">{module.moduleName}</CardTitle>
                    <CardDescription className="text-edu-blue-600 font-mono">
                      {module.moduleCode}
                    </CardDescription>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${module.active ? 'bg-edu-green-100 text-edu-green-700' : 'bg-edu-gray-100 text-edu-gray-700'}`}>
                    {module.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-edu-gray-700">{module.description}</p>
                <p className="text-xs text-edu-gray-500">Version: {module.version}</p>
                <div className="flex gap-2 pt-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 border-edu-blue-300 text-edu-blue-600 hover:bg-edu-blue-50"
                    onClick={() => handleEdit(module)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 border-edu-rose-300 text-edu-rose-600 hover:bg-edu-rose-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
