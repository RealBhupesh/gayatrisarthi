declare global {
    interface Window {
        MathJax: {
            typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
            typesetlear: (elements?: HTMLElement[]) => Promise<void>;

        };
    }
}
export {};
