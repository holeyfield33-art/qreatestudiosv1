'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image?: string;
  available: boolean;
}

interface MenuManagerProps {
  landingPageId: string;
}

export default function MenuManager({ landingPageId }: MenuManagerProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<MenuItem>({
    name: '',
    description: '',
    price: '',
    category: 'Appetizers',
    available: true,
  });

  const categories = ['Appetizers', 'Entrees', 'Desserts', 'Drinks', 'Specials'];

  useEffect(() => {
    fetchMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landingPageId]);

  async function fetchMenuItems() {
    try {
      const response = await fetch(`/api/landing-pages/${landingPageId}/menu`);
      const data = await response.json();
      setItems(data.menuItems || []);
    } catch (_error) {
      console.error('Failed to fetch menu items');
    }
  }

  async function handleSave() {
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required');
      return;
    }

    try {
      const url = editing
        ? `/api/landing-pages/${landingPageId}/menu/${editing}`
        : `/api/landing-pages/${landingPageId}/menu`;

      const response = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success(editing ? 'Item updated!' : 'Item added!');
      setShowAddForm(false);
      setEditing(null);
      setFormData({ name: '', description: '', price: '', category: 'Appetizers', available: true });
      fetchMenuItems();
    } catch (_error) {
      toast.error('Failed to save menu item');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this menu item?')) return;

    try {
      await fetch(`/api/landing-pages/${landingPageId}/menu/${id}`, {
        method: 'DELETE',
      });
      toast.success('Item deleted');
      fetchMenuItems();
    } catch (_error) {
      toast.error('Failed to delete');
    }
  }

  function startEdit(item: MenuItem) {
    setFormData(item);
    setEditing(item.id!);
    setShowAddForm(true);
  }

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Menu Items</h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>{editing ? 'Edit Item' : 'Add New Item'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Item Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Margherita Pizza"
                />
              </div>
              <div>
                <Label>Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="12.99"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Fresh mozzarella, tomatoes, basil..."
                rows={3}
              />
            </div>

            <div>
              <Label>Category</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {editing ? 'Update' : 'Add'} Item
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditing(null);
                  setFormData({ name: '', description: '', price: '', category: 'Appetizers', available: true });
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu Items Display */}
      {Object.keys(groupedItems).length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">No menu items yet</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryItems = groupedItems[category];
            if (!categoryItems || categoryItems.length === 0) return null;

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <h4 className="font-semibold">{item.name}</h4>
                          <span className="text-lg font-bold text-green-600">
                            ${parseFloat(item.price).toFixed(2)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(item)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
