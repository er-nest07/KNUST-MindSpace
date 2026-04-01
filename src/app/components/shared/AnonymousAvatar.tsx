interface AnonymousAvatarProps {
  seed: string;
  size?: number;
  className?: string;
}

export default function AnonymousAvatar({ seed, size = 40, className = '' }: AnonymousAvatarProps) {
  // Using DiceBear API with avataaars style
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  
  return (
    <img
      src={avatarUrl}
      alt="Anonymous Avatar"
      width={size}
      height={size}
      className={`rounded-full bg-gray-200 ${className}`}
    />
  );
}
