"use client";
import { useCallback, useEffect, useRef } from 'react';

export function useUnsavedChanges() {
  const dirty = useRef(false);
  const markDirty = useCallback(() => { dirty.current = true; }, []);
  const markSaved = useCallback(() => { dirty.current = false; }, []);
  useEffect(() => {
    function beforeUnload(e) {
      if (!dirty.current) return;
      e.preventDefault(); e.returnValue = '';
    }
    function navigate(e) {
      if (!dirty.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest?.('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;
      if (!window.confirm('You have unsaved invoice changes. Leave without saving?')) {
        e.preventDefault(); e.stopPropagation();
      }
    }
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', navigate, true);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('click', navigate, true);
    };
  }, []);
  return { markDirty, markSaved };
}
