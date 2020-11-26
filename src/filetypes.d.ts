declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: any;
  export default src;
}

declare module '*.ttf' {
  const src: any;
  export default src;
}

declare module '*.png';
declare module '*.webm';
