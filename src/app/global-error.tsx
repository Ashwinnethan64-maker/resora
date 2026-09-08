'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Fatal Root Application Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#FFFDF5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '480px', width: '100%', backgroundColor: '#FFFFFF', border: '4px solid #000000', boxShadow: '10px 10px 0px #000000', padding: '32px', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', backgroundColor: '#FFD93D', color: '#000000', border: '2px solid #000000', padding: '4px 12px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              RESORA SYSTEM RECOVERY
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#000000', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
              SOMETHING BROKE
            </h1>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#000000', lineHeight: '1.5', margin: '0 0 24px 0' }}>
              A fatal client initialization error occurred. Your research archive remains completely safe.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#FF6B6B',
                  color: '#000000',
                  border: '3px solid #000000',
                  boxShadow: '3px 3px 0px #000000',
                  fontWeight: '900',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                TRY AGAIN
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#FFD93D',
                  color: '#000000',
                  border: '3px solid #000000',
                  boxShadow: '3px 3px 0px #000000',
                  fontWeight: '900',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                RETURN HOME
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
