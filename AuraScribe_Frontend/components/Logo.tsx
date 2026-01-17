
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  theme?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = true, theme = 'dark' }) => {
  return (
    <div className="flex items-center gap-3">
      <div className={`${className} flex items-center justify-center shrink-0`}>
        <svg 
          version="1.1" 
          viewBox="0 0 1024 1024" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
            <path transform="translate(0)" d="m0 0h1024v1024h-1024z" fill="transparent"/>
            <path transform="translate(513,50)" d="m0 0 4 2 11 7 16 10 10 6 30 15 25 10 19 7 37 11 30 7 22 4 35 4 26 2 2 1 1 9v138l-1 127-4 25-6 21-12 26-6 10-10 14-13 15-22 22-11 9-10 8-13 10-17 12-43 29-18 11-11 8-10 5-26 16-29 17-7 3-14-8-13-8-20-12-9-6-15-9-13-8-51-34-19-13-15-12-13-10-13-11-16-15-9-10-7-8-12-17-10-18-7-16-6-21-4-25-1-153v-118l1-3 38-3 31-4 14-3h7v-2l17-3 52-15 30-12 15-7 16-8 14-8 16-10 15-10z" fill="#FFFFFF"/>
            <path transform="translate(513,50)" d="m0 0 4 2 11 7 16 10 10 6 30 15 25 10 19 7 37 11 30 7 22 4 35 4 26 2 2 1 1 9v138l-1 127-4 25-6 21-12 26-6 10-10 14-13 15-22 22-11 9-10 8-13 10-17 12-43 29-18 11-11 8-10 5-26 16-29 17-7 3-14-8-13-8-20-12-9-6-15-9-13-8-51-34-19-13-15-12-13-10-13-11-16-15-9-10-7-8-12-17-10-18-7-16-6-21-4-25-1-153v-118l1-3 38-3 31-4 14-3h7v-2l17-3 52-15 30-12 15-7 16-8 14-8 16-10 15-10zm-1 29-10 7-15 9-12 6-12 7-30 13-34 12-34 10-21 5-37 6-38 4-1 51v189l3 24 6 21 8 19 11 19 5 7 2 1 3 5 10 11 21 21 6 5h2v2l6 4 12 10 17 12 10 7 42 28 11 7 14 9 6 4h3v2l8 4 20 12 17 10 4 1 21-12 26-16 18-11 11-7 10-7 16-10 22-15 11-8 12-8 11-9 10-8 2-1v-2l4-2 11-9v-2h2l7-8 5-5 12-15v-2h2l9-15 8-16 8-24 3-14 2-17v-243l-33-3-27-4-36-8-26-7-36-12-24-10-30-15-15-8-5-4-11-7z" fill="#2563eb"/>
            <path transform="translate(409,343)" d="m0 0 5 1 17 9 22 8 14 3 16 2 1 2v49l-1 19-5 19-6 14-7 11-9 11-8 8-15 11-10 6-12 6-10-5-14-9-12-9-10-9-7-7-8-13-7-16-4-13-2-21v-52l2-2 20-3 15-4 16-6z" fill="#2563eb"/>
            <path transform="translate(505,134)" d="m0 0 4 1 1 10v209l-6-1-8-7-3-5-1-6v-26l-5 1-5 6-2 1h-13l-9-4-2-2v-125l-16-1-8-7-3-5 1-5 15-5 12-7 10-5 15-9 13-6z" fill="#2563eb"/>
            <path transform="translate(549,135)" d="m0 0 11 2 14 7 6 8 4 9 5 23 5 12 6 7 18 9 1 2v8l-4 3-8-1-14-7-10-9-6-10-4-12-3-21-6-9-10-5h-10l-4 1-1 12v365l2 7 12 4 13-1 10-5 6-4 7-10 15-2 10-5 9-11 5-10 2-2h6l4 3v7l-4 10-6 8-9 8-8 5-16 4-8 10-16 8-11 2h-9l-12-3-9-6-6-8-1-3v-383l4-8 8-6 5-2z" fill="#2563eb"/>
            <path transform="translate(365,169)" d="m0 0 4 2 9 15 4 7 5 13 3 8v10l-5 15-6 14-4 16-2 16h6v-12l3-13 6-11 9-8 8-3h8l9 3 8 9 2 5v13l-4 9-8 6-6 1-2-12-5-4h-10l-5 5-3 12h11l1 1v13l-1 1h-26l4 8 4 3 5 2-1 5-5 4-7 1-2 11-4 4-5-1-3-4-1-3v-7l-8-1-5-4-1-5 4-2 6-5 3-6h-25l-1-1v-12l6-2h5l-2-10-3-5-8-3-7 3-3 4-1 10-5-1-7-4-3-3-3-6-1-5v-9l5-10 7-6 6-2h10l7 3 5 5 6 7 4 8 2 5 1 7v13h7l-2-15-4-16-10-25-2-7 1-13 7-16 8-14z" fill="#2563eb"/>
            <path transform="translate(643,313)" d="m0 0h23l12 2 12 4 11 7 10 8 10 12 8 16 4 9 2 11v21l-3 16-6 18-8 15-11 14-8 9-9 7h-7l-3-5 2-5 13-12 8-10 1-3h2l2-6 8-17 3-9 2-16-2-22-5-13-9-14-9-9-11-7-12-5-13-2h-10l-16 4-12 6-9 7-5 5-9 13-5 13-2 10v15l3 14-1 6-4 3-6-1-4-6-3-14v-16l2-13 5-13 7-13 8-10 8-8 14-9 17-6z" fill="#2563eb"/>
            <path transform="translate(611,688)" d="m0 0h13l1 37 12-6 13-1 11 4 10 9 5 9 1 4v19l-4 9-4 6-8 7-6 3-13 1-10-3-8-7-1-1-1 8-1 1h-12l-1-1v-96z" fill="#2563eb"/>
            <path transform="translate(149,690)" d="m0 0h5l3 5 11 28 6 14 3 9 9 22 3 7 3 8v4h-18l-4-9-5-13-5-1h-16l-17-1-1 6-6 16-2 2h-15l-2-1 1-6 12-32 7-19 7-18 6-16 2-4z" fill="#2563eb"/>
            <path transform="translate(823,690)" d="m0 0h10l5 1 10 25 6 16 15 38 5 12v5h-18l-3-5-6-17-17-1h-19l-5 12-4 10-1 1h-17l1-5 6-17 14-36 9-24 4-11 2-3z" fill="#2563eb"/>
            <path transform="translate(649,339)" d="m0 0h14l15 4 13 8 9 10 5 10 3 9 1 6v19l-4 15-4 11-11 18-11 12-4 2v2l-15 10-10 5h-6l-4-5 1-5 8-5 8-4 13-11h2l2-4 8-10 8-16 4-14 1-6v-11l-3-12-6-10-10-8-11-4h-17l-11 4-9 7-6 9-2 4-2 14-3 1v2l-7 1-4-4-1-6 3-13 7-14 9-9 14-9z" fill="#2563eb"/>
            <path transform="translate(418,688)" d="m0 0 14 1 13 5 5 4-1 6-5 8-18-6-12 1-4 4-1 2v7l5 5 9 4 16 6 8 6 4 6 2 6 1 8-3 11-6 8-7 5-8 3-6 1h-12l-11-3-11-7-3-5 7-11 5-1 5 5 8 3 5 2 12-2 5-5 1-7-3-5-8-4-17-6-10-6-6-8-2-8v-8l3-9 6-8 12-6z" fill="#2563eb"/>
            <path transform="translate(719,717)" d="m0 0 8 1 10 4 7 6 6 12 2 11-1 7-5 1h-44l3 9 2 1v2l6 2 11 1 11-3 7-4 6 9-1 4-7 5-7 3-5 1h-14l-10-3-9-7-6-8-3-8-1-9 2-14 4-8 6-7 8-5 6-2z" fill="#2563eb"/>
            <path transform="translate(336,718)" d="m0 0h18l11 4 7 8 4 11v45l-1 1h-14l-2-5-12 6-5 1h-8l-9-4-7-7-2-5v-9l3-8 5-5 4-3 6-2 8-1h17l-4-8-4-3-4-1h-7l-16 4-1-4-2-1-1-8 9-4z" fill="#2563eb"/>
            <path transform="translate(651,366)" d="m0 0h12l9 4 6 7 4 10v11l-4 16-5 12-8 12-12 12-14 9-13 4-6-1-2-2v-7l5-4 12-5 9-6 10-9 10-16 3-10 1-11-3-7-4-3h-11l-4 2-2 4-2 17-8 16-14 14-14 7-8 1-5-5 1-5 4-3 9-4 4-2 8-8h2l2-4 5-11 2-17 5-8 9-8z" fill="#2563eb"/>
            <path transform="translate(602,160)" d="m0 0h13l8 3 12 7 11 11 8 16 3 10 12 8 10 10 7 12 4 13 1 8v17l-3 14 5 2 5 4 1 2v6l-5 5h-5l-8-7-7-3-14-2-4-4v-6l5-4h11l3-6 1-14-2-12-4-10-8-11-14-10-6-6-5-16-7-11-8-6-9-4-10-2-4-4v-6z" fill="#2563eb"/>
            <path transform="translate(200,720)" d="m0 0h13l1 1 1 42 3 7 6 3h6l6-4 4-6 1-42 1-1h14l1 1 1 44v22h-14l-2-7-9 7-7 2h-8l-9-3-7-6-3-5-2-7v-47z" fill="#2563eb"/>
            <path transform="translate(406,388)" d="m0 0h8l8 3 7 7 3 9-1 7-4 8-6 5h-2l2 8 2 12 3 12 1 12h-34l5-29 2-16-5-2-4-5-2-6v-9l4-8 7-6z" fill="#e0f2fe"/>
            <path transform="translate(491,717)" d="m0 0 14 1 11 4 2 1-1 8-2 7-5-1-4-2h-16l-6 4-3 4-2 10 1 9 4 6 8 4h11l8-3 4 1 4 10v3l-11 5-5 1h-13l-10-3-9-6-6-7-4-8-1-5v-13l2-8 6-10 6-5 7-4z" fill="#2563eb"/>
            <path transform="translate(554,198)" d="m0 0 9 1 5 4 2 5v12l5 12 11 7 5 2 13 6 7-1 11-3h7l10 4 8 7 4 5 1 7-3 4-6 1-5-4-5-6-4-2h-8l-6 2-5 7-2 1h-8l-5-4-2-4v-4l-9-3-13-7-8-6-5-7-4-11-6-4-3-6v-6l4-6z" fill="#2563eb"/>
            <path transform="translate(886,690)" d="m0 0h12l4 1 1 2v91l-1 3h-17l-1-1v-94z" fill="#2563eb"/>
            <path transform="translate(733,826)" d="m0 0h5l2 7v17l4-2 7-3 11 1 8 5 4 6 2 10-2 9-4 7-8 5-11 1-7-3-4-3-1 5h-5l-2-6v-32z" fill="#2563eb"/>
            <path transform="translate(444,826)" d="m0 0 4 1v60l-5 1-3-4-7 4-10 1-8-3-5-5-4-7-1-11 3-8 5-6 7-3h12l8 4 1-23z" fill="#2563eb"/>
            <path transform="translate(289,826)" d="m0 0h8l5 8 14 26 4 5 15-30 5-8 1-1h8l2 1v31l-1 29-5 1-2-1-1-5v-40l-1-1-18 34-2 2-5-1-13-25-6-11-1 47-1 1h-5l-2-2v-59z" fill="#2563eb"/>
            <path transform="translate(308,717)" d="m0 0 5 1 1 3v11l-1 3-11 1-7 3-4 7-2 40-15 1-1-8v-48l1-10 5-1h9l3 4 8-5z" fill="#2563eb"/>
            <path transform="translate(563,273)" d="m0 0 10 1 5 6 1 9 6 7 5 2 10-6 4-2 7 1 3 4v5l-8 6-9 6-6 7-4 9-3 8-5 3-6-2-2-3 1-8 4-11 2-2-1-5-10-10-8-4-3-3-1-3v-7l4-6z" fill="#2563eb"/>
            <path transform="translate(557,718)" d="m0 0h11l1 1v15l-15 3-6 7-1 3-2 39-1 1h-13l-2-7v-58l4-2h11l2 6 7-6z" fill="#2563eb"/>
            <path transform="translate(211,826)" d="m0 0h7l4 9 15 36 5 14-1 3h-5l-3-5-4-9v-2h-27l-6 15-1 1-7-1 3-9 6-16 10-27z" fill="#2563eb"/>
            <path transform="translate(441,522)" d="m0 0 4 2 8 7 12 5 10 3 7 9 8 5 17 3 3 3v7l-2 3-3 1h-11l-14-5-10-8-6-5-15-5-10-8-6-7-1-6z" fill="#2563eb"/>
            <path transform="translate(639,733)" d="m0 0 11 1 8 7 3 10-2 12-6 8-8 3-8-1-7-3-3-3-3-8v-11l5-10 6-4z" fill="#e0f2fe"/>
            <path transform="translate(576,719)" d="m0 0h17v68h-17l-1-2z" fill="#2563eb"/>
            <path transform="translate(373,846)" d="m0 0h15l8 6 4 10v6l-1 1h-32l2 7 1 3 5 2h12l8-4 3 3-2 4-7 4-5 1h-7l-8-3-5-4-4-8-1-5 1-10 5-8z" fill="#2563eb"/>
            <path transform="translate(798,845)" d="m0 0 11 1 6 4 4 5 2 5v9h-32l2 7 5 5 8 1 9-3 5-1 1 5-5 4-9 2-11-1-8-6-4-7-1-4v-9l4-9 7-6z" fill="#2563eb"/>
            <path transform="translate(527,846)" d="m0 0h12l7 3 4 5 1 2v31l-1 1h-5l-1-3-4 2-6 2-10-1-5-3-3-6 1-9 7-6 6-1h14l-2-8-3-2h-11l-7 2-2-5 5-3z" fill="#2563eb"/>
            <path transform="translate(558,404)" d="m0 0 7 1 3 4-1 14 3 8 6 10 6 5 2 3v7l-4 6-4 3-10-1-5-5-1-2v-8l1-5-5-8-4-11v-12l3-7z" fill="#2563eb"/>
            <path transform="translate(493,472)" d="m0 0 5 1 4 4-1 9-4 14-4 10 1 9 4 2 6 5v6l-4 4h-6l-8-5-7-9-1-3v-13l5-13 3-9 2-9z" fill="#2563eb"/>
            <path transform="translate(598,467)" d="m0 0 7 1 3 2v10l-7 11-8 8-10 5-9 2-17-1-5-4-1-5 3-5 2-1h17l8-2 6-4 6-8 3-7z" fill="#2563eb"/>
            <path transform="translate(610,826)" d="m0 0h12l10 5 1 4-3 3-4-2-7-3-9 1-4 2-1 2v8l5 4 19 8 5 5 1 3v11l-4 6-5 4-6 2h-10l-12-5-3-3 2-5h4l7 4 2 1h10l6-3 1-2v-8l-4-4-18-7-6-5-2-4v-11l3-5 6-5z" fill="#2563eb"/>
            <path transform="translate(751,851)" d="m0 0 9 1 6 5 2 5v11l-5 7-8 3-9-2-6-7-1-8 3-9 6-5z" fill="#e0f2fe"/>
            <path transform="translate(421,852)" d="m0 0h11l6 4 3 6v11l-4 6-4 3h-11l-7-6-2-9 2-10z" fill="#e0f2fe"/>
            <path transform="translate(554,327)" d="m0 0h5l5 5 3 12 1 11-2 12-3 6-6 2-5-2-2-6 2-8v-11l-3-10v-6z" fill="#2563eb"/>
            <path transform="translate(492,845)" d="m0 0h9l9 4 1 3-2 3-9-3h-8l-7 4-3 7 1 10 4 6 4 2h11l6-3h2l2 4-5 5-5 2h-10l-8-3-5-4-4-7-1-4v-10l4-8 7-6z" fill="#2563eb"/>
            <path transform="translate(660,845)" d="m0 0 11 1 6 4-1 4-2 1-8-3-10 1-5 5-2 5v8l3 6 6 4h11l4-3 4 1 1 4-5 4-8 2-9-1-6-3-5-5-4-8v-10l3-7 5-6 6-3z" fill="#2563eb"/>
            <path transform="translate(144,716)" d="m0 0 4 2 10 26v4h-25l3-10z" fill="#e0f2fe"/>
            <path transform="translate(828,714)" d="m0 0 2 1 8 23 3 10h-25l1-5z" fill="#e0f2fe"/>
            <path transform="translate(563,827)" d="m0 0h6l1 22v37l-3 2-4-1-1-1v-53z" fill="#2563eb"/>
            <path transform="translate(251,826)" d="m0 0h5l1 1v60l-7 1v-61z" fill="#2563eb"/>
            <path transform="translate(346,756)" d="m0 0h13l1 7-3 6-6 5-6 2h-7l-5-5-1-7 4-5z" fill="#e0f2fe"/>
            <path transform="translate(704,845)" d="m0 0 4 1 1 4-1 2-10 3-3 5-1 3-1 25h-7v-41h7l1 4 6-5z" fill="#2563eb"/>
            <path transform="translate(717,731)" d="m0 0 9 2 6 5 2 4v4h-30l-2-1 1-5 5-6z" fill="#e0f2fe"/>
            <path transform="translate(214,835)" d="m0 0 3 4 9 23v2l-23 1 7-20z" fill="#e0f2fe"/>
            <path transform="translate(582,690)" d="m0 0 8 1 4 4 1 2v6l-4 5-2 1h-10l-4-5-1-7 2-4z" fill="#2563eb"/>
            <path transform="translate(461,846)" d="m0 0 4 1 1 4v13l-1 23-1 1h-5l-1-5v-36z" fill="#2563eb"/>
            <path transform="translate(715,846)" d="m0 0h5l1 1v40l-5 1-2-2v-38z" fill="#2563eb"/>
            <path transform="translate(378,851)" d="m0 0h7l5 3 3 7v3h-25l-1-3 3-6 4-3z" fill="#e0f2fe"/>
            <path transform="translate(798,851)" d="m0 0h7l6 3 3 5v5h-25l1-7 5-5z" fill="#e0f2fe"/>
            <path transform="translate(533,868)" d="m0 0h11v7l-3 5-3 2-8 1-6-3v-7l4-4z" fill="#e0f2fe"/>
            <path transform="translate(459,827)" d="m0 0 5 1 2 2-1 5-1 1h-5l-2-3 1-4z" fill="#2563eb"/>
            <path transform="translate(715,828)" d="m0 0h5l2 3-1 5h-6l-2-2 1-5z" fill="#2563eb"/>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black heading-font italic leading-none tracking-tighter text-xl ${theme === 'light' ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
            AuraScribe
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
