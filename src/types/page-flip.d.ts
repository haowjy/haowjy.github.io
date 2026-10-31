declare module 'page-flip' {
  export type FlipCorner = 'top' | 'bottom'
  export type PageFlipSettings = {
    width: number
    height: number
    size?: 'fixed' | 'stretch'
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    startPage?: number
    drawShadow?: boolean
    flippingTime?: number
    usePortrait?: boolean
    startZIndex?: number
    autoSize?: boolean
    maxShadowOpacity?: number
    showCover?: boolean
    mobileScrollSupport?: boolean
    swipeDistance?: number
    clickEventForward?: boolean
    useMouseEvents?: boolean
    showPageCorners?: boolean
    disableFlipByClick?: boolean
  }
  export type PageFlipEvent<T = unknown> = { data: T; object: PageFlip }
  export class PageFlip {
    constructor(element: HTMLElement, settings: PageFlipSettings)
    loadFromHTML(items: HTMLElement[] | NodeListOf<HTMLElement>): void
    destroy(): void
    update(): void
    flip(page: number, corner?: FlipCorner): void
    flipNext(corner?: FlipCorner): void
    flipPrev(corner?: FlipCorner): void
    turnToPage(page: number): void
    getCurrentPageIndex(): number
    getPageCount(): number
    getOrientation(): 'portrait' | 'landscape'
    /** Drag API (block-relative px). Used by our own touch handling. */
    startUserTouch(pos: { x: number; y: number }): void
    userMove(pos: { x: number; y: number }, isTouch: boolean): void
    userStop(pos: { x: number; y: number }, isSwipe?: boolean): void
    getRender(): {
      getRect(): { left: number; top: number; width: number; height: number; pageWidth: number }
      getOrientation(): 'portrait' | 'landscape'
    }
    on(event: 'flip', cb: (e: PageFlipEvent<number>) => void): PageFlip
    on(event: 'changeOrientation', cb: (e: PageFlipEvent<string>) => void): PageFlip
    on(event: 'changeState', cb: (e: PageFlipEvent<string>) => void): PageFlip
    on(event: 'init', cb: (e: PageFlipEvent<{ page: number; mode: string }>) => void): PageFlip
  }
}
