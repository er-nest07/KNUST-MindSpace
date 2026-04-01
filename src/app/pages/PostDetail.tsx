import { useParams, Link } from "react-router";
import { ArrowLeft, ThumbsUp, Flag, Share2 } from "lucide-react";
import AnonymousAvatar from "../components/shared/AnonymousAvatar";
import CounsellorBadge from "../components/shared/CounsellorBadge";
import TopicTag from "../components/feed/TopicTag";
import CommentSection from "../components/feed/CommentSection";
import { Button } from "../components/ui/button";

// Mock data
const mockPost = {
  id: '1',
  content: 'I\'ve been feeling really overwhelmed with my final year project. The deadline is approaching and I feel like I\'m not making enough progress. Sometimes I wonder if I\'m cut out for this program. Has anyone else felt this way? I try to work on it every day but it feels like I\'m stuck. The literature review alone is taking so much longer than I expected. I\'m afraid to talk to my supervisor because I don\'t want them to think I\'m not capable.',
  topicTag: 'academic',
  author: {
    id: 'user-1',
    displayName: 'Anonymous Student',
    isAnonymous: true,
    isCounsellor: false
  },
  upvotes: 12,
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
};

const mockComments = [
  {
    id: 'comment-1',
    content: 'I totally understand what you\'re going through. I felt the same way during my final year. What helped me was breaking the project into smaller, manageable tasks. Also, your supervisor is there to help - they want you to succeed!',
    author: {
      id: 'user-5',
      displayName: 'Anonymous Student',
      isAnonymous: true,
      isCounsellor: false
    },
    upvotes: 8,
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment-2',
    content: 'This is a very common feeling, especially among final year students. What you\'re experiencing is called imposter syndrome, and it affects many high-achieving students. The fact that you were admitted to KNUST and have made it this far shows you have what it takes. I\'d like to help you develop some strategies for managing your workload and building confidence. Let\'s schedule a one-on-one session to discuss your specific concerns. In the meantime, please reach out to your supervisor - they\'re your advocate, not your judge.',
    author: {
      id: 'counsellor-1',
      displayName: 'Dr. Kwame Mensah',
      isAnonymous: false,
      isCounsellor: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=counsellor1'
    },
    upvotes: 24,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment-3',
    content: 'You got this! Final year is tough for everyone. Remember to take breaks and don\'t be too hard on yourself.',
    author: {
      id: 'user-6',
      displayName: 'HopefulEngineer',
      isAnonymous: false,
      isCounsellor: false
    },
    upvotes: 5,
    createdAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString()
  }
];

export default function PostDetail() {
  const { id } = useParams();

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 text-[#006B3F] hover:text-[#004D2C] mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Feed
        </Link>

        {/* Post */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#E8F5EE] mb-6">
          {/* Author Info */}
          <div className="flex items-start gap-3 mb-4">
            {mockPost.author.isAnonymous ? (
              <AnonymousAvatar seed={mockPost.author.id} size={48} />
            ) : (
              <img
                src={mockPost.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockPost.author.id}`}
                alt={mockPost.author.displayName}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-lg text-[#1A1A1A]">
                  {mockPost.author.displayName}
                </span>
                {mockPost.author.isCounsellor && <CounsellorBadge />}
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <TopicTag topic={mockPost.topicTag} />
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{formatTimeAgo(mockPost.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{mockPost.content}</p>
          </div>

          {/* Post Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <Button variant="outline" className="gap-2">
              <ThumbsUp className="w-4 h-4" />
              <span>{mockPost.upvotes}</span>
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="outline" className="gap-2 text-gray-500 hover:text-[#DC2626]">
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </Button>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#E8F5EE]">
          <h2 className="text-2xl font-bold text-[#004D2C] mb-6">
            Comments ({mockComments.length})
          </h2>
          <CommentSection postId={id || '1'} comments={mockComments} />
        </div>
      </div>
    </div>
  );
}
