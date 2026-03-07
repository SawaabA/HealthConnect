import { useState, useEffect, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'

const T = { glow: 900, unravel: 1900, fade: 3700, reveal: 4200 }

// ── Caduceus ─────────────────────────────────────────────────────────────────
// ViewBox 0 0 300 300, staff center x=150
function Caduceus({ phase }) {
    const unravel = ['unravel', 'fade', 'reveal'].includes(phase)
    const staffOut = ['fade', 'reveal'].includes(phase)

    return (
        <svg viewBox="0 0 340 310" width="300" height="272"
            xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>

            {/* ── Staff ── */}
            <g style={{
                transformBox: 'fill-box', transformOrigin: 'top center',
                transition: 'opacity 0.6s ease, transform 0.5s ease',
                opacity: staffOut ? 0 : 1,
                transform: staffOut ? 'scaleY(0)' : 'scaleY(1)',
            }}>
                <line x1="170" y1="56" x2="170" y2="298"
                    stroke="white" strokeWidth="6" strokeLinecap="round" />
                <circle cx="170" cy="43" r="14" fill="white" />
                <circle cx="170" cy="43" r="8.5" fill="#34d399" />
                <circle cx="166" cy="39" r="2.5" fill="rgba(255,255,255,0.65)" />
            </g>

            {/* ── Left wing: sweeps UP then out then back down, like reference image ── */}
            {/* Attachment at (170,62). Top arc peaks at ~(90,16). Tip at (8,72).         */}
            <g className={unravel ? 'hc-wing-l' : ''}>
                {/* Main body: closed crescent shape */}
                <path
                    d="M 170,62
             C 148,44 116,22 80,24
             C 48,26 14,46 8,68
             C 8,84 14,100 22,96
             C 28,92 36,70 44,70
             C 44,88 50,104 58,100
             C 64,96 74,71 82,71
             C 82,89 90,104 98,100
             C 104,96 114,73 122,73
             C 122,89 130,101 138,97
             C 144,93 152,76 160,75
             C 162,82 165,79 170,78"
                    fill="white" opacity="0.96" />
                {/* Feather layer 1 — echoes the top arc */}
                <path
                    d="M 170,66 C 148,50 118,32 84,36 C 54,40 22,56 14,74"
                    fill="none" stroke="rgba(186,255,230,0.5)" strokeWidth="3.5" strokeLinecap="round" />
                {/* Feather layer 2 */}
                <path
                    d="M 170,71 C 150,58 124,44 94,48 C 68,52 40,64 28,80"
                    fill="none" stroke="rgba(186,255,230,0.32)" strokeWidth="2.8" strokeLinecap="round" />
                {/* Feather layer 3 */}
                <path
                    d="M 170,76 C 152,66 130,56 106,58 C 86,60 64,70 52,84"
                    fill="none" stroke="rgba(186,255,230,0.2)" strokeWidth="2.2" strokeLinecap="round" />
                {/* Outer tip crease */}
                <path
                    d="M 10,72 C 8,82 14,92 24,94"
                    fill="none" stroke="rgba(186,255,230,0.4)" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* ── Right wing (exact mirror around x=170) ── */}
            <g className={unravel ? 'hc-wing-r' : ''}>
                <path
                    d="M 170,62
             C 192,44 224,22 260,24
             C 292,26 326,46 332,68
             C 332,84 326,100 318,96
             C 312,92 304,70 296,70
             C 296,88 290,104 282,100
             C 276,96 266,71 258,71
             C 258,89 250,104 242,100
             C 236,96 226,73 218,73
             C 218,89 210,101 202,97
             C 196,93 188,76 180,75
             C 178,82 175,79 170,78"
                    fill="white" opacity="0.96" />
                <path
                    d="M 170,66 C 192,50 222,32 256,36 C 286,40 318,56 326,74"
                    fill="none" stroke="rgba(186,255,230,0.5)" strokeWidth="3.5" strokeLinecap="round" />
                <path
                    d="M 170,71 C 190,58 216,44 246,48 C 272,52 300,64 312,80"
                    fill="none" stroke="rgba(186,255,230,0.32)" strokeWidth="2.8" strokeLinecap="round" />
                <path
                    d="M 170,76 C 188,66 210,56 234,58 C 254,60 276,70 288,84"
                    fill="none" stroke="rgba(186,255,230,0.2)" strokeWidth="2.2" strokeLinecap="round" />
                <path
                    d="M 330,72 C 332,82 326,92 316,94"
                    fill="none" stroke="rgba(186,255,230,0.4)" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* ── Snake 1 (RIGHT first, staff at x=170) ── */}
            <g className={unravel ? 'hc-snake1' : ''}
                style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}>
                <path
                    d="M 170,295
             Q 194,280 170,264
             Q 141,248 170,232
             Q 204,212 170,192
             Q 132,170 170,148
             Q 216,122 170,98
             Q 130,78 138,68"
                    fill="none" stroke="#6ee7b7" strokeWidth="12"
                    strokeLinecap="round" strokeLinejoin="round" />
                <ellipse cx="135" cy="63" rx="10" ry="8"
                    fill="#6ee7b7" transform="rotate(-35 135 63)" />
                <circle cx="131" cy="59" r="2.5" fill="#011a12" />
                <path d="M 127,66 L 120,70 M 127,66 L 122,73"
                    fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" />
            </g>

            {/* ── Snake 2 (LEFT first, mirror) ── */}
            <g className={unravel ? 'hc-snake2' : ''}
                style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}>
                <path
                    d="M 170,295
             Q 146,280 170,264
             Q 199,248 170,232
             Q 136,212 170,192
             Q 208,170 170,148
             Q 124,122 170,98
             Q 210,78 202,68"
                    fill="none" stroke="#a7f3d0" strokeWidth="12"
                    strokeLinecap="round" strokeLinejoin="round" />
                <ellipse cx="205" cy="63" rx="10" ry="8"
                    fill="#a7f3d0" transform="rotate(35 205 63)" />
                <circle cx="209" cy="59" r="2.5" fill="#011a12" />
                <path d="M 213,66 L 220,70 M 213,66 L 218,73"
                    fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" />
            </g>

        </svg>
    )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function RoleSelectPage() {
    const { loginWithRedirect } = useAuth0()
    const navigate = useNavigate()
    const [phase, setPhase] = useState('draw')

    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase('glow'), T.glow),
            setTimeout(() => setPhase('unravel'), T.unravel),
            setTimeout(() => setPhase('fade'), T.fade),
            setTimeout(() => setPhase('reveal'), T.reveal),
        ]
        return () => timers.forEach(clearTimeout)
    }, [])

    function handleRoleSelect(role) {
        sessionStorage.setItem('hc_intended_role', role)
        loginWithRedirect({ authorizationParams: { redirect_uri: window.location.origin } })
    }

    const isDark = phase !== 'reveal'
    const isReveal = phase === 'reveal'
    const isGlow = phase === 'glow'

    return (
        <>
            <style>{`
        /* Entry */
        @keyframes hc-draw-in {
          0%   { opacity:0; transform:scale(0.15) translateY(30px); filter:blur(8px); }
          65%  { opacity:1; transform:scale(1.05) translateY(-5px);  filter:blur(0);  }
          100% { opacity:1; transform:scale(1)    translateY(0);     filter:blur(0);  }
        }
        @keyframes hc-glow-pulse {
          0%,100% { filter:drop-shadow(0 0 12px rgba(52,211,153,.7)); }
          50%     { filter:drop-shadow(0 0 38px rgba(52,211,153,1))
                           drop-shadow(0 0 80px rgba(52,211,153,.3)); }
        }
        @keyframes hc-exit-whole {
          0%   { opacity:1; transform:scale(1); }
          100% { opacity:0; transform:scale(0.85) translateY(8px); }
        }

        /* Snakes uncoil diagonally off the staff */
        @keyframes hc-snake1-out {
          0%   { transform:translate(0,0)        rotate(0deg);   opacity:1; }
          30%  { transform:translate(-30px, 80px) rotate(-15deg); opacity:1; }
          65%  { transform:translate(-75px,180px) rotate(-30deg); opacity:.5; }
          100% { transform:translate(-120px,280px) rotate(-45deg); opacity:0; }
        }
        @keyframes hc-snake2-out {
          0%   { transform:translate(0,0)        rotate(0deg);  opacity:1; }
          30%  { transform:translate(30px,  80px) rotate(15deg); opacity:1; }
          65%  { transform:translate(75px, 180px) rotate(30deg); opacity:.5; }
          100% { transform:translate(120px,280px) rotate(45deg); opacity:0; }
        }

        /* Wings: each rotates around its staff-root edge then flies up */
        @keyframes hc-wing-l-anim {
          0%   { transform:rotate(0deg);            opacity:1; }
          10%  { transform:rotate(-30deg);           }  /* flap up   */
          20%  { transform:rotate(15deg);            }  /* flap down */
          30%  { transform:rotate(-35deg);           }  /* flap up   */
          40%  { transform:rotate(10deg);            }  /* flap down */
          50%  { transform:rotate(-38deg);           }  /* lift-off  */
          70%  { transform:rotate(-55deg) translateY(-90px);  opacity:.85; }
          100% { transform:rotate(-80deg) translateY(-280px) scale(.4); opacity:0; }
        }
        @keyframes hc-wing-r-anim {
          0%   { transform:rotate(0deg);            opacity:1; }
          10%  { transform:rotate(30deg);            }
          20%  { transform:rotate(-15deg);           }
          30%  { transform:rotate(35deg);            }
          40%  { transform:rotate(-10deg);           }
          50%  { transform:rotate(38deg);            }
          70%  { transform:rotate(55deg) translateY(-90px);   opacity:.85; }
          100% { transform:rotate(80deg) translateY(-280px) scale(.4);  opacity:0; }
        }

        /* Wordmark / cards */
        @keyframes hc-wordmark {
          0%   { opacity:0; letter-spacing:.45em; }
          100% { opacity:1; letter-spacing:.12em; }
        }
        @keyframes hc-card-in {
          0%   { opacity:0; transform:translateY(36px) scale(.96); }
          100% { opacity:1; transform:translateY(0)    scale(1);   }
        }
        @keyframes hc-title-in {
          0%   { opacity:0; transform:translateY(-18px); }
          100% { opacity:1; transform:translateY(0);     }
        }

        .hc-draw   { animation: hc-draw-in  1s cubic-bezier(.34,1.4,.64,1) both; }
        .hc-glow   { animation: hc-glow-pulse 1.6s ease-in-out infinite; }
        .hc-exit   { animation: hc-exit-whole .5s ease-in forwards; }

        .hc-snake1 { animation: hc-snake1-out 1.8s cubic-bezier(.4,0,.6,1) forwards; }
        .hc-snake2 { animation: hc-snake2-out 1.8s cubic-bezier(.4,0,.6,1) forwards; }

        /* Left wing bounding box: x=8..170, y=16..94 → root=(170,62) → 100% / ((62-16)/(94-16))=59% */
        .hc-wing-l { animation: hc-wing-l-anim 2.2s cubic-bezier(.4,0,.2,1) forwards;
                     transform-box: fill-box; transform-origin: 100% 59%; }
        /* Right wing mirror: x=170..332, y=16..94 → root=(170,62) → 0% / 59% */
        .hc-wing-r { animation: hc-wing-r-anim 2.2s cubic-bezier(.4,0,.2,1) forwards;
                     transform-box: fill-box; transform-origin: 0% 59%; }

        .hc-wordmark { animation: hc-wordmark 1s ease-out .35s both; }
        .hc-card-1   { animation: hc-card-in .7s cubic-bezier(.34,1.15,.64,1) .05s both; }
        .hc-card-2   { animation: hc-card-in .7s cubic-bezier(.34,1.15,.64,1) .20s both; }
        .hc-title    { animation: hc-title-in .55s ease-out both; }
      `}</style>

            <div style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                backgroundColor: isDark ? '#010f0a' : '#f0fdf4',
                transition: 'background-color 0.9s ease',
            }}>

                {/* Header */}
                <header style={{ backgroundColor: '#15803d' }} className="shadow-md flex-none">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                        <button onClick={() => navigate('/')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                                <span className="text-green-700 font-bold">HC</span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg leading-tight">HealthConnect</p>
                                <p className="text-green-200 text-xs">Secure Medical Records Platform</p>
                            </div>
                        </button>
                        <button onClick={() => navigate('/')} className="text-green-200 hover:text-white text-sm transition-colors flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">

                    {/* Animation stage */}
                    {!isReveal && (
                        <div className={[
                            'flex flex-col items-center gap-7',
                            'hc-draw',
                            isGlow ? 'hc-glow' : '',
                            ['unravel', 'fade'].includes(phase) ? 'hc-exit' : '',
                        ].join(' ')}>
                            <Caduceus phase={phase} />
                            <p className="hc-wordmark text-white font-black text-2xl"
                                style={{ textShadow: '0 0 28px rgba(52,211,153,.6)' }}>
                                HEALTHCONNECT
                            </p>
                        </div>
                    )}

                    {/* Role cards */}
                    {isReveal && (
                        <div className="w-full max-w-2xl">
                            <div className="text-center mb-12">
                                <div className="flex justify-center mb-5">
                                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shadow-sm">
                                        <svg viewBox="0 0 60 80" width="30" height="40">
                                            <line x1="30" y1="12" x2="30" y2="74" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
                                            <circle cx="30" cy="9" r="5.5" fill="#15803d" />
                                            <path d="M30,20 C18,11 7,14 3,23 Q22,28 30,34" fill="#15803d" opacity="0.8" />
                                            <path d="M30,20 C42,11 53,14 57,23 Q38,28 30,34" fill="#15803d" opacity="0.8" />
                                            <path d="M30,72 C17,63 37,54 30,45 C17,36 37,27 30,21" fill="none" stroke="#34d399" strokeWidth="5" strokeLinecap="round" />
                                            <path d="M30,72 C43,63 23,54 30,45 C43,36 23,27 30,21" fill="none" stroke="#6ee7b7" strokeWidth="5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="hc-title text-4xl font-black text-gray-900 mb-3 leading-tight">
                                    How are you accessing<br />HealthConnect?
                                </h2>
                                <p className="hc-title text-gray-500 text-lg" style={{ animationDelay: '.12s' }}>
                                    Choose your role to be taken to the right login.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <button onClick={() => handleRoleSelect('patient')}
                                    className="hc-card-1 group bg-white border-2 border-gray-200 hover:border-green-500 rounded-2xl p-8 text-left shadow-sm hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1.5">
                                    <div className="w-14 h-14 bg-green-100 group-hover:bg-green-600 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-200">
                                        <svg className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">I'm a Patient</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">View your records, manage access to your data, and control your health information.</p>
                                    <div className="mt-5 flex items-center gap-2 text-green-600 font-semibold text-sm">
                                        Sign in as Patient
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>

                                <button onClick={() => handleRoleSelect('doctor')}
                                    className="hc-card-2 group bg-white border-2 border-gray-200 hover:border-blue-500 rounded-2xl p-8 text-left shadow-sm hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1.5">
                                    <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-200">
                                        <svg className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">I'm a Doctor</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">Access authorized patient records, request access, and review AI clinical summaries.</p>
                                    <div className="mt-5 flex items-center gap-2 text-blue-600 font-semibold text-sm">
                                        Sign in as Doctor
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            </div>

                            <div className="mt-10 text-center">
                                <p className="text-gray-400 text-sm mb-2">First responder or emergency contact?</p>
                                <button onClick={() => navigate('/emergency/sarah-chen')}
                                    className="text-red-600 hover:text-red-700 font-semibold text-sm underline underline-offset-2 transition-colors">
                                    🚨 Emergency Access Portal
                                </button>
                            </div>
                            <p className="mt-8 text-xs text-gray-400 text-center max-w-sm mx-auto">
                                Credentials managed securely by Auth0. HealthConnect never stores your password.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </>
    )
}
