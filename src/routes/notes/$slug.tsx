import { useMemo } from 'react'
import { useParams } from 'react-router'
import { mdxComponents } from '@/components/mdx/components'
import PostLayout from '@/components/notes/PostLayout'
import { posts } from '@/content/notes'

const NOT_FOUND_POST = {
  title: 'Not found',
  slug: 'not-found',
  date: '',
  tags: [] as string[],
  description: "That note isn't in the archive.",
  readingTime: 0,
}

export default function NotesPostRoute() {
  const { slug } = useParams()

  const ctx = useMemo(() => {
    const idx = posts.findIndex((entry) => entry.slug === slug)
    if (idx === -1) return null
    const olderIdx = idx + 1
    const newerIdx = idx - 1
    const older = olderIdx < posts.length ? posts[olderIdx] : undefined
    const newer = newerIdx >= 0 ? posts[newerIdx] : undefined
    return {
      post: posts[idx],
      prev: older ? { slug: older.slug, title: older.title } : undefined,
      next: newer ? { slug: newer.slug, title: newer.title } : undefined,
    }
  }, [slug])

  if (!ctx) {
    return <PostLayout post={NOT_FOUND_POST} />
  }

  const PostComponent = ctx.post.Component

  return (
    <PostLayout post={ctx.post} prev={ctx.prev} next={ctx.next}>
      <PostComponent components={mdxComponents} />
    </PostLayout>
  )
}
