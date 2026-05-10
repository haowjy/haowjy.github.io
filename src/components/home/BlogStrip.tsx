import type { Post } from '@/types/post'
import PostCard from './PostCard'

export default function BlogStrip({ posts }: { posts: Post[] }) {
  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  )
}
