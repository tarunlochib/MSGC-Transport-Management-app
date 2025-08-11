import React from 'react';

const FormContainer = ({ children, onSubmit }) => {
  return (
    <div className="animate-slideUp" style={{ animationDelay: '200ms' }}>
      <div className="bg-white shadow-md rounded-lg border border-gray-100 p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          {children}
        </form>
      </div>
    </div>
  );
};

export default FormContainer; 