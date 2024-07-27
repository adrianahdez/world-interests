(()=>{"use strict";var n,e,t={407:(n,e,t)=>{var o=t(540),r=t(338),a=(t(274),t(72)),i=t.n(a),A=t(825),c=t.n(A),l=t(659),s=t.n(l),d=t(56),p=t.n(d),h=t(159),u=t.n(h),f=t(113),g=t.n(f),m=t(568),E={};E.styleTagTransform=g(),E.setAttributes=p(),E.insert=s().bind(null,"head"),E.domAPI=c(),E.insertStyleElement=u();i()(m.A,E);m.A&&m.A.locals&&m.A.locals;var b=(0,o.lazy)((function(){return Promise.all([t.e(481),t.e(386),t.e(99),t.e(323)]).then(t.bind(t,99))})),v=function(){return o.createElement("div",{className:"pageLoading"},"Loading...")};(0,r.H)(document.getElementById("app")).render(o.createElement(o.Suspense,{fallback:o.createElement(v,null)},o.createElement(b,null)))},568:(n,e,t)=>{t.d(e,{A:()=>A});var o=t(354),r=t.n(o),a=t(314),i=t.n(a)()(r());i.push([n.id,":root {\n  --page-bg: rgb(26, 63, 73);\n  --country-delimiter-color: #5f4e57;\n  --country-fill-color: #1d1a16;\n  --page-text-color: #ddcfcf;\n  /* This is used to set the height of the map, so adjust based on the real footer height counting the vertical paddings, min-height, etc. */\n  --footer-height: 103.5px;\n  --link-color: #1fa2e1;\n  --menu-margin-top: 70px;\n  --menu-margin-bottom: 40px;\n  --distance-btw-content-and-footer: 24px;\n}\n\n@media screen and (max-width: 604px) {\n  :root {\n    --footer-height: 145px;\n  }\n  \n}\n\nhtml,\nbody {\n  max-width: 100%;\n  overflow-x: hidden\n}\n\nbody,\nh1,\nh1 small {\n  margin: 0;\n  padding: 0;\n  font-family: 'Roboto', sans-serif;\n  font-weight: 300;\n}\n\n* {\n  box-sizing: border-box;\n}\n\n.map-container,\n#app,\n.app-container {\n  width: 100%;\n}\n\n.map-container,\n#app {\n  height: calc(100vh - var(--footer-height));\n}\n\n#app {\n  height: 100vh;\n}\n\n.app-container {\n  height: 100vh;\n  position: relative;\n}\n\n.map-container img {\n  width: 100%;\n  max-width: 100%\n}\n\na,\na:focus,\na:hover {\n  text-decoration: none\n}\n\n.leaflet-bottom {\n  bottom: unset;\n  top: 0;\n}\n\n.pageLoading {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  width: 100%;\n  background-color: var(--page-bg);\n  position: fixed;\n  color: var(--page-text-color);\n  font-size: 36px;\n}","",{version:3,sources:["webpack://./src/main.css"],names:[],mappings:"AAAA;EACE,0BAA0B;EAC1B,kCAAkC;EAClC,6BAA6B;EAC7B,0BAA0B;EAC1B,0IAA0I;EAC1I,wBAAwB;EACxB,qBAAqB;EACrB,uBAAuB;EACvB,0BAA0B;EAC1B,uCAAuC;AACzC;;AAEA;EACE;IACE,sBAAsB;EACxB;;AAEF;;AAEA;;EAEE,eAAe;EACf;AACF;;AAEA;;;EAGE,SAAS;EACT,UAAU;EACV,iCAAiC;EACjC,gBAAgB;AAClB;;AAEA;EACE,sBAAsB;AACxB;;AAEA;;;EAGE,WAAW;AACb;;AAEA;;EAEE,0CAA0C;AAC5C;;AAEA;EACE,aAAa;AACf;;AAEA;EACE,aAAa;EACb,kBAAkB;AACpB;;AAEA;EACE,WAAW;EACX;AACF;;AAEA;;;EAGE;AACF;;AAEA;EACE,aAAa;EACb,MAAM;AACR;;AAEA;EACE,aAAa;EACb,uBAAuB;EACvB,mBAAmB;EACnB,aAAa;EACb,WAAW;EACX,gCAAgC;EAChC,eAAe;EACf,6BAA6B;EAC7B,eAAe;AACjB",sourcesContent:[":root {\n  --page-bg: rgb(26, 63, 73);\n  --country-delimiter-color: #5f4e57;\n  --country-fill-color: #1d1a16;\n  --page-text-color: #ddcfcf;\n  /* This is used to set the height of the map, so adjust based on the real footer height counting the vertical paddings, min-height, etc. */\n  --footer-height: 103.5px;\n  --link-color: #1fa2e1;\n  --menu-margin-top: 70px;\n  --menu-margin-bottom: 40px;\n  --distance-btw-content-and-footer: 24px;\n}\n\n@media screen and (max-width: 604px) {\n  :root {\n    --footer-height: 145px;\n  }\n  \n}\n\nhtml,\nbody {\n  max-width: 100%;\n  overflow-x: hidden\n}\n\nbody,\nh1,\nh1 small {\n  margin: 0;\n  padding: 0;\n  font-family: 'Roboto', sans-serif;\n  font-weight: 300;\n}\n\n* {\n  box-sizing: border-box;\n}\n\n.map-container,\n#app,\n.app-container {\n  width: 100%;\n}\n\n.map-container,\n#app {\n  height: calc(100vh - var(--footer-height));\n}\n\n#app {\n  height: 100vh;\n}\n\n.app-container {\n  height: 100vh;\n  position: relative;\n}\n\n.map-container img {\n  width: 100%;\n  max-width: 100%\n}\n\na,\na:focus,\na:hover {\n  text-decoration: none\n}\n\n.leaflet-bottom {\n  bottom: unset;\n  top: 0;\n}\n\n.pageLoading {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  width: 100%;\n  background-color: var(--page-bg);\n  position: fixed;\n  color: var(--page-text-color);\n  font-size: 36px;\n}"],sourceRoot:""}]);const A=i}},o={};function r(n){var e=o[n];if(void 0!==e)return e.exports;var a=o[n]={id:n,exports:{}};return t[n].call(a.exports,a,a.exports,r),a.exports}r.m=t,n=[],r.O=(e,t,o,a)=>{if(!t){var i=1/0;for(s=0;s<n.length;s++){for(var[t,o,a]=n[s],A=!0,c=0;c<t.length;c++)(!1&a||i>=a)&&Object.keys(r.O).every((n=>r.O[n](t[c])))?t.splice(c--,1):(A=!1,a<i&&(i=a));if(A){n.splice(s--,1);var l=o();void 0!==l&&(e=l)}}return e}a=a||0;for(var s=n.length;s>0&&n[s-1][2]>a;s--)n[s]=n[s-1];n[s]=[t,o,a]},r.n=n=>{var e=n&&n.__esModule?()=>n.default:()=>n;return r.d(e,{a:e}),e},r.d=(n,e)=>{for(var t in e)r.o(e,t)&&!r.o(n,t)&&Object.defineProperty(n,t,{enumerable:!0,get:e[t]})},r.f={},r.e=n=>Promise.all(Object.keys(r.f).reduce(((e,t)=>(r.f[t](n,e),e)),[])),r.u=n=>n+"."+{99:"17d0e6a8d931fa15dd22",323:"c47db27825ab526c0642",386:"f5208f8b7e54eb0a6bba",481:"742eb0805a88c41a4fe6"}[n]+".js",r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(n){if("object"==typeof window)return window}}(),r.o=(n,e)=>Object.prototype.hasOwnProperty.call(n,e),e={},r.l=(n,t,o,a)=>{if(e[n])e[n].push(t);else{var i,A;if(void 0!==o)for(var c=document.getElementsByTagName("script"),l=0;l<c.length;l++){var s=c[l];if(s.getAttribute("src")==n){i=s;break}}i||(A=!0,(i=document.createElement("script")).charset="utf-8",i.timeout=120,r.nc&&i.setAttribute("nonce",r.nc),i.src=n),e[n]=[t];var d=(t,o)=>{i.onerror=i.onload=null,clearTimeout(p);var r=e[n];if(delete e[n],i.parentNode&&i.parentNode.removeChild(i),r&&r.forEach((n=>n(o))),t)return t(o)},p=setTimeout(d.bind(null,void 0,{type:"timeout",target:i}),12e4);i.onerror=d.bind(null,i.onerror),i.onload=d.bind(null,i.onload),A&&document.head.appendChild(i)}},r.r=n=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},(()=>{var n;r.g.importScripts&&(n=r.g.location+"");var e=r.g.document;if(!n&&e&&(e.currentScript&&(n=e.currentScript.src),!n)){var t=e.getElementsByTagName("script");if(t.length)for(var o=t.length-1;o>-1&&(!n||!/^http(s?):/.test(n));)n=t[o--].src}if(!n)throw new Error("Automatic publicPath is not supported in this browser");n=n.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),r.p=n})(),(()=>{r.b=document.baseURI||self.location.href;var n={792:0};r.f.j=(e,t)=>{var o=r.o(n,e)?n[e]:void 0;if(0!==o)if(o)t.push(o[2]);else{var a=new Promise(((t,r)=>o=n[e]=[t,r]));t.push(o[2]=a);var i=r.p+r.u(e),A=new Error;r.l(i,(t=>{if(r.o(n,e)&&(0!==(o=n[e])&&(n[e]=void 0),o)){var a=t&&("load"===t.type?"missing":t.type),i=t&&t.target&&t.target.src;A.message="Loading chunk "+e+" failed.\n("+a+": "+i+")",A.name="ChunkLoadError",A.type=a,A.request=i,o[1](A)}}),"chunk-"+e,e)}},r.O.j=e=>0===n[e];var e=(e,t)=>{var o,a,[i,A,c]=t,l=0;if(i.some((e=>0!==n[e]))){for(o in A)r.o(A,o)&&(r.m[o]=A[o]);if(c)var s=c(r)}for(e&&e(t);l<i.length;l++)a=i[l],r.o(n,a)&&n[a]&&n[a][0](),n[a]=0;return r.O(s)},t=self.webpackChunk=self.webpackChunk||[];t.forEach(e.bind(null,0)),t.push=e.bind(null,t.push.bind(t))})(),r.nc=void 0;var a=r.O(void 0,[85],(()=>r(407)));a=r.O(a)})();
//# sourceMappingURL=main.02f5aa6601bde52ff5a4.js.map