import { useEffect } from 'react';

/**
 * Hook para fechar modais ao pressionar a tecla Escape.
 * @param {boolean} isOpen - Estado que indica se o modal está aberto
 * @param {function} onClose - Função para fechar o modal
 */
export function useModalClose(isOpen, onClose) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);
}
