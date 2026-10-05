import React from 'react';

export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="d-flex flex-column gap-3 my-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="skeleton" style={{ width: '40%', height: '20px' }}></div>
            <div className="skeleton" style={{ width: '15%', height: '20px' }}></div>
          </div>
          <div className="skeleton mb-2" style={{ width: '80%', height: '14px' }}></div>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="skeleton" style={{ width: '25%', height: '14px' }}></div>
            <div className="skeleton" style={{ width: '20%', height: '24px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
