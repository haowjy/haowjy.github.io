import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Post } from '@/types/post'

type Props = {
  post: Post
  variant?: 'archive' | 'manuscript'
}

function NoteMeta({ post, variant }: { post: Post; variant: 'archive' | 'manuscript' }) {
  if (variant === 'manuscript') {
    const date = new Date(post.date).toISOString().slice(0, 10)
    const category = post.tags?.[0]?.toUpperCase() ?? 'ESSAY'
    return (
      <div className="font-mono text-[0.7rem] tracking-meta uppercase text-ink-mute flex flex-wrap gap-x-2 gap-y-0.5">
        <span>{date}</span>
        <span aria-hidden="true">·</span>
        <span>{category}</span>
        {post.readingTime != null && (
          <>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime} min</span>
          </>
        )}
      </div>
    )
  }

  return (
    <p className="archive__meta">
      <span className="archive__kind">Note</span>
      <span aria-hidden="true">·</span>
      <span>{post.date}</span>
      {post.readingTime != null && (
        <>
          <span aria-hidden="true">·</span>
          <span>{post.readingTime} min</span>
        </>
      )}
    </p>
  )
}

function NoteTitle({
  post,
  variant,
}: {
  post: Post
  variant: 'archive' | 'manuscript'
}) {
  if (variant === 'manuscript') {
    return (
      <h3 className="mt-1.5 mb-0 font-display font-normal text-[clamp(1.25rem,0.8vw+1rem,1.55rem)] leading-snug text-ink transition-colors group-hover:text-jade-deep">
        {post.title}
      </h3>
    )
  }

  return <h2 className="archive__entry-title">{post.title}</h2>
}

function NoteDek({ post, variant }: { post: Post; variant: 'archive' | 'manuscript' }) {
  const dek = post.description
  if (!dek) return null

  if (variant === 'manuscript') {
    return (
      <p className="mt-1.5 mb-0 max-w-[60ch] text-body-s text-ink-soft line-clamp-2">
        {dek}
      </p>
    )
  }

  return <p className="archive__entry-dek">{dek}</p>
}

function ArchiveArrow() {
  return (
    <span className="archive__entry-arrow" aria-hidden="true">
      <svg
        viewBox="0 0 16 16"
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    </span>
  )
}

export default function NoteListItem({ post, variant = 'archive' }: Props) {
  const linkClass =
    variant === 'manuscript'
      ? 'group block no-underline text-ink'
      : 'archive__link'

  const content: ReactNode = (
  <>
      <NoteMeta post={post} variant={variant} />
      <NoteTitle post={post} variant={variant} />
      <NoteDek post={post} variant={variant} />
    </>
  )

  if (variant === 'archive') {
    return (
      <Link to={`/notes/${post.slug}`} className={linkClass}>
        <div className="archive__item-main">{content}</div>
        <ArchiveArrow />
      </Link>
    )
  }

  return (
    <Link to={`/notes/${post.slug}`} className={linkClass}>
      {content}
    </Link>
  )
}
