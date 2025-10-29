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
      const ce = e as CustomEvent<{ unicode?: string; emoji?: { unicode: string } | string }>;
      const emojiDetail = ce.detail?.emoji;
      const unicode =
        ce.detail?.unicode ??
        (typeof emojiDetail === 'object' && emojiDetail !== null && 'unicode' in emojiDetail ? emojiDetail.unicode : undefined) ??
        (typeof emojiDetail === 'string' ? emojiDetail : undefined) ??
        '';
      if (unicode) onSelect?.(unicode);
    };

    el.addEventListener('emoji-click', handle as EventListener);
    return () => el.removeEventListener('emoji-click', handle as EventListener);
  }, [onSelect, theme]);

  // @ts-expect-error → αγνοούμε το unknown tag
  return <emoji-picker ref={ref} class={className}></emoji-picker>;
};

export default EmojiPicker;
