interface TopicTagProps {
  topic: string;
}

const topicColors: Record<string, { bg: string; text: string }> = {
  stress: { bg: 'bg-orange-100', text: 'text-orange-700' },
  grief: { bg: 'bg-purple-100', text: 'text-purple-700' },
  addiction: { bg: 'bg-red-100', text: 'text-red-700' },
  relationships: { bg: 'bg-pink-100', text: 'text-pink-700' },
  academic: { bg: 'bg-blue-100', text: 'text-blue-700' },
  identity: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  trauma: { bg: 'bg-gray-100', text: 'text-gray-700' },
  other: { bg: 'bg-green-100', text: 'text-green-700' }
};

export default function TopicTag({ topic }: TopicTagProps) {
  const colors = topicColors[topic] || topicColors.other;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
      {topic}
    </span>
  );
}
