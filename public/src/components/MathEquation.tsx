import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
    equation: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ equation }) => {
    const mathContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const typesetMath = async () => {
            try {
                if (window.MathJax && mathContainerRef.current) {
                    // Set properly formatted LaTeX content
                    mathContainerRef.current.innerHTML = `\\[${equation}\\]`;

                    // Trigger MathJax to render
                    await window.MathJax.typesetPromise([mathContainerRef.current]);
                }
            } catch (err) {
                console.error('MathJax rendering failed:', err);
            }
        };

        if (window.MathJax) {
            typesetMath();
        }
    }, [equation]);

    return <div ref={mathContainerRef} />;
};

export default MathRenderer;
