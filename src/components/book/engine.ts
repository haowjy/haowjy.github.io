import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import html2canvas from 'html2canvas-pro'
import {
  CanvasTexture,
  ColorManagement,
  DoubleSide,
  Group,
  LinearMipmapLinearFilter,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
  type Texture,
} from 'three'
import type { BookMode, BookPage } from './types'

/**
 * The homepage book, drawn in WebGL and driven by page scroll.
 *
 * Everything on screen is a function of one number, `p` ∈ [0, N]: the
 * opening the book is at (0 = closed on the front cover, N = closed on
 * the back). One stage height of scroll turns one leaf. ScrollTrigger
 * scrubs `p` and snaps to whole openings; buttons, keys, and contents
 * links scroll the page to an opening, so every input goes through the
 * same path.
 *
 * Pages are HTML (rendered by React into `sources`), rasterized once
 * into textures. At rest the real HTML spread sits exactly on top of
 * the drawn one with transparent ink, so links and text selection work
 * on what you see.
 */

gsap.registerPlugin(ScrollTrigger)
// Page textures are already sRGB and the shaders do their own shading:
// pass colors through untouched.
ColorManagement.enabled = false

export type BookLayout = {
  mode: BookMode
  /** Page size in px. */
  W: number
  H: number
  /** Scroll distance of one turn, in px. */
  step: number
  /** Narrow screens: how far the camera moves right to sit on the right page. */
  panX: number
}

export type EngineOptions = {
  canvas: HTMLCanvasElement
  track: HTMLElement
  stage: HTMLElement
  /** The at-rest HTML spread. React renders its pages; the engine places it. */
  rest: HTMLElement
  /** One element per page, in page order, for the textures. */
  sources: HTMLElement
  pages: BookPage[]
  layout: BookLayout
  reduced: boolean
  /** Opening to start at. */
  initial: number
  /** The pages that should be in the at-rest spread changed. */
  onSpread: (left: number, right: number) => void
  /** The nearest opening changed. */
  onOpening: (opening: number) => void
}

export type Engine = {
  go: (opening: number) => void
  destroy: () => void
}

const PI = Math.PI
/** Vertical nudge so the book clears the top bar. */
const NUDGE = 14

const easeInOut = (t: number) => 0.5 - 0.5 * Math.cos(PI * t)

// Each row of the sheet is an arc that starts at the spine with angle uA
// and ends at the fore-edge with angle uTip (plus a lead for the bottom
// corner). Arc length is preserved and the spine edge never moves, so the
// page stays bound. Covers use uTip == uA: a rigid hinged board.
const LEAF_VERT = /* glsl */ `
  uniform float uA, uTip, uLead, uH, uLen;
  varying vec2 vQ; varying float vB;
  void main() {
    float s = position.x, y = position.y;
    float tip = clamp(uTip + uLead * (-y / uH), 0.0, 3.14159265);
    float b = (tip - uA) / uLen, beta = uA + b * s;
    vec3 pos = abs(b) < 1e-6 ? vec3(s * cos(uA), y, s * sin(uA))
                             : vec3((sin(beta) - sin(uA)) / b, y, (cos(uA) - cos(beta)) / b);
    vQ = position.xy; vB = beta;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }`

const LEAF_FRAG = /* glsl */ `
  uniform sampler2D uFront, uBack; uniform float uW, uH, uA, uRigid; uniform vec3 uCloth;
  varying vec2 vQ; varying float vB;
  void main() {
    vec2 uv = vec2(vQ.x / uW, vQ.y / uH + 0.5);
    // Boards overhang the pages: cloth there.
    bool inPage = uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0;
    vec3 c = !inPage ? uCloth
      : gl_FrontFacing ? texture2D(uFront, uv).rgb : texture2D(uBack, vec2(1.0 - uv.x, uv.y)).rgb;
    float light = 0.6 + 0.4 * abs(cos(vB));            // edge-on paper catches less light
    float sheen = pow(max(0.0, sin(vB)), 8.0) * 0.08;
    // The binding shadow travels with the sheet: full while it lies flat,
    // gone while it stands up. A board's outside never gets it.
    float gw = abs(cos(uA)) * (gl_FrontFacing ? 1.0 - uRigid : 1.0);
    c *= mix(1.0, 0.8 + 0.2 * smoothstep(0.0, 0.14 * uW, vQ.x), gw);
    gl_FragColor = vec4(c * light + sheen, 1.0);
  }`

const FLAT_VERT = /* glsl */ `
  varying vec2 vUv; varying vec2 vQ; uniform float uOff;
  void main() {
    vUv = uv; vQ = position.xy + vec2(uOff, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`

const FLAT_FRAG = /* glsl */ `
  uniform sampler2D uTex; uniform float uRight, uS, uExt, uGutter;
  varying vec2 vUv; varying vec2 vQ;
  void main() {
    vec3 c = texture2D(uTex, vUv).rgb;
    float g = uRight > 0.5 ? vUv.x : 1.0 - vUv.x;      // the page curves down into the binding
    c *= mix(1.0, 0.8 + 0.2 * smoothstep(0.0, 0.14, g), uGutter);
    float x = abs(vQ.x);                                // shadow of the lifted sheet, under its footprint
    c *= 1.0 - uS * (uRight > 0.5 ? 0.42 : 0.3) * (1.0 - smoothstep(0.0, uExt * 1.15 + 1.0, x));
    gl_FragColor = vec4(c, 1.0);
  }`

const CLOTH = 0x23402f
const CLOTH_DARK = 0x1a3022

function hexVec(hex: number) {
  return new Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255)
}

/** Horizontal reach of the arc on each side of the spine (middle row), for cast shadows. */
function reach(a: number, tip: number, len: number): [number, number] {
  let r = 0
  let l = 0
  for (let i = 1; i <= 16; i++) {
    const sv = (len * i) / 16
    const b = (tip - a) / len
    const beta = a + b * sv
    const x = Math.abs(b) < 1e-6 ? sv * Math.cos(a) : (Math.sin(beta) - Math.sin(a)) / b
    r = Math.max(r, x)
    l = Math.max(l, -x)
  }
  return [r, l]
}

/** The opening at which page `i` is visible. */
export const openingOf = (i: number) => Math.ceil(i / 2)

export function createEngine(o: EngineOptions): Engine {
  const { canvas, track, stage, rest, sources, pages, layout, reduced } = o
  const { W, H, step, panX } = layout
  const N = Math.ceil(pages.length / 2)
  /** Page-block thickness when all leaves are on one side. */
  const T = Math.max(4, Math.round(W * 0.022))
  const boardM = T + 6

  let p = 0
  let camX = 0
  let dir = 1
  let destroyed = false
  let texReady = false
  const tex: (Texture | undefined)[] = []

  /* ---------- scene ---------- */

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.outputColorSpace = LinearSRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  const scene = new Scene()
  const camera = new PerspectiveCamera(22, 1, 1, 20000)
  const book = new Group()
  scene.add(book)

  const leafMat = new ShaderMaterial({
    side: DoubleSide,
    uniforms: {
      uFront: { value: null },
      uBack: { value: null },
      uA: { value: 0 },
      uTip: { value: 0 },
      uLead: { value: 0 },
      uW: { value: W },
      uH: { value: H },
      uLen: { value: W },
      uRigid: { value: 0 },
      uCloth: { value: hexVec(CLOTH) },
    },
    vertexShader: LEAF_VERT,
    fragmentShader: LEAF_FRAG,
  })

  const flatMat = (isRight: boolean) =>
    new ShaderMaterial({
      uniforms: {
        uTex: { value: null },
        uGutter: { value: 1 },
        uS: { value: 0 },
        uExt: { value: 0 },
        uOff: { value: isRight ? W / 2 : -W / 2 },
        uRight: { value: isRight ? 1 : 0 },
      },
      vertexShader: FLAT_VERT,
      fragmentShader: FLAT_FRAG,
    })

  const leafGeo = new PlaneGeometry(W, H, 120, 40)
  leafGeo.translate(W / 2, 0, 0)
  const leaf = new Mesh(leafGeo, leafMat)
  leaf.position.z = 0.5

  const boardGeo = new PlaneGeometry(W + boardM, H + 2 * boardM, 1, 1)
  boardGeo.translate((W + boardM) / 2, 0, 0)
  const board = new Mesh(boardGeo, leafMat)
  board.position.z = 1

  const left = new Mesh(new PlaneGeometry(W, H), flatMat(false))
  left.position.set(-W / 2, 0, 0)
  const right = new Mesh(new PlaneGeometry(W, H), flatMat(true))
  right.position.set(W / 2, 0, 0)

  // Soft contact shadow under the book.
  const sc = document.createElement('canvas')
  sc.width = sc.height = 64
  const sg = sc.getContext('2d')!
  const grd = sg.createRadialGradient(32, 32, 4, 32, 32, 32)
  grd.addColorStop(0, 'rgba(0,0,0,.5)')
  grd.addColorStop(1, 'rgba(0,0,0,0)')
  sg.fillStyle = grd
  sg.fillRect(0, 0, 64, 64)
  const shadow = new Mesh(
    new PlaneGeometry(1, 1),
    new MeshBasicMaterial({ map: new CanvasTexture(sc), transparent: true, depthWrite: false }),
  )
  shadow.position.z = -2

  // Hardcover: cloth boards and a spine under the pages.
  const cloth = new MeshBasicMaterial({ color: CLOTH })
  const clothDark = new MeshBasicMaterial({ color: CLOTH_DARK })
  const boardL = new Mesh(new PlaneGeometry(W + boardM, H + 2 * boardM), cloth)
  boardL.position.set(-(W + boardM) / 2, 0, -4)
  const boardR = new Mesh(new PlaneGeometry(W + boardM, H + 2 * boardM), cloth)
  boardR.position.set((W + boardM) / 2, 0, -4)
  const spine = new Mesh(new PlaneGeometry(18, H + 2 * boardM + 2), clothDark)
  spine.position.set(0, 0, -3.5)

  // Page block: fine lines of paper edges beside and below each stack.
  const ec = document.createElement('canvas')
  ec.width = 16
  ec.height = 64
  const eg = ec.getContext('2d')!
  for (let y = 0; y < 64; y++) {
    eg.fillStyle = y % 2 ? '#e6e1d4' : '#cfc9ba'
    eg.fillRect(0, y, 16, 1)
  }
  const edgeTex = new CanvasTexture(ec)
  edgeTex.wrapS = edgeTex.wrapT = RepeatWrapping
  const edgeTexV = edgeTex.clone()
  edgeTexV.rotation = PI / 2
  edgeTexV.needsUpdate = true
  const edgeMat = new MeshBasicMaterial({ map: edgeTex })
  const edgeMatV = new MeshBasicMaterial({ map: edgeTexV })
  const unit = new PlaneGeometry(1, 1)
  const blockR = new Mesh(unit, edgeMatV)
  const blockRb = new Mesh(unit, edgeMat)
  const blockL = new Mesh(unit, edgeMatV)
  const blockLb = new Mesh(unit, edgeMat)
  ;[blockR, blockRb, blockL, blockLb].forEach((b) => (b.position.z = -1))

  book.add(shadow, boardL, boardR, spine, blockL, blockLb, blockR, blockRb, left, right, leaf, board)
  book.position.y = -NUDGE

  function sizeGL() {
    const w = stage.clientWidth
    const h = stage.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // One world unit is one CSS pixel at z = 0, so the HTML layer lines up.
    camera.position.set(0, 0, h / 2 / Math.tan((11 * PI) / 180))
    camera.updateProjectionMatrix()
  }
  sizeGL()

  /* ---------- textures ---------- */

  const sourceEls = () => [...sources.children] as HTMLElement[]

  async function bakeOne(i: number) {
    const el = sourceEls()[i]
    if (!el) return
    const c = await html2canvas(el, {
      scale: Math.min(window.devicePixelRatio, 2),
      backgroundColor: null,
      logging: false,
    })
    if (destroyed) return
    const t = new CanvasTexture(c)
    t.anisotropy = renderer.capabilities.getMaxAnisotropy()
    t.minFilter = LinearMipmapLinearFilter
    tex[i]?.dispose()
    tex[i] = t
  }

  async function bakeAll() {
    await document.fonts.ready
    // The spread you're looking at first, then outward from it.
    const here = 2 * Math.round(p)
    const order = pages.map((_, i) => i).sort((a, b) => Math.abs(a - here) - Math.abs(b - here))
    for (const i of order) {
      if (destroyed) return
      await bakeOne(i)
    }
    if (destroyed) return
    texReady = true
    draw()
  }

  // Live data (GitHub stars) can change a page after it was baked.
  let dirty = new Set<number>()
  let rebake: ReturnType<typeof setTimeout> | undefined
  const observer = new MutationObserver((records) => {
    const els = sourceEls()
    for (const r of records) {
      const i = els.findIndex((el) => el.contains(r.target))
      if (i >= 0) dirty.add(i)
    }
    clearTimeout(rebake)
    rebake = setTimeout(async () => {
      if (!texReady) return // the first bake will pick it up
      const todo = dirty
      dirty = new Set()
      for (const i of todo) await bakeOne(i)
      draw()
    }, 250)
  })
  observer.observe(sources, { subtree: true, childList: true, characterData: true })

  /* ---------- drawing ---------- */

  const texOf = (i: number) => (i >= 0 && i < pages.length ? tex[i] ?? null : null)
  const isBoard = (i: number) => pages[i]?.kind === 'cover' || pages[i]?.kind === 'back'

  // A paper leaf: the fore-edge leads (lifted by the corner) and the
  // spine side catches up late.
  const pageTurn = (t: number) => ({
    a: PI * t * t,
    tip: PI * (1 - (1 - t) * (1 - t)),
    lead: 0.35 * Math.sin(PI * t),
    len: W,
  })
  // A board: one rigid angle.
  const coverTurn = (t: number) => {
    const a = PI * easeInOut(t)
    return { a, tip: a, lead: 0, len: W + boardM }
  }

  const setBlock = (side: 1 | -1, e: number, on: boolean) => {
    const [v, b] = side > 0 ? [blockR, blockRb] : [blockL, blockLb]
    v.visible = b.visible = on && e > 0.5
    v.scale.set(e, H + e, 1)
    v.position.set(side * (W + e / 2), -e / 2, -1)
    b.scale.set(W, e, 1)
    b.position.set((side * W) / 2, -H / 2 - e / 2, -1)
  }

  let spread = ''
  let opening = -1

  function draw() {
    if (destroyed) return
    let k = Math.floor(p)
    let t = p - k
    if (k >= N) {
      k = N - 1
      t = 1
    }
    if (reduced) t = t < 0.5 ? 0 : 1
    const turning = t > 0.001 && t < 0.999
    const r = Math.round(p)

    // Which page images are where.
    const L = turning ? 2 * k - 1 : 2 * r - 1
    const R = turning ? 2 * k + 2 : 2 * r
    const F = 2 * k
    const B = 2 * k + 1

    // A closed book sits centred; the camera pans only while a board turns.
    const shift = (-W / 2) * (1 - Math.min(1, p)) + (W / 2) * Math.max(0, p - (N - 1))
    book.position.x = shift - camX

    // Boards show once a cover lies on that side; the page blocks thin
    // out on the right and grow on the left as leaves move across.
    boardL.visible = p >= 0.999
    boardR.visible = p <= N - 0.999
    spine.visible = boardL.visible && boardR.visible
    const inner = Math.max(1, N - 2)
    const turned = Math.min(inner, Math.max(0, p - 1))
    setBlock(1, (T * (inner - turned)) / inner, p > 0.02 && p < N - 0.5)
    setBlock(-1, (T * turned) / inner, p > 0.5 && p < N - 0.02)

    // The HTML spread: crisp before the textures exist, then an invisible
    // layer for links and selection. Hidden mid-turn.
    const atRest = !turning && Math.abs(p - r) < 0.002
    rest.classList.toggle('is-off', texReady && !atRest)
    rest.classList.toggle('is-ghost', texReady)
    const key = `${L}|${R}`
    if (key !== spread) {
      spread = key
      o.onSpread(L, R)
    }
    rest.style.transform = `translate(${book.position.x - W}px, ${-H / 2 + NUDGE}px)`
    if (atRest && r !== opening) {
      opening = r
      o.onOpening(r)
    }

    if (!texReady) {
      renderer.clear()
      return
    }

    const ul = left.material.uniforms
    const ur = right.material.uniforms
    left.visible = !!texOf(L)
    right.visible = !!texOf(R)
    ul.uTex.value = texOf(L)
    ur.uTex.value = texOf(R)
    ul.uGutter.value = isBoard(L) ? 0 : 1
    ur.uGutter.value = isBoard(R) ? 0 : 1

    const rigid = turning && (k === 0 || k === N - 1)
    leaf.visible = turning && !rigid
    board.visible = rigid
    const tt = turning ? (rigid ? coverTurn(t) : pageTurn(t)) : { a: 0, tip: 0, lead: 0, len: W }
    const u = leafMat.uniforms
    u.uRigid.value = rigid ? 1 : 0
    u.uA.value = tt.a
    u.uTip.value = tt.tip
    u.uLead.value = tt.lead
    u.uLen.value = tt.len
    if (turning) {
      u.uFront.value = texOf(F)
      u.uBack.value = texOf(B)
    }
    const [er, el] = reach(tt.a, tt.tip, tt.len)
    const sh = turning ? Math.sin(PI * t) : 0
    ur.uS.value = sh
    ur.uExt.value = er
    ul.uS.value = sh
    ul.uExt.value = el

    // Contact shadow spans whatever is lying down.
    const lOn = left.visible || (turning && t > 0.5)
    const rOn = right.visible || turning
    const x0 = lOn ? -W : 0
    const x1 = rOn ? W : 0
    shadow.visible = x1 > x0
    shadow.scale.set((x1 - x0) * 1.12, H * 1.1, 1)
    shadow.position.set((x0 + x1) / 2, -10, -2)

    renderer.render(scene, camera)
  }

  function apply(v: number) {
    p = Math.max(0, Math.min(N, v))
    camX = panX * Math.min(1, p) * (1 - Math.max(0, p - (N - 1)))
  }

  /* ---------- scroll: scrub and snap ---------- */

  // The track is N turns of scroll plus one screen for the sticky stage.
  // `lvh` so the last opening stays reachable when a phone's toolbar hides.
  track.style.height = `calc(${N * step}px + 100lvh)`

  const st = ScrollTrigger.create({
    trigger: track,
    start: 'top top',
    end: () => `+=${N * step}`,
    onUpdate: (self) => {
      dir = self.direction || dir
      apply(self.progress * N)
      draw()
    },
    snap: {
      // On an opening: stay. Otherwise commit in the scroll direction
      // once past 12% of a turn.
      snapTo: (v: number) => {
        const x = v * N
        const f = x - Math.floor(x)
        if (f < 0.01 || f > 0.99) return Math.round(x) / N
        const k =
          dir > 0 ? (f > 0.12 ? Math.ceil(x) : Math.floor(x)) : f < 0.88 ? Math.floor(x) : Math.ceil(x)
        return k / N
      },
      duration: reduced ? 0 : { min: 0.3, max: 0.8 },
      delay: 0.08,
      ease: 'power1.inOut',
    },
  })

  const scrollFor = (k: number) => st.start + k * step

  // Long jumps riffle through the pages instead of cutting.
  let tween: gsap.core.Tween | undefined
  function go(target: number) {
    const k = Math.max(0, Math.min(N, target))
    const to = scrollFor(k)
    tween?.kill()
    if (reduced) {
      window.scrollTo(0, to)
      return
    }
    const s = { y: window.scrollY }
    tween = gsap.to(s, {
      y: to,
      duration: Math.min(2.4, 0.7 + 0.28 * Math.abs(k - p)),
      ease: 'power2.inOut',
      onUpdate: () => window.scrollTo(0, s.y),
    })
  }

  const stopTween = () => tween?.kill()
  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return
    const el = e.target as HTMLElement | null
    if (el?.closest('input, textarea, select, [contenteditable]')) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(Math.round(p) + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(Math.round(p) - 1)
    }
  }
  window.addEventListener('wheel', stopTween, { passive: true })
  window.addEventListener('touchstart', stopTween, { passive: true })
  window.addEventListener('keydown', onKey)

  const onResize = () => {
    sizeGL()
    draw()
  }
  window.addEventListener('resize', onResize)

  ScrollTrigger.refresh()
  window.scrollTo(0, scrollFor(Math.max(0, Math.min(N, o.initial))))
  apply(o.initial)
  draw()
  void bakeAll()

  return {
    go,
    destroy() {
      destroyed = true
      tween?.kill()
      st.kill()
      observer.disconnect()
      clearTimeout(rebake)
      window.removeEventListener('wheel', stopTween)
      window.removeEventListener('touchstart', stopTween)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      tex.forEach((t) => t?.dispose())
      book.traverse((m) => {
        if (m instanceof Mesh) {
          m.geometry.dispose()
          const mat = m.material as MeshBasicMaterial
          mat.map?.dispose()
          mat.dispose()
        }
      })
      edgeTexV.dispose()
      renderer.dispose()
      track.style.height = ''
    },
  }
}
