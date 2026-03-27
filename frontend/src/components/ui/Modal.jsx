import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`force-light w-full ${maxWidth} bg-white text-black shadow-2xl rounded-2xl border pointer-events-auto flex flex-col max-h-[90vh] my-auto`}
            >
              <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-2xl">
                <h2 className="text-lg font-semibold tracking-tight text-black">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5 opacity-70" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
