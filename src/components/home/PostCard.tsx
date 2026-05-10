import { Link } from 'react-router'
import type { Post } from '@/types/post'

export default function PostCard({ post }: { post: Post }) {
  const date = new Date(post.date).toISOString().slice(0, 10)
  const category = post.tags?.[0]?.toUpperCase() ?? 'ESSAY'
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block -mx-4 px-4 py-4 rounded-[2px] no-underline text-ink transition-colors duration-200 hover:bg-jade-veil"
    >
      <div className="font-mono text-[0.7rem] tracking-meta uppercase text-ink-mute">
        <span>{date}</span>
        <span aria-hidden="true"> · </span>
        <span>{category}</span>
      </div>
      <h3 className="mt-2 mb-0 font-display font-normal text-[1.4rem] leading-snug text-ink">
        {post.title}
      </h3>
      {post.description && (
        <p className="mt-2 mb-0 max-w-[70ch] text-body-s text-ink-soft line-clamp-2">
          {post.description}
        </p>
      )}
      <span className="mt-3 inline-block font-mono text-[0.72rem] tracking-meta uppercase text-jade group-hover:text-jade-deep">
        Read →
      </span>
    </Link>
  )
}
