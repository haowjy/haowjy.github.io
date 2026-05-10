import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import PostLayout from '@/components/blog/PostLayout'
import {
  BarChart,
  Callout,
  ComparisonBlock,
  CostRamp,
  DataTable,
  StatHero,
} from '@/components/viz'
import { posts } from '@/content/blog'

const mdxComponents = {
  StatHero,
  BarChart,
  ComparisonBlock,
  DataTable,
  Callout,
  CostRamp,
}

export default function WritingPostRoute() {
  const { slug } = useParams()

  const post = useMemo(() => posts.find((entry) => entry.slug === slug), [slug])

  if (!post) {
    return (
      <main>
        <h1>Post not found</h1>
        <p>
          <Link to="/blog">Return to Blog</Link>
        </p>
      </main>
    )
  }

  const PostComponent = post.Component

  return (
    <PostLayout post={post}>
      <PostComponent components={mdxComponents} />
    </PostLayout>
  )
}
