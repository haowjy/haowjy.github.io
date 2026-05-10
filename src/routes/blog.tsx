import '../styles/home.css'
import SectionCard from '@/components/home/SectionCard'
import PostCard from '@/components/home/PostCard'
import { posts } from '@/content/blog'

export default function WritingRoute() {
  return (
    <div className="text-ink flex flex-col gap-12 max-md:gap-6">
      <SectionCard id="writing-index" pageNumber="1" ariaLabelledBy="writing-index-title">
        <h1
          id="writing-index-title"
          className="m-0 font-display font-normal text-display-l leading-tight tracking-display text-ink"
        >
          Writing
        </h1>
        <div className="flex flex-col">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
