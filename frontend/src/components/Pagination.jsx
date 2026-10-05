import React from 'react';

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page, total, from, to } = meta;

  const pages = [];
  const startPage = Math.max(1, current_page - 2);
  const endPage = Math.min(last_page, current_page + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 pt-3 mt-2 border-top">
      <div className="small text-muted">
        Showing <span className="fw-semibold text-dark">{from || 0}</span> to <span className="fw-semibold text-dark">{to || 0}</span> of <span className="fw-semibold text-dark">{total}</span> tasks
      </div>

      <nav aria-label="Task pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${current_page === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(current_page - 1)}
              disabled={current_page === 1}
              aria-label="Previous page"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>

          {startPage > 1 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => onPageChange(1)}>1</button>
              </li>
              {startPage > 2 && <li className="page-item disabled"><span className="page-link">…</span></li>}
            </>
          )}

          {pages.map((p) => (
            <li key={p} className={`page-item ${p === current_page ? 'active' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(p)}
                aria-current={p === current_page ? 'page' : undefined}
              >
                {p}
              </button>
            </li>
          ))}

          {endPage < last_page && (
            <>
              {endPage < last_page - 1 && <li className="page-item disabled"><span className="page-link">…</span></li>}
              <li className="page-item">
                <button className="page-link" onClick={() => onPageChange(last_page)}>{last_page}</button>
              </li>
            </>
          )}

          <li className={`page-item ${current_page === last_page ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(current_page + 1)}
              disabled={current_page === last_page}
              aria-label="Next page"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
