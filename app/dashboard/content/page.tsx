'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Sparkles, Copy, Check, Download } from 'lucide-react';
import { AI_FEATURES } from '@/lib/ai/ai-service';
import { AIFeatureButton } from '@/components/ai/AIFeatureButton';
import { toast } from 'sonner';

export default function ContentPage() {
  const [blogInput, setBlogInput] = useState({
    topic: '',
    length: 'medium',
    tone: 'professional',
  });
  const [blogResult, setBlogResult] = useState<any>(null);

  const [socialInput, setSocialInput] = useState({
    topic: '',
    platform: 'general',
    count: 5,
  });
  const [socialResults, setSocialResults] = useState<string[]>([]);

  const [emailInput, setEmailInput] = useState({
    topic: '',
    tone: 'professional',
  });
  const [emailResult, setEmailResult] = useState<any>(null);

  const [ideasInput, setIdeasInput] = useState({
    goal: '',
    count: 10,
  });
  const [ideasResults, setIdeasResults] = useState<any[]>([]);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Content Studio</h1>
          <Badge variant="secondary">AI Powered</Badge>
        </div>
        <p className="text-muted-foreground">
          Create blog posts, social media, and email content with AI
        </p>
      </div>

      <Tabs defaultValue="blog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="email">Email Marketing</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
        </TabsList>

        {/* Blog Posts Tab */}
        <TabsContent value="blog" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generate Blog Post</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="blog-topic">Topic</Label>
                <Input
                  id="blog-topic"
                  placeholder="What do you want to write about?"
                  value={blogInput.topic}
                  onChange={(e) => setBlogInput({ ...blogInput, topic: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="blog-length">Length</Label>
                  <Select
                    value={blogInput.length}
                    onValueChange={(value) => setBlogInput({ ...blogInput, length: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (500 words)</SelectItem>
                      <SelectItem value="medium">Medium (1000 words)</SelectItem>
                      <SelectItem value="long">Long (2000 words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="blog-tone">Tone</Label>
                  <Select
                    value={blogInput.tone}
                    onValueChange={(value) => setBlogInput({ ...blogInput, tone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <AIFeatureButton
                feature={AI_FEATURES.writeBlogPost}
                prompt={`Write a ${blogInput.length} blog post about: ${blogInput.topic}. Tone: ${blogInput.tone}`}
                context={blogInput}
                onComplete={(result) => setBlogResult(result)}
                label="Generate Blog Post"
                className="w-full"
                disabled={!blogInput.topic}
                model="gpt-4o"
              />
            </div>
          </Card>

          {blogResult && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{blogResult.title}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(JSON.stringify(blogResult, null, 2), 0)}
                  >
                    {copiedIndex === 0 ? (
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy All
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
              <div className="prose max-w-none">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2">Introduction</h4>
                  <p className="text-muted-foreground">{blogResult.intro}</p>
                </div>
                {blogResult.sections?.map((section: any, index: number) => (
                  <div key={index} className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">{section.title}</h4>
                    <p className="text-muted-foreground">{section.content}</p>
                  </div>
                ))}
                <div>
                  <h4 className="text-lg font-semibold mb-2">Conclusion</h4>
                  <p className="text-muted-foreground">{blogResult.conclusion}</p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generate Social Posts</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="social-topic">Topic / Message</Label>
                <Textarea
                  id="social-topic"
                  placeholder="What do you want to post about?"
                  rows={3}
                  value={socialInput.topic}
                  onChange={(e) => setSocialInput({ ...socialInput, topic: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="social-platform">Platform</Label>
                  <Select
                    value={socialInput.platform}
                    onValueChange={(value) => setSocialInput({ ...socialInput, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="social-count">Number of Posts</Label>
                  <Select
                    value={socialInput.count.toString()}
                    onValueChange={(value) => setSocialInput({ ...socialInput, count: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 posts</SelectItem>
                      <SelectItem value="5">5 posts</SelectItem>
                      <SelectItem value="10">10 posts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <AIFeatureButton
                feature={AI_FEATURES.writeSocialPost}
                prompt={`Write ${socialInput.count} engaging ${socialInput.platform} posts about: ${socialInput.topic}`}
                context={socialInput}
                onComplete={(result) => setSocialResults(result)}
                label={`Generate ${socialInput.count} Posts`}
                className="w-full"
                disabled={!socialInput.topic}
              />
            </div>
          </Card>

          {socialResults.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {socialResults.map((post: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">Post {index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(typeof post === 'string' ? post : post.text, index + 100)}
                    >
                      {copiedIndex === index + 100 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {typeof post === 'string' ? post : post.text}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Email Marketing Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generate Email Campaign</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-topic">Campaign Topic</Label>
                <Textarea
                  id="email-topic"
                  placeholder="What is this email about? What action do you want recipients to take?"
                  rows={3}
                  value={emailInput.topic}
                  onChange={(e) => setEmailInput({ ...emailInput, topic: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email-tone">Tone</Label>
                <Select
                  value={emailInput.tone}
                  onValueChange={(value) => setEmailInput({ ...emailInput, tone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <AIFeatureButton
                feature={AI_FEATURES.writeEmailCopy}
                prompt={`Write a conversion-focused email about: ${emailInput.topic}. Tone: ${emailInput.tone}`}
                context={emailInput}
                onComplete={(result) => setEmailResult(result)}
                label="Generate Email"
                className="w-full"
                disabled={!emailInput.topic}
              />
            </div>
          </Card>

          {emailResult && (
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label>Subject Line</Label>
                  <div className="flex items-center gap-2">
                    <Input value={emailResult.subject} readOnly />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(emailResult.subject, 200)}
                    >
                      {copiedIndex === 200 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Preview Text</Label>
                  <div className="flex items-center gap-2">
                    <Input value={emailResult.preview_text} readOnly />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(emailResult.preview_text, 201)}
                    >
                      {copiedIndex === 201 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Email Body</Label>
                  <Card className="p-4 bg-muted">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {emailResult.body}
                    </div>
                  </Card>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => handleCopy(emailResult.body, 202)}
                  >
                    {copiedIndex === 202 ? (
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy Body
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Ideas Tab */}
        <TabsContent value="ideas" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Brainstorm Ideas</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ideas-goal">Goal / Challenge</Label>
                <Textarea
                  id="ideas-goal"
                  placeholder="What are you trying to achieve? What problem are you solving?"
                  rows={3}
                  value={ideasInput.goal}
                  onChange={(e) => setIdeasInput({ ...ideasInput, goal: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ideas-count">Number of Ideas</Label>
                <Select
                  value={ideasInput.count.toString()}
                  onValueChange={(value) => setIdeasInput({ ...ideasInput, count: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 ideas</SelectItem>
                    <SelectItem value="10">10 ideas</SelectItem>
                    <SelectItem value="20">20 ideas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <AIFeatureButton
                feature={AI_FEATURES.brainstormIdeas}
                prompt={`Brainstorm ${ideasInput.count} innovative ideas for: ${ideasInput.goal}`}
                context={ideasInput}
                onComplete={(result) => setIdeasResults(result)}
                label={`Generate ${ideasInput.count} Ideas`}
                className="w-full"
                disabled={!ideasInput.goal}
              />
            </div>
          </Card>

          {ideasResults.length > 0 && (
            <div className="space-y-3">
              {ideasResults.map((idea: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">
                        {idea.idea || idea.title || idea}
                      </h4>
                      {idea.implementation && (
                        <p className="text-sm text-muted-foreground">
                          {idea.implementation}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(JSON.stringify(idea, null, 2), index + 300)}
                    >
                      {copiedIndex === index + 300 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
