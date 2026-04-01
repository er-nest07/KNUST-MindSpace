import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import PostCard from "../components/feed/PostCard";
import NewPostModal from "../components/feed/NewPostModal";
import { Button } from "../components/ui/button";

// Mock data for demonstration
const mockPosts = [
  {
    id: '1',
    content: 'I\'ve been feeling really overwhelmed with my final year project. The deadline is approaching and I feel like I\'m not making enough progress. Sometimes I wonder if I\'m cut out for this program. Has anyone else felt this way?',
    topicTag: 'academic',
    author: {
      id: 'user-1',
      displayName: 'Anonymous Student',
      isAnonymous: true,
      isCounsellor: false
    },
    upvotes: 12,
    commentCount: 8,
    hasCounsellorComment: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    content: 'It\'s hard being away from home for the first time. I miss my family so much, especially during exam periods. I know I need to focus on my studies, but the homesickness is real. Any tips on coping?',
    topicTag: 'stress',
    author: {
      id: 'user-2',
      displayName: 'LonelyFreshman',
      isAnonymous: false,
      isCounsellor: false
    },
    upvotes: 24,
    commentCount: 15,
    hasCounsellorComment: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    content: 'Remember that imposter syndrome is common, especially among high-achieving students. The fact that you\'re here at KNUST shows you have what it takes. Let\'s schedule a session to discuss strategies for managing your workload and building confidence in your abilities.',
    topicTag: 'academic',
    author: {
      id: 'counsellor-1',
      displayName: 'Dr. Kwame Mensah',
      isAnonymous: false,
      isCounsellor: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=counsellor1'
    },
    upvotes: 45,
    commentCount: 3,
    hasCounsellorComment: false,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    content: 'I\'ve been struggling with making friends in my program. Everyone seems to already have their groups, and I feel left out. Social situations give me so much anxiety. Is this normal?',
    topicTag: 'relationships',
    author: {
      id: 'user-3',
      displayName: 'Anonymous Student',
      isAnonymous: true,
      isCounsellor: false
    },
    upvotes: 18,
    commentCount: 11,
    hasCounsellorComment: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    content: 'The pressure to succeed is so intense. My family has sacrificed so much for me to be here, and I feel like I can\'t let them down. But sometimes the weight of their expectations makes it hard to breathe.',
    topicTag: 'stress',
    author: {
      id: 'user-4',
      displayName: 'Anonymous Student',
      isAnonymous: true,
      isCounsellor: false
    },
    upvotes: 31,
    commentCount: 19,
    hasCounsellorComment: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const topics = ['all', 'stress', 'academic', 'relationships', 'grief', 'addiction', 'identity', 'trauma', 'other'];

export default function Feed() {
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [posts, setPosts] = useState(mockPosts);

  const handleNewPost = async (content: string, isPrivate: boolean) => {
    // Simulate AI moderation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In production, this would call your API
    const newPost = {
      id: `post-${Date.now()}`,
      content,
      topicTag: 'other', // Would be AI-assigned
      author: {
        id: 'current-user',
        displayName: 'Anonymous Student',
        isAnonymous: true,
        isCounsellor: false
      },
      upvotes: 0,
      commentCount: 0,
      hasCounsellorComment: false,
      createdAt: new Date().toISOString()
    };
    
    setPosts([newPost, ...posts]);
  };

  const filteredPosts = selectedTopic === 'all' 
    ? posts 
    : posts.filter(post => post.topicTag === selectedTopic);

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Topic Filter */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE] sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-[#006B3F]" />
                <h2 className="font-bold text-[#004D2C]">Filter by Topic</h2>
              </div>
              <div className="space-y-2">
                {topics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors capitalize ${
                      selectedTopic === topic
                        ? 'bg-[#006B3F] text-white'
                        : 'hover:bg-[#E8F5EE] text-gray-700'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {/* Online Counsellors */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-[#004D2C] mb-3">Online Counsellors</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#16A34A] rounded-full"></div>
                    <span className="text-sm text-gray-600">2 available now</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#004D2C]">Community Feed</h1>
                <p className="text-gray-600 mt-1">Share, connect, and support each other</p>
              </div>
              <Button
                onClick={() => setIsNewPostOpen(true)}
                className="bg-[#006B3F] hover:bg-[#004D2C] text-white gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Post</span>
              </Button>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-md p-12 border border-[#E8F5EE] text-center">
                  <p className="text-gray-500 mb-4">No posts in this category yet.</p>
                  <Button
                    onClick={() => setSelectedTopic('all')}
                    variant="outline"
                  >
                    View All Posts
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* New Post Modal */}
      <NewPostModal
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        onSubmit={handleNewPost}
      />
    </div>
  );
}
