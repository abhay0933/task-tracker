'use client';

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base background — neutral slate */}
      <div className="absolute inset-0 bg-[#eef1f6] dark:bg-[#0a0e16]" />

      {/* Light mode glow — subtle indigo, gives the glass something to refract */}
      <div className="dark:hidden">
        <div className="absolute rounded-full"
          style={{ width: '720px', height: '720px', top: '-320px', left: '-220px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, rgba(99,102,241,0.05) 45%, transparent 70%)',
            filter: 'blur(80px)' }} />
        <div className="absolute rounded-full"
          style={{ width: '560px', height: '560px', bottom: '-180px', right: '-140px',
            background: 'radial-gradient(circle, rgba(148,163,184,0.16) 0%, rgba(99,102,241,0.04) 45%, transparent 70%)',
            filter: 'blur(80px)' }} />
      </div>

      {/* Dark mode glow — restrained indigo */}
      <div className="hidden dark:block">
        <div className="absolute rounded-full"
          style={{ width: '780px', height: '780px', top: '-300px', left: '-220px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(79,70,229,0.07) 45%, transparent 72%)',
            filter: 'blur(80px)' }} />
        <div className="absolute rounded-full"
          style={{ width: '620px', height: '620px', bottom: '-200px', right: '-160px',
            background: 'radial-gradient(circle, rgba(79,70,229,0.14) 0%, rgba(99,102,241,0.05) 45%, transparent 72%)',
            filter: 'blur(80px)' }} />
      </div>
    </div>
  );
}
