// Shared pagination for the dashboard tables — 8 rows per page so long
// lists (licenses, users, payments, versions) stay light.
'use client';

import { useEffect, useState } from 'react';

export function usePagination(items, perPage = 8) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(page, pages);
  // Back to page 1 when the list itself changes (search, new data).
  useEffect(() => { setPage(1); }, [items.length]);
  const pageItems = items.slice((safePage - 1) * perPage, safePage * perPage);
  return { pageItems, page: safePage, setPage, pages };
}

export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  return (
    <div className="dash-pagination">
      <button className="dash-page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
      {nums.map((n, i) => n === '…'
        ? <span key={`e${i}`} className="dash-page-ellipsis">…</span>
        : <button key={n} className={`dash-page-btn ${n === page ? 'on' : ''}`} onClick={() => onPage(n)}>{n}</button>)}
      <button className="dash-page-btn" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</button>
    </div>
  );
}
