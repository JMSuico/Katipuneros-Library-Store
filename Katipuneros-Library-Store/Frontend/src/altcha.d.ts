import type { DetailedHTMLProps, HTMLAttributes, CSSProperties } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'altcha-widget': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        auto?: 'off' | 'onfocus' | 'onload' | 'onsubmit' | string;
        challenge?: string;
        challengeurl?: string;
        hidefooter?: boolean | string;
        hidelogo?: boolean | string;
        strings?: string;
        theme?: string;
        style?: CSSProperties;
      }, HTMLElement>;
    }
  }

  namespace React.JSX {
    interface IntrinsicElements {
      'altcha-widget': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        auto?: 'off' | 'onfocus' | 'onload' | 'onsubmit' | string;
        challenge?: string;
        challengeurl?: string;
        hidefooter?: boolean | string;
        hidelogo?: boolean | string;
        strings?: string;
        theme?: string;
        style?: CSSProperties;
      }, HTMLElement>;
    }
  }
}
