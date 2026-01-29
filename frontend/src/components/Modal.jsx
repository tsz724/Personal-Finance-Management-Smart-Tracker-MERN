import React from "react";

const Modal = ({ children, isOpen, onClose, title }) => {
  // If the modal isn't open, don't render anything
  if (!isOpen) return null;

  return (
    // Overlay / Backdrop
    <div className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-[calc(100%-1rem)] max-h-full overflow-y-auto overflow-x-hidden bg-black/20 bg-opacity-50">
      {/* Modal Container */}
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        {/* Modal content */}
        <div className="relative bg-white rounded-lg shadow-sm">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg"
              onClick={onClose}
            >
              <span className="text-2xl">&times;</span> 
            </button>
          </div>

          {/* Modal body */}
          <div className="mt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;