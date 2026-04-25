import React from 'react';

const LivingBackground = ({ theme = 'pharmacy' }) => {
    const colors = theme === 'pharmacy'
        ? ['#38bdf8', '#0ea5e9', '#6366f1']
        : ['#34d399', '#10b981', '#059669'];

    // Pre-generate random values once (not on every render)
    const blobData = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        scale: 0.8 + Math.random() * 0.4,
        size: 200 + Math.random() * 200,
        delay: Math.random() * 5,
        duration: 15 + Math.random() * 10
    }));

    const particleData = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        size: 2 + Math.random() * 2,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10
    }));

    return (
        <div className="living-background" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: 0,
            pointerEvents: 'none',
        }}>
            {particleData.map(p => (
                <div
                    key={`p-${p.id}`}
                    style={{
                        position: 'absolute',
                        width: p.size,
                        height: p.size,
                        background: theme === 'pharmacy' ? 'rgba(255,255,255,0.3)' : 'rgba(16, 185, 129, 0.4)',
                        borderRadius: '50%',
                        top: `${p.top}%`,
                        left: `${p.left}%`,
                        animation: `float ${p.duration}s infinite linear`,
                        animationDelay: `${p.delay}s`
                    }}
                />
            ))}

            {blobData.map(blob => (
                <div
                    key={blob.id}
                    style={{
                        position: 'absolute',
                        borderRadius: '50%',
                        background: colors[blob.id % colors.length],
                        filter: 'blur(80px)',
                        opacity: 0.5,
                        width: blob.size,
                        height: blob.size,
                        left: `${blob.x}%`,
                        top: `${blob.y}%`,
                        animation: `blobFloat ${blob.duration}s infinite ease-in-out`,
                        animationDelay: `${blob.delay}s`
                    }}
                />
            ))}

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(-100px); opacity: 0; }
                }
                @keyframes blobFloat {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(30px, -30px) scale(1.1); }
                }
            `}</style>
        </div>
    );
};

export default LivingBackground;