/**
 * Hand-authored About prose. JSX so we can keep inline anchors without
 * escaping them in a string.
 *
 * Kept short on purpose: a single 85vh page holds it. Content overflow
 * is an editorial signal to cut, not a system signal to paginate.
 */
export function AboutBody() {
  return (
    <>
      <p>
        I&rsquo;m a software engineer focused on applying AI and LLMs 
        to the real world.
      </p>
      <p>
        Right now I&rsquo;m at Epic Systems building production 
        LLM summary workflows for clinical chart review across 100+ hospitals.
      </p>
      <p>
        In my free time, I&rsquo;m building meridian-cli, an open-source
        agent orchestration engine that decomposes workflows across
        specialized agents, models, and harnesses.
      </p>
      <p>
        Away from the keyboard: tennis, the great outdoors when I can get
        out into it, and the firm position that Roronoa Zoro is the GOAT.
      </p>
    </>
  )
}
