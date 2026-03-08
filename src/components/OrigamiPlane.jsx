import { useEffect, useRef } from 'react'

/**
 * OrigamiPlane
 * A canvas-based animation that:
 *  1. Shows the "card" as a white rectangle
 *  2. Folds the top-left & bottom-left corners inward → making a pointed nose
 *  3. Folds the plane in half (bottom half flips up)
 *  4. The plane shrinks, tilts, and zooms off to the right with a gradient trail
 *
 * Props:
 *  x, y      – position of the card (page-level absolute)
 *  w, h      – card width/height
 *  onDone()  – called when the animation finishes
 */
export default function OrigamiPlane({ x, y, w, h, onDone }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        // DPR support
        const dpr = window.devicePixelRatio || 1
        canvas.width = window.innerWidth * dpr
        canvas.height = window.innerHeight * dpr
        canvas.style.width = window.innerWidth + 'px'
        canvas.style.height = window.innerHeight + 'px'
        ctx.scale(dpr, dpr)

        const W = window.innerWidth
        const H = window.innerHeight

        // Card coords (local copy so we can mutate)
        let cx = x, cy = y, cw = w, ch = h

        // ---- helpers ----
        function lerp(a, b, t) { return a + (b - a) * t }
        function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

        // Draw the card body (rectangle)
        function drawCard(x, y, w, h, alpha) {
            ctx.save()
            ctx.globalAlpha = alpha
            ctx.fillStyle = '#ffffff'
            ctx.strokeStyle = '#d1d5db' // light gray border
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.roundRect(x, y, w, h, 8)
            ctx.fill()
            ctx.stroke()
            ctx.restore()
        }

        // Draw the classic paper airplane shape
        function drawPlane(cx, cy, sw, sh, angle, alpha) {
            ctx.save()
            ctx.globalAlpha = alpha
            ctx.translate(cx, cy)
            ctx.rotate(angle)

            ctx.lineWidth = 2.5
            ctx.strokeStyle = '#1f2937' // dark slate
            ctx.lineJoin = 'round'
            ctx.lineCap = 'round'

            // Main body
            ctx.beginPath()
            ctx.moveTo(sw * 0.5, 0)          // Nose tip (right)
            ctx.lineTo(-sw * 0.5, -sh * 0.4) // Top wing
            ctx.lineTo(-sw * 0.3, 0)         // Back center indent
            ctx.lineTo(-sw * 0.5, sh * 0.4)  // Bottom wing tip
            ctx.closePath()
            ctx.fillStyle = '#ffffff'
            ctx.fill()
            ctx.stroke()

            // Left inner fold (visible flap)
            ctx.beginPath()
            ctx.moveTo(sw * 0.5, 0)          // Nose tip
            ctx.lineTo(-sw * 0.3, 0)         // Back center indent
            ctx.lineTo(-sw * 0.4, sh * 0.2)  // Bottom inner flap
            ctx.closePath()
            ctx.fillStyle = '#f3f4f6'        // slight shadow for depth
            ctx.fill()
            ctx.stroke()

            // Center crease
            ctx.beginPath()
            ctx.moveTo(sw * 0.5, 0)
            ctx.lineTo(-sw * 0.3, 0)
            ctx.stroke()

            ctx.restore()
        }

        // Draw trailing gradient line behind plane
        function drawTrail(x1, y1, x2, y2, alpha) {
            if (alpha <= 0) return
            ctx.save()
            const grad = ctx.createLinearGradient(x2, y2, x1, y1)
            grad.addColorStop(0, `rgba(156,163,175,${alpha * 0.8})`)
            grad.addColorStop(0.5, `rgba(209,213,219,${alpha * 0.4})`)
            grad.addColorStop(1, `rgba(229,231,235,0)`)
            ctx.strokeStyle = grad
            ctx.lineWidth = 3
            ctx.lineCap = 'round'
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
            ctx.restore()
        }

        // ---- Animation Timeline ----
        const TOTAL = 2200 // ms

        let startTime = null
        let trailPoints = []
        let rafId

        function frame(now) {
            if (!startTime) startTime = now
            const elapsed = now - startTime
            const t = Math.min(elapsed / TOTAL, 1)

            ctx.clearRect(0, 0, W, H)

            if (t < 0.2) {
                // Phase 1 — corners fold inward to make a triangle tip on left
                const p = ease(t / 0.2)

                ctx.save()
                drawCard(cx, cy, cw, ch, 1)

                const foldX = lerp(0, ch * 0.5, p)

                // Top-left flap folding down
                ctx.fillStyle = `rgba(243,244,246,${p})` // shadow
                ctx.strokeStyle = `rgba(209,213,219,${p})`
                ctx.lineWidth = 1.5
                ctx.beginPath()
                ctx.moveTo(cx, cy)
                ctx.lineTo(cx + foldX, cy + foldX)
                ctx.lineTo(cx, cy + foldX * 2)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()

                // Bottom-left flap folding up
                ctx.beginPath()
                ctx.moveTo(cx, cy + ch)
                ctx.lineTo(cx + foldX, cy + ch - foldX)
                ctx.lineTo(cx, cy + ch - foldX * 2)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()

                ctx.restore()
            } else if (t < 0.35) {
                // Phase 2 — fold straight to the right
                const p = ease((t - 0.2) / 0.15)

                const currentWidth = lerp(cw, cw * 0.4, p)
                const currentLeft = lerp(cx, cx + cw * 0.3, p)

                // Card is getting narrower, acting like it's folding over
                drawCard(currentLeft, cy, currentWidth, ch, 1)

                // Draw a crease line indicating the fold
                ctx.beginPath()
                ctx.moveTo(currentLeft + currentWidth * 0.2, cy)
                ctx.lineTo(currentLeft + currentWidth * 0.2, cy + ch)
                ctx.strokeStyle = `rgba(209, 213, 219, ${p})`
                ctx.stroke()
            } else if (t < 0.5) {
                // Phase 3 — fold back and reveal plane
                const p = ease((t - 0.35) / 0.15)

                const planeCx = cx + cw * 0.5
                const planeCy = cy + ch * 0.5

                // Morphing from a thick stub to the plane shape
                const sw = lerp(cw * 0.4, cw * 0.5, p)
                const sh = lerp(ch, ch * 0.4, p)

                // Crossfade alpha between folded card stub and plane
                const cardAlpha = Math.max(0, 1 - p * 2)
                if (cardAlpha > 0) {
                    drawCard(cx + cw * 0.3, cy + ch * (1 - p) / 2, cw * 0.4, ch * (1 - p), cardAlpha)
                }

                if (p > 0.2) {
                    drawPlane(planeCx, planeCy, sw, sh, -0.05 * p, (p - 0.2) / 0.8)
                }
            } else {
                // Phase 4 — fly away (0.5 to 1.0)
                const p = ease((t - 0.5) / 0.5)

                const startX = cx + cw * 0.5
                const startY = cy + ch * 0.5
                const endX = W + 300
                const endY = startY - 200

                const planeX = lerp(startX, endX, p)
                const planeY = lerp(startY, endY, p) - Math.sin(p * Math.PI) * 80
                const angle = lerp(-0.05, -0.3, p)
                const scale = lerp(1, 0.5, p)
                const alpha = p < 0.85 ? 1 : 1 - (p - 0.85) / 0.15

                trailPoints.push({ x: planeX, y: planeY, t: now })
                trailPoints = trailPoints.filter(pt => now - pt.t < 600)
                if (trailPoints.length > 1) {
                    for (let i = 1; i < trailPoints.length; i++) {
                        const ta = (i - 1) / trailPoints.length
                        drawTrail(
                            trailPoints[i - 1].x, trailPoints[i - 1].y,
                            trailPoints[i].x, trailPoints[i].y,
                            ta * alpha * 0.8
                        )
                    }
                }

                drawPlane(planeX, planeY, cw * 0.5 * scale, ch * 0.4 * scale, angle, alpha)
            }

            if (t < 1) {
                rafId = requestAnimationFrame(frame)
            } else {
                cancelAnimationFrame(rafId)
                onDone?.()
            }
        }

        rafId = requestAnimationFrame(frame)
        return () => cancelAnimationFrame(rafId)
    }, [x, y, w, h, onDone])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                pointerEvents: 'none',
            }}
        />
    )
}
