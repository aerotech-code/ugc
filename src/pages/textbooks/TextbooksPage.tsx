import { useState } from 'react';
import {
  Library,
  Search,
  Upload,
  FileText,
  MessageSquare,
  Sparkles,
  BookOpen,
  Clock,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores';
import { formatFileSize } from '@/lib/utils';

// Mock textbooks data
const MOCK_TEXTBOOKS = [
  {
    id: 'tb-001',
    title: 'Introduction to Machine Learning',
    author: 'Andrew Ng',
    subject: 'Computer Science',
    description: 'Comprehensive guide to machine learning fundamentals',
    fileSize: 15420000,
    pageCount: 450,
    uploadedAt: new Date('2024-01-15'),
    aiEnabled: true,
  },
  {
    id: 'tb-002',
    title: 'Calculus: Early Transcendentals',
    author: 'James Stewart',
    subject: 'Mathematics',
    description: 'Complete calculus textbook with exercises',
    fileSize: 28500000,
    pageCount: 1200,
    uploadedAt: new Date('2024-01-10'),
    aiEnabled: true,
  },
  {
    id: 'tb-003',
    title: 'Database Systems: The Complete Book',
    author: 'Hector Garcia-Molina',
    subject: 'Computer Science',
    description: 'In-depth coverage of database design and implementation',
    fileSize: 18900000,
    pageCount: 680,
    uploadedAt: new Date('2024-01-20'),
    aiEnabled: true,
  },
];

export function TextbooksPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTextbook, setSelectedTextbook] = useState<typeof MOCK_TEXTBOOKS[0] | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  const filteredTextbooks = MOCK_TEXTBOOKS.filter(tb =>
    tb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tb.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tb.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !selectedTextbook) return;

    const userMessage = chatInput.trim();
    setChatMessages([...chatMessages, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsAiResponding(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        'machine learning': 'Machine learning is a subset of AI that enables systems to learn from data. Key concepts include supervised learning, unsupervised learning, and reinforcement learning.',
        'gradient descent': 'Gradient descent is an optimization algorithm used to minimize the cost function in machine learning models. It iteratively adjusts parameters to find the minimum.',
        'neural network': 'Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) that process information.',
        'overfitting': 'Overfitting occurs when a model learns the training data too well, including noise. Solutions include regularization, cross-validation, and more training data.',
      };

      const lowerMsg = userMessage.toLowerCase();
      let response = 'Based on the textbook, ';
      
      const matchedKey = Object.keys(responses).find(key => lowerMsg.includes(key));
      if (matchedKey) {
        response += responses[matchedKey];
      } else {
        response += `I found relevant information about "${userMessage}" in Chapter 3, Section 2. The textbook explains this concept with examples and practice problems. Would you like me to elaborate on any specific aspect?`;
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsAiResponding(false);
    }, 1500);
  };

  const openChat = (textbook: typeof MOCK_TEXTBOOKS[0]) => {
    setSelectedTextbook(textbook);
    setChatMessages([]);
    setIsChatOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Digital Textbooks</h1>
          <p className="text-gray-500 mt-1">
            Access your textbooks and ask AI-powered questions.
          </p>
        </div>
        {isTeacherOrAdmin && (
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Textbook
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search textbooks by title, author, or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Textbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTextbooks.map((textbook) => (
          <Card key={textbook.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                {textbook.aiEnabled && (
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Ready
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{textbook.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{textbook.author}</p>
              <p className="text-xs text-gray-400 mb-4 line-clamp-2">{textbook.description}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {textbook.pageCount} pages
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatFileSize(textbook.fileSize)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openChat(textbook)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask AI
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTextbooks.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Library className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No textbooks found</h3>
          <p className="text-gray-500">Try adjusting your search</p>
        </div>
      )}

      {/* AI Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Ask {selectedTextbook?.title}
            </DialogTitle>
            <DialogDescription>
              Ask questions about the textbook content and get AI-powered answers.
            </DialogDescription>
          </DialogHeader>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg my-4">
            {chatMessages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Start a conversation about this textbook</p>
                <p className="text-sm mt-1">Try asking about key concepts, definitions, or examples</p>
              </div>
            )}
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isAiResponding && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                    <span className="text-sm text-gray-500">AERO AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question about this textbook..."
              onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
              disabled={isAiResponding}
            />
            <Button onClick={handleChatSubmit} disabled={isAiResponding || !chatInput.trim()}>
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
