import type { User, UserRole, VisibilityType } from '../context/AuthContext';

export interface DbProfile {
  id: string;
  email: string;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
  visibility: VisibilityType;
  pseudonym: string | null;
  is_verified_counsellor: boolean;
  counsellor_title: string | null;
  counsellor_bio: string | null;
  is_frozen: boolean;
  freeze_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPost {
  id: string;
  author_id: string;
  content: string;
  topic_tag: string;
  is_private: boolean;
  is_crisis: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface DbComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_flagged: boolean;
  created_at: string;
}

export interface DbConversation {
  id: string;
  student_id: string;
  counsellor_id: string;
  ai_summary: string | null;
  status: 'active' | 'ai_holding' | 'closed';
  created_at: string;
  last_message: string | null;
  last_message_at: string | null;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_ai: boolean;
  created_at: string;
}

export interface DbProgramme {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  checkin_frequency: string;
}

export interface DbEnrolment {
  id: string;
  student_id: string;
  counsellor_id: string;
  programme_id: string;
  custom_notes: string | null;
  status: 'active' | 'completed' | 'paused';
  enrolled_at: string;
  progress: number;
  total_days: number;
}

export function inferTopicTag(content: string): string {
  const text = content.toLowerCase();

  if (/exam|assignment|project|grade|study|school|academic/.test(text)) return 'academic';
  if (/stress|overwhelm|pressure|burnout|anxious|anxiety/.test(text)) return 'stress';
  if (/relationship|friend|partner|family|breakup/.test(text)) return 'relationships';
  if (/grief|loss|passed away|mourning/.test(text)) return 'grief';
  if (/addiction|drinking|alcohol|substance|withdrawal/.test(text)) return 'addiction';
  if (/identity|belong|imposter|self-esteem/.test(text)) return 'identity';
  if (/trauma|abuse|panic|flashback/.test(text)) return 'trauma';

  return 'other';
}

export function toUser(profile: DbProfile): User {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    is_anonymous: profile.role === 'student' && profile.visibility === 'anonymous',
    visibility: profile.visibility,
    pseudonym: profile.pseudonym,
    is_verified_counsellor: profile.is_verified_counsellor,
    counsellor_title: profile.counsellor_title,
    counsellor_bio: profile.counsellor_bio,
    is_frozen: profile.is_frozen,
    freeze_reason: profile.freeze_reason,
  };
}

export function getAuthorPresentation(profile: DbProfile | undefined) {
  if (!profile) {
    return {
      displayName: 'Community Member',
      isAnonymous: true,
      isCounsellor: false,
      avatarUrl: undefined as string | undefined,
    };
  }

  const isCounsellor = profile.role === 'counsellor' && profile.is_verified_counsellor;

  if (isCounsellor) {
    return {
      displayName: profile.display_name || profile.email,
      isAnonymous: false,
      isCounsellor: true,
      avatarUrl: profile.avatar_url || undefined,
    };
  }

  if (profile.visibility === 'identified') {
    return {
      displayName: profile.display_name || profile.email,
      isAnonymous: false,
      isCounsellor: false,
      avatarUrl: profile.avatar_url || undefined,
    };
  }

  if (profile.visibility === 'pseudonym' && profile.pseudonym) {
    return {
      displayName: profile.pseudonym,
      isAnonymous: false,
      isCounsellor: false,
      avatarUrl: undefined as string | undefined,
    };
  }

  return {
    displayName: 'Anonymous Student',
    isAnonymous: true,
    isCounsellor: false,
    avatarUrl: undefined as string | undefined,
  };
}
