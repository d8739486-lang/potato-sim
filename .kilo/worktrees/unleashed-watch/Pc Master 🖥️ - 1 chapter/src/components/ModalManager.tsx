import React from 'react';
import { createPortal } from 'react-dom';
import { useModalStore, MODAL_TYPES } from '@/core/modalStore';
import { AnimatePresence } from 'framer-motion';

const MODAL_COMPONENTS: Record<MODAL_TYPES, React.FC<any>> = {
  [MODAL_TYPES.SETTINGS]: () => null, // Placeholder
};

export const ModalManager = () => {
  const { activeModals, closeModal } = useModalStore();

  if (activeModals.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 pointer-events-none">
      <AnimatePresence>
        {activeModals.map((modal, index) => {
          const Component = MODAL_COMPONENTS[modal.id];
          if (!Component) return null;

          return (
            <div 
              key={`${modal.id}-${index}`}
              className="absolute inset-0 flex items-center justify-center pointer-events-auto"
              style={{ zIndex: 1000 + index * 10 }}
            >
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => closeModal(modal.id)}
              />
              
              {/* Modal Content */}
              <Component {...modal.props} onClose={() => closeModal(modal.id)} />
            </div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
};
