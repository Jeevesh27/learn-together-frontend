
import React, { useState, useEffect } from 'react';
import { courseApi, chatApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface Course {
  _id: string;
  name: string;
  description: string;
}

interface CourseSelectorProps {
  onClose: () => void;
  onChatCreated: (chat: any) => void;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ onClose, onChatCreated }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await courseApi.getAllCourses();
        setCourses(response.data);
      } catch (error) {
        toast.error('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCreateChat = async () => {
    if (!selectedCourse || !question || !mentorEmail) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsCreating(true);
      // This is simplified - in a real app you'd look up the mentor's ID
      const response = await chatApi.accessChat(mentorEmail, selectedCourse, question);
      onChatCreated(response.chatData);
      toast.success('Chat created successfully');
    } catch (error) {
      toast.error('Failed to create chat');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Loading courses...</p>
      </div>
    );
  }

  if (user?.role !== "student") {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-4/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">New Conversation</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p>Only students can initiate new conversations.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <Card className="w-4/5">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">New Conversation</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Course</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">-- Select a course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mentor Email</label>
              <Input
                type="email"
                placeholder="Enter mentor's email"
                value={mentorEmail}
                onChange={(e) => setMentorEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <Textarea
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateChat}
                disabled={isCreating || !selectedCourse || !question || !mentorEmail}
              >
                {isCreating ? 'Creating...' : 'Start Conversation'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseSelector;
