'use client';

import React, { useEffect, useRef } from 'react';

type Props = {
  onSelect?: (unicode: string) => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto'; // ✅ ΝΕΟ prop
};

const EmojiPicker: React.FC<Props> = ({ onSelect, className, theme = 'auto' }) => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // ✅ Εισαγωγή του web component μόνο στον client
    import('emoji-picker-element');

    const el = ref.current;
    if (!el) return;

    // ✅ Εφαρμογή theme (dark/light)
    el.setAttribute('theme', theme);

    const handle = (e: Event) => {
      const ce = e as CustomEvent<any>;
      const unicode =
        ce.detail?.unicode ??
        ce.detail?.emoji?.unicode ??
        ce.detail?.emoji ??
        '';
      if (unicode) onSelect?.(unicode);
    };

    el.addEventListener('emoji-click', handle as EventListener);
    return () => el.removeEventListener('emoji-click', handle as EventListener);
  }, [onSelect, theme]);

  // @ts-ignore → αγνοούμε το unknown tag
  return <emoji-picker ref={ref as any} class={className}></emoji-picker>;
};

export default EmojiPicker;
