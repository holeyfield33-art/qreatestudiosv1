'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Download, 
  Save, 
  Trash2, 
  Send, 
  Plus,
  Loader2,
} from 'lucide-react';

/**
 * UI/UX Testing Page
 * 
 * This page showcases all the UI improvements made to the Qreate Studios dashboard.
 * Use this page to verify that all interactive elements have proper:
 * - Hover states
 * - Focus rings
 * - Loading states
 * - Disabled states
 * - Cursor indicators
 * - Smooth transitions
 */
export default function UITestPage() {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const handleAsyncAction = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">UI/UX Component Testing</h1>
        <p className="text-muted-foreground text-lg">
          Interactive showcase of all UI improvements with hover, focus, and loading states
        </p>
      </div>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>
            All buttons have hover scale effects, shadows, and 2px blue focus rings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Default Buttons</Label>
            <div className="flex flex-wrap gap-3">
              <Button>Default Button</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>With Icons</Label>
            <div className="flex flex-wrap gap-3">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
              <Button variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Button Sizes</Label>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Loading State (NEW!)</Label>
            <div className="flex flex-wrap gap-3">
              <Button loading={loading} onClick={handleAsyncAction}>
                {loading ? 'Processing...' : 'Click to Test Loading'}
              </Button>
              <Button variant="outline" loading>
                Loading Outline
              </Button>
              <Button variant="destructive" loading>
                Loading Destructive
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Disabled State</Label>
            <div className="flex flex-wrap gap-3">
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>Disabled Outline</Button>
              <Button variant="destructive" disabled>Disabled Destructive</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs</CardTitle>
          <CardDescription>
            All inputs have hover border effects and 2px blue focus rings with shadows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="test-input">Text Input</Label>
            <Input
              id="test-input"
              placeholder="Type here to see focus ring..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Hover to see border change, focus to see blue ring
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-email">Email Input</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-disabled">Disabled Input</Label>
            <Input
              id="test-disabled"
              disabled
              placeholder="This input is disabled"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-textarea">Textarea</Label>
            <Textarea
              id="test-textarea"
              placeholder="Type multiple lines here..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-select">Select Dropdown</Label>
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger id="test-select">
                <SelectValue placeholder="Choose an option..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1 - Hover me!</SelectItem>
                <SelectItem value="option2">Option 2 - Clickable</SelectItem>
                <SelectItem value="option3">Option 3 - Interactive</SelectItem>
                <SelectItem value="option4" disabled>Option 4 - Disabled</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Notice cursor pointer and hover effects
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Cards</CardTitle>
          <CardDescription>
            Hover over cards to see scale effects and shadows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-accent-foreground/20 active:scale-[0.99]">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-semibold mb-2">Hover Me!</h3>
              <p className="text-sm text-muted-foreground">
                This card scales up and adds shadow on hover
              </p>
            </Card>

            <Card className="p-6 transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-accent-foreground/20 active:scale-[0.99]">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-semibold mb-2">Interactive</h3>
              <p className="text-sm text-muted-foreground">
                Click to see active scale down effect
              </p>
            </Card>

            <Card className="p-6 transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-accent-foreground/20 active:scale-[0.99]">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-semibold mb-2">Smooth</h3>
              <p className="text-sm text-muted-foreground">
                All transitions are smooth and polished
              </p>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Navigation Test */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Navigation Test</CardTitle>
          <CardDescription>
            Press Tab to navigate through elements and see focus rings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              All interactive elements should show a visible 2px blue focus ring when focused.
              Try using Tab and Shift+Tab to navigate.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button>First Button</Button>
              <Button variant="outline">Second Button</Button>
              <Input placeholder="Input field" className="w-48" />
              <Button variant="secondary">Third Button</Button>
              <Button variant="ghost">Fourth Button</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Testing Checklist</CardTitle>
          <CardDescription>
            Verify all these behaviors work correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Hover Effects</p>
                <p className="text-sm text-muted-foreground">
                  All buttons should scale up (1.02x) and show shadows on hover
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Focus Rings</p>
                <p className="text-sm text-muted-foreground">
                  All interactive elements should show 2px blue rings when focused (use Tab)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Loading States</p>
                <p className="text-sm text-muted-foreground">
                  Buttons should show spinners and become disabled during loading
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                4
              </div>
              <div>
                <p className="font-medium">Cursor Indicators</p>
                <p className="text-sm text-muted-foreground">
                  All clickable elements should show cursor: pointer
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                5
              </div>
              <div>
                <p className="font-medium">Disabled States</p>
                <p className="text-sm text-muted-foreground">
                  Disabled elements should have 50% opacity and cursor-not-allowed
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                6
              </div>
              <div>
                <p className="font-medium">Input Focus Effects</p>
                <p className="text-sm text-muted-foreground">
                  Input fields should show border change on hover and blue ring + shadow on focus
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
