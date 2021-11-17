/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@waves.exchange/provider-web/dist/provider-web.es.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@waves.exchange/provider-web/dist/provider-web.es.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ProviderWeb": () => (/* binding */ ProviderWeb)
/* harmony export */ });
/* harmony import */ var _waves_waves_browser_bus__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @waves/waves-browser-bus */ "./node_modules/@waves/waves-browser-bus/dist/index.js");
/* harmony import */ var _waves_waves_browser_bus__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_waves_waves_browser_bus__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var typed_ts_events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! typed-ts-events */ "./node_modules/typed-ts-events/dist/events.min.js");
/* harmony import */ var typed_ts_events__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(typed_ts_events__WEBPACK_IMPORTED_MODULE_1__);
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));


class Queue {
  constructor(maxLength) {
    this._actions = [];
    this._maxLength = maxLength;
  }
  get length() {
    return this._actions.length + (this._active == null ? 0 : 1);
  }
  push(action) {
    if (this._actions.length >= this._maxLength) {
      throw new Error("Cant't push action! Queue is full!");
    }
    return new Promise((resolve, reject) => {
      const onEnd = () => {
        this._active = void 0;
        const index = this._actions.map((x) => x.action).indexOf(actionCallback);
        if (index !== -1) {
          this._actions.splice(index, 1);
        }
        this.run();
      };
      const actionCallback = () => action().then((res) => {
        onEnd();
        resolve(res);
      }, (err) => {
        onEnd();
        reject(err);
      });
      this._actions.push({ action: actionCallback, reject });
      if (this.length === 1) {
        this.run();
      }
    });
  }
  clear(error) {
    error = error || new Error("Rejection with clear queue!");
    const e = typeof error === "string" ? new Error(error) : error;
    this._actions.splice(0, this._actions.length).forEach((item) => item.reject(e));
    this._active = void 0;
  }
  canPush() {
    return this._actions.length < this._maxLength;
  }
  run() {
    const item = this._actions.shift();
    if (item == null) {
      return void 0;
    }
    this._active = item.action();
  }
}
const createError = (error) => {
  const commonError = {
    code: 0,
    message: (error == null ? void 0 : error.message) || error
  };
  switch (error == null ? void 0 : error.message) {
    case "SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.":
      return __spreadProps(__spreadValues({}, commonError), {
        message: "Local storage is not available! It is possible that the Browser is in incognito mode!"
      });
    default:
      return commonError;
  }
};
class Transport {
  constructor(queueLength) {
    this._events = [];
    this._toRunEvents = [];
    this._queue = new Queue(queueLength);
  }
  dropConnection() {
    this._queue.clear(new Error("User rejection!"));
    this._events.forEach((event) => this._toRunEvents.push(event));
    this._dropTransportConnect();
  }
  sendEvent(callback) {
    this._events.push(callback);
    this._toRunEvents.push(callback);
  }
  dialog(callback) {
    this._runBeforeShow();
    return this._getBus().then((bus) => {
      const action = this._wrapAction(() => callback(bus));
      this._runEvents(bus);
      if (this._queue.canPush()) {
        return this._queue.push(action).then((result) => {
          this._runAfterShow();
          return result;
        }).catch((error) => {
          this._runAfterShow();
          return Promise.reject(createError(error));
        });
      } else {
        return Promise.reject(new Error("Queue is full!"));
      }
    });
  }
  _runBeforeShow() {
    if (this._queue.length === 0) {
      this._beforeShow();
    }
  }
  _runAfterShow() {
    if (this._queue.length === 0) {
      this._afterShow();
    }
  }
  _runEvents(bus) {
    this._toRunEvents.splice(0, this._events.length).forEach((callback) => callback(bus));
  }
  _wrapAction(action) {
    return this._toRunEvents ? () => {
      const result = action();
      result.catch(() => {
        this._events.forEach((event) => this._toRunEvents.push(event));
      });
      return result;
    } : action;
  }
}
const _TransportIframe = class extends Transport {
  constructor(url, queueLength) {
    super(queueLength);
    this._url = url;
    this._initIframe();
  }
  get() {
    if (!this._iframe) {
      this._initIframe();
    }
    return this._iframe;
  }
  _dropTransportConnect() {
    if (this._iframe != null) {
      document.body.removeChild(this._iframe);
      this._initIframe();
    }
    if (this._bus) {
      this._bus.destroy();
      this._bus = void 0;
    }
  }
  _getBus() {
    if (this._bus) {
      return Promise.resolve(this._bus);
    }
    return _waves_waves_browser_bus__WEBPACK_IMPORTED_MODULE_0__.WindowAdapter.createSimpleWindowAdapter(this._iframe).then((adapter) => new Promise((resolve) => {
      this._bus = new _waves_waves_browser_bus__WEBPACK_IMPORTED_MODULE_0__.Bus(adapter, -1);
      this._bus.once("ready", () => {
        resolve(this._bus);
      });
    }));
  }
  _beforeShow() {
    this._showIframe();
  }
  _afterShow() {
    this._hideIframe();
  }
  _initIframe() {
    this._iframe = this._createIframe();
    this._addIframeToDom(this._iframe);
    this._listenFetchURLError(this._iframe);
    this._hideIframe();
  }
  _addIframeToDom(iframe) {
    if (document.body != null) {
      document.body.appendChild(iframe);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(iframe);
      });
    }
  }
  _createIframe() {
    const iframe = document.createElement("iframe");
    iframe.style.transition = "opacity .2s";
    iframe.style.position = "absolute";
    iframe.style.opacity = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.left = "0";
    iframe.style.top = "0";
    iframe.style.border = "none";
    iframe.style.position = "fixed";
    return iframe;
  }
  _showIframe() {
    const shownStyles = {
      width: "100%",
      height: "100%",
      left: "0",
      top: "0",
      border: "none",
      position: "fixed",
      display: "block",
      opacity: "0",
      zIndex: "99999999"
    };
    this._applyStyle(shownStyles);
    if (_TransportIframe._timer != null) {
      clearTimeout(_TransportIframe._timer);
    }
    _TransportIframe._timer = setTimeout(() => {
      this._applyStyle({ opacity: "1" });
    }, 0);
  }
  _hideIframe() {
    const hiddenStyle = {
      opacity: "0"
    };
    this._applyStyle(hiddenStyle);
    if (_TransportIframe._timer != null) {
      clearTimeout(_TransportIframe._timer);
    }
    _TransportIframe._timer = setTimeout(() => {
      this._applyStyle({
        width: "10px",
        height: "10px",
        left: "-100px",
        top: "-100px",
        position: "absolute",
        opacity: "0",
        zIndex: "0",
        display: "none"
      });
    }, 200);
  }
  _applyStyle(styles) {
    Object.entries(styles).forEach(([name, value]) => {
      if (value != null) {
        if (this._iframe) {
          this._iframe.style[name] = value;
        }
      }
    });
  }
  _renderErrorPage(bodyElement, onClose, errorMessage) {
    if (bodyElement.parentElement) {
      bodyElement.parentElement.style.height = "100%";
    }
    Object.assign(bodyElement.style, {
      position: "relative",
      boxSizing: "border-box",
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      margin: "0px"
    });
    const backdropElement = document.createElement("div");
    Object.assign(backdropElement.style, {
      position: "fixed",
      zIndex: "-1",
      height: "100%",
      width: "100%",
      overflow: "hidden",
      backgroundColor: "#000",
      opacity: "0.6"
    });
    const wrapperElement = document.createElement("div");
    Object.assign(wrapperElement.style, {
      position: "fixed",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      margin: "0",
      backgroundColor: "#292F3C",
      width: "520px",
      borderRadius: "6px",
      padding: "40px",
      boxSizing: "border-box"
    });
    const errorMessageElement = document.createElement("div");
    errorMessageElement.textContent = errorMessage;
    Object.assign(errorMessageElement.style, {
      fontSize: "15px",
      lineHeight: "20px",
      color: "#fff",
      marginBottom: "40px",
      fontFamily: "Roboto, sans-serif"
    });
    const buttonElement = document.createElement("button");
    buttonElement.textContent = "OK";
    buttonElement.addEventListener("click", () => onClose());
    Object.assign(buttonElement.style, {
      width: "100%",
      fontSize: "15px",
      lineHeight: "48px",
      padding: " 0 40px",
      color: "#fff",
      backgroundColor: "#5A81EA",
      outline: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "Roboto, sans-serif",
      borderRadius: "4px"
    });
    wrapperElement.appendChild(errorMessageElement);
    wrapperElement.appendChild(buttonElement);
    bodyElement.appendChild(backdropElement);
    bodyElement.appendChild(wrapperElement);
  }
  _listenFetchURLError(iframe) {
    fetch(this._url).catch(() => {
      iframe.addEventListener("load", () => {
        if (!iframe.contentDocument) {
          return;
        }
        this._renderErrorPage(iframe.contentDocument.body, () => this.dropConnection(), "The request could not be processed. To resume your further work, disable the installed plugins.");
        this._showIframe();
      });
    });
  }
};
let TransportIframe = _TransportIframe;
TransportIframe._timer = null;
function isBrave() {
  var _a;
  return !!((_a = navigator.brave) == null ? void 0 : _a.isBrave);
}
function isSafari() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isSafariUA = userAgent.includes("safari") && !userAgent.includes("chrome");
  const iOS = navigator.platform != null && /iPad|iPhone|iPod/.test(navigator.platform);
  return iOS || isSafariUA;
}
class ProviderWeb {
  constructor(clientUrl, logs) {
    this.user = null;
    this.emitter = new typed_ts_events__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
    this._clientUrl = (clientUrl || "https://waves.exchange/signer/") + `?${ProviderWeb._getCacheClean()}`;
    this._transport = new TransportIframe(this._clientUrl, 3);
    if (logs === true) {
      _waves_waves_browser_bus__WEBPACK_IMPORTED_MODULE_0__.config.console.logLevel = _waves_waves_browser_bus__WEBPACK_IMPORTED_MODULE_0__.config.console.LOG_LEVEL.VERBOSE;
    }
  }
  static _getCacheClean() {
    return String(Date.now() % (1e3 * 60));
  }
  on(event, handler) {
    this.emitter.on(event, handler);
    return this;
  }
  once(event, handler) {
    this.emitter.once(event, handler);
    return this;
  }
  off(event, handler) {
    this.emitter.once(event, handler);
    return this;
  }
  connect(options) {
    return Promise.resolve(this._transport.sendEvent((bus) => bus.dispatchEvent("connect", options)));
  }
  logout() {
    this.user = null;
    return Promise.resolve(this._transport.dropConnection());
  }
  login() {
    var _a;
    if (this.user) {
      return Promise.resolve(this.user);
    }
    const iframe = this._transport.get();
    if (isSafari() || isBrave()) {
      const win = (_a = iframe.contentWindow) == null ? void 0 : _a.open(this._clientUrl);
      if (!win) {
        throw new Error("Window was blocked");
      }
    }
    iframe.src = this._clientUrl;
    return this._transport.dialog((bus) => bus.request("login").then((userData) => {
      this.user = userData;
      return userData;
    }).catch((err) => {
      this._transport.dropConnection();
      return Promise.reject(createError(err));
    }));
  }
  signMessage(data) {
    return this.login().then(() => this._transport.dialog((bus) => bus.request("sign-message", data)));
  }
  signTypedData(data) {
    return this.login().then(() => this._transport.dialog((bus) => bus.request("sign-typed-data", data)));
  }
  sign(toSign) {
    return this.login().then(() => this._transport.dialog((bus) => bus.request("sign", toSign)));
  }
}



/***/ }),

/***/ "./node_modules/@waves/bignumber/dist/bignumber.umd.min.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@waves/bignumber/dist/bignumber.umd.min.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports) {

!function(e,t){ true?t(exports):0}(this,function(e){"use strict";var t=/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,n=Math.ceil,r=Math.floor,i="[BigNumber Error] ",o=i+"Number primitive has more than 15 significant digits: ",u=1e14,s=14,f=9007199254740991,c=[1,10,100,1e3,1e4,1e5,1e6,1e7,1e8,1e9,1e10,1e11,1e12,1e13],l=1e7,a=1e9;function h(e){var t=0|e;return e>0||e===t?t:t-1}function p(e){for(var t,n,r=1,i=e.length,o=e[0]+"";r<i;){for(t=e[r++]+"",n=s-t.length;n--;t="0"+t);o+=t}for(i=o.length;48===o.charCodeAt(--i););return o.slice(0,i+1||1)}function g(e,t){var n,r,i=e.c,o=t.c,u=e.s,s=t.s,f=e.e,c=t.e;if(!u||!s)return null;if(n=i&&!i[0],r=o&&!o[0],n||r)return n?r?0:-s:u;if(u!=s)return u;if(n=u<0,r=f==c,!i||!o)return r?0:!i^n?1:-1;if(!r)return f>c^n?1:-1;for(s=(f=i.length)<(c=o.length)?f:c,u=0;u<s;u++)if(i[u]!=o[u])return i[u]>o[u]^n?1:-1;return f==c?0:f>c^n?1:-1}function m(e,t,n,o){if(e<t||e>n||e!==r(e))throw Error(i+(o||"Argument")+("number"==typeof e?e<t||e>n?" out of range: ":" not an integer: ":" not a primitive number: ")+String(e))}function N(e){var t=e.c.length-1;return h(e.e/s)==t&&e.c[t]%2!=0}function b(e,t){return(e.length>1?e.charAt(0)+"."+e.slice(1):e)+(t<0?"e":"e+")+t}function w(e,t,n){var r,i;if(t<0){for(i=n+".";++t;i+=n);e=i+e}else if(++t>(r=e.length)){for(i=n,t-=r;--t;i+=n);e+=i}else t<r&&(e=e.slice(0,t)+"."+e.slice(t));return e}var d=function e(d){var y,O,v,E,A,_,U,R,D,L=H.prototype={constructor:H,toString:null,valueOf:null},B=new H(1),S=20,F=4,I=-7,M=21,x=-1e7,P=1e7,T=!1,C=1,G=0,j={prefix:"",groupSize:3,secondaryGroupSize:0,groupSeparator:",",decimalSeparator:".",fractionGroupSize:0,fractionGroupSeparator:" ",suffix:""},q="0123456789abcdefghijklmnopqrstuvwxyz";function H(e,n){var i,u,c,l,a,h,p,g,N=this;if(!(N instanceof H))return new H(e,n);if(null==n){if(e&&!0===e._isBigNumber)return N.s=e.s,void(!e.c||e.e>P?N.c=N.e=null:e.e<x?N.c=[N.e=0]:(N.e=e.e,N.c=e.c.slice()));if((h="number"==typeof e)&&0*e==0){if(N.s=1/e<0?(e=-e,-1):1,e===~~e){for(l=0,a=e;a>=10;a/=10,l++);return void(l>P?N.c=N.e=null:(N.e=l,N.c=[e]))}g=String(e)}else{if(!t.test(g=String(e)))return v(N,g,h);N.s=45==g.charCodeAt(0)?(g=g.slice(1),-1):1}(l=g.indexOf("."))>-1&&(g=g.replace(".","")),(a=g.search(/e/i))>0?(l<0&&(l=a),l+=+g.slice(a+1),g=g.substring(0,a)):l<0&&(l=g.length)}else{if(m(n,2,q.length,"Base"),10==n)return z(N=new H(e),S+N.e+1,F);if(g=String(e),h="number"==typeof e){if(0*e!=0)return v(N,g,h,n);if(N.s=1/e<0?(g=g.slice(1),-1):1,H.DEBUG&&g.replace(/^0\.0*|\./,"").length>15)throw Error(o+e)}else N.s=45===g.charCodeAt(0)?(g=g.slice(1),-1):1;for(i=q.slice(0,n),l=a=0,p=g.length;a<p;a++)if(i.indexOf(u=g.charAt(a))<0){if("."==u){if(a>l){l=p;continue}}else if(!c&&(g==g.toUpperCase()&&(g=g.toLowerCase())||g==g.toLowerCase()&&(g=g.toUpperCase()))){c=!0,a=-1,l=0;continue}return v(N,String(e),h,n)}h=!1,(l=(g=O(g,n,10,N.s)).indexOf("."))>-1?g=g.replace(".",""):l=g.length}for(a=0;48===g.charCodeAt(a);a++);for(p=g.length;48===g.charCodeAt(--p););if(g=g.slice(a,++p)){if(p-=a,h&&H.DEBUG&&p>15&&(e>f||e!==r(e)))throw Error(o+N.s*e);if((l=l-a-1)>P)N.c=N.e=null;else if(l<x)N.c=[N.e=0];else{if(N.e=l,N.c=[],a=(l+1)%s,l<0&&(a+=s),a<p){for(a&&N.c.push(+g.slice(0,a)),p-=s;a<p;)N.c.push(+g.slice(a,a+=s));a=s-(g=g.slice(a)).length}else a-=p;for(;a--;g+="0");N.c.push(+g)}}else N.c=[N.e=0]}function V(e,t,n,r){var i,o,u,s,f;if(null==n?n=F:m(n,0,8),!e.c)return e.toString();if(i=e.c[0],u=e.e,null==t)f=p(e.c),f=1==r||2==r&&(u<=I||u>=M)?b(f,u):w(f,u,"0");else if(o=(e=z(new H(e),t,n)).e,s=(f=p(e.c)).length,1==r||2==r&&(t<=o||o<=I)){for(;s<t;f+="0",s++);f=b(f,o)}else if(t-=u,f=w(f,o,"0"),o+1>s){if(--t>0)for(f+=".";t--;f+="0");}else if((t+=o-s)>0)for(o+1==s&&(f+=".");t--;f+="0");return e.s<0&&i?"-"+f:f}function J(e,t){for(var n,r=1,i=new H(e[0]);r<e.length;r++){if(!(n=new H(e[r])).s){i=n;break}t.call(i,n)&&(i=n)}return i}function k(e,t,n){for(var r=1,i=t.length;!t[--i];t.pop());for(i=t[0];i>=10;i/=10,r++);return(n=r+n*s-1)>P?e.c=e.e=null:n<x?e.c=[e.e=0]:(e.e=n,e.c=t),e}function z(e,t,i,o){var f,l,a,h,p,g,m,N=e.c,b=c;if(N){e:{for(f=1,h=N[0];h>=10;h/=10,f++);if((l=t-f)<0)l+=s,a=t,m=(p=N[g=0])/b[f-a-1]%10|0;else if((g=n((l+1)/s))>=N.length){if(!o)break e;for(;N.length<=g;N.push(0));p=m=0,f=1,a=(l%=s)-s+1}else{for(p=h=N[g],f=1;h>=10;h/=10,f++);m=(a=(l%=s)-s+f)<0?0:p/b[f-a-1]%10|0}if(o=o||t<0||null!=N[g+1]||(a<0?p:p%b[f-a-1]),o=i<4?(m||o)&&(0==i||i==(e.s<0?3:2)):m>5||5==m&&(4==i||o||6==i&&(l>0?a>0?p/b[f-a]:0:N[g-1])%10&1||i==(e.s<0?8:7)),t<1||!N[0])return N.length=0,o?(t-=e.e+1,N[0]=b[(s-t%s)%s],e.e=-t||0):N[0]=e.e=0,e;if(0==l?(N.length=g,h=1,g--):(N.length=g+1,h=b[s-l],N[g]=a>0?r(p/b[f-a]%b[a])*h:0),o)for(;;){if(0==g){for(l=1,a=N[0];a>=10;a/=10,l++);for(a=N[0]+=h,h=1;a>=10;a/=10,h++);l!=h&&(e.e++,N[0]==u&&(N[0]=1));break}if(N[g]+=h,N[g]!=u)break;N[g--]=0,h=1}for(l=N.length;0===N[--l];N.pop());}e.e>P?e.c=e.e=null:e.e<x&&(e.c=[e.e=0])}return e}function $(e){var t,n=e.e;return null===n?e.toString():(t=p(e.c),t=n<=I||n>=M?b(t,n):w(t,n,"0"),e.s<0?"-"+t:t)}return H.clone=e,H.ROUND_UP=0,H.ROUND_DOWN=1,H.ROUND_CEIL=2,H.ROUND_FLOOR=3,H.ROUND_HALF_UP=4,H.ROUND_HALF_DOWN=5,H.ROUND_HALF_EVEN=6,H.ROUND_HALF_CEIL=7,H.ROUND_HALF_FLOOR=8,H.EUCLID=9,H.config=H.set=function(e){var t,n;if(null!=e){if("object"!=typeof e)throw Error(i+"Object expected: "+e);if(e.hasOwnProperty(t="DECIMAL_PLACES")&&(m(n=e[t],0,a,t),S=n),e.hasOwnProperty(t="ROUNDING_MODE")&&(m(n=e[t],0,8,t),F=n),e.hasOwnProperty(t="EXPONENTIAL_AT")&&((n=e[t])&&n.pop?(m(n[0],-a,0,t),m(n[1],0,a,t),I=n[0],M=n[1]):(m(n,-a,a,t),I=-(M=n<0?-n:n))),e.hasOwnProperty(t="RANGE"))if((n=e[t])&&n.pop)m(n[0],-a,-1,t),m(n[1],1,a,t),x=n[0],P=n[1];else{if(m(n,-a,a,t),!n)throw Error(i+t+" cannot be zero: "+n);x=-(P=n<0?-n:n)}if(e.hasOwnProperty(t="CRYPTO")){if((n=e[t])!==!!n)throw Error(i+t+" not true or false: "+n);if(n){if("undefined"==typeof crypto||!crypto||!crypto.getRandomValues&&!crypto.randomBytes)throw T=!n,Error(i+"crypto unavailable");T=n}else T=n}if(e.hasOwnProperty(t="MODULO_MODE")&&(m(n=e[t],0,9,t),C=n),e.hasOwnProperty(t="POW_PRECISION")&&(m(n=e[t],0,a,t),G=n),e.hasOwnProperty(t="FORMAT")){if("object"!=typeof(n=e[t]))throw Error(i+t+" not an object: "+n);j=n}if(e.hasOwnProperty(t="ALPHABET")){if("string"!=typeof(n=e[t])||/^.$|[+-.\s]|(.).*\1/.test(n))throw Error(i+t+" invalid: "+n);q=n}}return{DECIMAL_PLACES:S,ROUNDING_MODE:F,EXPONENTIAL_AT:[I,M],RANGE:[x,P],CRYPTO:T,MODULO_MODE:C,POW_PRECISION:G,FORMAT:j,ALPHABET:q}},H.isBigNumber=function(e){if(!e||!0!==e._isBigNumber)return!1;if(!H.DEBUG)return!0;var t,n,o=e.c,f=e.e,c=e.s;e:if("[object Array]"=={}.toString.call(o)){if((1===c||-1===c)&&f>=-a&&f<=a&&f===r(f)){if(0===o[0]){if(0===f&&1===o.length)return!0;break e}if((t=(f+1)%s)<1&&(t+=s),String(o[0]).length==t){for(t=0;t<o.length;t++)if((n=o[t])<0||n>=u||n!==r(n))break e;if(0!==n)return!0}}}else if(null===o&&null===f&&(null===c||1===c||-1===c))return!0;throw Error(i+"Invalid BigNumber: "+e)},H.maximum=H.max=function(){return J(arguments,L.lt)},H.minimum=H.min=function(){return J(arguments,L.gt)},H.random=(E=9007199254740992*Math.random()&2097151?function(){return r(9007199254740992*Math.random())}:function(){return 8388608*(1073741824*Math.random()|0)+(8388608*Math.random()|0)},function(e){var t,o,u,f,l,h=0,p=[],g=new H(B);if(null==e?e=S:m(e,0,a),f=n(e/s),T)if(crypto.getRandomValues){for(t=crypto.getRandomValues(new Uint32Array(f*=2));h<f;)(l=131072*t[h]+(t[h+1]>>>11))>=9e15?(o=crypto.getRandomValues(new Uint32Array(2)),t[h]=o[0],t[h+1]=o[1]):(p.push(l%1e14),h+=2);h=f/2}else{if(!crypto.randomBytes)throw T=!1,Error(i+"crypto unavailable");for(t=crypto.randomBytes(f*=7);h<f;)(l=281474976710656*(31&t[h])+1099511627776*t[h+1]+4294967296*t[h+2]+16777216*t[h+3]+(t[h+4]<<16)+(t[h+5]<<8)+t[h+6])>=9e15?crypto.randomBytes(7).copy(t,h):(p.push(l%1e14),h+=7);h=f/7}if(!T)for(;h<f;)(l=E())<9e15&&(p[h++]=l%1e14);for(f=p[--h],e%=s,f&&e&&(l=c[s-e],p[h]=r(f/l)*l);0===p[h];p.pop(),h--);if(h<0)p=[u=0];else{for(u=-1;0===p[0];p.splice(0,1),u-=s);for(h=1,l=p[0];l>=10;l/=10,h++);h<s&&(u-=s-h)}return g.e=u,g.c=p,g}),H.sum=function(){for(var e=1,t=arguments,n=new H(t[0]);e<t.length;)n=n.plus(t[e++]);return n},O=function(){function e(e,t,n,r){for(var i,o,u=[0],s=0,f=e.length;s<f;){for(o=u.length;o--;u[o]*=t);for(u[0]+=r.indexOf(e.charAt(s++)),i=0;i<u.length;i++)u[i]>n-1&&(null==u[i+1]&&(u[i+1]=0),u[i+1]+=u[i]/n|0,u[i]%=n)}return u.reverse()}return function(t,n,r,i,o){var u,s,f,c,l,a,h,g,m=t.indexOf("."),N=S,b=F;for(m>=0&&(c=G,G=0,t=t.replace(".",""),a=(g=new H(n)).pow(t.length-m),G=c,g.c=e(w(p(a.c),a.e,"0"),10,r,"0123456789"),g.e=g.c.length),f=c=(h=e(t,n,r,o?(u=q,"0123456789"):(u="0123456789",q))).length;0==h[--c];h.pop());if(!h[0])return u.charAt(0);if(m<0?--f:(a.c=h,a.e=f,a.s=i,h=(a=y(a,g,N,b,r)).c,l=a.r,f=a.e),m=h[s=f+N+1],c=r/2,l=l||s<0||null!=h[s+1],l=b<4?(null!=m||l)&&(0==b||b==(a.s<0?3:2)):m>c||m==c&&(4==b||l||6==b&&1&h[s-1]||b==(a.s<0?8:7)),s<1||!h[0])t=l?w(u.charAt(1),-N,u.charAt(0)):u.charAt(0);else{if(h.length=s,l)for(--r;++h[--s]>r;)h[s]=0,s||(++f,h=[1].concat(h));for(c=h.length;!h[--c];);for(m=0,t="";m<=c;t+=u.charAt(h[m++]));t=w(t,f,u.charAt(0))}return t}}(),y=function(){function e(e,t,n){var r,i,o,u,s=0,f=e.length,c=t%l,a=t/l|0;for(e=e.slice();f--;)s=((i=c*(o=e[f]%l)+(r=a*o+(u=e[f]/l|0)*c)%l*l+s)/n|0)+(r/l|0)+a*u,e[f]=i%n;return s&&(e=[s].concat(e)),e}function t(e,t,n,r){var i,o;if(n!=r)o=n>r?1:-1;else for(i=o=0;i<n;i++)if(e[i]!=t[i]){o=e[i]>t[i]?1:-1;break}return o}function n(e,t,n,r){for(var i=0;n--;)e[n]-=i,i=e[n]<t[n]?1:0,e[n]=i*r+e[n]-t[n];for(;!e[0]&&e.length>1;e.splice(0,1));}return function(i,o,f,c,l){var a,p,g,m,N,b,w,d,y,O,v,E,A,_,U,R,D,L=i.s==o.s?1:-1,B=i.c,S=o.c;if(!(B&&B[0]&&S&&S[0]))return new H(i.s&&o.s&&(B?!S||B[0]!=S[0]:S)?B&&0==B[0]||!S?0*L:L/0:NaN);for(y=(d=new H(L)).c=[],L=f+(p=i.e-o.e)+1,l||(l=u,p=h(i.e/s)-h(o.e/s),L=L/s|0),g=0;S[g]==(B[g]||0);g++);if(S[g]>(B[g]||0)&&p--,L<0)y.push(1),m=!0;else{for(_=B.length,R=S.length,g=0,L+=2,(N=r(l/(S[0]+1)))>1&&(S=e(S,N,l),B=e(B,N,l),R=S.length,_=B.length),A=R,v=(O=B.slice(0,R)).length;v<R;O[v++]=0);D=S.slice(),D=[0].concat(D),U=S[0],S[1]>=l/2&&U++;do{if(N=0,(a=t(S,O,R,v))<0){if(E=O[0],R!=v&&(E=E*l+(O[1]||0)),(N=r(E/U))>1)for(N>=l&&(N=l-1),w=(b=e(S,N,l)).length,v=O.length;1==t(b,O,w,v);)N--,n(b,R<w?D:S,w,l),w=b.length,a=1;else 0==N&&(a=N=1),w=(b=S.slice()).length;if(w<v&&(b=[0].concat(b)),n(O,b,v,l),v=O.length,-1==a)for(;t(S,O,R,v)<1;)N++,n(O,R<v?D:S,v,l),v=O.length}else 0===a&&(N++,O=[0]);y[g++]=N,O[0]?O[v++]=B[A]||0:(O=[B[A]],v=1)}while((A++<_||null!=O[0])&&L--);m=null!=O[0],y[0]||y.splice(0,1)}if(l==u){for(g=1,L=y[0];L>=10;L/=10,g++);z(d,f+(d.e=g+p*s-1)+1,c,m)}else d.e=p,d.r=+m;return d}}(),A=/^(-?)0([xbo])(?=\w[\w.]*$)/i,_=/^([^.]+)\.$/,U=/^\.([^.]+)$/,R=/^-?(Infinity|NaN)$/,D=/^\s*\+(?=[\w.])|^\s+|\s+$/g,v=function(e,t,n,r){var o,u=n?t:t.replace(D,"");if(R.test(u))e.s=isNaN(u)?null:u<0?-1:1;else{if(!n&&(u=u.replace(A,function(e,t,n){return o="x"==(n=n.toLowerCase())?16:"b"==n?2:8,r&&r!=o?e:t}),r&&(o=r,u=u.replace(_,"$1").replace(U,"0.$1")),t!=u))return new H(u,o);if(H.DEBUG)throw Error(i+"Not a"+(r?" base "+r:"")+" number: "+t);e.s=null}e.c=e.e=null},L.absoluteValue=L.abs=function(){var e=new H(this);return e.s<0&&(e.s=1),e},L.comparedTo=function(e,t){return g(this,new H(e,t))},L.decimalPlaces=L.dp=function(e,t){var n,r,i,o=this;if(null!=e)return m(e,0,a),null==t?t=F:m(t,0,8),z(new H(o),e+o.e+1,t);if(!(n=o.c))return null;if(r=((i=n.length-1)-h(this.e/s))*s,i=n[i])for(;i%10==0;i/=10,r--);return r<0&&(r=0),r},L.dividedBy=L.div=function(e,t){return y(this,new H(e,t),S,F)},L.dividedToIntegerBy=L.idiv=function(e,t){return y(this,new H(e,t),0,1)},L.exponentiatedBy=L.pow=function(e,t){var o,u,f,c,l,a,h,p,g=this;if((e=new H(e)).c&&!e.isInteger())throw Error(i+"Exponent not an integer: "+$(e));if(null!=t&&(t=new H(t)),l=e.e>14,!g.c||!g.c[0]||1==g.c[0]&&!g.e&&1==g.c.length||!e.c||!e.c[0])return p=new H(Math.pow(+$(g),l?2-N(e):+$(e))),t?p.mod(t):p;if(a=e.s<0,t){if(t.c?!t.c[0]:!t.s)return new H(NaN);(u=!a&&g.isInteger()&&t.isInteger())&&(g=g.mod(t))}else{if(e.e>9&&(g.e>0||g.e<-1||(0==g.e?g.c[0]>1||l&&g.c[1]>=24e7:g.c[0]<8e13||l&&g.c[0]<=9999975e7)))return c=g.s<0&&N(e)?-0:0,g.e>-1&&(c=1/c),new H(a?1/c:c);G&&(c=n(G/s+2))}for(l?(o=new H(.5),a&&(e.s=1),h=N(e)):h=(f=Math.abs(+$(e)))%2,p=new H(B);;){if(h){if(!(p=p.times(g)).c)break;c?p.c.length>c&&(p.c.length=c):u&&(p=p.mod(t))}if(f){if(0===(f=r(f/2)))break;h=f%2}else if(z(e=e.times(o),e.e+1,1),e.e>14)h=N(e);else{if(0==(f=+$(e)))break;h=f%2}g=g.times(g),c?g.c&&g.c.length>c&&(g.c.length=c):u&&(g=g.mod(t))}return u?p:(a&&(p=B.div(p)),t?p.mod(t):c?z(p,G,F,void 0):p)},L.integerValue=function(e){var t=new H(this);return null==e?e=F:m(e,0,8),z(t,t.e+1,e)},L.isEqualTo=L.eq=function(e,t){return 0===g(this,new H(e,t))},L.isFinite=function(){return!!this.c},L.isGreaterThan=L.gt=function(e,t){return g(this,new H(e,t))>0},L.isGreaterThanOrEqualTo=L.gte=function(e,t){return 1===(t=g(this,new H(e,t)))||0===t},L.isInteger=function(){return!!this.c&&h(this.e/s)>this.c.length-2},L.isLessThan=L.lt=function(e,t){return g(this,new H(e,t))<0},L.isLessThanOrEqualTo=L.lte=function(e,t){return-1===(t=g(this,new H(e,t)))||0===t},L.isNaN=function(){return!this.s},L.isNegative=function(){return this.s<0},L.isPositive=function(){return this.s>0},L.isZero=function(){return!!this.c&&0==this.c[0]},L.minus=function(e,t){var n,r,i,o,f=this,c=f.s;if(t=(e=new H(e,t)).s,!c||!t)return new H(NaN);if(c!=t)return e.s=-t,f.plus(e);var l=f.e/s,a=e.e/s,p=f.c,g=e.c;if(!l||!a){if(!p||!g)return p?(e.s=-t,e):new H(g?f:NaN);if(!p[0]||!g[0])return g[0]?(e.s=-t,e):new H(p[0]?f:3==F?-0:0)}if(l=h(l),a=h(a),p=p.slice(),c=l-a){for((o=c<0)?(c=-c,i=p):(a=l,i=g),i.reverse(),t=c;t--;i.push(0));i.reverse()}else for(r=(o=(c=p.length)<(t=g.length))?c:t,c=t=0;t<r;t++)if(p[t]!=g[t]){o=p[t]<g[t];break}if(o&&(i=p,p=g,g=i,e.s=-e.s),(t=(r=g.length)-(n=p.length))>0)for(;t--;p[n++]=0);for(t=u-1;r>c;){if(p[--r]<g[r]){for(n=r;n&&!p[--n];p[n]=t);--p[n],p[r]+=u}p[r]-=g[r]}for(;0==p[0];p.splice(0,1),--a);return p[0]?k(e,p,a):(e.s=3==F?-1:1,e.c=[e.e=0],e)},L.modulo=L.mod=function(e,t){var n,r,i=this;return e=new H(e,t),!i.c||!e.s||e.c&&!e.c[0]?new H(NaN):!e.c||i.c&&!i.c[0]?new H(i):(9==C?(r=e.s,e.s=1,n=y(i,e,0,3),e.s=r,n.s*=r):n=y(i,e,0,C),(e=i.minus(n.times(e))).c[0]||1!=C||(e.s=i.s),e)},L.multipliedBy=L.times=function(e,t){var n,r,i,o,f,c,a,p,g,m,N,b,w,d,y,O=this,v=O.c,E=(e=new H(e,t)).c;if(!(v&&E&&v[0]&&E[0]))return!O.s||!e.s||v&&!v[0]&&!E||E&&!E[0]&&!v?e.c=e.e=e.s=null:(e.s*=O.s,v&&E?(e.c=[0],e.e=0):e.c=e.e=null),e;for(r=h(O.e/s)+h(e.e/s),e.s*=O.s,(a=v.length)<(m=E.length)&&(w=v,v=E,E=w,i=a,a=m,m=i),i=a+m,w=[];i--;w.push(0));for(d=u,y=l,i=m;--i>=0;){for(n=0,N=E[i]%y,b=E[i]/y|0,o=i+(f=a);o>i;)n=((p=N*(p=v[--f]%y)+(c=b*p+(g=v[f]/y|0)*N)%y*y+w[o]+n)/d|0)+(c/y|0)+b*g,w[o--]=p%d;w[o]=n}return n?++r:w.splice(0,1),k(e,w,r)},L.negated=function(){var e=new H(this);return e.s=-e.s||null,e},L.plus=function(e,t){var n,r=this,i=r.s;if(t=(e=new H(e,t)).s,!i||!t)return new H(NaN);if(i!=t)return e.s=-t,r.minus(e);var o=r.e/s,f=e.e/s,c=r.c,l=e.c;if(!o||!f){if(!c||!l)return new H(i/0);if(!c[0]||!l[0])return l[0]?e:new H(c[0]?r:0*i)}if(o=h(o),f=h(f),c=c.slice(),i=o-f){for(i>0?(f=o,n=l):(i=-i,n=c),n.reverse();i--;n.push(0));n.reverse()}for((i=c.length)-(t=l.length)<0&&(n=l,l=c,c=n,t=i),i=0;t;)i=(c[--t]=c[t]+l[t]+i)/u|0,c[t]=u===c[t]?0:c[t]%u;return i&&(c=[i].concat(c),++f),k(e,c,f)},L.precision=L.sd=function(e,t){var n,r,i,o=this;if(null!=e&&e!==!!e)return m(e,1,a),null==t?t=F:m(t,0,8),z(new H(o),e,t);if(!(n=o.c))return null;if(r=(i=n.length-1)*s+1,i=n[i]){for(;i%10==0;i/=10,r--);for(i=n[0];i>=10;i/=10,r++);}return e&&o.e+1>r&&(r=o.e+1),r},L.shiftedBy=function(e){return m(e,-f,f),this.times("1e"+e)},L.squareRoot=L.sqrt=function(){var e,t,n,r,i,o=this,u=o.c,s=o.s,f=o.e,c=S+4,l=new H("0.5");if(1!==s||!u||!u[0])return new H(!s||s<0&&(!u||u[0])?NaN:u?o:1/0);if(0==(s=Math.sqrt(+$(o)))||s==1/0?(((t=p(u)).length+f)%2==0&&(t+="0"),s=Math.sqrt(+t),f=h((f+1)/2)-(f<0||f%2),n=new H(t=s==1/0?"5e"+f:(t=s.toExponential()).slice(0,t.indexOf("e")+1)+f)):n=new H(s+""),n.c[0])for((s=(f=n.e)+c)<3&&(s=0);;)if(i=n,n=l.times(i.plus(y(o,i,c,1))),p(i.c).slice(0,s)===(t=p(n.c)).slice(0,s)){if(n.e<f&&--s,"9999"!=(t=t.slice(s-3,s+1))&&(r||"4999"!=t)){+t&&(+t.slice(1)||"5"!=t.charAt(0))||(z(n,n.e+S+2,1),e=!n.times(n).eq(o));break}if(!r&&(z(i,i.e+S+2,0),i.times(i).eq(o))){n=i;break}c+=4,s+=4,r=1}return z(n,n.e+S+1,F,e)},L.toExponential=function(e,t){return null!=e&&(m(e,0,a),e++),V(this,e,t,1)},L.toFixed=function(e,t){return null!=e&&(m(e,0,a),e=e+this.e+1),V(this,e,t)},L.toFormat=function(e,t,n){var r,o=this;if(null==n)null!=e&&t&&"object"==typeof t?(n=t,t=null):e&&"object"==typeof e?(n=e,e=t=null):n=j;else if("object"!=typeof n)throw Error(i+"Argument not an object: "+n);if(r=o.toFixed(e,t),o.c){var u,s=r.split("."),f=+n.groupSize,c=+n.secondaryGroupSize,l=n.groupSeparator||"",a=s[0],h=s[1],p=o.s<0,g=p?a.slice(1):a,m=g.length;if(c&&(u=f,f=c,c=u,m-=u),f>0&&m>0){for(u=m%f||f,a=g.substr(0,u);u<m;u+=f)a+=l+g.substr(u,f);c>0&&(a+=l+g.slice(u)),p&&(a="-"+a)}r=h?a+(n.decimalSeparator||"")+((c=+n.fractionGroupSize)?h.replace(new RegExp("\\d{"+c+"}\\B","g"),"$&"+(n.fractionGroupSeparator||"")):h):a}return(n.prefix||"")+r+(n.suffix||"")},L.toFraction=function(e){var t,n,r,o,u,f,l,a,h,g,m,N,b=this,w=b.c;if(null!=e&&(!(l=new H(e)).isInteger()&&(l.c||1!==l.s)||l.lt(B)))throw Error(i+"Argument "+(l.isInteger()?"out of range: ":"not an integer: ")+$(l));if(!w)return new H(b);for(t=new H(B),h=n=new H(B),r=a=new H(B),N=p(w),u=t.e=N.length-b.e-1,t.c[0]=c[(f=u%s)<0?s+f:f],e=!e||l.comparedTo(t)>0?u>0?t:h:l,f=P,P=1/0,l=new H(N),a.c[0]=0;g=y(l,t,0,1),1!=(o=n.plus(g.times(r))).comparedTo(e);)n=r,r=o,h=a.plus(g.times(o=h)),a=o,t=l.minus(g.times(o=t)),l=o;return o=y(e.minus(n),r,0,1),a=a.plus(o.times(h)),n=n.plus(o.times(r)),a.s=h.s=b.s,m=y(h,r,u*=2,F).minus(b).abs().comparedTo(y(a,n,u,F).minus(b).abs())<1?[h,r]:[a,n],P=f,m},L.toNumber=function(){return+$(this)},L.toPrecision=function(e,t){return null!=e&&m(e,1,a),V(this,e,t,2)},L.toString=function(e){var t,n=this,r=n.s,i=n.e;return null===i?r?(t="Infinity",r<0&&(t="-"+t)):t="NaN":(null==e?t=i<=I||i>=M?b(p(n.c),i):w(p(n.c),i,"0"):10===e?t=w(p((n=z(new H(n),S+i+1,F)).c),n.e,"0"):(m(e,2,q.length,"Base"),t=O(w(p(n.c),i,"0"),10,e,r,!0)),r<0&&n.c[0]&&(t="-"+t)),t},L.valueOf=L.toJSON=function(){return $(this)},L._isBigNumber=!0,L[Symbol.toStringTag]="BigNumber",L[Symbol.for("nodejs.util.inspect.custom")]=L.valueOf,null!=d&&H.set(d),H}(),y=function(){return(y=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var i in t=arguments[n])Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e}).apply(this,arguments)},O=function(){function e(){this.format=e.DEFAULT_FORMAT,d.config({FORMAT:this.format})}return e.prototype.set=function(e){"FORMAT"in e&&(this.format=y({},this.format,e.FORMAT),e.FORMAT=this.format),d.config(e)},e.DEFAULT_FORMAT={prefix:"",decimalSeparator:".",groupSeparator:",",groupSize:3,secondaryGroupSize:0,fractionGroupSeparator:" ",fractionGroupSize:0,suffix:""},e}();e.BigNumber=function(){function e(t){"object"==typeof t&&e.isBigNumber(t)?this.bn=t.bn.plus(0):this.bn=e.toBigNumberJs(t)}return e.prototype.clone=function(){return new e(this)},e.prototype.add=function(t){return new e(this.bn.plus(e.toBigNumberJs(t)))},e.prototype.sub=function(t){return new e(this.bn.minus(e.toBigNumberJs(t)))},e.prototype.mul=function(t){return new e(this.bn.times(e.toBigNumberJs(t)))},e.prototype.div=function(t){return new e(this.bn.div(e.toBigNumberJs(t)))},e.prototype.pow=function(t){return new e(this.bn.pow(e.toBigNumberJs(t)))},e.prototype.sqrt=function(){return new e(this.bn.sqrt())},e.prototype.abs=function(){return new e(this.bn.abs())},e.prototype.mod=function(t){return new e(this.bn.mod(e.toBigNumberJs(t)))},e.prototype.roundTo=function(t,n){return void 0===t&&(t=0),void 0===n&&(n=4),new e(this.bn.dp(t||0,n))},e.prototype.eq=function(t){return this.bn.eq(e.toBigNumberJs(t))},e.prototype.lt=function(t){return this.bn.lt(e.toBigNumberJs(t))},e.prototype.gt=function(t){return this.bn.gt(e.toBigNumberJs(t))},e.prototype.lte=function(t){return this.bn.lte(e.toBigNumberJs(t))},e.prototype.gte=function(t){return this.bn.gte(e.toBigNumberJs(t))},e.prototype.isNaN=function(){return this.bn.isNaN()},e.prototype.isFinite=function(){return this.bn.isFinite()},e.prototype.isZero=function(){return this.eq(0)},e.prototype.isPositive=function(){return this.gt(0)},e.prototype.isNegative=function(){return this.lt(0)},e.prototype.isInt=function(){return this.bn.isInteger()},e.prototype.getDecimalsCount=function(){return this.bn.dp()},e.prototype.isEven=function(){return this.mod(2).eq(0)},e.prototype.isOdd=function(){return!this.isEven()},e.prototype.isInSignedRange=function(){return this.gte(e.MIN_VALUE)&&this.lte(e.MAX_VALUE)},e.prototype.isInUnsignedRange=function(){return this.gte(e.MIN_UNSIGNED_VALUE)&&this.lte(e.MAX_UNSIGNED_VALUE)},e.prototype.toFormat=function(e,t,n){return this.bn.toFormat(e,t,n)},e.prototype.toFixed=function(e,t){return null==e?this.bn.toFixed():this.bn.toFixed(e,t)},e.prototype.toString=function(){return this.toFixed()},e.prototype.toNumber=function(){return this.bn.toNumber()},e.prototype.toJSON=function(){return this.bn.toFixed()},e.prototype.valueOf=function(){return this.bn.valueOf()},e.prototype.toBytes=function(t){var n=void 0===t?{}:t,r=n.isSigned,i=void 0===r||r,o=n.isLong,u=void 0===o||o;if(!this.isInt())throw new Error("Cant create bytes from number with decimals!");if(!i&&this.isNegative())throw new Error("Cant create bytes from negative number in signed mode!");if(u&&i&&!this.isInSignedRange())throw new Error("Number is not from signed numbers range");if(u&&!i&&!this.isInUnsignedRange())throw new Error("Number is not from unsigned numbers range");var s=i&&this.isNegative(),f=s?"1":"0",c=this.bn.plus(f).toString(2).replace("-",""),l=u?64:8*Math.ceil(c.length/8),a=e._toLength(l,c).split(""),h=[];do{h.push(parseInt(a.splice(0,8).join(""),2))}while(a.length);return s?Uint8Array.from(h.map(function(e){return 255-e})):Uint8Array.from(h)},e.fromBytes=function(t,n){var r=void 0===n?{}:n,i=r.isSigned,o=void 0===i||i,u=r.isLong,s=void 0===u||u;if(s&&8!==t.length)throw new Error("Wrong bytes length! Minimal length is 8 byte!");t=!s&&t.length>0||s?t:[0];var f=!!o&&t[0]>127,c=Array.from(t).map(function(e){return f?255-e:e}).map(function(t){return e._toLength(8,t.toString(2))}).join(""),l=new e(new d(c,2));return f?l.mul(-1).sub(1):l},e.max=function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];return e.toBigNumber(t).reduce(function(e,t){return e.gte(t)?e:t})},e.min=function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];return e.toBigNumber(t).reduce(function(e,t){return e.lte(t)?e:t})},e.sum=function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];return e.toBigNumber(t).reduce(function(e,t){return e.add(t)})},e.isBigNumber=function(t){return t&&"object"==typeof t&&(t instanceof e||Object.entries(e.prototype).filter(function(e){return"_"!==e[0].charAt(0)}).every(function(e){var n=e[0],r=e[1];return n in t&&typeof r==typeof t[n]}))},e.toBigNumber=function(t){return Array.isArray(t)?t.map(function(t){return new e(t)}):new e(t)},e.toBigNumberJs=function(t){return d.isBigNumber(t)?t:t instanceof e?t.bn:new d(t)},e._toLength=function(e,t){return new Array(e).fill("0",0,e).concat(t.split("")).slice(-e).join("")},e.MIN_VALUE=new e("-9223372036854775808"),e.MAX_VALUE=new e("9223372036854775807"),e.MIN_UNSIGNED_VALUE=new e("0"),e.MAX_UNSIGNED_VALUE=new e("18446744073709551615"),e.config=new O,e}(),function(e){!function(e){e[e.ROUND_UP=0]="ROUND_UP",e[e.ROUND_DOWN=1]="ROUND_DOWN",e[e.ROUND_CEIL=2]="ROUND_CEIL",e[e.ROUND_FLOOR=3]="ROUND_FLOOR",e[e.ROUND_HALF_UP=4]="ROUND_HALF_UP",e[e.ROUND_HALF_DOWN=5]="ROUND_HALF_DOWN",e[e.ROUND_HALF_EVEN=6]="ROUND_HALF_EVEN",e[e.ROUND_HALF_CEIL=7]="ROUND_HALF_CEIL",e[e.ROUND_HALF_FLOOR=8]="ROUND_HALF_FLOOR"}(e.ROUND_MODE||(e.ROUND_MODE={}))}(e.BigNumber||(e.BigNumber={}));var v=e.BigNumber;e.default=v,Object.defineProperty(e,"__esModule",{value:!0})});


/***/ }),

/***/ "./node_modules/@waves/client-logs/dist/client-logs.min.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@waves/client-logs/dist/client-logs.min.js ***!
  \*****************************************************************/
/***/ (function(module) {

!function(e,n){ true?module.exports=n():0}(this,(function(){return function(e){var n={};function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}return t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:r})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(t.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var o in e)t.d(r,o,function(n){return e[n]}.bind(null,o));return r},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=0)}([function(e,n,t){"use strict";t.r(n);var r=["info","log","warn","error"],o={keepMessageCount:100,keepMessageTypes:["error"],logMessageTypes:["error"],namespace:void 0},s=function(e){return e.reduce((function(e,n){return e[n]=!0,e}),Object.create(null))},u=function(){function e(e){this._messages=[],this._maxLength=e}return e.prototype.push=function(e){this._messages.push(e),this._messages.length>this._maxLength&&this._messages.splice(0,this._messages.length-this._maxLength)},e.prototype.getMessages=function(e){var n,t,o=s(null!=(t=null===(n=e)||void 0===n?void 0:n.messageTypes)?t:r);return this._messages.filter((function(e){return o[e.type]}))},e}();function a(e){return e}t.d(n,"makeConsole",(function(){return p})),t.d(n,"version",(function(){return f})),t.d(n,"makeOptions",(function(){return l}));var i=function(){return(i=Object.assign||function(e){for(var n,t=1,r=arguments.length;t<r;t++)for(var o in n=arguments[t])Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o]);return e}).apply(this,arguments)},c=function(){for(var e=0,n=0,t=arguments.length;n<t;n++)e+=arguments[n].length;var r=Array(e),o=0;for(n=0;n<t;n++)for(var s=arguments[n],u=0,a=s.length;u<a;u++,o++)r[o]=s[u];return r},p=function(e){var n=i(i({},o),null!=e?e:{}),t=new u(n.keepMessageCount),p=s(n.logMessageTypes),f=s(n.keepMessageTypes);return r.reduce((function(e,r){var o=null!=n.namespace?function(e){return c([n.namespace],e)}:a,s=p[r]?console[r]:a,u=f[r]?function(e){return t.push({type:r,args:e})}:a;return e[r]=function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];var t=o(e);s.apply(void 0,t),u(t)},e}),{getMessages:function(e){return t.getMessages(e)}})},f="1.0.0";function l(e,n){switch(e){case"production":return i(i({},o),{keepMessageTypes:["error"],logMessageTypes:[],namespace:n});case"error":return i(i({},o),{keepMessageTypes:["warn","error"],logMessageTypes:["error"],namespace:n});case"verbose":return i(i({},o),{keepMessageTypes:[],logMessageTypes:r.slice(),namespace:n})}}n.default=p}])}));

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/api-node/addresses/index.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/api-node/addresses/index.js ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fetchAddresses = exports.fetchPublicKey = exports.fetchSeed = exports.fetchSeq = exports.fetchEffectiveBalance = exports.fetchEffectiveBalanceConfirmations = exports.fetchBalance = exports.fetchValidate = exports.data = exports.fetchScriptInfo = exports.fetchBalanceConfirmations = exports.fetchBalanceDetails = exports.fetchScriptInfoMeta = exports.fetchDataKey = void 0;
var request_1 = __importDefault(__webpack_require__(/*! ../../tools/request */ "./node_modules/@waves/node-api-js/cjs/tools/request.js"));
var query_1 = __importDefault(__webpack_require__(/*! ../../tools/query */ "./node_modules/@waves/node-api-js/cjs/tools/query.js"));
function fetchDataKey(base, address, key, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/addresses/data/" + address + "/" + encodeURIComponent(key),
        options: options
    });
}
exports.fetchDataKey = fetchDataKey;
function fetchScriptInfoMeta(base, address) {
    return request_1.default({
        base: base,
        url: "/addresses/scriptInfo/" + address + "/meta"
    });
}
exports.fetchScriptInfoMeta = fetchScriptInfoMeta;
function fetchBalanceDetails(base, address, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/addresses/balance/details/" + address,
        options: options
    });
}
exports.fetchBalanceDetails = fetchBalanceDetails;
function fetchBalanceConfirmations(base, address, confirmations, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/addresses/balance/" + address + "/" + confirmations,
        options: options
    });
}
exports.fetchBalanceConfirmations = fetchBalanceConfirmations;
function fetchScriptInfo(base, address, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/addresses/scriptInfo/" + address,
        options: options
    });
}
exports.fetchScriptInfo = fetchScriptInfo;
function data(base, address, params, options) {
    if (params === void 0) { params = Object.create(null); }
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/addresses/data/" + address + query_1.default(params),
        options: options
    });
}
exports.data = data;
function fetchValidate(base, address) {
    return request_1.default({
        base: base,
        url: "/addresses/validate/" + address
    });
}
exports.fetchValidate = fetchValidate;
function fetchBalance(base, address, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/addresses/balance/" + address,
        options: options
    });
}
exports.fetchBalance = fetchBalance;
function fetchEffectiveBalanceConfirmations(base, address, confirmations, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/addresses/effectiveBalance/" + address + "/" + confirmations,
        options: options
    });
}
exports.fetchEffectiveBalanceConfirmations = fetchEffectiveBalanceConfirmations;
function fetchEffectiveBalance(base, address, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/addresses/effectiveBalance/" + address,
        options: options
    });
}
exports.fetchEffectiveBalance = fetchEffectiveBalance;
function fetchSeq(base, from, to) {
    return request_1.default({
        base: base,
        url: "/addresses/seq/" + from + "/" + to
    });
}
exports.fetchSeq = fetchSeq;
function fetchSeed(base, address) {
    return request_1.default({
        base: base,
        url: "/addresses/seed/" + address
    });
}
exports.fetchSeed = fetchSeed;
function fetchPublicKey(base, publicKey) {
    return request_1.default({
        base: base,
        url: "/addresses/publicKey/" + publicKey
    });
}
exports.fetchPublicKey = fetchPublicKey;
function fetchAddresses(base) {
    return request_1.default({
        base: base,
        url: '/addresses'
    });
}
exports.fetchAddresses = fetchAddresses;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/api-node/assets/index.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/api-node/assets/index.js ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fetchBalanceAddressAssetId = exports.fetchAssetsBalance = exports.fetchAssetsAddressLimit = exports.fetchAssetDistribution = exports.fetchAssetsDetails = exports.fetchDetails = void 0;
var ts_types_1 = __webpack_require__(/*! @waves/ts-types */ "./node_modules/@waves/ts-types/dist/src/index.js");
var request_1 = __importDefault(__webpack_require__(/*! ../../tools/request */ "./node_modules/@waves/node-api-js/cjs/tools/request.js"));
var utils_1 = __webpack_require__(/*! ../../tools/utils */ "./node_modules/@waves/node-api-js/cjs/tools/utils.js");
function fetchDetails(base, assetId, options) {
    if (options === void 0) { options = Object.create(null); }
    var isOnce = !Array.isArray(assetId);
    return Promise.all(utils_1.toArray(assetId).map(function (id) { return request_1.default({
        base: base,
        url: "/assets/details/" + id,
        options: options
    }); }))
        .then(function (list) { return isOnce ? list[0] : list; });
}
exports.fetchDetails = fetchDetails;
/**
 * GET /assets/details
 * Provides detailed information about the given assets
 */
function fetchAssetsDetails(base, assetIds, options) {
    if (options === void 0) { options = Object.create(null); }
    var params = assetIds
        .map(function (assetId) { return "id=" + assetId; })
        .join('&');
    var query = assetIds.length ? "?" + params : '';
    return request_1.default({ base: base, url: "/assets/details" + query, options: options });
}
exports.fetchAssetsDetails = fetchAssetsDetails;
function fetchAssetDistribution(base, assetId, height, limit, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({ base: base, url: "/assets/" + assetId + "/distribution/" + height + "/limit/" + limit, options: options });
}
exports.fetchAssetDistribution = fetchAssetDistribution;
/**
 * TODO
 * GET /assets/{assetId}/distribution
 * Asset balance distribution
 */
function fetchAssetsAddressLimit(base, address, limit, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({ base: base, url: "assets/nft/" + address + "/limit/" + limit, options: options });
}
exports.fetchAssetsAddressLimit = fetchAssetsAddressLimit;
function fetchAssetsBalance(base, address, options) {
    if (options === void 0) { options = Object.create(null); }
    return __awaiter(this, void 0, void 0, function () {
        var balancesResponse, assetsWithoutIssueTransaction, assetsDetailsResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request_1.default({ base: base, url: "/assets/balance/" + address, options: options })];
                case 1:
                    balancesResponse = _a.sent();
                    assetsWithoutIssueTransaction = balancesResponse.balances.reduce(function (acc, balance, index) {
                        if (!balance.issueTransaction) {
                            acc[balance.assetId] = index;
                        }
                        return acc;
                    }, {});
                    return [4 /*yield*/, fetchAssetsDetails(base, Object.keys(assetsWithoutIssueTransaction), options)];
                case 2:
                    assetsDetailsResponse = _a.sent();
                    assetsDetailsResponse.forEach(function (assetDetails) {
                        if ('error' in assetDetails) {
                            return;
                        }
                        var assetIndex = assetsWithoutIssueTransaction[assetDetails.assetId];
                        var assetBalance = balancesResponse.balances[assetIndex];
                        if (!assetBalance) {
                            return;
                        }
                        assetBalance.issueTransaction = {
                            id: assetDetails.originTransactionId,
                            name: assetDetails.name,
                            decimals: assetDetails.decimals,
                            description: assetDetails.description,
                            quantity: assetDetails.quantity,
                            reissuable: assetDetails.reissuable,
                            sender: assetDetails.issuer,
                            senderPublicKey: assetDetails.issuerPublicKey,
                            timestamp: assetDetails.issueTimestamp,
                            height: assetDetails.issueHeight,
                            script: assetDetails.scripted ? '-' : null,
                            proofs: [],
                            fee: Math.pow(10, 8),
                            feeAssetId: null,
                            version: 3,
                            type: ts_types_1.TRANSACTION_TYPE.ISSUE,
                            chainId: 0
                        };
                    });
                    return [2 /*return*/, balancesResponse];
            }
        });
    });
}
exports.fetchAssetsBalance = fetchAssetsBalance;
function fetchBalanceAddressAssetId(base, address, assetId, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({ base: base, url: "/assets/balance/" + address + "/" + assetId, options: options });
}
exports.fetchBalanceAddressAssetId = fetchBalanceAddressAssetId;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/api-node/blocks/index.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/api-node/blocks/index.js ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fetchHeightByTimestamp = exports.fetchHeight = exports.fetchDelay = exports.fetchLast = exports.fetchBlocksByAddress = exports.fetchFirst = exports.fetchBlockById = exports.fetchSeq = exports.fetchBlockAt = exports.fetchHeadersById = exports.fetchHeadersAt = exports.fetchHeightById = exports.fetchHeadersLast = exports.fetchHeadersSeq = void 0;
var request_1 = __importDefault(__webpack_require__(/*! ../../tools/request */ "./node_modules/@waves/node-api-js/cjs/tools/request.js"));
/**
 * GET /blocks/headers/seq/{from}/{to}
 * Get block headers at specified heights
 * @param base
 * @param from
 * @param to
 */
function fetchHeadersSeq(base, from, to, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/blocks/headers/seq/" + from + "/" + to,
        options: options
    });
}
exports.fetchHeadersSeq = fetchHeadersSeq;
/**
 * GET /blocks/headers/last
 * Last block header
 * @param base
 */
function fetchHeadersLast(base, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/blocks/headers/last",
        options: options
    });
}
exports.fetchHeadersLast = fetchHeadersLast;
/**
 * GET /blocks/height/{id}
 * Height of a block by its id
 * @param base
 * @param id
 */
function fetchHeightById(base, id) {
    return request_1.default({
        base: base,
        url: "/blocks/height/" + id
    });
}
exports.fetchHeightById = fetchHeightById;
/**
 * GET /blocks/headers/at/{height}
 * Block header at height
 * @param base
 * @param height
 */
function fetchHeadersAt(base, height, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/blocks/headers/at/" + height,
        options: options
    });
}
exports.fetchHeadersAt = fetchHeadersAt;
/**
 * GET /blocks/headers/{id}
 * Get block at specified height
 * @param base
 * @param height
 */
function fetchHeadersById(base, id, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/blocks/headers/" + id,
        options: options
    });
}
exports.fetchHeadersById = fetchHeadersById;
/**
 * GET /blocks/at/{height}
 * Get block at specified height
 * @param base
 * @param height
 */
function fetchBlockAt(base, height, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/blocks/at/" + height,
        options: options
    });
}
exports.fetchBlockAt = fetchBlockAt;
/**
 * GET /blocks/seq/{from}/{to}
 * Block range
 * @param base
 * @param from
 * @param to
 */
function fetchSeq(base, from, to, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/blocks/seq/" + from + "/" + to,
        options: options
    });
}
exports.fetchSeq = fetchSeq;
/**
 * GET /blocks/{id}
 * Get block by its id
 * @param base
 * @param id
 */
function fetchBlockById(base, id, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/blocks/" + id,
        options: options
    });
}
exports.fetchBlockById = fetchBlockById;
/**
 * GET /blocks/first
 * Get genesis block
 * @param base
 */
function fetchFirst(base, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/blocks/first",
        options: options
    });
}
exports.fetchFirst = fetchFirst;
/**
 * /blocks/address/{address}/{from}/{to}
 * Get list of blocks generated by specified address
 * @param base
 * @param address
 * @param from
 * @param to
 */
function fetchBlocksByAddress(base, address, from, to, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/blocks/address/" + address + "/" + from + "/" + to,
        options: options
    });
}
exports.fetchBlocksByAddress = fetchBlocksByAddress;
/**
 * GET /blocks/last
 * Last block
 * @param base
 */
function fetchLast(base, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: '/blocks/last',
        options: options
    });
}
exports.fetchLast = fetchLast;
/**
 * GET /blocks/delay/{id}/{blockNum}
 * Average delay in milliseconds between last blockNum blocks starting from block with id
 * @param base
 * @param id
 * @param blockNum
 */
function fetchDelay(base, id, blockNum) {
    return request_1.default({
        base: base,
        url: "/blocks/delay/" + id + "/" + blockNum
    });
}
exports.fetchDelay = fetchDelay;
/**
 * GET /blocks/height
 * @param base
 */
function fetchHeight(base) {
    return request_1.default({
        base: base,
        url: '/blocks/height'
    });
}
exports.fetchHeight = fetchHeight;
/**
 * GET /blocks/heightByTimestamp
 * @param base
 */
function fetchHeightByTimestamp(base, timestamp, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/blocks/heightByTimestamp/" + timestamp,
        options: options
    });
}
exports.fetchHeightByTimestamp = fetchHeightByTimestamp;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/api-node/transactions/index.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/api-node/transactions/index.js ***!
  \****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.broadcast = exports.fetchStatus = exports.fetchInfo = exports.fetchUnconfirmedInfo = exports.fetchTransactions = exports.fetchUnconfirmed = exports.fetchCalculateFee = exports.fetchUnconfirmedSize = void 0;
var constants_1 = __webpack_require__(/*! ../../constants */ "./node_modules/@waves/node-api-js/cjs/constants.js");
var blocks_1 = __webpack_require__(/*! ../blocks */ "./node_modules/@waves/node-api-js/cjs/api-node/blocks/index.js");
var request_1 = __importDefault(__webpack_require__(/*! ../../tools/request */ "./node_modules/@waves/node-api-js/cjs/tools/request.js"));
var query_1 = __importDefault(__webpack_require__(/*! ../../tools/query */ "./node_modules/@waves/node-api-js/cjs/tools/query.js"));
var utils_1 = __webpack_require__(/*! ../../tools/utils */ "./node_modules/@waves/node-api-js/cjs/tools/utils.js");
var stringify_1 = __importDefault(__webpack_require__(/*! ../../tools/stringify */ "./node_modules/@waves/node-api-js/cjs/tools/stringify.js"));
var transactions_1 = __webpack_require__(/*! ../../tools/transactions/transactions */ "./node_modules/@waves/node-api-js/cjs/tools/transactions/transactions.js");
/**
 * GET /transactions/unconfirmed/size
 * Number of unconfirmed transactions
 */
function fetchUnconfirmedSize(base) {
    return request_1.default({
        base: base,
        url: '/transactions/unconfirmed/size'
    });
}
exports.fetchUnconfirmedSize = fetchUnconfirmedSize;
// @TODO: when correct API key is received
/**
 * POST /transactions/sign/{signerAddress}
 * Sign a transaction with a non-default private key
 */
/**
 * POST /transactions/calculateFee
 * Calculate transaction fee
 */
function fetchCalculateFee(base, tx, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: '/transactions/calculateFee',
        options: utils_1.deepAssign(__assign({}, options), {
            method: 'POST',
            body: stringify_1.default(tx),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    });
}
exports.fetchCalculateFee = fetchCalculateFee;
/**
 * GET /transactions/unconfirmed
 * Unconfirmed transactions
 */
function fetchUnconfirmed(base, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: '/transactions/unconfirmed',
        options: options
    });
}
exports.fetchUnconfirmed = fetchUnconfirmed;
/**
 * Список транзакций по адресу
 * @param address
 * @param limit      максимальное количество транзакций в результате
 * @param after      искать транзакции после ID указанного в after
 * @param retry      количество попыток на выполнение запроса
 */
function fetchTransactions(base, address, limit, after, retry, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/transactions/address/" + address + "/limit/" + limit + query_1.default({ after: after }),
        options: options
    }).then(function (_a) {
        var list = _a[0];
        list.forEach(function (transaction) { return transactions_1.addStateUpdateField(transaction); });
        return list;
    });
}
exports.fetchTransactions = fetchTransactions;
/**
 * GET /transactions/unconfirmed/info/{id}
 * Unconfirmed transaction info
 */
function fetchUnconfirmedInfo(base, id, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/transactions/unconfirmed/info/" + id,
        options: options
    });
}
exports.fetchUnconfirmedInfo = fetchUnconfirmedInfo;
// @TODO when correct API key is received
/**
 * POST /transactions/sign
 * Sign a transaction
 */
/**
 * GET /transactions/info/{id}
 * Transaction info
 */
function fetchInfo(base, id, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: "/transactions/info/" + id,
        options: options
    }).then(function (transaction) { return transactions_1.addStateUpdateField(transaction); });
}
exports.fetchInfo = fetchInfo;
function fetchStatus(base, list) {
    var DEFAULT_STATUS = {
        id: '',
        confirmations: -1,
        height: -1,
        inUTX: false,
        status: constants_1.TRANSACTION_STATUSES.NOT_FOUND
    };
    var loadAllTxInfo = list.map(function (id) {
        return fetchUnconfirmedInfo(base, id)
            .then(function () { return (__assign(__assign({}, DEFAULT_STATUS), { id: id, status: constants_1.TRANSACTION_STATUSES.UNCONFIRMED, inUTX: true })); })
            .catch(function () { return fetchInfo(base, id)
            .then(function (tx) { return (__assign(__assign({}, DEFAULT_STATUS), { id: id, status: constants_1.TRANSACTION_STATUSES.IN_BLOCKCHAIN, height: tx.height, applicationStatus: tx.applicationStatus })); }); })
            .catch(function () { return (__assign(__assign({}, DEFAULT_STATUS), { id: id })); });
    });
    return Promise.all([
        blocks_1.fetchHeight(base),
        Promise.all(loadAllTxInfo)
    ]).then(function (_a) {
        var height = _a[0].height, statuses = _a[1];
        return ({
            height: height,
            statuses: statuses.map(function (item) { return (__assign(__assign({}, item), { confirmations: item.status === constants_1.TRANSACTION_STATUSES.IN_BLOCKCHAIN ? height - item.height : item.confirmations })); })
        });
    });
}
exports.fetchStatus = fetchStatus;
function broadcast(base, tx, options) {
    if (options === void 0) { options = Object.create(null); }
    return request_1.default({
        base: base,
        url: '/transactions/broadcast',
        options: utils_1.deepAssign(__assign({}, options), {
            method: 'POST',
            body: stringify_1.default(tx),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    });
}
exports.broadcast = broadcast;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/constants.js":
/*!**********************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/constants.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TRANSACTION_STATUSES = exports.NAME_MAP = exports.TYPE_MAP = void 0;
exports.TYPE_MAP = {
    3: 'issue',
    4: 'transfer',
    5: 'reissue',
    6: 'burn',
    7: 'exchange',
    8: 'lease',
    9: 'cancelLease',
    10: 'alias',
    11: 'massTransfer',
    12: 'data',
    13: 'setScript',
    14: 'sponsorship',
    15: 'setAssetScript',
    16: 'invoke',
    17: 'updateAsset'
};
exports.NAME_MAP = {
    'issue': 3,
    'transfer': 4,
    'reissue': 5,
    'burn': 6,
    'exchange': 7,
    'lease': 8,
    'cancelLease': 9,
    'alias': 10,
    'massTransfer': 11,
    'data': 12,
    'setScript': 13,
    'sponsorship': 14,
    'setAssetScript': 15,
    'invoke': 16,
    'updateAsset': 17
};
exports.TRANSACTION_STATUSES = {
    IN_BLOCKCHAIN: 'in_blockchain',
    UNCONFIRMED: 'unconfirmed',
    NOT_FOUND: 'not_found'
};
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/tools/blocks/getNetworkByte.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/tools/blocks/getNetworkByte.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
var blocks_1 = __webpack_require__(/*! ../../api-node/blocks */ "./node_modules/@waves/node-api-js/cjs/api-node/blocks/index.js");
function default_1(base) {
    return blocks_1.fetchHeadersLast(base).then(function (header) { return base58Decode(header.generator)[1]; });
}
exports["default"] = default_1;
var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
var ALPHABET_MAP = {};
for (var i = 0; i < ALPHABET.length; i++) {
    ALPHABET_MAP[ALPHABET.charAt(i)] = i;
}
function base58Decode(string) {
    var bytes, c, carry, j, i;
    if (string.length === 0) {
        return new Uint8Array(0);
    }
    i = void 0;
    j = void 0;
    bytes = [0];
    i = 0;
    while (i < string.length) {
        c = string[i];
        if (!(c in ALPHABET_MAP)) {
            throw 'Base58.decode received unacceptable input. Character \'' + c + '\' is not in the Base58 alphabet.';
        }
        j = 0;
        while (j < bytes.length) {
            bytes[j] *= 58;
            j++;
        }
        bytes[0] += ALPHABET_MAP[c];
        carry = 0;
        j = 0;
        while (j < bytes.length) {
            bytes[j] += carry;
            carry = bytes[j] >> 8;
            bytes[j] &= 0xff;
            ++j;
        }
        while (carry) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
        i++;
    }
    i = 0;
    while (string[i] === '1' && i < string.length - 1) {
        bytes.push(0);
        i++;
    }
    return new Uint8Array(bytes.reverse());
}
//# sourceMappingURL=getNetworkByte.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/tools/parse.js":
/*!************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/tools/parse.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var reg = new RegExp('((?!\\\\)"\\w+"):\\s*(-?[\\d|\\.]{14,})', 'g');
function default_1(json) {
    return JSON.parse(json.replace(reg, "$1:\"$2\""));
}
exports["default"] = default_1;
//# sourceMappingURL=parse.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/tools/query.js":
/*!************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/tools/query.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function default_1(params, evolver) {
    if (evolver === void 0) { evolver = Object.create(null); }
    var query = Object.keys(params)
        .map(function (key) { return [key, params[key]]; })
        .map(function (_a) {
        var key = _a[0], value = _a[1];
        return [key, Object.prototype.hasOwnProperty.call(evolver, key) ? evolver[key](value) : value];
    })
        .filter(function (_a) {
        var key = _a[0], value = _a[1];
        return value != null;
    })
        .map(function (_a) {
        var key = _a[0], value = _a[1];
        return key + "=" + value;
    })
        .join('&');
    return query.length ? "?" + query : '';
}
exports["default"] = default_1;
;
//# sourceMappingURL=query.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/tools/request.js":
/*!**************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/tools/request.js ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var resolve_1 = __importDefault(__webpack_require__(/*! ./resolve */ "./node_modules/@waves/node-api-js/cjs/tools/resolve.js"));
var parse_1 = __importDefault(__webpack_require__(/*! ./parse */ "./node_modules/@waves/node-api-js/cjs/tools/parse.js"));
var request = typeof fetch === 'function' ? fetch : __webpack_require__(/*! node-fetch */ "./node_modules/node-fetch/browser.js");
function default_1(params) {
    return request(resolve_1.default(params.url, params.base), updateHeaders(params.options))
        .then(parseResponse);
}
exports["default"] = default_1;
function parseResponse(r) {
    return r.text().then(function (message) { return r.ok ? parse_1.default(message) : Promise.reject(tryParse(message)); });
}
function tryParse(message) {
    try {
        return JSON.parse(message);
    }
    catch (e) {
        return message;
    }
}
function updateHeaders(options) {
    if (options === void 0) { options = Object.create(null); }
    return __assign({ credentials: 'include' }, options);
}
//# sourceMappingURL=request.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/tools/resolve.js":
/*!**************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/tools/resolve.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function default_1(path, base) {
    return new URL(path, base).toString();
}
exports["default"] = default_1;
//# sourceMappingURL=resolve.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/tools/stringify.js":
/*!****************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/tools/stringify.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var FIELDS = ['amount', 'matcherFee', 'price', 'fee', 'minSponsoredAssetFee', 'quantity', 'sellMatcherFee', 'buyMatcherFee'];
function default_1(data) {
    return JSON.stringify(data, function (key, value) {
        if (FIELDS.includes(key)) {
            return "!" + value + "!";
        }
        else if (key === 'value' && this['type'] === 'integer') {
            return "!" + value + "!";
        }
        else {
            return value;
        }
    }, 0).replace(/"\!(-?\d+)\!"/g, '$1');
}
exports["default"] = default_1;
//# sourceMappingURL=stringify.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/tools/transactions/broadcast.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/tools/transactions/broadcast.js ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var transactions_1 = __webpack_require__(/*! ../../api-node/transactions */ "./node_modules/@waves/node-api-js/cjs/api-node/transactions/index.js");
var utils_1 = __webpack_require__(/*! ../utils */ "./node_modules/@waves/node-api-js/cjs/tools/utils.js");
var wait_1 = __importDefault(__webpack_require__(/*! ./wait */ "./node_modules/@waves/node-api-js/cjs/tools/transactions/wait.js"));
var DEFAULT_BROADCAST_OPTIONS = {
    chain: false,
    confirmations: -1,
    maxWaitTime: 0,
    requestInterval: 0
};
function default_1(base, list, options) {
    var opt = __assign(__assign({}, DEFAULT_BROADCAST_OPTIONS), (options || {}));
    var isOnce = !Array.isArray(list);
    var confirmations = opt.confirmations > 0 ? 1 : 0;
    return (opt.chain
        ? chainBroadcast(base, utils_1.toArray(list), __assign(__assign({}, opt), { confirmations: confirmations }))
        : simpleBroadcast(base, utils_1.toArray(list)))
        .then(function (list) { return opt.confirmations <= 0 ? list : wait_1.default(base, list, opt); })
        .then(function (list) { return isOnce ? utils_1.head(list) : list; });
}
exports["default"] = default_1;
function simpleBroadcast(base, list) {
    return Promise.all(list.map(function (tx) { return transactions_1.broadcast(base, tx); }));
}
function chainBroadcast(base, list, options) {
    return new Promise(function (resolve, reject) {
        var toBroadcast = list.slice().reverse();
        var result = [];
        var loop = function () {
            if (!toBroadcast.length) {
                resolve(result);
                return null;
            }
            var tx = toBroadcast.pop();
            transactions_1.broadcast(base, tx)
                .then(function (tx) { return wait_1.default(base, tx, options); })
                .then(function (tx) {
                result.push(tx);
                loop();
            }, reject);
        };
        loop();
    });
}
//# sourceMappingURL=broadcast.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/tools/transactions/transactions.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/tools/transactions/transactions.js ***!
  \********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeStateUpdate = exports.addStateUpdateField = void 0;
var bignumber_1 = __webpack_require__(/*! @waves/bignumber */ "./node_modules/@waves/bignumber/dist/bignumber.umd.min.js");
var ts_types_1 = __webpack_require__(/*! @waves/ts-types */ "./node_modules/@waves/ts-types/dist/src/index.js");
function addStateUpdateField(transaction) {
    if (transaction.type === ts_types_1.TRANSACTION_TYPE.INVOKE_SCRIPT && transaction.stateChanges.invokes && transaction.stateChanges.invokes.length) {
        var payments_1 = transaction.payment ? transaction.payment.map(function (p) { return ({
            assetId: p.assetId,
            amount: p.amount
        }); }) : [];
        return Object.defineProperty(transaction, 'stateUpdate', { get: function () { return makeStateUpdate(transaction.stateChanges, payments_1, transaction.dApp, transaction.sender); } });
    }
    else
        return transaction;
}
exports.addStateUpdateField = addStateUpdateField;
function makeStateUpdate(stateChanges, payment, dApp, sender) {
    var payments = payment.map(function (payment) { return ({ payment: payment, dApp: dApp, sender: sender }); });
    var addField = function (array, fieldName) { return array.map(function (item) {
        var _a;
        return (__assign(__assign({}, item), (_a = {}, _a[fieldName] = dApp, _a)));
    }); };
    var transfers = addField(stateChanges.transfers, 'sender');
    var leases = addField(stateChanges.leases, 'sender');
    var issues = addField(stateChanges.issues, 'address');
    var data = addField(stateChanges.data, 'address');
    var reissues = addField(stateChanges.reissues, 'address');
    var burns = addField(stateChanges.burns, 'address');
    var sponsorFees = addField(stateChanges.sponsorFees, 'address');
    var leaseCancels = addField(stateChanges.leaseCancels, 'address');
    var stateUpdate = {
        payments: payments,
        data: data,
        transfers: transfers,
        reissues: reissues,
        issues: issues,
        burns: burns,
        sponsorFees: sponsorFees,
        leases: leases,
        leaseCancels: leaseCancels,
    };
    var recursiveFunction = function (stateChanges, sender) {
        if (stateChanges.invokes.length) {
            stateChanges.invokes.forEach(function (x) {
                //payments
                if (x.payment)
                    x.payment.forEach(function (y) {
                        var index = payments.findIndex(function (z) { return (z.payment.assetId === y.assetId) && (z.dApp === x.dApp) && (sender === x.dApp); });
                        index !== -1
                            ? payments[index].payment.amount = (new bignumber_1.BigNumber(payments[index].payment.amount)).add(y.amount).toNumber()
                            : payments.push({
                                payment: y,
                                sender: sender,
                                dApp: x.dApp
                            });
                    });
                //data
                x.stateChanges.data.forEach(function (y) {
                    var index = stateUpdate.data.findIndex(function (z) { return z.key === y.key && z.address === x.dApp; });
                    index !== -1 ? stateUpdate.data[index] = __assign(__assign({}, y), { address: x.dApp }) : stateUpdate.data.push(__assign(__assign({}, y), { address: x.dApp }));
                });
                //burns
                x.stateChanges.burns.forEach(function (y) {
                    var index = stateUpdate.burns.findIndex(function (z) { return z.assetId === y.assetId; });
                    index !== -1 ? stateUpdate.burns[index].quantity += y.quantity : stateUpdate.burns.push(__assign(__assign({}, y), { address: x.dApp }));
                });
                //issues
                x.stateChanges.issues.forEach(function (y) { return stateUpdate.issues.push(__assign(__assign({}, y), { address: x.dApp })); });
                //reissues
                x.stateChanges.reissues.forEach(function (y) {
                    var index = stateUpdate.reissues.findIndex(function (z) { return z.assetId === y.assetId; });
                    index !== -1 ? stateUpdate.reissues[index].quantity += y.quantity : stateUpdate.reissues.push(__assign(__assign({}, y), { address: x.dApp }));
                });
                //transfers
                x.stateChanges.transfers.forEach(function (y) {
                    var index = stateUpdate.transfers.findIndex(function (z) { return (z.asset === y.asset) && (z.address === y.address) && (x.dApp === z.sender); });
                    index !== -1
                        ? stateUpdate.transfers[index].amount = (new bignumber_1.BigNumber(stateUpdate.transfers[index].amount)).add(y.amount).toNumber()
                        : stateUpdate.transfers.push(__assign(__assign({}, y), { sender: x.dApp }));
                });
                //sponsorFees
                x.stateChanges.sponsorFees.forEach(function (y) {
                    var index = stateUpdate.sponsorFees.findIndex(function (z) { return (z.assetId === y.assetId) && (z.address === x.dApp); });
                    index !== -1
                        ? stateUpdate.sponsorFees[index] = __assign(__assign({}, y), { address: x.dApp })
                        : stateUpdate.sponsorFees.push(__assign(__assign({}, y), { address: x.dApp }));
                });
                //lease and leaseCancels
                x.stateChanges.leases.forEach(function (y) { return stateUpdate.leases.push(__assign(__assign({}, y), { sender: x.dApp })); });
                x.stateChanges.leaseCancels.forEach(function (y) { return stateUpdate.leaseCancels.push(__assign(__assign({}, y), { address: x.dApp })); });
                recursiveFunction(x.stateChanges, x.dApp);
            });
        }
    };
    recursiveFunction(stateChanges, sender);
    return stateUpdate;
}
exports.makeStateUpdate = makeStateUpdate;
//# sourceMappingURL=transactions.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/tools/transactions/wait.js":
/*!************************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/tools/transactions/wait.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var utils_1 = __webpack_require__(/*! ../utils */ "./node_modules/@waves/node-api-js/cjs/tools/utils.js");
var transactions_1 = __webpack_require__(/*! ../../api-node/transactions */ "./node_modules/@waves/node-api-js/cjs/api-node/transactions/index.js");
var constants_1 = __webpack_require__(/*! ../../constants */ "./node_modules/@waves/node-api-js/cjs/constants.js");
function default_1(base, tx, options) {
    var isOnce = !Array.isArray(tx);
    var start = Date.now();
    var confirmed = [];
    var confirmations = options && options.confirmations || 0;
    var maxWaitTime = options && options.maxWaitTime || 0;
    var requestInterval = options && options.requestInterval || 250;
    var waitTx = function (list) {
        return transactions_1.fetchStatus(base, list.map(utils_1.prop('id')))
            .then(function (status) {
            var hash = utils_1.indexBy(utils_1.prop('id'), status.statuses);
            var hasError = list.some(function (tx) { return hash[tx.id].status === constants_1.TRANSACTION_STATUSES.NOT_FOUND; });
            if (hasError) {
                throw new Error('One transaction is not in blockchain!');
            }
            var toRequest = list.filter(function (tx) {
                if (hash[tx.id].confirmations >= confirmations) {
                    confirmed.push(tx);
                    return false;
                }
                else {
                    return true;
                }
            });
            if (!toRequest.length) {
                return void 0;
            }
            if (maxWaitTime && Date.now() - start > maxWaitTime) {
                return Promise.reject('Timeout error!');
            }
            return utils_1.wait(requestInterval).then(function () { return waitTx(toRequest); });
        });
    };
    return waitTx(utils_1.toArray(tx)).then(function () { return isOnce ? utils_1.head(confirmed) : confirmed; });
}
exports["default"] = default_1;
//# sourceMappingURL=wait.js.map

/***/ }),

/***/ "./node_modules/@waves/node-api-js/cjs/tools/utils.js":
/*!************************************************************!*\
  !*** ./node_modules/@waves/node-api-js/cjs/tools/utils.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pipe = exports.switchTransactionByType = exports.uniq = exports.indexBy = exports.filter = exports.map = exports.deepAssign = exports.assign = exports.values = exports.entries = exports.keys = exports.prop = exports.wait = exports.head = exports.toArray = exports.isObject = void 0;
function isObject(obj) {
    if (typeof obj === "object" && obj !== null) {
        if (typeof Object.getPrototypeOf === "function") {
            var prototype = Object.getPrototypeOf(obj);
            return prototype === Object.prototype || prototype === null;
        }
        return Object.prototype.toString.call(obj) === "[object Object]";
    }
    return false;
}
exports.isObject = isObject;
function toArray(data) {
    return Array.isArray(data) ? data : [data];
}
exports.toArray = toArray;
function head(data) {
    return data[0];
}
exports.head = head;
function wait(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}
exports.wait = wait;
function prop(key) {
    return function (data) { return data[key]; };
}
exports.prop = prop;
exports.keys = function (obj) {
    return Object.keys(obj);
};
exports.entries = function (obj) {
    return exports.keys(obj).map(function (name) { return [name, obj[name]]; });
};
exports.values = function (obj) {
    return exports.keys(obj).map(function (key) { return obj[key]; });
};
exports.assign = function (target, merge) {
    return exports.entries(merge).reduce(function (acc, _a) {
        var key = _a[0], value = _a[1];
        target[key] = value;
        return target;
    }, target);
};
exports.deepAssign = function () {
    var objects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objects[_i] = arguments[_i];
    }
    return objects.reduce(function (target, merge) {
        exports.keys(merge).forEach(function (key) {
            if (Array.isArray(target[key]) && Array.isArray(merge[key])) {
                target[key] = Array.from(new Set(target[key].concat(merge[key])));
            }
            else if (isObject(target[key]) && isObject(merge[key])) {
                target[key] = exports.deepAssign(target[key], merge[key]);
            }
            else {
                target[key] = merge[key];
            }
        });
        return target;
    }, objects[0] || {});
};
function map(process) {
    return function (list) { return list.map(process); };
}
exports.map = map;
function filter(process) {
    return function (list) { return list.filter(process); };
}
exports.filter = filter;
function indexBy(process, data) {
    return data.reduce(function (acc, item) {
        acc[process(item)] = item;
        return acc;
    }, {});
}
exports.indexBy = indexBy;
exports.uniq = function (list) {
    return exports.keys(list.reduce(function (acc, item) {
        if (item != null)
            acc[item] = item;
        return acc;
    }, Object.create(null)));
};
function switchTransactionByType(choices) {
    return function (tx) { return choices[tx.type] && typeof choices[tx.type] === 'function' ? choices[tx.type](tx) : undefined; };
}
exports.switchTransactionByType = switchTransactionByType;
exports.pipe = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function (data) { return args.reduce(function (acc, item) { return item(acc); }, data); };
};
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/@waves/signer/dist/es/Signer.js":
/*!******************************************************!*\
  !*** ./node_modules/@waves/signer/dist/es/Signer.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Signer": () => (/* binding */ Signer)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./node_modules/@waves/signer/dist/es/constants.js");
/* harmony import */ var _waves_client_logs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @waves/client-logs */ "./node_modules/@waves/client-logs/dist/client-logs.min.js");
/* harmony import */ var _waves_client_logs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_waves_client_logs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _waves_node_api_js_cjs_api_node_addresses__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @waves/node-api-js/cjs/api-node/addresses */ "./node_modules/@waves/node-api-js/cjs/api-node/addresses/index.js");
/* harmony import */ var _waves_node_api_js_cjs_api_node_addresses__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_waves_node_api_js_cjs_api_node_addresses__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _waves_node_api_js_cjs_api_node_assets__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @waves/node-api-js/cjs/api-node/assets */ "./node_modules/@waves/node-api-js/cjs/api-node/assets/index.js");
/* harmony import */ var _waves_node_api_js_cjs_api_node_assets__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_waves_node_api_js_cjs_api_node_assets__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _waves_node_api_js_cjs_tools_transactions_wait__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @waves/node-api-js/cjs/tools/transactions/wait */ "./node_modules/@waves/node-api-js/cjs/tools/transactions/wait.js");
/* harmony import */ var _waves_node_api_js_cjs_tools_transactions_broadcast__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @waves/node-api-js/cjs/tools/transactions/broadcast */ "./node_modules/@waves/node-api-js/cjs/tools/transactions/broadcast.js");
/* harmony import */ var _waves_node_api_js_cjs_tools_transactions_broadcast__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_waves_node_api_js_cjs_tools_transactions_broadcast__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _waves_node_api_js_cjs_tools_blocks_getNetworkByte__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @waves/node-api-js/cjs/tools/blocks/getNetworkByte */ "./node_modules/@waves/node-api-js/cjs/tools/blocks/getNetworkByte.js");
/* harmony import */ var _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @waves/ts-types */ "./node_modules/@waves/ts-types/dist/src/index.js");
/* harmony import */ var _validation__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./validation */ "./node_modules/@waves/signer/dist/es/validation.js");
/* harmony import */ var _SignerError__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./SignerError */ "./node_modules/@waves/signer/dist/es/SignerError.js");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./helpers */ "./node_modules/@waves/signer/dist/es/helpers.js");
/* harmony import */ var _decorators__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./decorators */ "./node_modules/@waves/signer/dist/es/decorators.js");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./types */ "./node_modules/@waves/signer/dist/es/types/index.js");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_types__WEBPACK_IMPORTED_MODULE_12__);














var Signer = /** @class */ (function () {
    function Signer(options) {
        var _this_1 = this;
        var _a;
        this._issue = function (txList) { return function (data) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, data), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.ISSUE }));
        }; };
        this._transfer = function (txList) { return function (data) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, data), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.TRANSFER }));
        }; };
        this._reissue = function (txList) { return function (data) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, data), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.REISSUE }));
        }; };
        this._burn = function (txList) { return function (data) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, data), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.BURN }));
        }; };
        this._lease = function (txList) { return function (data) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, data), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.LEASE }));
        }; };
        this._exchange = function (txList) { return function (data) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, data), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.EXCHANGE }));
        }; };
        this._cancelLease = function (txList) { return function (data) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, data), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.CANCEL_LEASE }));
        }; };
        this._alias = function (txList) { return function (data) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, data), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.ALIAS }));
        }; };
        this._massTransfer = function (txList) { return function (data) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, data), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.MASS_TRANSFER }));
        }; };
        this._data = function (txList) { return function (data) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, data), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.DATA }));
        }; };
        this._sponsorship = function (txList) { return function (sponsorship) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, sponsorship), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.SPONSORSHIP }));
        }; };
        this._setScript = function (txList) { return function (setScript) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, setScript), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.SET_SCRIPT }));
        }; };
        this._setAssetScript = function (txList) { return function (data) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, data), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.SET_ASSET_SCRIPT }));
        }; };
        this._invoke = function (txList) { return function (data) {
            return _this_1._createPipelineAPI(txList, (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, data), { type: _waves_ts_types__WEBPACK_IMPORTED_MODULE_7__.TRANSACTION_TYPE.INVOKE_SCRIPT }));
        }; };
        this._logger = (0,_waves_client_logs__WEBPACK_IMPORTED_MODULE_1__.makeConsole)((0,_waves_client_logs__WEBPACK_IMPORTED_MODULE_1__.makeOptions)((_a = options === null || options === void 0 ? void 0 : options.LOG_LEVEL) !== null && _a !== void 0 ? _a : 'production', 'Signer'));
        this._handleError = (0,_helpers__WEBPACK_IMPORTED_MODULE_10__.errorHandlerFactory)(this._logger);
        this._options = (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, _constants__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_OPTIONS), (options || {}));
        var _b = (0,_validation__WEBPACK_IMPORTED_MODULE_8__.validateSignerOptions)(this._options), isValid = _b.isValid, invalidOptions = _b.invalidOptions;
        if (!isValid) {
            var error = this._handleError(_SignerError__WEBPACK_IMPORTED_MODULE_9__.ERRORS.SIGNER_OPTIONS, [
                invalidOptions,
            ]);
            throw error;
        }
        var makeNetworkByteError = function (e) {
            var error = _this_1._handleError(_SignerError__WEBPACK_IMPORTED_MODULE_9__.ERRORS.NETWORK_BYTE, [
                {
                    error: e.message,
                    node: _this_1._options.NODE_URL,
                },
            ]);
            _this_1._logger.error(error);
            return error;
        };
        try {
            this._networkBytePromise = (0,_waves_node_api_js_cjs_tools_blocks_getNetworkByte__WEBPACK_IMPORTED_MODULE_6__["default"])(this._options.NODE_URL)
                .catch(function (e) { return Promise.reject(makeNetworkByteError(e)); });
        }
        catch (e) {
            throw makeNetworkByteError(e);
        }
        this._logger.info('Signer instance has been successfully created. Options: ', options);
    }
    Object.defineProperty(Signer.prototype, "_connectPromise", {
        get: function () {
            return this.__connectPromise || Promise.reject('Has no provider!');
        },
        set: function (promise) {
            this.__connectPromise = promise;
        },
        enumerable: false,
        configurable: true
    });
    Signer.prototype.on = function (event, handler) {
        this.currentProvider.on(event, handler);
        this._logger.info("Handler for \"" + event + "\" has been added.");
        return this;
    };
    Signer.prototype.once = function (event, handler) {
        this.currentProvider.once(event, handler);
        this._logger.info("One-Time handler for \"" + event + "\" has been added.");
        return this;
    };
    Signer.prototype.off = function (event, handler) {
        this.currentProvider.off(event, handler);
        this._logger.info("Handler for \"" + event + "\" has been removed.");
        return this;
    };
    Signer.prototype.broadcast = function (toBroadcast, options) {
        // @ts-ignore
        return _waves_node_api_js_cjs_tools_transactions_broadcast__WEBPACK_IMPORTED_MODULE_5___default()(this._options.NODE_URL, toBroadcast, options); // TODO поправить тип в broadcast
    };
    /**
     * Запросить байт сети
     */
    Signer.prototype.getNetworkByte = function () {
        return this._networkBytePromise;
    };
    /**
     * Устанавливаем провайдер отвечающий за подпись
     * @param provider
     *
     * ```ts
     * import Signer from '@waves/signer';
     * import Provider from '@waves/seed-provider';
     *
     * const waves = new Signer();
     * waves.setProvider(new Provider('SEED'));
     * ```
     */
    Signer.prototype.setProvider = function (provider) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var providerValidation, error;
            var _this_1 = this;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                providerValidation = (0,_validation__WEBPACK_IMPORTED_MODULE_8__.validateProviderInterface)(provider);
                if (!providerValidation.isValid) {
                    error = this._handleError(_SignerError__WEBPACK_IMPORTED_MODULE_9__.ERRORS.PROVIDER_INTERFACE, [providerValidation.invalidProperties]);
                    throw error;
                }
                this.currentProvider = provider;
                this._logger.info('Provider has been set.');
                this._connectPromise =
                    this._networkBytePromise
                        .then(function (byte) {
                        return provider.connect({
                            NETWORK_BYTE: byte,
                            NODE_URL: _this_1._options.NODE_URL,
                        })
                            .then(function () {
                            _this_1._logger.info('Provider has conneced to node.');
                            return provider;
                        })
                            .catch(function (e) {
                            var error = _this_1._handleError(_SignerError__WEBPACK_IMPORTED_MODULE_9__.ERRORS.PROVIDER_CONNECT, [{
                                    error: e.message,
                                    node: _this_1._options.NODE_URL,
                                }]);
                            _this_1._logger.error(error);
                            return Promise.reject(error);
                        });
                    });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Получаем список балансов пользователя (необходимо выполнить login перед использованием)
     * Basic usage example:
     *
     * ```ts
     * await waves.getBalance(); // Возвращает балансы пользователя
     * ```
     */
    Signer.prototype.getBalance = function () {
        var _this_1 = this;
        return Promise.all([
            (0,_waves_node_api_js_cjs_api_node_addresses__WEBPACK_IMPORTED_MODULE_2__.fetchBalanceDetails)(this._options.NODE_URL, this._userData.address).then(function (data) { return ({
                assetId: 'WAVES',
                assetName: 'Waves',
                decimals: 8,
                amount: String(data.available),
                isMyAsset: false,
                tokens: Number(data.available) * Math.pow(10, 8),
                sponsorship: null,
                isSmart: false,
            }); }),
            (0,_waves_node_api_js_cjs_api_node_assets__WEBPACK_IMPORTED_MODULE_3__.fetchAssetsBalance)(this._options.NODE_URL, this._userData.address).then(function (data) {
                return data.balances.map(function (item) { return ({
                    assetId: item.assetId,
                    assetName: item.issueTransaction.name,
                    decimals: item.issueTransaction.decimals,
                    amount: String(item.balance),
                    isMyAsset: item.issueTransaction.sender ===
                        _this_1._userData.address,
                    tokens: item.balance *
                        Math.pow(10, item.issueTransaction.decimals),
                    isSmart: !!item.issueTransaction.script,
                    sponsorship: item.sponsorBalance != null &&
                        item.sponsorBalance > Math.pow(10, 8) &&
                        (item.minSponsoredAssetFee || 0) < item.balance
                        ? item.minSponsoredAssetFee
                        : null,
                }); });
            }),
        ]).then(function (_a) {
            var waves = _a[0], assets = _a[1];
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__spreadArrays)([waves], assets);
        });
    };
    /**
     * Получаем информацию о пользователе
     *
     * ```ts
     * await waves.login(); // Авторизуемся. Возвращает адрес и публичный ключ
     * ```
     */
    Signer.prototype.login = function () {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var _a, err_1, error;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = this;
                        return [4 /*yield*/, this.currentProvider.login()];
                    case 1:
                        _a._userData = _b.sent();
                        this._logger.info('Logged in.');
                        return [2 /*return*/, this._userData];
                    case 2:
                        err_1 = _b.sent();
                        if (err_1 === 'Error: User rejection!') {
                            throw err_1;
                        }
                        error = this._handleError(_SignerError__WEBPACK_IMPORTED_MODULE_9__.ERRORS.PROVIDER_INTERNAL, err_1.message);
                        throw error;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Вылогиниваемся из юзера
     */
    Signer.prototype.logout = function () {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var _a, message, error;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.currentProvider.logout()];
                    case 1:
                        _b.sent();
                        this._userData = undefined;
                        this._logger.info('Logged out.');
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        message = _a.message;
                        error = this._handleError(_SignerError__WEBPACK_IMPORTED_MODULE_9__.ERRORS.PROVIDER_INTERNAL, message);
                        throw error;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Подписываем сообщение пользователя (провайдер может устанавливать префикс)
     * @param message
     */
    Signer.prototype.signMessage = function (message) {
        return this._connectPromise.then(function (provider) {
            return provider.signMessage(message);
        });
    };
    /**
     * Подписываем типизированные данные
     * @param data
     */
    Signer.prototype.signTypedData = function (data) {
        return this._connectPromise.then(function (provider) {
            return provider.signTypedData(data);
        });
    };
    /**
     * Получаем список балансов в кторых можно платить комиссию
     */
    Signer.prototype.getSponsoredBalances = function () {
        return this.getBalance().then(function (balance) {
            return balance.filter(function (item) { return !!item.sponsorship; });
        });
    };
    Signer.prototype.batch = function (tsx) {
        var _this_1 = this;
        var sign = function () {
            return _this_1._sign(tsx).then(function (result) { return result; });
        };
        return {
            sign: sign,
            broadcast: function (opt) {
                return sign().then(function (transactions) {
                    return _this_1.broadcast(transactions, opt);
                });
            },
        };
    };
    Signer.prototype.issue = function (data) {
        return this._issue([])(data);
    };
    Signer.prototype.transfer = function (data) {
        return this._transfer([])(data);
    };
    Signer.prototype.reissue = function (data) {
        return this._reissue([])(data);
    };
    Signer.prototype.burn = function (data) {
        return this._burn([])(data);
    };
    Signer.prototype.lease = function (data) {
        return this._lease([])(data);
    };
    Signer.prototype.exchange = function (data) {
        return this._exchange([])(data);
    };
    Signer.prototype.cancelLease = function (data) {
        return this._cancelLease([])(data);
    };
    Signer.prototype.alias = function (data) {
        return this._alias([])(data);
    };
    Signer.prototype.massTransfer = function (data) {
        return this._massTransfer([])(data);
    };
    Signer.prototype.data = function (data) {
        return this._data([])(data);
    };
    Signer.prototype.sponsorship = function (data) {
        return this._sponsorship([])(data);
    };
    Signer.prototype.setScript = function (data) {
        return this._setScript([])(data);
    };
    Signer.prototype.setAssetScript = function (data) {
        return this._setAssetScript([])(data);
    };
    Signer.prototype.invoke = function (data) {
        return this._invoke([])(data);
    };
    Signer.prototype.waitTxConfirm = function (tx, confirmations) {
        return (0,_waves_node_api_js_cjs_tools_transactions_wait__WEBPACK_IMPORTED_MODULE_4__["default"])(this._options.NODE_URL, tx, { confirmations: confirmations }); // TODO Fix types
    };
    Signer.prototype._createPipelineAPI = function (prevCallTxList, signerTx) {
        var _this_1 = this;
        var _this = this;
        var txs = prevCallTxList.length
            ? (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__spreadArrays)(prevCallTxList, [signerTx]) : [signerTx];
        var chainArgs = Array.isArray(txs) ? txs : [txs];
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, {
            issue: this._issue(chainArgs),
            transfer: this._transfer(chainArgs),
            reissue: this._reissue(chainArgs),
            burn: this._burn(chainArgs),
            lease: this._lease(chainArgs),
            exchange: this._exchange(chainArgs),
            cancelLease: this._cancelLease(chainArgs),
            alias: this._alias(chainArgs),
            massTransfer: this._massTransfer(chainArgs),
            data: this._data(chainArgs),
            sponsorship: this._sponsorship(chainArgs),
            setScript: this._setScript(chainArgs),
            setAssetScript: this._setAssetScript(chainArgs),
            invoke: this._invoke(chainArgs),
        }), { sign: function () { return _this_1._sign(txs); }, broadcast: function (options) {
                return this.sign()
                    // @ts-ignore
                    .then(function (txs) { return _this.broadcast(txs, options); });
            } });
    };
    Signer.prototype._validate = function (toSign) {
        var signerTxs = Array.isArray(toSign) ? toSign : [toSign];
        var validateTx = function (tx) { return _validation__WEBPACK_IMPORTED_MODULE_8__.argsValidators[tx.type](tx); };
        var knownTxPredicate = function (type) {
            return Object.keys(_validation__WEBPACK_IMPORTED_MODULE_8__.argsValidators).includes(String(type));
        };
        var unknownTxs = signerTxs.filter(function (_a) {
            var type = _a.type;
            return !knownTxPredicate(type);
        });
        var knownTxs = signerTxs.filter(function (_a) {
            var type = _a.type;
            return knownTxPredicate(type);
        });
        var invalidTxs = knownTxs
            .map(validateTx)
            .filter(function (_a) {
            var isValid = _a.isValid;
            return !isValid;
        });
        if (invalidTxs.length === 0 && unknownTxs.length === 0) {
            return { isValid: true, errors: [] };
        }
        else {
            return {
                isValid: false,
                errors: (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__spreadArrays)(invalidTxs.map(function (_a) {
                    var transaction = _a.transaction, scope = _a.method, invalidFields = _a.invalidFields;
                    return "Validation error for " + scope + " transaction: " + JSON.stringify(transaction) + ". Invalid arguments: " + (invalidFields === null || invalidFields === void 0 ? void 0 : invalidFields.join(', '));
                }), unknownTxs.map(function (tx) {
                    return "Validation error for transaction " + JSON.stringify(tx) + ". Unknown transaction type: " + tx.type;
                })),
            };
        }
    };
    Signer.prototype._sign = function (toSign) {
        var validation = this._validate(toSign);
        if (validation.isValid) {
            return this._connectPromise.then(function (provider) { return provider.sign(toSign); });
        }
        else {
            var error = this._handleError(_SignerError__WEBPACK_IMPORTED_MODULE_9__.ERRORS.API_ARGUMENTS, [validation.errors]);
            throw error;
        }
    };
    (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__decorate)([
        _decorators__WEBPACK_IMPORTED_MODULE_11__.ensureProvider
    ], Signer.prototype, "on", null);
    (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__decorate)([
        _decorators__WEBPACK_IMPORTED_MODULE_11__.ensureProvider
    ], Signer.prototype, "once", null);
    (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__decorate)([
        _decorators__WEBPACK_IMPORTED_MODULE_11__.ensureProvider
    ], Signer.prototype, "off", null);
    (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__decorate)([
        _decorators__WEBPACK_IMPORTED_MODULE_11__.ensureProvider,
        _decorators__WEBPACK_IMPORTED_MODULE_11__.checkAuth
    ], Signer.prototype, "getBalance", null);
    (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__decorate)([
        _decorators__WEBPACK_IMPORTED_MODULE_11__.ensureProvider
    ], Signer.prototype, "login", null);
    (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__decorate)([
        _decorators__WEBPACK_IMPORTED_MODULE_11__.ensureProvider
    ], Signer.prototype, "logout", null);
    (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__decorate)([
        _decorators__WEBPACK_IMPORTED_MODULE_11__.catchProviderError
    ], Signer.prototype, "_sign", null);
    return Signer;
}());

// eslint-disable-next-line import/no-default-export
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (Signer);


/***/ }),

/***/ "./node_modules/@waves/signer/dist/es/SignerError.js":
/*!***********************************************************!*\
  !*** ./node_modules/@waves/signer/dist/es/SignerError.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ERRORS": () => (/* binding */ ERRORS),
/* harmony export */   "SignerError": () => (/* binding */ SignerError),
/* harmony export */   "SignerOptionsError": () => (/* binding */ SignerOptionsError),
/* harmony export */   "SignerApiArgumentsError": () => (/* binding */ SignerApiArgumentsError),
/* harmony export */   "SignerNetworkByteError": () => (/* binding */ SignerNetworkByteError),
/* harmony export */   "SignerProviderInterfaceError": () => (/* binding */ SignerProviderInterfaceError),
/* harmony export */   "SignerProviderConnectError": () => (/* binding */ SignerProviderConnectError),
/* harmony export */   "SignerEnsureProviderError": () => (/* binding */ SignerEnsureProviderError),
/* harmony export */   "SignerProviderInternalError": () => (/* binding */ SignerProviderInternalError),
/* harmony export */   "SignerAuthError": () => (/* binding */ SignerAuthError),
/* harmony export */   "SignerNetworkError": () => (/* binding */ SignerNetworkError)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");

var REPOSITORY_URL = 'http://github.com/wavesplatform/signer';
var ERRORS = {
    SIGNER_OPTIONS: 1000,
    NETWORK_BYTE: 1001,
    NOT_AUTHORIZED: 1002,
    PROVIDER_CONNECT: 1003,
    ENSURE_PROVIDER: 1004,
    PROVIDER_INTERFACE: 1005,
    PROVIDER_INTERNAL: 1006,
    API_ARGUMENTS: 1007,
    NETWORK_ERROR: 1008,
};
var errorTemplate = function (error) {
    var details = error.details
        ? "    Details: " + error.details
        : undefined;
    return [
        "Signer error:",
        "    Title: " + error.title,
        "    Type: " + error.type,
        "    Code: " + error.code,
        details,
        "    More info: " + REPOSITORY_URL + "/README.md#error-codes",
    ]
        .filter(Boolean)
        .join('\n');
};
var SignerError = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(SignerError, _super);
    function SignerError(details) {
        var _this = _super.call(this, errorTemplate(details)) || this;
        _this.code = details.code;
        _this.type = details.type;
        // Set the prototype explicitly.
        Object.setPrototypeOf(_this, SignerError.prototype);
        return _this;
    }
    return SignerError;
}(Error));

var SignerOptionsError = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(SignerOptionsError, _super);
    function SignerOptionsError(args) {
        var _this = _super.call(this, {
            code: ERRORS.SIGNER_OPTIONS,
            title: 'Invalid signer options',
            type: 'validation',
            details: "\n        Invalid signer options: " + args.join(', '),
            errorArgs: args,
        }) || this;
        Object.setPrototypeOf(_this, SignerOptionsError.prototype);
        return _this;
    }
    return SignerOptionsError;
}(SignerError));

var SignerApiArgumentsError = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(SignerApiArgumentsError, _super);
    function SignerApiArgumentsError(args) {
        var _this = _super.call(this, {
            code: ERRORS.API_ARGUMENTS,
            title: 'Invalid api method arguments',
            type: 'validation',
            details: "\n        " + args.join('\n        '),
            errorArgs: args,
        }) || this;
        Object.setPrototypeOf(_this, SignerApiArgumentsError.prototype);
        return _this;
    }
    return SignerApiArgumentsError;
}(SignerError));

var SignerNetworkByteError = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(SignerNetworkByteError, _super);
    function SignerNetworkByteError(_a) {
        var error = _a.error, node = _a.node;
        var _this = _super.call(this, {
            code: ERRORS.NETWORK_BYTE,
            title: 'Network byte fetching has failed',
            type: 'network',
            details: "\n        Could not fetch network from " + node + ": " + error,
            errorArgs: { error: error, node: node },
        }) || this;
        Object.setPrototypeOf(_this, SignerNetworkByteError.prototype);
        return _this;
    }
    return SignerNetworkByteError;
}(SignerError));

var SignerProviderInterfaceError = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(SignerProviderInterfaceError, _super);
    function SignerProviderInterfaceError(invalidProperties) {
        var _this = _super.call(this, {
            code: ERRORS.NETWORK_BYTE,
            title: 'Invalid Provider interface',
            type: 'validation',
            details: "\n        Invalid provider properties: " + invalidProperties.join(', '),
            errorArgs: invalidProperties,
        }) || this;
        Object.setPrototypeOf(_this, SignerProviderInterfaceError.prototype);
        return _this;
    }
    return SignerProviderInterfaceError;
}(SignerError));

var SignerProviderConnectError = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(SignerProviderConnectError, _super);
    function SignerProviderConnectError(_a) {
        var error = _a.error, node = _a.node;
        var _this = _super.call(this, {
            code: ERRORS.PROVIDER_CONNECT,
            title: 'Could not connect the Provider',
            type: 'network',
            errorArgs: { error: error, node: node },
        }) || this;
        Object.setPrototypeOf(_this, SignerProviderConnectError.prototype);
        return _this;
    }
    return SignerProviderConnectError;
}(SignerError));

var SignerEnsureProviderError = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(SignerEnsureProviderError, _super);
    function SignerEnsureProviderError(method) {
        var _this = _super.call(this, {
            code: ERRORS.ENSURE_PROVIDER,
            title: 'Provider instance is missing',
            type: 'provider',
            details: "Can't use method: " + method + ". Provider instance is missing",
            errorArgs: { failedMethod: method },
        }) || this;
        Object.setPrototypeOf(_this, SignerProviderConnectError.prototype);
        return _this;
    }
    return SignerEnsureProviderError;
}(SignerError));

var SignerProviderInternalError = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(SignerProviderInternalError, _super);
    function SignerProviderInternalError(message) {
        var _this = _super.call(this, {
            code: ERRORS.ENSURE_PROVIDER,
            title: 'Provider internal error',
            type: 'provider',
            details: "Provider internal error: " + message + ". This is not error of signer.",
            errorArgs: { errorMessage: message },
        }) || this;
        Object.setPrototypeOf(_this, SignerProviderConnectError.prototype);
        return _this;
    }
    return SignerProviderInternalError;
}(SignerError));

var SignerAuthError = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(SignerAuthError, _super);
    function SignerAuthError(method) {
        var _this = _super.call(this, {
            code: ERRORS.NOT_AUTHORIZED,
            title: 'Authorization error',
            type: 'authorization',
            details: "Can't use method: " + method + ". User must be logged in",
            errorArgs: { failedMethod: method },
        }) || this;
        Object.setPrototypeOf(_this, SignerProviderConnectError.prototype);
        return _this;
    }
    return SignerAuthError;
}(SignerError));

var SignerNetworkError = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(SignerNetworkError, _super);
    // TODO REMOVE ANY, ADD MORE DETAILS
    function SignerNetworkError(params) {
        return _super.call(this, {
            code: ERRORS.NETWORK_ERROR,
            title: 'Network Error',
            type: 'network',
            details: "Error connect to " + '',
            errorArgs: {},
        }) || this;
    }
    return SignerNetworkError;
}(SignerError));



/***/ }),

/***/ "./node_modules/@waves/signer/dist/es/constants.js":
/*!*********************************************************!*\
  !*** ./node_modules/@waves/signer/dist/es/constants.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEFAULT_OPTIONS": () => (/* binding */ DEFAULT_OPTIONS)
/* harmony export */ });
/* unused harmony exports DEFAULT_BROADCAST_OPTIONS, MAX_ALIAS_LENGTH, SMART_ASSET_EXTRA_FEE */
var DEFAULT_OPTIONS = {
    NODE_URL: 'https://nodes.wavesplatform.com',
    LOG_LEVEL: 'production',
};
var DEFAULT_BROADCAST_OPTIONS = {
    chain: false,
    confirmations: -1,
};
var MAX_ALIAS_LENGTH = 30;
var SMART_ASSET_EXTRA_FEE = 0.004 * Math.pow(10, 8);


/***/ }),

/***/ "./node_modules/@waves/signer/dist/es/decorators.js":
/*!**********************************************************!*\
  !*** ./node_modules/@waves/signer/dist/es/decorators.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ensureProvider": () => (/* binding */ ensureProvider),
/* harmony export */   "catchProviderError": () => (/* binding */ catchProviderError),
/* harmony export */   "checkAuth": () => (/* binding */ checkAuth)
/* harmony export */ });
/* unused harmony export catchNetworkErrors */
/* harmony import */ var _SignerError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SignerError */ "./node_modules/@waves/signer/dist/es/SignerError.js");

var getErrorHandler = function (signer) {
    return signer._handleError;
};
var ensureProvider = function (target, propertyKey, descriptor) {
    var origin = descriptor.value;
    descriptor.value = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var provider = this.currentProvider;
        if (!provider) {
            var handler = getErrorHandler(this);
            var error = handler(_SignerError__WEBPACK_IMPORTED_MODULE_0__.ERRORS.ENSURE_PROVIDER, [propertyKey]);
            throw error;
        }
        return origin.apply(this, args);
    };
};
var catchProviderError = function (target, propertyKey, descriptor) {
    var origin = descriptor.value;
    descriptor.value = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return origin.apply(this, args).catch(function (e) {
            if (e === 'Error: User rejection!') {
                return Promise.reject(e);
            }
            if (e instanceof _SignerError__WEBPACK_IMPORTED_MODULE_0__.SignerError) {
                return Promise.reject(e);
            }
            var handler = getErrorHandler(_this);
            var error = handler(_SignerError__WEBPACK_IMPORTED_MODULE_0__.ERRORS.PROVIDER_INTERNAL, [e.message]);
            _this._console.error(error);
            return Promise.reject(e);
        });
    };
};
var checkAuth = function (target, propertyKey, descriptor) {
    var origin = descriptor.value;
    descriptor.value = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.currentProvider.user == null) {
            var handler = getErrorHandler(this);
            var error = handler(_SignerError__WEBPACK_IMPORTED_MODULE_0__.ERRORS.NOT_AUTHORIZED, [propertyKey]);
            throw error;
        }
        return origin.apply(this, args);
    };
};
var catchNetworkErrors = function (checkData) { return function (target, propertyKey, descriptor) {
    var origin = descriptor.value;
    descriptor.value = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (checkData.isMatcher) {
            // TODO
            // if (!this._options.MATCHER_URL) {
            //     const error = new SignerError(
            //         ERROR_CODE_MAP.NO_MATCHER_URL_PROVIDED,
            //         void 0
            //     );
            //
            //     this._console.error(error);
            //
            //     return Promise.reject(error);
            // }
        }
        return origin.apply(this, args).catch(function (e) {
            if (e instanceof _SignerError__WEBPACK_IMPORTED_MODULE_0__.SignerError) {
                return Promise.reject(e);
            }
            var handler = getErrorHandler(_this);
            // TODO Provide more details for request error!
            var error = handler(_SignerError__WEBPACK_IMPORTED_MODULE_0__.ERRORS.NETWORK_ERROR, [{}]);
            _this._console.error(error);
            return Promise.reject(error);
        });
    };
}; };


/***/ }),

/***/ "./node_modules/@waves/signer/dist/es/helpers.js":
/*!*******************************************************!*\
  !*** ./node_modules/@waves/signer/dist/es/helpers.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "errorHandlerFactory": () => (/* binding */ errorHandlerFactory)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _SignerError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SignerError */ "./node_modules/@waves/signer/dist/es/SignerError.js");
var _a;


var ERRORS_MAP = (_a = {},
    _a[_SignerError__WEBPACK_IMPORTED_MODULE_0__.ERRORS.SIGNER_OPTIONS] = _SignerError__WEBPACK_IMPORTED_MODULE_0__.SignerOptionsError,
    _a[_SignerError__WEBPACK_IMPORTED_MODULE_0__.ERRORS.NETWORK_BYTE] = _SignerError__WEBPACK_IMPORTED_MODULE_0__.SignerNetworkByteError,
    _a[_SignerError__WEBPACK_IMPORTED_MODULE_0__.ERRORS.PROVIDER_INTERFACE] = _SignerError__WEBPACK_IMPORTED_MODULE_0__.SignerProviderInterfaceError,
    _a[_SignerError__WEBPACK_IMPORTED_MODULE_0__.ERRORS.API_ARGUMENTS] = _SignerError__WEBPACK_IMPORTED_MODULE_0__.SignerApiArgumentsError,
    _a[_SignerError__WEBPACK_IMPORTED_MODULE_0__.ERRORS.PROVIDER_CONNECT] = _SignerError__WEBPACK_IMPORTED_MODULE_0__.SignerProviderConnectError,
    _a[_SignerError__WEBPACK_IMPORTED_MODULE_0__.ERRORS.ENSURE_PROVIDER] = _SignerError__WEBPACK_IMPORTED_MODULE_0__.SignerEnsureProviderError,
    _a[_SignerError__WEBPACK_IMPORTED_MODULE_0__.ERRORS.PROVIDER_INTERNAL] = _SignerError__WEBPACK_IMPORTED_MODULE_0__.SignerProviderInternalError,
    _a[_SignerError__WEBPACK_IMPORTED_MODULE_0__.ERRORS.NOT_AUTHORIZED] = _SignerError__WEBPACK_IMPORTED_MODULE_0__.SignerAuthError,
    _a[_SignerError__WEBPACK_IMPORTED_MODULE_0__.ERRORS.NETWORK_ERROR] = _SignerError__WEBPACK_IMPORTED_MODULE_0__.SignerNetworkError,
    _a);
var errorHandlerFactory = function (logger) { return function (errorCode, parameters) {
    var _a;
    var error = new ((_a = ERRORS_MAP[errorCode]).bind.apply(_a, (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__spreadArrays)([void 0], (parameters || []))))();
    logger.log(error.toString());
    throw error;
}; };


/***/ }),

/***/ "./node_modules/@waves/signer/dist/es/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/@waves/signer/dist/es/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Signer": () => (/* reexport safe */ _Signer__WEBPACK_IMPORTED_MODULE_2__.Signer)
/* harmony export */ });
/* harmony import */ var _types_api__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types/api */ "./node_modules/@waves/signer/dist/es/types/api.js");
/* harmony import */ var _types_api__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_types_api__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (checked) */ if(__webpack_require__.o(_types_api__WEBPACK_IMPORTED_MODULE_0__, "Signer")) __webpack_require__.d(__webpack_exports__, { "Signer": function() { return _types_api__WEBPACK_IMPORTED_MODULE_0__.Signer; } });
/* harmony import */ var _types_index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./types/index */ "./node_modules/@waves/signer/dist/es/types/index.js");
/* harmony import */ var _types_index__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_types_index__WEBPACK_IMPORTED_MODULE_1__);
/* harmony reexport (checked) */ if(__webpack_require__.o(_types_index__WEBPACK_IMPORTED_MODULE_1__, "Signer")) __webpack_require__.d(__webpack_exports__, { "Signer": function() { return _types_index__WEBPACK_IMPORTED_MODULE_1__.Signer; } });
/* harmony import */ var _Signer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Signer */ "./node_modules/@waves/signer/dist/es/Signer.js");







/***/ }),

/***/ "./node_modules/@waves/signer/dist/es/types/api.js":
/*!*********************************************************!*\
  !*** ./node_modules/@waves/signer/dist/es/types/api.js ***!
  \*********************************************************/
/***/ (() => {



/***/ }),

/***/ "./node_modules/@waves/signer/dist/es/types/index.js":
/*!***********************************************************!*\
  !*** ./node_modules/@waves/signer/dist/es/types/index.js ***!
  \***********************************************************/
/***/ (() => {



/***/ }),

/***/ "./node_modules/@waves/signer/dist/es/validation.js":
/*!**********************************************************!*\
  !*** ./node_modules/@waves/signer/dist/es/validation.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "argsValidators": () => (/* binding */ argsValidators),
/* harmony export */   "validateSignerOptions": () => (/* binding */ validateSignerOptions),
/* harmony export */   "validateProviderInterface": () => (/* binding */ validateProviderInterface)
/* harmony export */ });
/* unused harmony exports validator, issueArgsScheme, issueArgsValidator, transferArgsScheme, transferArgsValidator, reissueArgsScheme, reissueArgsValidator, burnArgsScheme, burnArgsValidator, leaseArgsScheme, leaseArgsValidator, cancelLeaseArgsScheme, cancelLeaseArgsValidator, aliasArgsScheme, aliasArgsValidator, massTransferArgsScheme, massTransferArgsValidator, dataArgsScheme, dataArgsValidator, setScriptArgsScheme, setScriptArgsValidator, sponsorshipArgsScheme, sponsorshipArgsValidator, exchangeArgsScheme, exchangeArgsValidator, setAssetScriptArgsScheme, setAssetScriptArgsValidator, invokeArgsScheme, invokeArgsValidator */
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var ramda_src_defaultTo__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ramda/src/defaultTo */ "./node_modules/@waves/signer/node_modules/ramda/src/defaultTo.js");
/* harmony import */ var ramda_src_defaultTo__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(ramda_src_defaultTo__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var ramda_src_prop__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ramda/src/prop */ "./node_modules/@waves/signer/node_modules/ramda/src/prop.js");
/* harmony import */ var ramda_src_prop__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(ramda_src_prop__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ramda/src/ifElse */ "./node_modules/@waves/signer/node_modules/ramda/src/ifElse.js");
/* harmony import */ var ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var ramda_src_pipe__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ramda/src/pipe */ "./node_modules/@waves/signer/node_modules/ramda/src/pipe.js");
/* harmony import */ var ramda_src_pipe__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(ramda_src_pipe__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var ramda_src_equals__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ramda/src/equals */ "./node_modules/@waves/signer/node_modules/ramda/src/equals.js");
/* harmony import */ var ramda_src_equals__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(ramda_src_equals__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var ramda_src_lte__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ramda/src/lte */ "./node_modules/@waves/signer/node_modules/ramda/src/lte.js");
/* harmony import */ var ramda_src_lte__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(ramda_src_lte__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var ramda_src_not__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ramda/src/not */ "./node_modules/@waves/signer/node_modules/ramda/src/not.js");
/* harmony import */ var ramda_src_not__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(ramda_src_not__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _validators__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validators */ "./node_modules/@waves/signer/dist/es/validators.js");
/* harmony import */ var _waves_ts_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @waves/ts-types */ "./node_modules/@waves/ts-types/dist/src/index.js");
var _a;










var shouldValidate = ramda_src_pipe__WEBPACK_IMPORTED_MODULE_2___default()(ramda_src_equals__WEBPACK_IMPORTED_MODULE_3___default()(undefined), (ramda_src_not__WEBPACK_IMPORTED_MODULE_4___default()));
var validateOptional = function (validator) {
    return ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_5___default()(shouldValidate, validator, ramda_src_defaultTo__WEBPACK_IMPORTED_MODULE_6___default()(true));
};
// waves-transaction validator can't collect errors for each invalid field.
// This method does.
var validator = function (scheme, method) { return function (transaction) {
    var _a;
    var invalidFields = [];
    for (var _i = 0, _b = Object.entries(scheme); _i < _b.length; _i++) {
        var _c = _b[_i], fieldName = _c[0], validationScheme = _c[1];
        try {
            (0,_validators__WEBPACK_IMPORTED_MODULE_0__.validateBySchema)((_a = {}, _a[fieldName] = validationScheme, _a), 
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            _validators__WEBPACK_IMPORTED_MODULE_0__.noop)(transaction);
        }
        catch (error) {
            invalidFields.push(fieldName);
        }
    }
    return {
        isValid: invalidFields.length === 0,
        transaction: transaction,
        method: method,
        invalidFields: invalidFields,
    };
}; };
var getCommonValidators = function (transactionType) { return ({
    type: ramda_src_equals__WEBPACK_IMPORTED_MODULE_3___default()(transactionType),
    version: validateOptional((0,_validators__WEBPACK_IMPORTED_MODULE_0__.orEq)([undefined, 1, 2, 3])),
    senderPublicKey: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isPublicKey),
    fee: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isNumberLike),
    proofs: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isArray),
}); };
var issueArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.ISSUE)), { name: _validators__WEBPACK_IMPORTED_MODULE_0__.isValidAssetName, description: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isValidAssetDescription), quantity: _validators__WEBPACK_IMPORTED_MODULE_0__.isNumberLike, decimals: _validators__WEBPACK_IMPORTED_MODULE_0__.isNumber, reissuable: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isBoolean), script: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isBase64), chainId: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isNumber) });
var issueArgsValidator = validator(issueArgsScheme, 'issue');
var transferArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.TRANSFER)), { amount: _validators__WEBPACK_IMPORTED_MODULE_0__.isNumberLike, recipient: _validators__WEBPACK_IMPORTED_MODULE_0__.isRecipient, assetId: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isAssetId), feeAssetId: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isAssetId), attachment: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isAttachment) });
var transferArgsValidator = validator(transferArgsScheme, 'transfer');
var reissueArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.REISSUE)), { assetId: _validators__WEBPACK_IMPORTED_MODULE_0__.isAssetId, quantity: _validators__WEBPACK_IMPORTED_MODULE_0__.isNumberLike, reissuable: _validators__WEBPACK_IMPORTED_MODULE_0__.isBoolean, chainId: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isNumber) });
var reissueArgsValidator = validator(reissueArgsScheme, 'reissue');
var burnArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.BURN)), { 
    // TODO isAssetId (not WAVES)
    assetId: _validators__WEBPACK_IMPORTED_MODULE_0__.isString, amount: _validators__WEBPACK_IMPORTED_MODULE_0__.isNumberLike, chainId: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isNumber) });
var burnArgsValidator = validator(burnArgsScheme, 'burn');
var leaseArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.LEASE)), { amount: _validators__WEBPACK_IMPORTED_MODULE_0__.isNumberLike, recipient: _validators__WEBPACK_IMPORTED_MODULE_0__.isRecipient });
var leaseArgsValidator = validator(leaseArgsScheme, 'lease');
var cancelLeaseArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.CANCEL_LEASE)), { leaseId: ramda_src_pipe__WEBPACK_IMPORTED_MODULE_2___default()(_validators__WEBPACK_IMPORTED_MODULE_0__.isString), chainId: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isNumber) });
var cancelLeaseArgsValidator = validator(cancelLeaseArgsScheme, 'cancel lease');
var aliasArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.ALIAS)), { alias: function (value) {
        return typeof value === 'string' ? (0,_validators__WEBPACK_IMPORTED_MODULE_0__.isValidAliasName)(value) : false;
    } });
var aliasArgsValidator = validator(aliasArgsScheme, 'alias');
var massTransferArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.MASS_TRANSFER)), { transfers: (0,_validators__WEBPACK_IMPORTED_MODULE_0__.validatePipe)(_validators__WEBPACK_IMPORTED_MODULE_0__.isArray, ramda_src_pipe__WEBPACK_IMPORTED_MODULE_2___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_8___default()('length'), ramda_src_lte__WEBPACK_IMPORTED_MODULE_9___default()(0)), function (data) {
        return data.every((0,_validators__WEBPACK_IMPORTED_MODULE_0__.validatePipe)((0,_validators__WEBPACK_IMPORTED_MODULE_0__.isRequired)(true), ramda_src_pipe__WEBPACK_IMPORTED_MODULE_2___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_8___default()('recipient'), _validators__WEBPACK_IMPORTED_MODULE_0__.isRecipient), ramda_src_pipe__WEBPACK_IMPORTED_MODULE_2___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_8___default()('amount'), _validators__WEBPACK_IMPORTED_MODULE_0__.isNumberLike)));
    }), assetId: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isAssetId), attachment: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isAttachment) });
var massTransferArgsValidator = validator(massTransferArgsScheme, 'mass transfer');
var dataArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.DATA)), { data: function (data) {
        return (0,_validators__WEBPACK_IMPORTED_MODULE_0__.isArray)(data) && data.every(function (item) { return (0,_validators__WEBPACK_IMPORTED_MODULE_0__.isValidData)(item); });
    } });
var dataArgsValidator = validator(dataArgsScheme, 'data'); // TODO fix any
var setScriptArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.SET_SCRIPT)), { script: _validators__WEBPACK_IMPORTED_MODULE_0__.isBase64, chainId: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isNumber) });
var setScriptArgsValidator = validator(setScriptArgsScheme, 'set script');
var sponsorshipArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.SPONSORSHIP)), { 
    // TODO Add not WAVES ASSET ID
    assetId: _validators__WEBPACK_IMPORTED_MODULE_0__.isString, minSponsoredAssetFee: _validators__WEBPACK_IMPORTED_MODULE_0__.isNumberLike });
var sponsorshipArgsValidator = validator(sponsorshipArgsScheme, 'sponsorship');
var exchangeArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.EXCHANGE)), { order1: (0,_validators__WEBPACK_IMPORTED_MODULE_0__.validatePipe)((0,_validators__WEBPACK_IMPORTED_MODULE_0__.isRequired)(true), _validators__WEBPACK_IMPORTED_MODULE_0__.orderValidator), order2: (0,_validators__WEBPACK_IMPORTED_MODULE_0__.validatePipe)((0,_validators__WEBPACK_IMPORTED_MODULE_0__.isRequired)(true), _validators__WEBPACK_IMPORTED_MODULE_0__.orderValidator), amount: _validators__WEBPACK_IMPORTED_MODULE_0__.isNumberLike, price: _validators__WEBPACK_IMPORTED_MODULE_0__.isNumberLike, buyMatcherFee: _validators__WEBPACK_IMPORTED_MODULE_0__.isNumberLike, sellMatcherFee: _validators__WEBPACK_IMPORTED_MODULE_0__.isNumberLike });
var exchangeArgsValidator = validator(exchangeArgsScheme, 'exchange');
var setAssetScriptArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.SET_ASSET_SCRIPT)), { script: _validators__WEBPACK_IMPORTED_MODULE_0__.isBase64, assetId: _validators__WEBPACK_IMPORTED_MODULE_0__.isAssetId, chainId: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isNumber) });
var setAssetScriptArgsValidator = validator(setAssetScriptArgsScheme, 'set asset script');
var invokeArgsScheme = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_7__.__assign)({}, getCommonValidators(_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.INVOKE_SCRIPT)), { dApp: _validators__WEBPACK_IMPORTED_MODULE_0__.isRecipient, call: validateOptional((0,_validators__WEBPACK_IMPORTED_MODULE_0__.validatePipe)(ramda_src_pipe__WEBPACK_IMPORTED_MODULE_2___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_8___default()('function'), _validators__WEBPACK_IMPORTED_MODULE_0__.isString), ramda_src_pipe__WEBPACK_IMPORTED_MODULE_2___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_8___default()('function'), ramda_src_prop__WEBPACK_IMPORTED_MODULE_8___default()('length'), ramda_src_lte__WEBPACK_IMPORTED_MODULE_9___default()(0)), ramda_src_pipe__WEBPACK_IMPORTED_MODULE_2___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_8___default()('args'), _validators__WEBPACK_IMPORTED_MODULE_0__.isArray))), payment: validateOptional((0,_validators__WEBPACK_IMPORTED_MODULE_0__.validatePipe)(_validators__WEBPACK_IMPORTED_MODULE_0__.isArray, function (data) {
        return data.every((0,_validators__WEBPACK_IMPORTED_MODULE_0__.validatePipe)(ramda_src_pipe__WEBPACK_IMPORTED_MODULE_2___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_8___default()('amount'), _validators__WEBPACK_IMPORTED_MODULE_0__.isNumberLike), ramda_src_pipe__WEBPACK_IMPORTED_MODULE_2___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_8___default()('assetId'), _validators__WEBPACK_IMPORTED_MODULE_0__.isAssetId)));
    })), feeAssetId: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isAssetId), chainId: validateOptional(_validators__WEBPACK_IMPORTED_MODULE_0__.isNumber) });
var invokeArgsValidator = validator(invokeArgsScheme, 'invoke');
var argsValidators = (_a = {},
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.ISSUE] = issueArgsValidator,
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.TRANSFER] = transferArgsValidator,
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.REISSUE] = reissueArgsValidator,
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.BURN] = burnArgsValidator,
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.LEASE] = leaseArgsValidator,
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.CANCEL_LEASE] = cancelLeaseArgsValidator,
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.ALIAS] = aliasArgsValidator,
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.MASS_TRANSFER] = massTransferArgsValidator,
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.DATA] = dataArgsValidator,
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.SET_SCRIPT] = setScriptArgsValidator,
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.SPONSORSHIP] = sponsorshipArgsValidator,
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.EXCHANGE] = exchangeArgsValidator,
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.SET_ASSET_SCRIPT] = setAssetScriptArgsValidator,
    _a[_waves_ts_types__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE.INVOKE_SCRIPT] = invokeArgsValidator,
    _a);
var validateSignerOptions = function (options) {
    var res = {
        isValid: true,
        invalidOptions: [],
    };
    var isValidLogLevel = function (level) {
        return ['verbose', 'production', 'error'].includes(String(level));
    };
    if (!(0,_validators__WEBPACK_IMPORTED_MODULE_0__.isString)(options.NODE_URL)) {
        res.isValid = false;
        res.invalidOptions.push('NODE_URL');
    }
    if (!validateOptional(isValidLogLevel)(options.LOG_LEVEL)) {
        res.isValid = false;
        res.invalidOptions.push('debug');
    }
    return res;
};
var validateProviderInterface = function (provider) {
    var isFunction = function (value) { return typeof value === 'function'; };
    var scheme = {
        connect: isFunction,
        login: isFunction,
        logout: isFunction,
        signMessage: isFunction,
        signTypedData: isFunction,
        sign: isFunction,
    };
    var invalidProperties = [];
    for (var _i = 0, _a = Object.entries(scheme); _i < _a.length; _i++) {
        var _b = _a[_i], fieldName = _b[0], validator_1 = _b[1];
        if (!validator_1(provider[fieldName])) {
            invalidProperties.push(fieldName);
        }
    }
    return {
        isValid: invalidProperties.length === 0,
        invalidProperties: invalidProperties,
    };
};


/***/ }),

/***/ "./node_modules/@waves/signer/dist/es/validators.js":
/*!**********************************************************!*\
  !*** ./node_modules/@waves/signer/dist/es/validators.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isArray": () => (/* binding */ isArray),
/* harmony export */   "validatePipe": () => (/* binding */ validatePipe),
/* harmony export */   "isRequired": () => (/* binding */ isRequired),
/* harmony export */   "isString": () => (/* binding */ isString),
/* harmony export */   "isNumber": () => (/* binding */ isNumber),
/* harmony export */   "isNumberLike": () => (/* binding */ isNumberLike),
/* harmony export */   "isBoolean": () => (/* binding */ isBoolean),
/* harmony export */   "orEq": () => (/* binding */ orEq),
/* harmony export */   "validateBySchema": () => (/* binding */ validateBySchema),
/* harmony export */   "isAttachment": () => (/* binding */ isAttachment),
/* harmony export */   "isValidAliasName": () => (/* binding */ isValidAliasName),
/* harmony export */   "isBase64": () => (/* binding */ isBase64),
/* harmony export */   "isValidData": () => (/* binding */ isValidData),
/* harmony export */   "isPublicKey": () => (/* binding */ isPublicKey),
/* harmony export */   "isValidAssetName": () => (/* binding */ isValidAssetName),
/* harmony export */   "isValidAssetDescription": () => (/* binding */ isValidAssetDescription),
/* harmony export */   "isAssetId": () => (/* binding */ isAssetId),
/* harmony export */   "isRecipient": () => (/* binding */ isRecipient),
/* harmony export */   "noop": () => (/* binding */ noop),
/* harmony export */   "orderValidator": () => (/* binding */ orderValidator)
/* harmony export */ });
/* unused harmony exports exception, ASSETS, validateType, isValidDataPair, isAlias, isValidAddress, isValidAlias */
/* harmony import */ var ramda_src_defaultTo__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ramda/src/defaultTo */ "./node_modules/@waves/signer/node_modules/ramda/src/defaultTo.js");
/* harmony import */ var ramda_src_defaultTo__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(ramda_src_defaultTo__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var ramda_src_prop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ramda/src/prop */ "./node_modules/@waves/signer/node_modules/ramda/src/prop.js");
/* harmony import */ var ramda_src_prop__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(ramda_src_prop__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ramda/src/ifElse */ "./node_modules/@waves/signer/node_modules/ramda/src/ifElse.js");
/* harmony import */ var ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var ramda_src_pipe__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ramda/src/pipe */ "./node_modules/@waves/signer/node_modules/ramda/src/pipe.js");
/* harmony import */ var ramda_src_pipe__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(ramda_src_pipe__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var ramda_src_equals__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ramda/src/equals */ "./node_modules/@waves/signer/node_modules/ramda/src/equals.js");
/* harmony import */ var ramda_src_equals__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(ramda_src_equals__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var ramda_src_gte__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ramda/src/gte */ "./node_modules/@waves/signer/node_modules/ramda/src/gte.js");
/* harmony import */ var ramda_src_gte__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(ramda_src_gte__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var ramda_src_lte__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ramda/src/lte */ "./node_modules/@waves/signer/node_modules/ramda/src/lte.js");
/* harmony import */ var ramda_src_lte__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(ramda_src_lte__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var ramda_src_startsWith__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ramda/src/startsWith */ "./node_modules/@waves/signer/node_modules/ramda/src/startsWith.js");
/* harmony import */ var ramda_src_startsWith__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(ramda_src_startsWith__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var ramda_src_isNil__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ramda/src/isNil */ "./node_modules/@waves/signer/node_modules/ramda/src/isNil.js");
/* harmony import */ var ramda_src_isNil__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(ramda_src_isNil__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var ramda_src_includes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ramda/src/includes */ "./node_modules/@waves/signer/node_modules/ramda/src/includes.js");
/* harmony import */ var ramda_src_includes__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(ramda_src_includes__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var ramda_src_flip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ramda/src/flip */ "./node_modules/@waves/signer/node_modules/ramda/src/flip.js");
/* harmony import */ var ramda_src_flip__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(ramda_src_flip__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var ramda_src_always__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ramda/src/always */ "./node_modules/@waves/signer/node_modules/ramda/src/always.js");
/* harmony import */ var ramda_src_always__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(ramda_src_always__WEBPACK_IMPORTED_MODULE_6__);












var TX_DEFAULTS = {
    MAX_ATTACHMENT: 140,
    ALIAS: {
        AVAILABLE_CHARS: '-.0123456789@_abcdefghijklmnopqrstuvwxyz',
        MAX_ALIAS_LENGTH: 30,
        MIN_ALIAS_LENGTH: 4,
    },
};
var isArray = function (value) { return Array.isArray(value); };
var validatePipe = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function (value) {
        var isValid = true;
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var cb = args_1[_i];
            isValid = !!cb(value);
            if (!isValid) {
                return false;
            }
        }
        return isValid;
    };
};
var isRequired = function (required) { return function (value) {
    return !required || value != null;
}; };
var isString = function (value) {
    return typeof value === 'string' || value instanceof String;
};
var isNumber = function (value) {
    return (typeof value === 'number' || value instanceof Number) &&
        !isNaN(Number(value));
};
var isNumberLike = function (value) {
    return value != null && !isNaN(Number(value)) && !!(value || value === 0);
};
var isBoolean = function (value) {
    return value != null && (typeof value === 'boolean' || value instanceof Boolean);
};
var orEq = ramda_src_flip__WEBPACK_IMPORTED_MODULE_0___default()((ramda_src_includes__WEBPACK_IMPORTED_MODULE_1___default()));
var exception = function (msg) {
    throw new Error(msg);
};
var validateBySchema = function (schema, errorTpl) { return function (tx) {
    Object.entries(schema).forEach(function (_a) {
        var key = _a[0], cb = _a[1];
        var value = ramda_src_prop__WEBPACK_IMPORTED_MODULE_2___default()(key, tx || {});
        if (!cb(value)) {
            exception(errorTpl(key, value));
        }
    });
    return true;
}; };
var isAttachment = ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_3___default()(orEq([null, undefined]), ramda_src_defaultTo__WEBPACK_IMPORTED_MODULE_4___default()(true), ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_3___default()(isString, 
// TODO Fix attachment gte(TX_DEFAULTS.MAX_ATTACHMENT)
ramda_src_pipe__WEBPACK_IMPORTED_MODULE_5___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_2___default()('length'), ramda_src_always__WEBPACK_IMPORTED_MODULE_6___default()(true)), ramda_src_defaultTo__WEBPACK_IMPORTED_MODULE_4___default()(false)));
var validateChars = function (chars) { return function (value) {
    return value.split('').every(function (char) { return chars.includes(char); });
}; };
var isValidAliasName = ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_3___default()(validateChars(TX_DEFAULTS.ALIAS.AVAILABLE_CHARS), ramda_src_pipe__WEBPACK_IMPORTED_MODULE_5___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_2___default()('length'), validatePipe(ramda_src_gte__WEBPACK_IMPORTED_MODULE_7___default()(TX_DEFAULTS.ALIAS.MAX_ALIAS_LENGTH), ramda_src_lte__WEBPACK_IMPORTED_MODULE_8___default()(TX_DEFAULTS.ALIAS.MIN_ALIAS_LENGTH))), ramda_src_defaultTo__WEBPACK_IMPORTED_MODULE_4___default()(false));
var ASSETS = {
    NAME_MIN_BYTES: 4,
    NAME_MAX_BYTES: 16,
    DESCRIPTION_MAX_BYTES: 1000,
};
var isBase64 = validatePipe(ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_3___default()(isString, ramda_src_startsWith__WEBPACK_IMPORTED_MODULE_9___default()('base64:'), ramda_src_pipe__WEBPACK_IMPORTED_MODULE_5___default()((ramda_src_isNil__WEBPACK_IMPORTED_MODULE_10___default()))));
var validateType = {
    integer: isNumberLike,
    boolean: isBoolean,
    string: isString,
    binary: isBase64,
};
var isValidDataPair = function (data) { return !!(validateType[data.type] && validateType[data.type](data.value)); };
var isValidData = validatePipe(isRequired(true), ramda_src_pipe__WEBPACK_IMPORTED_MODULE_5___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_2___default()('key'), validatePipe(isString, function (key) { return !!key; })), isValidDataPair);
var isPublicKey = validatePipe(isString, function (v) { return v.length === 32; });
var isValidAssetName = validatePipe(isString, ramda_src_pipe__WEBPACK_IMPORTED_MODULE_5___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_2___default()('length'), ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_3___default()(ramda_src_lte__WEBPACK_IMPORTED_MODULE_8___default()(ASSETS.NAME_MIN_BYTES), ramda_src_gte__WEBPACK_IMPORTED_MODULE_7___default()(ASSETS.NAME_MAX_BYTES), ramda_src_defaultTo__WEBPACK_IMPORTED_MODULE_4___default()(false))));
var isValidAssetDescription = validatePipe(isString, ramda_src_pipe__WEBPACK_IMPORTED_MODULE_5___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_2___default()('length'), ramda_src_gte__WEBPACK_IMPORTED_MODULE_7___default()(ASSETS.DESCRIPTION_MAX_BYTES)));
var isAssetId = validatePipe(ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_3___default()(orEq(['', null, undefined, 'WAVES']), ramda_src_defaultTo__WEBPACK_IMPORTED_MODULE_4___default()(true), isString));
var isAlias = function (value) { return value.startsWith('alias:'); };
// TODO fix validator!!!
var isValidAddress = isString;
var isValidAlias = ramda_src_pipe__WEBPACK_IMPORTED_MODULE_5___default()(function (value) { return value.split(':')[2]; }, isValidAliasName);
var isRecipient = validatePipe(isString, ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_3___default()(isAlias, isValidAlias, isValidAddress));
var orderScheme = {
    orderType: orEq(['sell', 'buy']),
    senderPublicKey: isPublicKey,
    matcherPublicKey: isPublicKey,
    version: orEq([undefined, 0, 1, 2, 3]),
    assetPair: validatePipe(isRequired(true), ramda_src_pipe__WEBPACK_IMPORTED_MODULE_5___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_2___default()('amountAsset'), isAssetId), ramda_src_pipe__WEBPACK_IMPORTED_MODULE_5___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_2___default()('priceAsset'), isAssetId)),
    price: isNumberLike,
    amount: isNumberLike,
    matcherFee: isNumberLike,
    expiration: isNumberLike,
    timestamp: isNumber,
    proofs: ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_3___default()(isArray, ramda_src_defaultTo__WEBPACK_IMPORTED_MODULE_4___default()(true), orEq([undefined])),
};
var v12OrderScheme = {
    matcherFeeAssetId: orEq([undefined, null, 'WAVES']),
};
var v3OrderScheme = {
    matcherFeeAssetId: isAssetId,
};
// eslint-disable-next-line @typescript-eslint/no-empty-function
var noop = function () {
};
// TODO!!!
var validateOrder = validateBySchema(orderScheme, noop);
var validateOrderV2 = validateBySchema(v12OrderScheme, noop);
var validateOrderV3 = validateBySchema(v3OrderScheme, noop);
var orderValidator = validatePipe(validateOrder, ramda_src_ifElse__WEBPACK_IMPORTED_MODULE_3___default()(ramda_src_pipe__WEBPACK_IMPORTED_MODULE_5___default()(ramda_src_prop__WEBPACK_IMPORTED_MODULE_2___default()('version'), ramda_src_equals__WEBPACK_IMPORTED_MODULE_11___default()(3)), validateOrderV3, validateOrderV2));


/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/always.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/always.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry1 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry1 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry1.js");
/**
 * Returns a function that always returns the given value. Note that for
 * non-primitives the value returned is a reference to the original value.
 *
 * This function is known as `const`, `constant`, or `K` (for K combinator) in
 * other languages and libraries.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig a -> (* -> a)
 * @param {*} val The value to wrap in a function
 * @return {Function} A Function :: * -> val.
 * @example
 *
 *      const t = R.always('Tee');
 *      t(); //=> 'Tee'
 */


var always =
/*#__PURE__*/
_curry1(function always(val) {
  return function () {
    return val;
  };
});

module.exports = always;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/bind.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/bind.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _arity =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_arity */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_arity.js");

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");
/**
 * Creates a function that is bound to a context.
 * Note: `R.bind` does not provide the additional argument-binding capabilities of
 * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category Function
 * @category Object
 * @sig (* -> *) -> {*} -> (* -> *)
 * @param {Function} fn The function to bind to context
 * @param {Object} thisObj The context to bind `fn` to
 * @return {Function} A function that will execute in the context of `thisObj`.
 * @see R.partial
 * @example
 *
 *      const log = R.bind(console.log, console);
 *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}
 *      // logs {a: 2}
 * @symb R.bind(f, o)(a, b) = f.call(o, a, b)
 */


var bind =
/*#__PURE__*/
_curry2(function bind(fn, thisObj) {
  return _arity(fn.length, function () {
    return fn.apply(thisObj, arguments);
  });
});

module.exports = bind;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/curryN.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/curryN.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _arity =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_arity */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_arity.js");

var _curry1 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry1 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry1.js");

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");

var _curryN =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curryN */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curryN.js");
/**
 * Returns a curried equivalent of the provided function, with the specified
 * arity. The curried function has two unusual capabilities. First, its
 * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @func
 * @memberOf R
 * @since v0.5.0
 * @category Function
 * @sig Number -> (* -> a) -> (* -> a)
 * @param {Number} length The arity for the returned function.
 * @param {Function} fn The function to curry.
 * @return {Function} A new, curried function.
 * @see R.curry
 * @example
 *
 *      const sumArgs = (...args) => R.sum(args);
 *
 *      const curriedAddFourNumbers = R.curryN(4, sumArgs);
 *      const f = curriedAddFourNumbers(1, 2);
 *      const g = f(3);
 *      g(4); //=> 10
 */


var curryN =
/*#__PURE__*/
_curry2(function curryN(length, fn) {
  if (length === 1) {
    return _curry1(fn);
  }

  return _arity(length, _curryN(length, [], fn));
});

module.exports = curryN;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/defaultTo.js":
/*!************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/defaultTo.js ***!
  \************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");
/**
 * Returns the second argument if it is not `null`, `undefined` or `NaN`;
 * otherwise the first argument is returned.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Logic
 * @sig a -> b -> a | b
 * @param {a} default The default value.
 * @param {b} val `val` will be returned instead of `default` unless `val` is `null`, `undefined` or `NaN`.
 * @return {*} The second value if it is not `null`, `undefined` or `NaN`, otherwise the default value
 * @example
 *
 *      const defaultTo42 = R.defaultTo(42);
 *
 *      defaultTo42(null);  //=> 42
 *      defaultTo42(undefined);  //=> 42
 *      defaultTo42(false);  //=> false
 *      defaultTo42('Ramda');  //=> 'Ramda'
 *      // parseInt('string') results in NaN
 *      defaultTo42(parseInt('string')); //=> 42
 */


var defaultTo =
/*#__PURE__*/
_curry2(function defaultTo(d, v) {
  return v == null || v !== v ? d : v;
});

module.exports = defaultTo;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/equals.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/equals.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");

var _equals =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_equals */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_equals.js");
/**
 * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
 * cyclical data structures.
 *
 * Dispatches symmetrically to the `equals` methods of both arguments, if
 * present.
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Relation
 * @sig a -> b -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      R.equals(1, 1); //=> true
 *      R.equals(1, '1'); //=> false
 *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
 *
 *      const a = {}; a.v = a;
 *      const b = {}; b.v = b;
 *      R.equals(a, b); //=> true
 */


var equals =
/*#__PURE__*/
_curry2(function equals(a, b) {
  return _equals(a, b, [], []);
});

module.exports = equals;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/flip.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/flip.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry1 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry1 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry1.js");

var curryN =
/*#__PURE__*/
__webpack_require__(/*! ./curryN */ "./node_modules/@waves/signer/node_modules/ramda/src/curryN.js");
/**
 * Returns a new function much like the supplied one, except that the first two
 * arguments' order is reversed.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((a, b, c, ...) -> z) -> (b -> a -> c -> ... -> z)
 * @param {Function} fn The function to invoke with its first two parameters reversed.
 * @return {*} The result of invoking `fn` with its first two parameters' order reversed.
 * @example
 *
 *      const mergeThree = (a, b, c) => [].concat(a, b, c);
 *
 *      mergeThree(1, 2, 3); //=> [1, 2, 3]
 *
 *      R.flip(mergeThree)(1, 2, 3); //=> [2, 1, 3]
 * @symb R.flip(f)(a, b, c) = f(b, a, c)
 */


var flip =
/*#__PURE__*/
_curry1(function flip(fn) {
  return curryN(fn.length, function (a, b) {
    var args = Array.prototype.slice.call(arguments, 0);
    args[0] = b;
    args[1] = a;
    return fn.apply(this, args);
  });
});

module.exports = flip;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/gte.js":
/*!******************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/gte.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");
/**
 * Returns `true` if the first argument is greater than or equal to the second;
 * `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> Boolean
 * @param {Number} a
 * @param {Number} b
 * @return {Boolean}
 * @see R.lte
 * @example
 *
 *      R.gte(2, 1); //=> true
 *      R.gte(2, 2); //=> true
 *      R.gte(2, 3); //=> false
 *      R.gte('a', 'z'); //=> false
 *      R.gte('z', 'a'); //=> true
 */


var gte =
/*#__PURE__*/
_curry2(function gte(a, b) {
  return a >= b;
});

module.exports = gte;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/ifElse.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/ifElse.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry3 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry3 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry3.js");

var curryN =
/*#__PURE__*/
__webpack_require__(/*! ./curryN */ "./node_modules/@waves/signer/node_modules/ramda/src/curryN.js");
/**
 * Creates a function that will process either the `onTrue` or the `onFalse`
 * function depending upon the result of the `condition` predicate.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Logic
 * @sig (*... -> Boolean) -> (*... -> *) -> (*... -> *) -> (*... -> *)
 * @param {Function} condition A predicate function
 * @param {Function} onTrue A function to invoke when the `condition` evaluates to a truthy value.
 * @param {Function} onFalse A function to invoke when the `condition` evaluates to a falsy value.
 * @return {Function} A new function that will process either the `onTrue` or the `onFalse`
 *                    function depending upon the result of the `condition` predicate.
 * @see R.unless, R.when, R.cond
 * @example
 *
 *      const incCount = R.ifElse(
 *        R.has('count'),
 *        R.over(R.lensProp('count'), R.inc),
 *        R.assoc('count', 1)
 *      );
 *      incCount({});           //=> { count: 1 }
 *      incCount({ count: 1 }); //=> { count: 2 }
 */


var ifElse =
/*#__PURE__*/
_curry3(function ifElse(condition, onTrue, onFalse) {
  return curryN(Math.max(condition.length, onTrue.length, onFalse.length), function _ifElse() {
    return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments);
  });
});

module.exports = ifElse;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/includes.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/includes.js ***!
  \***********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _includes =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_includes */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_includes.js");

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");
/**
 * Returns `true` if the specified value is equal, in [`R.equals`](#equals)
 * terms, to at least one element of the given list; `false` otherwise.
 * Works also with strings.
 *
 * @func
 * @memberOf R
 * @since v0.26.0
 * @category List
 * @sig a -> [a] -> Boolean
 * @param {Object} a The item to compare against.
 * @param {Array} list The array to consider.
 * @return {Boolean} `true` if an equivalent item is in the list, `false` otherwise.
 * @see R.any
 * @example
 *
 *      R.includes(3, [1, 2, 3]); //=> true
 *      R.includes(4, [1, 2, 3]); //=> false
 *      R.includes({ name: 'Fred' }, [{ name: 'Fred' }]); //=> true
 *      R.includes([42], [[42]]); //=> true
 *      R.includes('ba', 'banana'); //=>true
 */


var includes =
/*#__PURE__*/
_curry2(_includes);

module.exports = includes;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_arity.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_arity.js ***!
  \******************************************************************************/
/***/ ((module) => {

function _arity(n, fn) {
  /* eslint-disable no-unused-vars */
  switch (n) {
    case 0:
      return function () {
        return fn.apply(this, arguments);
      };

    case 1:
      return function (a0) {
        return fn.apply(this, arguments);
      };

    case 2:
      return function (a0, a1) {
        return fn.apply(this, arguments);
      };

    case 3:
      return function (a0, a1, a2) {
        return fn.apply(this, arguments);
      };

    case 4:
      return function (a0, a1, a2, a3) {
        return fn.apply(this, arguments);
      };

    case 5:
      return function (a0, a1, a2, a3, a4) {
        return fn.apply(this, arguments);
      };

    case 6:
      return function (a0, a1, a2, a3, a4, a5) {
        return fn.apply(this, arguments);
      };

    case 7:
      return function (a0, a1, a2, a3, a4, a5, a6) {
        return fn.apply(this, arguments);
      };

    case 8:
      return function (a0, a1, a2, a3, a4, a5, a6, a7) {
        return fn.apply(this, arguments);
      };

    case 9:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
        return fn.apply(this, arguments);
      };

    case 10:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        return fn.apply(this, arguments);
      };

    default:
      throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
  }
}

module.exports = _arity;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_arrayFromIterator.js":
/*!******************************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_arrayFromIterator.js ***!
  \******************************************************************************************/
/***/ ((module) => {

function _arrayFromIterator(iter) {
  var list = [];
  var next;

  while (!(next = iter.next()).done) {
    list.push(next.value);
  }

  return list;
}

module.exports = _arrayFromIterator;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_checkForMethod.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_checkForMethod.js ***!
  \***************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _isArray =
/*#__PURE__*/
__webpack_require__(/*! ./_isArray */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isArray.js");
/**
 * This checks whether a function has a [methodname] function. If it isn't an
 * array it will execute that function otherwise it will default to the ramda
 * implementation.
 *
 * @private
 * @param {Function} fn ramda implemtation
 * @param {String} methodname property to check for a custom implementation
 * @return {Object} Whatever the return value of the method is.
 */


function _checkForMethod(methodname, fn) {
  return function () {
    var length = arguments.length;

    if (length === 0) {
      return fn();
    }

    var obj = arguments[length - 1];
    return _isArray(obj) || typeof obj[methodname] !== 'function' ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
  };
}

module.exports = _checkForMethod;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry1.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry1.js ***!
  \*******************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _isPlaceholder =
/*#__PURE__*/
__webpack_require__(/*! ./_isPlaceholder */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isPlaceholder.js");
/**
 * Optimized internal one-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */


function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0 || _isPlaceholder(a)) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
}

module.exports = _curry1;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js ***!
  \*******************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry1 =
/*#__PURE__*/
__webpack_require__(/*! ./_curry1 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry1.js");

var _isPlaceholder =
/*#__PURE__*/
__webpack_require__(/*! ./_isPlaceholder */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isPlaceholder.js");
/**
 * Optimized internal two-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */


function _curry2(fn) {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;

      case 1:
        return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
          return fn(a, _b);
        });

      default:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b);
        }) : fn(a, b);
    }
  };
}

module.exports = _curry2;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry3.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry3.js ***!
  \*******************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry1 =
/*#__PURE__*/
__webpack_require__(/*! ./_curry1 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry1.js");

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");

var _isPlaceholder =
/*#__PURE__*/
__webpack_require__(/*! ./_isPlaceholder */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isPlaceholder.js");
/**
 * Optimized internal three-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */


function _curry3(fn) {
  return function f3(a, b, c) {
    switch (arguments.length) {
      case 0:
        return f3;

      case 1:
        return _isPlaceholder(a) ? f3 : _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        });

      case 2:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function (_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) ? _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        }) : _curry1(function (_c) {
          return fn(a, b, _c);
        });

      default:
        return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function (_a, _b) {
          return fn(_a, _b, c);
        }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function (_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        }) : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b, c);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b, c);
        }) : _isPlaceholder(c) ? _curry1(function (_c) {
          return fn(a, b, _c);
        }) : fn(a, b, c);
    }
  };
}

module.exports = _curry3;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curryN.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_curryN.js ***!
  \*******************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _arity =
/*#__PURE__*/
__webpack_require__(/*! ./_arity */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_arity.js");

var _isPlaceholder =
/*#__PURE__*/
__webpack_require__(/*! ./_isPlaceholder */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isPlaceholder.js");
/**
 * Internal curryN function.
 *
 * @private
 * @category Function
 * @param {Number} length The arity of the curried function.
 * @param {Array} received An array of arguments received thus far.
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */


function _curryN(length, received, fn) {
  return function () {
    var combined = [];
    var argsIdx = 0;
    var left = length;
    var combinedIdx = 0;

    while (combinedIdx < received.length || argsIdx < arguments.length) {
      var result;

      if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
        result = received[combinedIdx];
      } else {
        result = arguments[argsIdx];
        argsIdx += 1;
      }

      combined[combinedIdx] = result;

      if (!_isPlaceholder(result)) {
        left -= 1;
      }

      combinedIdx += 1;
    }

    return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
  };
}

module.exports = _curryN;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_dispatchable.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_dispatchable.js ***!
  \*************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _isArray =
/*#__PURE__*/
__webpack_require__(/*! ./_isArray */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isArray.js");

var _isTransformer =
/*#__PURE__*/
__webpack_require__(/*! ./_isTransformer */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isTransformer.js");
/**
 * Returns a function that dispatches with different strategies based on the
 * object in list position (last argument). If it is an array, executes [fn].
 * Otherwise, if it has a function with one of the given method names, it will
 * execute that function (functor case). Otherwise, if it is a transformer,
 * uses transducer [xf] to return a new transformer (transducer case).
 * Otherwise, it will default to executing [fn].
 *
 * @private
 * @param {Array} methodNames properties to check for a custom implementation
 * @param {Function} xf transducer to initialize if object is transformer
 * @param {Function} fn default ramda implementation
 * @return {Function} A function that dispatches on object in list position
 */


function _dispatchable(methodNames, xf, fn) {
  return function () {
    if (arguments.length === 0) {
      return fn();
    }

    var args = Array.prototype.slice.call(arguments, 0);
    var obj = args.pop();

    if (!_isArray(obj)) {
      var idx = 0;

      while (idx < methodNames.length) {
        if (typeof obj[methodNames[idx]] === 'function') {
          return obj[methodNames[idx]].apply(obj, args);
        }

        idx += 1;
      }

      if (_isTransformer(obj)) {
        var transducer = xf.apply(null, args);
        return transducer(obj);
      }
    }

    return fn.apply(this, arguments);
  };
}

module.exports = _dispatchable;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_equals.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_equals.js ***!
  \*******************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _arrayFromIterator =
/*#__PURE__*/
__webpack_require__(/*! ./_arrayFromIterator */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_arrayFromIterator.js");

var _includesWith =
/*#__PURE__*/
__webpack_require__(/*! ./_includesWith */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_includesWith.js");

var _functionName =
/*#__PURE__*/
__webpack_require__(/*! ./_functionName */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_functionName.js");

var _has =
/*#__PURE__*/
__webpack_require__(/*! ./_has */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_has.js");

var _objectIs =
/*#__PURE__*/
__webpack_require__(/*! ./_objectIs */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_objectIs.js");

var keys =
/*#__PURE__*/
__webpack_require__(/*! ../keys */ "./node_modules/@waves/signer/node_modules/ramda/src/keys.js");

var type =
/*#__PURE__*/
__webpack_require__(/*! ../type */ "./node_modules/@waves/signer/node_modules/ramda/src/type.js");
/**
 * private _uniqContentEquals function.
 * That function is checking equality of 2 iterator contents with 2 assumptions
 * - iterators lengths are the same
 * - iterators values are unique
 *
 * false-positive result will be returned for comparision of, e.g.
 * - [1,2,3] and [1,2,3,4]
 * - [1,1,1] and [1,2,3]
 * */


function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
  var a = _arrayFromIterator(aIterator);

  var b = _arrayFromIterator(bIterator);

  function eq(_a, _b) {
    return _equals(_a, _b, stackA.slice(), stackB.slice());
  } // if *a* array contains any element that is not included in *b*


  return !_includesWith(function (b, aItem) {
    return !_includesWith(eq, aItem, b);
  }, b, a);
}

function _equals(a, b, stackA, stackB) {
  if (_objectIs(a, b)) {
    return true;
  }

  var typeA = type(a);

  if (typeA !== type(b)) {
    return false;
  }

  if (a == null || b == null) {
    return false;
  }

  if (typeof a['fantasy-land/equals'] === 'function' || typeof b['fantasy-land/equals'] === 'function') {
    return typeof a['fantasy-land/equals'] === 'function' && a['fantasy-land/equals'](b) && typeof b['fantasy-land/equals'] === 'function' && b['fantasy-land/equals'](a);
  }

  if (typeof a.equals === 'function' || typeof b.equals === 'function') {
    return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a);
  }

  switch (typeA) {
    case 'Arguments':
    case 'Array':
    case 'Object':
      if (typeof a.constructor === 'function' && _functionName(a.constructor) === 'Promise') {
        return a === b;
      }

      break;

    case 'Boolean':
    case 'Number':
    case 'String':
      if (!(typeof a === typeof b && _objectIs(a.valueOf(), b.valueOf()))) {
        return false;
      }

      break;

    case 'Date':
      if (!_objectIs(a.valueOf(), b.valueOf())) {
        return false;
      }

      break;

    case 'Error':
      return a.name === b.name && a.message === b.message;

    case 'RegExp':
      if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
        return false;
      }

      break;
  }

  var idx = stackA.length - 1;

  while (idx >= 0) {
    if (stackA[idx] === a) {
      return stackB[idx] === b;
    }

    idx -= 1;
  }

  switch (typeA) {
    case 'Map':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));

    case 'Set':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));

    case 'Arguments':
    case 'Array':
    case 'Object':
    case 'Boolean':
    case 'Number':
    case 'String':
    case 'Date':
    case 'Error':
    case 'RegExp':
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'ArrayBuffer':
      break;

    default:
      // Values of other types are only equal if identical.
      return false;
  }

  var keysA = keys(a);

  if (keysA.length !== keys(b).length) {
    return false;
  }

  var extendedStackA = stackA.concat([a]);
  var extendedStackB = stackB.concat([b]);
  idx = keysA.length - 1;

  while (idx >= 0) {
    var key = keysA[idx];

    if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
      return false;
    }

    idx -= 1;
  }

  return true;
}

module.exports = _equals;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_functionName.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_functionName.js ***!
  \*************************************************************************************/
/***/ ((module) => {

function _functionName(f) {
  // String(x => x) evaluates to "x => x", so the pattern may not match.
  var match = String(f).match(/^function (\w*)/);
  return match == null ? '' : match[1];
}

module.exports = _functionName;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_has.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_has.js ***!
  \****************************************************************************/
/***/ ((module) => {

function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = _has;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_includes.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_includes.js ***!
  \*********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _indexOf =
/*#__PURE__*/
__webpack_require__(/*! ./_indexOf */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_indexOf.js");

function _includes(a, list) {
  return _indexOf(list, a, 0) >= 0;
}

module.exports = _includes;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_includesWith.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_includesWith.js ***!
  \*************************************************************************************/
/***/ ((module) => {

function _includesWith(pred, x, list) {
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    if (pred(x, list[idx])) {
      return true;
    }

    idx += 1;
  }

  return false;
}

module.exports = _includesWith;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_indexOf.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_indexOf.js ***!
  \********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var equals =
/*#__PURE__*/
__webpack_require__(/*! ../equals */ "./node_modules/@waves/signer/node_modules/ramda/src/equals.js");

function _indexOf(list, a, idx) {
  var inf, item; // Array.prototype.indexOf doesn't exist below IE9

  if (typeof list.indexOf === 'function') {
    switch (typeof a) {
      case 'number':
        if (a === 0) {
          // manually crawl the list to distinguish between +0 and -0
          inf = 1 / a;

          while (idx < list.length) {
            item = list[idx];

            if (item === 0 && 1 / item === inf) {
              return idx;
            }

            idx += 1;
          }

          return -1;
        } else if (a !== a) {
          // NaN
          while (idx < list.length) {
            item = list[idx];

            if (typeof item === 'number' && item !== item) {
              return idx;
            }

            idx += 1;
          }

          return -1;
        } // non-zero numbers can utilise Set


        return list.indexOf(a, idx);
      // all these types can utilise Set

      case 'string':
      case 'boolean':
      case 'function':
      case 'undefined':
        return list.indexOf(a, idx);

      case 'object':
        if (a === null) {
          // null can utilise Set
          return list.indexOf(a, idx);
        }

    }
  } // anything else not covered above, defer to R.equals


  while (idx < list.length) {
    if (equals(list[idx], a)) {
      return idx;
    }

    idx += 1;
  }

  return -1;
}

module.exports = _indexOf;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isArguments.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_isArguments.js ***!
  \************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _has =
/*#__PURE__*/
__webpack_require__(/*! ./_has */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_has.js");

var toString = Object.prototype.toString;

var _isArguments =
/*#__PURE__*/
function () {
  return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
    return toString.call(x) === '[object Arguments]';
  } : function _isArguments(x) {
    return _has('callee', x);
  };
}();

module.exports = _isArguments;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isArray.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_isArray.js ***!
  \********************************************************************************/
/***/ ((module) => {

/**
 * Tests whether or not an object is an array.
 *
 * @private
 * @param {*} val The object to test.
 * @return {Boolean} `true` if `val` is an array, `false` otherwise.
 * @example
 *
 *      _isArray([]); //=> true
 *      _isArray(null); //=> false
 *      _isArray({}); //=> false
 */
module.exports = Array.isArray || function _isArray(val) {
  return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
};

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isArrayLike.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_isArrayLike.js ***!
  \************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry1 =
/*#__PURE__*/
__webpack_require__(/*! ./_curry1 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry1.js");

var _isArray =
/*#__PURE__*/
__webpack_require__(/*! ./_isArray */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isArray.js");

var _isString =
/*#__PURE__*/
__webpack_require__(/*! ./_isString */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isString.js");
/**
 * Tests whether or not an object is similar to an array.
 *
 * @private
 * @category Type
 * @category List
 * @sig * -> Boolean
 * @param {*} x The object to test.
 * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
 * @example
 *
 *      _isArrayLike([]); //=> true
 *      _isArrayLike(true); //=> false
 *      _isArrayLike({}); //=> false
 *      _isArrayLike({length: 10}); //=> false
 *      _isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
 */


var _isArrayLike =
/*#__PURE__*/
_curry1(function isArrayLike(x) {
  if (_isArray(x)) {
    return true;
  }

  if (!x) {
    return false;
  }

  if (typeof x !== 'object') {
    return false;
  }

  if (_isString(x)) {
    return false;
  }

  if (x.nodeType === 1) {
    return !!x.length;
  }

  if (x.length === 0) {
    return true;
  }

  if (x.length > 0) {
    return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
  }

  return false;
});

module.exports = _isArrayLike;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isInteger.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_isInteger.js ***!
  \**********************************************************************************/
/***/ ((module) => {

/**
 * Determine if the passed argument is an integer.
 *
 * @private
 * @param {*} n
 * @category Type
 * @return {Boolean}
 */
module.exports = Number.isInteger || function _isInteger(n) {
  return n << 0 === n;
};

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isPlaceholder.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_isPlaceholder.js ***!
  \**************************************************************************************/
/***/ ((module) => {

function _isPlaceholder(a) {
  return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
}

module.exports = _isPlaceholder;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isString.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_isString.js ***!
  \*********************************************************************************/
/***/ ((module) => {

function _isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
}

module.exports = _isString;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isTransformer.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_isTransformer.js ***!
  \**************************************************************************************/
/***/ ((module) => {

function _isTransformer(obj) {
  return obj != null && typeof obj['@@transducer/step'] === 'function';
}

module.exports = _isTransformer;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_objectIs.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_objectIs.js ***!
  \*********************************************************************************/
/***/ ((module) => {

// Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
function _objectIs(a, b) {
  // SameValue algorithm
  if (a === b) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return a !== 0 || 1 / a === 1 / b;
  } else {
    // Step 6.a: NaN == NaN
    return a !== a && b !== b;
  }
}

module.exports = typeof Object.is === 'function' ? Object.is : _objectIs;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_pipe.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_pipe.js ***!
  \*****************************************************************************/
/***/ ((module) => {

function _pipe(f, g) {
  return function () {
    return g.call(this, f.apply(this, arguments));
  };
}

module.exports = _pipe;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_reduce.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_reduce.js ***!
  \*******************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _isArrayLike =
/*#__PURE__*/
__webpack_require__(/*! ./_isArrayLike */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isArrayLike.js");

var _xwrap =
/*#__PURE__*/
__webpack_require__(/*! ./_xwrap */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_xwrap.js");

var bind =
/*#__PURE__*/
__webpack_require__(/*! ../bind */ "./node_modules/@waves/signer/node_modules/ramda/src/bind.js");

function _arrayReduce(xf, acc, list) {
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    acc = xf['@@transducer/step'](acc, list[idx]);

    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }

    idx += 1;
  }

  return xf['@@transducer/result'](acc);
}

function _iterableReduce(xf, acc, iter) {
  var step = iter.next();

  while (!step.done) {
    acc = xf['@@transducer/step'](acc, step.value);

    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }

    step = iter.next();
  }

  return xf['@@transducer/result'](acc);
}

function _methodReduce(xf, acc, obj, methodName) {
  return xf['@@transducer/result'](obj[methodName](bind(xf['@@transducer/step'], xf), acc));
}

var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';

function _reduce(fn, acc, list) {
  if (typeof fn === 'function') {
    fn = _xwrap(fn);
  }

  if (_isArrayLike(list)) {
    return _arrayReduce(fn, acc, list);
  }

  if (typeof list['fantasy-land/reduce'] === 'function') {
    return _methodReduce(fn, acc, list, 'fantasy-land/reduce');
  }

  if (list[symIterator] != null) {
    return _iterableReduce(fn, acc, list[symIterator]());
  }

  if (typeof list.next === 'function') {
    return _iterableReduce(fn, acc, list);
  }

  if (typeof list.reduce === 'function') {
    return _methodReduce(fn, acc, list, 'reduce');
  }

  throw new TypeError('reduce: list must be array or iterable');
}

module.exports = _reduce;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_reduced.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_reduced.js ***!
  \********************************************************************************/
/***/ ((module) => {

function _reduced(x) {
  return x && x['@@transducer/reduced'] ? x : {
    '@@transducer/value': x,
    '@@transducer/reduced': true
  };
}

module.exports = _reduced;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_xfBase.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_xfBase.js ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = {
  init: function () {
    return this.xf['@@transducer/init']();
  },
  result: function (result) {
    return this.xf['@@transducer/result'](result);
  }
};

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_xtake.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_xtake.js ***!
  \******************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");

var _reduced =
/*#__PURE__*/
__webpack_require__(/*! ./_reduced */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_reduced.js");

var _xfBase =
/*#__PURE__*/
__webpack_require__(/*! ./_xfBase */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_xfBase.js");

var XTake =
/*#__PURE__*/
function () {
  function XTake(n, xf) {
    this.xf = xf;
    this.n = n;
    this.i = 0;
  }

  XTake.prototype['@@transducer/init'] = _xfBase.init;
  XTake.prototype['@@transducer/result'] = _xfBase.result;

  XTake.prototype['@@transducer/step'] = function (result, input) {
    this.i += 1;
    var ret = this.n === 0 ? result : this.xf['@@transducer/step'](result, input);
    return this.n >= 0 && this.i >= this.n ? _reduced(ret) : ret;
  };

  return XTake;
}();

var _xtake =
/*#__PURE__*/
_curry2(function _xtake(n, xf) {
  return new XTake(n, xf);
});

module.exports = _xtake;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_xwrap.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/internal/_xwrap.js ***!
  \******************************************************************************/
/***/ ((module) => {

var XWrap =
/*#__PURE__*/
function () {
  function XWrap(fn) {
    this.f = fn;
  }

  XWrap.prototype['@@transducer/init'] = function () {
    throw new Error('init not implemented on XWrap');
  };

  XWrap.prototype['@@transducer/result'] = function (acc) {
    return acc;
  };

  XWrap.prototype['@@transducer/step'] = function (acc, x) {
    return this.f(acc, x);
  };

  return XWrap;
}();

function _xwrap(fn) {
  return new XWrap(fn);
}

module.exports = _xwrap;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/isNil.js":
/*!********************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/isNil.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry1 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry1 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry1.js");
/**
 * Checks if the input value is `null` or `undefined`.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Type
 * @sig * -> Boolean
 * @param {*} x The value to test.
 * @return {Boolean} `true` if `x` is `undefined` or `null`, otherwise `false`.
 * @example
 *
 *      R.isNil(null); //=> true
 *      R.isNil(undefined); //=> true
 *      R.isNil(0); //=> false
 *      R.isNil([]); //=> false
 */


var isNil =
/*#__PURE__*/
_curry1(function isNil(x) {
  return x == null;
});

module.exports = isNil;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/keys.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/keys.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry1 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry1 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry1.js");

var _has =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_has */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_has.js");

var _isArguments =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_isArguments */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isArguments.js"); // cover IE < 9 keys issues


var hasEnumBug = !
/*#__PURE__*/
{
  toString: null
}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString']; // Safari bug

var hasArgsEnumBug =
/*#__PURE__*/
function () {
  'use strict';

  return arguments.propertyIsEnumerable('length');
}();

var contains = function contains(list, item) {
  var idx = 0;

  while (idx < list.length) {
    if (list[idx] === item) {
      return true;
    }

    idx += 1;
  }

  return false;
};
/**
 * Returns a list containing the names of all the enumerable own properties of
 * the supplied object.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [k]
 * @param {Object} obj The object to extract properties from
 * @return {Array} An array of the object's own properties.
 * @see R.keysIn, R.values
 * @example
 *
 *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
 */


var keys = typeof Object.keys === 'function' && !hasArgsEnumBug ?
/*#__PURE__*/
_curry1(function keys(obj) {
  return Object(obj) !== obj ? [] : Object.keys(obj);
}) :
/*#__PURE__*/
_curry1(function keys(obj) {
  if (Object(obj) !== obj) {
    return [];
  }

  var prop, nIdx;
  var ks = [];

  var checkArgsLength = hasArgsEnumBug && _isArguments(obj);

  for (prop in obj) {
    if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
      ks[ks.length] = prop;
    }
  }

  if (hasEnumBug) {
    nIdx = nonEnumerableProps.length - 1;

    while (nIdx >= 0) {
      prop = nonEnumerableProps[nIdx];

      if (_has(prop, obj) && !contains(ks, prop)) {
        ks[ks.length] = prop;
      }

      nIdx -= 1;
    }
  }

  return ks;
});
module.exports = keys;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/lte.js":
/*!******************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/lte.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");
/**
 * Returns `true` if the first argument is less than or equal to the second;
 * `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> Boolean
 * @param {Number} a
 * @param {Number} b
 * @return {Boolean}
 * @see R.gte
 * @example
 *
 *      R.lte(2, 1); //=> false
 *      R.lte(2, 2); //=> true
 *      R.lte(2, 3); //=> true
 *      R.lte('a', 'z'); //=> true
 *      R.lte('z', 'a'); //=> false
 */


var lte =
/*#__PURE__*/
_curry2(function lte(a, b) {
  return a <= b;
});

module.exports = lte;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/not.js":
/*!******************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/not.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry1 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry1 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry1.js");
/**
 * A function that returns the `!` of its argument. It will return `true` when
 * passed false-y value, and `false` when passed a truth-y one.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig * -> Boolean
 * @param {*} a any value
 * @return {Boolean} the logical inverse of passed argument.
 * @see R.complement
 * @example
 *
 *      R.not(true); //=> false
 *      R.not(false); //=> true
 *      R.not(0); //=> true
 *      R.not(1); //=> false
 */


var not =
/*#__PURE__*/
_curry1(function not(a) {
  return !a;
});

module.exports = not;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/nth.js":
/*!******************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/nth.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");

var _isString =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_isString */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isString.js");
/**
 * Returns the nth element of the given list or string. If n is negative the
 * element at index length + n is returned.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Number -> [a] -> a | Undefined
 * @sig Number -> String -> String
 * @param {Number} offset
 * @param {*} list
 * @return {*}
 * @example
 *
 *      const list = ['foo', 'bar', 'baz', 'quux'];
 *      R.nth(1, list); //=> 'bar'
 *      R.nth(-1, list); //=> 'quux'
 *      R.nth(-99, list); //=> undefined
 *
 *      R.nth(2, 'abc'); //=> 'c'
 *      R.nth(3, 'abc'); //=> ''
 * @symb R.nth(-1, [a, b, c]) = c
 * @symb R.nth(0, [a, b, c]) = a
 * @symb R.nth(1, [a, b, c]) = b
 */


var nth =
/*#__PURE__*/
_curry2(function nth(offset, list) {
  var idx = offset < 0 ? list.length + offset : offset;
  return _isString(list) ? list.charAt(idx) : list[idx];
});

module.exports = nth;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/path.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/path.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");

var paths =
/*#__PURE__*/
__webpack_require__(/*! ./paths */ "./node_modules/@waves/signer/node_modules/ramda/src/paths.js");
/**
 * Retrieve the value at a given path.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig [Idx] -> {a} -> a | Undefined
 * @param {Array} path The path to use.
 * @param {Object} obj The object to retrieve the nested property from.
 * @return {*} The data at `path`.
 * @see R.prop, R.nth
 * @example
 *
 *      R.path(['a', 'b'], {a: {b: 2}}); //=> 2
 *      R.path(['a', 'b'], {c: {b: 2}}); //=> undefined
 *      R.path(['a', 'b', 0], {a: {b: [1, 2, 3]}}); //=> 1
 *      R.path(['a', 'b', -2], {a: {b: [1, 2, 3]}}); //=> 2
 */


var path =
/*#__PURE__*/
_curry2(function path(pathAr, obj) {
  return paths([pathAr], obj)[0];
});

module.exports = path;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/paths.js":
/*!********************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/paths.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");

var _isInteger =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_isInteger */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_isInteger.js");

var nth =
/*#__PURE__*/
__webpack_require__(/*! ./nth */ "./node_modules/@waves/signer/node_modules/ramda/src/nth.js");
/**
 * Retrieves the values at given paths of an object.
 *
 * @func
 * @memberOf R
 * @since v0.27.1
 * @category Object
 * @typedefn Idx = [String | Int]
 * @sig [Idx] -> {a} -> [a | Undefined]
 * @param {Array} pathsArray The array of paths to be fetched.
 * @param {Object} obj The object to retrieve the nested properties from.
 * @return {Array} A list consisting of values at paths specified by "pathsArray".
 * @see R.path
 * @example
 *
 *      R.paths([['a', 'b'], ['p', 0, 'q']], {a: {b: 2}, p: [{q: 3}]}); //=> [2, 3]
 *      R.paths([['a', 'b'], ['p', 'r']], {a: {b: 2}, p: [{q: 3}]}); //=> [2, undefined]
 */


var paths =
/*#__PURE__*/
_curry2(function paths(pathsArray, obj) {
  return pathsArray.map(function (paths) {
    var val = obj;
    var idx = 0;
    var p;

    while (idx < paths.length) {
      if (val == null) {
        return;
      }

      p = paths[idx];
      val = _isInteger(p) ? nth(p, val) : val[p];
      idx += 1;
    }

    return val;
  });
});

module.exports = paths;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/pipe.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/pipe.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _arity =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_arity */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_arity.js");

var _pipe =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_pipe */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_pipe.js");

var reduce =
/*#__PURE__*/
__webpack_require__(/*! ./reduce */ "./node_modules/@waves/signer/node_modules/ramda/src/reduce.js");

var tail =
/*#__PURE__*/
__webpack_require__(/*! ./tail */ "./node_modules/@waves/signer/node_modules/ramda/src/tail.js");
/**
 * Performs left-to-right function composition. The first argument may have
 * any arity; the remaining arguments must be unary.
 *
 * In some libraries this function is named `sequence`.
 *
 * **Note:** The result of pipe is not automatically curried.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
 * @param {...Function} functions
 * @return {Function}
 * @see R.compose
 * @example
 *
 *      const f = R.pipe(Math.pow, R.negate, R.inc);
 *
 *      f(3, 4); // -(3^4) + 1
 * @symb R.pipe(f, g, h)(a, b) = h(g(f(a, b)))
 */


function pipe() {
  if (arguments.length === 0) {
    throw new Error('pipe requires at least one argument');
  }

  return _arity(arguments[0].length, reduce(_pipe, arguments[0], tail(arguments)));
}

module.exports = pipe;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/prop.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/prop.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");

var path =
/*#__PURE__*/
__webpack_require__(/*! ./path */ "./node_modules/@waves/signer/node_modules/ramda/src/path.js");
/**
 * Returns a function that when supplied an object returns the indicated
 * property of that object, if it exists.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig Idx -> {s: a} -> a | Undefined
 * @param {String|Number} p The property name or array index
 * @param {Object} obj The object to query
 * @return {*} The value at `obj.p`.
 * @see R.path, R.nth
 * @example
 *
 *      R.prop('x', {x: 100}); //=> 100
 *      R.prop('x', {}); //=> undefined
 *      R.prop(0, [100]); //=> 100
 *      R.compose(R.inc, R.prop('x'))({ x: 3 }) //=> 4
 */


var prop =
/*#__PURE__*/
_curry2(function prop(p, obj) {
  return path([p], obj);
});

module.exports = prop;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/reduce.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/reduce.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry3 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry3 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry3.js");

var _reduce =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_reduce */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_reduce.js");
/**
 * Returns a single item by iterating through the list, successively calling
 * the iterator function and passing it an accumulator value and the current
 * value from the array, and then passing the result to the next call.
 *
 * The iterator function receives two values: *(acc, value)*. It may use
 * [`R.reduced`](#reduced) to shortcut the iteration.
 *
 * The arguments' order of [`reduceRight`](#reduceRight)'s iterator function
 * is *(value, acc)*.
 *
 * Note: `R.reduce` does not skip deleted or unassigned indices (sparse
 * arrays), unlike the native `Array.prototype.reduce` method. For more details
 * on this behavior, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
 *
 * Dispatches to the `reduce` method of the third argument, if present. When
 * doing so, it is up to the user to handle the [`R.reduced`](#reduced)
 * shortcuting, as this is not implemented by `reduce`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig ((a, b) -> a) -> a -> [b] -> a
 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
 *        current element from the array.
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.reduced, R.addIndex, R.reduceRight
 * @example
 *
 *      R.reduce(R.subtract, 0, [1, 2, 3, 4]) // => ((((0 - 1) - 2) - 3) - 4) = -10
 *      //          -               -10
 *      //         / \              / \
 *      //        -   4           -6   4
 *      //       / \              / \
 *      //      -   3   ==>     -3   3
 *      //     / \              / \
 *      //    -   2           -1   2
 *      //   / \              / \
 *      //  0   1            0   1
 *
 * @symb R.reduce(f, a, [b, c, d]) = f(f(f(a, b), c), d)
 */


var reduce =
/*#__PURE__*/
_curry3(_reduce);

module.exports = reduce;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/slice.js":
/*!********************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/slice.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _checkForMethod =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_checkForMethod */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_checkForMethod.js");

var _curry3 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry3 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry3.js");
/**
 * Returns the elements of the given list or string (or object with a `slice`
 * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
 *
 * Dispatches to the `slice` method of the third argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig Number -> Number -> [a] -> [a]
 * @sig Number -> Number -> String -> String
 * @param {Number} fromIndex The start index (inclusive).
 * @param {Number} toIndex The end index (exclusive).
 * @param {*} list
 * @return {*}
 * @example
 *
 *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
 *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
 *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
 *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
 *      R.slice(0, 3, 'ramda');                     //=> 'ram'
 */


var slice =
/*#__PURE__*/
_curry3(
/*#__PURE__*/
_checkForMethod('slice', function slice(fromIndex, toIndex, list) {
  return Array.prototype.slice.call(list, fromIndex, toIndex);
}));

module.exports = slice;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/startsWith.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/startsWith.js ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");

var equals =
/*#__PURE__*/
__webpack_require__(/*! ./equals */ "./node_modules/@waves/signer/node_modules/ramda/src/equals.js");

var take =
/*#__PURE__*/
__webpack_require__(/*! ./take */ "./node_modules/@waves/signer/node_modules/ramda/src/take.js");
/**
 * Checks if a list starts with the provided sublist.
 *
 * Similarly, checks if a string starts with the provided substring.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category List
 * @sig [a] -> [a] -> Boolean
 * @sig String -> String -> Boolean
 * @param {*} prefix
 * @param {*} list
 * @return {Boolean}
 * @see R.endsWith
 * @example
 *
 *      R.startsWith('a', 'abc')                //=> true
 *      R.startsWith('b', 'abc')                //=> false
 *      R.startsWith(['a'], ['a', 'b', 'c'])    //=> true
 *      R.startsWith(['b'], ['a', 'b', 'c'])    //=> false
 */


var startsWith =
/*#__PURE__*/
_curry2(function (prefix, list) {
  return equals(take(prefix.length, list), prefix);
});

module.exports = startsWith;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/tail.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/tail.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _checkForMethod =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_checkForMethod */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_checkForMethod.js");

var _curry1 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry1 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry1.js");

var slice =
/*#__PURE__*/
__webpack_require__(/*! ./slice */ "./node_modules/@waves/signer/node_modules/ramda/src/slice.js");
/**
 * Returns all but the first element of the given list or string (or object
 * with a `tail` method).
 *
 * Dispatches to the `slice` method of the first argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a]
 * @sig String -> String
 * @param {*} list
 * @return {*}
 * @see R.head, R.init, R.last
 * @example
 *
 *      R.tail([1, 2, 3]);  //=> [2, 3]
 *      R.tail([1, 2]);     //=> [2]
 *      R.tail([1]);        //=> []
 *      R.tail([]);         //=> []
 *
 *      R.tail('abc');  //=> 'bc'
 *      R.tail('ab');   //=> 'b'
 *      R.tail('a');    //=> ''
 *      R.tail('');     //=> ''
 */


var tail =
/*#__PURE__*/
_curry1(
/*#__PURE__*/
_checkForMethod('tail',
/*#__PURE__*/
slice(1, Infinity)));

module.exports = tail;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/take.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/take.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry2 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry2 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry2.js");

var _dispatchable =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_dispatchable */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_dispatchable.js");

var _xtake =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_xtake */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_xtake.js");

var slice =
/*#__PURE__*/
__webpack_require__(/*! ./slice */ "./node_modules/@waves/signer/node_modules/ramda/src/slice.js");
/**
 * Returns the first `n` elements of the given list, string, or
 * transducer/transformer (or object with a `take` method).
 *
 * Dispatches to the `take` method of the second argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Number -> [a] -> [a]
 * @sig Number -> String -> String
 * @param {Number} n
 * @param {*} list
 * @return {*}
 * @see R.drop
 * @example
 *
 *      R.take(1, ['foo', 'bar', 'baz']); //=> ['foo']
 *      R.take(2, ['foo', 'bar', 'baz']); //=> ['foo', 'bar']
 *      R.take(3, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
 *      R.take(4, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
 *      R.take(3, 'ramda');               //=> 'ram'
 *
 *      const personnel = [
 *        'Dave Brubeck',
 *        'Paul Desmond',
 *        'Eugene Wright',
 *        'Joe Morello',
 *        'Gerry Mulligan',
 *        'Bob Bates',
 *        'Joe Dodge',
 *        'Ron Crotty'
 *      ];
 *
 *      const takeFive = R.take(5);
 *      takeFive(personnel);
 *      //=> ['Dave Brubeck', 'Paul Desmond', 'Eugene Wright', 'Joe Morello', 'Gerry Mulligan']
 * @symb R.take(-1, [a, b]) = [a, b]
 * @symb R.take(0, [a, b]) = []
 * @symb R.take(1, [a, b]) = [a]
 * @symb R.take(2, [a, b]) = [a, b]
 */


var take =
/*#__PURE__*/
_curry2(
/*#__PURE__*/
_dispatchable(['take'], _xtake, function take(n, xs) {
  return slice(0, n < 0 ? Infinity : n, xs);
}));

module.exports = take;

/***/ }),

/***/ "./node_modules/@waves/signer/node_modules/ramda/src/type.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@waves/signer/node_modules/ramda/src/type.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _curry1 =
/*#__PURE__*/
__webpack_require__(/*! ./internal/_curry1 */ "./node_modules/@waves/signer/node_modules/ramda/src/internal/_curry1.js");
/**
 * Gives a single-word string description of the (native) type of a value,
 * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
 * attempt to distinguish user Object types any further, reporting them all as
 * 'Object'.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Type
 * @sig (* -> {*}) -> String
 * @param {*} val The value to test
 * @return {String}
 * @example
 *
 *      R.type({}); //=> "Object"
 *      R.type(1); //=> "Number"
 *      R.type(false); //=> "Boolean"
 *      R.type('s'); //=> "String"
 *      R.type(null); //=> "Null"
 *      R.type([]); //=> "Array"
 *      R.type(/[A-z]/); //=> "RegExp"
 *      R.type(() => {}); //=> "Function"
 *      R.type(undefined); //=> "Undefined"
 */


var type =
/*#__PURE__*/
_curry1(function type(val) {
  return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
});

module.exports = type;

/***/ }),

/***/ "./node_modules/@waves/ts-types/dist/src/index.js":
/*!********************************************************!*\
  !*** ./node_modules/@waves/ts-types/dist/src/index.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GENESIS_TYPE = 1;
exports.PAYMENT_TYPE = 2;
exports.ISSUE_TYPE = 3;
exports.TRANSFER_TYPE = 4;
exports.REISSUE_TYPE = 5;
exports.BURN_TYPE = 6;
exports.EXCHANGE_TYPE = 7;
exports.LEASE_TYPE = 8;
exports.CANCEL_LEASE_TYPE = 9;
exports.ALIAS_TYPE = 10;
exports.MASS_TRANSFER_TYPE = 11;
exports.DATA_TYPE = 12;
exports.SET_SCRIPT_TYPE = 13;
exports.SPONSORSHIP_TYPE = 14;
exports.SET_ASSET_SCRIPT_TYPE = 15;
exports.INVOKE_SCRIPT_TYPE = 16;
exports.UPDATE_ASSET_INFO_TYPE = 17;
exports.INTEGER_DATA_TYPE = 'integer';
exports.BOOLEAN_DATA_TYPE = 'boolean';
exports.STRING_DATA_TYPE = 'string';
exports.BINARY_DATA_TYPE = 'binary';
exports.TRANSACTION_TYPE = {
    GENESIS: exports.GENESIS_TYPE,
    PAYMENT: exports.PAYMENT_TYPE,
    ISSUE: exports.ISSUE_TYPE,
    TRANSFER: exports.TRANSFER_TYPE,
    REISSUE: exports.REISSUE_TYPE,
    BURN: exports.BURN_TYPE,
    EXCHANGE: exports.EXCHANGE_TYPE,
    LEASE: exports.LEASE_TYPE,
    CANCEL_LEASE: exports.CANCEL_LEASE_TYPE,
    ALIAS: exports.ALIAS_TYPE,
    MASS_TRANSFER: exports.MASS_TRANSFER_TYPE,
    DATA: exports.DATA_TYPE,
    SET_SCRIPT: exports.SET_SCRIPT_TYPE,
    SPONSORSHIP: exports.SPONSORSHIP_TYPE,
    SET_ASSET_SCRIPT: exports.SET_ASSET_SCRIPT_TYPE,
    INVOKE_SCRIPT: exports.INVOKE_SCRIPT_TYPE,
    UPDATE_ASSET_INFO: exports.UPDATE_ASSET_INFO_TYPE,
};
exports.DATA_FIELD_TYPE = {
    INTEGER: exports.INTEGER_DATA_TYPE,
    BOOLEAN: exports.BOOLEAN_DATA_TYPE,
    STRING: exports.STRING_DATA_TYPE,
    BINARY: exports.BINARY_DATA_TYPE,
};


/***/ }),

/***/ "./node_modules/@waves/waves-browser-bus/dist/adapters/Adapter.js":
/*!************************************************************************!*\
  !*** ./node_modules/@waves/waves-browser-bus/dist/adapters/Adapter.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Adapter = /** @class */ (function () {
    function Adapter() {
    }
    return Adapter;
}());
exports.Adapter = Adapter;


/***/ }),

/***/ "./node_modules/@waves/waves-browser-bus/dist/adapters/WindowAdapter.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@waves/waves-browser-bus/dist/adapters/WindowAdapter.js ***!
  \******************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var Adapter_1 = __webpack_require__(/*! ./Adapter */ "./node_modules/@waves/waves-browser-bus/dist/adapters/Adapter.js");
var __1 = __webpack_require__(/*! .. */ "./node_modules/@waves/waves-browser-bus/dist/index.js");
var WindowProtocol_1 = __webpack_require__(/*! ../protocols/WindowProtocol */ "./node_modules/@waves/waves-browser-bus/dist/protocols/WindowProtocol.js");
var utils_1 = __webpack_require__(/*! ../utils/utils */ "./node_modules/@waves/waves-browser-bus/dist/utils/utils/index.js");
var EMPTY_OPTIONS = { origins: [], availableChanelId: [] };
var WindowAdapter = /** @class */ (function (_super) {
    __extends(WindowAdapter, _super);
    function WindowAdapter(listen, dispatch, options) {
        var _this = _super.call(this) || this;
        _this.id = __1.uniqueId('wa');
        _this.callbacks = [];
        _this.options = WindowAdapter.prepareOptions(options);
        _this.listen = listen;
        _this.dispatch = dispatch;
        _this.listen.forEach(function (protocol) { return protocol.on('message', _this.onMessage, _this); });
        return _this;
    }
    WindowAdapter.prototype.addListener = function (cb) {
        this.callbacks.push(cb);
        __1.console.info('WindowAdapter: Add iframe message listener');
        return this;
    };
    WindowAdapter.prototype.send = function (data) {
        var message = __assign({}, data, { chanelId: this.options.chanelId });
        this.dispatch.forEach(function (protocol) { return protocol.dispatch(message); });
        __1.console.info('WindowAdapter: Send message', message);
        return this;
    };
    WindowAdapter.prototype.destroy = function () {
        this.listen.forEach(function (protocol) { return protocol.destroy(); });
        this.dispatch.forEach(function (protocol) { return protocol.destroy(); });
        __1.console.info('WindowAdapter: Destroy');
    };
    WindowAdapter.prototype.onMessage = function (event) {
        if (this.accessEvent(event)) {
            this.callbacks.forEach(function (cb) {
                try {
                    cb(event.data);
                }
                catch (e) {
                    __1.console.warn('WindowAdapter: Unhandled exception!', e);
                }
            });
        }
    };
    WindowAdapter.prototype.accessEvent = function (event) {
        if (typeof event.data !== 'object' || event.data.type == null) {
            __1.console.info('WindowAdapter: Block event. Wrong event format!', event.data);
            return false;
        }
        if (!this.options.origins.has('*') && !this.options.origins.has(event.origin)) {
            __1.console.info("SimpleWindowAdapter: Block event by origin \"" + event.origin + "\"");
            return false;
        }
        if (!this.options.availableChanelId.size) {
            return true;
        }
        var access = !!(event.data.chanelId && this.options.availableChanelId.has(event.data.chanelId));
        if (!access) {
            __1.console.info("SimpleWindowAdapter: Block event by chanel id \"" + event.data.chanelId + "\"");
        }
        return access;
    };
    WindowAdapter.createSimpleWindowAdapter = function (iframe, options) {
        var _this = this;
        var origin = this.getContentOrigin(iframe);
        var myOptions = this.prepareOptions(options);
        var events = [];
        if (origin) {
            myOptions.origins.add(origin);
        }
        var listen = new WindowProtocol_1.WindowProtocol(window, WindowProtocol_1.WindowProtocol.PROTOCOL_TYPES.LISTEN);
        var handler = function (event) {
            events.push(event);
        };
        listen.on('message', handler);
        return this.getIframeContent(iframe)
            .then(function (win) {
            var dispatch = new WindowProtocol_1.WindowProtocol(win.win, WindowProtocol_1.WindowProtocol.PROTOCOL_TYPES.DISPATCH);
            var adapter = new WindowAdapter([listen], [dispatch], _this.unPrepareOptions(myOptions));
            events.forEach(function (event) {
                adapter.onMessage(event);
            });
            listen.off('message', handler);
            return adapter;
        });
    };
    WindowAdapter.prepareOptions = function (options) {
        if (options === void 0) { options = EMPTY_OPTIONS; }
        var concat = function (initialValue) { return function (list) { return list.reduce(function (set, item) { return set.add(item); }, initialValue); }; };
        var getCollection = function (data, initial) { return utils_1.pipe(__1.toArray, concat(initial))(data); };
        var origins = getCollection(options.origins || [], new __1.UniqPrimitiveCollection([window.location.origin]));
        var chanelId = getCollection(options.availableChanelId || [], new __1.UniqPrimitiveCollection());
        return __assign({}, options, { origins: origins, availableChanelId: chanelId });
    };
    WindowAdapter.unPrepareOptions = function (options) {
        return {
            origins: options.origins.toArray(),
            availableChanelId: options.availableChanelId.toArray(),
            chanelId: options.chanelId
        };
    };
    WindowAdapter.getIframeContent = function (content) {
        if (!content) {
            return Promise.resolve({ win: window.opener || window.parent });
        }
        if (!(content instanceof HTMLIFrameElement)) {
            return Promise.resolve({ win: content });
        }
        if (content.contentWindow) {
            return Promise.resolve({ win: content.contentWindow });
        }
        return new Promise(function (resolve, reject) {
            content.addEventListener('load', function () { return resolve({ win: content.contentWindow }); }, false);
            content.addEventListener('error', reject, false);
        });
    };
    WindowAdapter.getContentOrigin = function (content) {
        if (!content) {
            try {
                return new URL(document.referrer).origin;
            }
            catch (e) {
                return null;
            }
        }
        if (!(content instanceof HTMLIFrameElement)) {
            try {
                return window.top.origin;
            }
            catch (e) {
                return null;
            }
        }
        try {
            return new URL(content.src).origin || null;
        }
        catch (e) {
            return null;
        }
    };
    return WindowAdapter;
}(Adapter_1.Adapter));
exports.WindowAdapter = WindowAdapter;


/***/ }),

/***/ "./node_modules/@waves/waves-browser-bus/dist/bus/Bus.js":
/*!***************************************************************!*\
  !*** ./node_modules/@waves/waves-browser-bus/dist/bus/Bus.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var utils_1 = __webpack_require__(/*! ../utils */ "./node_modules/@waves/waves-browser-bus/dist/utils/index.js");
var EventType;
(function (EventType) {
    EventType[EventType["Event"] = 0] = "Event";
    EventType[EventType["Action"] = 1] = "Action";
    EventType[EventType["Response"] = 2] = "Response";
})(EventType = exports.EventType || (exports.EventType = {}));
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["Success"] = 0] = "Success";
    ResponseStatus[ResponseStatus["Error"] = 1] = "Error";
})(ResponseStatus = exports.ResponseStatus || (exports.ResponseStatus = {}));
var Bus = /** @class */ (function () {
    function Bus(adapter, defaultTimeout) {
        var _this = this;
        this.id = utils_1.uniqueId('bus');
        this._timeout = defaultTimeout || 5000;
        this._adapter = adapter;
        this._adapter.addListener(function (data) { return _this._onMessage(data); });
        this._eventHandlers = Object.create(null);
        this._activeRequestHash = Object.create(null);
        this._requestHandlers = Object.create(null);
        utils_1.console.info("Create Bus with id \"" + this.id + "\"");
    }
    Bus.prototype.dispatchEvent = function (name, data) {
        this._adapter.send(Bus._createEvent(name, data));
        utils_1.console.info("Dispatch event \"" + name + "\"", data);
        return this;
    };
    Bus.prototype.request = function (name, data, timeout) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var id = utils_1.uniqueId(_this.id + "-action");
            var wait = timeout || _this._timeout;
            var timer;
            if ((timeout || _this._timeout) !== -1) {
                timer = setTimeout(function () {
                    delete _this._activeRequestHash[id];
                    var error = new Error("Timeout error for request with name \"" + name + "\" and timeout " + wait + "!");
                    utils_1.console.error(error);
                    reject(error);
                }, wait);
            }
            var cancelTimeout = function () {
                if (timer) {
                    clearTimeout(timer);
                }
            };
            _this._activeRequestHash[id] = {
                reject: function (error) {
                    cancelTimeout();
                    utils_1.console.error("Error request with name \"" + name + "\"", error);
                    reject(error);
                },
                resolve: function (data) {
                    cancelTimeout();
                    utils_1.console.info("Request with name \"" + name + "\" success resolved!", data);
                    resolve(data);
                }
            };
            _this._adapter.send({ id: id, type: 1 /* Action */, name: name, data: data });
            utils_1.console.info("Request with name \"" + name + "\"", data);
        });
    };
    Bus.prototype.on = function (name, handler, context) {
        return this._addEventHandler(name, handler, context, false);
    };
    Bus.prototype.once = function (name, handler, context) {
        return this._addEventHandler(name, handler, context, true);
    };
    Bus.prototype.off = function (name, handler) {
        var _this = this;
        if (!name) {
            Object.keys(this._eventHandlers).forEach(function (name) { return _this.off(name, handler); });
            return this;
        }
        if (!this._eventHandlers[name]) {
            return this;
        }
        if (!handler) {
            this._eventHandlers[name].slice().forEach(function (info) {
                _this.off(name, info.handler);
            });
            return this;
        }
        this._eventHandlers[name] = this._eventHandlers[name].filter(function (info) { return info.handler !== handler; });
        if (!this._eventHandlers[name].length) {
            delete this._eventHandlers[name];
        }
        return this;
    };
    Bus.prototype.registerRequestHandler = function (name, handler) {
        if (this._requestHandlers[name]) {
            throw new Error('Duplicate request handler!');
        }
        this._requestHandlers[name] = handler;
        return this;
    };
    Bus.prototype.unregisterHandler = function (name) {
        if (this._requestHandlers[name]) {
            delete this._requestHandlers[name];
        }
        return this;
    };
    Bus.prototype.changeAdapter = function (adapter) {
        var _this = this;
        var bus = new Bus(adapter, this._timeout);
        Object.keys(this._eventHandlers).forEach(function (name) {
            _this._eventHandlers[name].forEach(function (info) {
                if (info.once) {
                    bus.once(name, info.handler, info.context);
                }
                else {
                    bus.on(name, info.handler, info.context);
                }
            });
        });
        Object.keys(this._requestHandlers).forEach(function (name) {
            bus.registerRequestHandler(name, _this._requestHandlers[name]);
        });
        return bus;
    };
    Bus.prototype.destroy = function () {
        utils_1.console.info('Destroy Bus');
        this.off();
        this._adapter.destroy();
    };
    Bus.prototype._addEventHandler = function (name, handler, context, once) {
        if (!this._eventHandlers[name]) {
            this._eventHandlers[name] = [];
        }
        this._eventHandlers[name].push({ handler: handler, once: once, context: context });
        return this;
    };
    Bus.prototype._onMessage = function (message) {
        switch (message.type) {
            case 0 /* Event */:
                utils_1.console.info("Has event with name \"" + String(message.name) + "\"", message.data);
                this._fireEvent(String(message.name), message.data);
                break;
            case 1 /* Action */:
                utils_1.console.info("Start action with id \"" + message.id + "\" and name \"" + String(message.name) + "\"", message.data);
                this._createResponse(message);
                break;
            case 2 /* Response */:
                utils_1.console.info("Start response with name \"" + message.id + "\" and status \"" + message.status + "\"", message.content);
                this._fireEndAction(message);
                break;
        }
    };
    Bus.prototype._createResponse = function (message) {
        var _this = this;
        var sendError = function (error) {
            utils_1.console.error(error);
            _this._adapter.send({
                id: message.id,
                type: 2 /* Response */,
                status: 1 /* Error */,
                content: String(error)
            });
        };
        if (!this._requestHandlers[String(message.name)]) {
            sendError(new Error("Has no handler for \"" + String(message.name) + "\" action!"));
            return void 0;
        }
        try {
            var result = this._requestHandlers[String(message.name)](message.data);
            if (Bus._isPromise(result)) {
                result.then(function (data) {
                    _this._adapter.send({
                        id: message.id,
                        type: 2 /* Response */,
                        status: 0 /* Success */,
                        content: data
                    });
                }, sendError);
            }
            else {
                this._adapter.send({
                    id: message.id,
                    type: 2 /* Response */,
                    status: 0 /* Success */,
                    content: result
                });
            }
        }
        catch (e) {
            sendError(e);
        }
    };
    Bus.prototype._fireEndAction = function (message) {
        if (this._activeRequestHash[message.id]) {
            switch (message.status) {
                case 1 /* Error */:
                    this._activeRequestHash[message.id].reject(message.content);
                    break;
                case 0 /* Success */:
                    this._activeRequestHash[message.id].resolve(message.content);
                    break;
            }
            delete this._activeRequestHash[message.id];
        }
    };
    Bus.prototype._fireEvent = function (name, value) {
        if (!this._eventHandlers[name]) {
            return void 0;
        }
        this._eventHandlers[name] = this._eventHandlers[name]
            .slice()
            .filter(function (handlerInfo) {
            try {
                handlerInfo.handler.call(handlerInfo.context, value);
            }
            catch (e) {
                utils_1.console.warn(e);
            }
            return !handlerInfo.once;
        });
        if (!this._eventHandlers[name].length) {
            delete this._eventHandlers[name];
        }
    };
    Bus._createEvent = function (eventName, data) {
        return {
            type: 0 /* Event */,
            name: eventName,
            data: data
        };
    };
    Bus._isPromise = function (some) {
        return some && some.then && typeof some.then === 'function';
    };
    return Bus;
}());
exports.Bus = Bus;


/***/ }),

/***/ "./node_modules/@waves/waves-browser-bus/dist/config/index.js":
/*!********************************************************************!*\
  !*** ./node_modules/@waves/waves-browser-bus/dist/config/index.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var config;
(function (config) {
    var console;
    (function (console) {
        console.LOG_LEVEL = {
            PRODUCTION: 0,
            ERRORS: 1,
            VERBOSE: 2
        };
        console.logLevel = console.LOG_LEVEL.PRODUCTION;
        console.methodsData = {
            log: { save: false, logLevel: console.LOG_LEVEL.VERBOSE },
            info: { save: false, logLevel: console.LOG_LEVEL.VERBOSE },
            warn: { save: false, logLevel: console.LOG_LEVEL.VERBOSE },
            error: { save: true, logLevel: console.LOG_LEVEL.ERRORS }
        };
    })(console = config.console || (config.console = {}));
})(config = exports.config || (exports.config = {}));


/***/ }),

/***/ "./node_modules/@waves/waves-browser-bus/dist/index.js":
/*!*************************************************************!*\
  !*** ./node_modules/@waves/waves-browser-bus/dist/index.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", ({ value: true }));
__export(__webpack_require__(/*! ./bus/Bus */ "./node_modules/@waves/waves-browser-bus/dist/bus/Bus.js"));
__export(__webpack_require__(/*! ./adapters/Adapter */ "./node_modules/@waves/waves-browser-bus/dist/adapters/Adapter.js"));
__export(__webpack_require__(/*! ./adapters/WindowAdapter */ "./node_modules/@waves/waves-browser-bus/dist/adapters/WindowAdapter.js"));
__export(__webpack_require__(/*! ./protocols/WindowProtocol */ "./node_modules/@waves/waves-browser-bus/dist/protocols/WindowProtocol.js"));
__export(__webpack_require__(/*! ./config */ "./node_modules/@waves/waves-browser-bus/dist/config/index.js"));
__export(__webpack_require__(/*! ./utils */ "./node_modules/@waves/waves-browser-bus/dist/utils/index.js"));


/***/ }),

/***/ "./node_modules/@waves/waves-browser-bus/dist/protocols/WindowProtocol.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@waves/waves-browser-bus/dist/protocols/WindowProtocol.js ***!
  \********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
var typed_ts_events_1 = __webpack_require__(/*! typed-ts-events */ "./node_modules/typed-ts-events/dist/events.min.js");
var WindowProtocol = /** @class */ (function (_super) {
    __extends(WindowProtocol, _super);
    function WindowProtocol(win, type) {
        var _this = _super.call(this) || this;
        _this.win = win;
        _this.type = type;
        _this.handler = function (event) {
            _this.trigger('message', event);
        };
        if (type === WindowProtocol.PROTOCOL_TYPES.LISTEN) {
            _this.win.addEventListener('message', _this.handler, false);
        }
        return _this;
    }
    WindowProtocol.prototype.dispatch = function (data) {
        this.win.postMessage(data, '*');
        return this;
    };
    WindowProtocol.prototype.destroy = function () {
        if (this.type === WindowProtocol.PROTOCOL_TYPES.LISTEN) {
            this.win.removeEventListener('message', this.handler, false);
        }
        this.win = WindowProtocol._fakeWin;
    };
    WindowProtocol._fakeWin = (function () {
        var empty = function () { return null; };
        return {
            postMessage: empty,
            addEventListener: empty,
            removeEventListener: empty
        };
    })();
    return WindowProtocol;
}(typed_ts_events_1.EventEmitter));
exports.WindowProtocol = WindowProtocol;
/* istanbul ignore next */
(function (WindowProtocol) {
    WindowProtocol.PROTOCOL_TYPES = {
        LISTEN: 'listen',
        DISPATCH: 'dispatch'
    };
})(WindowProtocol = exports.WindowProtocol || (exports.WindowProtocol = {}));
exports.WindowProtocol = WindowProtocol;


/***/ }),

/***/ "./node_modules/@waves/waves-browser-bus/dist/utils/UniqPrimitiveCollection.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@waves/waves-browser-bus/dist/utils/UniqPrimitiveCollection.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var UniqPrimitiveCollection = /** @class */ (function () {
    function UniqPrimitiveCollection(list) {
        this.size = 0;
        this.hash = Object.create(null);
        if (list) {
            list.forEach(this.add, this);
        }
    }
    UniqPrimitiveCollection.prototype.add = function (item) {
        this.hash[item] = true;
        this.size = Object.keys(this.hash).length;
        return this;
    };
    UniqPrimitiveCollection.prototype.has = function (key) {
        return key in this.hash;
    };
    UniqPrimitiveCollection.prototype.toArray = function () {
        return Object.keys(this.hash);
    };
    return UniqPrimitiveCollection;
}());
exports.UniqPrimitiveCollection = UniqPrimitiveCollection;


/***/ }),

/***/ "./node_modules/@waves/waves-browser-bus/dist/utils/console/index.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@waves/waves-browser-bus/dist/utils/console/index.js ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var config_1 = __webpack_require__(/*! ../../config */ "./node_modules/@waves/waves-browser-bus/dist/config/index.js");
var utils_1 = __webpack_require__(/*! ../utils */ "./node_modules/@waves/waves-browser-bus/dist/utils/utils/index.js");
/* istanbul ignore next */
var consoleModule = (function (root) {
    return root.console;
})(typeof self !== 'undefined' ? self : __webpack_require__.g);
var storage = Object.create(null);
function addNamespace(type) {
    if (!storage[type]) {
        storage[type] = [];
    }
}
function saveEvent(type, args) {
    storage[type].push(args);
}
function generateConsole() {
    return utils_1.keys(config_1.config.console.methodsData).reduce(function (api, method) {
        api[method] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (config_1.config.console.logLevel < config_1.config.console.methodsData[method].logLevel) {
                if (config_1.config.console.methodsData[method].save) {
                    addNamespace(method);
                    saveEvent(method, args);
                }
            }
            else {
                consoleModule[method].apply(consoleModule, args);
            }
        };
        return api;
    }, Object.create(null));
}
exports.console = __assign({}, generateConsole(), { getSavedMessages: function (type) {
        return storage[type] || [];
    } });


/***/ }),

/***/ "./node_modules/@waves/waves-browser-bus/dist/utils/index.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@waves/waves-browser-bus/dist/utils/index.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", ({ value: true }));
__export(__webpack_require__(/*! ./utils */ "./node_modules/@waves/waves-browser-bus/dist/utils/utils/index.js"));
__export(__webpack_require__(/*! ./console */ "./node_modules/@waves/waves-browser-bus/dist/utils/console/index.js"));
__export(__webpack_require__(/*! ./UniqPrimitiveCollection */ "./node_modules/@waves/waves-browser-bus/dist/utils/UniqPrimitiveCollection.js"));


/***/ }),

/***/ "./node_modules/@waves/waves-browser-bus/dist/utils/utils/index.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@waves/waves-browser-bus/dist/utils/utils/index.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function keys(o) {
    return Object.keys(o);
}
exports.keys = keys;
var salt = Math.floor(Date.now() * Math.random());
var counter = 0;
function uniqueId(prefix) {
    return prefix + "-" + salt + "-" + counter++;
}
exports.uniqueId = uniqueId;
function toArray(some) {
    return Array.isArray(some) ? some : [some];
}
exports.toArray = toArray;
function pipe() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function (data) { return args.reduce(function (acc, cb) { return cb(acc); }, data); };
}
exports.pipe = pipe;


/***/ }),

/***/ "./node_modules/node-fetch/browser.js":
/*!********************************************!*\
  !*** ./node_modules/node-fetch/browser.js ***!
  \********************************************/
/***/ ((module, exports) => {

"use strict";


// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
}

var global = getGlobal();

module.exports = exports = global.fetch;

// Needed for TypeScript and Webpack.
if (global.fetch) {
	exports["default"] = global.fetch.bind(global);
}

exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;

/***/ }),

/***/ "./node_modules/tslib/tslib.es6.js":
/*!*****************************************!*\
  !*** ./node_modules/tslib/tslib.es6.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "__extends": () => (/* binding */ __extends),
/* harmony export */   "__assign": () => (/* binding */ __assign),
/* harmony export */   "__decorate": () => (/* binding */ __decorate),
/* harmony export */   "__awaiter": () => (/* binding */ __awaiter),
/* harmony export */   "__generator": () => (/* binding */ __generator),
/* harmony export */   "__spreadArrays": () => (/* binding */ __spreadArrays)
/* harmony export */ });
/* unused harmony exports __rest, __param, __metadata, __createBinding, __exportStar, __values, __read, __spread, __spreadArray, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault, __classPrivateFieldGet, __classPrivateFieldSet */
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});

function __exportStar(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

/** @deprecated */
function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

/** @deprecated */
function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}


/***/ }),

/***/ "./node_modules/typed-ts-events/dist/events.min.js":
/*!*********************************************************!*\
  !*** ./node_modules/typed-ts-events/dist/events.min.js ***!
  \*********************************************************/
/***/ (function(module) {

!function(t,e){ true?module.exports=e():0}(this,(function(){return(()=>{"use strict";var t={660:(t,e)=>{e.__esModule=!0,e.EventEmitter=void 0;var n=function(){function t(t){this._events=Object.create(null),this.catchHandler=t||function(){}}return t.prototype.hasListeners=function(t){return!(!this._events[t]||!this._events[t].length)},t.prototype.getActiveEvents=function(){var t=this;return Object.keys(this._events).filter((function(e){return t.hasListeners(e)}))},t.prototype.trigger=function(t,e){var n=this;this._events[t]&&(this._events[t].slice().forEach((function(o){try{o.handler.call(o.context,e)}catch(t){n.catchHandler(t)}o.once&&n.off(t,o.handler)})),this._events[t].length||delete this._events[t])},t.prototype.on=function(t,e,n){this._on(t,e,n,!1)},t.prototype.once=function(t,e,n){this._on(t,e,n,!0)},t.prototype.off=function(t,e){var n=this,o="string"==typeof t?t:null,i="function"==typeof e?e:"function"==typeof t?t:null;if(o)if(i){if(o in this._events){var r=this._events[o].map((function(t){return t.handler})).indexOf(i);this._events[o].splice(r,1)}}else delete this._events[o];else Object.keys(this._events).forEach((function(t){n.off(t,i)}))},t.prototype._on=function(t,e,n,o){this._events[t]||(this._events[t]=[]),this._events[t].push({handler:e,context:n,once:o})},t}();e.EventEmitter=n},607:function(t,e,n){var o=this&&this.__createBinding||(Object.create?function(t,e,n,o){void 0===o&&(o=n),Object.defineProperty(t,o,{enumerable:!0,get:function(){return e[n]}})}:function(t,e,n,o){void 0===o&&(o=n),t[o]=e[n]}),i=this&&this.__exportStar||function(t,e){for(var n in t)"default"===n||Object.prototype.hasOwnProperty.call(e,n)||o(e,t,n)};e.__esModule=!0;var r=n(660);i(n(660),e),e.default=r.EventEmitter}},e={};return function n(o){if(e[o])return e[o].exports;var i=e[o]={exports:{}};return t[o].call(i.exports,i,i.exports,n),i.exports}(607)})()}));
//# sourceMappingURL=events.min.js.map

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/* harmony import */ var _waves_signer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @waves/signer */ "./node_modules/@waves/signer/dist/es/index.js");
/* harmony import */ var _waves_exchange_provider_web__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @waves.exchange/provider-web */ "./node_modules/@waves.exchange/provider-web/dist/provider-web.es.js");



const signer = new _waves_signer__WEBPACK_IMPORTED_MODULE_0__.Signer({
  // Specify URL of the node on Testnet
  NODE_URL: 'https://nodes-testnet.wavesnodes.com'
});
signer.setProvider(new _waves_exchange_provider_web__WEBPACK_IMPORTED_MODULE_1__.ProviderWeb('https://testnet.waves.exchange/signer/'))


document.querySelector(".js-login").addEventListener("click", async function (event) {
    try {
        const userData = await waves.login();
        event.target.classList.add("clicked");
        event.target.innerHTML = `
            authorized as <br>
            ${userData.address}`;
        document.querySelector(".explorer-link").innerHTML = `<a href="https://wavesexplorer.com/testnet/address/${userData.address}" target="_blank">Check the Explorer</a>`;
    } catch (e) {
        console.error('login rejected')
    }
});


// calling a "faucet" script wavesexplorer.com/tesnet/address/3MuN7D8r19zdvSpAd1L91Gs88bcgwUFy2mn/script
// this will top up the account balance, but only once
document.querySelector(".js-invoke").addEventListener("click", function () {
    waves.invoke({
        dApp: "3MuN7D8r19zdvSpAd1L91Gs88bcgwUFy2mn",
        call: {
            function: "faucet"
        }
    }).broadcast().then(console.log)
});


// just putting some data into account storage
document.querySelector(".js-data").addEventListener("click", function () {
    const date = new Date();
    waves.data({
        data: [
            {
                key: "lastCall",
                value: `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
                type: 'string'
            }
        ]
    }).broadcast().then(console.log)
});


// just transferring some WAVES token to Alice
document.querySelector(".js-transfer").addEventListener("click", function () {
    waves.transfer({
        recipient: "3MuN7D8r19zdvSpAd1L91Gs88bcgwUFy2mn",
        amount: 1
    }).broadcast().then(console.log)
});



})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztXQ1BEOzs7Ozs7Ozs7Ozs7O0FDQXVDO0FBQ29COztBQUUzRCxtQkFBbUIsaURBQU07QUFDekI7QUFDQTtBQUNBLENBQUM7QUFDRCx1QkFBdUIscUVBQVc7OztBQUdsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLGlCQUFpQjtBQUMvQixtSEFBbUgsaUJBQWlCO0FBQ3BJLE1BQU07QUFDTjtBQUNBO0FBQ0EsQ0FBQzs7O0FBR0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDOzs7QUFHRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixlQUFlLEdBQUcsb0JBQW9CLEdBQUcsb0JBQW9CLEVBQUUsZ0JBQWdCLEdBQUcsa0JBQWtCLEdBQUcsa0JBQWtCO0FBQ25KO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDOzs7QUFHRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy5leGNoYW5nZS9wcm92aWRlci13ZWIvZGlzdC9wcm92aWRlci13ZWIuZXMuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvYmlnbnVtYmVyL2Rpc3QvYmlnbnVtYmVyLnVtZC5taW4uanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvY2xpZW50LWxvZ3MvZGlzdC9jbGllbnQtbG9ncy5taW4uanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvbm9kZS1hcGktanMvY2pzL2FwaS1ub2RlL2FkZHJlc3Nlcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9ub2RlLWFwaS1qcy9janMvYXBpLW5vZGUvYXNzZXRzL2luZGV4LmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL25vZGUtYXBpLWpzL2Nqcy9hcGktbm9kZS9ibG9ja3MvaW5kZXguanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvbm9kZS1hcGktanMvY2pzL2FwaS1ub2RlL3RyYW5zYWN0aW9ucy9pbmRleC5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9ub2RlLWFwaS1qcy9janMvY29uc3RhbnRzLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL25vZGUtYXBpLWpzL2Nqcy90b29scy9ibG9ja3MvZ2V0TmV0d29ya0J5dGUuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvbm9kZS1hcGktanMvY2pzL3Rvb2xzL3BhcnNlLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL25vZGUtYXBpLWpzL2Nqcy90b29scy9xdWVyeS5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9ub2RlLWFwaS1qcy9janMvdG9vbHMvcmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9ub2RlLWFwaS1qcy9janMvdG9vbHMvcmVzb2x2ZS5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9ub2RlLWFwaS1qcy9janMvdG9vbHMvc3RyaW5naWZ5LmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL25vZGUtYXBpLWpzL2Nqcy90b29scy90cmFuc2FjdGlvbnMvYnJvYWRjYXN0LmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL25vZGUtYXBpLWpzL2Nqcy90b29scy90cmFuc2FjdGlvbnMvdHJhbnNhY3Rpb25zLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL25vZGUtYXBpLWpzL2Nqcy90b29scy90cmFuc2FjdGlvbnMvd2FpdC5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9ub2RlLWFwaS1qcy9janMvdG9vbHMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL2Rpc3QvZXMvU2lnbmVyLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9kaXN0L2VzL1NpZ25lckVycm9yLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9kaXN0L2VzL2NvbnN0YW50cy5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvZGlzdC9lcy9kZWNvcmF0b3JzLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9kaXN0L2VzL2hlbHBlcnMuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL2Rpc3QvZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL2Rpc3QvZXMvdHlwZXMvYXBpLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9kaXN0L2VzL3R5cGVzL2luZGV4LmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9kaXN0L2VzL3ZhbGlkYXRpb24uanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL2Rpc3QvZXMvdmFsaWRhdG9ycy5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9hbHdheXMuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvYmluZC5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9jdXJyeU4uanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvZGVmYXVsdFRvLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL2VxdWFscy5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9mbGlwLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL2d0ZS5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pZkVsc2UuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW5jbHVkZXMuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX2FyaXR5LmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL2ludGVybmFsL19hcnJheUZyb21JdGVyYXRvci5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9fY2hlY2tGb3JNZXRob2QuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX2N1cnJ5MS5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkyLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL2ludGVybmFsL19jdXJyeTMuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX2N1cnJ5Ti5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9fZGlzcGF0Y2hhYmxlLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL2ludGVybmFsL19lcXVhbHMuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX2Z1bmN0aW9uTmFtZS5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9faGFzLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL2ludGVybmFsL19pbmNsdWRlcy5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9faW5jbHVkZXNXaXRoLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL2ludGVybmFsL19pbmRleE9mLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL2ludGVybmFsL19pc0FyZ3VtZW50cy5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9faXNBcnJheS5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9faXNBcnJheUxpa2UuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX2lzSW50ZWdlci5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9faXNQbGFjZWhvbGRlci5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9faXNTdHJpbmcuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX2lzVHJhbnNmb3JtZXIuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX29iamVjdElzLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL2ludGVybmFsL19waXBlLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL2ludGVybmFsL19yZWR1Y2UuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX3JlZHVjZWQuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX3hmQmFzZS5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9feHRha2UuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX3h3cmFwLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL2lzTmlsLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL2tleXMuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvbHRlLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL25vdC5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9udGguanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvcGF0aC5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9wYXRocy5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9waXBlLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL3Byb3AuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvcmVkdWNlLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL3NsaWNlLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL3N0YXJ0c1dpdGguanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvc2lnbmVyL25vZGVfbW9kdWxlcy9yYW1kYS9zcmMvdGFpbC5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy9zaWduZXIvbm9kZV9tb2R1bGVzL3JhbWRhL3NyYy90YWtlLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3NpZ25lci9ub2RlX21vZHVsZXMvcmFtZGEvc3JjL3R5cGUuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvdHMtdHlwZXMvZGlzdC9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvd2F2ZXMtYnJvd3Nlci1idXMvZGlzdC9hZGFwdGVycy9BZGFwdGVyLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3dhdmVzLWJyb3dzZXItYnVzL2Rpc3QvYWRhcHRlcnMvV2luZG93QWRhcHRlci5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy93YXZlcy1icm93c2VyLWJ1cy9kaXN0L2J1cy9CdXMuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvd2F2ZXMtYnJvd3Nlci1idXMvZGlzdC9jb25maWcvaW5kZXguanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9Ad2F2ZXMvd2F2ZXMtYnJvd3Nlci1idXMvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy93YXZlcy1icm93c2VyLWJ1cy9kaXN0L3Byb3RvY29scy9XaW5kb3dQcm90b2NvbC5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy93YXZlcy1icm93c2VyLWJ1cy9kaXN0L3V0aWxzL1VuaXFQcmltaXRpdmVDb2xsZWN0aW9uLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3dhdmVzLWJyb3dzZXItYnVzL2Rpc3QvdXRpbHMvY29uc29sZS9pbmRleC5qcyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzLy4vbm9kZV9tb2R1bGVzL0B3YXZlcy93YXZlcy1icm93c2VyLWJ1cy9kaXN0L3V0aWxzL2luZGV4LmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9ub2RlX21vZHVsZXMvQHdhdmVzL3dhdmVzLWJyb3dzZXItYnVzL2Rpc3QvdXRpbHMvdXRpbHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy9ub2RlLWZldGNoL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy90c2xpYi90c2xpYi5lczYuanMiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy8uL25vZGVfbW9kdWxlcy90eXBlZC10cy1ldmVudHMvZGlzdC9ldmVudHMubWluLmpzIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9td2ViMy1kZW1vLXdhdmVzL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vbXdlYjMtZGVtby13YXZlcy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL213ZWIzLWRlbW8td2F2ZXMvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIF9fZGVmUHJvcCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcbnZhciBfX2RlZlByb3BzID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXM7XG52YXIgX19nZXRPd25Qcm9wRGVzY3MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycztcbnZhciBfX2dldE93blByb3BTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcbnZhciBfX2hhc093blByb3AgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIF9fcHJvcElzRW51bSA9IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGU7XG52YXIgX19kZWZOb3JtYWxQcm9wID0gKG9iaiwga2V5LCB2YWx1ZSkgPT4ga2V5IGluIG9iaiA/IF9fZGVmUHJvcChvYmosIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlLCB2YWx1ZSB9KSA6IG9ialtrZXldID0gdmFsdWU7XG52YXIgX19zcHJlYWRWYWx1ZXMgPSAoYSwgYikgPT4ge1xuICBmb3IgKHZhciBwcm9wIGluIGIgfHwgKGIgPSB7fSkpXG4gICAgaWYgKF9faGFzT3duUHJvcC5jYWxsKGIsIHByb3ApKVxuICAgICAgX19kZWZOb3JtYWxQcm9wKGEsIHByb3AsIGJbcHJvcF0pO1xuICBpZiAoX19nZXRPd25Qcm9wU3ltYm9scylcbiAgICBmb3IgKHZhciBwcm9wIG9mIF9fZ2V0T3duUHJvcFN5bWJvbHMoYikpIHtcbiAgICAgIGlmIChfX3Byb3BJc0VudW0uY2FsbChiLCBwcm9wKSlcbiAgICAgICAgX19kZWZOb3JtYWxQcm9wKGEsIHByb3AsIGJbcHJvcF0pO1xuICAgIH1cbiAgcmV0dXJuIGE7XG59O1xudmFyIF9fc3ByZWFkUHJvcHMgPSAoYSwgYikgPT4gX19kZWZQcm9wcyhhLCBfX2dldE93blByb3BEZXNjcyhiKSk7XG5pbXBvcnQgeyBXaW5kb3dBZGFwdGVyLCBCdXMsIGNvbmZpZyB9IGZyb20gXCJAd2F2ZXMvd2F2ZXMtYnJvd3Nlci1idXNcIjtcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gXCJ0eXBlZC10cy1ldmVudHNcIjtcbmNsYXNzIFF1ZXVlIHtcbiAgY29uc3RydWN0b3IobWF4TGVuZ3RoKSB7XG4gICAgdGhpcy5fYWN0aW9ucyA9IFtdO1xuICAgIHRoaXMuX21heExlbmd0aCA9IG1heExlbmd0aDtcbiAgfVxuICBnZXQgbGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLl9hY3Rpb25zLmxlbmd0aCArICh0aGlzLl9hY3RpdmUgPT0gbnVsbCA/IDAgOiAxKTtcbiAgfVxuICBwdXNoKGFjdGlvbikge1xuICAgIGlmICh0aGlzLl9hY3Rpb25zLmxlbmd0aCA+PSB0aGlzLl9tYXhMZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbnQndCBwdXNoIGFjdGlvbiEgUXVldWUgaXMgZnVsbCFcIik7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBvbkVuZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fYWN0aXZlID0gdm9pZCAwO1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2FjdGlvbnMubWFwKCh4KSA9PiB4LmFjdGlvbikuaW5kZXhPZihhY3Rpb25DYWxsYmFjayk7XG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLl9hY3Rpb25zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ydW4oKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBhY3Rpb25DYWxsYmFjayA9ICgpID0+IGFjdGlvbigpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICBvbkVuZCgpO1xuICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgIG9uRW5kKCk7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9hY3Rpb25zLnB1c2goeyBhY3Rpb246IGFjdGlvbkNhbGxiYWNrLCByZWplY3QgfSk7XG4gICAgICBpZiAodGhpcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgdGhpcy5ydW4oKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBjbGVhcihlcnJvcikge1xuICAgIGVycm9yID0gZXJyb3IgfHwgbmV3IEVycm9yKFwiUmVqZWN0aW9uIHdpdGggY2xlYXIgcXVldWUhXCIpO1xuICAgIGNvbnN0IGUgPSB0eXBlb2YgZXJyb3IgPT09IFwic3RyaW5nXCIgPyBuZXcgRXJyb3IoZXJyb3IpIDogZXJyb3I7XG4gICAgdGhpcy5fYWN0aW9ucy5zcGxpY2UoMCwgdGhpcy5fYWN0aW9ucy5sZW5ndGgpLmZvckVhY2goKGl0ZW0pID0+IGl0ZW0ucmVqZWN0KGUpKTtcbiAgICB0aGlzLl9hY3RpdmUgPSB2b2lkIDA7XG4gIH1cbiAgY2FuUHVzaCgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aW9ucy5sZW5ndGggPCB0aGlzLl9tYXhMZW5ndGg7XG4gIH1cbiAgcnVuKCkge1xuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9hY3Rpb25zLnNoaWZ0KCk7XG4gICAgaWYgKGl0ZW0gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlID0gaXRlbS5hY3Rpb24oKTtcbiAgfVxufVxuY29uc3QgY3JlYXRlRXJyb3IgPSAoZXJyb3IpID0+IHtcbiAgY29uc3QgY29tbW9uRXJyb3IgPSB7XG4gICAgY29kZTogMCxcbiAgICBtZXNzYWdlOiAoZXJyb3IgPT0gbnVsbCA/IHZvaWQgMCA6IGVycm9yLm1lc3NhZ2UpIHx8IGVycm9yXG4gIH07XG4gIHN3aXRjaCAoZXJyb3IgPT0gbnVsbCA/IHZvaWQgMCA6IGVycm9yLm1lc3NhZ2UpIHtcbiAgICBjYXNlIFwiU2VjdXJpdHlFcnJvcjogRmFpbGVkIHRvIHJlYWQgdGhlICdsb2NhbFN0b3JhZ2UnIHByb3BlcnR5IGZyb20gJ1dpbmRvdyc6IEFjY2VzcyBpcyBkZW5pZWQgZm9yIHRoaXMgZG9jdW1lbnQuXCI6XG4gICAgICByZXR1cm4gX19zcHJlYWRQcm9wcyhfX3NwcmVhZFZhbHVlcyh7fSwgY29tbW9uRXJyb3IpLCB7XG4gICAgICAgIG1lc3NhZ2U6IFwiTG9jYWwgc3RvcmFnZSBpcyBub3QgYXZhaWxhYmxlISBJdCBpcyBwb3NzaWJsZSB0aGF0IHRoZSBCcm93c2VyIGlzIGluIGluY29nbml0byBtb2RlIVwiXG4gICAgICB9KTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGNvbW1vbkVycm9yO1xuICB9XG59O1xuY2xhc3MgVHJhbnNwb3J0IHtcbiAgY29uc3RydWN0b3IocXVldWVMZW5ndGgpIHtcbiAgICB0aGlzLl9ldmVudHMgPSBbXTtcbiAgICB0aGlzLl90b1J1bkV2ZW50cyA9IFtdO1xuICAgIHRoaXMuX3F1ZXVlID0gbmV3IFF1ZXVlKHF1ZXVlTGVuZ3RoKTtcbiAgfVxuICBkcm9wQ29ubmVjdGlvbigpIHtcbiAgICB0aGlzLl9xdWV1ZS5jbGVhcihuZXcgRXJyb3IoXCJVc2VyIHJlamVjdGlvbiFcIikpO1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4gdGhpcy5fdG9SdW5FdmVudHMucHVzaChldmVudCkpO1xuICAgIHRoaXMuX2Ryb3BUcmFuc3BvcnRDb25uZWN0KCk7XG4gIH1cbiAgc2VuZEV2ZW50KGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fZXZlbnRzLnB1c2goY2FsbGJhY2spO1xuICAgIHRoaXMuX3RvUnVuRXZlbnRzLnB1c2goY2FsbGJhY2spO1xuICB9XG4gIGRpYWxvZyhjYWxsYmFjaykge1xuICAgIHRoaXMuX3J1bkJlZm9yZVNob3coKTtcbiAgICByZXR1cm4gdGhpcy5fZ2V0QnVzKCkudGhlbigoYnVzKSA9PiB7XG4gICAgICBjb25zdCBhY3Rpb24gPSB0aGlzLl93cmFwQWN0aW9uKCgpID0+IGNhbGxiYWNrKGJ1cykpO1xuICAgICAgdGhpcy5fcnVuRXZlbnRzKGJ1cyk7XG4gICAgICBpZiAodGhpcy5fcXVldWUuY2FuUHVzaCgpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9xdWV1ZS5wdXNoKGFjdGlvbikudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgdGhpcy5fcnVuQWZ0ZXJTaG93KCk7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgdGhpcy5fcnVuQWZ0ZXJTaG93KCk7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGNyZWF0ZUVycm9yKGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIlF1ZXVlIGlzIGZ1bGwhXCIpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBfcnVuQmVmb3JlU2hvdygpIHtcbiAgICBpZiAodGhpcy5fcXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLl9iZWZvcmVTaG93KCk7XG4gICAgfVxuICB9XG4gIF9ydW5BZnRlclNob3coKSB7XG4gICAgaWYgKHRoaXMuX3F1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fYWZ0ZXJTaG93KCk7XG4gICAgfVxuICB9XG4gIF9ydW5FdmVudHMoYnVzKSB7XG4gICAgdGhpcy5fdG9SdW5FdmVudHMuc3BsaWNlKDAsIHRoaXMuX2V2ZW50cy5sZW5ndGgpLmZvckVhY2goKGNhbGxiYWNrKSA9PiBjYWxsYmFjayhidXMpKTtcbiAgfVxuICBfd3JhcEFjdGlvbihhY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy5fdG9SdW5FdmVudHMgPyAoKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhY3Rpb24oKTtcbiAgICAgIHJlc3VsdC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4gdGhpcy5fdG9SdW5FdmVudHMucHVzaChldmVudCkpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gOiBhY3Rpb247XG4gIH1cbn1cbmNvbnN0IF9UcmFuc3BvcnRJZnJhbWUgPSBjbGFzcyBleHRlbmRzIFRyYW5zcG9ydCB7XG4gIGNvbnN0cnVjdG9yKHVybCwgcXVldWVMZW5ndGgpIHtcbiAgICBzdXBlcihxdWV1ZUxlbmd0aCk7XG4gICAgdGhpcy5fdXJsID0gdXJsO1xuICAgIHRoaXMuX2luaXRJZnJhbWUoKTtcbiAgfVxuICBnZXQoKSB7XG4gICAgaWYgKCF0aGlzLl9pZnJhbWUpIHtcbiAgICAgIHRoaXMuX2luaXRJZnJhbWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2lmcmFtZTtcbiAgfVxuICBfZHJvcFRyYW5zcG9ydENvbm5lY3QoKSB7XG4gICAgaWYgKHRoaXMuX2lmcmFtZSAhPSBudWxsKSB7XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRoaXMuX2lmcmFtZSk7XG4gICAgICB0aGlzLl9pbml0SWZyYW1lKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9idXMpIHtcbiAgICAgIHRoaXMuX2J1cy5kZXN0cm95KCk7XG4gICAgICB0aGlzLl9idXMgPSB2b2lkIDA7XG4gICAgfVxuICB9XG4gIF9nZXRCdXMoKSB7XG4gICAgaWYgKHRoaXMuX2J1cykge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9idXMpO1xuICAgIH1cbiAgICByZXR1cm4gV2luZG93QWRhcHRlci5jcmVhdGVTaW1wbGVXaW5kb3dBZGFwdGVyKHRoaXMuX2lmcmFtZSkudGhlbigoYWRhcHRlcikgPT4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMuX2J1cyA9IG5ldyBCdXMoYWRhcHRlciwgLTEpO1xuICAgICAgdGhpcy5fYnVzLm9uY2UoXCJyZWFkeVwiLCAoKSA9PiB7XG4gICAgICAgIHJlc29sdmUodGhpcy5fYnVzKTtcbiAgICAgIH0pO1xuICAgIH0pKTtcbiAgfVxuICBfYmVmb3JlU2hvdygpIHtcbiAgICB0aGlzLl9zaG93SWZyYW1lKCk7XG4gIH1cbiAgX2FmdGVyU2hvdygpIHtcbiAgICB0aGlzLl9oaWRlSWZyYW1lKCk7XG4gIH1cbiAgX2luaXRJZnJhbWUoKSB7XG4gICAgdGhpcy5faWZyYW1lID0gdGhpcy5fY3JlYXRlSWZyYW1lKCk7XG4gICAgdGhpcy5fYWRkSWZyYW1lVG9Eb20odGhpcy5faWZyYW1lKTtcbiAgICB0aGlzLl9saXN0ZW5GZXRjaFVSTEVycm9yKHRoaXMuX2lmcmFtZSk7XG4gICAgdGhpcy5faGlkZUlmcmFtZSgpO1xuICB9XG4gIF9hZGRJZnJhbWVUb0RvbShpZnJhbWUpIHtcbiAgICBpZiAoZG9jdW1lbnQuYm9keSAhPSBudWxsKSB7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIF9jcmVhdGVJZnJhbWUoKSB7XG4gICAgY29uc3QgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlmcmFtZVwiKTtcbiAgICBpZnJhbWUuc3R5bGUudHJhbnNpdGlvbiA9IFwib3BhY2l0eSAuMnNcIjtcbiAgICBpZnJhbWUuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgaWZyYW1lLnN0eWxlLm9wYWNpdHkgPSBcIjBcIjtcbiAgICBpZnJhbWUuc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcbiAgICBpZnJhbWUuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XG4gICAgaWZyYW1lLnN0eWxlLmxlZnQgPSBcIjBcIjtcbiAgICBpZnJhbWUuc3R5bGUudG9wID0gXCIwXCI7XG4gICAgaWZyYW1lLnN0eWxlLmJvcmRlciA9IFwibm9uZVwiO1xuICAgIGlmcmFtZS5zdHlsZS5wb3NpdGlvbiA9IFwiZml4ZWRcIjtcbiAgICByZXR1cm4gaWZyYW1lO1xuICB9XG4gIF9zaG93SWZyYW1lKCkge1xuICAgIGNvbnN0IHNob3duU3R5bGVzID0ge1xuICAgICAgd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgaGVpZ2h0OiBcIjEwMCVcIixcbiAgICAgIGxlZnQ6IFwiMFwiLFxuICAgICAgdG9wOiBcIjBcIixcbiAgICAgIGJvcmRlcjogXCJub25lXCIsXG4gICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgZGlzcGxheTogXCJibG9ja1wiLFxuICAgICAgb3BhY2l0eTogXCIwXCIsXG4gICAgICB6SW5kZXg6IFwiOTk5OTk5OTlcIlxuICAgIH07XG4gICAgdGhpcy5fYXBwbHlTdHlsZShzaG93blN0eWxlcyk7XG4gICAgaWYgKF9UcmFuc3BvcnRJZnJhbWUuX3RpbWVyICE9IG51bGwpIHtcbiAgICAgIGNsZWFyVGltZW91dChfVHJhbnNwb3J0SWZyYW1lLl90aW1lcik7XG4gICAgfVxuICAgIF9UcmFuc3BvcnRJZnJhbWUuX3RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9hcHBseVN0eWxlKHsgb3BhY2l0eTogXCIxXCIgfSk7XG4gICAgfSwgMCk7XG4gIH1cbiAgX2hpZGVJZnJhbWUoKSB7XG4gICAgY29uc3QgaGlkZGVuU3R5bGUgPSB7XG4gICAgICBvcGFjaXR5OiBcIjBcIlxuICAgIH07XG4gICAgdGhpcy5fYXBwbHlTdHlsZShoaWRkZW5TdHlsZSk7XG4gICAgaWYgKF9UcmFuc3BvcnRJZnJhbWUuX3RpbWVyICE9IG51bGwpIHtcbiAgICAgIGNsZWFyVGltZW91dChfVHJhbnNwb3J0SWZyYW1lLl90aW1lcik7XG4gICAgfVxuICAgIF9UcmFuc3BvcnRJZnJhbWUuX3RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9hcHBseVN0eWxlKHtcbiAgICAgICAgd2lkdGg6IFwiMTBweFwiLFxuICAgICAgICBoZWlnaHQ6IFwiMTBweFwiLFxuICAgICAgICBsZWZ0OiBcIi0xMDBweFwiLFxuICAgICAgICB0b3A6IFwiLTEwMHB4XCIsXG4gICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG4gICAgICAgIG9wYWNpdHk6IFwiMFwiLFxuICAgICAgICB6SW5kZXg6IFwiMFwiLFxuICAgICAgICBkaXNwbGF5OiBcIm5vbmVcIlxuICAgICAgfSk7XG4gICAgfSwgMjAwKTtcbiAgfVxuICBfYXBwbHlTdHlsZShzdHlsZXMpIHtcbiAgICBPYmplY3QuZW50cmllcyhzdHlsZXMpLmZvckVhY2goKFtuYW1lLCB2YWx1ZV0pID0+IHtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLl9pZnJhbWUpIHtcbiAgICAgICAgICB0aGlzLl9pZnJhbWUuc3R5bGVbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIF9yZW5kZXJFcnJvclBhZ2UoYm9keUVsZW1lbnQsIG9uQ2xvc2UsIGVycm9yTWVzc2FnZSkge1xuICAgIGlmIChib2R5RWxlbWVudC5wYXJlbnRFbGVtZW50KSB7XG4gICAgICBib2R5RWxlbWVudC5wYXJlbnRFbGVtZW50LnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuICAgIH1cbiAgICBPYmplY3QuYXNzaWduKGJvZHlFbGVtZW50LnN0eWxlLCB7XG4gICAgICBwb3NpdGlvbjogXCJyZWxhdGl2ZVwiLFxuICAgICAgYm94U2l6aW5nOiBcImJvcmRlci1ib3hcIixcbiAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICBkaXNwbGF5OiBcImZsZXhcIixcbiAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgIG1hcmdpbjogXCIwcHhcIlxuICAgIH0pO1xuICAgIGNvbnN0IGJhY2tkcm9wRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgT2JqZWN0LmFzc2lnbihiYWNrZHJvcEVsZW1lbnQuc3R5bGUsIHtcbiAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICB6SW5kZXg6IFwiLTFcIixcbiAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICB3aWR0aDogXCIxMDAlXCIsXG4gICAgICBvdmVyZmxvdzogXCJoaWRkZW5cIixcbiAgICAgIGJhY2tncm91bmRDb2xvcjogXCIjMDAwXCIsXG4gICAgICBvcGFjaXR5OiBcIjAuNlwiXG4gICAgfSk7XG4gICAgY29uc3Qgd3JhcHBlckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIE9iamVjdC5hc3NpZ24od3JhcHBlckVsZW1lbnQuc3R5bGUsIHtcbiAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICBkaXNwbGF5OiBcImZsZXhcIixcbiAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICBtYXJnaW46IFwiMFwiLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiMyOTJGM0NcIixcbiAgICAgIHdpZHRoOiBcIjUyMHB4XCIsXG4gICAgICBib3JkZXJSYWRpdXM6IFwiNnB4XCIsXG4gICAgICBwYWRkaW5nOiBcIjQwcHhcIixcbiAgICAgIGJveFNpemluZzogXCJib3JkZXItYm94XCJcbiAgICB9KTtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBlcnJvck1lc3NhZ2VFbGVtZW50LnRleHRDb250ZW50ID0gZXJyb3JNZXNzYWdlO1xuICAgIE9iamVjdC5hc3NpZ24oZXJyb3JNZXNzYWdlRWxlbWVudC5zdHlsZSwge1xuICAgICAgZm9udFNpemU6IFwiMTVweFwiLFxuICAgICAgbGluZUhlaWdodDogXCIyMHB4XCIsXG4gICAgICBjb2xvcjogXCIjZmZmXCIsXG4gICAgICBtYXJnaW5Cb3R0b206IFwiNDBweFwiLFxuICAgICAgZm9udEZhbWlseTogXCJSb2JvdG8sIHNhbnMtc2VyaWZcIlxuICAgIH0pO1xuICAgIGNvbnN0IGJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIGJ1dHRvbkVsZW1lbnQudGV4dENvbnRlbnQgPSBcIk9LXCI7XG4gICAgYnV0dG9uRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gb25DbG9zZSgpKTtcbiAgICBPYmplY3QuYXNzaWduKGJ1dHRvbkVsZW1lbnQuc3R5bGUsIHtcbiAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgIGZvbnRTaXplOiBcIjE1cHhcIixcbiAgICAgIGxpbmVIZWlnaHQ6IFwiNDhweFwiLFxuICAgICAgcGFkZGluZzogXCIgMCA0MHB4XCIsXG4gICAgICBjb2xvcjogXCIjZmZmXCIsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiIzVBODFFQVwiLFxuICAgICAgb3V0bGluZTogXCJub25lXCIsXG4gICAgICBib3JkZXI6IFwibm9uZVwiLFxuICAgICAgY3Vyc29yOiBcInBvaW50ZXJcIixcbiAgICAgIGZvbnRGYW1pbHk6IFwiUm9ib3RvLCBzYW5zLXNlcmlmXCIsXG4gICAgICBib3JkZXJSYWRpdXM6IFwiNHB4XCJcbiAgICB9KTtcbiAgICB3cmFwcGVyRWxlbWVudC5hcHBlbmRDaGlsZChlcnJvck1lc3NhZ2VFbGVtZW50KTtcbiAgICB3cmFwcGVyRWxlbWVudC5hcHBlbmRDaGlsZChidXR0b25FbGVtZW50KTtcbiAgICBib2R5RWxlbWVudC5hcHBlbmRDaGlsZChiYWNrZHJvcEVsZW1lbnQpO1xuICAgIGJvZHlFbGVtZW50LmFwcGVuZENoaWxkKHdyYXBwZXJFbGVtZW50KTtcbiAgfVxuICBfbGlzdGVuRmV0Y2hVUkxFcnJvcihpZnJhbWUpIHtcbiAgICBmZXRjaCh0aGlzLl91cmwpLmNhdGNoKCgpID0+IHtcbiAgICAgIGlmcmFtZS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKSA9PiB7XG4gICAgICAgIGlmICghaWZyYW1lLmNvbnRlbnREb2N1bWVudCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZW5kZXJFcnJvclBhZ2UoaWZyYW1lLmNvbnRlbnREb2N1bWVudC5ib2R5LCAoKSA9PiB0aGlzLmRyb3BDb25uZWN0aW9uKCksIFwiVGhlIHJlcXVlc3QgY291bGQgbm90IGJlIHByb2Nlc3NlZC4gVG8gcmVzdW1lIHlvdXIgZnVydGhlciB3b3JrLCBkaXNhYmxlIHRoZSBpbnN0YWxsZWQgcGx1Z2lucy5cIik7XG4gICAgICAgIHRoaXMuX3Nob3dJZnJhbWUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59O1xubGV0IFRyYW5zcG9ydElmcmFtZSA9IF9UcmFuc3BvcnRJZnJhbWU7XG5UcmFuc3BvcnRJZnJhbWUuX3RpbWVyID0gbnVsbDtcbmZ1bmN0aW9uIGlzQnJhdmUoKSB7XG4gIHZhciBfYTtcbiAgcmV0dXJuICEhKChfYSA9IG5hdmlnYXRvci5icmF2ZSkgPT0gbnVsbCA/IHZvaWQgMCA6IF9hLmlzQnJhdmUpO1xufVxuZnVuY3Rpb24gaXNTYWZhcmkoKSB7XG4gIGNvbnN0IHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgaXNTYWZhcmlVQSA9IHVzZXJBZ2VudC5pbmNsdWRlcyhcInNhZmFyaVwiKSAmJiAhdXNlckFnZW50LmluY2x1ZGVzKFwiY2hyb21lXCIpO1xuICBjb25zdCBpT1MgPSBuYXZpZ2F0b3IucGxhdGZvcm0gIT0gbnVsbCAmJiAvaVBhZHxpUGhvbmV8aVBvZC8udGVzdChuYXZpZ2F0b3IucGxhdGZvcm0pO1xuICByZXR1cm4gaU9TIHx8IGlzU2FmYXJpVUE7XG59XG5jbGFzcyBQcm92aWRlcldlYiB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudFVybCwgbG9ncykge1xuICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX2NsaWVudFVybCA9IChjbGllbnRVcmwgfHwgXCJodHRwczovL3dhdmVzLmV4Y2hhbmdlL3NpZ25lci9cIikgKyBgPyR7UHJvdmlkZXJXZWIuX2dldENhY2hlQ2xlYW4oKX1gO1xuICAgIHRoaXMuX3RyYW5zcG9ydCA9IG5ldyBUcmFuc3BvcnRJZnJhbWUodGhpcy5fY2xpZW50VXJsLCAzKTtcbiAgICBpZiAobG9ncyA9PT0gdHJ1ZSkge1xuICAgICAgY29uZmlnLmNvbnNvbGUubG9nTGV2ZWwgPSBjb25maWcuY29uc29sZS5MT0dfTEVWRUwuVkVSQk9TRTtcbiAgICB9XG4gIH1cbiAgc3RhdGljIF9nZXRDYWNoZUNsZWFuKCkge1xuICAgIHJldHVybiBTdHJpbmcoRGF0ZS5ub3coKSAlICgxZTMgKiA2MCkpO1xuICB9XG4gIG9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgdGhpcy5lbWl0dGVyLm9uKGV2ZW50LCBoYW5kbGVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBvbmNlKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgdGhpcy5lbWl0dGVyLm9uY2UoZXZlbnQsIGhhbmRsZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIG9mZihldmVudCwgaGFuZGxlcikge1xuICAgIHRoaXMuZW1pdHRlci5vbmNlKGV2ZW50LCBoYW5kbGVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBjb25uZWN0KG9wdGlvbnMpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX3RyYW5zcG9ydC5zZW5kRXZlbnQoKGJ1cykgPT4gYnVzLmRpc3BhdGNoRXZlbnQoXCJjb25uZWN0XCIsIG9wdGlvbnMpKSk7XG4gIH1cbiAgbG9nb3V0KCkge1xuICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl90cmFuc3BvcnQuZHJvcENvbm5lY3Rpb24oKSk7XG4gIH1cbiAgbG9naW4oKSB7XG4gICAgdmFyIF9hO1xuICAgIGlmICh0aGlzLnVzZXIpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy51c2VyKTtcbiAgICB9XG4gICAgY29uc3QgaWZyYW1lID0gdGhpcy5fdHJhbnNwb3J0LmdldCgpO1xuICAgIGlmIChpc1NhZmFyaSgpIHx8IGlzQnJhdmUoKSkge1xuICAgICAgY29uc3Qgd2luID0gKF9hID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cpID09IG51bGwgPyB2b2lkIDAgOiBfYS5vcGVuKHRoaXMuX2NsaWVudFVybCk7XG4gICAgICBpZiAoIXdpbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXaW5kb3cgd2FzIGJsb2NrZWRcIik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmcmFtZS5zcmMgPSB0aGlzLl9jbGllbnRVcmw7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zcG9ydC5kaWFsb2coKGJ1cykgPT4gYnVzLnJlcXVlc3QoXCJsb2dpblwiKS50aGVuKCh1c2VyRGF0YSkgPT4ge1xuICAgICAgdGhpcy51c2VyID0gdXNlckRhdGE7XG4gICAgICByZXR1cm4gdXNlckRhdGE7XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgdGhpcy5fdHJhbnNwb3J0LmRyb3BDb25uZWN0aW9uKCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoY3JlYXRlRXJyb3IoZXJyKSk7XG4gICAgfSkpO1xuICB9XG4gIHNpZ25NZXNzYWdlKGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5sb2dpbigpLnRoZW4oKCkgPT4gdGhpcy5fdHJhbnNwb3J0LmRpYWxvZygoYnVzKSA9PiBidXMucmVxdWVzdChcInNpZ24tbWVzc2FnZVwiLCBkYXRhKSkpO1xuICB9XG4gIHNpZ25UeXBlZERhdGEoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLmxvZ2luKCkudGhlbigoKSA9PiB0aGlzLl90cmFuc3BvcnQuZGlhbG9nKChidXMpID0+IGJ1cy5yZXF1ZXN0KFwic2lnbi10eXBlZC1kYXRhXCIsIGRhdGEpKSk7XG4gIH1cbiAgc2lnbih0b1NpZ24pIHtcbiAgICByZXR1cm4gdGhpcy5sb2dpbigpLnRoZW4oKCkgPT4gdGhpcy5fdHJhbnNwb3J0LmRpYWxvZygoYnVzKSA9PiBidXMucmVxdWVzdChcInNpZ25cIiwgdG9TaWduKSkpO1xuICB9XG59XG5leHBvcnQgeyBQcm92aWRlcldlYiB9O1xuIiwiIWZ1bmN0aW9uKGUsdCl7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGU/dChleHBvcnRzKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImV4cG9ydHNcIl0sdCk6dCgoZT1lfHxzZWxmKS5CaWdOdW1iZXI9e30pfSh0aGlzLGZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PS9eLT8oPzpcXGQrKD86XFwuXFxkKik/fFxcLlxcZCspKD86ZVsrLV0/XFxkKyk/JC9pLG49TWF0aC5jZWlsLHI9TWF0aC5mbG9vcixpPVwiW0JpZ051bWJlciBFcnJvcl0gXCIsbz1pK1wiTnVtYmVyIHByaW1pdGl2ZSBoYXMgbW9yZSB0aGFuIDE1IHNpZ25pZmljYW50IGRpZ2l0czogXCIsdT0xZTE0LHM9MTQsZj05MDA3MTk5MjU0NzQwOTkxLGM9WzEsMTAsMTAwLDFlMywxZTQsMWU1LDFlNiwxZTcsMWU4LDFlOSwxZTEwLDFlMTEsMWUxMiwxZTEzXSxsPTFlNyxhPTFlOTtmdW5jdGlvbiBoKGUpe3ZhciB0PTB8ZTtyZXR1cm4gZT4wfHxlPT09dD90OnQtMX1mdW5jdGlvbiBwKGUpe2Zvcih2YXIgdCxuLHI9MSxpPWUubGVuZ3RoLG89ZVswXStcIlwiO3I8aTspe2Zvcih0PWVbcisrXStcIlwiLG49cy10Lmxlbmd0aDtuLS07dD1cIjBcIit0KTtvKz10fWZvcihpPW8ubGVuZ3RoOzQ4PT09by5jaGFyQ29kZUF0KC0taSk7KTtyZXR1cm4gby5zbGljZSgwLGkrMXx8MSl9ZnVuY3Rpb24gZyhlLHQpe3ZhciBuLHIsaT1lLmMsbz10LmMsdT1lLnMscz10LnMsZj1lLmUsYz10LmU7aWYoIXV8fCFzKXJldHVybiBudWxsO2lmKG49aSYmIWlbMF0scj1vJiYhb1swXSxufHxyKXJldHVybiBuP3I/MDotczp1O2lmKHUhPXMpcmV0dXJuIHU7aWYobj11PDAscj1mPT1jLCFpfHwhbylyZXR1cm4gcj8wOiFpXm4/MTotMTtpZighcilyZXR1cm4gZj5jXm4/MTotMTtmb3Iocz0oZj1pLmxlbmd0aCk8KGM9by5sZW5ndGgpP2Y6Yyx1PTA7dTxzO3UrKylpZihpW3VdIT1vW3VdKXJldHVybiBpW3VdPm9bdV1ebj8xOi0xO3JldHVybiBmPT1jPzA6Zj5jXm4/MTotMX1mdW5jdGlvbiBtKGUsdCxuLG8pe2lmKGU8dHx8ZT5ufHxlIT09cihlKSl0aHJvdyBFcnJvcihpKyhvfHxcIkFyZ3VtZW50XCIpKyhcIm51bWJlclwiPT10eXBlb2YgZT9lPHR8fGU+bj9cIiBvdXQgb2YgcmFuZ2U6IFwiOlwiIG5vdCBhbiBpbnRlZ2VyOiBcIjpcIiBub3QgYSBwcmltaXRpdmUgbnVtYmVyOiBcIikrU3RyaW5nKGUpKX1mdW5jdGlvbiBOKGUpe3ZhciB0PWUuYy5sZW5ndGgtMTtyZXR1cm4gaChlLmUvcyk9PXQmJmUuY1t0XSUyIT0wfWZ1bmN0aW9uIGIoZSx0KXtyZXR1cm4oZS5sZW5ndGg+MT9lLmNoYXJBdCgwKStcIi5cIitlLnNsaWNlKDEpOmUpKyh0PDA/XCJlXCI6XCJlK1wiKSt0fWZ1bmN0aW9uIHcoZSx0LG4pe3ZhciByLGk7aWYodDwwKXtmb3IoaT1uK1wiLlwiOysrdDtpKz1uKTtlPWkrZX1lbHNlIGlmKCsrdD4ocj1lLmxlbmd0aCkpe2ZvcihpPW4sdC09cjstLXQ7aSs9bik7ZSs9aX1lbHNlIHQ8ciYmKGU9ZS5zbGljZSgwLHQpK1wiLlwiK2Uuc2xpY2UodCkpO3JldHVybiBlfXZhciBkPWZ1bmN0aW9uIGUoZCl7dmFyIHksTyx2LEUsQSxfLFUsUixELEw9SC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOkgsdG9TdHJpbmc6bnVsbCx2YWx1ZU9mOm51bGx9LEI9bmV3IEgoMSksUz0yMCxGPTQsST0tNyxNPTIxLHg9LTFlNyxQPTFlNyxUPSExLEM9MSxHPTAsaj17cHJlZml4OlwiXCIsZ3JvdXBTaXplOjMsc2Vjb25kYXJ5R3JvdXBTaXplOjAsZ3JvdXBTZXBhcmF0b3I6XCIsXCIsZGVjaW1hbFNlcGFyYXRvcjpcIi5cIixmcmFjdGlvbkdyb3VwU2l6ZTowLGZyYWN0aW9uR3JvdXBTZXBhcmF0b3I6XCLCoFwiLHN1ZmZpeDpcIlwifSxxPVwiMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCI7ZnVuY3Rpb24gSChlLG4pe3ZhciBpLHUsYyxsLGEsaCxwLGcsTj10aGlzO2lmKCEoTiBpbnN0YW5jZW9mIEgpKXJldHVybiBuZXcgSChlLG4pO2lmKG51bGw9PW4pe2lmKGUmJiEwPT09ZS5faXNCaWdOdW1iZXIpcmV0dXJuIE4ucz1lLnMsdm9pZCghZS5jfHxlLmU+UD9OLmM9Ti5lPW51bGw6ZS5lPHg/Ti5jPVtOLmU9MF06KE4uZT1lLmUsTi5jPWUuYy5zbGljZSgpKSk7aWYoKGg9XCJudW1iZXJcIj09dHlwZW9mIGUpJiYwKmU9PTApe2lmKE4ucz0xL2U8MD8oZT0tZSwtMSk6MSxlPT09fn5lKXtmb3IobD0wLGE9ZTthPj0xMDthLz0xMCxsKyspO3JldHVybiB2b2lkKGw+UD9OLmM9Ti5lPW51bGw6KE4uZT1sLE4uYz1bZV0pKX1nPVN0cmluZyhlKX1lbHNle2lmKCF0LnRlc3QoZz1TdHJpbmcoZSkpKXJldHVybiB2KE4sZyxoKTtOLnM9NDU9PWcuY2hhckNvZGVBdCgwKT8oZz1nLnNsaWNlKDEpLC0xKToxfShsPWcuaW5kZXhPZihcIi5cIikpPi0xJiYoZz1nLnJlcGxhY2UoXCIuXCIsXCJcIikpLChhPWcuc2VhcmNoKC9lL2kpKT4wPyhsPDAmJihsPWEpLGwrPStnLnNsaWNlKGErMSksZz1nLnN1YnN0cmluZygwLGEpKTpsPDAmJihsPWcubGVuZ3RoKX1lbHNle2lmKG0obiwyLHEubGVuZ3RoLFwiQmFzZVwiKSwxMD09bilyZXR1cm4geihOPW5ldyBIKGUpLFMrTi5lKzEsRik7aWYoZz1TdHJpbmcoZSksaD1cIm51bWJlclwiPT10eXBlb2YgZSl7aWYoMCplIT0wKXJldHVybiB2KE4sZyxoLG4pO2lmKE4ucz0xL2U8MD8oZz1nLnNsaWNlKDEpLC0xKToxLEguREVCVUcmJmcucmVwbGFjZSgvXjBcXC4wKnxcXC4vLFwiXCIpLmxlbmd0aD4xNSl0aHJvdyBFcnJvcihvK2UpfWVsc2UgTi5zPTQ1PT09Zy5jaGFyQ29kZUF0KDApPyhnPWcuc2xpY2UoMSksLTEpOjE7Zm9yKGk9cS5zbGljZSgwLG4pLGw9YT0wLHA9Zy5sZW5ndGg7YTxwO2ErKylpZihpLmluZGV4T2YodT1nLmNoYXJBdChhKSk8MCl7aWYoXCIuXCI9PXUpe2lmKGE+bCl7bD1wO2NvbnRpbnVlfX1lbHNlIGlmKCFjJiYoZz09Zy50b1VwcGVyQ2FzZSgpJiYoZz1nLnRvTG93ZXJDYXNlKCkpfHxnPT1nLnRvTG93ZXJDYXNlKCkmJihnPWcudG9VcHBlckNhc2UoKSkpKXtjPSEwLGE9LTEsbD0wO2NvbnRpbnVlfXJldHVybiB2KE4sU3RyaW5nKGUpLGgsbil9aD0hMSwobD0oZz1PKGcsbiwxMCxOLnMpKS5pbmRleE9mKFwiLlwiKSk+LTE/Zz1nLnJlcGxhY2UoXCIuXCIsXCJcIik6bD1nLmxlbmd0aH1mb3IoYT0wOzQ4PT09Zy5jaGFyQ29kZUF0KGEpO2ErKyk7Zm9yKHA9Zy5sZW5ndGg7NDg9PT1nLmNoYXJDb2RlQXQoLS1wKTspO2lmKGc9Zy5zbGljZShhLCsrcCkpe2lmKHAtPWEsaCYmSC5ERUJVRyYmcD4xNSYmKGU+Znx8ZSE9PXIoZSkpKXRocm93IEVycm9yKG8rTi5zKmUpO2lmKChsPWwtYS0xKT5QKU4uYz1OLmU9bnVsbDtlbHNlIGlmKGw8eClOLmM9W04uZT0wXTtlbHNle2lmKE4uZT1sLE4uYz1bXSxhPShsKzEpJXMsbDwwJiYoYSs9cyksYTxwKXtmb3IoYSYmTi5jLnB1c2goK2cuc2xpY2UoMCxhKSkscC09czthPHA7KU4uYy5wdXNoKCtnLnNsaWNlKGEsYSs9cykpO2E9cy0oZz1nLnNsaWNlKGEpKS5sZW5ndGh9ZWxzZSBhLT1wO2Zvcig7YS0tO2crPVwiMFwiKTtOLmMucHVzaCgrZyl9fWVsc2UgTi5jPVtOLmU9MF19ZnVuY3Rpb24gVihlLHQsbixyKXt2YXIgaSxvLHUscyxmO2lmKG51bGw9PW4/bj1GOm0obiwwLDgpLCFlLmMpcmV0dXJuIGUudG9TdHJpbmcoKTtpZihpPWUuY1swXSx1PWUuZSxudWxsPT10KWY9cChlLmMpLGY9MT09cnx8Mj09ciYmKHU8PUl8fHU+PU0pP2IoZix1KTp3KGYsdSxcIjBcIik7ZWxzZSBpZihvPShlPXoobmV3IEgoZSksdCxuKSkuZSxzPShmPXAoZS5jKSkubGVuZ3RoLDE9PXJ8fDI9PXImJih0PD1vfHxvPD1JKSl7Zm9yKDtzPHQ7Zis9XCIwXCIscysrKTtmPWIoZixvKX1lbHNlIGlmKHQtPXUsZj13KGYsbyxcIjBcIiksbysxPnMpe2lmKC0tdD4wKWZvcihmKz1cIi5cIjt0LS07Zis9XCIwXCIpO31lbHNlIGlmKCh0Kz1vLXMpPjApZm9yKG8rMT09cyYmKGYrPVwiLlwiKTt0LS07Zis9XCIwXCIpO3JldHVybiBlLnM8MCYmaT9cIi1cIitmOmZ9ZnVuY3Rpb24gSihlLHQpe2Zvcih2YXIgbixyPTEsaT1uZXcgSChlWzBdKTtyPGUubGVuZ3RoO3IrKyl7aWYoIShuPW5ldyBIKGVbcl0pKS5zKXtpPW47YnJlYWt9dC5jYWxsKGksbikmJihpPW4pfXJldHVybiBpfWZ1bmN0aW9uIGsoZSx0LG4pe2Zvcih2YXIgcj0xLGk9dC5sZW5ndGg7IXRbLS1pXTt0LnBvcCgpKTtmb3IoaT10WzBdO2k+PTEwO2kvPTEwLHIrKyk7cmV0dXJuKG49cituKnMtMSk+UD9lLmM9ZS5lPW51bGw6bjx4P2UuYz1bZS5lPTBdOihlLmU9bixlLmM9dCksZX1mdW5jdGlvbiB6KGUsdCxpLG8pe3ZhciBmLGwsYSxoLHAsZyxtLE49ZS5jLGI9YztpZihOKXtlOntmb3IoZj0xLGg9TlswXTtoPj0xMDtoLz0xMCxmKyspO2lmKChsPXQtZik8MClsKz1zLGE9dCxtPShwPU5bZz0wXSkvYltmLWEtMV0lMTB8MDtlbHNlIGlmKChnPW4oKGwrMSkvcykpPj1OLmxlbmd0aCl7aWYoIW8pYnJlYWsgZTtmb3IoO04ubGVuZ3RoPD1nO04ucHVzaCgwKSk7cD1tPTAsZj0xLGE9KGwlPXMpLXMrMX1lbHNle2ZvcihwPWg9TltnXSxmPTE7aD49MTA7aC89MTAsZisrKTttPShhPShsJT1zKS1zK2YpPDA/MDpwL2JbZi1hLTFdJTEwfDB9aWYobz1vfHx0PDB8fG51bGwhPU5bZysxXXx8KGE8MD9wOnAlYltmLWEtMV0pLG89aTw0PyhtfHxvKSYmKDA9PWl8fGk9PShlLnM8MD8zOjIpKTptPjV8fDU9PW0mJig0PT1pfHxvfHw2PT1pJiYobD4wP2E+MD9wL2JbZi1hXTowOk5bZy0xXSklMTAmMXx8aT09KGUuczwwPzg6NykpLHQ8MXx8IU5bMF0pcmV0dXJuIE4ubGVuZ3RoPTAsbz8odC09ZS5lKzEsTlswXT1iWyhzLXQlcyklc10sZS5lPS10fHwwKTpOWzBdPWUuZT0wLGU7aWYoMD09bD8oTi5sZW5ndGg9ZyxoPTEsZy0tKTooTi5sZW5ndGg9ZysxLGg9YltzLWxdLE5bZ109YT4wP3IocC9iW2YtYV0lYlthXSkqaDowKSxvKWZvcig7Oyl7aWYoMD09Zyl7Zm9yKGw9MSxhPU5bMF07YT49MTA7YS89MTAsbCsrKTtmb3IoYT1OWzBdKz1oLGg9MTthPj0xMDthLz0xMCxoKyspO2whPWgmJihlLmUrKyxOWzBdPT11JiYoTlswXT0xKSk7YnJlYWt9aWYoTltnXSs9aCxOW2ddIT11KWJyZWFrO05bZy0tXT0wLGg9MX1mb3IobD1OLmxlbmd0aDswPT09TlstLWxdO04ucG9wKCkpO31lLmU+UD9lLmM9ZS5lPW51bGw6ZS5lPHgmJihlLmM9W2UuZT0wXSl9cmV0dXJuIGV9ZnVuY3Rpb24gJChlKXt2YXIgdCxuPWUuZTtyZXR1cm4gbnVsbD09PW4/ZS50b1N0cmluZygpOih0PXAoZS5jKSx0PW48PUl8fG4+PU0/Yih0LG4pOncodCxuLFwiMFwiKSxlLnM8MD9cIi1cIit0OnQpfXJldHVybiBILmNsb25lPWUsSC5ST1VORF9VUD0wLEguUk9VTkRfRE9XTj0xLEguUk9VTkRfQ0VJTD0yLEguUk9VTkRfRkxPT1I9MyxILlJPVU5EX0hBTEZfVVA9NCxILlJPVU5EX0hBTEZfRE9XTj01LEguUk9VTkRfSEFMRl9FVkVOPTYsSC5ST1VORF9IQUxGX0NFSUw9NyxILlJPVU5EX0hBTEZfRkxPT1I9OCxILkVVQ0xJRD05LEguY29uZmlnPUguc2V0PWZ1bmN0aW9uKGUpe3ZhciB0LG47aWYobnVsbCE9ZSl7aWYoXCJvYmplY3RcIiE9dHlwZW9mIGUpdGhyb3cgRXJyb3IoaStcIk9iamVjdCBleHBlY3RlZDogXCIrZSk7aWYoZS5oYXNPd25Qcm9wZXJ0eSh0PVwiREVDSU1BTF9QTEFDRVNcIikmJihtKG49ZVt0XSwwLGEsdCksUz1uKSxlLmhhc093blByb3BlcnR5KHQ9XCJST1VORElOR19NT0RFXCIpJiYobShuPWVbdF0sMCw4LHQpLEY9biksZS5oYXNPd25Qcm9wZXJ0eSh0PVwiRVhQT05FTlRJQUxfQVRcIikmJigobj1lW3RdKSYmbi5wb3A/KG0oblswXSwtYSwwLHQpLG0oblsxXSwwLGEsdCksST1uWzBdLE09blsxXSk6KG0obiwtYSxhLHQpLEk9LShNPW48MD8tbjpuKSkpLGUuaGFzT3duUHJvcGVydHkodD1cIlJBTkdFXCIpKWlmKChuPWVbdF0pJiZuLnBvcCltKG5bMF0sLWEsLTEsdCksbShuWzFdLDEsYSx0KSx4PW5bMF0sUD1uWzFdO2Vsc2V7aWYobShuLC1hLGEsdCksIW4pdGhyb3cgRXJyb3IoaSt0K1wiIGNhbm5vdCBiZSB6ZXJvOiBcIituKTt4PS0oUD1uPDA/LW46bil9aWYoZS5oYXNPd25Qcm9wZXJ0eSh0PVwiQ1JZUFRPXCIpKXtpZigobj1lW3RdKSE9PSEhbil0aHJvdyBFcnJvcihpK3QrXCIgbm90IHRydWUgb3IgZmFsc2U6IFwiK24pO2lmKG4pe2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBjcnlwdG98fCFjcnlwdG98fCFjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzJiYhY3J5cHRvLnJhbmRvbUJ5dGVzKXRocm93IFQ9IW4sRXJyb3IoaStcImNyeXB0byB1bmF2YWlsYWJsZVwiKTtUPW59ZWxzZSBUPW59aWYoZS5oYXNPd25Qcm9wZXJ0eSh0PVwiTU9EVUxPX01PREVcIikmJihtKG49ZVt0XSwwLDksdCksQz1uKSxlLmhhc093blByb3BlcnR5KHQ9XCJQT1dfUFJFQ0lTSU9OXCIpJiYobShuPWVbdF0sMCxhLHQpLEc9biksZS5oYXNPd25Qcm9wZXJ0eSh0PVwiRk9STUFUXCIpKXtpZihcIm9iamVjdFwiIT10eXBlb2Yobj1lW3RdKSl0aHJvdyBFcnJvcihpK3QrXCIgbm90IGFuIG9iamVjdDogXCIrbik7aj1ufWlmKGUuaGFzT3duUHJvcGVydHkodD1cIkFMUEhBQkVUXCIpKXtpZihcInN0cmluZ1wiIT10eXBlb2Yobj1lW3RdKXx8L14uJHxbKy0uXFxzXXwoLikuKlxcMS8udGVzdChuKSl0aHJvdyBFcnJvcihpK3QrXCIgaW52YWxpZDogXCIrbik7cT1ufX1yZXR1cm57REVDSU1BTF9QTEFDRVM6UyxST1VORElOR19NT0RFOkYsRVhQT05FTlRJQUxfQVQ6W0ksTV0sUkFOR0U6W3gsUF0sQ1JZUFRPOlQsTU9EVUxPX01PREU6QyxQT1dfUFJFQ0lTSU9OOkcsRk9STUFUOmosQUxQSEFCRVQ6cX19LEguaXNCaWdOdW1iZXI9ZnVuY3Rpb24oZSl7aWYoIWV8fCEwIT09ZS5faXNCaWdOdW1iZXIpcmV0dXJuITE7aWYoIUguREVCVUcpcmV0dXJuITA7dmFyIHQsbixvPWUuYyxmPWUuZSxjPWUucztlOmlmKFwiW29iamVjdCBBcnJheV1cIj09e30udG9TdHJpbmcuY2FsbChvKSl7aWYoKDE9PT1jfHwtMT09PWMpJiZmPj0tYSYmZjw9YSYmZj09PXIoZikpe2lmKDA9PT1vWzBdKXtpZigwPT09ZiYmMT09PW8ubGVuZ3RoKXJldHVybiEwO2JyZWFrIGV9aWYoKHQ9KGYrMSklcyk8MSYmKHQrPXMpLFN0cmluZyhvWzBdKS5sZW5ndGg9PXQpe2Zvcih0PTA7dDxvLmxlbmd0aDt0KyspaWYoKG49b1t0XSk8MHx8bj49dXx8biE9PXIobikpYnJlYWsgZTtpZigwIT09bilyZXR1cm4hMH19fWVsc2UgaWYobnVsbD09PW8mJm51bGw9PT1mJiYobnVsbD09PWN8fDE9PT1jfHwtMT09PWMpKXJldHVybiEwO3Rocm93IEVycm9yKGkrXCJJbnZhbGlkIEJpZ051bWJlcjogXCIrZSl9LEgubWF4aW11bT1ILm1heD1mdW5jdGlvbigpe3JldHVybiBKKGFyZ3VtZW50cyxMLmx0KX0sSC5taW5pbXVtPUgubWluPWZ1bmN0aW9uKCl7cmV0dXJuIEooYXJndW1lbnRzLEwuZ3QpfSxILnJhbmRvbT0oRT05MDA3MTk5MjU0NzQwOTkyKk1hdGgucmFuZG9tKCkmMjA5NzE1MT9mdW5jdGlvbigpe3JldHVybiByKDkwMDcxOTkyNTQ3NDA5OTIqTWF0aC5yYW5kb20oKSl9OmZ1bmN0aW9uKCl7cmV0dXJuIDgzODg2MDgqKDEwNzM3NDE4MjQqTWF0aC5yYW5kb20oKXwwKSsoODM4ODYwOCpNYXRoLnJhbmRvbSgpfDApfSxmdW5jdGlvbihlKXt2YXIgdCxvLHUsZixsLGg9MCxwPVtdLGc9bmV3IEgoQik7aWYobnVsbD09ZT9lPVM6bShlLDAsYSksZj1uKGUvcyksVClpZihjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKXtmb3IodD1jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50MzJBcnJheShmKj0yKSk7aDxmOykobD0xMzEwNzIqdFtoXSsodFtoKzFdPj4+MTEpKT49OWUxNT8obz1jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50MzJBcnJheSgyKSksdFtoXT1vWzBdLHRbaCsxXT1vWzFdKToocC5wdXNoKGwlMWUxNCksaCs9Mik7aD1mLzJ9ZWxzZXtpZighY3J5cHRvLnJhbmRvbUJ5dGVzKXRocm93IFQ9ITEsRXJyb3IoaStcImNyeXB0byB1bmF2YWlsYWJsZVwiKTtmb3IodD1jcnlwdG8ucmFuZG9tQnl0ZXMoZio9Nyk7aDxmOykobD0yODE0NzQ5NzY3MTA2NTYqKDMxJnRbaF0pKzEwOTk1MTE2Mjc3NzYqdFtoKzFdKzQyOTQ5NjcyOTYqdFtoKzJdKzE2Nzc3MjE2KnRbaCszXSsodFtoKzRdPDwxNikrKHRbaCs1XTw8OCkrdFtoKzZdKT49OWUxNT9jcnlwdG8ucmFuZG9tQnl0ZXMoNykuY29weSh0LGgpOihwLnB1c2gobCUxZTE0KSxoKz03KTtoPWYvN31pZighVClmb3IoO2g8ZjspKGw9RSgpKTw5ZTE1JiYocFtoKytdPWwlMWUxNCk7Zm9yKGY9cFstLWhdLGUlPXMsZiYmZSYmKGw9Y1tzLWVdLHBbaF09cihmL2wpKmwpOzA9PT1wW2hdO3AucG9wKCksaC0tKTtpZihoPDApcD1bdT0wXTtlbHNle2Zvcih1PS0xOzA9PT1wWzBdO3Auc3BsaWNlKDAsMSksdS09cyk7Zm9yKGg9MSxsPXBbMF07bD49MTA7bC89MTAsaCsrKTtoPHMmJih1LT1zLWgpfXJldHVybiBnLmU9dSxnLmM9cCxnfSksSC5zdW09ZnVuY3Rpb24oKXtmb3IodmFyIGU9MSx0PWFyZ3VtZW50cyxuPW5ldyBIKHRbMF0pO2U8dC5sZW5ndGg7KW49bi5wbHVzKHRbZSsrXSk7cmV0dXJuIG59LE89ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCxuLHIpe2Zvcih2YXIgaSxvLHU9WzBdLHM9MCxmPWUubGVuZ3RoO3M8Zjspe2ZvcihvPXUubGVuZ3RoO28tLTt1W29dKj10KTtmb3IodVswXSs9ci5pbmRleE9mKGUuY2hhckF0KHMrKykpLGk9MDtpPHUubGVuZ3RoO2krKyl1W2ldPm4tMSYmKG51bGw9PXVbaSsxXSYmKHVbaSsxXT0wKSx1W2krMV0rPXVbaV0vbnwwLHVbaV0lPW4pfXJldHVybiB1LnJldmVyc2UoKX1yZXR1cm4gZnVuY3Rpb24odCxuLHIsaSxvKXt2YXIgdSxzLGYsYyxsLGEsaCxnLG09dC5pbmRleE9mKFwiLlwiKSxOPVMsYj1GO2ZvcihtPj0wJiYoYz1HLEc9MCx0PXQucmVwbGFjZShcIi5cIixcIlwiKSxhPShnPW5ldyBIKG4pKS5wb3codC5sZW5ndGgtbSksRz1jLGcuYz1lKHcocChhLmMpLGEuZSxcIjBcIiksMTAscixcIjAxMjM0NTY3ODlcIiksZy5lPWcuYy5sZW5ndGgpLGY9Yz0oaD1lKHQsbixyLG8/KHU9cSxcIjAxMjM0NTY3ODlcIik6KHU9XCIwMTIzNDU2Nzg5XCIscSkpKS5sZW5ndGg7MD09aFstLWNdO2gucG9wKCkpO2lmKCFoWzBdKXJldHVybiB1LmNoYXJBdCgwKTtpZihtPDA/LS1mOihhLmM9aCxhLmU9ZixhLnM9aSxoPShhPXkoYSxnLE4sYixyKSkuYyxsPWEucixmPWEuZSksbT1oW3M9ZitOKzFdLGM9ci8yLGw9bHx8czwwfHxudWxsIT1oW3MrMV0sbD1iPDQ/KG51bGwhPW18fGwpJiYoMD09Ynx8Yj09KGEuczwwPzM6MikpOm0+Y3x8bT09YyYmKDQ9PWJ8fGx8fDY9PWImJjEmaFtzLTFdfHxiPT0oYS5zPDA/ODo3KSksczwxfHwhaFswXSl0PWw/dyh1LmNoYXJBdCgxKSwtTix1LmNoYXJBdCgwKSk6dS5jaGFyQXQoMCk7ZWxzZXtpZihoLmxlbmd0aD1zLGwpZm9yKC0tcjsrK2hbLS1zXT5yOyloW3NdPTAsc3x8KCsrZixoPVsxXS5jb25jYXQoaCkpO2ZvcihjPWgubGVuZ3RoOyFoWy0tY107KTtmb3IobT0wLHQ9XCJcIjttPD1jO3QrPXUuY2hhckF0KGhbbSsrXSkpO3Q9dyh0LGYsdS5jaGFyQXQoMCkpfXJldHVybiB0fX0oKSx5PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQsbil7dmFyIHIsaSxvLHUscz0wLGY9ZS5sZW5ndGgsYz10JWwsYT10L2x8MDtmb3IoZT1lLnNsaWNlKCk7Zi0tOylzPSgoaT1jKihvPWVbZl0lbCkrKHI9YSpvKyh1PWVbZl0vbHwwKSpjKSVsKmwrcykvbnwwKSsoci9sfDApK2EqdSxlW2ZdPWklbjtyZXR1cm4gcyYmKGU9W3NdLmNvbmNhdChlKSksZX1mdW5jdGlvbiB0KGUsdCxuLHIpe3ZhciBpLG87aWYobiE9cilvPW4+cj8xOi0xO2Vsc2UgZm9yKGk9bz0wO2k8bjtpKyspaWYoZVtpXSE9dFtpXSl7bz1lW2ldPnRbaV0/MTotMTticmVha31yZXR1cm4gb31mdW5jdGlvbiBuKGUsdCxuLHIpe2Zvcih2YXIgaT0wO24tLTspZVtuXS09aSxpPWVbbl08dFtuXT8xOjAsZVtuXT1pKnIrZVtuXS10W25dO2Zvcig7IWVbMF0mJmUubGVuZ3RoPjE7ZS5zcGxpY2UoMCwxKSk7fXJldHVybiBmdW5jdGlvbihpLG8sZixjLGwpe3ZhciBhLHAsZyxtLE4sYix3LGQseSxPLHYsRSxBLF8sVSxSLEQsTD1pLnM9PW8ucz8xOi0xLEI9aS5jLFM9by5jO2lmKCEoQiYmQlswXSYmUyYmU1swXSkpcmV0dXJuIG5ldyBIKGkucyYmby5zJiYoQj8hU3x8QlswXSE9U1swXTpTKT9CJiYwPT1CWzBdfHwhUz8wKkw6TC8wOk5hTik7Zm9yKHk9KGQ9bmV3IEgoTCkpLmM9W10sTD1mKyhwPWkuZS1vLmUpKzEsbHx8KGw9dSxwPWgoaS5lL3MpLWgoby5lL3MpLEw9TC9zfDApLGc9MDtTW2ddPT0oQltnXXx8MCk7ZysrKTtpZihTW2ddPihCW2ddfHwwKSYmcC0tLEw8MCl5LnB1c2goMSksbT0hMDtlbHNle2ZvcihfPUIubGVuZ3RoLFI9Uy5sZW5ndGgsZz0wLEwrPTIsKE49cihsLyhTWzBdKzEpKSk+MSYmKFM9ZShTLE4sbCksQj1lKEIsTixsKSxSPVMubGVuZ3RoLF89Qi5sZW5ndGgpLEE9Uix2PShPPUIuc2xpY2UoMCxSKSkubGVuZ3RoO3Y8UjtPW3YrK109MCk7RD1TLnNsaWNlKCksRD1bMF0uY29uY2F0KEQpLFU9U1swXSxTWzFdPj1sLzImJlUrKztkb3tpZihOPTAsKGE9dChTLE8sUix2KSk8MCl7aWYoRT1PWzBdLFIhPXYmJihFPUUqbCsoT1sxXXx8MCkpLChOPXIoRS9VKSk+MSlmb3IoTj49bCYmKE49bC0xKSx3PShiPWUoUyxOLGwpKS5sZW5ndGgsdj1PLmxlbmd0aDsxPT10KGIsTyx3LHYpOylOLS0sbihiLFI8dz9EOlMsdyxsKSx3PWIubGVuZ3RoLGE9MTtlbHNlIDA9PU4mJihhPU49MSksdz0oYj1TLnNsaWNlKCkpLmxlbmd0aDtpZih3PHYmJihiPVswXS5jb25jYXQoYikpLG4oTyxiLHYsbCksdj1PLmxlbmd0aCwtMT09YSlmb3IoO3QoUyxPLFIsdik8MTspTisrLG4oTyxSPHY/RDpTLHYsbCksdj1PLmxlbmd0aH1lbHNlIDA9PT1hJiYoTisrLE89WzBdKTt5W2crK109TixPWzBdP09bdisrXT1CW0FdfHwwOihPPVtCW0FdXSx2PTEpfXdoaWxlKChBKys8X3x8bnVsbCE9T1swXSkmJkwtLSk7bT1udWxsIT1PWzBdLHlbMF18fHkuc3BsaWNlKDAsMSl9aWYobD09dSl7Zm9yKGc9MSxMPXlbMF07TD49MTA7TC89MTAsZysrKTt6KGQsZisoZC5lPWcrcCpzLTEpKzEsYyxtKX1lbHNlIGQuZT1wLGQucj0rbTtyZXR1cm4gZH19KCksQT0vXigtPykwKFt4Ym9dKSg/PVxcd1tcXHcuXSokKS9pLF89L14oW14uXSspXFwuJC8sVT0vXlxcLihbXi5dKykkLyxSPS9eLT8oSW5maW5pdHl8TmFOKSQvLEQ9L15cXHMqXFwrKD89W1xcdy5dKXxeXFxzK3xcXHMrJC9nLHY9ZnVuY3Rpb24oZSx0LG4scil7dmFyIG8sdT1uP3Q6dC5yZXBsYWNlKEQsXCJcIik7aWYoUi50ZXN0KHUpKWUucz1pc05hTih1KT9udWxsOnU8MD8tMToxO2Vsc2V7aWYoIW4mJih1PXUucmVwbGFjZShBLGZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gbz1cInhcIj09KG49bi50b0xvd2VyQ2FzZSgpKT8xNjpcImJcIj09bj8yOjgsciYmciE9bz9lOnR9KSxyJiYobz1yLHU9dS5yZXBsYWNlKF8sXCIkMVwiKS5yZXBsYWNlKFUsXCIwLiQxXCIpKSx0IT11KSlyZXR1cm4gbmV3IEgodSxvKTtpZihILkRFQlVHKXRocm93IEVycm9yKGkrXCJOb3QgYVwiKyhyP1wiIGJhc2UgXCIrcjpcIlwiKStcIiBudW1iZXI6IFwiK3QpO2Uucz1udWxsfWUuYz1lLmU9bnVsbH0sTC5hYnNvbHV0ZVZhbHVlPUwuYWJzPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IEgodGhpcyk7cmV0dXJuIGUuczwwJiYoZS5zPTEpLGV9LEwuY29tcGFyZWRUbz1mdW5jdGlvbihlLHQpe3JldHVybiBnKHRoaXMsbmV3IEgoZSx0KSl9LEwuZGVjaW1hbFBsYWNlcz1MLmRwPWZ1bmN0aW9uKGUsdCl7dmFyIG4scixpLG89dGhpcztpZihudWxsIT1lKXJldHVybiBtKGUsMCxhKSxudWxsPT10P3Q9RjptKHQsMCw4KSx6KG5ldyBIKG8pLGUrby5lKzEsdCk7aWYoIShuPW8uYykpcmV0dXJuIG51bGw7aWYocj0oKGk9bi5sZW5ndGgtMSktaCh0aGlzLmUvcykpKnMsaT1uW2ldKWZvcig7aSUxMD09MDtpLz0xMCxyLS0pO3JldHVybiByPDAmJihyPTApLHJ9LEwuZGl2aWRlZEJ5PUwuZGl2PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIHkodGhpcyxuZXcgSChlLHQpLFMsRil9LEwuZGl2aWRlZFRvSW50ZWdlckJ5PUwuaWRpdj1mdW5jdGlvbihlLHQpe3JldHVybiB5KHRoaXMsbmV3IEgoZSx0KSwwLDEpfSxMLmV4cG9uZW50aWF0ZWRCeT1MLnBvdz1mdW5jdGlvbihlLHQpe3ZhciBvLHUsZixjLGwsYSxoLHAsZz10aGlzO2lmKChlPW5ldyBIKGUpKS5jJiYhZS5pc0ludGVnZXIoKSl0aHJvdyBFcnJvcihpK1wiRXhwb25lbnQgbm90IGFuIGludGVnZXI6IFwiKyQoZSkpO2lmKG51bGwhPXQmJih0PW5ldyBIKHQpKSxsPWUuZT4xNCwhZy5jfHwhZy5jWzBdfHwxPT1nLmNbMF0mJiFnLmUmJjE9PWcuYy5sZW5ndGh8fCFlLmN8fCFlLmNbMF0pcmV0dXJuIHA9bmV3IEgoTWF0aC5wb3coKyQoZyksbD8yLU4oZSk6KyQoZSkpKSx0P3AubW9kKHQpOnA7aWYoYT1lLnM8MCx0KXtpZih0LmM/IXQuY1swXTohdC5zKXJldHVybiBuZXcgSChOYU4pOyh1PSFhJiZnLmlzSW50ZWdlcigpJiZ0LmlzSW50ZWdlcigpKSYmKGc9Zy5tb2QodCkpfWVsc2V7aWYoZS5lPjkmJihnLmU+MHx8Zy5lPC0xfHwoMD09Zy5lP2cuY1swXT4xfHxsJiZnLmNbMV0+PTI0ZTc6Zy5jWzBdPDhlMTN8fGwmJmcuY1swXTw9OTk5OTk3NWU3KSkpcmV0dXJuIGM9Zy5zPDAmJk4oZSk/LTA6MCxnLmU+LTEmJihjPTEvYyksbmV3IEgoYT8xL2M6Yyk7RyYmKGM9bihHL3MrMikpfWZvcihsPyhvPW5ldyBIKC41KSxhJiYoZS5zPTEpLGg9TihlKSk6aD0oZj1NYXRoLmFicygrJChlKSkpJTIscD1uZXcgSChCKTs7KXtpZihoKXtpZighKHA9cC50aW1lcyhnKSkuYylicmVhaztjP3AuYy5sZW5ndGg+YyYmKHAuYy5sZW5ndGg9Yyk6dSYmKHA9cC5tb2QodCkpfWlmKGYpe2lmKDA9PT0oZj1yKGYvMikpKWJyZWFrO2g9ZiUyfWVsc2UgaWYoeihlPWUudGltZXMobyksZS5lKzEsMSksZS5lPjE0KWg9TihlKTtlbHNle2lmKDA9PShmPSskKGUpKSlicmVhaztoPWYlMn1nPWcudGltZXMoZyksYz9nLmMmJmcuYy5sZW5ndGg+YyYmKGcuYy5sZW5ndGg9Yyk6dSYmKGc9Zy5tb2QodCkpfXJldHVybiB1P3A6KGEmJihwPUIuZGl2KHApKSx0P3AubW9kKHQpOmM/eihwLEcsRix2b2lkIDApOnApfSxMLmludGVnZXJWYWx1ZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgSCh0aGlzKTtyZXR1cm4gbnVsbD09ZT9lPUY6bShlLDAsOCkseih0LHQuZSsxLGUpfSxMLmlzRXF1YWxUbz1MLmVxPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIDA9PT1nKHRoaXMsbmV3IEgoZSx0KSl9LEwuaXNGaW5pdGU9ZnVuY3Rpb24oKXtyZXR1cm4hIXRoaXMuY30sTC5pc0dyZWF0ZXJUaGFuPUwuZ3Q9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZyh0aGlzLG5ldyBIKGUsdCkpPjB9LEwuaXNHcmVhdGVyVGhhbk9yRXF1YWxUbz1MLmd0ZT1mdW5jdGlvbihlLHQpe3JldHVybiAxPT09KHQ9Zyh0aGlzLG5ldyBIKGUsdCkpKXx8MD09PXR9LEwuaXNJbnRlZ2VyPWZ1bmN0aW9uKCl7cmV0dXJuISF0aGlzLmMmJmgodGhpcy5lL3MpPnRoaXMuYy5sZW5ndGgtMn0sTC5pc0xlc3NUaGFuPUwubHQ9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZyh0aGlzLG5ldyBIKGUsdCkpPDB9LEwuaXNMZXNzVGhhbk9yRXF1YWxUbz1MLmx0ZT1mdW5jdGlvbihlLHQpe3JldHVybi0xPT09KHQ9Zyh0aGlzLG5ldyBIKGUsdCkpKXx8MD09PXR9LEwuaXNOYU49ZnVuY3Rpb24oKXtyZXR1cm4hdGhpcy5zfSxMLmlzTmVnYXRpdmU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zPDB9LEwuaXNQb3NpdGl2ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnM+MH0sTC5pc1plcm89ZnVuY3Rpb24oKXtyZXR1cm4hIXRoaXMuYyYmMD09dGhpcy5jWzBdfSxMLm1pbnVzPWZ1bmN0aW9uKGUsdCl7dmFyIG4scixpLG8sZj10aGlzLGM9Zi5zO2lmKHQ9KGU9bmV3IEgoZSx0KSkucywhY3x8IXQpcmV0dXJuIG5ldyBIKE5hTik7aWYoYyE9dClyZXR1cm4gZS5zPS10LGYucGx1cyhlKTt2YXIgbD1mLmUvcyxhPWUuZS9zLHA9Zi5jLGc9ZS5jO2lmKCFsfHwhYSl7aWYoIXB8fCFnKXJldHVybiBwPyhlLnM9LXQsZSk6bmV3IEgoZz9mOk5hTik7aWYoIXBbMF18fCFnWzBdKXJldHVybiBnWzBdPyhlLnM9LXQsZSk6bmV3IEgocFswXT9mOjM9PUY/LTA6MCl9aWYobD1oKGwpLGE9aChhKSxwPXAuc2xpY2UoKSxjPWwtYSl7Zm9yKChvPWM8MCk/KGM9LWMsaT1wKTooYT1sLGk9ZyksaS5yZXZlcnNlKCksdD1jO3QtLTtpLnB1c2goMCkpO2kucmV2ZXJzZSgpfWVsc2UgZm9yKHI9KG89KGM9cC5sZW5ndGgpPCh0PWcubGVuZ3RoKSk/Yzp0LGM9dD0wO3Q8cjt0KyspaWYocFt0XSE9Z1t0XSl7bz1wW3RdPGdbdF07YnJlYWt9aWYobyYmKGk9cCxwPWcsZz1pLGUucz0tZS5zKSwodD0ocj1nLmxlbmd0aCktKG49cC5sZW5ndGgpKT4wKWZvcig7dC0tO3BbbisrXT0wKTtmb3IodD11LTE7cj5jOyl7aWYocFstLXJdPGdbcl0pe2ZvcihuPXI7biYmIXBbLS1uXTtwW25dPXQpOy0tcFtuXSxwW3JdKz11fXBbcl0tPWdbcl19Zm9yKDswPT1wWzBdO3Auc3BsaWNlKDAsMSksLS1hKTtyZXR1cm4gcFswXT9rKGUscCxhKTooZS5zPTM9PUY/LTE6MSxlLmM9W2UuZT0wXSxlKX0sTC5tb2R1bG89TC5tb2Q9ZnVuY3Rpb24oZSx0KXt2YXIgbixyLGk9dGhpcztyZXR1cm4gZT1uZXcgSChlLHQpLCFpLmN8fCFlLnN8fGUuYyYmIWUuY1swXT9uZXcgSChOYU4pOiFlLmN8fGkuYyYmIWkuY1swXT9uZXcgSChpKTooOT09Qz8ocj1lLnMsZS5zPTEsbj15KGksZSwwLDMpLGUucz1yLG4ucyo9cik6bj15KGksZSwwLEMpLChlPWkubWludXMobi50aW1lcyhlKSkpLmNbMF18fDEhPUN8fChlLnM9aS5zKSxlKX0sTC5tdWx0aXBsaWVkQnk9TC50aW1lcz1mdW5jdGlvbihlLHQpe3ZhciBuLHIsaSxvLGYsYyxhLHAsZyxtLE4sYix3LGQseSxPPXRoaXMsdj1PLmMsRT0oZT1uZXcgSChlLHQpKS5jO2lmKCEodiYmRSYmdlswXSYmRVswXSkpcmV0dXJuIU8uc3x8IWUuc3x8diYmIXZbMF0mJiFFfHxFJiYhRVswXSYmIXY/ZS5jPWUuZT1lLnM9bnVsbDooZS5zKj1PLnMsdiYmRT8oZS5jPVswXSxlLmU9MCk6ZS5jPWUuZT1udWxsKSxlO2ZvcihyPWgoTy5lL3MpK2goZS5lL3MpLGUucyo9Ty5zLChhPXYubGVuZ3RoKTwobT1FLmxlbmd0aCkmJih3PXYsdj1FLEU9dyxpPWEsYT1tLG09aSksaT1hK20sdz1bXTtpLS07dy5wdXNoKDApKTtmb3IoZD11LHk9bCxpPW07LS1pPj0wOyl7Zm9yKG49MCxOPUVbaV0leSxiPUVbaV0veXwwLG89aSsoZj1hKTtvPmk7KW49KChwPU4qKHA9dlstLWZdJXkpKyhjPWIqcCsoZz12W2ZdL3l8MCkqTikleSp5K3dbb10rbikvZHwwKSsoYy95fDApK2IqZyx3W28tLV09cCVkO3dbb109bn1yZXR1cm4gbj8rK3I6dy5zcGxpY2UoMCwxKSxrKGUsdyxyKX0sTC5uZWdhdGVkPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IEgodGhpcyk7cmV0dXJuIGUucz0tZS5zfHxudWxsLGV9LEwucGx1cz1mdW5jdGlvbihlLHQpe3ZhciBuLHI9dGhpcyxpPXIucztpZih0PShlPW5ldyBIKGUsdCkpLnMsIWl8fCF0KXJldHVybiBuZXcgSChOYU4pO2lmKGkhPXQpcmV0dXJuIGUucz0tdCxyLm1pbnVzKGUpO3ZhciBvPXIuZS9zLGY9ZS5lL3MsYz1yLmMsbD1lLmM7aWYoIW98fCFmKXtpZighY3x8IWwpcmV0dXJuIG5ldyBIKGkvMCk7aWYoIWNbMF18fCFsWzBdKXJldHVybiBsWzBdP2U6bmV3IEgoY1swXT9yOjAqaSl9aWYobz1oKG8pLGY9aChmKSxjPWMuc2xpY2UoKSxpPW8tZil7Zm9yKGk+MD8oZj1vLG49bCk6KGk9LWksbj1jKSxuLnJldmVyc2UoKTtpLS07bi5wdXNoKDApKTtuLnJldmVyc2UoKX1mb3IoKGk9Yy5sZW5ndGgpLSh0PWwubGVuZ3RoKTwwJiYobj1sLGw9YyxjPW4sdD1pKSxpPTA7dDspaT0oY1stLXRdPWNbdF0rbFt0XStpKS91fDAsY1t0XT11PT09Y1t0XT8wOmNbdF0ldTtyZXR1cm4gaSYmKGM9W2ldLmNvbmNhdChjKSwrK2YpLGsoZSxjLGYpfSxMLnByZWNpc2lvbj1MLnNkPWZ1bmN0aW9uKGUsdCl7dmFyIG4scixpLG89dGhpcztpZihudWxsIT1lJiZlIT09ISFlKXJldHVybiBtKGUsMSxhKSxudWxsPT10P3Q9RjptKHQsMCw4KSx6KG5ldyBIKG8pLGUsdCk7aWYoIShuPW8uYykpcmV0dXJuIG51bGw7aWYocj0oaT1uLmxlbmd0aC0xKSpzKzEsaT1uW2ldKXtmb3IoO2klMTA9PTA7aS89MTAsci0tKTtmb3IoaT1uWzBdO2k+PTEwO2kvPTEwLHIrKyk7fXJldHVybiBlJiZvLmUrMT5yJiYocj1vLmUrMSkscn0sTC5zaGlmdGVkQnk9ZnVuY3Rpb24oZSl7cmV0dXJuIG0oZSwtZixmKSx0aGlzLnRpbWVzKFwiMWVcIitlKX0sTC5zcXVhcmVSb290PUwuc3FydD1mdW5jdGlvbigpe3ZhciBlLHQsbixyLGksbz10aGlzLHU9by5jLHM9by5zLGY9by5lLGM9Uys0LGw9bmV3IEgoXCIwLjVcIik7aWYoMSE9PXN8fCF1fHwhdVswXSlyZXR1cm4gbmV3IEgoIXN8fHM8MCYmKCF1fHx1WzBdKT9OYU46dT9vOjEvMCk7aWYoMD09KHM9TWF0aC5zcXJ0KCskKG8pKSl8fHM9PTEvMD8oKCh0PXAodSkpLmxlbmd0aCtmKSUyPT0wJiYodCs9XCIwXCIpLHM9TWF0aC5zcXJ0KCt0KSxmPWgoKGYrMSkvMiktKGY8MHx8ZiUyKSxuPW5ldyBIKHQ9cz09MS8wP1wiNWVcIitmOih0PXMudG9FeHBvbmVudGlhbCgpKS5zbGljZSgwLHQuaW5kZXhPZihcImVcIikrMSkrZikpOm49bmV3IEgocytcIlwiKSxuLmNbMF0pZm9yKChzPShmPW4uZSkrYyk8MyYmKHM9MCk7OylpZihpPW4sbj1sLnRpbWVzKGkucGx1cyh5KG8saSxjLDEpKSkscChpLmMpLnNsaWNlKDAscyk9PT0odD1wKG4uYykpLnNsaWNlKDAscykpe2lmKG4uZTxmJiYtLXMsXCI5OTk5XCIhPSh0PXQuc2xpY2Uocy0zLHMrMSkpJiYocnx8XCI0OTk5XCIhPXQpKXsrdCYmKCt0LnNsaWNlKDEpfHxcIjVcIiE9dC5jaGFyQXQoMCkpfHwoeihuLG4uZStTKzIsMSksZT0hbi50aW1lcyhuKS5lcShvKSk7YnJlYWt9aWYoIXImJih6KGksaS5lK1MrMiwwKSxpLnRpbWVzKGkpLmVxKG8pKSl7bj1pO2JyZWFrfWMrPTQscys9NCxyPTF9cmV0dXJuIHoobixuLmUrUysxLEYsZSl9LEwudG9FeHBvbmVudGlhbD1mdW5jdGlvbihlLHQpe3JldHVybiBudWxsIT1lJiYobShlLDAsYSksZSsrKSxWKHRoaXMsZSx0LDEpfSxMLnRvRml4ZWQ9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gbnVsbCE9ZSYmKG0oZSwwLGEpLGU9ZSt0aGlzLmUrMSksVih0aGlzLGUsdCl9LEwudG9Gb3JtYXQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByLG89dGhpcztpZihudWxsPT1uKW51bGwhPWUmJnQmJlwib2JqZWN0XCI9PXR5cGVvZiB0PyhuPXQsdD1udWxsKTplJiZcIm9iamVjdFwiPT10eXBlb2YgZT8obj1lLGU9dD1udWxsKTpuPWo7ZWxzZSBpZihcIm9iamVjdFwiIT10eXBlb2Ygbil0aHJvdyBFcnJvcihpK1wiQXJndW1lbnQgbm90IGFuIG9iamVjdDogXCIrbik7aWYocj1vLnRvRml4ZWQoZSx0KSxvLmMpe3ZhciB1LHM9ci5zcGxpdChcIi5cIiksZj0rbi5ncm91cFNpemUsYz0rbi5zZWNvbmRhcnlHcm91cFNpemUsbD1uLmdyb3VwU2VwYXJhdG9yfHxcIlwiLGE9c1swXSxoPXNbMV0scD1vLnM8MCxnPXA/YS5zbGljZSgxKTphLG09Zy5sZW5ndGg7aWYoYyYmKHU9ZixmPWMsYz11LG0tPXUpLGY+MCYmbT4wKXtmb3IodT1tJWZ8fGYsYT1nLnN1YnN0cigwLHUpO3U8bTt1Kz1mKWErPWwrZy5zdWJzdHIodSxmKTtjPjAmJihhKz1sK2cuc2xpY2UodSkpLHAmJihhPVwiLVwiK2EpfXI9aD9hKyhuLmRlY2ltYWxTZXBhcmF0b3J8fFwiXCIpKygoYz0rbi5mcmFjdGlvbkdyb3VwU2l6ZSk/aC5yZXBsYWNlKG5ldyBSZWdFeHAoXCJcXFxcZHtcIitjK1wifVxcXFxCXCIsXCJnXCIpLFwiJCZcIisobi5mcmFjdGlvbkdyb3VwU2VwYXJhdG9yfHxcIlwiKSk6aCk6YX1yZXR1cm4obi5wcmVmaXh8fFwiXCIpK3IrKG4uc3VmZml4fHxcIlwiKX0sTC50b0ZyYWN0aW9uPWZ1bmN0aW9uKGUpe3ZhciB0LG4scixvLHUsZixsLGEsaCxnLG0sTixiPXRoaXMsdz1iLmM7aWYobnVsbCE9ZSYmKCEobD1uZXcgSChlKSkuaXNJbnRlZ2VyKCkmJihsLmN8fDEhPT1sLnMpfHxsLmx0KEIpKSl0aHJvdyBFcnJvcihpK1wiQXJndW1lbnQgXCIrKGwuaXNJbnRlZ2VyKCk/XCJvdXQgb2YgcmFuZ2U6IFwiOlwibm90IGFuIGludGVnZXI6IFwiKSskKGwpKTtpZighdylyZXR1cm4gbmV3IEgoYik7Zm9yKHQ9bmV3IEgoQiksaD1uPW5ldyBIKEIpLHI9YT1uZXcgSChCKSxOPXAodyksdT10LmU9Ti5sZW5ndGgtYi5lLTEsdC5jWzBdPWNbKGY9dSVzKTwwP3MrZjpmXSxlPSFlfHxsLmNvbXBhcmVkVG8odCk+MD91PjA/dDpoOmwsZj1QLFA9MS8wLGw9bmV3IEgoTiksYS5jWzBdPTA7Zz15KGwsdCwwLDEpLDEhPShvPW4ucGx1cyhnLnRpbWVzKHIpKSkuY29tcGFyZWRUbyhlKTspbj1yLHI9byxoPWEucGx1cyhnLnRpbWVzKG89aCkpLGE9byx0PWwubWludXMoZy50aW1lcyhvPXQpKSxsPW87cmV0dXJuIG89eShlLm1pbnVzKG4pLHIsMCwxKSxhPWEucGx1cyhvLnRpbWVzKGgpKSxuPW4ucGx1cyhvLnRpbWVzKHIpKSxhLnM9aC5zPWIucyxtPXkoaCxyLHUqPTIsRikubWludXMoYikuYWJzKCkuY29tcGFyZWRUbyh5KGEsbix1LEYpLm1pbnVzKGIpLmFicygpKTwxP1toLHJdOlthLG5dLFA9ZixtfSxMLnRvTnVtYmVyPWZ1bmN0aW9uKCl7cmV0dXJuKyQodGhpcyl9LEwudG9QcmVjaXNpb249ZnVuY3Rpb24oZSx0KXtyZXR1cm4gbnVsbCE9ZSYmbShlLDEsYSksVih0aGlzLGUsdCwyKX0sTC50b1N0cmluZz1mdW5jdGlvbihlKXt2YXIgdCxuPXRoaXMscj1uLnMsaT1uLmU7cmV0dXJuIG51bGw9PT1pP3I/KHQ9XCJJbmZpbml0eVwiLHI8MCYmKHQ9XCItXCIrdCkpOnQ9XCJOYU5cIjoobnVsbD09ZT90PWk8PUl8fGk+PU0/YihwKG4uYyksaSk6dyhwKG4uYyksaSxcIjBcIik6MTA9PT1lP3Q9dyhwKChuPXoobmV3IEgobiksUytpKzEsRikpLmMpLG4uZSxcIjBcIik6KG0oZSwyLHEubGVuZ3RoLFwiQmFzZVwiKSx0PU8odyhwKG4uYyksaSxcIjBcIiksMTAsZSxyLCEwKSkscjwwJiZuLmNbMF0mJih0PVwiLVwiK3QpKSx0fSxMLnZhbHVlT2Y9TC50b0pTT049ZnVuY3Rpb24oKXtyZXR1cm4gJCh0aGlzKX0sTC5faXNCaWdOdW1iZXI9ITAsTFtTeW1ib2wudG9TdHJpbmdUYWddPVwiQmlnTnVtYmVyXCIsTFtTeW1ib2wuZm9yKFwibm9kZWpzLnV0aWwuaW5zcGVjdC5jdXN0b21cIildPUwudmFsdWVPZixudWxsIT1kJiZILnNldChkKSxIfSgpLHk9ZnVuY3Rpb24oKXtyZXR1cm4oeT1PYmplY3QuYXNzaWdufHxmdW5jdGlvbihlKXtmb3IodmFyIHQsbj0xLHI9YXJndW1lbnRzLmxlbmd0aDtuPHI7bisrKWZvcih2YXIgaSBpbiB0PWFyZ3VtZW50c1tuXSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodCxpKSYmKGVbaV09dFtpXSk7cmV0dXJuIGV9KS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9LE89ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKCl7dGhpcy5mb3JtYXQ9ZS5ERUZBVUxUX0ZPUk1BVCxkLmNvbmZpZyh7Rk9STUFUOnRoaXMuZm9ybWF0fSl9cmV0dXJuIGUucHJvdG90eXBlLnNldD1mdW5jdGlvbihlKXtcIkZPUk1BVFwiaW4gZSYmKHRoaXMuZm9ybWF0PXkoe30sdGhpcy5mb3JtYXQsZS5GT1JNQVQpLGUuRk9STUFUPXRoaXMuZm9ybWF0KSxkLmNvbmZpZyhlKX0sZS5ERUZBVUxUX0ZPUk1BVD17cHJlZml4OlwiXCIsZGVjaW1hbFNlcGFyYXRvcjpcIi5cIixncm91cFNlcGFyYXRvcjpcIixcIixncm91cFNpemU6MyxzZWNvbmRhcnlHcm91cFNpemU6MCxmcmFjdGlvbkdyb3VwU2VwYXJhdG9yOlwiIFwiLGZyYWN0aW9uR3JvdXBTaXplOjAsc3VmZml4OlwiXCJ9LGV9KCk7ZS5CaWdOdW1iZXI9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQpe1wib2JqZWN0XCI9PXR5cGVvZiB0JiZlLmlzQmlnTnVtYmVyKHQpP3RoaXMuYm49dC5ibi5wbHVzKDApOnRoaXMuYm49ZS50b0JpZ051bWJlckpzKHQpfXJldHVybiBlLnByb3RvdHlwZS5jbG9uZT1mdW5jdGlvbigpe3JldHVybiBuZXcgZSh0aGlzKX0sZS5wcm90b3R5cGUuYWRkPWZ1bmN0aW9uKHQpe3JldHVybiBuZXcgZSh0aGlzLmJuLnBsdXMoZS50b0JpZ051bWJlckpzKHQpKSl9LGUucHJvdG90eXBlLnN1Yj1mdW5jdGlvbih0KXtyZXR1cm4gbmV3IGUodGhpcy5ibi5taW51cyhlLnRvQmlnTnVtYmVySnModCkpKX0sZS5wcm90b3R5cGUubXVsPWZ1bmN0aW9uKHQpe3JldHVybiBuZXcgZSh0aGlzLmJuLnRpbWVzKGUudG9CaWdOdW1iZXJKcyh0KSkpfSxlLnByb3RvdHlwZS5kaXY9ZnVuY3Rpb24odCl7cmV0dXJuIG5ldyBlKHRoaXMuYm4uZGl2KGUudG9CaWdOdW1iZXJKcyh0KSkpfSxlLnByb3RvdHlwZS5wb3c9ZnVuY3Rpb24odCl7cmV0dXJuIG5ldyBlKHRoaXMuYm4ucG93KGUudG9CaWdOdW1iZXJKcyh0KSkpfSxlLnByb3RvdHlwZS5zcXJ0PWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBlKHRoaXMuYm4uc3FydCgpKX0sZS5wcm90b3R5cGUuYWJzPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBlKHRoaXMuYm4uYWJzKCkpfSxlLnByb3RvdHlwZS5tb2Q9ZnVuY3Rpb24odCl7cmV0dXJuIG5ldyBlKHRoaXMuYm4ubW9kKGUudG9CaWdOdW1iZXJKcyh0KSkpfSxlLnByb3RvdHlwZS5yb3VuZFRvPWZ1bmN0aW9uKHQsbil7cmV0dXJuIHZvaWQgMD09PXQmJih0PTApLHZvaWQgMD09PW4mJihuPTQpLG5ldyBlKHRoaXMuYm4uZHAodHx8MCxuKSl9LGUucHJvdG90eXBlLmVxPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmJuLmVxKGUudG9CaWdOdW1iZXJKcyh0KSl9LGUucHJvdG90eXBlLmx0PWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmJuLmx0KGUudG9CaWdOdW1iZXJKcyh0KSl9LGUucHJvdG90eXBlLmd0PWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmJuLmd0KGUudG9CaWdOdW1iZXJKcyh0KSl9LGUucHJvdG90eXBlLmx0ZT1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5ibi5sdGUoZS50b0JpZ051bWJlckpzKHQpKX0sZS5wcm90b3R5cGUuZ3RlPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmJuLmd0ZShlLnRvQmlnTnVtYmVySnModCkpfSxlLnByb3RvdHlwZS5pc05hTj1mdW5jdGlvbigpe3JldHVybiB0aGlzLmJuLmlzTmFOKCl9LGUucHJvdG90eXBlLmlzRmluaXRlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYm4uaXNGaW5pdGUoKX0sZS5wcm90b3R5cGUuaXNaZXJvPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZXEoMCl9LGUucHJvdG90eXBlLmlzUG9zaXRpdmU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ndCgwKX0sZS5wcm90b3R5cGUuaXNOZWdhdGl2ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmx0KDApfSxlLnByb3RvdHlwZS5pc0ludD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmJuLmlzSW50ZWdlcigpfSxlLnByb3RvdHlwZS5nZXREZWNpbWFsc0NvdW50PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYm4uZHAoKX0sZS5wcm90b3R5cGUuaXNFdmVuPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubW9kKDIpLmVxKDApfSxlLnByb3RvdHlwZS5pc09kZD1mdW5jdGlvbigpe3JldHVybiF0aGlzLmlzRXZlbigpfSxlLnByb3RvdHlwZS5pc0luU2lnbmVkUmFuZ2U9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ndGUoZS5NSU5fVkFMVUUpJiZ0aGlzLmx0ZShlLk1BWF9WQUxVRSl9LGUucHJvdG90eXBlLmlzSW5VbnNpZ25lZFJhbmdlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ3RlKGUuTUlOX1VOU0lHTkVEX1ZBTFVFKSYmdGhpcy5sdGUoZS5NQVhfVU5TSUdORURfVkFMVUUpfSxlLnByb3RvdHlwZS50b0Zvcm1hdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIHRoaXMuYm4udG9Gb3JtYXQoZSx0LG4pfSxlLnByb3RvdHlwZS50b0ZpeGVkPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIG51bGw9PWU/dGhpcy5ibi50b0ZpeGVkKCk6dGhpcy5ibi50b0ZpeGVkKGUsdCl9LGUucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudG9GaXhlZCgpfSxlLnByb3RvdHlwZS50b051bWJlcj1mdW5jdGlvbigpe3JldHVybiB0aGlzLmJuLnRvTnVtYmVyKCl9LGUucHJvdG90eXBlLnRvSlNPTj1mdW5jdGlvbigpe3JldHVybiB0aGlzLmJuLnRvRml4ZWQoKX0sZS5wcm90b3R5cGUudmFsdWVPZj1mdW5jdGlvbigpe3JldHVybiB0aGlzLmJuLnZhbHVlT2YoKX0sZS5wcm90b3R5cGUudG9CeXRlcz1mdW5jdGlvbih0KXt2YXIgbj12b2lkIDA9PT10P3t9OnQscj1uLmlzU2lnbmVkLGk9dm9pZCAwPT09cnx8cixvPW4uaXNMb25nLHU9dm9pZCAwPT09b3x8bztpZighdGhpcy5pc0ludCgpKXRocm93IG5ldyBFcnJvcihcIkNhbnQgY3JlYXRlIGJ5dGVzIGZyb20gbnVtYmVyIHdpdGggZGVjaW1hbHMhXCIpO2lmKCFpJiZ0aGlzLmlzTmVnYXRpdmUoKSl0aHJvdyBuZXcgRXJyb3IoXCJDYW50IGNyZWF0ZSBieXRlcyBmcm9tIG5lZ2F0aXZlIG51bWJlciBpbiBzaWduZWQgbW9kZSFcIik7aWYodSYmaSYmIXRoaXMuaXNJblNpZ25lZFJhbmdlKCkpdGhyb3cgbmV3IEVycm9yKFwiTnVtYmVyIGlzIG5vdCBmcm9tIHNpZ25lZCBudW1iZXJzIHJhbmdlXCIpO2lmKHUmJiFpJiYhdGhpcy5pc0luVW5zaWduZWRSYW5nZSgpKXRocm93IG5ldyBFcnJvcihcIk51bWJlciBpcyBub3QgZnJvbSB1bnNpZ25lZCBudW1iZXJzIHJhbmdlXCIpO3ZhciBzPWkmJnRoaXMuaXNOZWdhdGl2ZSgpLGY9cz9cIjFcIjpcIjBcIixjPXRoaXMuYm4ucGx1cyhmKS50b1N0cmluZygyKS5yZXBsYWNlKFwiLVwiLFwiXCIpLGw9dT82NDo4Kk1hdGguY2VpbChjLmxlbmd0aC84KSxhPWUuX3RvTGVuZ3RoKGwsYykuc3BsaXQoXCJcIiksaD1bXTtkb3toLnB1c2gocGFyc2VJbnQoYS5zcGxpY2UoMCw4KS5qb2luKFwiXCIpLDIpKX13aGlsZShhLmxlbmd0aCk7cmV0dXJuIHM/VWludDhBcnJheS5mcm9tKGgubWFwKGZ1bmN0aW9uKGUpe3JldHVybiAyNTUtZX0pKTpVaW50OEFycmF5LmZyb20oaCl9LGUuZnJvbUJ5dGVzPWZ1bmN0aW9uKHQsbil7dmFyIHI9dm9pZCAwPT09bj97fTpuLGk9ci5pc1NpZ25lZCxvPXZvaWQgMD09PWl8fGksdT1yLmlzTG9uZyxzPXZvaWQgMD09PXV8fHU7aWYocyYmOCE9PXQubGVuZ3RoKXRocm93IG5ldyBFcnJvcihcIldyb25nIGJ5dGVzIGxlbmd0aCEgTWluaW1hbCBsZW5ndGggaXMgOCBieXRlIVwiKTt0PSFzJiZ0Lmxlbmd0aD4wfHxzP3Q6WzBdO3ZhciBmPSEhbyYmdFswXT4xMjcsYz1BcnJheS5mcm9tKHQpLm1hcChmdW5jdGlvbihlKXtyZXR1cm4gZj8yNTUtZTplfSkubWFwKGZ1bmN0aW9uKHQpe3JldHVybiBlLl90b0xlbmd0aCg4LHQudG9TdHJpbmcoMikpfSkuam9pbihcIlwiKSxsPW5ldyBlKG5ldyBkKGMsMikpO3JldHVybiBmP2wubXVsKC0xKS5zdWIoMSk6bH0sZS5tYXg9ZnVuY3Rpb24oKXtmb3IodmFyIHQ9W10sbj0wO248YXJndW1lbnRzLmxlbmd0aDtuKyspdFtuXT1hcmd1bWVudHNbbl07cmV0dXJuIGUudG9CaWdOdW1iZXIodCkucmVkdWNlKGZ1bmN0aW9uKGUsdCl7cmV0dXJuIGUuZ3RlKHQpP2U6dH0pfSxlLm1pbj1mdW5jdGlvbigpe2Zvcih2YXIgdD1bXSxuPTA7bjxhcmd1bWVudHMubGVuZ3RoO24rKyl0W25dPWFyZ3VtZW50c1tuXTtyZXR1cm4gZS50b0JpZ051bWJlcih0KS5yZWR1Y2UoZnVuY3Rpb24oZSx0KXtyZXR1cm4gZS5sdGUodCk/ZTp0fSl9LGUuc3VtPWZ1bmN0aW9uKCl7Zm9yKHZhciB0PVtdLG49MDtuPGFyZ3VtZW50cy5sZW5ndGg7bisrKXRbbl09YXJndW1lbnRzW25dO3JldHVybiBlLnRvQmlnTnVtYmVyKHQpLnJlZHVjZShmdW5jdGlvbihlLHQpe3JldHVybiBlLmFkZCh0KX0pfSxlLmlzQmlnTnVtYmVyPWZ1bmN0aW9uKHQpe3JldHVybiB0JiZcIm9iamVjdFwiPT10eXBlb2YgdCYmKHQgaW5zdGFuY2VvZiBlfHxPYmplY3QuZW50cmllcyhlLnByb3RvdHlwZSkuZmlsdGVyKGZ1bmN0aW9uKGUpe3JldHVyblwiX1wiIT09ZVswXS5jaGFyQXQoMCl9KS5ldmVyeShmdW5jdGlvbihlKXt2YXIgbj1lWzBdLHI9ZVsxXTtyZXR1cm4gbiBpbiB0JiZ0eXBlb2Ygcj09dHlwZW9mIHRbbl19KSl9LGUudG9CaWdOdW1iZXI9ZnVuY3Rpb24odCl7cmV0dXJuIEFycmF5LmlzQXJyYXkodCk/dC5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIG5ldyBlKHQpfSk6bmV3IGUodCl9LGUudG9CaWdOdW1iZXJKcz1mdW5jdGlvbih0KXtyZXR1cm4gZC5pc0JpZ051bWJlcih0KT90OnQgaW5zdGFuY2VvZiBlP3QuYm46bmV3IGQodCl9LGUuX3RvTGVuZ3RoPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIG5ldyBBcnJheShlKS5maWxsKFwiMFwiLDAsZSkuY29uY2F0KHQuc3BsaXQoXCJcIikpLnNsaWNlKC1lKS5qb2luKFwiXCIpfSxlLk1JTl9WQUxVRT1uZXcgZShcIi05MjIzMzcyMDM2ODU0Nzc1ODA4XCIpLGUuTUFYX1ZBTFVFPW5ldyBlKFwiOTIyMzM3MjAzNjg1NDc3NTgwN1wiKSxlLk1JTl9VTlNJR05FRF9WQUxVRT1uZXcgZShcIjBcIiksZS5NQVhfVU5TSUdORURfVkFMVUU9bmV3IGUoXCIxODQ0Njc0NDA3MzcwOTU1MTYxNVwiKSxlLmNvbmZpZz1uZXcgTyxlfSgpLGZ1bmN0aW9uKGUpeyFmdW5jdGlvbihlKXtlW2UuUk9VTkRfVVA9MF09XCJST1VORF9VUFwiLGVbZS5ST1VORF9ET1dOPTFdPVwiUk9VTkRfRE9XTlwiLGVbZS5ST1VORF9DRUlMPTJdPVwiUk9VTkRfQ0VJTFwiLGVbZS5ST1VORF9GTE9PUj0zXT1cIlJPVU5EX0ZMT09SXCIsZVtlLlJPVU5EX0hBTEZfVVA9NF09XCJST1VORF9IQUxGX1VQXCIsZVtlLlJPVU5EX0hBTEZfRE9XTj01XT1cIlJPVU5EX0hBTEZfRE9XTlwiLGVbZS5ST1VORF9IQUxGX0VWRU49Nl09XCJST1VORF9IQUxGX0VWRU5cIixlW2UuUk9VTkRfSEFMRl9DRUlMPTddPVwiUk9VTkRfSEFMRl9DRUlMXCIsZVtlLlJPVU5EX0hBTEZfRkxPT1I9OF09XCJST1VORF9IQUxGX0ZMT09SXCJ9KGUuUk9VTkRfTU9ERXx8KGUuUk9VTkRfTU9ERT17fSkpfShlLkJpZ051bWJlcnx8KGUuQmlnTnVtYmVyPXt9KSk7dmFyIHY9ZS5CaWdOdW1iZXI7ZS5kZWZhdWx0PXYsT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSl9KTtcbiIsIiFmdW5jdGlvbihlLG4pe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPW4oKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLG4pOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP2V4cG9ydHMuY2xpZW50TG9ncz1uKCk6ZS5jbGllbnRMb2dzPW4oKX0odGhpcywoZnVuY3Rpb24oKXtyZXR1cm4gZnVuY3Rpb24oZSl7dmFyIG49e307ZnVuY3Rpb24gdChyKXtpZihuW3JdKXJldHVybiBuW3JdLmV4cG9ydHM7dmFyIG89bltyXT17aTpyLGw6ITEsZXhwb3J0czp7fX07cmV0dXJuIGVbcl0uY2FsbChvLmV4cG9ydHMsbyxvLmV4cG9ydHMsdCksby5sPSEwLG8uZXhwb3J0c31yZXR1cm4gdC5tPWUsdC5jPW4sdC5kPWZ1bmN0aW9uKGUsbixyKXt0Lm8oZSxuKXx8T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsbix7ZW51bWVyYWJsZTohMCxnZXQ6cn0pfSx0LnI9ZnVuY3Rpb24oZSl7XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLnRvU3RyaW5nVGFnJiZPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxTeW1ib2wudG9TdHJpbmdUYWcse3ZhbHVlOlwiTW9kdWxlXCJ9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KX0sdC50PWZ1bmN0aW9uKGUsbil7aWYoMSZuJiYoZT10KGUpKSw4Jm4pcmV0dXJuIGU7aWYoNCZuJiZcIm9iamVjdFwiPT10eXBlb2YgZSYmZSYmZS5fX2VzTW9kdWxlKXJldHVybiBlO3ZhciByPU9iamVjdC5jcmVhdGUobnVsbCk7aWYodC5yKHIpLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyLFwiZGVmYXVsdFwiLHtlbnVtZXJhYmxlOiEwLHZhbHVlOmV9KSwyJm4mJlwic3RyaW5nXCIhPXR5cGVvZiBlKWZvcih2YXIgbyBpbiBlKXQuZChyLG8sZnVuY3Rpb24obil7cmV0dXJuIGVbbl19LmJpbmQobnVsbCxvKSk7cmV0dXJuIHJ9LHQubj1mdW5jdGlvbihlKXt2YXIgbj1lJiZlLl9fZXNNb2R1bGU/ZnVuY3Rpb24oKXtyZXR1cm4gZS5kZWZhdWx0fTpmdW5jdGlvbigpe3JldHVybiBlfTtyZXR1cm4gdC5kKG4sXCJhXCIsbiksbn0sdC5vPWZ1bmN0aW9uKGUsbil7cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLG4pfSx0LnA9XCJcIix0KHQucz0wKX0oW2Z1bmN0aW9uKGUsbix0KXtcInVzZSBzdHJpY3RcIjt0LnIobik7dmFyIHI9W1wiaW5mb1wiLFwibG9nXCIsXCJ3YXJuXCIsXCJlcnJvclwiXSxvPXtrZWVwTWVzc2FnZUNvdW50OjEwMCxrZWVwTWVzc2FnZVR5cGVzOltcImVycm9yXCJdLGxvZ01lc3NhZ2VUeXBlczpbXCJlcnJvclwiXSxuYW1lc3BhY2U6dm9pZCAwfSxzPWZ1bmN0aW9uKGUpe3JldHVybiBlLnJlZHVjZSgoZnVuY3Rpb24oZSxuKXtyZXR1cm4gZVtuXT0hMCxlfSksT2JqZWN0LmNyZWF0ZShudWxsKSl9LHU9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUpe3RoaXMuX21lc3NhZ2VzPVtdLHRoaXMuX21heExlbmd0aD1lfXJldHVybiBlLnByb3RvdHlwZS5wdXNoPWZ1bmN0aW9uKGUpe3RoaXMuX21lc3NhZ2VzLnB1c2goZSksdGhpcy5fbWVzc2FnZXMubGVuZ3RoPnRoaXMuX21heExlbmd0aCYmdGhpcy5fbWVzc2FnZXMuc3BsaWNlKDAsdGhpcy5fbWVzc2FnZXMubGVuZ3RoLXRoaXMuX21heExlbmd0aCl9LGUucHJvdG90eXBlLmdldE1lc3NhZ2VzPWZ1bmN0aW9uKGUpe3ZhciBuLHQsbz1zKG51bGwhPSh0PW51bGw9PT0obj1lKXx8dm9pZCAwPT09bj92b2lkIDA6bi5tZXNzYWdlVHlwZXMpP3Q6cik7cmV0dXJuIHRoaXMuX21lc3NhZ2VzLmZpbHRlcigoZnVuY3Rpb24oZSl7cmV0dXJuIG9bZS50eXBlXX0pKX0sZX0oKTtmdW5jdGlvbiBhKGUpe3JldHVybiBlfXQuZChuLFwibWFrZUNvbnNvbGVcIiwoZnVuY3Rpb24oKXtyZXR1cm4gcH0pKSx0LmQobixcInZlcnNpb25cIiwoZnVuY3Rpb24oKXtyZXR1cm4gZn0pKSx0LmQobixcIm1ha2VPcHRpb25zXCIsKGZ1bmN0aW9uKCl7cmV0dXJuIGx9KSk7dmFyIGk9ZnVuY3Rpb24oKXtyZXR1cm4oaT1PYmplY3QuYXNzaWdufHxmdW5jdGlvbihlKXtmb3IodmFyIG4sdD0xLHI9YXJndW1lbnRzLmxlbmd0aDt0PHI7dCsrKWZvcih2YXIgbyBpbiBuPWFyZ3VtZW50c1t0XSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobixvKSYmKGVbb109bltvXSk7cmV0dXJuIGV9KS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9LGM9ZnVuY3Rpb24oKXtmb3IodmFyIGU9MCxuPTAsdD1hcmd1bWVudHMubGVuZ3RoO248dDtuKyspZSs9YXJndW1lbnRzW25dLmxlbmd0aDt2YXIgcj1BcnJheShlKSxvPTA7Zm9yKG49MDtuPHQ7bisrKWZvcih2YXIgcz1hcmd1bWVudHNbbl0sdT0wLGE9cy5sZW5ndGg7dTxhO3UrKyxvKyspcltvXT1zW3VdO3JldHVybiByfSxwPWZ1bmN0aW9uKGUpe3ZhciBuPWkoaSh7fSxvKSxudWxsIT1lP2U6e30pLHQ9bmV3IHUobi5rZWVwTWVzc2FnZUNvdW50KSxwPXMobi5sb2dNZXNzYWdlVHlwZXMpLGY9cyhuLmtlZXBNZXNzYWdlVHlwZXMpO3JldHVybiByLnJlZHVjZSgoZnVuY3Rpb24oZSxyKXt2YXIgbz1udWxsIT1uLm5hbWVzcGFjZT9mdW5jdGlvbihlKXtyZXR1cm4gYyhbbi5uYW1lc3BhY2VdLGUpfTphLHM9cFtyXT9jb25zb2xlW3JdOmEsdT1mW3JdP2Z1bmN0aW9uKGUpe3JldHVybiB0LnB1c2goe3R5cGU6cixhcmdzOmV9KX06YTtyZXR1cm4gZVtyXT1mdW5jdGlvbigpe2Zvcih2YXIgZT1bXSxuPTA7bjxhcmd1bWVudHMubGVuZ3RoO24rKyllW25dPWFyZ3VtZW50c1tuXTt2YXIgdD1vKGUpO3MuYXBwbHkodm9pZCAwLHQpLHUodCl9LGV9KSx7Z2V0TWVzc2FnZXM6ZnVuY3Rpb24oZSl7cmV0dXJuIHQuZ2V0TWVzc2FnZXMoZSl9fSl9LGY9XCIxLjAuMFwiO2Z1bmN0aW9uIGwoZSxuKXtzd2l0Y2goZSl7Y2FzZVwicHJvZHVjdGlvblwiOnJldHVybiBpKGkoe30sbykse2tlZXBNZXNzYWdlVHlwZXM6W1wiZXJyb3JcIl0sbG9nTWVzc2FnZVR5cGVzOltdLG5hbWVzcGFjZTpufSk7Y2FzZVwiZXJyb3JcIjpyZXR1cm4gaShpKHt9LG8pLHtrZWVwTWVzc2FnZVR5cGVzOltcIndhcm5cIixcImVycm9yXCJdLGxvZ01lc3NhZ2VUeXBlczpbXCJlcnJvclwiXSxuYW1lc3BhY2U6bn0pO2Nhc2VcInZlcmJvc2VcIjpyZXR1cm4gaShpKHt9LG8pLHtrZWVwTWVzc2FnZVR5cGVzOltdLGxvZ01lc3NhZ2VUeXBlczpyLnNsaWNlKCksbmFtZXNwYWNlOm59KX19bi5kZWZhdWx0PXB9XSl9KSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmZldGNoQWRkcmVzc2VzID0gZXhwb3J0cy5mZXRjaFB1YmxpY0tleSA9IGV4cG9ydHMuZmV0Y2hTZWVkID0gZXhwb3J0cy5mZXRjaFNlcSA9IGV4cG9ydHMuZmV0Y2hFZmZlY3RpdmVCYWxhbmNlID0gZXhwb3J0cy5mZXRjaEVmZmVjdGl2ZUJhbGFuY2VDb25maXJtYXRpb25zID0gZXhwb3J0cy5mZXRjaEJhbGFuY2UgPSBleHBvcnRzLmZldGNoVmFsaWRhdGUgPSBleHBvcnRzLmRhdGEgPSBleHBvcnRzLmZldGNoU2NyaXB0SW5mbyA9IGV4cG9ydHMuZmV0Y2hCYWxhbmNlQ29uZmlybWF0aW9ucyA9IGV4cG9ydHMuZmV0Y2hCYWxhbmNlRGV0YWlscyA9IGV4cG9ydHMuZmV0Y2hTY3JpcHRJbmZvTWV0YSA9IGV4cG9ydHMuZmV0Y2hEYXRhS2V5ID0gdm9pZCAwO1xudmFyIHJlcXVlc3RfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vLi4vdG9vbHMvcmVxdWVzdFwiKSk7XG52YXIgcXVlcnlfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vLi4vdG9vbHMvcXVlcnlcIikpO1xuZnVuY3Rpb24gZmV0Y2hEYXRhS2V5KGJhc2UsIGFkZHJlc3MsIGtleSwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7IH1cbiAgICByZXR1cm4gcmVxdWVzdF8xLmRlZmF1bHQoe1xuICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICB1cmw6IFwiL2FkZHJlc3Nlcy9kYXRhL1wiICsgYWRkcmVzcyArIFwiL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KGtleSksXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hEYXRhS2V5ID0gZmV0Y2hEYXRhS2V5O1xuZnVuY3Rpb24gZmV0Y2hTY3JpcHRJbmZvTWV0YShiYXNlLCBhZGRyZXNzKSB7XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiBcIi9hZGRyZXNzZXMvc2NyaXB0SW5mby9cIiArIGFkZHJlc3MgKyBcIi9tZXRhXCJcbiAgICB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hTY3JpcHRJbmZvTWV0YSA9IGZldGNoU2NyaXB0SW5mb01ldGE7XG5mdW5jdGlvbiBmZXRjaEJhbGFuY2VEZXRhaWxzKGJhc2UsIGFkZHJlc3MsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpOyB9XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiBcIi9hZGRyZXNzZXMvYmFsYW5jZS9kZXRhaWxzL1wiICsgYWRkcmVzcyxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pO1xufVxuZXhwb3J0cy5mZXRjaEJhbGFuY2VEZXRhaWxzID0gZmV0Y2hCYWxhbmNlRGV0YWlscztcbmZ1bmN0aW9uIGZldGNoQmFsYW5jZUNvbmZpcm1hdGlvbnMoYmFzZSwgYWRkcmVzcywgY29uZmlybWF0aW9ucywgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7IH1cbiAgICByZXR1cm4gcmVxdWVzdF8xLmRlZmF1bHQoe1xuICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICB1cmw6IFwiL2FkZHJlc3Nlcy9iYWxhbmNlL1wiICsgYWRkcmVzcyArIFwiL1wiICsgY29uZmlybWF0aW9ucyxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pO1xufVxuZXhwb3J0cy5mZXRjaEJhbGFuY2VDb25maXJtYXRpb25zID0gZmV0Y2hCYWxhbmNlQ29uZmlybWF0aW9ucztcbmZ1bmN0aW9uIGZldGNoU2NyaXB0SW5mbyhiYXNlLCBhZGRyZXNzLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7XG4gICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgIHVybDogXCIvYWRkcmVzc2VzL3NjcmlwdEluZm8vXCIgKyBhZGRyZXNzLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfSk7XG59XG5leHBvcnRzLmZldGNoU2NyaXB0SW5mbyA9IGZldGNoU2NyaXB0SW5mbztcbmZ1bmN0aW9uIGRhdGEoYmFzZSwgYWRkcmVzcywgcGFyYW1zLCBvcHRpb25zKSB7XG4gICAgaWYgKHBhcmFtcyA9PT0gdm9pZCAwKSB7IHBhcmFtcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7IH1cbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpOyB9XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiBcIi9hZGRyZXNzZXMvZGF0YS9cIiArIGFkZHJlc3MgKyBxdWVyeV8xLmRlZmF1bHQocGFyYW1zKSxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pO1xufVxuZXhwb3J0cy5kYXRhID0gZGF0YTtcbmZ1bmN0aW9uIGZldGNoVmFsaWRhdGUoYmFzZSwgYWRkcmVzcykge1xuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7XG4gICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgIHVybDogXCIvYWRkcmVzc2VzL3ZhbGlkYXRlL1wiICsgYWRkcmVzc1xuICAgIH0pO1xufVxuZXhwb3J0cy5mZXRjaFZhbGlkYXRlID0gZmV0Y2hWYWxpZGF0ZTtcbmZ1bmN0aW9uIGZldGNoQmFsYW5jZShiYXNlLCBhZGRyZXNzLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7XG4gICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgIHVybDogXCIvYWRkcmVzc2VzL2JhbGFuY2UvXCIgKyBhZGRyZXNzLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfSk7XG59XG5leHBvcnRzLmZldGNoQmFsYW5jZSA9IGZldGNoQmFsYW5jZTtcbmZ1bmN0aW9uIGZldGNoRWZmZWN0aXZlQmFsYW5jZUNvbmZpcm1hdGlvbnMoYmFzZSwgYWRkcmVzcywgY29uZmlybWF0aW9ucywgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7IH1cbiAgICByZXR1cm4gcmVxdWVzdF8xLmRlZmF1bHQoe1xuICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICB1cmw6IFwiL2FkZHJlc3Nlcy9lZmZlY3RpdmVCYWxhbmNlL1wiICsgYWRkcmVzcyArIFwiL1wiICsgY29uZmlybWF0aW9ucyxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pO1xufVxuZXhwb3J0cy5mZXRjaEVmZmVjdGl2ZUJhbGFuY2VDb25maXJtYXRpb25zID0gZmV0Y2hFZmZlY3RpdmVCYWxhbmNlQ29uZmlybWF0aW9ucztcbmZ1bmN0aW9uIGZldGNoRWZmZWN0aXZlQmFsYW5jZShiYXNlLCBhZGRyZXNzLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7XG4gICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgIHVybDogXCIvYWRkcmVzc2VzL2VmZmVjdGl2ZUJhbGFuY2UvXCIgKyBhZGRyZXNzLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfSk7XG59XG5leHBvcnRzLmZldGNoRWZmZWN0aXZlQmFsYW5jZSA9IGZldGNoRWZmZWN0aXZlQmFsYW5jZTtcbmZ1bmN0aW9uIGZldGNoU2VxKGJhc2UsIGZyb20sIHRvKSB7XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiBcIi9hZGRyZXNzZXMvc2VxL1wiICsgZnJvbSArIFwiL1wiICsgdG9cbiAgICB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hTZXEgPSBmZXRjaFNlcTtcbmZ1bmN0aW9uIGZldGNoU2VlZChiYXNlLCBhZGRyZXNzKSB7XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiBcIi9hZGRyZXNzZXMvc2VlZC9cIiArIGFkZHJlc3NcbiAgICB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hTZWVkID0gZmV0Y2hTZWVkO1xuZnVuY3Rpb24gZmV0Y2hQdWJsaWNLZXkoYmFzZSwgcHVibGljS2V5KSB7XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiBcIi9hZGRyZXNzZXMvcHVibGljS2V5L1wiICsgcHVibGljS2V5XG4gICAgfSk7XG59XG5leHBvcnRzLmZldGNoUHVibGljS2V5ID0gZmV0Y2hQdWJsaWNLZXk7XG5mdW5jdGlvbiBmZXRjaEFkZHJlc3NlcyhiYXNlKSB7XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiAnL2FkZHJlc3NlcydcbiAgICB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hBZGRyZXNzZXMgPSBmZXRjaEFkZHJlc3Nlcztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZmV0Y2hCYWxhbmNlQWRkcmVzc0Fzc2V0SWQgPSBleHBvcnRzLmZldGNoQXNzZXRzQmFsYW5jZSA9IGV4cG9ydHMuZmV0Y2hBc3NldHNBZGRyZXNzTGltaXQgPSBleHBvcnRzLmZldGNoQXNzZXREaXN0cmlidXRpb24gPSBleHBvcnRzLmZldGNoQXNzZXRzRGV0YWlscyA9IGV4cG9ydHMuZmV0Y2hEZXRhaWxzID0gdm9pZCAwO1xudmFyIHRzX3R5cGVzXzEgPSByZXF1aXJlKFwiQHdhdmVzL3RzLXR5cGVzXCIpO1xudmFyIHJlcXVlc3RfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vLi4vdG9vbHMvcmVxdWVzdFwiKSk7XG52YXIgdXRpbHNfMSA9IHJlcXVpcmUoXCIuLi8uLi90b29scy91dGlsc1wiKTtcbmZ1bmN0aW9uIGZldGNoRGV0YWlscyhiYXNlLCBhc3NldElkLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHZhciBpc09uY2UgPSAhQXJyYXkuaXNBcnJheShhc3NldElkKTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodXRpbHNfMS50b0FycmF5KGFzc2V0SWQpLm1hcChmdW5jdGlvbiAoaWQpIHsgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiBcIi9hc3NldHMvZGV0YWlscy9cIiArIGlkLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfSk7IH0pKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAobGlzdCkgeyByZXR1cm4gaXNPbmNlID8gbGlzdFswXSA6IGxpc3Q7IH0pO1xufVxuZXhwb3J0cy5mZXRjaERldGFpbHMgPSBmZXRjaERldGFpbHM7XG4vKipcbiAqIEdFVCAvYXNzZXRzL2RldGFpbHNcbiAqIFByb3ZpZGVzIGRldGFpbGVkIGluZm9ybWF0aW9uIGFib3V0IHRoZSBnaXZlbiBhc3NldHNcbiAqL1xuZnVuY3Rpb24gZmV0Y2hBc3NldHNEZXRhaWxzKGJhc2UsIGFzc2V0SWRzLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHZhciBwYXJhbXMgPSBhc3NldElkc1xuICAgICAgICAubWFwKGZ1bmN0aW9uIChhc3NldElkKSB7IHJldHVybiBcImlkPVwiICsgYXNzZXRJZDsgfSlcbiAgICAgICAgLmpvaW4oJyYnKTtcbiAgICB2YXIgcXVlcnkgPSBhc3NldElkcy5sZW5ndGggPyBcIj9cIiArIHBhcmFtcyA6ICcnO1xuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7IGJhc2U6IGJhc2UsIHVybDogXCIvYXNzZXRzL2RldGFpbHNcIiArIHF1ZXJ5LCBvcHRpb25zOiBvcHRpb25zIH0pO1xufVxuZXhwb3J0cy5mZXRjaEFzc2V0c0RldGFpbHMgPSBmZXRjaEFzc2V0c0RldGFpbHM7XG5mdW5jdGlvbiBmZXRjaEFzc2V0RGlzdHJpYnV0aW9uKGJhc2UsIGFzc2V0SWQsIGhlaWdodCwgbGltaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpOyB9XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHsgYmFzZTogYmFzZSwgdXJsOiBcIi9hc3NldHMvXCIgKyBhc3NldElkICsgXCIvZGlzdHJpYnV0aW9uL1wiICsgaGVpZ2h0ICsgXCIvbGltaXQvXCIgKyBsaW1pdCwgb3B0aW9uczogb3B0aW9ucyB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hBc3NldERpc3RyaWJ1dGlvbiA9IGZldGNoQXNzZXREaXN0cmlidXRpb247XG4vKipcbiAqIFRPRE9cbiAqIEdFVCAvYXNzZXRzL3thc3NldElkfS9kaXN0cmlidXRpb25cbiAqIEFzc2V0IGJhbGFuY2UgZGlzdHJpYnV0aW9uXG4gKi9cbmZ1bmN0aW9uIGZldGNoQXNzZXRzQWRkcmVzc0xpbWl0KGJhc2UsIGFkZHJlc3MsIGxpbWl0LCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7IGJhc2U6IGJhc2UsIHVybDogXCJhc3NldHMvbmZ0L1wiICsgYWRkcmVzcyArIFwiL2xpbWl0L1wiICsgbGltaXQsIG9wdGlvbnM6IG9wdGlvbnMgfSk7XG59XG5leHBvcnRzLmZldGNoQXNzZXRzQWRkcmVzc0xpbWl0ID0gZmV0Y2hBc3NldHNBZGRyZXNzTGltaXQ7XG5mdW5jdGlvbiBmZXRjaEFzc2V0c0JhbGFuY2UoYmFzZSwgYWRkcmVzcywgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7IH1cbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBiYWxhbmNlc1Jlc3BvbnNlLCBhc3NldHNXaXRob3V0SXNzdWVUcmFuc2FjdGlvbiwgYXNzZXRzRGV0YWlsc1Jlc3BvbnNlO1xuICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gWzQgLyp5aWVsZCovLCByZXF1ZXN0XzEuZGVmYXVsdCh7IGJhc2U6IGJhc2UsIHVybDogXCIvYXNzZXRzL2JhbGFuY2UvXCIgKyBhZGRyZXNzLCBvcHRpb25zOiBvcHRpb25zIH0pXTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIGJhbGFuY2VzUmVzcG9uc2UgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIGFzc2V0c1dpdGhvdXRJc3N1ZVRyYW5zYWN0aW9uID0gYmFsYW5jZXNSZXNwb25zZS5iYWxhbmNlcy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgYmFsYW5jZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYmFsYW5jZS5pc3N1ZVRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjW2JhbGFuY2UuYXNzZXRJZF0gPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICAgICAgICAgIH0sIHt9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgZmV0Y2hBc3NldHNEZXRhaWxzKGJhc2UsIE9iamVjdC5rZXlzKGFzc2V0c1dpdGhvdXRJc3N1ZVRyYW5zYWN0aW9uKSwgb3B0aW9ucyldO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRzRGV0YWlsc1Jlc3BvbnNlID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICBhc3NldHNEZXRhaWxzUmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiAoYXNzZXREZXRhaWxzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJ2Vycm9yJyBpbiBhc3NldERldGFpbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXNzZXRJbmRleCA9IGFzc2V0c1dpdGhvdXRJc3N1ZVRyYW5zYWN0aW9uW2Fzc2V0RGV0YWlscy5hc3NldElkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhc3NldEJhbGFuY2UgPSBiYWxhbmNlc1Jlc3BvbnNlLmJhbGFuY2VzW2Fzc2V0SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhc3NldEJhbGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldEJhbGFuY2UuaXNzdWVUcmFuc2FjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogYXNzZXREZXRhaWxzLm9yaWdpblRyYW5zYWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYXNzZXREZXRhaWxzLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjaW1hbHM6IGFzc2V0RGV0YWlscy5kZWNpbWFscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYXNzZXREZXRhaWxzLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1YW50aXR5OiBhc3NldERldGFpbHMucXVhbnRpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVpc3N1YWJsZTogYXNzZXREZXRhaWxzLnJlaXNzdWFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VuZGVyOiBhc3NldERldGFpbHMuaXNzdWVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRlclB1YmxpY0tleTogYXNzZXREZXRhaWxzLmlzc3VlclB1YmxpY0tleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IGFzc2V0RGV0YWlscy5pc3N1ZVRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGFzc2V0RGV0YWlscy5pc3N1ZUhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQ6IGFzc2V0RGV0YWlscy5zY3JpcHRlZCA/ICctJyA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvb2ZzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmZWU6IE1hdGgucG93KDEwLCA4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmZWVBc3NldElkOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlcnNpb246IDMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogdHNfdHlwZXNfMS5UUkFOU0FDVElPTl9UWVBFLklTU1VFLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYWluSWQ6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgYmFsYW5jZXNSZXNwb25zZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuZXhwb3J0cy5mZXRjaEFzc2V0c0JhbGFuY2UgPSBmZXRjaEFzc2V0c0JhbGFuY2U7XG5mdW5jdGlvbiBmZXRjaEJhbGFuY2VBZGRyZXNzQXNzZXRJZChiYXNlLCBhZGRyZXNzLCBhc3NldElkLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7IGJhc2U6IGJhc2UsIHVybDogXCIvYXNzZXRzL2JhbGFuY2UvXCIgKyBhZGRyZXNzICsgXCIvXCIgKyBhc3NldElkLCBvcHRpb25zOiBvcHRpb25zIH0pO1xufVxuZXhwb3J0cy5mZXRjaEJhbGFuY2VBZGRyZXNzQXNzZXRJZCA9IGZldGNoQmFsYW5jZUFkZHJlc3NBc3NldElkO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmZldGNoSGVpZ2h0QnlUaW1lc3RhbXAgPSBleHBvcnRzLmZldGNoSGVpZ2h0ID0gZXhwb3J0cy5mZXRjaERlbGF5ID0gZXhwb3J0cy5mZXRjaExhc3QgPSBleHBvcnRzLmZldGNoQmxvY2tzQnlBZGRyZXNzID0gZXhwb3J0cy5mZXRjaEZpcnN0ID0gZXhwb3J0cy5mZXRjaEJsb2NrQnlJZCA9IGV4cG9ydHMuZmV0Y2hTZXEgPSBleHBvcnRzLmZldGNoQmxvY2tBdCA9IGV4cG9ydHMuZmV0Y2hIZWFkZXJzQnlJZCA9IGV4cG9ydHMuZmV0Y2hIZWFkZXJzQXQgPSBleHBvcnRzLmZldGNoSGVpZ2h0QnlJZCA9IGV4cG9ydHMuZmV0Y2hIZWFkZXJzTGFzdCA9IGV4cG9ydHMuZmV0Y2hIZWFkZXJzU2VxID0gdm9pZCAwO1xudmFyIHJlcXVlc3RfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vLi4vdG9vbHMvcmVxdWVzdFwiKSk7XG4vKipcbiAqIEdFVCAvYmxvY2tzL2hlYWRlcnMvc2VxL3tmcm9tfS97dG99XG4gKiBHZXQgYmxvY2sgaGVhZGVycyBhdCBzcGVjaWZpZWQgaGVpZ2h0c1xuICogQHBhcmFtIGJhc2VcbiAqIEBwYXJhbSBmcm9tXG4gKiBAcGFyYW0gdG9cbiAqL1xuZnVuY3Rpb24gZmV0Y2hIZWFkZXJzU2VxKGJhc2UsIGZyb20sIHRvLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7XG4gICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgIHVybDogXCIvYmxvY2tzL2hlYWRlcnMvc2VxL1wiICsgZnJvbSArIFwiL1wiICsgdG8sXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hIZWFkZXJzU2VxID0gZmV0Y2hIZWFkZXJzU2VxO1xuLyoqXG4gKiBHRVQgL2Jsb2Nrcy9oZWFkZXJzL2xhc3RcbiAqIExhc3QgYmxvY2sgaGVhZGVyXG4gKiBAcGFyYW0gYmFzZVxuICovXG5mdW5jdGlvbiBmZXRjaEhlYWRlcnNMYXN0KGJhc2UsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpOyB9XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiBcIi9ibG9ja3MvaGVhZGVycy9sYXN0XCIsXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hIZWFkZXJzTGFzdCA9IGZldGNoSGVhZGVyc0xhc3Q7XG4vKipcbiAqIEdFVCAvYmxvY2tzL2hlaWdodC97aWR9XG4gKiBIZWlnaHQgb2YgYSBibG9jayBieSBpdHMgaWRcbiAqIEBwYXJhbSBiYXNlXG4gKiBAcGFyYW0gaWRcbiAqL1xuZnVuY3Rpb24gZmV0Y2hIZWlnaHRCeUlkKGJhc2UsIGlkKSB7XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiBcIi9ibG9ja3MvaGVpZ2h0L1wiICsgaWRcbiAgICB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hIZWlnaHRCeUlkID0gZmV0Y2hIZWlnaHRCeUlkO1xuLyoqXG4gKiBHRVQgL2Jsb2Nrcy9oZWFkZXJzL2F0L3toZWlnaHR9XG4gKiBCbG9jayBoZWFkZXIgYXQgaGVpZ2h0XG4gKiBAcGFyYW0gYmFzZVxuICogQHBhcmFtIGhlaWdodFxuICovXG5mdW5jdGlvbiBmZXRjaEhlYWRlcnNBdChiYXNlLCBoZWlnaHQsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpOyB9XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiBcIi9ibG9ja3MvaGVhZGVycy9hdC9cIiArIGhlaWdodCxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pO1xufVxuZXhwb3J0cy5mZXRjaEhlYWRlcnNBdCA9IGZldGNoSGVhZGVyc0F0O1xuLyoqXG4gKiBHRVQgL2Jsb2Nrcy9oZWFkZXJzL3tpZH1cbiAqIEdldCBibG9jayBhdCBzcGVjaWZpZWQgaGVpZ2h0XG4gKiBAcGFyYW0gYmFzZVxuICogQHBhcmFtIGhlaWdodFxuICovXG5mdW5jdGlvbiBmZXRjaEhlYWRlcnNCeUlkKGJhc2UsIGlkLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7XG4gICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgIHVybDogXCIvYmxvY2tzL2hlYWRlcnMvXCIgKyBpZCxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pO1xufVxuZXhwb3J0cy5mZXRjaEhlYWRlcnNCeUlkID0gZmV0Y2hIZWFkZXJzQnlJZDtcbi8qKlxuICogR0VUIC9ibG9ja3MvYXQve2hlaWdodH1cbiAqIEdldCBibG9jayBhdCBzcGVjaWZpZWQgaGVpZ2h0XG4gKiBAcGFyYW0gYmFzZVxuICogQHBhcmFtIGhlaWdodFxuICovXG5mdW5jdGlvbiBmZXRjaEJsb2NrQXQoYmFzZSwgaGVpZ2h0LCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7XG4gICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgIHVybDogXCIvYmxvY2tzL2F0L1wiICsgaGVpZ2h0LFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfSk7XG59XG5leHBvcnRzLmZldGNoQmxvY2tBdCA9IGZldGNoQmxvY2tBdDtcbi8qKlxuICogR0VUIC9ibG9ja3Mvc2VxL3tmcm9tfS97dG99XG4gKiBCbG9jayByYW5nZVxuICogQHBhcmFtIGJhc2VcbiAqIEBwYXJhbSBmcm9tXG4gKiBAcGFyYW0gdG9cbiAqL1xuZnVuY3Rpb24gZmV0Y2hTZXEoYmFzZSwgZnJvbSwgdG8sIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpOyB9XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiBcIi9ibG9ja3Mvc2VxL1wiICsgZnJvbSArIFwiL1wiICsgdG8sXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hTZXEgPSBmZXRjaFNlcTtcbi8qKlxuICogR0VUIC9ibG9ja3Mve2lkfVxuICogR2V0IGJsb2NrIGJ5IGl0cyBpZFxuICogQHBhcmFtIGJhc2VcbiAqIEBwYXJhbSBpZFxuICovXG5mdW5jdGlvbiBmZXRjaEJsb2NrQnlJZChiYXNlLCBpZCwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7IH1cbiAgICByZXR1cm4gcmVxdWVzdF8xLmRlZmF1bHQoe1xuICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICB1cmw6IFwiL2Jsb2Nrcy9cIiArIGlkLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfSk7XG59XG5leHBvcnRzLmZldGNoQmxvY2tCeUlkID0gZmV0Y2hCbG9ja0J5SWQ7XG4vKipcbiAqIEdFVCAvYmxvY2tzL2ZpcnN0XG4gKiBHZXQgZ2VuZXNpcyBibG9ja1xuICogQHBhcmFtIGJhc2VcbiAqL1xuZnVuY3Rpb24gZmV0Y2hGaXJzdChiYXNlLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7XG4gICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgIHVybDogXCIvYmxvY2tzL2ZpcnN0XCIsXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hGaXJzdCA9IGZldGNoRmlyc3Q7XG4vKipcbiAqIC9ibG9ja3MvYWRkcmVzcy97YWRkcmVzc30ve2Zyb219L3t0b31cbiAqIEdldCBsaXN0IG9mIGJsb2NrcyBnZW5lcmF0ZWQgYnkgc3BlY2lmaWVkIGFkZHJlc3NcbiAqIEBwYXJhbSBiYXNlXG4gKiBAcGFyYW0gYWRkcmVzc1xuICogQHBhcmFtIGZyb21cbiAqIEBwYXJhbSB0b1xuICovXG5mdW5jdGlvbiBmZXRjaEJsb2Nrc0J5QWRkcmVzcyhiYXNlLCBhZGRyZXNzLCBmcm9tLCB0bywgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7IH1cbiAgICByZXR1cm4gcmVxdWVzdF8xLmRlZmF1bHQoe1xuICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICB1cmw6IFwiL2Jsb2Nrcy9hZGRyZXNzL1wiICsgYWRkcmVzcyArIFwiL1wiICsgZnJvbSArIFwiL1wiICsgdG8sXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hCbG9ja3NCeUFkZHJlc3MgPSBmZXRjaEJsb2Nrc0J5QWRkcmVzcztcbi8qKlxuICogR0VUIC9ibG9ja3MvbGFzdFxuICogTGFzdCBibG9ja1xuICogQHBhcmFtIGJhc2VcbiAqL1xuZnVuY3Rpb24gZmV0Y2hMYXN0KGJhc2UsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpOyB9XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiAnL2Jsb2Nrcy9sYXN0JyxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pO1xufVxuZXhwb3J0cy5mZXRjaExhc3QgPSBmZXRjaExhc3Q7XG4vKipcbiAqIEdFVCAvYmxvY2tzL2RlbGF5L3tpZH0ve2Jsb2NrTnVtfVxuICogQXZlcmFnZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgYmV0d2VlbiBsYXN0IGJsb2NrTnVtIGJsb2NrcyBzdGFydGluZyBmcm9tIGJsb2NrIHdpdGggaWRcbiAqIEBwYXJhbSBiYXNlXG4gKiBAcGFyYW0gaWRcbiAqIEBwYXJhbSBibG9ja051bVxuICovXG5mdW5jdGlvbiBmZXRjaERlbGF5KGJhc2UsIGlkLCBibG9ja051bSkge1xuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7XG4gICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgIHVybDogXCIvYmxvY2tzL2RlbGF5L1wiICsgaWQgKyBcIi9cIiArIGJsb2NrTnVtXG4gICAgfSk7XG59XG5leHBvcnRzLmZldGNoRGVsYXkgPSBmZXRjaERlbGF5O1xuLyoqXG4gKiBHRVQgL2Jsb2Nrcy9oZWlnaHRcbiAqIEBwYXJhbSBiYXNlXG4gKi9cbmZ1bmN0aW9uIGZldGNoSGVpZ2h0KGJhc2UpIHtcbiAgICByZXR1cm4gcmVxdWVzdF8xLmRlZmF1bHQoe1xuICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICB1cmw6ICcvYmxvY2tzL2hlaWdodCdcbiAgICB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hIZWlnaHQgPSBmZXRjaEhlaWdodDtcbi8qKlxuICogR0VUIC9ibG9ja3MvaGVpZ2h0QnlUaW1lc3RhbXBcbiAqIEBwYXJhbSBiYXNlXG4gKi9cbmZ1bmN0aW9uIGZldGNoSGVpZ2h0QnlUaW1lc3RhbXAoYmFzZSwgdGltZXN0YW1wLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7XG4gICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgIHVybDogXCIvYmxvY2tzL2hlaWdodEJ5VGltZXN0YW1wL1wiICsgdGltZXN0YW1wLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfSk7XG59XG5leHBvcnRzLmZldGNoSGVpZ2h0QnlUaW1lc3RhbXAgPSBmZXRjaEhlaWdodEJ5VGltZXN0YW1wO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hc3NpZ24gPSAodGhpcyAmJiB0aGlzLl9fYXNzaWduKSB8fCBmdW5jdGlvbiAoKSB7XG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKVxuICAgICAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH07XG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5icm9hZGNhc3QgPSBleHBvcnRzLmZldGNoU3RhdHVzID0gZXhwb3J0cy5mZXRjaEluZm8gPSBleHBvcnRzLmZldGNoVW5jb25maXJtZWRJbmZvID0gZXhwb3J0cy5mZXRjaFRyYW5zYWN0aW9ucyA9IGV4cG9ydHMuZmV0Y2hVbmNvbmZpcm1lZCA9IGV4cG9ydHMuZmV0Y2hDYWxjdWxhdGVGZWUgPSBleHBvcnRzLmZldGNoVW5jb25maXJtZWRTaXplID0gdm9pZCAwO1xudmFyIGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4uLy4uL2NvbnN0YW50c1wiKTtcbnZhciBibG9ja3NfMSA9IHJlcXVpcmUoXCIuLi9ibG9ja3NcIik7XG52YXIgcmVxdWVzdF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi8uLi90b29scy9yZXF1ZXN0XCIpKTtcbnZhciBxdWVyeV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuLi8uLi90b29scy9xdWVyeVwiKSk7XG52YXIgdXRpbHNfMSA9IHJlcXVpcmUoXCIuLi8uLi90b29scy91dGlsc1wiKTtcbnZhciBzdHJpbmdpZnlfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi4vLi4vdG9vbHMvc3RyaW5naWZ5XCIpKTtcbnZhciB0cmFuc2FjdGlvbnNfMSA9IHJlcXVpcmUoXCIuLi8uLi90b29scy90cmFuc2FjdGlvbnMvdHJhbnNhY3Rpb25zXCIpO1xuLyoqXG4gKiBHRVQgL3RyYW5zYWN0aW9ucy91bmNvbmZpcm1lZC9zaXplXG4gKiBOdW1iZXIgb2YgdW5jb25maXJtZWQgdHJhbnNhY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGZldGNoVW5jb25maXJtZWRTaXplKGJhc2UpIHtcbiAgICByZXR1cm4gcmVxdWVzdF8xLmRlZmF1bHQoe1xuICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICB1cmw6ICcvdHJhbnNhY3Rpb25zL3VuY29uZmlybWVkL3NpemUnXG4gICAgfSk7XG59XG5leHBvcnRzLmZldGNoVW5jb25maXJtZWRTaXplID0gZmV0Y2hVbmNvbmZpcm1lZFNpemU7XG4vLyBAVE9ETzogd2hlbiBjb3JyZWN0IEFQSSBrZXkgaXMgcmVjZWl2ZWRcbi8qKlxuICogUE9TVCAvdHJhbnNhY3Rpb25zL3NpZ24ve3NpZ25lckFkZHJlc3N9XG4gKiBTaWduIGEgdHJhbnNhY3Rpb24gd2l0aCBhIG5vbi1kZWZhdWx0IHByaXZhdGUga2V5XG4gKi9cbi8qKlxuICogUE9TVCAvdHJhbnNhY3Rpb25zL2NhbGN1bGF0ZUZlZVxuICogQ2FsY3VsYXRlIHRyYW5zYWN0aW9uIGZlZVxuICovXG5mdW5jdGlvbiBmZXRjaENhbGN1bGF0ZUZlZShiYXNlLCB0eCwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7IH1cbiAgICByZXR1cm4gcmVxdWVzdF8xLmRlZmF1bHQoe1xuICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICB1cmw6ICcvdHJhbnNhY3Rpb25zL2NhbGN1bGF0ZUZlZScsXG4gICAgICAgIG9wdGlvbnM6IHV0aWxzXzEuZGVlcEFzc2lnbihfX2Fzc2lnbih7fSwgb3B0aW9ucyksIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgYm9keTogc3RyaW5naWZ5XzEuZGVmYXVsdCh0eCksXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0pO1xufVxuZXhwb3J0cy5mZXRjaENhbGN1bGF0ZUZlZSA9IGZldGNoQ2FsY3VsYXRlRmVlO1xuLyoqXG4gKiBHRVQgL3RyYW5zYWN0aW9ucy91bmNvbmZpcm1lZFxuICogVW5jb25maXJtZWQgdHJhbnNhY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGZldGNoVW5jb25maXJtZWQoYmFzZSwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7IH1cbiAgICByZXR1cm4gcmVxdWVzdF8xLmRlZmF1bHQoe1xuICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICB1cmw6ICcvdHJhbnNhY3Rpb25zL3VuY29uZmlybWVkJyxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pO1xufVxuZXhwb3J0cy5mZXRjaFVuY29uZmlybWVkID0gZmV0Y2hVbmNvbmZpcm1lZDtcbi8qKlxuICog0KHQv9C40YHQvtC6INGC0YDQsNC90LfQsNC60YbQuNC5INC/0L4g0LDQtNGA0LXRgdGDXG4gKiBAcGFyYW0gYWRkcmVzc1xuICogQHBhcmFtIGxpbWl0ICAgICAg0LzQsNC60YHQuNC80LDQu9GM0L3QvtC1INC60L7Qu9C40YfQtdGB0YLQstC+INGC0YDQsNC90LfQsNC60YbQuNC5INCyINGA0LXQt9GD0LvRjNGC0LDRgtC1XG4gKiBAcGFyYW0gYWZ0ZXIgICAgICDQuNGB0LrQsNGC0Ywg0YLRgNCw0L3Qt9Cw0LrRhtC40Lgg0L/QvtGB0LvQtSBJRCDRg9C60LDQt9Cw0L3QvdC+0LPQviDQsiBhZnRlclxuICogQHBhcmFtIHJldHJ5ICAgICAg0LrQvtC70LjRh9C10YHRgtCy0L4g0L/QvtC/0YvRgtC+0Log0L3QsCDQstGL0L/QvtC70L3QtdC90LjQtSDQt9Cw0L/RgNC+0YHQsFxuICovXG5mdW5jdGlvbiBmZXRjaFRyYW5zYWN0aW9ucyhiYXNlLCBhZGRyZXNzLCBsaW1pdCwgYWZ0ZXIsIHJldHJ5LCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7XG4gICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgIHVybDogXCIvdHJhbnNhY3Rpb25zL2FkZHJlc3MvXCIgKyBhZGRyZXNzICsgXCIvbGltaXQvXCIgKyBsaW1pdCArIHF1ZXJ5XzEuZGVmYXVsdCh7IGFmdGVyOiBhZnRlciB9KSxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgIHZhciBsaXN0ID0gX2FbMF07XG4gICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAodHJhbnNhY3Rpb24pIHsgcmV0dXJuIHRyYW5zYWN0aW9uc18xLmFkZFN0YXRlVXBkYXRlRmllbGQodHJhbnNhY3Rpb24pOyB9KTtcbiAgICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfSk7XG59XG5leHBvcnRzLmZldGNoVHJhbnNhY3Rpb25zID0gZmV0Y2hUcmFuc2FjdGlvbnM7XG4vKipcbiAqIEdFVCAvdHJhbnNhY3Rpb25zL3VuY29uZmlybWVkL2luZm8ve2lkfVxuICogVW5jb25maXJtZWQgdHJhbnNhY3Rpb24gaW5mb1xuICovXG5mdW5jdGlvbiBmZXRjaFVuY29uZmlybWVkSW5mbyhiYXNlLCBpZCwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7IH1cbiAgICByZXR1cm4gcmVxdWVzdF8xLmRlZmF1bHQoe1xuICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICB1cmw6IFwiL3RyYW5zYWN0aW9ucy91bmNvbmZpcm1lZC9pbmZvL1wiICsgaWQsXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9KTtcbn1cbmV4cG9ydHMuZmV0Y2hVbmNvbmZpcm1lZEluZm8gPSBmZXRjaFVuY29uZmlybWVkSW5mbztcbi8vIEBUT0RPIHdoZW4gY29ycmVjdCBBUEkga2V5IGlzIHJlY2VpdmVkXG4vKipcbiAqIFBPU1QgL3RyYW5zYWN0aW9ucy9zaWduXG4gKiBTaWduIGEgdHJhbnNhY3Rpb25cbiAqL1xuLyoqXG4gKiBHRVQgL3RyYW5zYWN0aW9ucy9pbmZvL3tpZH1cbiAqIFRyYW5zYWN0aW9uIGluZm9cbiAqL1xuZnVuY3Rpb24gZmV0Y2hJbmZvKGJhc2UsIGlkLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHJldHVybiByZXF1ZXN0XzEuZGVmYXVsdCh7XG4gICAgICAgIGJhc2U6IGJhc2UsXG4gICAgICAgIHVybDogXCIvdHJhbnNhY3Rpb25zL2luZm8vXCIgKyBpZCxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHRyYW5zYWN0aW9uKSB7IHJldHVybiB0cmFuc2FjdGlvbnNfMS5hZGRTdGF0ZVVwZGF0ZUZpZWxkKHRyYW5zYWN0aW9uKTsgfSk7XG59XG5leHBvcnRzLmZldGNoSW5mbyA9IGZldGNoSW5mbztcbmZ1bmN0aW9uIGZldGNoU3RhdHVzKGJhc2UsIGxpc3QpIHtcbiAgICB2YXIgREVGQVVMVF9TVEFUVVMgPSB7XG4gICAgICAgIGlkOiAnJyxcbiAgICAgICAgY29uZmlybWF0aW9uczogLTEsXG4gICAgICAgIGhlaWdodDogLTEsXG4gICAgICAgIGluVVRYOiBmYWxzZSxcbiAgICAgICAgc3RhdHVzOiBjb25zdGFudHNfMS5UUkFOU0FDVElPTl9TVEFUVVNFUy5OT1RfRk9VTkRcbiAgICB9O1xuICAgIHZhciBsb2FkQWxsVHhJbmZvID0gbGlzdC5tYXAoZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHJldHVybiBmZXRjaFVuY29uZmlybWVkSW5mbyhiYXNlLCBpZClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIChfX2Fzc2lnbihfX2Fzc2lnbih7fSwgREVGQVVMVF9TVEFUVVMpLCB7IGlkOiBpZCwgc3RhdHVzOiBjb25zdGFudHNfMS5UUkFOU0FDVElPTl9TVEFUVVNFUy5VTkNPTkZJUk1FRCwgaW5VVFg6IHRydWUgfSkpOyB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZldGNoSW5mbyhiYXNlLCBpZClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh0eCkgeyByZXR1cm4gKF9fYXNzaWduKF9fYXNzaWduKHt9LCBERUZBVUxUX1NUQVRVUyksIHsgaWQ6IGlkLCBzdGF0dXM6IGNvbnN0YW50c18xLlRSQU5TQUNUSU9OX1NUQVRVU0VTLklOX0JMT0NLQ0hBSU4sIGhlaWdodDogdHguaGVpZ2h0LCBhcHBsaWNhdGlvblN0YXR1czogdHguYXBwbGljYXRpb25TdGF0dXMgfSkpOyB9KTsgfSlcbiAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7IHJldHVybiAoX19hc3NpZ24oX19hc3NpZ24oe30sIERFRkFVTFRfU1RBVFVTKSwgeyBpZDogaWQgfSkpOyB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICBibG9ja3NfMS5mZXRjaEhlaWdodChiYXNlKSxcbiAgICAgICAgUHJvbWlzZS5hbGwobG9hZEFsbFR4SW5mbylcbiAgICBdKS50aGVuKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICB2YXIgaGVpZ2h0ID0gX2FbMF0uaGVpZ2h0LCBzdGF0dXNlcyA9IF9hWzFdO1xuICAgICAgICByZXR1cm4gKHtcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgc3RhdHVzZXM6IHN0YXR1c2VzLm1hcChmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gKF9fYXNzaWduKF9fYXNzaWduKHt9LCBpdGVtKSwgeyBjb25maXJtYXRpb25zOiBpdGVtLnN0YXR1cyA9PT0gY29uc3RhbnRzXzEuVFJBTlNBQ1RJT05fU1RBVFVTRVMuSU5fQkxPQ0tDSEFJTiA/IGhlaWdodCAtIGl0ZW0uaGVpZ2h0IDogaXRlbS5jb25maXJtYXRpb25zIH0pKTsgfSlcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5leHBvcnRzLmZldGNoU3RhdHVzID0gZmV0Y2hTdGF0dXM7XG5mdW5jdGlvbiBicm9hZGNhc3QoYmFzZSwgdHgsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpOyB9XG4gICAgcmV0dXJuIHJlcXVlc3RfMS5kZWZhdWx0KHtcbiAgICAgICAgYmFzZTogYmFzZSxcbiAgICAgICAgdXJsOiAnL3RyYW5zYWN0aW9ucy9icm9hZGNhc3QnLFxuICAgICAgICBvcHRpb25zOiB1dGlsc18xLmRlZXBBc3NpZ24oX19hc3NpZ24oe30sIG9wdGlvbnMpLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IHN0cmluZ2lmeV8xLmRlZmF1bHQodHgpLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9KTtcbn1cbmV4cG9ydHMuYnJvYWRjYXN0ID0gYnJvYWRjYXN0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlRSQU5TQUNUSU9OX1NUQVRVU0VTID0gZXhwb3J0cy5OQU1FX01BUCA9IGV4cG9ydHMuVFlQRV9NQVAgPSB2b2lkIDA7XG5leHBvcnRzLlRZUEVfTUFQID0ge1xuICAgIDM6ICdpc3N1ZScsXG4gICAgNDogJ3RyYW5zZmVyJyxcbiAgICA1OiAncmVpc3N1ZScsXG4gICAgNjogJ2J1cm4nLFxuICAgIDc6ICdleGNoYW5nZScsXG4gICAgODogJ2xlYXNlJyxcbiAgICA5OiAnY2FuY2VsTGVhc2UnLFxuICAgIDEwOiAnYWxpYXMnLFxuICAgIDExOiAnbWFzc1RyYW5zZmVyJyxcbiAgICAxMjogJ2RhdGEnLFxuICAgIDEzOiAnc2V0U2NyaXB0JyxcbiAgICAxNDogJ3Nwb25zb3JzaGlwJyxcbiAgICAxNTogJ3NldEFzc2V0U2NyaXB0JyxcbiAgICAxNjogJ2ludm9rZScsXG4gICAgMTc6ICd1cGRhdGVBc3NldCdcbn07XG5leHBvcnRzLk5BTUVfTUFQID0ge1xuICAgICdpc3N1ZSc6IDMsXG4gICAgJ3RyYW5zZmVyJzogNCxcbiAgICAncmVpc3N1ZSc6IDUsXG4gICAgJ2J1cm4nOiA2LFxuICAgICdleGNoYW5nZSc6IDcsXG4gICAgJ2xlYXNlJzogOCxcbiAgICAnY2FuY2VsTGVhc2UnOiA5LFxuICAgICdhbGlhcyc6IDEwLFxuICAgICdtYXNzVHJhbnNmZXInOiAxMSxcbiAgICAnZGF0YSc6IDEyLFxuICAgICdzZXRTY3JpcHQnOiAxMyxcbiAgICAnc3BvbnNvcnNoaXAnOiAxNCxcbiAgICAnc2V0QXNzZXRTY3JpcHQnOiAxNSxcbiAgICAnaW52b2tlJzogMTYsXG4gICAgJ3VwZGF0ZUFzc2V0JzogMTdcbn07XG5leHBvcnRzLlRSQU5TQUNUSU9OX1NUQVRVU0VTID0ge1xuICAgIElOX0JMT0NLQ0hBSU46ICdpbl9ibG9ja2NoYWluJyxcbiAgICBVTkNPTkZJUk1FRDogJ3VuY29uZmlybWVkJyxcbiAgICBOT1RfRk9VTkQ6ICdub3RfZm91bmQnXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29uc3RhbnRzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGJsb2Nrc18xID0gcmVxdWlyZShcIi4uLy4uL2FwaS1ub2RlL2Jsb2Nrc1wiKTtcbmZ1bmN0aW9uIGRlZmF1bHRfMShiYXNlKSB7XG4gICAgcmV0dXJuIGJsb2Nrc18xLmZldGNoSGVhZGVyc0xhc3QoYmFzZSkudGhlbihmdW5jdGlvbiAoaGVhZGVyKSB7IHJldHVybiBiYXNlNThEZWNvZGUoaGVhZGVyLmdlbmVyYXRvcilbMV07IH0pO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gZGVmYXVsdF8xO1xudmFyIEFMUEhBQkVUID0gJzEyMzQ1Njc4OUFCQ0RFRkdISktMTU5QUVJTVFVWV1hZWmFiY2RlZmdoaWprbW5vcHFyc3R1dnd4eXonO1xudmFyIEFMUEhBQkVUX01BUCA9IHt9O1xuZm9yICh2YXIgaSA9IDA7IGkgPCBBTFBIQUJFVC5sZW5ndGg7IGkrKykge1xuICAgIEFMUEhBQkVUX01BUFtBTFBIQUJFVC5jaGFyQXQoaSldID0gaTtcbn1cbmZ1bmN0aW9uIGJhc2U1OERlY29kZShzdHJpbmcpIHtcbiAgICB2YXIgYnl0ZXMsIGMsIGNhcnJ5LCBqLCBpO1xuICAgIGlmIChzdHJpbmcubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheSgwKTtcbiAgICB9XG4gICAgaSA9IHZvaWQgMDtcbiAgICBqID0gdm9pZCAwO1xuICAgIGJ5dGVzID0gWzBdO1xuICAgIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgc3RyaW5nLmxlbmd0aCkge1xuICAgICAgICBjID0gc3RyaW5nW2ldO1xuICAgICAgICBpZiAoIShjIGluIEFMUEhBQkVUX01BUCkpIHtcbiAgICAgICAgICAgIHRocm93ICdCYXNlNTguZGVjb2RlIHJlY2VpdmVkIHVuYWNjZXB0YWJsZSBpbnB1dC4gQ2hhcmFjdGVyIFxcJycgKyBjICsgJ1xcJyBpcyBub3QgaW4gdGhlIEJhc2U1OCBhbHBoYWJldC4nO1xuICAgICAgICB9XG4gICAgICAgIGogPSAwO1xuICAgICAgICB3aGlsZSAoaiA8IGJ5dGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgYnl0ZXNbal0gKj0gNTg7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cbiAgICAgICAgYnl0ZXNbMF0gKz0gQUxQSEFCRVRfTUFQW2NdO1xuICAgICAgICBjYXJyeSA9IDA7XG4gICAgICAgIGogPSAwO1xuICAgICAgICB3aGlsZSAoaiA8IGJ5dGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgYnl0ZXNbal0gKz0gY2Fycnk7XG4gICAgICAgICAgICBjYXJyeSA9IGJ5dGVzW2pdID4+IDg7XG4gICAgICAgICAgICBieXRlc1tqXSAmPSAweGZmO1xuICAgICAgICAgICAgKytqO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChjYXJyeSkge1xuICAgICAgICAgICAgYnl0ZXMucHVzaChjYXJyeSAmIDB4ZmYpO1xuICAgICAgICAgICAgY2FycnkgPj49IDg7XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgIH1cbiAgICBpID0gMDtcbiAgICB3aGlsZSAoc3RyaW5nW2ldID09PSAnMScgJiYgaSA8IHN0cmluZy5sZW5ndGggLSAxKSB7XG4gICAgICAgIGJ5dGVzLnB1c2goMCk7XG4gICAgICAgIGkrKztcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ5dGVzLnJldmVyc2UoKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZXROZXR3b3JrQnl0ZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciByZWcgPSBuZXcgUmVnRXhwKCcoKD8hXFxcXFxcXFwpXCJcXFxcdytcIik6XFxcXHMqKC0/W1xcXFxkfFxcXFwuXXsxNCx9KScsICdnJyk7XG5mdW5jdGlvbiBkZWZhdWx0XzEoanNvbikge1xuICAgIHJldHVybiBKU09OLnBhcnNlKGpzb24ucmVwbGFjZShyZWcsIFwiJDE6XFxcIiQyXFxcIlwiKSk7XG59XG5leHBvcnRzLmRlZmF1bHQgPSBkZWZhdWx0XzE7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJzZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIGRlZmF1bHRfMShwYXJhbXMsIGV2b2x2ZXIpIHtcbiAgICBpZiAoZXZvbHZlciA9PT0gdm9pZCAwKSB7IGV2b2x2ZXIgPSBPYmplY3QuY3JlYXRlKG51bGwpOyB9XG4gICAgdmFyIHF1ZXJ5ID0gT2JqZWN0LmtleXMocGFyYW1zKVxuICAgICAgICAubWFwKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIFtrZXksIHBhcmFtc1trZXldXTsgfSlcbiAgICAgICAgLm1hcChmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgdmFyIGtleSA9IF9hWzBdLCB2YWx1ZSA9IF9hWzFdO1xuICAgICAgICByZXR1cm4gW2tleSwgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV2b2x2ZXIsIGtleSkgPyBldm9sdmVyW2tleV0odmFsdWUpIDogdmFsdWVdO1xuICAgIH0pXG4gICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgIHZhciBrZXkgPSBfYVswXSwgdmFsdWUgPSBfYVsxXTtcbiAgICAgICAgcmV0dXJuIHZhbHVlICE9IG51bGw7XG4gICAgfSlcbiAgICAgICAgLm1hcChmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgdmFyIGtleSA9IF9hWzBdLCB2YWx1ZSA9IF9hWzFdO1xuICAgICAgICByZXR1cm4ga2V5ICsgXCI9XCIgKyB2YWx1ZTtcbiAgICB9KVxuICAgICAgICAuam9pbignJicpO1xuICAgIHJldHVybiBxdWVyeS5sZW5ndGggPyBcIj9cIiArIHF1ZXJ5IDogJyc7XG59XG5leHBvcnRzLmRlZmF1bHQgPSBkZWZhdWx0XzE7XG47XG4vLyMgc291cmNlTWFwcGluZ1VSTD1xdWVyeS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgcmVzb2x2ZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3Jlc29sdmVcIikpO1xudmFyIHBhcnNlXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vcGFyc2VcIikpO1xudmFyIHJlcXVlc3QgPSB0eXBlb2YgZmV0Y2ggPT09ICdmdW5jdGlvbicgPyBmZXRjaCA6IHJlcXVpcmUoJ25vZGUtZmV0Y2gnKTtcbmZ1bmN0aW9uIGRlZmF1bHRfMShwYXJhbXMpIHtcbiAgICByZXR1cm4gcmVxdWVzdChyZXNvbHZlXzEuZGVmYXVsdChwYXJhbXMudXJsLCBwYXJhbXMuYmFzZSksIHVwZGF0ZUhlYWRlcnMocGFyYW1zLm9wdGlvbnMpKVxuICAgICAgICAudGhlbihwYXJzZVJlc3BvbnNlKTtcbn1cbmV4cG9ydHMuZGVmYXVsdCA9IGRlZmF1bHRfMTtcbmZ1bmN0aW9uIHBhcnNlUmVzcG9uc2Uocikge1xuICAgIHJldHVybiByLnRleHQoKS50aGVuKGZ1bmN0aW9uIChtZXNzYWdlKSB7IHJldHVybiByLm9rID8gcGFyc2VfMS5kZWZhdWx0KG1lc3NhZ2UpIDogUHJvbWlzZS5yZWplY3QodHJ5UGFyc2UobWVzc2FnZSkpOyB9KTtcbn1cbmZ1bmN0aW9uIHRyeVBhcnNlKG1lc3NhZ2UpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShtZXNzYWdlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgfVxufVxuZnVuY3Rpb24gdXBkYXRlSGVhZGVycyhvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgfVxuICAgIHJldHVybiBfX2Fzc2lnbih7IGNyZWRlbnRpYWxzOiAnaW5jbHVkZScgfSwgb3B0aW9ucyk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZXF1ZXN0LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gZGVmYXVsdF8xKHBhdGgsIGJhc2UpIHtcbiAgICByZXR1cm4gbmV3IFVSTChwYXRoLCBiYXNlKS50b1N0cmluZygpO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gZGVmYXVsdF8xO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVzb2x2ZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBGSUVMRFMgPSBbJ2Ftb3VudCcsICdtYXRjaGVyRmVlJywgJ3ByaWNlJywgJ2ZlZScsICdtaW5TcG9uc29yZWRBc3NldEZlZScsICdxdWFudGl0eScsICdzZWxsTWF0Y2hlckZlZScsICdidXlNYXRjaGVyRmVlJ107XG5mdW5jdGlvbiBkZWZhdWx0XzEoZGF0YSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoRklFTERTLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgICAgICAgIHJldHVybiBcIiFcIiArIHZhbHVlICsgXCIhXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAndmFsdWUnICYmIHRoaXNbJ3R5cGUnXSA9PT0gJ2ludGVnZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gXCIhXCIgKyB2YWx1ZSArIFwiIVwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfSwgMCkucmVwbGFjZSgvXCJcXCEoLT9cXGQrKVxcIVwiL2csICckMScpO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gZGVmYXVsdF8xO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RyaW5naWZ5LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXNzaWduID0gKHRoaXMgJiYgdGhpcy5fX2Fzc2lnbikgfHwgZnVuY3Rpb24gKCkge1xuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcbiAgICAgICAgICAgICAgICB0W3BdID0gc1twXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9O1xuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciB0cmFuc2FjdGlvbnNfMSA9IHJlcXVpcmUoXCIuLi8uLi9hcGktbm9kZS90cmFuc2FjdGlvbnNcIik7XG52YXIgdXRpbHNfMSA9IHJlcXVpcmUoXCIuLi91dGlsc1wiKTtcbnZhciB3YWl0XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vd2FpdFwiKSk7XG52YXIgREVGQVVMVF9CUk9BRENBU1RfT1BUSU9OUyA9IHtcbiAgICBjaGFpbjogZmFsc2UsXG4gICAgY29uZmlybWF0aW9uczogLTEsXG4gICAgbWF4V2FpdFRpbWU6IDAsXG4gICAgcmVxdWVzdEludGVydmFsOiAwXG59O1xuZnVuY3Rpb24gZGVmYXVsdF8xKGJhc2UsIGxpc3QsIG9wdGlvbnMpIHtcbiAgICB2YXIgb3B0ID0gX19hc3NpZ24oX19hc3NpZ24oe30sIERFRkFVTFRfQlJPQURDQVNUX09QVElPTlMpLCAob3B0aW9ucyB8fCB7fSkpO1xuICAgIHZhciBpc09uY2UgPSAhQXJyYXkuaXNBcnJheShsaXN0KTtcbiAgICB2YXIgY29uZmlybWF0aW9ucyA9IG9wdC5jb25maXJtYXRpb25zID4gMCA/IDEgOiAwO1xuICAgIHJldHVybiAob3B0LmNoYWluXG4gICAgICAgID8gY2hhaW5Ccm9hZGNhc3QoYmFzZSwgdXRpbHNfMS50b0FycmF5KGxpc3QpLCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgb3B0KSwgeyBjb25maXJtYXRpb25zOiBjb25maXJtYXRpb25zIH0pKVxuICAgICAgICA6IHNpbXBsZUJyb2FkY2FzdChiYXNlLCB1dGlsc18xLnRvQXJyYXkobGlzdCkpKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAobGlzdCkgeyByZXR1cm4gb3B0LmNvbmZpcm1hdGlvbnMgPD0gMCA/IGxpc3QgOiB3YWl0XzEuZGVmYXVsdChiYXNlLCBsaXN0LCBvcHQpOyB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAobGlzdCkgeyByZXR1cm4gaXNPbmNlID8gdXRpbHNfMS5oZWFkKGxpc3QpIDogbGlzdDsgfSk7XG59XG5leHBvcnRzLmRlZmF1bHQgPSBkZWZhdWx0XzE7XG5mdW5jdGlvbiBzaW1wbGVCcm9hZGNhc3QoYmFzZSwgbGlzdCkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChsaXN0Lm1hcChmdW5jdGlvbiAodHgpIHsgcmV0dXJuIHRyYW5zYWN0aW9uc18xLmJyb2FkY2FzdChiYXNlLCB0eCk7IH0pKTtcbn1cbmZ1bmN0aW9uIGNoYWluQnJvYWRjYXN0KGJhc2UsIGxpc3QsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB2YXIgdG9Ccm9hZGNhc3QgPSBsaXN0LnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIHZhciBsb29wID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCF0b0Jyb2FkY2FzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdHggPSB0b0Jyb2FkY2FzdC5wb3AoKTtcbiAgICAgICAgICAgIHRyYW5zYWN0aW9uc18xLmJyb2FkY2FzdChiYXNlLCB0eClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodHgpIHsgcmV0dXJuIHdhaXRfMS5kZWZhdWx0KGJhc2UsIHR4LCBvcHRpb25zKTsgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodHgpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0eCk7XG4gICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgfTtcbiAgICAgICAgbG9vcCgpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YnJvYWRjYXN0LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXNzaWduID0gKHRoaXMgJiYgdGhpcy5fX2Fzc2lnbikgfHwgZnVuY3Rpb24gKCkge1xuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcbiAgICAgICAgICAgICAgICB0W3BdID0gc1twXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9O1xuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMubWFrZVN0YXRlVXBkYXRlID0gZXhwb3J0cy5hZGRTdGF0ZVVwZGF0ZUZpZWxkID0gdm9pZCAwO1xudmFyIGJpZ251bWJlcl8xID0gcmVxdWlyZShcIkB3YXZlcy9iaWdudW1iZXJcIik7XG52YXIgdHNfdHlwZXNfMSA9IHJlcXVpcmUoXCJAd2F2ZXMvdHMtdHlwZXNcIik7XG5mdW5jdGlvbiBhZGRTdGF0ZVVwZGF0ZUZpZWxkKHRyYW5zYWN0aW9uKSB7XG4gICAgaWYgKHRyYW5zYWN0aW9uLnR5cGUgPT09IHRzX3R5cGVzXzEuVFJBTlNBQ1RJT05fVFlQRS5JTlZPS0VfU0NSSVBUICYmIHRyYW5zYWN0aW9uLnN0YXRlQ2hhbmdlcy5pbnZva2VzICYmIHRyYW5zYWN0aW9uLnN0YXRlQ2hhbmdlcy5pbnZva2VzLmxlbmd0aCkge1xuICAgICAgICB2YXIgcGF5bWVudHNfMSA9IHRyYW5zYWN0aW9uLnBheW1lbnQgPyB0cmFuc2FjdGlvbi5wYXltZW50Lm1hcChmdW5jdGlvbiAocCkgeyByZXR1cm4gKHtcbiAgICAgICAgICAgIGFzc2V0SWQ6IHAuYXNzZXRJZCxcbiAgICAgICAgICAgIGFtb3VudDogcC5hbW91bnRcbiAgICAgICAgfSk7IH0pIDogW107XG4gICAgICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkodHJhbnNhY3Rpb24sICdzdGF0ZVVwZGF0ZScsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBtYWtlU3RhdGVVcGRhdGUodHJhbnNhY3Rpb24uc3RhdGVDaGFuZ2VzLCBwYXltZW50c18xLCB0cmFuc2FjdGlvbi5kQXBwLCB0cmFuc2FjdGlvbi5zZW5kZXIpOyB9IH0pO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIHJldHVybiB0cmFuc2FjdGlvbjtcbn1cbmV4cG9ydHMuYWRkU3RhdGVVcGRhdGVGaWVsZCA9IGFkZFN0YXRlVXBkYXRlRmllbGQ7XG5mdW5jdGlvbiBtYWtlU3RhdGVVcGRhdGUoc3RhdGVDaGFuZ2VzLCBwYXltZW50LCBkQXBwLCBzZW5kZXIpIHtcbiAgICB2YXIgcGF5bWVudHMgPSBwYXltZW50Lm1hcChmdW5jdGlvbiAocGF5bWVudCkgeyByZXR1cm4gKHsgcGF5bWVudDogcGF5bWVudCwgZEFwcDogZEFwcCwgc2VuZGVyOiBzZW5kZXIgfSk7IH0pO1xuICAgIHZhciBhZGRGaWVsZCA9IGZ1bmN0aW9uIChhcnJheSwgZmllbGROYW1lKSB7IHJldHVybiBhcnJheS5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICByZXR1cm4gKF9fYXNzaWduKF9fYXNzaWduKHt9LCBpdGVtKSwgKF9hID0ge30sIF9hW2ZpZWxkTmFtZV0gPSBkQXBwLCBfYSkpKTtcbiAgICB9KTsgfTtcbiAgICB2YXIgdHJhbnNmZXJzID0gYWRkRmllbGQoc3RhdGVDaGFuZ2VzLnRyYW5zZmVycywgJ3NlbmRlcicpO1xuICAgIHZhciBsZWFzZXMgPSBhZGRGaWVsZChzdGF0ZUNoYW5nZXMubGVhc2VzLCAnc2VuZGVyJyk7XG4gICAgdmFyIGlzc3VlcyA9IGFkZEZpZWxkKHN0YXRlQ2hhbmdlcy5pc3N1ZXMsICdhZGRyZXNzJyk7XG4gICAgdmFyIGRhdGEgPSBhZGRGaWVsZChzdGF0ZUNoYW5nZXMuZGF0YSwgJ2FkZHJlc3MnKTtcbiAgICB2YXIgcmVpc3N1ZXMgPSBhZGRGaWVsZChzdGF0ZUNoYW5nZXMucmVpc3N1ZXMsICdhZGRyZXNzJyk7XG4gICAgdmFyIGJ1cm5zID0gYWRkRmllbGQoc3RhdGVDaGFuZ2VzLmJ1cm5zLCAnYWRkcmVzcycpO1xuICAgIHZhciBzcG9uc29yRmVlcyA9IGFkZEZpZWxkKHN0YXRlQ2hhbmdlcy5zcG9uc29yRmVlcywgJ2FkZHJlc3MnKTtcbiAgICB2YXIgbGVhc2VDYW5jZWxzID0gYWRkRmllbGQoc3RhdGVDaGFuZ2VzLmxlYXNlQ2FuY2VscywgJ2FkZHJlc3MnKTtcbiAgICB2YXIgc3RhdGVVcGRhdGUgPSB7XG4gICAgICAgIHBheW1lbnRzOiBwYXltZW50cyxcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgdHJhbnNmZXJzOiB0cmFuc2ZlcnMsXG4gICAgICAgIHJlaXNzdWVzOiByZWlzc3VlcyxcbiAgICAgICAgaXNzdWVzOiBpc3N1ZXMsXG4gICAgICAgIGJ1cm5zOiBidXJucyxcbiAgICAgICAgc3BvbnNvckZlZXM6IHNwb25zb3JGZWVzLFxuICAgICAgICBsZWFzZXM6IGxlYXNlcyxcbiAgICAgICAgbGVhc2VDYW5jZWxzOiBsZWFzZUNhbmNlbHMsXG4gICAgfTtcbiAgICB2YXIgcmVjdXJzaXZlRnVuY3Rpb24gPSBmdW5jdGlvbiAoc3RhdGVDaGFuZ2VzLCBzZW5kZXIpIHtcbiAgICAgICAgaWYgKHN0YXRlQ2hhbmdlcy5pbnZva2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgc3RhdGVDaGFuZ2VzLmludm9rZXMuZm9yRWFjaChmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIC8vcGF5bWVudHNcbiAgICAgICAgICAgICAgICBpZiAoeC5wYXltZW50KVxuICAgICAgICAgICAgICAgICAgICB4LnBheW1lbnQuZm9yRWFjaChmdW5jdGlvbiAoeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gcGF5bWVudHMuZmluZEluZGV4KGZ1bmN0aW9uICh6KSB7IHJldHVybiAoei5wYXltZW50LmFzc2V0SWQgPT09IHkuYXNzZXRJZCkgJiYgKHouZEFwcCA9PT0geC5kQXBwKSAmJiAoc2VuZGVyID09PSB4LmRBcHApOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ICE9PSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gcGF5bWVudHNbaW5kZXhdLnBheW1lbnQuYW1vdW50ID0gKG5ldyBiaWdudW1iZXJfMS5CaWdOdW1iZXIocGF5bWVudHNbaW5kZXhdLnBheW1lbnQuYW1vdW50KSkuYWRkKHkuYW1vdW50KS50b051bWJlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBwYXltZW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF5bWVudDogeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VuZGVyOiBzZW5kZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRBcHA6IHguZEFwcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvL2RhdGFcbiAgICAgICAgICAgICAgICB4LnN0YXRlQ2hhbmdlcy5kYXRhLmZvckVhY2goZnVuY3Rpb24gKHkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gc3RhdGVVcGRhdGUuZGF0YS5maW5kSW5kZXgoZnVuY3Rpb24gKHopIHsgcmV0dXJuIHoua2V5ID09PSB5LmtleSAmJiB6LmFkZHJlc3MgPT09IHguZEFwcDsgfSk7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICE9PSAtMSA/IHN0YXRlVXBkYXRlLmRhdGFbaW5kZXhdID0gX19hc3NpZ24oX19hc3NpZ24oe30sIHkpLCB7IGFkZHJlc3M6IHguZEFwcCB9KSA6IHN0YXRlVXBkYXRlLmRhdGEucHVzaChfX2Fzc2lnbihfX2Fzc2lnbih7fSwgeSksIHsgYWRkcmVzczogeC5kQXBwIH0pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvL2J1cm5zXG4gICAgICAgICAgICAgICAgeC5zdGF0ZUNoYW5nZXMuYnVybnMuZm9yRWFjaChmdW5jdGlvbiAoeSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBzdGF0ZVVwZGF0ZS5idXJucy5maW5kSW5kZXgoZnVuY3Rpb24gKHopIHsgcmV0dXJuIHouYXNzZXRJZCA9PT0geS5hc3NldElkOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggIT09IC0xID8gc3RhdGVVcGRhdGUuYnVybnNbaW5kZXhdLnF1YW50aXR5ICs9IHkucXVhbnRpdHkgOiBzdGF0ZVVwZGF0ZS5idXJucy5wdXNoKF9fYXNzaWduKF9fYXNzaWduKHt9LCB5KSwgeyBhZGRyZXNzOiB4LmRBcHAgfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vaXNzdWVzXG4gICAgICAgICAgICAgICAgeC5zdGF0ZUNoYW5nZXMuaXNzdWVzLmZvckVhY2goZnVuY3Rpb24gKHkpIHsgcmV0dXJuIHN0YXRlVXBkYXRlLmlzc3Vlcy5wdXNoKF9fYXNzaWduKF9fYXNzaWduKHt9LCB5KSwgeyBhZGRyZXNzOiB4LmRBcHAgfSkpOyB9KTtcbiAgICAgICAgICAgICAgICAvL3JlaXNzdWVzXG4gICAgICAgICAgICAgICAgeC5zdGF0ZUNoYW5nZXMucmVpc3N1ZXMuZm9yRWFjaChmdW5jdGlvbiAoeSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBzdGF0ZVVwZGF0ZS5yZWlzc3Vlcy5maW5kSW5kZXgoZnVuY3Rpb24gKHopIHsgcmV0dXJuIHouYXNzZXRJZCA9PT0geS5hc3NldElkOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggIT09IC0xID8gc3RhdGVVcGRhdGUucmVpc3N1ZXNbaW5kZXhdLnF1YW50aXR5ICs9IHkucXVhbnRpdHkgOiBzdGF0ZVVwZGF0ZS5yZWlzc3Vlcy5wdXNoKF9fYXNzaWduKF9fYXNzaWduKHt9LCB5KSwgeyBhZGRyZXNzOiB4LmRBcHAgfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vdHJhbnNmZXJzXG4gICAgICAgICAgICAgICAgeC5zdGF0ZUNoYW5nZXMudHJhbnNmZXJzLmZvckVhY2goZnVuY3Rpb24gKHkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gc3RhdGVVcGRhdGUudHJhbnNmZXJzLmZpbmRJbmRleChmdW5jdGlvbiAoeikgeyByZXR1cm4gKHouYXNzZXQgPT09IHkuYXNzZXQpICYmICh6LmFkZHJlc3MgPT09IHkuYWRkcmVzcykgJiYgKHguZEFwcCA9PT0gei5zZW5kZXIpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggIT09IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHN0YXRlVXBkYXRlLnRyYW5zZmVyc1tpbmRleF0uYW1vdW50ID0gKG5ldyBiaWdudW1iZXJfMS5CaWdOdW1iZXIoc3RhdGVVcGRhdGUudHJhbnNmZXJzW2luZGV4XS5hbW91bnQpKS5hZGQoeS5hbW91bnQpLnRvTnVtYmVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogc3RhdGVVcGRhdGUudHJhbnNmZXJzLnB1c2goX19hc3NpZ24oX19hc3NpZ24oe30sIHkpLCB7IHNlbmRlcjogeC5kQXBwIH0pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvL3Nwb25zb3JGZWVzXG4gICAgICAgICAgICAgICAgeC5zdGF0ZUNoYW5nZXMuc3BvbnNvckZlZXMuZm9yRWFjaChmdW5jdGlvbiAoeSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBzdGF0ZVVwZGF0ZS5zcG9uc29yRmVlcy5maW5kSW5kZXgoZnVuY3Rpb24gKHopIHsgcmV0dXJuICh6LmFzc2V0SWQgPT09IHkuYXNzZXRJZCkgJiYgKHouYWRkcmVzcyA9PT0geC5kQXBwKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICE9PSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBzdGF0ZVVwZGF0ZS5zcG9uc29yRmVlc1tpbmRleF0gPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgeSksIHsgYWRkcmVzczogeC5kQXBwIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHN0YXRlVXBkYXRlLnNwb25zb3JGZWVzLnB1c2goX19hc3NpZ24oX19hc3NpZ24oe30sIHkpLCB7IGFkZHJlc3M6IHguZEFwcCB9KSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy9sZWFzZSBhbmQgbGVhc2VDYW5jZWxzXG4gICAgICAgICAgICAgICAgeC5zdGF0ZUNoYW5nZXMubGVhc2VzLmZvckVhY2goZnVuY3Rpb24gKHkpIHsgcmV0dXJuIHN0YXRlVXBkYXRlLmxlYXNlcy5wdXNoKF9fYXNzaWduKF9fYXNzaWduKHt9LCB5KSwgeyBzZW5kZXI6IHguZEFwcCB9KSk7IH0pO1xuICAgICAgICAgICAgICAgIHguc3RhdGVDaGFuZ2VzLmxlYXNlQ2FuY2Vscy5mb3JFYWNoKGZ1bmN0aW9uICh5KSB7IHJldHVybiBzdGF0ZVVwZGF0ZS5sZWFzZUNhbmNlbHMucHVzaChfX2Fzc2lnbihfX2Fzc2lnbih7fSwgeSksIHsgYWRkcmVzczogeC5kQXBwIH0pKTsgfSk7XG4gICAgICAgICAgICAgICAgcmVjdXJzaXZlRnVuY3Rpb24oeC5zdGF0ZUNoYW5nZXMsIHguZEFwcCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmVjdXJzaXZlRnVuY3Rpb24oc3RhdGVDaGFuZ2VzLCBzZW5kZXIpO1xuICAgIHJldHVybiBzdGF0ZVVwZGF0ZTtcbn1cbmV4cG9ydHMubWFrZVN0YXRlVXBkYXRlID0gbWFrZVN0YXRlVXBkYXRlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dHJhbnNhY3Rpb25zLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHV0aWxzXzEgPSByZXF1aXJlKFwiLi4vdXRpbHNcIik7XG52YXIgdHJhbnNhY3Rpb25zXzEgPSByZXF1aXJlKFwiLi4vLi4vYXBpLW5vZGUvdHJhbnNhY3Rpb25zXCIpO1xudmFyIGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4uLy4uL2NvbnN0YW50c1wiKTtcbmZ1bmN0aW9uIGRlZmF1bHRfMShiYXNlLCB0eCwgb3B0aW9ucykge1xuICAgIHZhciBpc09uY2UgPSAhQXJyYXkuaXNBcnJheSh0eCk7XG4gICAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICB2YXIgY29uZmlybWVkID0gW107XG4gICAgdmFyIGNvbmZpcm1hdGlvbnMgPSBvcHRpb25zICYmIG9wdGlvbnMuY29uZmlybWF0aW9ucyB8fCAwO1xuICAgIHZhciBtYXhXYWl0VGltZSA9IG9wdGlvbnMgJiYgb3B0aW9ucy5tYXhXYWl0VGltZSB8fCAwO1xuICAgIHZhciByZXF1ZXN0SW50ZXJ2YWwgPSBvcHRpb25zICYmIG9wdGlvbnMucmVxdWVzdEludGVydmFsIHx8IDI1MDtcbiAgICB2YXIgd2FpdFR4ID0gZnVuY3Rpb24gKGxpc3QpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uc18xLmZldGNoU3RhdHVzKGJhc2UsIGxpc3QubWFwKHV0aWxzXzEucHJvcCgnaWQnKSkpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoc3RhdHVzKSB7XG4gICAgICAgICAgICB2YXIgaGFzaCA9IHV0aWxzXzEuaW5kZXhCeSh1dGlsc18xLnByb3AoJ2lkJyksIHN0YXR1cy5zdGF0dXNlcyk7XG4gICAgICAgICAgICB2YXIgaGFzRXJyb3IgPSBsaXN0LnNvbWUoZnVuY3Rpb24gKHR4KSB7IHJldHVybiBoYXNoW3R4LmlkXS5zdGF0dXMgPT09IGNvbnN0YW50c18xLlRSQU5TQUNUSU9OX1NUQVRVU0VTLk5PVF9GT1VORDsgfSk7XG4gICAgICAgICAgICBpZiAoaGFzRXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09uZSB0cmFuc2FjdGlvbiBpcyBub3QgaW4gYmxvY2tjaGFpbiEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0b1JlcXVlc3QgPSBsaXN0LmZpbHRlcihmdW5jdGlvbiAodHgpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFzaFt0eC5pZF0uY29uZmlybWF0aW9ucyA+PSBjb25maXJtYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpcm1lZC5wdXNoKHR4KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXRvUmVxdWVzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1heFdhaXRUaW1lICYmIERhdGUubm93KCkgLSBzdGFydCA+IG1heFdhaXRUaW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdUaW1lb3V0IGVycm9yIScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHV0aWxzXzEud2FpdChyZXF1ZXN0SW50ZXJ2YWwpLnRoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4gd2FpdFR4KHRvUmVxdWVzdCk7IH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiB3YWl0VHgodXRpbHNfMS50b0FycmF5KHR4KSkudGhlbihmdW5jdGlvbiAoKSB7IHJldHVybiBpc09uY2UgPyB1dGlsc18xLmhlYWQoY29uZmlybWVkKSA6IGNvbmZpcm1lZDsgfSk7XG59XG5leHBvcnRzLmRlZmF1bHQgPSBkZWZhdWx0XzE7XG4vLyMgc291cmNlTWFwcGluZ1VSTD13YWl0LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5waXBlID0gZXhwb3J0cy5zd2l0Y2hUcmFuc2FjdGlvbkJ5VHlwZSA9IGV4cG9ydHMudW5pcSA9IGV4cG9ydHMuaW5kZXhCeSA9IGV4cG9ydHMuZmlsdGVyID0gZXhwb3J0cy5tYXAgPSBleHBvcnRzLmRlZXBBc3NpZ24gPSBleHBvcnRzLmFzc2lnbiA9IGV4cG9ydHMudmFsdWVzID0gZXhwb3J0cy5lbnRyaWVzID0gZXhwb3J0cy5rZXlzID0gZXhwb3J0cy5wcm9wID0gZXhwb3J0cy53YWl0ID0gZXhwb3J0cy5oZWFkID0gZXhwb3J0cy50b0FycmF5ID0gZXhwb3J0cy5pc09iamVjdCA9IHZvaWQgMDtcbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICAgIGlmICh0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCkge1xuICAgICAgICBpZiAodHlwZW9mIE9iamVjdC5nZXRQcm90b3R5cGVPZiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik7XG4gICAgICAgICAgICByZXR1cm4gcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlIHx8IHByb3RvdHlwZSA9PT0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09IFwiW29iamVjdCBPYmplY3RdXCI7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcbmZ1bmN0aW9uIHRvQXJyYXkoZGF0YSkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IFtkYXRhXTtcbn1cbmV4cG9ydHMudG9BcnJheSA9IHRvQXJyYXk7XG5mdW5jdGlvbiBoZWFkKGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YVswXTtcbn1cbmV4cG9ydHMuaGVhZCA9IGhlYWQ7XG5mdW5jdGlvbiB3YWl0KHRpbWUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgc2V0VGltZW91dChyZXNvbHZlLCB0aW1lKTtcbiAgICB9KTtcbn1cbmV4cG9ydHMud2FpdCA9IHdhaXQ7XG5mdW5jdGlvbiBwcm9wKGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZGF0YSkgeyByZXR1cm4gZGF0YVtrZXldOyB9O1xufVxuZXhwb3J0cy5wcm9wID0gcHJvcDtcbmV4cG9ydHMua2V5cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKTtcbn07XG5leHBvcnRzLmVudHJpZXMgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIGV4cG9ydHMua2V5cyhvYmopLm1hcChmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW25hbWUsIG9ialtuYW1lXV07IH0pO1xufTtcbmV4cG9ydHMudmFsdWVzID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBleHBvcnRzLmtleXMob2JqKS5tYXAoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gb2JqW2tleV07IH0pO1xufTtcbmV4cG9ydHMuYXNzaWduID0gZnVuY3Rpb24gKHRhcmdldCwgbWVyZ2UpIHtcbiAgICByZXR1cm4gZXhwb3J0cy5lbnRyaWVzKG1lcmdlKS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgX2EpIHtcbiAgICAgICAgdmFyIGtleSA9IF9hWzBdLCB2YWx1ZSA9IF9hWzFdO1xuICAgICAgICB0YXJnZXRba2V5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH0sIHRhcmdldCk7XG59O1xuZXhwb3J0cy5kZWVwQXNzaWduID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgb2JqZWN0c1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5yZWR1Y2UoZnVuY3Rpb24gKHRhcmdldCwgbWVyZ2UpIHtcbiAgICAgICAgZXhwb3J0cy5rZXlzKG1lcmdlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRhcmdldFtrZXldKSAmJiBBcnJheS5pc0FycmF5KG1lcmdlW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBBcnJheS5mcm9tKG5ldyBTZXQodGFyZ2V0W2tleV0uY29uY2F0KG1lcmdlW2tleV0pKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc09iamVjdCh0YXJnZXRba2V5XSkgJiYgaXNPYmplY3QobWVyZ2Vba2V5XSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IGV4cG9ydHMuZGVlcEFzc2lnbih0YXJnZXRba2V5XSwgbWVyZ2Vba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IG1lcmdlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH0sIG9iamVjdHNbMF0gfHwge30pO1xufTtcbmZ1bmN0aW9uIG1hcChwcm9jZXNzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChsaXN0KSB7IHJldHVybiBsaXN0Lm1hcChwcm9jZXNzKTsgfTtcbn1cbmV4cG9ydHMubWFwID0gbWFwO1xuZnVuY3Rpb24gZmlsdGVyKHByb2Nlc3MpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGxpc3QpIHsgcmV0dXJuIGxpc3QuZmlsdGVyKHByb2Nlc3MpOyB9O1xufVxuZXhwb3J0cy5maWx0ZXIgPSBmaWx0ZXI7XG5mdW5jdGlvbiBpbmRleEJ5KHByb2Nlc3MsIGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgaXRlbSkge1xuICAgICAgICBhY2NbcHJvY2VzcyhpdGVtKV0gPSBpdGVtO1xuICAgICAgICByZXR1cm4gYWNjO1xuICAgIH0sIHt9KTtcbn1cbmV4cG9ydHMuaW5kZXhCeSA9IGluZGV4Qnk7XG5leHBvcnRzLnVuaXEgPSBmdW5jdGlvbiAobGlzdCkge1xuICAgIHJldHVybiBleHBvcnRzLmtleXMobGlzdC5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgaXRlbSkge1xuICAgICAgICBpZiAoaXRlbSAhPSBudWxsKVxuICAgICAgICAgICAgYWNjW2l0ZW1dID0gaXRlbTtcbiAgICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCBPYmplY3QuY3JlYXRlKG51bGwpKSk7XG59O1xuZnVuY3Rpb24gc3dpdGNoVHJhbnNhY3Rpb25CeVR5cGUoY2hvaWNlcykge1xuICAgIHJldHVybiBmdW5jdGlvbiAodHgpIHsgcmV0dXJuIGNob2ljZXNbdHgudHlwZV0gJiYgdHlwZW9mIGNob2ljZXNbdHgudHlwZV0gPT09ICdmdW5jdGlvbicgPyBjaG9pY2VzW3R4LnR5cGVdKHR4KSA6IHVuZGVmaW5lZDsgfTtcbn1cbmV4cG9ydHMuc3dpdGNoVHJhbnNhY3Rpb25CeVR5cGUgPSBzd2l0Y2hUcmFuc2FjdGlvbkJ5VHlwZTtcbmV4cG9ydHMucGlwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJncyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7IHJldHVybiBhcmdzLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBpdGVtKSB7IHJldHVybiBpdGVtKGFjYyk7IH0sIGRhdGEpOyB9O1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWxzLmpzLm1hcCIsImltcG9ydCB7IF9fYXNzaWduLCBfX2F3YWl0ZXIsIF9fZGVjb3JhdGUsIF9fZ2VuZXJhdG9yLCBfX3NwcmVhZEFycmF5cyB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgREVGQVVMVF9PUFRJT05TIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgbWFrZUNvbnNvbGUsIG1ha2VPcHRpb25zIH0gZnJvbSAnQHdhdmVzL2NsaWVudC1sb2dzJztcbmltcG9ydCB7IGZldGNoQmFsYW5jZURldGFpbHMgfSBmcm9tICdAd2F2ZXMvbm9kZS1hcGktanMvY2pzL2FwaS1ub2RlL2FkZHJlc3Nlcyc7XG5pbXBvcnQgeyBmZXRjaEFzc2V0c0JhbGFuY2UgfSBmcm9tICdAd2F2ZXMvbm9kZS1hcGktanMvY2pzL2FwaS1ub2RlL2Fzc2V0cyc7XG5pbXBvcnQgd2FpdCBmcm9tICdAd2F2ZXMvbm9kZS1hcGktanMvY2pzL3Rvb2xzL3RyYW5zYWN0aW9ucy93YWl0JztcbmltcG9ydCBicm9hZGNhc3QgZnJvbSAnQHdhdmVzL25vZGUtYXBpLWpzL2Nqcy90b29scy90cmFuc2FjdGlvbnMvYnJvYWRjYXN0JztcbmltcG9ydCBnZXROZXR3b3JrQnl0ZSBmcm9tICdAd2F2ZXMvbm9kZS1hcGktanMvY2pzL3Rvb2xzL2Jsb2Nrcy9nZXROZXR3b3JrQnl0ZSc7XG5pbXBvcnQgeyBUUkFOU0FDVElPTl9UWVBFLCB9IGZyb20gJ0B3YXZlcy90cy10eXBlcyc7XG5pbXBvcnQgeyBhcmdzVmFsaWRhdG9ycywgdmFsaWRhdGVTaWduZXJPcHRpb25zLCB2YWxpZGF0ZVByb3ZpZGVySW50ZXJmYWNlLCB9IGZyb20gJy4vdmFsaWRhdGlvbic7XG5pbXBvcnQgeyBFUlJPUlMgfSBmcm9tICcuL1NpZ25lckVycm9yJztcbmltcG9ydCB7IGVycm9ySGFuZGxlckZhY3RvcnkgfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHsgZW5zdXJlUHJvdmlkZXIsIGNoZWNrQXV0aCwgY2F0Y2hQcm92aWRlckVycm9yIH0gZnJvbSAnLi9kZWNvcmF0b3JzJztcbmV4cG9ydCAqIGZyb20gJy4vdHlwZXMnO1xudmFyIFNpZ25lciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTaWduZXIob3B0aW9ucykge1xuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdGhpcy5faXNzdWUgPSBmdW5jdGlvbiAodHhMaXN0KSB7IHJldHVybiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzXzEuX2NyZWF0ZVBpcGVsaW5lQVBJKHR4TGlzdCwgX19hc3NpZ24oX19hc3NpZ24oe30sIGRhdGEpLCB7IHR5cGU6IFRSQU5TQUNUSU9OX1RZUEUuSVNTVUUgfSkpO1xuICAgICAgICB9OyB9O1xuICAgICAgICB0aGlzLl90cmFuc2ZlciA9IGZ1bmN0aW9uICh0eExpc3QpIHsgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXNfMS5fY3JlYXRlUGlwZWxpbmVBUEkodHhMaXN0LCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZGF0YSksIHsgdHlwZTogVFJBTlNBQ1RJT05fVFlQRS5UUkFOU0ZFUiB9KSk7XG4gICAgICAgIH07IH07XG4gICAgICAgIHRoaXMuX3JlaXNzdWUgPSBmdW5jdGlvbiAodHhMaXN0KSB7IHJldHVybiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzXzEuX2NyZWF0ZVBpcGVsaW5lQVBJKHR4TGlzdCwgX19hc3NpZ24oX19hc3NpZ24oe30sIGRhdGEpLCB7IHR5cGU6IFRSQU5TQUNUSU9OX1RZUEUuUkVJU1NVRSB9KSk7XG4gICAgICAgIH07IH07XG4gICAgICAgIHRoaXMuX2J1cm4gPSBmdW5jdGlvbiAodHhMaXN0KSB7IHJldHVybiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzXzEuX2NyZWF0ZVBpcGVsaW5lQVBJKHR4TGlzdCwgX19hc3NpZ24oX19hc3NpZ24oe30sIGRhdGEpLCB7IHR5cGU6IFRSQU5TQUNUSU9OX1RZUEUuQlVSTiB9KSk7XG4gICAgICAgIH07IH07XG4gICAgICAgIHRoaXMuX2xlYXNlID0gZnVuY3Rpb24gKHR4TGlzdCkgeyByZXR1cm4gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpc18xLl9jcmVhdGVQaXBlbGluZUFQSSh0eExpc3QsIF9fYXNzaWduKF9fYXNzaWduKHt9LCBkYXRhKSwgeyB0eXBlOiBUUkFOU0FDVElPTl9UWVBFLkxFQVNFIH0pKTtcbiAgICAgICAgfTsgfTtcbiAgICAgICAgdGhpcy5fZXhjaGFuZ2UgPSBmdW5jdGlvbiAodHhMaXN0KSB7IHJldHVybiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzXzEuX2NyZWF0ZVBpcGVsaW5lQVBJKHR4TGlzdCwgX19hc3NpZ24oX19hc3NpZ24oe30sIGRhdGEpLCB7IHR5cGU6IFRSQU5TQUNUSU9OX1RZUEUuRVhDSEFOR0UgfSkpO1xuICAgICAgICB9OyB9O1xuICAgICAgICB0aGlzLl9jYW5jZWxMZWFzZSA9IGZ1bmN0aW9uICh0eExpc3QpIHsgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXNfMS5fY3JlYXRlUGlwZWxpbmVBUEkodHhMaXN0LCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZGF0YSksIHsgdHlwZTogVFJBTlNBQ1RJT05fVFlQRS5DQU5DRUxfTEVBU0UgfSkpO1xuICAgICAgICB9OyB9O1xuICAgICAgICB0aGlzLl9hbGlhcyA9IGZ1bmN0aW9uICh0eExpc3QpIHsgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXNfMS5fY3JlYXRlUGlwZWxpbmVBUEkodHhMaXN0LCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZGF0YSksIHsgdHlwZTogVFJBTlNBQ1RJT05fVFlQRS5BTElBUyB9KSk7XG4gICAgICAgIH07IH07XG4gICAgICAgIHRoaXMuX21hc3NUcmFuc2ZlciA9IGZ1bmN0aW9uICh0eExpc3QpIHsgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXNfMS5fY3JlYXRlUGlwZWxpbmVBUEkodHhMaXN0LCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZGF0YSksIHsgdHlwZTogVFJBTlNBQ1RJT05fVFlQRS5NQVNTX1RSQU5TRkVSIH0pKTtcbiAgICAgICAgfTsgfTtcbiAgICAgICAgdGhpcy5fZGF0YSA9IGZ1bmN0aW9uICh0eExpc3QpIHsgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXNfMS5fY3JlYXRlUGlwZWxpbmVBUEkodHhMaXN0LCBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZGF0YSksIHsgdHlwZTogVFJBTlNBQ1RJT05fVFlQRS5EQVRBIH0pKTtcbiAgICAgICAgfTsgfTtcbiAgICAgICAgdGhpcy5fc3BvbnNvcnNoaXAgPSBmdW5jdGlvbiAodHhMaXN0KSB7IHJldHVybiBmdW5jdGlvbiAoc3BvbnNvcnNoaXApIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpc18xLl9jcmVhdGVQaXBlbGluZUFQSSh0eExpc3QsIF9fYXNzaWduKF9fYXNzaWduKHt9LCBzcG9uc29yc2hpcCksIHsgdHlwZTogVFJBTlNBQ1RJT05fVFlQRS5TUE9OU09SU0hJUCB9KSk7XG4gICAgICAgIH07IH07XG4gICAgICAgIHRoaXMuX3NldFNjcmlwdCA9IGZ1bmN0aW9uICh0eExpc3QpIHsgcmV0dXJuIGZ1bmN0aW9uIChzZXRTY3JpcHQpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpc18xLl9jcmVhdGVQaXBlbGluZUFQSSh0eExpc3QsIF9fYXNzaWduKF9fYXNzaWduKHt9LCBzZXRTY3JpcHQpLCB7IHR5cGU6IFRSQU5TQUNUSU9OX1RZUEUuU0VUX1NDUklQVCB9KSk7XG4gICAgICAgIH07IH07XG4gICAgICAgIHRoaXMuX3NldEFzc2V0U2NyaXB0ID0gZnVuY3Rpb24gKHR4TGlzdCkgeyByZXR1cm4gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpc18xLl9jcmVhdGVQaXBlbGluZUFQSSh0eExpc3QsIF9fYXNzaWduKF9fYXNzaWduKHt9LCBkYXRhKSwgeyB0eXBlOiBUUkFOU0FDVElPTl9UWVBFLlNFVF9BU1NFVF9TQ1JJUFQgfSkpO1xuICAgICAgICB9OyB9O1xuICAgICAgICB0aGlzLl9pbnZva2UgPSBmdW5jdGlvbiAodHhMaXN0KSB7IHJldHVybiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzXzEuX2NyZWF0ZVBpcGVsaW5lQVBJKHR4TGlzdCwgX19hc3NpZ24oX19hc3NpZ24oe30sIGRhdGEpLCB7IHR5cGU6IFRSQU5TQUNUSU9OX1RZUEUuSU5WT0tFX1NDUklQVCB9KSk7XG4gICAgICAgIH07IH07XG4gICAgICAgIHRoaXMuX2xvZ2dlciA9IG1ha2VDb25zb2xlKG1ha2VPcHRpb25zKChfYSA9IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy5MT0dfTEVWRUwpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6ICdwcm9kdWN0aW9uJywgJ1NpZ25lcicpKTtcbiAgICAgICAgdGhpcy5faGFuZGxlRXJyb3IgPSBlcnJvckhhbmRsZXJGYWN0b3J5KHRoaXMuX2xvZ2dlcik7XG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgREVGQVVMVF9PUFRJT05TKSwgKG9wdGlvbnMgfHwge30pKTtcbiAgICAgICAgdmFyIF9iID0gdmFsaWRhdGVTaWduZXJPcHRpb25zKHRoaXMuX29wdGlvbnMpLCBpc1ZhbGlkID0gX2IuaXNWYWxpZCwgaW52YWxpZE9wdGlvbnMgPSBfYi5pbnZhbGlkT3B0aW9ucztcbiAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgICAgICB2YXIgZXJyb3IgPSB0aGlzLl9oYW5kbGVFcnJvcihFUlJPUlMuU0lHTkVSX09QVElPTlMsIFtcbiAgICAgICAgICAgICAgICBpbnZhbGlkT3B0aW9ucyxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1ha2VOZXR3b3JrQnl0ZUVycm9yID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBlcnJvciA9IF90aGlzXzEuX2hhbmRsZUVycm9yKEVSUk9SUy5ORVRXT1JLX0JZVEUsIFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIG5vZGU6IF90aGlzXzEuX29wdGlvbnMuTk9ERV9VUkwsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgX3RoaXNfMS5fbG9nZ2VyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgICAgfTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuX25ldHdvcmtCeXRlUHJvbWlzZSA9IGdldE5ldHdvcmtCeXRlKHRoaXMuX29wdGlvbnMuTk9ERV9VUkwpXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlKSB7IHJldHVybiBQcm9taXNlLnJlamVjdChtYWtlTmV0d29ya0J5dGVFcnJvcihlKSk7IH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyBtYWtlTmV0d29ya0J5dGVFcnJvcihlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sb2dnZXIuaW5mbygnU2lnbmVyIGluc3RhbmNlIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBjcmVhdGVkLiBPcHRpb25zOiAnLCBvcHRpb25zKTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNpZ25lci5wcm90b3R5cGUsIFwiX2Nvbm5lY3RQcm9taXNlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fX2Nvbm5lY3RQcm9taXNlIHx8IFByb21pc2UucmVqZWN0KCdIYXMgbm8gcHJvdmlkZXIhJyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX19jb25uZWN0UHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBTaWduZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFByb3ZpZGVyLm9uKGV2ZW50LCBoYW5kbGVyKTtcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmluZm8oXCJIYW5kbGVyIGZvciBcXFwiXCIgKyBldmVudCArIFwiXFxcIiBoYXMgYmVlbiBhZGRlZC5cIik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgU2lnbmVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFByb3ZpZGVyLm9uY2UoZXZlbnQsIGhhbmRsZXIpO1xuICAgICAgICB0aGlzLl9sb2dnZXIuaW5mbyhcIk9uZS1UaW1lIGhhbmRsZXIgZm9yIFxcXCJcIiArIGV2ZW50ICsgXCJcXFwiIGhhcyBiZWVuIGFkZGVkLlwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBTaWduZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChldmVudCwgaGFuZGxlcikge1xuICAgICAgICB0aGlzLmN1cnJlbnRQcm92aWRlci5vZmYoZXZlbnQsIGhhbmRsZXIpO1xuICAgICAgICB0aGlzLl9sb2dnZXIuaW5mbyhcIkhhbmRsZXIgZm9yIFxcXCJcIiArIGV2ZW50ICsgXCJcXFwiIGhhcyBiZWVuIHJlbW92ZWQuXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFNpZ25lci5wcm90b3R5cGUuYnJvYWRjYXN0ID0gZnVuY3Rpb24gKHRvQnJvYWRjYXN0LCBvcHRpb25zKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGJyb2FkY2FzdCh0aGlzLl9vcHRpb25zLk5PREVfVVJMLCB0b0Jyb2FkY2FzdCwgb3B0aW9ucyk7IC8vIFRPRE8g0L/QvtC/0YDQsNCy0LjRgtGMINGC0LjQvyDQsiBicm9hZGNhc3RcbiAgICB9O1xuICAgIC8qKlxuICAgICAqINCX0LDQv9GA0L7RgdC40YLRjCDQsdCw0LnRgiDRgdC10YLQuFxuICAgICAqL1xuICAgIFNpZ25lci5wcm90b3R5cGUuZ2V0TmV0d29ya0J5dGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZXR3b3JrQnl0ZVByb21pc2U7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiDQo9GB0YLQsNC90LDQstC70LjQstCw0LXQvCDQv9GA0L7QstCw0LnQtNC10YAg0L7RgtCy0LXRh9Cw0Y7RidC40Lkg0LfQsCDQv9C+0LTQv9C40YHRjFxuICAgICAqIEBwYXJhbSBwcm92aWRlclxuICAgICAqXG4gICAgICogYGBgdHNcbiAgICAgKiBpbXBvcnQgU2lnbmVyIGZyb20gJ0B3YXZlcy9zaWduZXInO1xuICAgICAqIGltcG9ydCBQcm92aWRlciBmcm9tICdAd2F2ZXMvc2VlZC1wcm92aWRlcic7XG4gICAgICpcbiAgICAgKiBjb25zdCB3YXZlcyA9IG5ldyBTaWduZXIoKTtcbiAgICAgKiB3YXZlcy5zZXRQcm92aWRlcihuZXcgUHJvdmlkZXIoJ1NFRUQnKSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgU2lnbmVyLnByb3RvdHlwZS5zZXRQcm92aWRlciA9IGZ1bmN0aW9uIChwcm92aWRlcikge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcHJvdmlkZXJWYWxpZGF0aW9uLCBlcnJvcjtcbiAgICAgICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBwcm92aWRlclZhbGlkYXRpb24gPSB2YWxpZGF0ZVByb3ZpZGVySW50ZXJmYWNlKHByb3ZpZGVyKTtcbiAgICAgICAgICAgICAgICBpZiAoIXByb3ZpZGVyVmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yID0gdGhpcy5faGFuZGxlRXJyb3IoRVJST1JTLlBST1ZJREVSX0lOVEVSRkFDRSwgW3Byb3ZpZGVyVmFsaWRhdGlvbi5pbnZhbGlkUHJvcGVydGllc10pO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UHJvdmlkZXIgPSBwcm92aWRlcjtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2dnZXIuaW5mbygnUHJvdmlkZXIgaGFzIGJlZW4gc2V0LicpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RQcm9taXNlID1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbmV0d29ya0J5dGVQcm9taXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoYnl0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3ZpZGVyLmNvbm5lY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5FVFdPUktfQllURTogYnl0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOT0RFX1VSTDogX3RoaXNfMS5fb3B0aW9ucy5OT0RFX1VSTCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzXzEuX2xvZ2dlci5pbmZvKCdQcm92aWRlciBoYXMgY29ubmVjZWQgdG8gbm9kZS4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvdmlkZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnJvciA9IF90aGlzXzEuX2hhbmRsZUVycm9yKEVSUk9SUy5QUk9WSURFUl9DT05ORUNULCBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGUubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IF90aGlzXzEuX29wdGlvbnMuTk9ERV9VUkwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpc18xLl9sb2dnZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICog0J/QvtC70YPRh9Cw0LXQvCDRgdC/0LjRgdC+0Log0LHQsNC70LDQvdGB0L7QsiDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y8gKNC90LXQvtCx0YXQvtC00LjQvNC+INCy0YvQv9C+0LvQvdC40YLRjCBsb2dpbiDQv9C10YDQtdC0INC40YHQv9C+0LvRjNC30L7QstCw0L3QuNC10LwpXG4gICAgICogQmFzaWMgdXNhZ2UgZXhhbXBsZTpcbiAgICAgKlxuICAgICAqIGBgYHRzXG4gICAgICogYXdhaXQgd2F2ZXMuZ2V0QmFsYW5jZSgpOyAvLyDQktC+0LfQstGA0LDRidCw0LXRgiDQsdCw0LvQsNC90YHRiyDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBTaWduZXIucHJvdG90eXBlLmdldEJhbGFuY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpc18xID0gdGhpcztcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGZldGNoQmFsYW5jZURldGFpbHModGhpcy5fb3B0aW9ucy5OT0RFX1VSTCwgdGhpcy5fdXNlckRhdGEuYWRkcmVzcykudGhlbihmdW5jdGlvbiAoZGF0YSkgeyByZXR1cm4gKHtcbiAgICAgICAgICAgICAgICBhc3NldElkOiAnV0FWRVMnLFxuICAgICAgICAgICAgICAgIGFzc2V0TmFtZTogJ1dhdmVzJyxcbiAgICAgICAgICAgICAgICBkZWNpbWFsczogOCxcbiAgICAgICAgICAgICAgICBhbW91bnQ6IFN0cmluZyhkYXRhLmF2YWlsYWJsZSksXG4gICAgICAgICAgICAgICAgaXNNeUFzc2V0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0b2tlbnM6IE51bWJlcihkYXRhLmF2YWlsYWJsZSkgKiBNYXRoLnBvdygxMCwgOCksXG4gICAgICAgICAgICAgICAgc3BvbnNvcnNoaXA6IG51bGwsXG4gICAgICAgICAgICAgICAgaXNTbWFydDogZmFsc2UsXG4gICAgICAgICAgICB9KTsgfSksXG4gICAgICAgICAgICBmZXRjaEFzc2V0c0JhbGFuY2UodGhpcy5fb3B0aW9ucy5OT0RFX1VSTCwgdGhpcy5fdXNlckRhdGEuYWRkcmVzcykudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLmJhbGFuY2VzLm1hcChmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gKHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRJZDogaXRlbS5hc3NldElkLFxuICAgICAgICAgICAgICAgICAgICBhc3NldE5hbWU6IGl0ZW0uaXNzdWVUcmFuc2FjdGlvbi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBkZWNpbWFsczogaXRlbS5pc3N1ZVRyYW5zYWN0aW9uLmRlY2ltYWxzLFxuICAgICAgICAgICAgICAgICAgICBhbW91bnQ6IFN0cmluZyhpdGVtLmJhbGFuY2UpLFxuICAgICAgICAgICAgICAgICAgICBpc015QXNzZXQ6IGl0ZW0uaXNzdWVUcmFuc2FjdGlvbi5zZW5kZXIgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpc18xLl91c2VyRGF0YS5hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnM6IGl0ZW0uYmFsYW5jZSAqXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnBvdygxMCwgaXRlbS5pc3N1ZVRyYW5zYWN0aW9uLmRlY2ltYWxzKSxcbiAgICAgICAgICAgICAgICAgICAgaXNTbWFydDogISFpdGVtLmlzc3VlVHJhbnNhY3Rpb24uc2NyaXB0LFxuICAgICAgICAgICAgICAgICAgICBzcG9uc29yc2hpcDogaXRlbS5zcG9uc29yQmFsYW5jZSAhPSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnNwb25zb3JCYWxhbmNlID4gTWF0aC5wb3coMTAsIDgpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAoaXRlbS5taW5TcG9uc29yZWRBc3NldEZlZSB8fCAwKSA8IGl0ZW0uYmFsYW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBpdGVtLm1pblNwb25zb3JlZEFzc2V0RmVlXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bGwsXG4gICAgICAgICAgICAgICAgfSk7IH0pO1xuICAgICAgICAgICAgfSksXG4gICAgICAgIF0pLnRoZW4oZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICB2YXIgd2F2ZXMgPSBfYVswXSwgYXNzZXRzID0gX2FbMV07XG4gICAgICAgICAgICByZXR1cm4gX19zcHJlYWRBcnJheXMoW3dhdmVzXSwgYXNzZXRzKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiDQn9C+0LvRg9GH0LDQtdC8INC40L3RhNC+0YDQvNCw0YbQuNGOINC+INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvQtVxuICAgICAqXG4gICAgICogYGBgdHNcbiAgICAgKiBhd2FpdCB3YXZlcy5sb2dpbigpOyAvLyDQkNCy0YLQvtGA0LjQt9GD0LXQvNGB0Y8uINCS0L7Qt9Cy0YDQsNGJ0LDQtdGCINCw0LTRgNC10YEg0Lgg0L/Rg9Cx0LvQuNGH0L3Ri9C5INC60LvRjtGHXG4gICAgICogYGBgXG4gICAgICovXG4gICAgU2lnbmVyLnByb3RvdHlwZS5sb2dpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9hLCBlcnJfMSwgZXJyb3I7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9iKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYi5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYi50cnlzLnB1c2goWzAsIDIsICwgM10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgX2EgPSB0aGlzO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5jdXJyZW50UHJvdmlkZXIubG9naW4oKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLl91c2VyRGF0YSA9IF9iLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvZ2dlci5pbmZvKCdMb2dnZWQgaW4uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgdGhpcy5fdXNlckRhdGFdO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJfMSA9IF9iLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJfMSA9PT0gJ0Vycm9yOiBVc2VyIHJlamVjdGlvbiEnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyXzE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciA9IHRoaXMuX2hhbmRsZUVycm9yKEVSUk9SUy5QUk9WSURFUl9JTlRFUk5BTCwgZXJyXzEubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOiByZXR1cm4gWzIgLypyZXR1cm4qL107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICog0JLRi9C70L7Qs9C40L3QuNCy0LDQtdC80YHRjyDQuNC3INGO0LfQtdGA0LBcbiAgICAgKi9cbiAgICBTaWduZXIucHJvdG90eXBlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9hLCBtZXNzYWdlLCBlcnJvcjtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2IpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9iLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9iLnRyeXMucHVzaChbMCwgMiwgLCAzXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLmN1cnJlbnRQcm92aWRlci5sb2dvdXQoKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9iLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3VzZXJEYXRhID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9nZ2VyLmluZm8oJ0xvZ2dlZCBvdXQuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCAzXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2EgPSBfYi5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gX2EubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yID0gdGhpcy5faGFuZGxlRXJyb3IoRVJST1JTLlBST1ZJREVSX0lOVEVSTkFMLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6IHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiDQn9C+0LTQv9C40YHRi9Cy0LDQtdC8INGB0L7QvtCx0YnQtdC90LjQtSDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y8gKNC/0YDQvtCy0LDQudC00LXRgCDQvNC+0LbQtdGCINGD0YHRgtCw0L3QsNCy0LvQuNCy0LDRgtGMINC/0YDQtdGE0LjQutGBKVxuICAgICAqIEBwYXJhbSBtZXNzYWdlXG4gICAgICovXG4gICAgU2lnbmVyLnByb3RvdHlwZS5zaWduTWVzc2FnZSA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb25uZWN0UHJvbWlzZS50aGVuKGZ1bmN0aW9uIChwcm92aWRlcikge1xuICAgICAgICAgICAgcmV0dXJuIHByb3ZpZGVyLnNpZ25NZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqINCf0L7QtNC/0LjRgdGL0LLQsNC10Lwg0YLQuNC/0LjQt9C40YDQvtCy0LDQvdC90YvQtSDQtNCw0L3QvdGL0LVcbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqL1xuICAgIFNpZ25lci5wcm90b3R5cGUuc2lnblR5cGVkRGF0YSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb25uZWN0UHJvbWlzZS50aGVuKGZ1bmN0aW9uIChwcm92aWRlcikge1xuICAgICAgICAgICAgcmV0dXJuIHByb3ZpZGVyLnNpZ25UeXBlZERhdGEoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICog0J/QvtC70YPRh9Cw0LXQvCDRgdC/0LjRgdC+0Log0LHQsNC70LDQvdGB0L7QsiDQsiDQutGC0L7RgNGL0YUg0LzQvtC20L3QviDQv9C70LDRgtC40YLRjCDQutC+0LzQuNGB0YHQuNGOXG4gICAgICovXG4gICAgU2lnbmVyLnByb3RvdHlwZS5nZXRTcG9uc29yZWRCYWxhbmNlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QmFsYW5jZSgpLnRoZW4oZnVuY3Rpb24gKGJhbGFuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBiYWxhbmNlLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gISFpdGVtLnNwb25zb3JzaGlwOyB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBTaWduZXIucHJvdG90eXBlLmJhdGNoID0gZnVuY3Rpb24gKHRzeCkge1xuICAgICAgICB2YXIgX3RoaXNfMSA9IHRoaXM7XG4gICAgICAgIHZhciBzaWduID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzXzEuX3NpZ24odHN4KS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHsgcmV0dXJuIHJlc3VsdDsgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzaWduOiBzaWduLFxuICAgICAgICAgICAgYnJvYWRjYXN0OiBmdW5jdGlvbiAob3B0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNpZ24oKS50aGVuKGZ1bmN0aW9uICh0cmFuc2FjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzXzEuYnJvYWRjYXN0KHRyYW5zYWN0aW9ucywgb3B0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfTtcbiAgICBTaWduZXIucHJvdG90eXBlLmlzc3VlID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzc3VlKFtdKShkYXRhKTtcbiAgICB9O1xuICAgIFNpZ25lci5wcm90b3R5cGUudHJhbnNmZXIgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNmZXIoW10pKGRhdGEpO1xuICAgIH07XG4gICAgU2lnbmVyLnByb3RvdHlwZS5yZWlzc3VlID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlaXNzdWUoW10pKGRhdGEpO1xuICAgIH07XG4gICAgU2lnbmVyLnByb3RvdHlwZS5idXJuID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J1cm4oW10pKGRhdGEpO1xuICAgIH07XG4gICAgU2lnbmVyLnByb3RvdHlwZS5sZWFzZSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sZWFzZShbXSkoZGF0YSk7XG4gICAgfTtcbiAgICBTaWduZXIucHJvdG90eXBlLmV4Y2hhbmdlID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V4Y2hhbmdlKFtdKShkYXRhKTtcbiAgICB9O1xuICAgIFNpZ25lci5wcm90b3R5cGUuY2FuY2VsTGVhc2UgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FuY2VsTGVhc2UoW10pKGRhdGEpO1xuICAgIH07XG4gICAgU2lnbmVyLnByb3RvdHlwZS5hbGlhcyA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hbGlhcyhbXSkoZGF0YSk7XG4gICAgfTtcbiAgICBTaWduZXIucHJvdG90eXBlLm1hc3NUcmFuc2ZlciA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXNzVHJhbnNmZXIoW10pKGRhdGEpO1xuICAgIH07XG4gICAgU2lnbmVyLnByb3RvdHlwZS5kYXRhID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGEoW10pKGRhdGEpO1xuICAgIH07XG4gICAgU2lnbmVyLnByb3RvdHlwZS5zcG9uc29yc2hpcCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zcG9uc29yc2hpcChbXSkoZGF0YSk7XG4gICAgfTtcbiAgICBTaWduZXIucHJvdG90eXBlLnNldFNjcmlwdCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXRTY3JpcHQoW10pKGRhdGEpO1xuICAgIH07XG4gICAgU2lnbmVyLnByb3RvdHlwZS5zZXRBc3NldFNjcmlwdCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXRBc3NldFNjcmlwdChbXSkoZGF0YSk7XG4gICAgfTtcbiAgICBTaWduZXIucHJvdG90eXBlLmludm9rZSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2UoW10pKGRhdGEpO1xuICAgIH07XG4gICAgU2lnbmVyLnByb3RvdHlwZS53YWl0VHhDb25maXJtID0gZnVuY3Rpb24gKHR4LCBjb25maXJtYXRpb25zKSB7XG4gICAgICAgIHJldHVybiB3YWl0KHRoaXMuX29wdGlvbnMuTk9ERV9VUkwsIHR4LCB7IGNvbmZpcm1hdGlvbnM6IGNvbmZpcm1hdGlvbnMgfSk7IC8vIFRPRE8gRml4IHR5cGVzXG4gICAgfTtcbiAgICBTaWduZXIucHJvdG90eXBlLl9jcmVhdGVQaXBlbGluZUFQSSA9IGZ1bmN0aW9uIChwcmV2Q2FsbFR4TGlzdCwgc2lnbmVyVHgpIHtcbiAgICAgICAgdmFyIF90aGlzXzEgPSB0aGlzO1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgdHhzID0gcHJldkNhbGxUeExpc3QubGVuZ3RoXG4gICAgICAgICAgICA/IF9fc3ByZWFkQXJyYXlzKHByZXZDYWxsVHhMaXN0LCBbc2lnbmVyVHhdKSA6IFtzaWduZXJUeF07XG4gICAgICAgIHZhciBjaGFpbkFyZ3MgPSBBcnJheS5pc0FycmF5KHR4cykgPyB0eHMgOiBbdHhzXTtcbiAgICAgICAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCB7XG4gICAgICAgICAgICBpc3N1ZTogdGhpcy5faXNzdWUoY2hhaW5BcmdzKSxcbiAgICAgICAgICAgIHRyYW5zZmVyOiB0aGlzLl90cmFuc2ZlcihjaGFpbkFyZ3MpLFxuICAgICAgICAgICAgcmVpc3N1ZTogdGhpcy5fcmVpc3N1ZShjaGFpbkFyZ3MpLFxuICAgICAgICAgICAgYnVybjogdGhpcy5fYnVybihjaGFpbkFyZ3MpLFxuICAgICAgICAgICAgbGVhc2U6IHRoaXMuX2xlYXNlKGNoYWluQXJncyksXG4gICAgICAgICAgICBleGNoYW5nZTogdGhpcy5fZXhjaGFuZ2UoY2hhaW5BcmdzKSxcbiAgICAgICAgICAgIGNhbmNlbExlYXNlOiB0aGlzLl9jYW5jZWxMZWFzZShjaGFpbkFyZ3MpLFxuICAgICAgICAgICAgYWxpYXM6IHRoaXMuX2FsaWFzKGNoYWluQXJncyksXG4gICAgICAgICAgICBtYXNzVHJhbnNmZXI6IHRoaXMuX21hc3NUcmFuc2ZlcihjaGFpbkFyZ3MpLFxuICAgICAgICAgICAgZGF0YTogdGhpcy5fZGF0YShjaGFpbkFyZ3MpLFxuICAgICAgICAgICAgc3BvbnNvcnNoaXA6IHRoaXMuX3Nwb25zb3JzaGlwKGNoYWluQXJncyksXG4gICAgICAgICAgICBzZXRTY3JpcHQ6IHRoaXMuX3NldFNjcmlwdChjaGFpbkFyZ3MpLFxuICAgICAgICAgICAgc2V0QXNzZXRTY3JpcHQ6IHRoaXMuX3NldEFzc2V0U2NyaXB0KGNoYWluQXJncyksXG4gICAgICAgICAgICBpbnZva2U6IHRoaXMuX2ludm9rZShjaGFpbkFyZ3MpLFxuICAgICAgICB9KSwgeyBzaWduOiBmdW5jdGlvbiAoKSB7IHJldHVybiBfdGhpc18xLl9zaWduKHR4cyk7IH0sIGJyb2FkY2FzdDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zaWduKClcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodHhzKSB7IHJldHVybiBfdGhpcy5icm9hZGNhc3QodHhzLCBvcHRpb25zKTsgfSk7XG4gICAgICAgICAgICB9IH0pO1xuICAgIH07XG4gICAgU2lnbmVyLnByb3RvdHlwZS5fdmFsaWRhdGUgPSBmdW5jdGlvbiAodG9TaWduKSB7XG4gICAgICAgIHZhciBzaWduZXJUeHMgPSBBcnJheS5pc0FycmF5KHRvU2lnbikgPyB0b1NpZ24gOiBbdG9TaWduXTtcbiAgICAgICAgdmFyIHZhbGlkYXRlVHggPSBmdW5jdGlvbiAodHgpIHsgcmV0dXJuIGFyZ3NWYWxpZGF0b3JzW3R4LnR5cGVdKHR4KTsgfTtcbiAgICAgICAgdmFyIGtub3duVHhQcmVkaWNhdGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGFyZ3NWYWxpZGF0b3JzKS5pbmNsdWRlcyhTdHJpbmcodHlwZSkpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgdW5rbm93blR4cyA9IHNpZ25lclR4cy5maWx0ZXIoZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICB2YXIgdHlwZSA9IF9hLnR5cGU7XG4gICAgICAgICAgICByZXR1cm4gIWtub3duVHhQcmVkaWNhdGUodHlwZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIga25vd25UeHMgPSBzaWduZXJUeHMuZmlsdGVyKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgdmFyIHR5cGUgPSBfYS50eXBlO1xuICAgICAgICAgICAgcmV0dXJuIGtub3duVHhQcmVkaWNhdGUodHlwZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgaW52YWxpZFR4cyA9IGtub3duVHhzXG4gICAgICAgICAgICAubWFwKHZhbGlkYXRlVHgpXG4gICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgdmFyIGlzVmFsaWQgPSBfYS5pc1ZhbGlkO1xuICAgICAgICAgICAgcmV0dXJuICFpc1ZhbGlkO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGludmFsaWRUeHMubGVuZ3RoID09PSAwICYmIHVua25vd25UeHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlLCBlcnJvcnM6IFtdIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yczogX19zcHJlYWRBcnJheXMoaW52YWxpZFR4cy5tYXAoZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2FjdGlvbiA9IF9hLnRyYW5zYWN0aW9uLCBzY29wZSA9IF9hLm1ldGhvZCwgaW52YWxpZEZpZWxkcyA9IF9hLmludmFsaWRGaWVsZHM7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIlZhbGlkYXRpb24gZXJyb3IgZm9yIFwiICsgc2NvcGUgKyBcIiB0cmFuc2FjdGlvbjogXCIgKyBKU09OLnN0cmluZ2lmeSh0cmFuc2FjdGlvbikgKyBcIi4gSW52YWxpZCBhcmd1bWVudHM6IFwiICsgKGludmFsaWRGaWVsZHMgPT09IG51bGwgfHwgaW52YWxpZEZpZWxkcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogaW52YWxpZEZpZWxkcy5qb2luKCcsICcpKTtcbiAgICAgICAgICAgICAgICB9KSwgdW5rbm93blR4cy5tYXAoZnVuY3Rpb24gKHR4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIlZhbGlkYXRpb24gZXJyb3IgZm9yIHRyYW5zYWN0aW9uIFwiICsgSlNPTi5zdHJpbmdpZnkodHgpICsgXCIuIFVua25vd24gdHJhbnNhY3Rpb24gdHlwZTogXCIgKyB0eC50eXBlO1xuICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFNpZ25lci5wcm90b3R5cGUuX3NpZ24gPSBmdW5jdGlvbiAodG9TaWduKSB7XG4gICAgICAgIHZhciB2YWxpZGF0aW9uID0gdGhpcy5fdmFsaWRhdGUodG9TaWduKTtcbiAgICAgICAgaWYgKHZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3RQcm9taXNlLnRoZW4oZnVuY3Rpb24gKHByb3ZpZGVyKSB7IHJldHVybiBwcm92aWRlci5zaWduKHRvU2lnbik7IH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGVycm9yID0gdGhpcy5faGFuZGxlRXJyb3IoRVJST1JTLkFQSV9BUkdVTUVOVFMsIFt2YWxpZGF0aW9uLmVycm9yc10pO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIF9fZGVjb3JhdGUoW1xuICAgICAgICBlbnN1cmVQcm92aWRlclxuICAgIF0sIFNpZ25lci5wcm90b3R5cGUsIFwib25cIiwgbnVsbCk7XG4gICAgX19kZWNvcmF0ZShbXG4gICAgICAgIGVuc3VyZVByb3ZpZGVyXG4gICAgXSwgU2lnbmVyLnByb3RvdHlwZSwgXCJvbmNlXCIsIG51bGwpO1xuICAgIF9fZGVjb3JhdGUoW1xuICAgICAgICBlbnN1cmVQcm92aWRlclxuICAgIF0sIFNpZ25lci5wcm90b3R5cGUsIFwib2ZmXCIsIG51bGwpO1xuICAgIF9fZGVjb3JhdGUoW1xuICAgICAgICBlbnN1cmVQcm92aWRlcixcbiAgICAgICAgY2hlY2tBdXRoXG4gICAgXSwgU2lnbmVyLnByb3RvdHlwZSwgXCJnZXRCYWxhbmNlXCIsIG51bGwpO1xuICAgIF9fZGVjb3JhdGUoW1xuICAgICAgICBlbnN1cmVQcm92aWRlclxuICAgIF0sIFNpZ25lci5wcm90b3R5cGUsIFwibG9naW5cIiwgbnVsbCk7XG4gICAgX19kZWNvcmF0ZShbXG4gICAgICAgIGVuc3VyZVByb3ZpZGVyXG4gICAgXSwgU2lnbmVyLnByb3RvdHlwZSwgXCJsb2dvdXRcIiwgbnVsbCk7XG4gICAgX19kZWNvcmF0ZShbXG4gICAgICAgIGNhdGNoUHJvdmlkZXJFcnJvclxuICAgIF0sIFNpZ25lci5wcm90b3R5cGUsIFwiX3NpZ25cIiwgbnVsbCk7XG4gICAgcmV0dXJuIFNpZ25lcjtcbn0oKSk7XG5leHBvcnQgeyBTaWduZXIgfTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZGVmYXVsdC1leHBvcnRcbmV4cG9ydCBkZWZhdWx0IFNpZ25lcjtcbiIsImltcG9ydCB7IF9fZXh0ZW5kcyB9IGZyb20gXCJ0c2xpYlwiO1xudmFyIFJFUE9TSVRPUllfVVJMID0gJ2h0dHA6Ly9naXRodWIuY29tL3dhdmVzcGxhdGZvcm0vc2lnbmVyJztcbmV4cG9ydCB2YXIgRVJST1JTID0ge1xuICAgIFNJR05FUl9PUFRJT05TOiAxMDAwLFxuICAgIE5FVFdPUktfQllURTogMTAwMSxcbiAgICBOT1RfQVVUSE9SSVpFRDogMTAwMixcbiAgICBQUk9WSURFUl9DT05ORUNUOiAxMDAzLFxuICAgIEVOU1VSRV9QUk9WSURFUjogMTAwNCxcbiAgICBQUk9WSURFUl9JTlRFUkZBQ0U6IDEwMDUsXG4gICAgUFJPVklERVJfSU5URVJOQUw6IDEwMDYsXG4gICAgQVBJX0FSR1VNRU5UUzogMTAwNyxcbiAgICBORVRXT1JLX0VSUk9SOiAxMDA4LFxufTtcbnZhciBlcnJvclRlbXBsYXRlID0gZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgdmFyIGRldGFpbHMgPSBlcnJvci5kZXRhaWxzXG4gICAgICAgID8gXCIgICAgRGV0YWlsczogXCIgKyBlcnJvci5kZXRhaWxzXG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiBbXG4gICAgICAgIFwiU2lnbmVyIGVycm9yOlwiLFxuICAgICAgICBcIiAgICBUaXRsZTogXCIgKyBlcnJvci50aXRsZSxcbiAgICAgICAgXCIgICAgVHlwZTogXCIgKyBlcnJvci50eXBlLFxuICAgICAgICBcIiAgICBDb2RlOiBcIiArIGVycm9yLmNvZGUsXG4gICAgICAgIGRldGFpbHMsXG4gICAgICAgIFwiICAgIE1vcmUgaW5mbzogXCIgKyBSRVBPU0lUT1JZX1VSTCArIFwiL1JFQURNRS5tZCNlcnJvci1jb2Rlc1wiLFxuICAgIF1cbiAgICAgICAgLmZpbHRlcihCb29sZWFuKVxuICAgICAgICAuam9pbignXFxuJyk7XG59O1xudmFyIFNpZ25lckVycm9yID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTaWduZXJFcnJvciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTaWduZXJFcnJvcihkZXRhaWxzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIGVycm9yVGVtcGxhdGUoZGV0YWlscykpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmNvZGUgPSBkZXRhaWxzLmNvZGU7XG4gICAgICAgIF90aGlzLnR5cGUgPSBkZXRhaWxzLnR5cGU7XG4gICAgICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGV4cGxpY2l0bHkuXG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihfdGhpcywgU2lnbmVyRXJyb3IucHJvdG90eXBlKTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICByZXR1cm4gU2lnbmVyRXJyb3I7XG59KEVycm9yKSk7XG5leHBvcnQgeyBTaWduZXJFcnJvciB9O1xudmFyIFNpZ25lck9wdGlvbnNFcnJvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU2lnbmVyT3B0aW9uc0Vycm9yLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFNpZ25lck9wdGlvbnNFcnJvcihhcmdzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIHtcbiAgICAgICAgICAgIGNvZGU6IEVSUk9SUy5TSUdORVJfT1BUSU9OUyxcbiAgICAgICAgICAgIHRpdGxlOiAnSW52YWxpZCBzaWduZXIgb3B0aW9ucycsXG4gICAgICAgICAgICB0eXBlOiAndmFsaWRhdGlvbicsXG4gICAgICAgICAgICBkZXRhaWxzOiBcIlxcbiAgICAgICAgSW52YWxpZCBzaWduZXIgb3B0aW9uczogXCIgKyBhcmdzLmpvaW4oJywgJyksXG4gICAgICAgICAgICBlcnJvckFyZ3M6IGFyZ3MsXG4gICAgICAgIH0pIHx8IHRoaXM7XG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihfdGhpcywgU2lnbmVyT3B0aW9uc0Vycm9yLnByb3RvdHlwZSk7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIFNpZ25lck9wdGlvbnNFcnJvcjtcbn0oU2lnbmVyRXJyb3IpKTtcbmV4cG9ydCB7IFNpZ25lck9wdGlvbnNFcnJvciB9O1xudmFyIFNpZ25lckFwaUFyZ3VtZW50c0Vycm9yID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTaWduZXJBcGlBcmd1bWVudHNFcnJvciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTaWduZXJBcGlBcmd1bWVudHNFcnJvcihhcmdzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIHtcbiAgICAgICAgICAgIGNvZGU6IEVSUk9SUy5BUElfQVJHVU1FTlRTLFxuICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIGFwaSBtZXRob2QgYXJndW1lbnRzJyxcbiAgICAgICAgICAgIHR5cGU6ICd2YWxpZGF0aW9uJyxcbiAgICAgICAgICAgIGRldGFpbHM6IFwiXFxuICAgICAgICBcIiArIGFyZ3Muam9pbignXFxuICAgICAgICAnKSxcbiAgICAgICAgICAgIGVycm9yQXJnczogYXJncyxcbiAgICAgICAgfSkgfHwgdGhpcztcbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKF90aGlzLCBTaWduZXJBcGlBcmd1bWVudHNFcnJvci5wcm90b3R5cGUpO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIHJldHVybiBTaWduZXJBcGlBcmd1bWVudHNFcnJvcjtcbn0oU2lnbmVyRXJyb3IpKTtcbmV4cG9ydCB7IFNpZ25lckFwaUFyZ3VtZW50c0Vycm9yIH07XG52YXIgU2lnbmVyTmV0d29ya0J5dGVFcnJvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU2lnbmVyTmV0d29ya0J5dGVFcnJvciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTaWduZXJOZXR3b3JrQnl0ZUVycm9yKF9hKSB7XG4gICAgICAgIHZhciBlcnJvciA9IF9hLmVycm9yLCBub2RlID0gX2Eubm9kZTtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywge1xuICAgICAgICAgICAgY29kZTogRVJST1JTLk5FVFdPUktfQllURSxcbiAgICAgICAgICAgIHRpdGxlOiAnTmV0d29yayBieXRlIGZldGNoaW5nIGhhcyBmYWlsZWQnLFxuICAgICAgICAgICAgdHlwZTogJ25ldHdvcmsnLFxuICAgICAgICAgICAgZGV0YWlsczogXCJcXG4gICAgICAgIENvdWxkIG5vdCBmZXRjaCBuZXR3b3JrIGZyb20gXCIgKyBub2RlICsgXCI6IFwiICsgZXJyb3IsXG4gICAgICAgICAgICBlcnJvckFyZ3M6IHsgZXJyb3I6IGVycm9yLCBub2RlOiBub2RlIH0sXG4gICAgICAgIH0pIHx8IHRoaXM7XG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihfdGhpcywgU2lnbmVyTmV0d29ya0J5dGVFcnJvci5wcm90b3R5cGUpO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIHJldHVybiBTaWduZXJOZXR3b3JrQnl0ZUVycm9yO1xufShTaWduZXJFcnJvcikpO1xuZXhwb3J0IHsgU2lnbmVyTmV0d29ya0J5dGVFcnJvciB9O1xudmFyIFNpZ25lclByb3ZpZGVySW50ZXJmYWNlRXJyb3IgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFNpZ25lclByb3ZpZGVySW50ZXJmYWNlRXJyb3IsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU2lnbmVyUHJvdmlkZXJJbnRlcmZhY2VFcnJvcihpbnZhbGlkUHJvcGVydGllcykge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCB7XG4gICAgICAgICAgICBjb2RlOiBFUlJPUlMuTkVUV09SS19CWVRFLFxuICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIFByb3ZpZGVyIGludGVyZmFjZScsXG4gICAgICAgICAgICB0eXBlOiAndmFsaWRhdGlvbicsXG4gICAgICAgICAgICBkZXRhaWxzOiBcIlxcbiAgICAgICAgSW52YWxpZCBwcm92aWRlciBwcm9wZXJ0aWVzOiBcIiArIGludmFsaWRQcm9wZXJ0aWVzLmpvaW4oJywgJyksXG4gICAgICAgICAgICBlcnJvckFyZ3M6IGludmFsaWRQcm9wZXJ0aWVzLFxuICAgICAgICB9KSB8fCB0aGlzO1xuICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoX3RoaXMsIFNpZ25lclByb3ZpZGVySW50ZXJmYWNlRXJyb3IucHJvdG90eXBlKTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICByZXR1cm4gU2lnbmVyUHJvdmlkZXJJbnRlcmZhY2VFcnJvcjtcbn0oU2lnbmVyRXJyb3IpKTtcbmV4cG9ydCB7IFNpZ25lclByb3ZpZGVySW50ZXJmYWNlRXJyb3IgfTtcbnZhciBTaWduZXJQcm92aWRlckNvbm5lY3RFcnJvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU2lnbmVyUHJvdmlkZXJDb25uZWN0RXJyb3IsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU2lnbmVyUHJvdmlkZXJDb25uZWN0RXJyb3IoX2EpIHtcbiAgICAgICAgdmFyIGVycm9yID0gX2EuZXJyb3IsIG5vZGUgPSBfYS5ub2RlO1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCB7XG4gICAgICAgICAgICBjb2RlOiBFUlJPUlMuUFJPVklERVJfQ09OTkVDVCxcbiAgICAgICAgICAgIHRpdGxlOiAnQ291bGQgbm90IGNvbm5lY3QgdGhlIFByb3ZpZGVyJyxcbiAgICAgICAgICAgIHR5cGU6ICduZXR3b3JrJyxcbiAgICAgICAgICAgIGVycm9yQXJnczogeyBlcnJvcjogZXJyb3IsIG5vZGU6IG5vZGUgfSxcbiAgICAgICAgfSkgfHwgdGhpcztcbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKF90aGlzLCBTaWduZXJQcm92aWRlckNvbm5lY3RFcnJvci5wcm90b3R5cGUpO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIHJldHVybiBTaWduZXJQcm92aWRlckNvbm5lY3RFcnJvcjtcbn0oU2lnbmVyRXJyb3IpKTtcbmV4cG9ydCB7IFNpZ25lclByb3ZpZGVyQ29ubmVjdEVycm9yIH07XG52YXIgU2lnbmVyRW5zdXJlUHJvdmlkZXJFcnJvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU2lnbmVyRW5zdXJlUHJvdmlkZXJFcnJvciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTaWduZXJFbnN1cmVQcm92aWRlckVycm9yKG1ldGhvZCkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCB7XG4gICAgICAgICAgICBjb2RlOiBFUlJPUlMuRU5TVVJFX1BST1ZJREVSLFxuICAgICAgICAgICAgdGl0bGU6ICdQcm92aWRlciBpbnN0YW5jZSBpcyBtaXNzaW5nJyxcbiAgICAgICAgICAgIHR5cGU6ICdwcm92aWRlcicsXG4gICAgICAgICAgICBkZXRhaWxzOiBcIkNhbid0IHVzZSBtZXRob2Q6IFwiICsgbWV0aG9kICsgXCIuIFByb3ZpZGVyIGluc3RhbmNlIGlzIG1pc3NpbmdcIixcbiAgICAgICAgICAgIGVycm9yQXJnczogeyBmYWlsZWRNZXRob2Q6IG1ldGhvZCB9LFxuICAgICAgICB9KSB8fCB0aGlzO1xuICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoX3RoaXMsIFNpZ25lclByb3ZpZGVyQ29ubmVjdEVycm9yLnByb3RvdHlwZSk7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIFNpZ25lckVuc3VyZVByb3ZpZGVyRXJyb3I7XG59KFNpZ25lckVycm9yKSk7XG5leHBvcnQgeyBTaWduZXJFbnN1cmVQcm92aWRlckVycm9yIH07XG52YXIgU2lnbmVyUHJvdmlkZXJJbnRlcm5hbEVycm9yID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTaWduZXJQcm92aWRlckludGVybmFsRXJyb3IsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU2lnbmVyUHJvdmlkZXJJbnRlcm5hbEVycm9yKG1lc3NhZ2UpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywge1xuICAgICAgICAgICAgY29kZTogRVJST1JTLkVOU1VSRV9QUk9WSURFUixcbiAgICAgICAgICAgIHRpdGxlOiAnUHJvdmlkZXIgaW50ZXJuYWwgZXJyb3InLFxuICAgICAgICAgICAgdHlwZTogJ3Byb3ZpZGVyJyxcbiAgICAgICAgICAgIGRldGFpbHM6IFwiUHJvdmlkZXIgaW50ZXJuYWwgZXJyb3I6IFwiICsgbWVzc2FnZSArIFwiLiBUaGlzIGlzIG5vdCBlcnJvciBvZiBzaWduZXIuXCIsXG4gICAgICAgICAgICBlcnJvckFyZ3M6IHsgZXJyb3JNZXNzYWdlOiBtZXNzYWdlIH0sXG4gICAgICAgIH0pIHx8IHRoaXM7XG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihfdGhpcywgU2lnbmVyUHJvdmlkZXJDb25uZWN0RXJyb3IucHJvdG90eXBlKTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICByZXR1cm4gU2lnbmVyUHJvdmlkZXJJbnRlcm5hbEVycm9yO1xufShTaWduZXJFcnJvcikpO1xuZXhwb3J0IHsgU2lnbmVyUHJvdmlkZXJJbnRlcm5hbEVycm9yIH07XG52YXIgU2lnbmVyQXV0aEVycm9yID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTaWduZXJBdXRoRXJyb3IsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU2lnbmVyQXV0aEVycm9yKG1ldGhvZCkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCB7XG4gICAgICAgICAgICBjb2RlOiBFUlJPUlMuTk9UX0FVVEhPUklaRUQsXG4gICAgICAgICAgICB0aXRsZTogJ0F1dGhvcml6YXRpb24gZXJyb3InLFxuICAgICAgICAgICAgdHlwZTogJ2F1dGhvcml6YXRpb24nLFxuICAgICAgICAgICAgZGV0YWlsczogXCJDYW4ndCB1c2UgbWV0aG9kOiBcIiArIG1ldGhvZCArIFwiLiBVc2VyIG11c3QgYmUgbG9nZ2VkIGluXCIsXG4gICAgICAgICAgICBlcnJvckFyZ3M6IHsgZmFpbGVkTWV0aG9kOiBtZXRob2QgfSxcbiAgICAgICAgfSkgfHwgdGhpcztcbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKF90aGlzLCBTaWduZXJQcm92aWRlckNvbm5lY3RFcnJvci5wcm90b3R5cGUpO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIHJldHVybiBTaWduZXJBdXRoRXJyb3I7XG59KFNpZ25lckVycm9yKSk7XG5leHBvcnQgeyBTaWduZXJBdXRoRXJyb3IgfTtcbnZhciBTaWduZXJOZXR3b3JrRXJyb3IgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFNpZ25lck5ldHdvcmtFcnJvciwgX3N1cGVyKTtcbiAgICAvLyBUT0RPIFJFTU9WRSBBTlksIEFERCBNT1JFIERFVEFJTFNcbiAgICBmdW5jdGlvbiBTaWduZXJOZXR3b3JrRXJyb3IocGFyYW1zKSB7XG4gICAgICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzLCB7XG4gICAgICAgICAgICBjb2RlOiBFUlJPUlMuTkVUV09SS19FUlJPUixcbiAgICAgICAgICAgIHRpdGxlOiAnTmV0d29yayBFcnJvcicsXG4gICAgICAgICAgICB0eXBlOiAnbmV0d29yaycsXG4gICAgICAgICAgICBkZXRhaWxzOiBcIkVycm9yIGNvbm5lY3QgdG8gXCIgKyAnJyxcbiAgICAgICAgICAgIGVycm9yQXJnczoge30sXG4gICAgICAgIH0pIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBTaWduZXJOZXR3b3JrRXJyb3I7XG59KFNpZ25lckVycm9yKSk7XG5leHBvcnQgeyBTaWduZXJOZXR3b3JrRXJyb3IgfTtcbiIsImV4cG9ydCB2YXIgREVGQVVMVF9PUFRJT05TID0ge1xuICAgIE5PREVfVVJMOiAnaHR0cHM6Ly9ub2Rlcy53YXZlc3BsYXRmb3JtLmNvbScsXG4gICAgTE9HX0xFVkVMOiAncHJvZHVjdGlvbicsXG59O1xuZXhwb3J0IHZhciBERUZBVUxUX0JST0FEQ0FTVF9PUFRJT05TID0ge1xuICAgIGNoYWluOiBmYWxzZSxcbiAgICBjb25maXJtYXRpb25zOiAtMSxcbn07XG5leHBvcnQgdmFyIE1BWF9BTElBU19MRU5HVEggPSAzMDtcbmV4cG9ydCB2YXIgU01BUlRfQVNTRVRfRVhUUkFfRkVFID0gMC4wMDQgKiBNYXRoLnBvdygxMCwgOCk7XG4iLCJpbXBvcnQgeyBTaWduZXJFcnJvciwgRVJST1JTIH0gZnJvbSAnLi9TaWduZXJFcnJvcic7XG52YXIgZ2V0RXJyb3JIYW5kbGVyID0gZnVuY3Rpb24gKHNpZ25lcikge1xuICAgIHJldHVybiBzaWduZXIuX2hhbmRsZUVycm9yO1xufTtcbmV4cG9ydCB2YXIgZW5zdXJlUHJvdmlkZXIgPSBmdW5jdGlvbiAodGFyZ2V0LCBwcm9wZXJ0eUtleSwgZGVzY3JpcHRvcikge1xuICAgIHZhciBvcmlnaW4gPSBkZXNjcmlwdG9yLnZhbHVlO1xuICAgIGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByb3ZpZGVyID0gdGhpcy5jdXJyZW50UHJvdmlkZXI7XG4gICAgICAgIGlmICghcHJvdmlkZXIpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gZ2V0RXJyb3JIYW5kbGVyKHRoaXMpO1xuICAgICAgICAgICAgdmFyIGVycm9yID0gaGFuZGxlcihFUlJPUlMuRU5TVVJFX1BST1ZJREVSLCBbcHJvcGVydHlLZXldKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcmlnaW4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfTtcbn07XG5leHBvcnQgdmFyIGNhdGNoUHJvdmlkZXJFcnJvciA9IGZ1bmN0aW9uICh0YXJnZXQsIHByb3BlcnR5S2V5LCBkZXNjcmlwdG9yKSB7XG4gICAgdmFyIG9yaWdpbiA9IGRlc2NyaXB0b3IudmFsdWU7XG4gICAgZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3JpZ2luLmFwcGx5KHRoaXMsIGFyZ3MpLmNhdGNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoZSA9PT0gJ0Vycm9yOiBVc2VyIHJlamVjdGlvbiEnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBTaWduZXJFcnJvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gZ2V0RXJyb3JIYW5kbGVyKF90aGlzKTtcbiAgICAgICAgICAgIHZhciBlcnJvciA9IGhhbmRsZXIoRVJST1JTLlBST1ZJREVSX0lOVEVSTkFMLCBbZS5tZXNzYWdlXSk7XG4gICAgICAgICAgICBfdGhpcy5fY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59O1xuZXhwb3J0IHZhciBjaGVja0F1dGggPSBmdW5jdGlvbiAodGFyZ2V0LCBwcm9wZXJ0eUtleSwgZGVzY3JpcHRvcikge1xuICAgIHZhciBvcmlnaW4gPSBkZXNjcmlwdG9yLnZhbHVlO1xuICAgIGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFByb3ZpZGVyLnVzZXIgPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBnZXRFcnJvckhhbmRsZXIodGhpcyk7XG4gICAgICAgICAgICB2YXIgZXJyb3IgPSBoYW5kbGVyKEVSUk9SUy5OT1RfQVVUSE9SSVpFRCwgW3Byb3BlcnR5S2V5XSk7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3JpZ2luLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH07XG59O1xuZXhwb3J0IHZhciBjYXRjaE5ldHdvcmtFcnJvcnMgPSBmdW5jdGlvbiAoY2hlY2tEYXRhKSB7IHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBwcm9wZXJ0eUtleSwgZGVzY3JpcHRvcikge1xuICAgIHZhciBvcmlnaW4gPSBkZXNjcmlwdG9yLnZhbHVlO1xuICAgIGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoZWNrRGF0YS5pc01hdGNoZXIpIHtcbiAgICAgICAgICAgIC8vIFRPRE9cbiAgICAgICAgICAgIC8vIGlmICghdGhpcy5fb3B0aW9ucy5NQVRDSEVSX1VSTCkge1xuICAgICAgICAgICAgLy8gICAgIGNvbnN0IGVycm9yID0gbmV3IFNpZ25lckVycm9yKFxuICAgICAgICAgICAgLy8gICAgICAgICBFUlJPUl9DT0RFX01BUC5OT19NQVRDSEVSX1VSTF9QUk9WSURFRCxcbiAgICAgICAgICAgIC8vICAgICAgICAgdm9pZCAwXG4gICAgICAgICAgICAvLyAgICAgKTtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAgICAgdGhpcy5fY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9yaWdpbi5hcHBseSh0aGlzLCBhcmdzKS5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBTaWduZXJFcnJvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gZ2V0RXJyb3JIYW5kbGVyKF90aGlzKTtcbiAgICAgICAgICAgIC8vIFRPRE8gUHJvdmlkZSBtb3JlIGRldGFpbHMgZm9yIHJlcXVlc3QgZXJyb3IhXG4gICAgICAgICAgICB2YXIgZXJyb3IgPSBoYW5kbGVyKEVSUk9SUy5ORVRXT1JLX0VSUk9SLCBbe31dKTtcbiAgICAgICAgICAgIF90aGlzLl9jb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH07XG59OyB9O1xuIiwidmFyIF9hO1xuaW1wb3J0IHsgX19zcHJlYWRBcnJheXMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IEVSUk9SUywgU2lnbmVyQXBpQXJndW1lbnRzRXJyb3IsIFNpZ25lckF1dGhFcnJvciwgU2lnbmVyRW5zdXJlUHJvdmlkZXJFcnJvciwgU2lnbmVyTmV0d29ya0J5dGVFcnJvciwgU2lnbmVyTmV0d29ya0Vycm9yLCBTaWduZXJPcHRpb25zRXJyb3IsIFNpZ25lclByb3ZpZGVyQ29ubmVjdEVycm9yLCBTaWduZXJQcm92aWRlckludGVyZmFjZUVycm9yLCBTaWduZXJQcm92aWRlckludGVybmFsRXJyb3IsIH0gZnJvbSAnLi9TaWduZXJFcnJvcic7XG52YXIgRVJST1JTX01BUCA9IChfYSA9IHt9LFxuICAgIF9hW0VSUk9SUy5TSUdORVJfT1BUSU9OU10gPSBTaWduZXJPcHRpb25zRXJyb3IsXG4gICAgX2FbRVJST1JTLk5FVFdPUktfQllURV0gPSBTaWduZXJOZXR3b3JrQnl0ZUVycm9yLFxuICAgIF9hW0VSUk9SUy5QUk9WSURFUl9JTlRFUkZBQ0VdID0gU2lnbmVyUHJvdmlkZXJJbnRlcmZhY2VFcnJvcixcbiAgICBfYVtFUlJPUlMuQVBJX0FSR1VNRU5UU10gPSBTaWduZXJBcGlBcmd1bWVudHNFcnJvcixcbiAgICBfYVtFUlJPUlMuUFJPVklERVJfQ09OTkVDVF0gPSBTaWduZXJQcm92aWRlckNvbm5lY3RFcnJvcixcbiAgICBfYVtFUlJPUlMuRU5TVVJFX1BST1ZJREVSXSA9IFNpZ25lckVuc3VyZVByb3ZpZGVyRXJyb3IsXG4gICAgX2FbRVJST1JTLlBST1ZJREVSX0lOVEVSTkFMXSA9IFNpZ25lclByb3ZpZGVySW50ZXJuYWxFcnJvcixcbiAgICBfYVtFUlJPUlMuTk9UX0FVVEhPUklaRURdID0gU2lnbmVyQXV0aEVycm9yLFxuICAgIF9hW0VSUk9SUy5ORVRXT1JLX0VSUk9SXSA9IFNpZ25lck5ldHdvcmtFcnJvcixcbiAgICBfYSk7XG5leHBvcnQgdmFyIGVycm9ySGFuZGxlckZhY3RvcnkgPSBmdW5jdGlvbiAobG9nZ2VyKSB7IHJldHVybiBmdW5jdGlvbiAoZXJyb3JDb2RlLCBwYXJhbWV0ZXJzKSB7XG4gICAgdmFyIF9hO1xuICAgIHZhciBlcnJvciA9IG5ldyAoKF9hID0gRVJST1JTX01BUFtlcnJvckNvZGVdKS5iaW5kLmFwcGx5KF9hLCBfX3NwcmVhZEFycmF5cyhbdm9pZCAwXSwgKHBhcmFtZXRlcnMgfHwgW10pKSkpKCk7XG4gICAgbG9nZ2VyLmxvZyhlcnJvci50b1N0cmluZygpKTtcbiAgICB0aHJvdyBlcnJvcjtcbn07IH07XG4iLCJleHBvcnQgKiBmcm9tICcuL3R5cGVzL2FwaSc7XG5leHBvcnQgKiBmcm9tICcuL3R5cGVzL2luZGV4JztcbmV4cG9ydCAqIGZyb20gJy4vU2lnbmVyJztcbmV4cG9ydCAqIGZyb20gJy4vdHlwZXMvYXBpJztcbmV4cG9ydCAqIGZyb20gJy4vdHlwZXMvaW5kZXgnO1xuIiwiIiwiIiwidmFyIF9hO1xuaW1wb3J0IHsgX19hc3NpZ24gfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCBkZWZhdWx0VG8gZnJvbSAncmFtZGEvc3JjL2RlZmF1bHRUbyc7XG5pbXBvcnQgcHJvcCBmcm9tICdyYW1kYS9zcmMvcHJvcCc7XG5pbXBvcnQgaWZFbHNlIGZyb20gJ3JhbWRhL3NyYy9pZkVsc2UnO1xuaW1wb3J0IHBpcGUgZnJvbSAncmFtZGEvc3JjL3BpcGUnO1xuaW1wb3J0IGVxdWFscyBmcm9tICdyYW1kYS9zcmMvZXF1YWxzJztcbmltcG9ydCBsdGUgZnJvbSAncmFtZGEvc3JjL2x0ZSc7XG5pbXBvcnQgbm90IGZyb20gJ3JhbWRhL3NyYy9ub3QnO1xuaW1wb3J0IHsgbm9vcCwgaXNOdW1iZXJMaWtlLCBpc051bWJlciwgaXNCb29sZWFuLCB2YWxpZGF0ZVBpcGUsIGlzUmVxdWlyZWQsIG9yRXEsIGlzQXJyYXksIGlzU3RyaW5nLCB2YWxpZGF0ZUJ5U2NoZW1hIGFzIHZhbGlkYXRlQnlTaGVtZSwgaXNBdHRhY2htZW50LCBpc1B1YmxpY0tleSwgaXNWYWxpZEFzc2V0TmFtZSwgaXNWYWxpZEFzc2V0RGVzY3JpcHRpb24sIGlzQmFzZTY0LCBpc1JlY2lwaWVudCwgaXNBc3NldElkLCBpc1ZhbGlkRGF0YSwgb3JkZXJWYWxpZGF0b3IsIGlzVmFsaWRBbGlhc05hbWUsIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IFRSQU5TQUNUSU9OX1RZUEUgfSBmcm9tICdAd2F2ZXMvdHMtdHlwZXMnO1xudmFyIHNob3VsZFZhbGlkYXRlID0gcGlwZShlcXVhbHModW5kZWZpbmVkKSwgbm90KTtcbnZhciB2YWxpZGF0ZU9wdGlvbmFsID0gZnVuY3Rpb24gKHZhbGlkYXRvcikge1xuICAgIHJldHVybiBpZkVsc2Uoc2hvdWxkVmFsaWRhdGUsIHZhbGlkYXRvciwgZGVmYXVsdFRvKHRydWUpKTtcbn07XG4vLyB3YXZlcy10cmFuc2FjdGlvbiB2YWxpZGF0b3IgY2FuJ3QgY29sbGVjdCBlcnJvcnMgZm9yIGVhY2ggaW52YWxpZCBmaWVsZC5cbi8vIFRoaXMgbWV0aG9kIGRvZXMuXG5leHBvcnQgdmFyIHZhbGlkYXRvciA9IGZ1bmN0aW9uIChzY2hlbWUsIG1ldGhvZCkgeyByZXR1cm4gZnVuY3Rpb24gKHRyYW5zYWN0aW9uKSB7XG4gICAgdmFyIF9hO1xuICAgIHZhciBpbnZhbGlkRmllbGRzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwLCBfYiA9IE9iamVjdC5lbnRyaWVzKHNjaGVtZSk7IF9pIDwgX2IubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciBfYyA9IF9iW19pXSwgZmllbGROYW1lID0gX2NbMF0sIHZhbGlkYXRpb25TY2hlbWUgPSBfY1sxXTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhbGlkYXRlQnlTaGVtZSgoX2EgPSB7fSwgX2FbZmllbGROYW1lXSA9IHZhbGlkYXRpb25TY2hlbWUsIF9hKSwgXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWZ1bmN0aW9uXG4gICAgICAgICAgICBub29wKSh0cmFuc2FjdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBpbnZhbGlkRmllbGRzLnB1c2goZmllbGROYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBpc1ZhbGlkOiBpbnZhbGlkRmllbGRzLmxlbmd0aCA9PT0gMCxcbiAgICAgICAgdHJhbnNhY3Rpb246IHRyYW5zYWN0aW9uLFxuICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgaW52YWxpZEZpZWxkczogaW52YWxpZEZpZWxkcyxcbiAgICB9O1xufTsgfTtcbnZhciBnZXRDb21tb25WYWxpZGF0b3JzID0gZnVuY3Rpb24gKHRyYW5zYWN0aW9uVHlwZSkgeyByZXR1cm4gKHtcbiAgICB0eXBlOiBlcXVhbHModHJhbnNhY3Rpb25UeXBlKSxcbiAgICB2ZXJzaW9uOiB2YWxpZGF0ZU9wdGlvbmFsKG9yRXEoW3VuZGVmaW5lZCwgMSwgMiwgM10pKSxcbiAgICBzZW5kZXJQdWJsaWNLZXk6IHZhbGlkYXRlT3B0aW9uYWwoaXNQdWJsaWNLZXkpLFxuICAgIGZlZTogdmFsaWRhdGVPcHRpb25hbChpc051bWJlckxpa2UpLFxuICAgIHByb29mczogdmFsaWRhdGVPcHRpb25hbChpc0FycmF5KSxcbn0pOyB9O1xuZXhwb3J0IHZhciBpc3N1ZUFyZ3NTY2hlbWUgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZ2V0Q29tbW9uVmFsaWRhdG9ycyhUUkFOU0FDVElPTl9UWVBFLklTU1VFKSksIHsgbmFtZTogaXNWYWxpZEFzc2V0TmFtZSwgZGVzY3JpcHRpb246IHZhbGlkYXRlT3B0aW9uYWwoaXNWYWxpZEFzc2V0RGVzY3JpcHRpb24pLCBxdWFudGl0eTogaXNOdW1iZXJMaWtlLCBkZWNpbWFsczogaXNOdW1iZXIsIHJlaXNzdWFibGU6IHZhbGlkYXRlT3B0aW9uYWwoaXNCb29sZWFuKSwgc2NyaXB0OiB2YWxpZGF0ZU9wdGlvbmFsKGlzQmFzZTY0KSwgY2hhaW5JZDogdmFsaWRhdGVPcHRpb25hbChpc051bWJlcikgfSk7XG5leHBvcnQgdmFyIGlzc3VlQXJnc1ZhbGlkYXRvciA9IHZhbGlkYXRvcihpc3N1ZUFyZ3NTY2hlbWUsICdpc3N1ZScpO1xuZXhwb3J0IHZhciB0cmFuc2ZlckFyZ3NTY2hlbWUgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZ2V0Q29tbW9uVmFsaWRhdG9ycyhUUkFOU0FDVElPTl9UWVBFLlRSQU5TRkVSKSksIHsgYW1vdW50OiBpc051bWJlckxpa2UsIHJlY2lwaWVudDogaXNSZWNpcGllbnQsIGFzc2V0SWQ6IHZhbGlkYXRlT3B0aW9uYWwoaXNBc3NldElkKSwgZmVlQXNzZXRJZDogdmFsaWRhdGVPcHRpb25hbChpc0Fzc2V0SWQpLCBhdHRhY2htZW50OiB2YWxpZGF0ZU9wdGlvbmFsKGlzQXR0YWNobWVudCkgfSk7XG5leHBvcnQgdmFyIHRyYW5zZmVyQXJnc1ZhbGlkYXRvciA9IHZhbGlkYXRvcih0cmFuc2ZlckFyZ3NTY2hlbWUsICd0cmFuc2ZlcicpO1xuZXhwb3J0IHZhciByZWlzc3VlQXJnc1NjaGVtZSA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBnZXRDb21tb25WYWxpZGF0b3JzKFRSQU5TQUNUSU9OX1RZUEUuUkVJU1NVRSkpLCB7IGFzc2V0SWQ6IGlzQXNzZXRJZCwgcXVhbnRpdHk6IGlzTnVtYmVyTGlrZSwgcmVpc3N1YWJsZTogaXNCb29sZWFuLCBjaGFpbklkOiB2YWxpZGF0ZU9wdGlvbmFsKGlzTnVtYmVyKSB9KTtcbmV4cG9ydCB2YXIgcmVpc3N1ZUFyZ3NWYWxpZGF0b3IgPSB2YWxpZGF0b3IocmVpc3N1ZUFyZ3NTY2hlbWUsICdyZWlzc3VlJyk7XG5leHBvcnQgdmFyIGJ1cm5BcmdzU2NoZW1lID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGdldENvbW1vblZhbGlkYXRvcnMoVFJBTlNBQ1RJT05fVFlQRS5CVVJOKSksIHsgXG4gICAgLy8gVE9ETyBpc0Fzc2V0SWQgKG5vdCBXQVZFUylcbiAgICBhc3NldElkOiBpc1N0cmluZywgYW1vdW50OiBpc051bWJlckxpa2UsIGNoYWluSWQ6IHZhbGlkYXRlT3B0aW9uYWwoaXNOdW1iZXIpIH0pO1xuZXhwb3J0IHZhciBidXJuQXJnc1ZhbGlkYXRvciA9IHZhbGlkYXRvcihidXJuQXJnc1NjaGVtZSwgJ2J1cm4nKTtcbmV4cG9ydCB2YXIgbGVhc2VBcmdzU2NoZW1lID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGdldENvbW1vblZhbGlkYXRvcnMoVFJBTlNBQ1RJT05fVFlQRS5MRUFTRSkpLCB7IGFtb3VudDogaXNOdW1iZXJMaWtlLCByZWNpcGllbnQ6IGlzUmVjaXBpZW50IH0pO1xuZXhwb3J0IHZhciBsZWFzZUFyZ3NWYWxpZGF0b3IgPSB2YWxpZGF0b3IobGVhc2VBcmdzU2NoZW1lLCAnbGVhc2UnKTtcbmV4cG9ydCB2YXIgY2FuY2VsTGVhc2VBcmdzU2NoZW1lID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGdldENvbW1vblZhbGlkYXRvcnMoVFJBTlNBQ1RJT05fVFlQRS5DQU5DRUxfTEVBU0UpKSwgeyBsZWFzZUlkOiBwaXBlKGlzU3RyaW5nKSwgY2hhaW5JZDogdmFsaWRhdGVPcHRpb25hbChpc051bWJlcikgfSk7XG5leHBvcnQgdmFyIGNhbmNlbExlYXNlQXJnc1ZhbGlkYXRvciA9IHZhbGlkYXRvcihjYW5jZWxMZWFzZUFyZ3NTY2hlbWUsICdjYW5jZWwgbGVhc2UnKTtcbmV4cG9ydCB2YXIgYWxpYXNBcmdzU2NoZW1lID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGdldENvbW1vblZhbGlkYXRvcnMoVFJBTlNBQ1RJT05fVFlQRS5BTElBUykpLCB7IGFsaWFzOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyBpc1ZhbGlkQWxpYXNOYW1lKHZhbHVlKSA6IGZhbHNlO1xuICAgIH0gfSk7XG5leHBvcnQgdmFyIGFsaWFzQXJnc1ZhbGlkYXRvciA9IHZhbGlkYXRvcihhbGlhc0FyZ3NTY2hlbWUsICdhbGlhcycpO1xuZXhwb3J0IHZhciBtYXNzVHJhbnNmZXJBcmdzU2NoZW1lID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGdldENvbW1vblZhbGlkYXRvcnMoVFJBTlNBQ1RJT05fVFlQRS5NQVNTX1RSQU5TRkVSKSksIHsgdHJhbnNmZXJzOiB2YWxpZGF0ZVBpcGUoaXNBcnJheSwgcGlwZShwcm9wKCdsZW5ndGgnKSwgbHRlKDApKSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEuZXZlcnkodmFsaWRhdGVQaXBlKGlzUmVxdWlyZWQodHJ1ZSksIHBpcGUocHJvcCgncmVjaXBpZW50JyksIGlzUmVjaXBpZW50KSwgcGlwZShwcm9wKCdhbW91bnQnKSwgaXNOdW1iZXJMaWtlKSkpO1xuICAgIH0pLCBhc3NldElkOiB2YWxpZGF0ZU9wdGlvbmFsKGlzQXNzZXRJZCksIGF0dGFjaG1lbnQ6IHZhbGlkYXRlT3B0aW9uYWwoaXNBdHRhY2htZW50KSB9KTtcbmV4cG9ydCB2YXIgbWFzc1RyYW5zZmVyQXJnc1ZhbGlkYXRvciA9IHZhbGlkYXRvcihtYXNzVHJhbnNmZXJBcmdzU2NoZW1lLCAnbWFzcyB0cmFuc2ZlcicpO1xuZXhwb3J0IHZhciBkYXRhQXJnc1NjaGVtZSA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBnZXRDb21tb25WYWxpZGF0b3JzKFRSQU5TQUNUSU9OX1RZUEUuREFUQSkpLCB7IGRhdGE6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBpc0FycmF5KGRhdGEpICYmIGRhdGEuZXZlcnkoZnVuY3Rpb24gKGl0ZW0pIHsgcmV0dXJuIGlzVmFsaWREYXRhKGl0ZW0pOyB9KTtcbiAgICB9IH0pO1xuZXhwb3J0IHZhciBkYXRhQXJnc1ZhbGlkYXRvciA9IHZhbGlkYXRvcihkYXRhQXJnc1NjaGVtZSwgJ2RhdGEnKTsgLy8gVE9ETyBmaXggYW55XG5leHBvcnQgdmFyIHNldFNjcmlwdEFyZ3NTY2hlbWUgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZ2V0Q29tbW9uVmFsaWRhdG9ycyhUUkFOU0FDVElPTl9UWVBFLlNFVF9TQ1JJUFQpKSwgeyBzY3JpcHQ6IGlzQmFzZTY0LCBjaGFpbklkOiB2YWxpZGF0ZU9wdGlvbmFsKGlzTnVtYmVyKSB9KTtcbmV4cG9ydCB2YXIgc2V0U2NyaXB0QXJnc1ZhbGlkYXRvciA9IHZhbGlkYXRvcihzZXRTY3JpcHRBcmdzU2NoZW1lLCAnc2V0IHNjcmlwdCcpO1xuZXhwb3J0IHZhciBzcG9uc29yc2hpcEFyZ3NTY2hlbWUgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZ2V0Q29tbW9uVmFsaWRhdG9ycyhUUkFOU0FDVElPTl9UWVBFLlNQT05TT1JTSElQKSksIHsgXG4gICAgLy8gVE9ETyBBZGQgbm90IFdBVkVTIEFTU0VUIElEXG4gICAgYXNzZXRJZDogaXNTdHJpbmcsIG1pblNwb25zb3JlZEFzc2V0RmVlOiBpc051bWJlckxpa2UgfSk7XG5leHBvcnQgdmFyIHNwb25zb3JzaGlwQXJnc1ZhbGlkYXRvciA9IHZhbGlkYXRvcihzcG9uc29yc2hpcEFyZ3NTY2hlbWUsICdzcG9uc29yc2hpcCcpO1xuZXhwb3J0IHZhciBleGNoYW5nZUFyZ3NTY2hlbWUgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZ2V0Q29tbW9uVmFsaWRhdG9ycyhUUkFOU0FDVElPTl9UWVBFLkVYQ0hBTkdFKSksIHsgb3JkZXIxOiB2YWxpZGF0ZVBpcGUoaXNSZXF1aXJlZCh0cnVlKSwgb3JkZXJWYWxpZGF0b3IpLCBvcmRlcjI6IHZhbGlkYXRlUGlwZShpc1JlcXVpcmVkKHRydWUpLCBvcmRlclZhbGlkYXRvciksIGFtb3VudDogaXNOdW1iZXJMaWtlLCBwcmljZTogaXNOdW1iZXJMaWtlLCBidXlNYXRjaGVyRmVlOiBpc051bWJlckxpa2UsIHNlbGxNYXRjaGVyRmVlOiBpc051bWJlckxpa2UgfSk7XG5leHBvcnQgdmFyIGV4Y2hhbmdlQXJnc1ZhbGlkYXRvciA9IHZhbGlkYXRvcihleGNoYW5nZUFyZ3NTY2hlbWUsICdleGNoYW5nZScpO1xuZXhwb3J0IHZhciBzZXRBc3NldFNjcmlwdEFyZ3NTY2hlbWUgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZ2V0Q29tbW9uVmFsaWRhdG9ycyhUUkFOU0FDVElPTl9UWVBFLlNFVF9BU1NFVF9TQ1JJUFQpKSwgeyBzY3JpcHQ6IGlzQmFzZTY0LCBhc3NldElkOiBpc0Fzc2V0SWQsIGNoYWluSWQ6IHZhbGlkYXRlT3B0aW9uYWwoaXNOdW1iZXIpIH0pO1xuZXhwb3J0IHZhciBzZXRBc3NldFNjcmlwdEFyZ3NWYWxpZGF0b3IgPSB2YWxpZGF0b3Ioc2V0QXNzZXRTY3JpcHRBcmdzU2NoZW1lLCAnc2V0IGFzc2V0IHNjcmlwdCcpO1xuZXhwb3J0IHZhciBpbnZva2VBcmdzU2NoZW1lID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGdldENvbW1vblZhbGlkYXRvcnMoVFJBTlNBQ1RJT05fVFlQRS5JTlZPS0VfU0NSSVBUKSksIHsgZEFwcDogaXNSZWNpcGllbnQsIGNhbGw6IHZhbGlkYXRlT3B0aW9uYWwodmFsaWRhdGVQaXBlKHBpcGUocHJvcCgnZnVuY3Rpb24nKSwgaXNTdHJpbmcpLCBwaXBlKHByb3AoJ2Z1bmN0aW9uJyksIHByb3AoJ2xlbmd0aCcpLCBsdGUoMCkpLCBwaXBlKHByb3AoJ2FyZ3MnKSwgaXNBcnJheSkpKSwgcGF5bWVudDogdmFsaWRhdGVPcHRpb25hbCh2YWxpZGF0ZVBpcGUoaXNBcnJheSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEuZXZlcnkodmFsaWRhdGVQaXBlKHBpcGUocHJvcCgnYW1vdW50JyksIGlzTnVtYmVyTGlrZSksIHBpcGUocHJvcCgnYXNzZXRJZCcpLCBpc0Fzc2V0SWQpKSk7XG4gICAgfSkpLCBmZWVBc3NldElkOiB2YWxpZGF0ZU9wdGlvbmFsKGlzQXNzZXRJZCksIGNoYWluSWQ6IHZhbGlkYXRlT3B0aW9uYWwoaXNOdW1iZXIpIH0pO1xuZXhwb3J0IHZhciBpbnZva2VBcmdzVmFsaWRhdG9yID0gdmFsaWRhdG9yKGludm9rZUFyZ3NTY2hlbWUsICdpbnZva2UnKTtcbmV4cG9ydCB2YXIgYXJnc1ZhbGlkYXRvcnMgPSAoX2EgPSB7fSxcbiAgICBfYVtUUkFOU0FDVElPTl9UWVBFLklTU1VFXSA9IGlzc3VlQXJnc1ZhbGlkYXRvcixcbiAgICBfYVtUUkFOU0FDVElPTl9UWVBFLlRSQU5TRkVSXSA9IHRyYW5zZmVyQXJnc1ZhbGlkYXRvcixcbiAgICBfYVtUUkFOU0FDVElPTl9UWVBFLlJFSVNTVUVdID0gcmVpc3N1ZUFyZ3NWYWxpZGF0b3IsXG4gICAgX2FbVFJBTlNBQ1RJT05fVFlQRS5CVVJOXSA9IGJ1cm5BcmdzVmFsaWRhdG9yLFxuICAgIF9hW1RSQU5TQUNUSU9OX1RZUEUuTEVBU0VdID0gbGVhc2VBcmdzVmFsaWRhdG9yLFxuICAgIF9hW1RSQU5TQUNUSU9OX1RZUEUuQ0FOQ0VMX0xFQVNFXSA9IGNhbmNlbExlYXNlQXJnc1ZhbGlkYXRvcixcbiAgICBfYVtUUkFOU0FDVElPTl9UWVBFLkFMSUFTXSA9IGFsaWFzQXJnc1ZhbGlkYXRvcixcbiAgICBfYVtUUkFOU0FDVElPTl9UWVBFLk1BU1NfVFJBTlNGRVJdID0gbWFzc1RyYW5zZmVyQXJnc1ZhbGlkYXRvcixcbiAgICBfYVtUUkFOU0FDVElPTl9UWVBFLkRBVEFdID0gZGF0YUFyZ3NWYWxpZGF0b3IsXG4gICAgX2FbVFJBTlNBQ1RJT05fVFlQRS5TRVRfU0NSSVBUXSA9IHNldFNjcmlwdEFyZ3NWYWxpZGF0b3IsXG4gICAgX2FbVFJBTlNBQ1RJT05fVFlQRS5TUE9OU09SU0hJUF0gPSBzcG9uc29yc2hpcEFyZ3NWYWxpZGF0b3IsXG4gICAgX2FbVFJBTlNBQ1RJT05fVFlQRS5FWENIQU5HRV0gPSBleGNoYW5nZUFyZ3NWYWxpZGF0b3IsXG4gICAgX2FbVFJBTlNBQ1RJT05fVFlQRS5TRVRfQVNTRVRfU0NSSVBUXSA9IHNldEFzc2V0U2NyaXB0QXJnc1ZhbGlkYXRvcixcbiAgICBfYVtUUkFOU0FDVElPTl9UWVBFLklOVk9LRV9TQ1JJUFRdID0gaW52b2tlQXJnc1ZhbGlkYXRvcixcbiAgICBfYSk7XG5leHBvcnQgdmFyIHZhbGlkYXRlU2lnbmVyT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgdmFyIHJlcyA9IHtcbiAgICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgICAgaW52YWxpZE9wdGlvbnM6IFtdLFxuICAgIH07XG4gICAgdmFyIGlzVmFsaWRMb2dMZXZlbCA9IGZ1bmN0aW9uIChsZXZlbCkge1xuICAgICAgICByZXR1cm4gWyd2ZXJib3NlJywgJ3Byb2R1Y3Rpb24nLCAnZXJyb3InXS5pbmNsdWRlcyhTdHJpbmcobGV2ZWwpKTtcbiAgICB9O1xuICAgIGlmICghaXNTdHJpbmcob3B0aW9ucy5OT0RFX1VSTCkpIHtcbiAgICAgICAgcmVzLmlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgcmVzLmludmFsaWRPcHRpb25zLnB1c2goJ05PREVfVVJMJyk7XG4gICAgfVxuICAgIGlmICghdmFsaWRhdGVPcHRpb25hbChpc1ZhbGlkTG9nTGV2ZWwpKG9wdGlvbnMuTE9HX0xFVkVMKSkge1xuICAgICAgICByZXMuaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICByZXMuaW52YWxpZE9wdGlvbnMucHVzaCgnZGVidWcnKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn07XG5leHBvcnQgdmFyIHZhbGlkYXRlUHJvdmlkZXJJbnRlcmZhY2UgPSBmdW5jdGlvbiAocHJvdmlkZXIpIHtcbiAgICB2YXIgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nOyB9O1xuICAgIHZhciBzY2hlbWUgPSB7XG4gICAgICAgIGNvbm5lY3Q6IGlzRnVuY3Rpb24sXG4gICAgICAgIGxvZ2luOiBpc0Z1bmN0aW9uLFxuICAgICAgICBsb2dvdXQ6IGlzRnVuY3Rpb24sXG4gICAgICAgIHNpZ25NZXNzYWdlOiBpc0Z1bmN0aW9uLFxuICAgICAgICBzaWduVHlwZWREYXRhOiBpc0Z1bmN0aW9uLFxuICAgICAgICBzaWduOiBpc0Z1bmN0aW9uLFxuICAgIH07XG4gICAgdmFyIGludmFsaWRQcm9wZXJ0aWVzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IE9iamVjdC5lbnRyaWVzKHNjaGVtZSk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciBfYiA9IF9hW19pXSwgZmllbGROYW1lID0gX2JbMF0sIHZhbGlkYXRvcl8xID0gX2JbMV07XG4gICAgICAgIGlmICghdmFsaWRhdG9yXzEocHJvdmlkZXJbZmllbGROYW1lXSkpIHtcbiAgICAgICAgICAgIGludmFsaWRQcm9wZXJ0aWVzLnB1c2goZmllbGROYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBpc1ZhbGlkOiBpbnZhbGlkUHJvcGVydGllcy5sZW5ndGggPT09IDAsXG4gICAgICAgIGludmFsaWRQcm9wZXJ0aWVzOiBpbnZhbGlkUHJvcGVydGllcyxcbiAgICB9O1xufTtcbiIsImltcG9ydCBkZWZhdWx0VG8gZnJvbSAncmFtZGEvc3JjL2RlZmF1bHRUbyc7XG5pbXBvcnQgcHJvcCBmcm9tICdyYW1kYS9zcmMvcHJvcCc7XG5pbXBvcnQgaWZFbHNlIGZyb20gJ3JhbWRhL3NyYy9pZkVsc2UnO1xuaW1wb3J0IHBpcGUgZnJvbSAncmFtZGEvc3JjL3BpcGUnO1xuaW1wb3J0IGVxdWFscyBmcm9tICdyYW1kYS9zcmMvZXF1YWxzJztcbmltcG9ydCBndGUgZnJvbSAncmFtZGEvc3JjL2d0ZSc7XG5pbXBvcnQgbHRlIGZyb20gJ3JhbWRhL3NyYy9sdGUnO1xuaW1wb3J0IHN0YXJ0c1dpdGggZnJvbSAncmFtZGEvc3JjL3N0YXJ0c1dpdGgnO1xuaW1wb3J0IGlzTmlsIGZyb20gJ3JhbWRhL3NyYy9pc05pbCc7XG5pbXBvcnQgaW5jbHVkZXMgZnJvbSAncmFtZGEvc3JjL2luY2x1ZGVzJztcbmltcG9ydCBmbGlwIGZyb20gJ3JhbWRhL3NyYy9mbGlwJztcbmltcG9ydCBhbHdheXMgZnJvbSAncmFtZGEvc3JjL2Fsd2F5cyc7XG52YXIgVFhfREVGQVVMVFMgPSB7XG4gICAgTUFYX0FUVEFDSE1FTlQ6IDE0MCxcbiAgICBBTElBUzoge1xuICAgICAgICBBVkFJTEFCTEVfQ0hBUlM6ICctLjAxMjM0NTY3ODlAX2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6JyxcbiAgICAgICAgTUFYX0FMSUFTX0xFTkdUSDogMzAsXG4gICAgICAgIE1JTl9BTElBU19MRU5HVEg6IDQsXG4gICAgfSxcbn07XG5leHBvcnQgdmFyIGlzQXJyYXkgPSBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpOyB9O1xuZXhwb3J0IHZhciB2YWxpZGF0ZVBpcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIGFyZ3NfMSA9IGFyZ3M7IF9pIDwgYXJnc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGNiID0gYXJnc18xW19pXTtcbiAgICAgICAgICAgIGlzVmFsaWQgPSAhIWNiKHZhbHVlKTtcbiAgICAgICAgICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9O1xufTtcbmV4cG9ydCB2YXIgaXNSZXF1aXJlZCA9IGZ1bmN0aW9uIChyZXF1aXJlZCkgeyByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuICFyZXF1aXJlZCB8fCB2YWx1ZSAhPSBudWxsO1xufTsgfTtcbmV4cG9ydCB2YXIgaXNTdHJpbmcgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZztcbn07XG5leHBvcnQgdmFyIGlzTnVtYmVyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInIHx8IHZhbHVlIGluc3RhbmNlb2YgTnVtYmVyKSAmJlxuICAgICAgICAhaXNOYU4oTnVtYmVyKHZhbHVlKSk7XG59O1xuZXhwb3J0IHZhciBpc051bWJlckxpa2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiAhaXNOYU4oTnVtYmVyKHZhbHVlKSkgJiYgISEodmFsdWUgfHwgdmFsdWUgPT09IDApO1xufTtcbmV4cG9ydCB2YXIgaXNCb29sZWFuID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nIHx8IHZhbHVlIGluc3RhbmNlb2YgQm9vbGVhbik7XG59O1xuZXhwb3J0IHZhciBvckVxID0gZmxpcChpbmNsdWRlcyk7XG5leHBvcnQgdmFyIGV4Y2VwdGlvbiA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbn07XG5leHBvcnQgdmFyIHZhbGlkYXRlQnlTY2hlbWEgPSBmdW5jdGlvbiAoc2NoZW1hLCBlcnJvclRwbCkgeyByZXR1cm4gZnVuY3Rpb24gKHR4KSB7XG4gICAgT2JqZWN0LmVudHJpZXMoc2NoZW1hKS5mb3JFYWNoKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICB2YXIga2V5ID0gX2FbMF0sIGNiID0gX2FbMV07XG4gICAgICAgIHZhciB2YWx1ZSA9IHByb3Aoa2V5LCB0eCB8fCB7fSk7XG4gICAgICAgIGlmICghY2IodmFsdWUpKSB7XG4gICAgICAgICAgICBleGNlcHRpb24oZXJyb3JUcGwoa2V5LCB2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG59OyB9O1xuZXhwb3J0IHZhciBpc0F0dGFjaG1lbnQgPSBpZkVsc2Uob3JFcShbbnVsbCwgdW5kZWZpbmVkXSksIGRlZmF1bHRUbyh0cnVlKSwgaWZFbHNlKGlzU3RyaW5nLCBcbi8vIFRPRE8gRml4IGF0dGFjaG1lbnQgZ3RlKFRYX0RFRkFVTFRTLk1BWF9BVFRBQ0hNRU5UKVxucGlwZShwcm9wKCdsZW5ndGgnKSwgYWx3YXlzKHRydWUpKSwgZGVmYXVsdFRvKGZhbHNlKSkpO1xudmFyIHZhbGlkYXRlQ2hhcnMgPSBmdW5jdGlvbiAoY2hhcnMpIHsgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZS5zcGxpdCgnJykuZXZlcnkoZnVuY3Rpb24gKGNoYXIpIHsgcmV0dXJuIGNoYXJzLmluY2x1ZGVzKGNoYXIpOyB9KTtcbn07IH07XG5leHBvcnQgdmFyIGlzVmFsaWRBbGlhc05hbWUgPSBpZkVsc2UodmFsaWRhdGVDaGFycyhUWF9ERUZBVUxUUy5BTElBUy5BVkFJTEFCTEVfQ0hBUlMpLCBwaXBlKHByb3AoJ2xlbmd0aCcpLCB2YWxpZGF0ZVBpcGUoZ3RlKFRYX0RFRkFVTFRTLkFMSUFTLk1BWF9BTElBU19MRU5HVEgpLCBsdGUoVFhfREVGQVVMVFMuQUxJQVMuTUlOX0FMSUFTX0xFTkdUSCkpKSwgZGVmYXVsdFRvKGZhbHNlKSk7XG5leHBvcnQgdmFyIEFTU0VUUyA9IHtcbiAgICBOQU1FX01JTl9CWVRFUzogNCxcbiAgICBOQU1FX01BWF9CWVRFUzogMTYsXG4gICAgREVTQ1JJUFRJT05fTUFYX0JZVEVTOiAxMDAwLFxufTtcbmV4cG9ydCB2YXIgaXNCYXNlNjQgPSB2YWxpZGF0ZVBpcGUoaWZFbHNlKGlzU3RyaW5nLCBzdGFydHNXaXRoKCdiYXNlNjQ6JyksIHBpcGUoaXNOaWwpKSk7XG5leHBvcnQgdmFyIHZhbGlkYXRlVHlwZSA9IHtcbiAgICBpbnRlZ2VyOiBpc051bWJlckxpa2UsXG4gICAgYm9vbGVhbjogaXNCb29sZWFuLFxuICAgIHN0cmluZzogaXNTdHJpbmcsXG4gICAgYmluYXJ5OiBpc0Jhc2U2NCxcbn07XG5leHBvcnQgdmFyIGlzVmFsaWREYXRhUGFpciA9IGZ1bmN0aW9uIChkYXRhKSB7IHJldHVybiAhISh2YWxpZGF0ZVR5cGVbZGF0YS50eXBlXSAmJiB2YWxpZGF0ZVR5cGVbZGF0YS50eXBlXShkYXRhLnZhbHVlKSk7IH07XG5leHBvcnQgdmFyIGlzVmFsaWREYXRhID0gdmFsaWRhdGVQaXBlKGlzUmVxdWlyZWQodHJ1ZSksIHBpcGUocHJvcCgna2V5JyksIHZhbGlkYXRlUGlwZShpc1N0cmluZywgZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gISFrZXk7IH0pKSwgaXNWYWxpZERhdGFQYWlyKTtcbmV4cG9ydCB2YXIgaXNQdWJsaWNLZXkgPSB2YWxpZGF0ZVBpcGUoaXNTdHJpbmcsIGZ1bmN0aW9uICh2KSB7IHJldHVybiB2Lmxlbmd0aCA9PT0gMzI7IH0pO1xuZXhwb3J0IHZhciBpc1ZhbGlkQXNzZXROYW1lID0gdmFsaWRhdGVQaXBlKGlzU3RyaW5nLCBwaXBlKHByb3AoJ2xlbmd0aCcpLCBpZkVsc2UobHRlKEFTU0VUUy5OQU1FX01JTl9CWVRFUyksIGd0ZShBU1NFVFMuTkFNRV9NQVhfQllURVMpLCBkZWZhdWx0VG8oZmFsc2UpKSkpO1xuZXhwb3J0IHZhciBpc1ZhbGlkQXNzZXREZXNjcmlwdGlvbiA9IHZhbGlkYXRlUGlwZShpc1N0cmluZywgcGlwZShwcm9wKCdsZW5ndGgnKSwgZ3RlKEFTU0VUUy5ERVNDUklQVElPTl9NQVhfQllURVMpKSk7XG5leHBvcnQgdmFyIGlzQXNzZXRJZCA9IHZhbGlkYXRlUGlwZShpZkVsc2Uob3JFcShbJycsIG51bGwsIHVuZGVmaW5lZCwgJ1dBVkVTJ10pLCBkZWZhdWx0VG8odHJ1ZSksIGlzU3RyaW5nKSk7XG5leHBvcnQgdmFyIGlzQWxpYXMgPSBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHZhbHVlLnN0YXJ0c1dpdGgoJ2FsaWFzOicpOyB9O1xuLy8gVE9ETyBmaXggdmFsaWRhdG9yISEhXG5leHBvcnQgdmFyIGlzVmFsaWRBZGRyZXNzID0gaXNTdHJpbmc7XG5leHBvcnQgdmFyIGlzVmFsaWRBbGlhcyA9IHBpcGUoZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB2YWx1ZS5zcGxpdCgnOicpWzJdOyB9LCBpc1ZhbGlkQWxpYXNOYW1lKTtcbmV4cG9ydCB2YXIgaXNSZWNpcGllbnQgPSB2YWxpZGF0ZVBpcGUoaXNTdHJpbmcsIGlmRWxzZShpc0FsaWFzLCBpc1ZhbGlkQWxpYXMsIGlzVmFsaWRBZGRyZXNzKSk7XG52YXIgb3JkZXJTY2hlbWUgPSB7XG4gICAgb3JkZXJUeXBlOiBvckVxKFsnc2VsbCcsICdidXknXSksXG4gICAgc2VuZGVyUHVibGljS2V5OiBpc1B1YmxpY0tleSxcbiAgICBtYXRjaGVyUHVibGljS2V5OiBpc1B1YmxpY0tleSxcbiAgICB2ZXJzaW9uOiBvckVxKFt1bmRlZmluZWQsIDAsIDEsIDIsIDNdKSxcbiAgICBhc3NldFBhaXI6IHZhbGlkYXRlUGlwZShpc1JlcXVpcmVkKHRydWUpLCBwaXBlKHByb3AoJ2Ftb3VudEFzc2V0JyksIGlzQXNzZXRJZCksIHBpcGUocHJvcCgncHJpY2VBc3NldCcpLCBpc0Fzc2V0SWQpKSxcbiAgICBwcmljZTogaXNOdW1iZXJMaWtlLFxuICAgIGFtb3VudDogaXNOdW1iZXJMaWtlLFxuICAgIG1hdGNoZXJGZWU6IGlzTnVtYmVyTGlrZSxcbiAgICBleHBpcmF0aW9uOiBpc051bWJlckxpa2UsXG4gICAgdGltZXN0YW1wOiBpc051bWJlcixcbiAgICBwcm9vZnM6IGlmRWxzZShpc0FycmF5LCBkZWZhdWx0VG8odHJ1ZSksIG9yRXEoW3VuZGVmaW5lZF0pKSxcbn07XG52YXIgdjEyT3JkZXJTY2hlbWUgPSB7XG4gICAgbWF0Y2hlckZlZUFzc2V0SWQ6IG9yRXEoW3VuZGVmaW5lZCwgbnVsbCwgJ1dBVkVTJ10pLFxufTtcbnZhciB2M09yZGVyU2NoZW1lID0ge1xuICAgIG1hdGNoZXJGZWVBc3NldElkOiBpc0Fzc2V0SWQsXG59O1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1lbXB0eS1mdW5jdGlvblxuZXhwb3J0IHZhciBub29wID0gZnVuY3Rpb24gKCkge1xufTtcbi8vIFRPRE8hISFcbnZhciB2YWxpZGF0ZU9yZGVyID0gdmFsaWRhdGVCeVNjaGVtYShvcmRlclNjaGVtZSwgbm9vcCk7XG52YXIgdmFsaWRhdGVPcmRlclYyID0gdmFsaWRhdGVCeVNjaGVtYSh2MTJPcmRlclNjaGVtZSwgbm9vcCk7XG52YXIgdmFsaWRhdGVPcmRlclYzID0gdmFsaWRhdGVCeVNjaGVtYSh2M09yZGVyU2NoZW1lLCBub29wKTtcbmV4cG9ydCB2YXIgb3JkZXJWYWxpZGF0b3IgPSB2YWxpZGF0ZVBpcGUodmFsaWRhdGVPcmRlciwgaWZFbHNlKHBpcGUocHJvcCgndmVyc2lvbicpLCBlcXVhbHMoMykpLCB2YWxpZGF0ZU9yZGVyVjMsIHZhbGlkYXRlT3JkZXJWMikpO1xuIiwidmFyIF9jdXJyeTEgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vaW50ZXJuYWwvX2N1cnJ5MVwiKTtcbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgYWx3YXlzIHJldHVybnMgdGhlIGdpdmVuIHZhbHVlLiBOb3RlIHRoYXQgZm9yXG4gKiBub24tcHJpbWl0aXZlcyB0aGUgdmFsdWUgcmV0dXJuZWQgaXMgYSByZWZlcmVuY2UgdG8gdGhlIG9yaWdpbmFsIHZhbHVlLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaXMga25vd24gYXMgYGNvbnN0YCwgYGNvbnN0YW50YCwgb3IgYEtgIChmb3IgSyBjb21iaW5hdG9yKSBpblxuICogb3RoZXIgbGFuZ3VhZ2VzIGFuZCBsaWJyYXJpZXMuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBzaWcgYSAtPiAoKiAtPiBhKVxuICogQHBhcmFtIHsqfSB2YWwgVGhlIHZhbHVlIHRvIHdyYXAgaW4gYSBmdW5jdGlvblxuICogQHJldHVybiB7RnVuY3Rpb259IEEgRnVuY3Rpb24gOjogKiAtPiB2YWwuXG4gKiBAZXhhbXBsZVxuICpcbiAqICAgICAgY29uc3QgdCA9IFIuYWx3YXlzKCdUZWUnKTtcbiAqICAgICAgdCgpOyAvLz0+ICdUZWUnXG4gKi9cblxuXG52YXIgYWx3YXlzID1cbi8qI19fUFVSRV9fKi9cbl9jdXJyeTEoZnVuY3Rpb24gYWx3YXlzKHZhbCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB2YWw7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBhbHdheXM7IiwidmFyIF9hcml0eSA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9fYXJpdHlcIik7XG5cbnZhciBfY3VycnkyID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL19jdXJyeTJcIik7XG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGlzIGJvdW5kIHRvIGEgY29udGV4dC5cbiAqIE5vdGU6IGBSLmJpbmRgIGRvZXMgbm90IHByb3ZpZGUgdGhlIGFkZGl0aW9uYWwgYXJndW1lbnQtYmluZGluZyBjYXBhYmlsaXRpZXMgb2ZcbiAqIFtGdW5jdGlvbi5wcm90b3R5cGUuYmluZF0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vYmluZCkuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuNi4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBzaWcgKCogLT4gKikgLT4geyp9IC0+ICgqIC0+ICopXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gYmluZCB0byBjb250ZXh0XG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc09iaiBUaGUgY29udGV4dCB0byBiaW5kIGBmbmAgdG9cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBleGVjdXRlIGluIHRoZSBjb250ZXh0IG9mIGB0aGlzT2JqYC5cbiAqIEBzZWUgUi5wYXJ0aWFsXG4gKiBAZXhhbXBsZVxuICpcbiAqICAgICAgY29uc3QgbG9nID0gUi5iaW5kKGNvbnNvbGUubG9nLCBjb25zb2xlKTtcbiAqICAgICAgUi5waXBlKFIuYXNzb2MoJ2EnLCAyKSwgUi50YXAobG9nKSwgUi5hc3NvYygnYScsIDMpKSh7YTogMX0pOyAvLz0+IHthOiAzfVxuICogICAgICAvLyBsb2dzIHthOiAyfVxuICogQHN5bWIgUi5iaW5kKGYsIG8pKGEsIGIpID0gZi5jYWxsKG8sIGEsIGIpXG4gKi9cblxuXG52YXIgYmluZCA9XG4vKiNfX1BVUkVfXyovXG5fY3VycnkyKGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNPYmopIHtcbiAgcmV0dXJuIF9hcml0eShmbi5sZW5ndGgsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc09iaiwgYXJndW1lbnRzKTtcbiAgfSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBiaW5kOyIsInZhciBfYXJpdHkgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vaW50ZXJuYWwvX2FyaXR5XCIpO1xuXG52YXIgX2N1cnJ5MSA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9fY3VycnkxXCIpO1xuXG52YXIgX2N1cnJ5MiA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9fY3VycnkyXCIpO1xuXG52YXIgX2N1cnJ5TiA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9fY3VycnlOXCIpO1xuLyoqXG4gKiBSZXR1cm5zIGEgY3VycmllZCBlcXVpdmFsZW50IG9mIHRoZSBwcm92aWRlZCBmdW5jdGlvbiwgd2l0aCB0aGUgc3BlY2lmaWVkXG4gKiBhcml0eS4gVGhlIGN1cnJpZWQgZnVuY3Rpb24gaGFzIHR3byB1bnVzdWFsIGNhcGFiaWxpdGllcy4gRmlyc3QsIGl0c1xuICogYXJndW1lbnRzIG5lZWRuJ3QgYmUgcHJvdmlkZWQgb25lIGF0IGEgdGltZS4gSWYgYGdgIGlzIGBSLmN1cnJ5TigzLCBmKWAsIHRoZVxuICogZm9sbG93aW5nIGFyZSBlcXVpdmFsZW50OlxuICpcbiAqICAgLSBgZygxKSgyKSgzKWBcbiAqICAgLSBgZygxKSgyLCAzKWBcbiAqICAgLSBgZygxLCAyKSgzKWBcbiAqICAgLSBgZygxLCAyLCAzKWBcbiAqXG4gKiBTZWNvbmRseSwgdGhlIHNwZWNpYWwgcGxhY2Vob2xkZXIgdmFsdWUgW2BSLl9fYF0oI19fKSBtYXkgYmUgdXNlZCB0byBzcGVjaWZ5XG4gKiBcImdhcHNcIiwgYWxsb3dpbmcgcGFydGlhbCBhcHBsaWNhdGlvbiBvZiBhbnkgY29tYmluYXRpb24gb2YgYXJndW1lbnRzLFxuICogcmVnYXJkbGVzcyBvZiB0aGVpciBwb3NpdGlvbnMuIElmIGBnYCBpcyBhcyBhYm92ZSBhbmQgYF9gIGlzIFtgUi5fX2BdKCNfXyksXG4gKiB0aGUgZm9sbG93aW5nIGFyZSBlcXVpdmFsZW50OlxuICpcbiAqICAgLSBgZygxLCAyLCAzKWBcbiAqICAgLSBgZyhfLCAyLCAzKSgxKWBcbiAqICAgLSBgZyhfLCBfLCAzKSgxKSgyKWBcbiAqICAgLSBgZyhfLCBfLCAzKSgxLCAyKWBcbiAqICAgLSBgZyhfLCAyKSgxKSgzKWBcbiAqICAgLSBgZyhfLCAyKSgxLCAzKWBcbiAqICAgLSBgZyhfLCAyKShfLCAzKSgxKWBcbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC41LjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHNpZyBOdW1iZXIgLT4gKCogLT4gYSkgLT4gKCogLT4gYSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggVGhlIGFyaXR5IGZvciB0aGUgcmV0dXJuZWQgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY3VycnkuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBuZXcsIGN1cnJpZWQgZnVuY3Rpb24uXG4gKiBAc2VlIFIuY3VycnlcbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBjb25zdCBzdW1BcmdzID0gKC4uLmFyZ3MpID0+IFIuc3VtKGFyZ3MpO1xuICpcbiAqICAgICAgY29uc3QgY3VycmllZEFkZEZvdXJOdW1iZXJzID0gUi5jdXJyeU4oNCwgc3VtQXJncyk7XG4gKiAgICAgIGNvbnN0IGYgPSBjdXJyaWVkQWRkRm91ck51bWJlcnMoMSwgMik7XG4gKiAgICAgIGNvbnN0IGcgPSBmKDMpO1xuICogICAgICBnKDQpOyAvLz0+IDEwXG4gKi9cblxuXG52YXIgY3VycnlOID1cbi8qI19fUFVSRV9fKi9cbl9jdXJyeTIoZnVuY3Rpb24gY3VycnlOKGxlbmd0aCwgZm4pIHtcbiAgaWYgKGxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBfY3VycnkxKGZuKTtcbiAgfVxuXG4gIHJldHVybiBfYXJpdHkobGVuZ3RoLCBfY3VycnlOKGxlbmd0aCwgW10sIGZuKSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjdXJyeU47IiwidmFyIF9jdXJyeTIgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vaW50ZXJuYWwvX2N1cnJ5MlwiKTtcbi8qKlxuICogUmV0dXJucyB0aGUgc2Vjb25kIGFyZ3VtZW50IGlmIGl0IGlzIG5vdCBgbnVsbGAsIGB1bmRlZmluZWRgIG9yIGBOYU5gO1xuICogb3RoZXJ3aXNlIHRoZSBmaXJzdCBhcmd1bWVudCBpcyByZXR1cm5lZC5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC4xMC4wXG4gKiBAY2F0ZWdvcnkgTG9naWNcbiAqIEBzaWcgYSAtPiBiIC0+IGEgfCBiXG4gKiBAcGFyYW0ge2F9IGRlZmF1bHQgVGhlIGRlZmF1bHQgdmFsdWUuXG4gKiBAcGFyYW0ge2J9IHZhbCBgdmFsYCB3aWxsIGJlIHJldHVybmVkIGluc3RlYWQgb2YgYGRlZmF1bHRgIHVubGVzcyBgdmFsYCBpcyBgbnVsbGAsIGB1bmRlZmluZWRgIG9yIGBOYU5gLlxuICogQHJldHVybiB7Kn0gVGhlIHNlY29uZCB2YWx1ZSBpZiBpdCBpcyBub3QgYG51bGxgLCBgdW5kZWZpbmVkYCBvciBgTmFOYCwgb3RoZXJ3aXNlIHRoZSBkZWZhdWx0IHZhbHVlXG4gKiBAZXhhbXBsZVxuICpcbiAqICAgICAgY29uc3QgZGVmYXVsdFRvNDIgPSBSLmRlZmF1bHRUbyg0Mik7XG4gKlxuICogICAgICBkZWZhdWx0VG80MihudWxsKTsgIC8vPT4gNDJcbiAqICAgICAgZGVmYXVsdFRvNDIodW5kZWZpbmVkKTsgIC8vPT4gNDJcbiAqICAgICAgZGVmYXVsdFRvNDIoZmFsc2UpOyAgLy89PiBmYWxzZVxuICogICAgICBkZWZhdWx0VG80MignUmFtZGEnKTsgIC8vPT4gJ1JhbWRhJ1xuICogICAgICAvLyBwYXJzZUludCgnc3RyaW5nJykgcmVzdWx0cyBpbiBOYU5cbiAqICAgICAgZGVmYXVsdFRvNDIocGFyc2VJbnQoJ3N0cmluZycpKTsgLy89PiA0MlxuICovXG5cblxudmFyIGRlZmF1bHRUbyA9XG4vKiNfX1BVUkVfXyovXG5fY3VycnkyKGZ1bmN0aW9uIGRlZmF1bHRUbyhkLCB2KSB7XG4gIHJldHVybiB2ID09IG51bGwgfHwgdiAhPT0gdiA/IGQgOiB2O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdFRvOyIsInZhciBfY3VycnkyID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL19jdXJyeTJcIik7XG5cbnZhciBfZXF1YWxzID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL19lcXVhbHNcIik7XG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmIGl0cyBhcmd1bWVudHMgYXJlIGVxdWl2YWxlbnQsIGBmYWxzZWAgb3RoZXJ3aXNlLiBIYW5kbGVzXG4gKiBjeWNsaWNhbCBkYXRhIHN0cnVjdHVyZXMuXG4gKlxuICogRGlzcGF0Y2hlcyBzeW1tZXRyaWNhbGx5IHRvIHRoZSBgZXF1YWxzYCBtZXRob2RzIG9mIGJvdGggYXJndW1lbnRzLCBpZlxuICogcHJlc2VudC5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC4xNS4wXG4gKiBAY2F0ZWdvcnkgUmVsYXRpb25cbiAqIEBzaWcgYSAtPiBiIC0+IEJvb2xlYW5cbiAqIEBwYXJhbSB7Kn0gYVxuICogQHBhcmFtIHsqfSBiXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIuZXF1YWxzKDEsIDEpOyAvLz0+IHRydWVcbiAqICAgICAgUi5lcXVhbHMoMSwgJzEnKTsgLy89PiBmYWxzZVxuICogICAgICBSLmVxdWFscyhbMSwgMiwgM10sIFsxLCAyLCAzXSk7IC8vPT4gdHJ1ZVxuICpcbiAqICAgICAgY29uc3QgYSA9IHt9OyBhLnYgPSBhO1xuICogICAgICBjb25zdCBiID0ge307IGIudiA9IGI7XG4gKiAgICAgIFIuZXF1YWxzKGEsIGIpOyAvLz0+IHRydWVcbiAqL1xuXG5cbnZhciBlcXVhbHMgPVxuLyojX19QVVJFX18qL1xuX2N1cnJ5MihmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICByZXR1cm4gX2VxdWFscyhhLCBiLCBbXSwgW10pO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXF1YWxzOyIsInZhciBfY3VycnkxID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL19jdXJyeTFcIik7XG5cbnZhciBjdXJyeU4gPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vY3VycnlOXCIpO1xuLyoqXG4gKiBSZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIG11Y2ggbGlrZSB0aGUgc3VwcGxpZWQgb25lLCBleGNlcHQgdGhhdCB0aGUgZmlyc3QgdHdvXG4gKiBhcmd1bWVudHMnIG9yZGVyIGlzIHJldmVyc2VkLlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAc2lnICgoYSwgYiwgYywgLi4uKSAtPiB6KSAtPiAoYiAtPiBhIC0+IGMgLT4gLi4uIC0+IHopXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gaW52b2tlIHdpdGggaXRzIGZpcnN0IHR3byBwYXJhbWV0ZXJzIHJldmVyc2VkLlxuICogQHJldHVybiB7Kn0gVGhlIHJlc3VsdCBvZiBpbnZva2luZyBgZm5gIHdpdGggaXRzIGZpcnN0IHR3byBwYXJhbWV0ZXJzJyBvcmRlciByZXZlcnNlZC5cbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBjb25zdCBtZXJnZVRocmVlID0gKGEsIGIsIGMpID0+IFtdLmNvbmNhdChhLCBiLCBjKTtcbiAqXG4gKiAgICAgIG1lcmdlVGhyZWUoMSwgMiwgMyk7IC8vPT4gWzEsIDIsIDNdXG4gKlxuICogICAgICBSLmZsaXAobWVyZ2VUaHJlZSkoMSwgMiwgMyk7IC8vPT4gWzIsIDEsIDNdXG4gKiBAc3ltYiBSLmZsaXAoZikoYSwgYiwgYykgPSBmKGIsIGEsIGMpXG4gKi9cblxuXG52YXIgZmxpcCA9XG4vKiNfX1BVUkVfXyovXG5fY3VycnkxKGZ1bmN0aW9uIGZsaXAoZm4pIHtcbiAgcmV0dXJuIGN1cnJ5Tihmbi5sZW5ndGgsIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgIGFyZ3NbMF0gPSBiO1xuICAgIGFyZ3NbMV0gPSBhO1xuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmbGlwOyIsInZhciBfY3VycnkyID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL19jdXJyeTJcIik7XG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBmaXJzdCBhcmd1bWVudCBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHNlY29uZDtcbiAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjEuMFxuICogQGNhdGVnb3J5IFJlbGF0aW9uXG4gKiBAc2lnIE9yZCBhID0+IGEgLT4gYSAtPiBCb29sZWFuXG4gKiBAcGFyYW0ge051bWJlcn0gYVxuICogQHBhcmFtIHtOdW1iZXJ9IGJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAc2VlIFIubHRlXG4gKiBAZXhhbXBsZVxuICpcbiAqICAgICAgUi5ndGUoMiwgMSk7IC8vPT4gdHJ1ZVxuICogICAgICBSLmd0ZSgyLCAyKTsgLy89PiB0cnVlXG4gKiAgICAgIFIuZ3RlKDIsIDMpOyAvLz0+IGZhbHNlXG4gKiAgICAgIFIuZ3RlKCdhJywgJ3onKTsgLy89PiBmYWxzZVxuICogICAgICBSLmd0ZSgneicsICdhJyk7IC8vPT4gdHJ1ZVxuICovXG5cblxudmFyIGd0ZSA9XG4vKiNfX1BVUkVfXyovXG5fY3VycnkyKGZ1bmN0aW9uIGd0ZShhLCBiKSB7XG4gIHJldHVybiBhID49IGI7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBndGU7IiwidmFyIF9jdXJyeTMgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vaW50ZXJuYWwvX2N1cnJ5M1wiKTtcblxudmFyIGN1cnJ5TiA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9jdXJyeU5cIik7XG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgcHJvY2VzcyBlaXRoZXIgdGhlIGBvblRydWVgIG9yIHRoZSBgb25GYWxzZWBcbiAqIGZ1bmN0aW9uIGRlcGVuZGluZyB1cG9uIHRoZSByZXN1bHQgb2YgdGhlIGBjb25kaXRpb25gIHByZWRpY2F0ZS5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC44LjBcbiAqIEBjYXRlZ29yeSBMb2dpY1xuICogQHNpZyAoKi4uLiAtPiBCb29sZWFuKSAtPiAoKi4uLiAtPiAqKSAtPiAoKi4uLiAtPiAqKSAtPiAoKi4uLiAtPiAqKVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY29uZGl0aW9uIEEgcHJlZGljYXRlIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvblRydWUgQSBmdW5jdGlvbiB0byBpbnZva2Ugd2hlbiB0aGUgYGNvbmRpdGlvbmAgZXZhbHVhdGVzIHRvIGEgdHJ1dGh5IHZhbHVlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gb25GYWxzZSBBIGZ1bmN0aW9uIHRvIGludm9rZSB3aGVuIHRoZSBgY29uZGl0aW9uYCBldmFsdWF0ZXMgdG8gYSBmYWxzeSB2YWx1ZS5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBBIG5ldyBmdW5jdGlvbiB0aGF0IHdpbGwgcHJvY2VzcyBlaXRoZXIgdGhlIGBvblRydWVgIG9yIHRoZSBgb25GYWxzZWBcbiAqICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBkZXBlbmRpbmcgdXBvbiB0aGUgcmVzdWx0IG9mIHRoZSBgY29uZGl0aW9uYCBwcmVkaWNhdGUuXG4gKiBAc2VlIFIudW5sZXNzLCBSLndoZW4sIFIuY29uZFxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIGNvbnN0IGluY0NvdW50ID0gUi5pZkVsc2UoXG4gKiAgICAgICAgUi5oYXMoJ2NvdW50JyksXG4gKiAgICAgICAgUi5vdmVyKFIubGVuc1Byb3AoJ2NvdW50JyksIFIuaW5jKSxcbiAqICAgICAgICBSLmFzc29jKCdjb3VudCcsIDEpXG4gKiAgICAgICk7XG4gKiAgICAgIGluY0NvdW50KHt9KTsgICAgICAgICAgIC8vPT4geyBjb3VudDogMSB9XG4gKiAgICAgIGluY0NvdW50KHsgY291bnQ6IDEgfSk7IC8vPT4geyBjb3VudDogMiB9XG4gKi9cblxuXG52YXIgaWZFbHNlID1cbi8qI19fUFVSRV9fKi9cbl9jdXJyeTMoZnVuY3Rpb24gaWZFbHNlKGNvbmRpdGlvbiwgb25UcnVlLCBvbkZhbHNlKSB7XG4gIHJldHVybiBjdXJyeU4oTWF0aC5tYXgoY29uZGl0aW9uLmxlbmd0aCwgb25UcnVlLmxlbmd0aCwgb25GYWxzZS5sZW5ndGgpLCBmdW5jdGlvbiBfaWZFbHNlKCkge1xuICAgIHJldHVybiBjb25kaXRpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKSA/IG9uVHJ1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogb25GYWxzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9KTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlmRWxzZTsiLCJ2YXIgX2luY2x1ZGVzID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL19pbmNsdWRlc1wiKTtcblxudmFyIF9jdXJyeTIgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vaW50ZXJuYWwvX2N1cnJ5MlwiKTtcbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBlcXVhbCwgaW4gW2BSLmVxdWFsc2BdKCNlcXVhbHMpXG4gKiB0ZXJtcywgdG8gYXQgbGVhc3Qgb25lIGVsZW1lbnQgb2YgdGhlIGdpdmVuIGxpc3Q7IGBmYWxzZWAgb3RoZXJ3aXNlLlxuICogV29ya3MgYWxzbyB3aXRoIHN0cmluZ3MuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuMjYuMFxuICogQGNhdGVnb3J5IExpc3RcbiAqIEBzaWcgYSAtPiBbYV0gLT4gQm9vbGVhblxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIGl0ZW0gdG8gY29tcGFyZSBhZ2FpbnN0LlxuICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgYXJyYXkgdG8gY29uc2lkZXIuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBgdHJ1ZWAgaWYgYW4gZXF1aXZhbGVudCBpdGVtIGlzIGluIHRoZSBsaXN0LCBgZmFsc2VgIG90aGVyd2lzZS5cbiAqIEBzZWUgUi5hbnlcbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBSLmluY2x1ZGVzKDMsIFsxLCAyLCAzXSk7IC8vPT4gdHJ1ZVxuICogICAgICBSLmluY2x1ZGVzKDQsIFsxLCAyLCAzXSk7IC8vPT4gZmFsc2VcbiAqICAgICAgUi5pbmNsdWRlcyh7IG5hbWU6ICdGcmVkJyB9LCBbeyBuYW1lOiAnRnJlZCcgfV0pOyAvLz0+IHRydWVcbiAqICAgICAgUi5pbmNsdWRlcyhbNDJdLCBbWzQyXV0pOyAvLz0+IHRydWVcbiAqICAgICAgUi5pbmNsdWRlcygnYmEnLCAnYmFuYW5hJyk7IC8vPT50cnVlXG4gKi9cblxuXG52YXIgaW5jbHVkZXMgPVxuLyojX19QVVJFX18qL1xuX2N1cnJ5MihfaW5jbHVkZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGluY2x1ZGVzOyIsImZ1bmN0aW9uIF9hcml0eShuLCBmbikge1xuICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICBzd2l0Y2ggKG4pIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG5cbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGEwKSB7XG4gICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfTtcblxuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExKSB7XG4gICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfTtcblxuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMikge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG5cbiAgICBjYXNlIDQ6XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGEwLCBhMSwgYTIsIGEzKSB7XG4gICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfTtcblxuICAgIGNhc2UgNTpcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMiwgYTMsIGE0KSB7XG4gICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfTtcblxuICAgIGNhc2UgNjpcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG5cbiAgICBjYXNlIDc6XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2KSB7XG4gICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfTtcblxuICAgIGNhc2UgODpcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3KSB7XG4gICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfTtcblxuICAgIGNhc2UgOTpcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3LCBhOCkge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG5cbiAgICBjYXNlIDEwOlxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhMCwgYTEsIGEyLCBhMywgYTQsIGE1LCBhNiwgYTcsIGE4LCBhOSkge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byBfYXJpdHkgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyIG5vIGdyZWF0ZXIgdGhhbiB0ZW4nKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hcml0eTsiLCJmdW5jdGlvbiBfYXJyYXlGcm9tSXRlcmF0b3IoaXRlcikge1xuICB2YXIgbGlzdCA9IFtdO1xuICB2YXIgbmV4dDtcblxuICB3aGlsZSAoIShuZXh0ID0gaXRlci5uZXh0KCkpLmRvbmUpIHtcbiAgICBsaXN0LnB1c2gobmV4dC52YWx1ZSk7XG4gIH1cblxuICByZXR1cm4gbGlzdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXJyYXlGcm9tSXRlcmF0b3I7IiwidmFyIF9pc0FycmF5ID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL19pc0FycmF5XCIpO1xuLyoqXG4gKiBUaGlzIGNoZWNrcyB3aGV0aGVyIGEgZnVuY3Rpb24gaGFzIGEgW21ldGhvZG5hbWVdIGZ1bmN0aW9uLiBJZiBpdCBpc24ndCBhblxuICogYXJyYXkgaXQgd2lsbCBleGVjdXRlIHRoYXQgZnVuY3Rpb24gb3RoZXJ3aXNlIGl0IHdpbGwgZGVmYXVsdCB0byB0aGUgcmFtZGFcbiAqIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiByYW1kYSBpbXBsZW10YXRpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RuYW1lIHByb3BlcnR5IHRvIGNoZWNrIGZvciBhIGN1c3RvbSBpbXBsZW1lbnRhdGlvblxuICogQHJldHVybiB7T2JqZWN0fSBXaGF0ZXZlciB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBtZXRob2QgaXMuXG4gKi9cblxuXG5mdW5jdGlvbiBfY2hlY2tGb3JNZXRob2QobWV0aG9kbmFtZSwgZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcblxuICAgIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmbigpO1xuICAgIH1cblxuICAgIHZhciBvYmogPSBhcmd1bWVudHNbbGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIF9pc0FycmF5KG9iaikgfHwgdHlwZW9mIG9ialttZXRob2RuYW1lXSAhPT0gJ2Z1bmN0aW9uJyA/IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBvYmpbbWV0aG9kbmFtZV0uYXBwbHkob2JqLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDAsIGxlbmd0aCAtIDEpKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfY2hlY2tGb3JNZXRob2Q7IiwidmFyIF9pc1BsYWNlaG9sZGVyID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL19pc1BsYWNlaG9sZGVyXCIpO1xuLyoqXG4gKiBPcHRpbWl6ZWQgaW50ZXJuYWwgb25lLWFyaXR5IGN1cnJ5IGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjdXJyeS5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgY3VycmllZCBmdW5jdGlvbi5cbiAqL1xuXG5cbmZ1bmN0aW9uIF9jdXJyeTEoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGYxKGEpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCB8fCBfaXNQbGFjZWhvbGRlcihhKSkge1xuICAgICAgcmV0dXJuIGYxO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2N1cnJ5MTsiLCJ2YXIgX2N1cnJ5MSA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9fY3VycnkxXCIpO1xuXG52YXIgX2lzUGxhY2Vob2xkZXIgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vX2lzUGxhY2Vob2xkZXJcIik7XG4vKipcbiAqIE9wdGltaXplZCBpbnRlcm5hbCB0d28tYXJpdHkgY3VycnkgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGN1cnJ5LlxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBjdXJyaWVkIGZ1bmN0aW9uLlxuICovXG5cblxuZnVuY3Rpb24gX2N1cnJ5Mihmbikge1xuICByZXR1cm4gZnVuY3Rpb24gZjIoYSwgYikge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gZjI7XG5cbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIF9pc1BsYWNlaG9sZGVyKGEpID8gZjIgOiBfY3VycnkxKGZ1bmN0aW9uIChfYikge1xuICAgICAgICAgIHJldHVybiBmbihhLCBfYik7XG4gICAgICAgIH0pO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gX2lzUGxhY2Vob2xkZXIoYSkgJiYgX2lzUGxhY2Vob2xkZXIoYikgPyBmMiA6IF9pc1BsYWNlaG9sZGVyKGEpID8gX2N1cnJ5MShmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICByZXR1cm4gZm4oX2EsIGIpO1xuICAgICAgICB9KSA6IF9pc1BsYWNlaG9sZGVyKGIpID8gX2N1cnJ5MShmdW5jdGlvbiAoX2IpIHtcbiAgICAgICAgICByZXR1cm4gZm4oYSwgX2IpO1xuICAgICAgICB9KSA6IGZuKGEsIGIpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfY3VycnkyOyIsInZhciBfY3VycnkxID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL19jdXJyeTFcIik7XG5cbnZhciBfY3VycnkyID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL19jdXJyeTJcIik7XG5cbnZhciBfaXNQbGFjZWhvbGRlciA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9faXNQbGFjZWhvbGRlclwiKTtcbi8qKlxuICogT3B0aW1pemVkIGludGVybmFsIHRocmVlLWFyaXR5IGN1cnJ5IGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjdXJyeS5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgY3VycmllZCBmdW5jdGlvbi5cbiAqL1xuXG5cbmZ1bmN0aW9uIF9jdXJyeTMoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGYzKGEsIGIsIGMpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIGYzO1xuXG4gICAgICBjYXNlIDE6XG4gICAgICAgIHJldHVybiBfaXNQbGFjZWhvbGRlcihhKSA/IGYzIDogX2N1cnJ5MihmdW5jdGlvbiAoX2IsIF9jKSB7XG4gICAgICAgICAgcmV0dXJuIGZuKGEsIF9iLCBfYyk7XG4gICAgICAgIH0pO1xuXG4gICAgICBjYXNlIDI6XG4gICAgICAgIHJldHVybiBfaXNQbGFjZWhvbGRlcihhKSAmJiBfaXNQbGFjZWhvbGRlcihiKSA/IGYzIDogX2lzUGxhY2Vob2xkZXIoYSkgPyBfY3VycnkyKGZ1bmN0aW9uIChfYSwgX2MpIHtcbiAgICAgICAgICByZXR1cm4gZm4oX2EsIGIsIF9jKTtcbiAgICAgICAgfSkgOiBfaXNQbGFjZWhvbGRlcihiKSA/IF9jdXJyeTIoZnVuY3Rpb24gKF9iLCBfYykge1xuICAgICAgICAgIHJldHVybiBmbihhLCBfYiwgX2MpO1xuICAgICAgICB9KSA6IF9jdXJyeTEoZnVuY3Rpb24gKF9jKSB7XG4gICAgICAgICAgcmV0dXJuIGZuKGEsIGIsIF9jKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBfaXNQbGFjZWhvbGRlcihhKSAmJiBfaXNQbGFjZWhvbGRlcihiKSAmJiBfaXNQbGFjZWhvbGRlcihjKSA/IGYzIDogX2lzUGxhY2Vob2xkZXIoYSkgJiYgX2lzUGxhY2Vob2xkZXIoYikgPyBfY3VycnkyKGZ1bmN0aW9uIChfYSwgX2IpIHtcbiAgICAgICAgICByZXR1cm4gZm4oX2EsIF9iLCBjKTtcbiAgICAgICAgfSkgOiBfaXNQbGFjZWhvbGRlcihhKSAmJiBfaXNQbGFjZWhvbGRlcihjKSA/IF9jdXJyeTIoZnVuY3Rpb24gKF9hLCBfYykge1xuICAgICAgICAgIHJldHVybiBmbihfYSwgYiwgX2MpO1xuICAgICAgICB9KSA6IF9pc1BsYWNlaG9sZGVyKGIpICYmIF9pc1BsYWNlaG9sZGVyKGMpID8gX2N1cnJ5MihmdW5jdGlvbiAoX2IsIF9jKSB7XG4gICAgICAgICAgcmV0dXJuIGZuKGEsIF9iLCBfYyk7XG4gICAgICAgIH0pIDogX2lzUGxhY2Vob2xkZXIoYSkgPyBfY3VycnkxKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgIHJldHVybiBmbihfYSwgYiwgYyk7XG4gICAgICAgIH0pIDogX2lzUGxhY2Vob2xkZXIoYikgPyBfY3VycnkxKGZ1bmN0aW9uIChfYikge1xuICAgICAgICAgIHJldHVybiBmbihhLCBfYiwgYyk7XG4gICAgICAgIH0pIDogX2lzUGxhY2Vob2xkZXIoYykgPyBfY3VycnkxKGZ1bmN0aW9uIChfYykge1xuICAgICAgICAgIHJldHVybiBmbihhLCBiLCBfYyk7XG4gICAgICAgIH0pIDogZm4oYSwgYiwgYyk7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9jdXJyeTM7IiwidmFyIF9hcml0eSA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9fYXJpdHlcIik7XG5cbnZhciBfaXNQbGFjZWhvbGRlciA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9faXNQbGFjZWhvbGRlclwiKTtcbi8qKlxuICogSW50ZXJuYWwgY3VycnlOIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggVGhlIGFyaXR5IG9mIHRoZSBjdXJyaWVkIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtBcnJheX0gcmVjZWl2ZWQgQW4gYXJyYXkgb2YgYXJndW1lbnRzIHJlY2VpdmVkIHRodXMgZmFyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGN1cnJ5LlxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBjdXJyaWVkIGZ1bmN0aW9uLlxuICovXG5cblxuZnVuY3Rpb24gX2N1cnJ5TihsZW5ndGgsIHJlY2VpdmVkLCBmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb21iaW5lZCA9IFtdO1xuICAgIHZhciBhcmdzSWR4ID0gMDtcbiAgICB2YXIgbGVmdCA9IGxlbmd0aDtcbiAgICB2YXIgY29tYmluZWRJZHggPSAwO1xuXG4gICAgd2hpbGUgKGNvbWJpbmVkSWR4IDwgcmVjZWl2ZWQubGVuZ3RoIHx8IGFyZ3NJZHggPCBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICBpZiAoY29tYmluZWRJZHggPCByZWNlaXZlZC5sZW5ndGggJiYgKCFfaXNQbGFjZWhvbGRlcihyZWNlaXZlZFtjb21iaW5lZElkeF0pIHx8IGFyZ3NJZHggPj0gYXJndW1lbnRzLmxlbmd0aCkpIHtcbiAgICAgICAgcmVzdWx0ID0gcmVjZWl2ZWRbY29tYmluZWRJZHhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gYXJndW1lbnRzW2FyZ3NJZHhdO1xuICAgICAgICBhcmdzSWR4ICs9IDE7XG4gICAgICB9XG5cbiAgICAgIGNvbWJpbmVkW2NvbWJpbmVkSWR4XSA9IHJlc3VsdDtcblxuICAgICAgaWYgKCFfaXNQbGFjZWhvbGRlcihyZXN1bHQpKSB7XG4gICAgICAgIGxlZnQgLT0gMTtcbiAgICAgIH1cblxuICAgICAgY29tYmluZWRJZHggKz0gMTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGVmdCA8PSAwID8gZm4uYXBwbHkodGhpcywgY29tYmluZWQpIDogX2FyaXR5KGxlZnQsIF9jdXJyeU4obGVuZ3RoLCBjb21iaW5lZCwgZm4pKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfY3VycnlOOyIsInZhciBfaXNBcnJheSA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9faXNBcnJheVwiKTtcblxudmFyIF9pc1RyYW5zZm9ybWVyID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL19pc1RyYW5zZm9ybWVyXCIpO1xuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBkaXNwYXRjaGVzIHdpdGggZGlmZmVyZW50IHN0cmF0ZWdpZXMgYmFzZWQgb24gdGhlXG4gKiBvYmplY3QgaW4gbGlzdCBwb3NpdGlvbiAobGFzdCBhcmd1bWVudCkuIElmIGl0IGlzIGFuIGFycmF5LCBleGVjdXRlcyBbZm5dLlxuICogT3RoZXJ3aXNlLCBpZiBpdCBoYXMgYSBmdW5jdGlvbiB3aXRoIG9uZSBvZiB0aGUgZ2l2ZW4gbWV0aG9kIG5hbWVzLCBpdCB3aWxsXG4gKiBleGVjdXRlIHRoYXQgZnVuY3Rpb24gKGZ1bmN0b3IgY2FzZSkuIE90aGVyd2lzZSwgaWYgaXQgaXMgYSB0cmFuc2Zvcm1lcixcbiAqIHVzZXMgdHJhbnNkdWNlciBbeGZdIHRvIHJldHVybiBhIG5ldyB0cmFuc2Zvcm1lciAodHJhbnNkdWNlciBjYXNlKS5cbiAqIE90aGVyd2lzZSwgaXQgd2lsbCBkZWZhdWx0IHRvIGV4ZWN1dGluZyBbZm5dLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBtZXRob2ROYW1lcyBwcm9wZXJ0aWVzIHRvIGNoZWNrIGZvciBhIGN1c3RvbSBpbXBsZW1lbnRhdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0geGYgdHJhbnNkdWNlciB0byBpbml0aWFsaXplIGlmIG9iamVjdCBpcyB0cmFuc2Zvcm1lclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gZGVmYXVsdCByYW1kYSBpbXBsZW1lbnRhdGlvblxuICogQHJldHVybiB7RnVuY3Rpb259IEEgZnVuY3Rpb24gdGhhdCBkaXNwYXRjaGVzIG9uIG9iamVjdCBpbiBsaXN0IHBvc2l0aW9uXG4gKi9cblxuXG5mdW5jdGlvbiBfZGlzcGF0Y2hhYmxlKG1ldGhvZE5hbWVzLCB4ZiwgZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZuKCk7XG4gICAgfVxuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgIHZhciBvYmogPSBhcmdzLnBvcCgpO1xuXG4gICAgaWYgKCFfaXNBcnJheShvYmopKSB7XG4gICAgICB2YXIgaWR4ID0gMDtcblxuICAgICAgd2hpbGUgKGlkeCA8IG1ldGhvZE5hbWVzLmxlbmd0aCkge1xuICAgICAgICBpZiAodHlwZW9mIG9ialttZXRob2ROYW1lc1tpZHhdXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHJldHVybiBvYmpbbWV0aG9kTmFtZXNbaWR4XV0uYXBwbHkob2JqLCBhcmdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlkeCArPSAxO1xuICAgICAgfVxuXG4gICAgICBpZiAoX2lzVHJhbnNmb3JtZXIob2JqKSkge1xuICAgICAgICB2YXIgdHJhbnNkdWNlciA9IHhmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICByZXR1cm4gdHJhbnNkdWNlcihvYmopO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9kaXNwYXRjaGFibGU7IiwidmFyIF9hcnJheUZyb21JdGVyYXRvciA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9fYXJyYXlGcm9tSXRlcmF0b3JcIik7XG5cbnZhciBfaW5jbHVkZXNXaXRoID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL19pbmNsdWRlc1dpdGhcIik7XG5cbnZhciBfZnVuY3Rpb25OYW1lID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL19mdW5jdGlvbk5hbWVcIik7XG5cbnZhciBfaGFzID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL19oYXNcIik7XG5cbnZhciBfb2JqZWN0SXMgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vX29iamVjdElzXCIpO1xuXG52YXIga2V5cyA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi4va2V5c1wiKTtcblxudmFyIHR5cGUgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4uL3R5cGVcIik7XG4vKipcbiAqIHByaXZhdGUgX3VuaXFDb250ZW50RXF1YWxzIGZ1bmN0aW9uLlxuICogVGhhdCBmdW5jdGlvbiBpcyBjaGVja2luZyBlcXVhbGl0eSBvZiAyIGl0ZXJhdG9yIGNvbnRlbnRzIHdpdGggMiBhc3N1bXB0aW9uc1xuICogLSBpdGVyYXRvcnMgbGVuZ3RocyBhcmUgdGhlIHNhbWVcbiAqIC0gaXRlcmF0b3JzIHZhbHVlcyBhcmUgdW5pcXVlXG4gKlxuICogZmFsc2UtcG9zaXRpdmUgcmVzdWx0IHdpbGwgYmUgcmV0dXJuZWQgZm9yIGNvbXBhcmlzaW9uIG9mLCBlLmcuXG4gKiAtIFsxLDIsM10gYW5kIFsxLDIsMyw0XVxuICogLSBbMSwxLDFdIGFuZCBbMSwyLDNdXG4gKiAqL1xuXG5cbmZ1bmN0aW9uIF91bmlxQ29udGVudEVxdWFscyhhSXRlcmF0b3IsIGJJdGVyYXRvciwgc3RhY2tBLCBzdGFja0IpIHtcbiAgdmFyIGEgPSBfYXJyYXlGcm9tSXRlcmF0b3IoYUl0ZXJhdG9yKTtcblxuICB2YXIgYiA9IF9hcnJheUZyb21JdGVyYXRvcihiSXRlcmF0b3IpO1xuXG4gIGZ1bmN0aW9uIGVxKF9hLCBfYikge1xuICAgIHJldHVybiBfZXF1YWxzKF9hLCBfYiwgc3RhY2tBLnNsaWNlKCksIHN0YWNrQi5zbGljZSgpKTtcbiAgfSAvLyBpZiAqYSogYXJyYXkgY29udGFpbnMgYW55IGVsZW1lbnQgdGhhdCBpcyBub3QgaW5jbHVkZWQgaW4gKmIqXG5cblxuICByZXR1cm4gIV9pbmNsdWRlc1dpdGgoZnVuY3Rpb24gKGIsIGFJdGVtKSB7XG4gICAgcmV0dXJuICFfaW5jbHVkZXNXaXRoKGVxLCBhSXRlbSwgYik7XG4gIH0sIGIsIGEpO1xufVxuXG5mdW5jdGlvbiBfZXF1YWxzKGEsIGIsIHN0YWNrQSwgc3RhY2tCKSB7XG4gIGlmIChfb2JqZWN0SXMoYSwgYikpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHZhciB0eXBlQSA9IHR5cGUoYSk7XG5cbiAgaWYgKHR5cGVBICE9PSB0eXBlKGIpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGEgPT0gbnVsbCB8fCBiID09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIGFbJ2ZhbnRhc3ktbGFuZC9lcXVhbHMnXSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgYlsnZmFudGFzeS1sYW5kL2VxdWFscyddID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBhWydmYW50YXN5LWxhbmQvZXF1YWxzJ10gPT09ICdmdW5jdGlvbicgJiYgYVsnZmFudGFzeS1sYW5kL2VxdWFscyddKGIpICYmIHR5cGVvZiBiWydmYW50YXN5LWxhbmQvZXF1YWxzJ10gPT09ICdmdW5jdGlvbicgJiYgYlsnZmFudGFzeS1sYW5kL2VxdWFscyddKGEpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBhLmVxdWFscyA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgYi5lcXVhbHMgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gdHlwZW9mIGEuZXF1YWxzID09PSAnZnVuY3Rpb24nICYmIGEuZXF1YWxzKGIpICYmIHR5cGVvZiBiLmVxdWFscyA9PT0gJ2Z1bmN0aW9uJyAmJiBiLmVxdWFscyhhKTtcbiAgfVxuXG4gIHN3aXRjaCAodHlwZUEpIHtcbiAgICBjYXNlICdBcmd1bWVudHMnOlxuICAgIGNhc2UgJ0FycmF5JzpcbiAgICBjYXNlICdPYmplY3QnOlxuICAgICAgaWYgKHR5cGVvZiBhLmNvbnN0cnVjdG9yID09PSAnZnVuY3Rpb24nICYmIF9mdW5jdGlvbk5hbWUoYS5jb25zdHJ1Y3RvcikgPT09ICdQcm9taXNlJykge1xuICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICAgIH1cblxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdCb29sZWFuJzpcbiAgICBjYXNlICdOdW1iZXInOlxuICAgIGNhc2UgJ1N0cmluZyc6XG4gICAgICBpZiAoISh0eXBlb2YgYSA9PT0gdHlwZW9mIGIgJiYgX29iamVjdElzKGEudmFsdWVPZigpLCBiLnZhbHVlT2YoKSkpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdEYXRlJzpcbiAgICAgIGlmICghX29iamVjdElzKGEudmFsdWVPZigpLCBiLnZhbHVlT2YoKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ0Vycm9yJzpcbiAgICAgIHJldHVybiBhLm5hbWUgPT09IGIubmFtZSAmJiBhLm1lc3NhZ2UgPT09IGIubWVzc2FnZTtcblxuICAgIGNhc2UgJ1JlZ0V4cCc6XG4gICAgICBpZiAoIShhLnNvdXJjZSA9PT0gYi5zb3VyY2UgJiYgYS5nbG9iYWwgPT09IGIuZ2xvYmFsICYmIGEuaWdub3JlQ2FzZSA9PT0gYi5pZ25vcmVDYXNlICYmIGEubXVsdGlsaW5lID09PSBiLm11bHRpbGluZSAmJiBhLnN0aWNreSA9PT0gYi5zdGlja3kgJiYgYS51bmljb2RlID09PSBiLnVuaWNvZGUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgYnJlYWs7XG4gIH1cblxuICB2YXIgaWR4ID0gc3RhY2tBLmxlbmd0aCAtIDE7XG5cbiAgd2hpbGUgKGlkeCA+PSAwKSB7XG4gICAgaWYgKHN0YWNrQVtpZHhdID09PSBhKSB7XG4gICAgICByZXR1cm4gc3RhY2tCW2lkeF0gPT09IGI7XG4gICAgfVxuXG4gICAgaWR4IC09IDE7XG4gIH1cblxuICBzd2l0Y2ggKHR5cGVBKSB7XG4gICAgY2FzZSAnTWFwJzpcbiAgICAgIGlmIChhLnNpemUgIT09IGIuc2l6ZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBfdW5pcUNvbnRlbnRFcXVhbHMoYS5lbnRyaWVzKCksIGIuZW50cmllcygpLCBzdGFja0EuY29uY2F0KFthXSksIHN0YWNrQi5jb25jYXQoW2JdKSk7XG5cbiAgICBjYXNlICdTZXQnOlxuICAgICAgaWYgKGEuc2l6ZSAhPT0gYi5zaXplKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIF91bmlxQ29udGVudEVxdWFscyhhLnZhbHVlcygpLCBiLnZhbHVlcygpLCBzdGFja0EuY29uY2F0KFthXSksIHN0YWNrQi5jb25jYXQoW2JdKSk7XG5cbiAgICBjYXNlICdBcmd1bWVudHMnOlxuICAgIGNhc2UgJ0FycmF5JzpcbiAgICBjYXNlICdPYmplY3QnOlxuICAgIGNhc2UgJ0Jvb2xlYW4nOlxuICAgIGNhc2UgJ051bWJlcic6XG4gICAgY2FzZSAnU3RyaW5nJzpcbiAgICBjYXNlICdEYXRlJzpcbiAgICBjYXNlICdFcnJvcic6XG4gICAgY2FzZSAnUmVnRXhwJzpcbiAgICBjYXNlICdJbnQ4QXJyYXknOlxuICAgIGNhc2UgJ1VpbnQ4QXJyYXknOlxuICAgIGNhc2UgJ1VpbnQ4Q2xhbXBlZEFycmF5JzpcbiAgICBjYXNlICdJbnQxNkFycmF5JzpcbiAgICBjYXNlICdVaW50MTZBcnJheSc6XG4gICAgY2FzZSAnSW50MzJBcnJheSc6XG4gICAgY2FzZSAnVWludDMyQXJyYXknOlxuICAgIGNhc2UgJ0Zsb2F0MzJBcnJheSc6XG4gICAgY2FzZSAnRmxvYXQ2NEFycmF5JzpcbiAgICBjYXNlICdBcnJheUJ1ZmZlcic6XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBWYWx1ZXMgb2Ygb3RoZXIgdHlwZXMgYXJlIG9ubHkgZXF1YWwgaWYgaWRlbnRpY2FsLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGtleXNBID0ga2V5cyhhKTtcblxuICBpZiAoa2V5c0EubGVuZ3RoICE9PSBrZXlzKGIpLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBleHRlbmRlZFN0YWNrQSA9IHN0YWNrQS5jb25jYXQoW2FdKTtcbiAgdmFyIGV4dGVuZGVkU3RhY2tCID0gc3RhY2tCLmNvbmNhdChbYl0pO1xuICBpZHggPSBrZXlzQS5sZW5ndGggLSAxO1xuXG4gIHdoaWxlIChpZHggPj0gMCkge1xuICAgIHZhciBrZXkgPSBrZXlzQVtpZHhdO1xuXG4gICAgaWYgKCEoX2hhcyhrZXksIGIpICYmIF9lcXVhbHMoYltrZXldLCBhW2tleV0sIGV4dGVuZGVkU3RhY2tBLCBleHRlbmRlZFN0YWNrQikpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWR4IC09IDE7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfZXF1YWxzOyIsImZ1bmN0aW9uIF9mdW5jdGlvbk5hbWUoZikge1xuICAvLyBTdHJpbmcoeCA9PiB4KSBldmFsdWF0ZXMgdG8gXCJ4ID0+IHhcIiwgc28gdGhlIHBhdHRlcm4gbWF5IG5vdCBtYXRjaC5cbiAgdmFyIG1hdGNoID0gU3RyaW5nKGYpLm1hdGNoKC9eZnVuY3Rpb24gKFxcdyopLyk7XG4gIHJldHVybiBtYXRjaCA9PSBudWxsID8gJycgOiBtYXRjaFsxXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfZnVuY3Rpb25OYW1lOyIsImZ1bmN0aW9uIF9oYXMocHJvcCwgb2JqKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaGFzOyIsInZhciBfaW5kZXhPZiA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9faW5kZXhPZlwiKTtcblxuZnVuY3Rpb24gX2luY2x1ZGVzKGEsIGxpc3QpIHtcbiAgcmV0dXJuIF9pbmRleE9mKGxpc3QsIGEsIDApID49IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2luY2x1ZGVzOyIsImZ1bmN0aW9uIF9pbmNsdWRlc1dpdGgocHJlZCwgeCwgbGlzdCkge1xuICB2YXIgaWR4ID0gMDtcbiAgdmFyIGxlbiA9IGxpc3QubGVuZ3RoO1xuXG4gIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICBpZiAocHJlZCh4LCBsaXN0W2lkeF0pKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZHggKz0gMTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaW5jbHVkZXNXaXRoOyIsInZhciBlcXVhbHMgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4uL2VxdWFsc1wiKTtcblxuZnVuY3Rpb24gX2luZGV4T2YobGlzdCwgYSwgaWR4KSB7XG4gIHZhciBpbmYsIGl0ZW07IC8vIEFycmF5LnByb3RvdHlwZS5pbmRleE9mIGRvZXNuJ3QgZXhpc3QgYmVsb3cgSUU5XG5cbiAgaWYgKHR5cGVvZiBsaXN0LmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICBzd2l0Y2ggKHR5cGVvZiBhKSB7XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICBpZiAoYSA9PT0gMCkge1xuICAgICAgICAgIC8vIG1hbnVhbGx5IGNyYXdsIHRoZSBsaXN0IHRvIGRpc3Rpbmd1aXNoIGJldHdlZW4gKzAgYW5kIC0wXG4gICAgICAgICAgaW5mID0gMSAvIGE7XG5cbiAgICAgICAgICB3aGlsZSAoaWR4IDwgbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGl0ZW0gPSBsaXN0W2lkeF07XG5cbiAgICAgICAgICAgIGlmIChpdGVtID09PSAwICYmIDEgLyBpdGVtID09PSBpbmYpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGlkeDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9IGVsc2UgaWYgKGEgIT09IGEpIHtcbiAgICAgICAgICAvLyBOYU5cbiAgICAgICAgICB3aGlsZSAoaWR4IDwgbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGl0ZW0gPSBsaXN0W2lkeF07XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gJ251bWJlcicgJiYgaXRlbSAhPT0gaXRlbSkge1xuICAgICAgICAgICAgICByZXR1cm4gaWR4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gLy8gbm9uLXplcm8gbnVtYmVycyBjYW4gdXRpbGlzZSBTZXRcblxuXG4gICAgICAgIHJldHVybiBsaXN0LmluZGV4T2YoYSwgaWR4KTtcbiAgICAgIC8vIGFsbCB0aGVzZSB0eXBlcyBjYW4gdXRpbGlzZSBTZXRcblxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgICAgcmV0dXJuIGxpc3QuaW5kZXhPZihhLCBpZHgpO1xuXG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICBpZiAoYSA9PT0gbnVsbCkge1xuICAgICAgICAgIC8vIG51bGwgY2FuIHV0aWxpc2UgU2V0XG4gICAgICAgICAgcmV0dXJuIGxpc3QuaW5kZXhPZihhLCBpZHgpO1xuICAgICAgICB9XG5cbiAgICB9XG4gIH0gLy8gYW55dGhpbmcgZWxzZSBub3QgY292ZXJlZCBhYm92ZSwgZGVmZXIgdG8gUi5lcXVhbHNcblxuXG4gIHdoaWxlIChpZHggPCBsaXN0Lmxlbmd0aCkge1xuICAgIGlmIChlcXVhbHMobGlzdFtpZHhdLCBhKSkge1xuICAgICAgcmV0dXJuIGlkeDtcbiAgICB9XG5cbiAgICBpZHggKz0gMTtcbiAgfVxuXG4gIHJldHVybiAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaW5kZXhPZjsiLCJ2YXIgX2hhcyA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9faGFzXCIpO1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG52YXIgX2lzQXJndW1lbnRzID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJndW1lbnRzKSA9PT0gJ1tvYmplY3QgQXJndW1lbnRzXScgPyBmdW5jdGlvbiBfaXNBcmd1bWVudHMoeCkge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKHgpID09PSAnW29iamVjdCBBcmd1bWVudHNdJztcbiAgfSA6IGZ1bmN0aW9uIF9pc0FyZ3VtZW50cyh4KSB7XG4gICAgcmV0dXJuIF9oYXMoJ2NhbGxlZScsIHgpO1xuICB9O1xufSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IF9pc0FyZ3VtZW50czsiLCIvKipcbiAqIFRlc3RzIHdoZXRoZXIgb3Igbm90IGFuIG9iamVjdCBpcyBhbiBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWwgVGhlIG9iamVjdCB0byB0ZXN0LlxuICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIGB2YWxgIGlzIGFuIGFycmF5LCBgZmFsc2VgIG90aGVyd2lzZS5cbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBfaXNBcnJheShbXSk7IC8vPT4gdHJ1ZVxuICogICAgICBfaXNBcnJheShudWxsKTsgLy89PiBmYWxzZVxuICogICAgICBfaXNBcnJheSh7fSk7IC8vPT4gZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIF9pc0FycmF5KHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsLmxlbmd0aCA+PSAwICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheV0nO1xufTsiLCJ2YXIgX2N1cnJ5MSA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9fY3VycnkxXCIpO1xuXG52YXIgX2lzQXJyYXkgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vX2lzQXJyYXlcIik7XG5cbnZhciBfaXNTdHJpbmcgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vX2lzU3RyaW5nXCIpO1xuLyoqXG4gKiBUZXN0cyB3aGV0aGVyIG9yIG5vdCBhbiBvYmplY3QgaXMgc2ltaWxhciB0byBhbiBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNhdGVnb3J5IFR5cGVcbiAqIEBjYXRlZ29yeSBMaXN0XG4gKiBAc2lnICogLT4gQm9vbGVhblxuICogQHBhcmFtIHsqfSB4IFRoZSBvYmplY3QgdG8gdGVzdC5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IGB0cnVlYCBpZiBgeGAgaGFzIGEgbnVtZXJpYyBsZW5ndGggcHJvcGVydHkgYW5kIGV4dHJlbWUgaW5kaWNlcyBkZWZpbmVkOyBgZmFsc2VgIG90aGVyd2lzZS5cbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBfaXNBcnJheUxpa2UoW10pOyAvLz0+IHRydWVcbiAqICAgICAgX2lzQXJyYXlMaWtlKHRydWUpOyAvLz0+IGZhbHNlXG4gKiAgICAgIF9pc0FycmF5TGlrZSh7fSk7IC8vPT4gZmFsc2VcbiAqICAgICAgX2lzQXJyYXlMaWtlKHtsZW5ndGg6IDEwfSk7IC8vPT4gZmFsc2VcbiAqICAgICAgX2lzQXJyYXlMaWtlKHswOiAnemVybycsIDk6ICduaW5lJywgbGVuZ3RoOiAxMH0pOyAvLz0+IHRydWVcbiAqL1xuXG5cbnZhciBfaXNBcnJheUxpa2UgPVxuLyojX19QVVJFX18qL1xuX2N1cnJ5MShmdW5jdGlvbiBpc0FycmF5TGlrZSh4KSB7XG4gIGlmIChfaXNBcnJheSh4KSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKCF4KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB4ICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChfaXNTdHJpbmcoeCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoeC5ub2RlVHlwZSA9PT0gMSkge1xuICAgIHJldHVybiAhIXgubGVuZ3RoO1xuICB9XG5cbiAgaWYgKHgubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoeC5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHguaGFzT3duUHJvcGVydHkoMCkgJiYgeC5oYXNPd25Qcm9wZXJ0eSh4Lmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gX2lzQXJyYXlMaWtlOyIsIi8qKlxuICogRGV0ZXJtaW5lIGlmIHRoZSBwYXNzZWQgYXJndW1lbnQgaXMgYW4gaW50ZWdlci5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSBuXG4gKiBAY2F0ZWdvcnkgVHlwZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBOdW1iZXIuaXNJbnRlZ2VyIHx8IGZ1bmN0aW9uIF9pc0ludGVnZXIobikge1xuICByZXR1cm4gbiA8PCAwID09PSBuO1xufTsiLCJmdW5jdGlvbiBfaXNQbGFjZWhvbGRlcihhKSB7XG4gIHJldHVybiBhICE9IG51bGwgJiYgdHlwZW9mIGEgPT09ICdvYmplY3QnICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pc1BsYWNlaG9sZGVyOyIsImZ1bmN0aW9uIF9pc1N0cmluZyh4KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeCkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pc1N0cmluZzsiLCJmdW5jdGlvbiBfaXNUcmFuc2Zvcm1lcihvYmopIHtcbiAgcmV0dXJuIG9iaiAhPSBudWxsICYmIHR5cGVvZiBvYmpbJ0BAdHJhbnNkdWNlci9zdGVwJ10gPT09ICdmdW5jdGlvbic7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2lzVHJhbnNmb3JtZXI7IiwiLy8gQmFzZWQgb24gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2lzXG5mdW5jdGlvbiBfb2JqZWN0SXMoYSwgYikge1xuICAvLyBTYW1lVmFsdWUgYWxnb3JpdGhtXG4gIGlmIChhID09PSBiKSB7XG4gICAgLy8gU3RlcHMgMS01LCA3LTEwXG4gICAgLy8gU3RlcHMgNi5iLTYuZTogKzAgIT0gLTBcbiAgICByZXR1cm4gYSAhPT0gMCB8fCAxIC8gYSA9PT0gMSAvIGI7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3RlcCA2LmE6IE5hTiA9PSBOYU5cbiAgICByZXR1cm4gYSAhPT0gYSAmJiBiICE9PSBiO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdHlwZW9mIE9iamVjdC5pcyA9PT0gJ2Z1bmN0aW9uJyA/IE9iamVjdC5pcyA6IF9vYmplY3RJczsiLCJmdW5jdGlvbiBfcGlwZShmLCBnKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGcuY2FsbCh0aGlzLCBmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9waXBlOyIsInZhciBfaXNBcnJheUxpa2UgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vX2lzQXJyYXlMaWtlXCIpO1xuXG52YXIgX3h3cmFwID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL194d3JhcFwiKTtcblxudmFyIGJpbmQgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4uL2JpbmRcIik7XG5cbmZ1bmN0aW9uIF9hcnJheVJlZHVjZSh4ZiwgYWNjLCBsaXN0KSB7XG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gbGlzdC5sZW5ndGg7XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGFjYyA9IHhmWydAQHRyYW5zZHVjZXIvc3RlcCddKGFjYywgbGlzdFtpZHhdKTtcblxuICAgIGlmIChhY2MgJiYgYWNjWydAQHRyYW5zZHVjZXIvcmVkdWNlZCddKSB7XG4gICAgICBhY2MgPSBhY2NbJ0BAdHJhbnNkdWNlci92YWx1ZSddO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWR4ICs9IDE7XG4gIH1cblxuICByZXR1cm4geGZbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXShhY2MpO1xufVxuXG5mdW5jdGlvbiBfaXRlcmFibGVSZWR1Y2UoeGYsIGFjYywgaXRlcikge1xuICB2YXIgc3RlcCA9IGl0ZXIubmV4dCgpO1xuXG4gIHdoaWxlICghc3RlcC5kb25lKSB7XG4gICAgYWNjID0geGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10oYWNjLCBzdGVwLnZhbHVlKTtcblxuICAgIGlmIChhY2MgJiYgYWNjWydAQHRyYW5zZHVjZXIvcmVkdWNlZCddKSB7XG4gICAgICBhY2MgPSBhY2NbJ0BAdHJhbnNkdWNlci92YWx1ZSddO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgc3RlcCA9IGl0ZXIubmV4dCgpO1xuICB9XG5cbiAgcmV0dXJuIHhmWydAQHRyYW5zZHVjZXIvcmVzdWx0J10oYWNjKTtcbn1cblxuZnVuY3Rpb24gX21ldGhvZFJlZHVjZSh4ZiwgYWNjLCBvYmosIG1ldGhvZE5hbWUpIHtcbiAgcmV0dXJuIHhmWydAQHRyYW5zZHVjZXIvcmVzdWx0J10ob2JqW21ldGhvZE5hbWVdKGJpbmQoeGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10sIHhmKSwgYWNjKSk7XG59XG5cbnZhciBzeW1JdGVyYXRvciA9IHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnID8gU3ltYm9sLml0ZXJhdG9yIDogJ0BAaXRlcmF0b3InO1xuXG5mdW5jdGlvbiBfcmVkdWNlKGZuLCBhY2MsIGxpc3QpIHtcbiAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gX3h3cmFwKGZuKTtcbiAgfVxuXG4gIGlmIChfaXNBcnJheUxpa2UobGlzdCkpIHtcbiAgICByZXR1cm4gX2FycmF5UmVkdWNlKGZuLCBhY2MsIGxpc3QpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBsaXN0WydmYW50YXN5LWxhbmQvcmVkdWNlJ10gPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gX21ldGhvZFJlZHVjZShmbiwgYWNjLCBsaXN0LCAnZmFudGFzeS1sYW5kL3JlZHVjZScpO1xuICB9XG5cbiAgaWYgKGxpc3Rbc3ltSXRlcmF0b3JdICE9IG51bGwpIHtcbiAgICByZXR1cm4gX2l0ZXJhYmxlUmVkdWNlKGZuLCBhY2MsIGxpc3Rbc3ltSXRlcmF0b3JdKCkpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBsaXN0Lm5leHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gX2l0ZXJhYmxlUmVkdWNlKGZuLCBhY2MsIGxpc3QpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBsaXN0LnJlZHVjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBfbWV0aG9kUmVkdWNlKGZuLCBhY2MsIGxpc3QsICdyZWR1Y2UnKTtcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ3JlZHVjZTogbGlzdCBtdXN0IGJlIGFycmF5IG9yIGl0ZXJhYmxlJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3JlZHVjZTsiLCJmdW5jdGlvbiBfcmVkdWNlZCh4KSB7XG4gIHJldHVybiB4ICYmIHhbJ0BAdHJhbnNkdWNlci9yZWR1Y2VkJ10gPyB4IDoge1xuICAgICdAQHRyYW5zZHVjZXIvdmFsdWUnOiB4LFxuICAgICdAQHRyYW5zZHVjZXIvcmVkdWNlZCc6IHRydWVcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfcmVkdWNlZDsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnhmWydAQHRyYW5zZHVjZXIvaW5pdCddKCk7XG4gIH0sXG4gIHJlc3VsdDogZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgIHJldHVybiB0aGlzLnhmWydAQHRyYW5zZHVjZXIvcmVzdWx0J10ocmVzdWx0KTtcbiAgfVxufTsiLCJ2YXIgX2N1cnJ5MiA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9fY3VycnkyXCIpO1xuXG52YXIgX3JlZHVjZWQgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vX3JlZHVjZWRcIik7XG5cbnZhciBfeGZCYXNlID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL194ZkJhc2VcIik7XG5cbnZhciBYVGFrZSA9XG4vKiNfX1BVUkVfXyovXG5mdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFhUYWtlKG4sIHhmKSB7XG4gICAgdGhpcy54ZiA9IHhmO1xuICAgIHRoaXMubiA9IG47XG4gICAgdGhpcy5pID0gMDtcbiAgfVxuXG4gIFhUYWtlLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL2luaXQnXSA9IF94ZkJhc2UuaW5pdDtcbiAgWFRha2UucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvcmVzdWx0J10gPSBfeGZCYXNlLnJlc3VsdDtcblxuICBYVGFrZS5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9zdGVwJ10gPSBmdW5jdGlvbiAocmVzdWx0LCBpbnB1dCkge1xuICAgIHRoaXMuaSArPSAxO1xuICAgIHZhciByZXQgPSB0aGlzLm4gPT09IDAgPyByZXN1bHQgOiB0aGlzLnhmWydAQHRyYW5zZHVjZXIvc3RlcCddKHJlc3VsdCwgaW5wdXQpO1xuICAgIHJldHVybiB0aGlzLm4gPj0gMCAmJiB0aGlzLmkgPj0gdGhpcy5uID8gX3JlZHVjZWQocmV0KSA6IHJldDtcbiAgfTtcblxuICByZXR1cm4gWFRha2U7XG59KCk7XG5cbnZhciBfeHRha2UgPVxuLyojX19QVVJFX18qL1xuX2N1cnJ5MihmdW5jdGlvbiBfeHRha2UobiwgeGYpIHtcbiAgcmV0dXJuIG5ldyBYVGFrZShuLCB4Zik7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBfeHRha2U7IiwidmFyIFhXcmFwID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gWFdyYXAoZm4pIHtcbiAgICB0aGlzLmYgPSBmbjtcbiAgfVxuXG4gIFhXcmFwLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL2luaXQnXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2luaXQgbm90IGltcGxlbWVudGVkIG9uIFhXcmFwJyk7XG4gIH07XG5cbiAgWFdyYXAucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvcmVzdWx0J10gPSBmdW5jdGlvbiAoYWNjKSB7XG4gICAgcmV0dXJuIGFjYztcbiAgfTtcblxuICBYV3JhcC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9zdGVwJ10gPSBmdW5jdGlvbiAoYWNjLCB4KSB7XG4gICAgcmV0dXJuIHRoaXMuZihhY2MsIHgpO1xuICB9O1xuXG4gIHJldHVybiBYV3JhcDtcbn0oKTtcblxuZnVuY3Rpb24gX3h3cmFwKGZuKSB7XG4gIHJldHVybiBuZXcgWFdyYXAoZm4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF94d3JhcDsiLCJ2YXIgX2N1cnJ5MSA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9fY3VycnkxXCIpO1xuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGlucHV0IHZhbHVlIGlzIGBudWxsYCBvciBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC45LjBcbiAqIEBjYXRlZ29yeSBUeXBlXG4gKiBAc2lnICogLT4gQm9vbGVhblxuICogQHBhcmFtIHsqfSB4IFRoZSB2YWx1ZSB0byB0ZXN0LlxuICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIGB4YCBpcyBgdW5kZWZpbmVkYCBvciBgbnVsbGAsIG90aGVyd2lzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIuaXNOaWwobnVsbCk7IC8vPT4gdHJ1ZVxuICogICAgICBSLmlzTmlsKHVuZGVmaW5lZCk7IC8vPT4gdHJ1ZVxuICogICAgICBSLmlzTmlsKDApOyAvLz0+IGZhbHNlXG4gKiAgICAgIFIuaXNOaWwoW10pOyAvLz0+IGZhbHNlXG4gKi9cblxuXG52YXIgaXNOaWwgPVxuLyojX19QVVJFX18qL1xuX2N1cnJ5MShmdW5jdGlvbiBpc05pbCh4KSB7XG4gIHJldHVybiB4ID09IG51bGw7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc05pbDsiLCJ2YXIgX2N1cnJ5MSA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9fY3VycnkxXCIpO1xuXG52YXIgX2hhcyA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9faGFzXCIpO1xuXG52YXIgX2lzQXJndW1lbnRzID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL19pc0FyZ3VtZW50c1wiKTsgLy8gY292ZXIgSUUgPCA5IGtleXMgaXNzdWVzXG5cblxudmFyIGhhc0VudW1CdWcgPSAhXG4vKiNfX1BVUkVfXyovXG57XG4gIHRvU3RyaW5nOiBudWxsXG59LnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpO1xudmFyIG5vbkVudW1lcmFibGVQcm9wcyA9IFsnY29uc3RydWN0b3InLCAndmFsdWVPZicsICdpc1Byb3RvdHlwZU9mJywgJ3RvU3RyaW5nJywgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJ2hhc093blByb3BlcnR5JywgJ3RvTG9jYWxlU3RyaW5nJ107IC8vIFNhZmFyaSBidWdcblxudmFyIGhhc0FyZ3NFbnVtQnVnID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHJldHVybiBhcmd1bWVudHMucHJvcGVydHlJc0VudW1lcmFibGUoJ2xlbmd0aCcpO1xufSgpO1xuXG52YXIgY29udGFpbnMgPSBmdW5jdGlvbiBjb250YWlucyhsaXN0LCBpdGVtKSB7XG4gIHZhciBpZHggPSAwO1xuXG4gIHdoaWxlIChpZHggPCBsaXN0Lmxlbmd0aCkge1xuICAgIGlmIChsaXN0W2lkeF0gPT09IGl0ZW0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlkeCArPSAxO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcbi8qKlxuICogUmV0dXJucyBhIGxpc3QgY29udGFpbmluZyB0aGUgbmFtZXMgb2YgYWxsIHRoZSBlbnVtZXJhYmxlIG93biBwcm9wZXJ0aWVzIG9mXG4gKiB0aGUgc3VwcGxpZWQgb2JqZWN0LlxuICogTm90ZSB0aGF0IHRoZSBvcmRlciBvZiB0aGUgb3V0cHV0IGFycmF5IGlzIG5vdCBndWFyYW50ZWVkIHRvIGJlIGNvbnNpc3RlbnRcbiAqIGFjcm9zcyBkaWZmZXJlbnQgSlMgcGxhdGZvcm1zLlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjEuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHNpZyB7azogdn0gLT4gW2tdXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gZXh0cmFjdCBwcm9wZXJ0aWVzIGZyb21cbiAqIEByZXR1cm4ge0FycmF5fSBBbiBhcnJheSBvZiB0aGUgb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMuXG4gKiBAc2VlIFIua2V5c0luLCBSLnZhbHVlc1xuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIua2V5cyh7YTogMSwgYjogMiwgYzogM30pOyAvLz0+IFsnYScsICdiJywgJ2MnXVxuICovXG5cblxudmFyIGtleXMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbicgJiYgIWhhc0FyZ3NFbnVtQnVnID9cbi8qI19fUFVSRV9fKi9cbl9jdXJyeTEoZnVuY3Rpb24ga2V5cyhvYmopIHtcbiAgcmV0dXJuIE9iamVjdChvYmopICE9PSBvYmogPyBbXSA6IE9iamVjdC5rZXlzKG9iaik7XG59KSA6XG4vKiNfX1BVUkVfXyovXG5fY3VycnkxKGZ1bmN0aW9uIGtleXMob2JqKSB7XG4gIGlmIChPYmplY3Qob2JqKSAhPT0gb2JqKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdmFyIHByb3AsIG5JZHg7XG4gIHZhciBrcyA9IFtdO1xuXG4gIHZhciBjaGVja0FyZ3NMZW5ndGggPSBoYXNBcmdzRW51bUJ1ZyAmJiBfaXNBcmd1bWVudHMob2JqKTtcblxuICBmb3IgKHByb3AgaW4gb2JqKSB7XG4gICAgaWYgKF9oYXMocHJvcCwgb2JqKSAmJiAoIWNoZWNrQXJnc0xlbmd0aCB8fCBwcm9wICE9PSAnbGVuZ3RoJykpIHtcbiAgICAgIGtzW2tzLmxlbmd0aF0gPSBwcm9wO1xuICAgIH1cbiAgfVxuXG4gIGlmIChoYXNFbnVtQnVnKSB7XG4gICAgbklkeCA9IG5vbkVudW1lcmFibGVQcm9wcy5sZW5ndGggLSAxO1xuXG4gICAgd2hpbGUgKG5JZHggPj0gMCkge1xuICAgICAgcHJvcCA9IG5vbkVudW1lcmFibGVQcm9wc1tuSWR4XTtcblxuICAgICAgaWYgKF9oYXMocHJvcCwgb2JqKSAmJiAhY29udGFpbnMoa3MsIHByb3ApKSB7XG4gICAgICAgIGtzW2tzLmxlbmd0aF0gPSBwcm9wO1xuICAgICAgfVxuXG4gICAgICBuSWR4IC09IDE7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGtzO1xufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGtleXM7IiwidmFyIF9jdXJyeTIgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vaW50ZXJuYWwvX2N1cnJ5MlwiKTtcbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgc2Vjb25kO1xuICogYGZhbHNlYCBvdGhlcndpc2UuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuMS4wXG4gKiBAY2F0ZWdvcnkgUmVsYXRpb25cbiAqIEBzaWcgT3JkIGEgPT4gYSAtPiBhIC0+IEJvb2xlYW5cbiAqIEBwYXJhbSB7TnVtYmVyfSBhXG4gKiBAcGFyYW0ge051bWJlcn0gYlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBzZWUgUi5ndGVcbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBSLmx0ZSgyLCAxKTsgLy89PiBmYWxzZVxuICogICAgICBSLmx0ZSgyLCAyKTsgLy89PiB0cnVlXG4gKiAgICAgIFIubHRlKDIsIDMpOyAvLz0+IHRydWVcbiAqICAgICAgUi5sdGUoJ2EnLCAneicpOyAvLz0+IHRydWVcbiAqICAgICAgUi5sdGUoJ3onLCAnYScpOyAvLz0+IGZhbHNlXG4gKi9cblxuXG52YXIgbHRlID1cbi8qI19fUFVSRV9fKi9cbl9jdXJyeTIoZnVuY3Rpb24gbHRlKGEsIGIpIHtcbiAgcmV0dXJuIGEgPD0gYjtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGx0ZTsiLCJ2YXIgX2N1cnJ5MSA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9fY3VycnkxXCIpO1xuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgYCFgIG9mIGl0cyBhcmd1bWVudC4gSXQgd2lsbCByZXR1cm4gYHRydWVgIHdoZW5cbiAqIHBhc3NlZCBmYWxzZS15IHZhbHVlLCBhbmQgYGZhbHNlYCB3aGVuIHBhc3NlZCBhIHRydXRoLXkgb25lLlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjEuMFxuICogQGNhdGVnb3J5IExvZ2ljXG4gKiBAc2lnICogLT4gQm9vbGVhblxuICogQHBhcmFtIHsqfSBhIGFueSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn0gdGhlIGxvZ2ljYWwgaW52ZXJzZSBvZiBwYXNzZWQgYXJndW1lbnQuXG4gKiBAc2VlIFIuY29tcGxlbWVudFxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIubm90KHRydWUpOyAvLz0+IGZhbHNlXG4gKiAgICAgIFIubm90KGZhbHNlKTsgLy89PiB0cnVlXG4gKiAgICAgIFIubm90KDApOyAvLz0+IHRydWVcbiAqICAgICAgUi5ub3QoMSk7IC8vPT4gZmFsc2VcbiAqL1xuXG5cbnZhciBub3QgPVxuLyojX19QVVJFX18qL1xuX2N1cnJ5MShmdW5jdGlvbiBub3QoYSkge1xuICByZXR1cm4gIWE7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBub3Q7IiwidmFyIF9jdXJyeTIgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vaW50ZXJuYWwvX2N1cnJ5MlwiKTtcblxudmFyIF9pc1N0cmluZyA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9faXNTdHJpbmdcIik7XG4vKipcbiAqIFJldHVybnMgdGhlIG50aCBlbGVtZW50IG9mIHRoZSBnaXZlbiBsaXN0IG9yIHN0cmluZy4gSWYgbiBpcyBuZWdhdGl2ZSB0aGVcbiAqIGVsZW1lbnQgYXQgaW5kZXggbGVuZ3RoICsgbiBpcyByZXR1cm5lZC5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC4xLjBcbiAqIEBjYXRlZ29yeSBMaXN0XG4gKiBAc2lnIE51bWJlciAtPiBbYV0gLT4gYSB8IFVuZGVmaW5lZFxuICogQHNpZyBOdW1iZXIgLT4gU3RyaW5nIC0+IFN0cmluZ1xuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldFxuICogQHBhcmFtIHsqfSBsaXN0XG4gKiBAcmV0dXJuIHsqfVxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIGNvbnN0IGxpc3QgPSBbJ2ZvbycsICdiYXInLCAnYmF6JywgJ3F1dXgnXTtcbiAqICAgICAgUi5udGgoMSwgbGlzdCk7IC8vPT4gJ2JhcidcbiAqICAgICAgUi5udGgoLTEsIGxpc3QpOyAvLz0+ICdxdXV4J1xuICogICAgICBSLm50aCgtOTksIGxpc3QpOyAvLz0+IHVuZGVmaW5lZFxuICpcbiAqICAgICAgUi5udGgoMiwgJ2FiYycpOyAvLz0+ICdjJ1xuICogICAgICBSLm50aCgzLCAnYWJjJyk7IC8vPT4gJydcbiAqIEBzeW1iIFIubnRoKC0xLCBbYSwgYiwgY10pID0gY1xuICogQHN5bWIgUi5udGgoMCwgW2EsIGIsIGNdKSA9IGFcbiAqIEBzeW1iIFIubnRoKDEsIFthLCBiLCBjXSkgPSBiXG4gKi9cblxuXG52YXIgbnRoID1cbi8qI19fUFVSRV9fKi9cbl9jdXJyeTIoZnVuY3Rpb24gbnRoKG9mZnNldCwgbGlzdCkge1xuICB2YXIgaWR4ID0gb2Zmc2V0IDwgMCA/IGxpc3QubGVuZ3RoICsgb2Zmc2V0IDogb2Zmc2V0O1xuICByZXR1cm4gX2lzU3RyaW5nKGxpc3QpID8gbGlzdC5jaGFyQXQoaWR4KSA6IGxpc3RbaWR4XTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG50aDsiLCJ2YXIgX2N1cnJ5MiA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9fY3VycnkyXCIpO1xuXG52YXIgcGF0aHMgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vcGF0aHNcIik7XG4vKipcbiAqIFJldHJpZXZlIHRoZSB2YWx1ZSBhdCBhIGdpdmVuIHBhdGguXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuMi4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAdHlwZWRlZm4gSWR4ID0gU3RyaW5nIHwgSW50XG4gKiBAc2lnIFtJZHhdIC0+IHthfSAtPiBhIHwgVW5kZWZpbmVkXG4gKiBAcGFyYW0ge0FycmF5fSBwYXRoIFRoZSBwYXRoIHRvIHVzZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byByZXRyaWV2ZSB0aGUgbmVzdGVkIHByb3BlcnR5IGZyb20uXG4gKiBAcmV0dXJuIHsqfSBUaGUgZGF0YSBhdCBgcGF0aGAuXG4gKiBAc2VlIFIucHJvcCwgUi5udGhcbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBSLnBhdGgoWydhJywgJ2InXSwge2E6IHtiOiAyfX0pOyAvLz0+IDJcbiAqICAgICAgUi5wYXRoKFsnYScsICdiJ10sIHtjOiB7YjogMn19KTsgLy89PiB1bmRlZmluZWRcbiAqICAgICAgUi5wYXRoKFsnYScsICdiJywgMF0sIHthOiB7YjogWzEsIDIsIDNdfX0pOyAvLz0+IDFcbiAqICAgICAgUi5wYXRoKFsnYScsICdiJywgLTJdLCB7YToge2I6IFsxLCAyLCAzXX19KTsgLy89PiAyXG4gKi9cblxuXG52YXIgcGF0aCA9XG4vKiNfX1BVUkVfXyovXG5fY3VycnkyKGZ1bmN0aW9uIHBhdGgocGF0aEFyLCBvYmopIHtcbiAgcmV0dXJuIHBhdGhzKFtwYXRoQXJdLCBvYmopWzBdO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcGF0aDsiLCJ2YXIgX2N1cnJ5MiA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9fY3VycnkyXCIpO1xuXG52YXIgX2lzSW50ZWdlciA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9faXNJbnRlZ2VyXCIpO1xuXG52YXIgbnRoID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL250aFwiKTtcbi8qKlxuICogUmV0cmlldmVzIHRoZSB2YWx1ZXMgYXQgZ2l2ZW4gcGF0aHMgb2YgYW4gb2JqZWN0LlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjI3LjFcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEB0eXBlZGVmbiBJZHggPSBbU3RyaW5nIHwgSW50XVxuICogQHNpZyBbSWR4XSAtPiB7YX0gLT4gW2EgfCBVbmRlZmluZWRdXG4gKiBAcGFyYW0ge0FycmF5fSBwYXRoc0FycmF5IFRoZSBhcnJheSBvZiBwYXRocyB0byBiZSBmZXRjaGVkLlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHJldHJpZXZlIHRoZSBuZXN0ZWQgcHJvcGVydGllcyBmcm9tLlxuICogQHJldHVybiB7QXJyYXl9IEEgbGlzdCBjb25zaXN0aW5nIG9mIHZhbHVlcyBhdCBwYXRocyBzcGVjaWZpZWQgYnkgXCJwYXRoc0FycmF5XCIuXG4gKiBAc2VlIFIucGF0aFxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIucGF0aHMoW1snYScsICdiJ10sIFsncCcsIDAsICdxJ11dLCB7YToge2I6IDJ9LCBwOiBbe3E6IDN9XX0pOyAvLz0+IFsyLCAzXVxuICogICAgICBSLnBhdGhzKFtbJ2EnLCAnYiddLCBbJ3AnLCAnciddXSwge2E6IHtiOiAyfSwgcDogW3txOiAzfV19KTsgLy89PiBbMiwgdW5kZWZpbmVkXVxuICovXG5cblxudmFyIHBhdGhzID1cbi8qI19fUFVSRV9fKi9cbl9jdXJyeTIoZnVuY3Rpb24gcGF0aHMocGF0aHNBcnJheSwgb2JqKSB7XG4gIHJldHVybiBwYXRoc0FycmF5Lm1hcChmdW5jdGlvbiAocGF0aHMpIHtcbiAgICB2YXIgdmFsID0gb2JqO1xuICAgIHZhciBpZHggPSAwO1xuICAgIHZhciBwO1xuXG4gICAgd2hpbGUgKGlkeCA8IHBhdGhzLmxlbmd0aCkge1xuICAgICAgaWYgKHZhbCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcCA9IHBhdGhzW2lkeF07XG4gICAgICB2YWwgPSBfaXNJbnRlZ2VyKHApID8gbnRoKHAsIHZhbCkgOiB2YWxbcF07XG4gICAgICBpZHggKz0gMTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsO1xuICB9KTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGhzOyIsInZhciBfYXJpdHkgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vaW50ZXJuYWwvX2FyaXR5XCIpO1xuXG52YXIgX3BpcGUgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vaW50ZXJuYWwvX3BpcGVcIik7XG5cbnZhciByZWR1Y2UgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vcmVkdWNlXCIpO1xuXG52YXIgdGFpbCA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi90YWlsXCIpO1xuLyoqXG4gKiBQZXJmb3JtcyBsZWZ0LXRvLXJpZ2h0IGZ1bmN0aW9uIGNvbXBvc2l0aW9uLiBUaGUgZmlyc3QgYXJndW1lbnQgbWF5IGhhdmVcbiAqIGFueSBhcml0eTsgdGhlIHJlbWFpbmluZyBhcmd1bWVudHMgbXVzdCBiZSB1bmFyeS5cbiAqXG4gKiBJbiBzb21lIGxpYnJhcmllcyB0aGlzIGZ1bmN0aW9uIGlzIG5hbWVkIGBzZXF1ZW5jZWAuXG4gKlxuICogKipOb3RlOioqIFRoZSByZXN1bHQgb2YgcGlwZSBpcyBub3QgYXV0b21hdGljYWxseSBjdXJyaWVkLlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAc2lnICgoKGEsIGIsIC4uLiwgbikgLT4gbyksIChvIC0+IHApLCAuLi4sICh4IC0+IHkpLCAoeSAtPiB6KSkgLT4gKChhLCBiLCAuLi4sIG4pIC0+IHopXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBmdW5jdGlvbnNcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQHNlZSBSLmNvbXBvc2VcbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBjb25zdCBmID0gUi5waXBlKE1hdGgucG93LCBSLm5lZ2F0ZSwgUi5pbmMpO1xuICpcbiAqICAgICAgZigzLCA0KTsgLy8gLSgzXjQpICsgMVxuICogQHN5bWIgUi5waXBlKGYsIGcsIGgpKGEsIGIpID0gaChnKGYoYSwgYikpKVxuICovXG5cblxuZnVuY3Rpb24gcGlwZSgpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3BpcGUgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGFyZ3VtZW50Jyk7XG4gIH1cblxuICByZXR1cm4gX2FyaXR5KGFyZ3VtZW50c1swXS5sZW5ndGgsIHJlZHVjZShfcGlwZSwgYXJndW1lbnRzWzBdLCB0YWlsKGFyZ3VtZW50cykpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwaXBlOyIsInZhciBfY3VycnkyID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL19jdXJyeTJcIik7XG5cbnZhciBwYXRoID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL3BhdGhcIik7XG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdoZW4gc3VwcGxpZWQgYW4gb2JqZWN0IHJldHVybnMgdGhlIGluZGljYXRlZFxuICogcHJvcGVydHkgb2YgdGhhdCBvYmplY3QsIGlmIGl0IGV4aXN0cy5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC4xLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEB0eXBlZGVmbiBJZHggPSBTdHJpbmcgfCBJbnRcbiAqIEBzaWcgSWR4IC0+IHtzOiBhfSAtPiBhIHwgVW5kZWZpbmVkXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHAgVGhlIHByb3BlcnR5IG5hbWUgb3IgYXJyYXkgaW5kZXhcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBxdWVyeVxuICogQHJldHVybiB7Kn0gVGhlIHZhbHVlIGF0IGBvYmoucGAuXG4gKiBAc2VlIFIucGF0aCwgUi5udGhcbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBSLnByb3AoJ3gnLCB7eDogMTAwfSk7IC8vPT4gMTAwXG4gKiAgICAgIFIucHJvcCgneCcsIHt9KTsgLy89PiB1bmRlZmluZWRcbiAqICAgICAgUi5wcm9wKDAsIFsxMDBdKTsgLy89PiAxMDBcbiAqICAgICAgUi5jb21wb3NlKFIuaW5jLCBSLnByb3AoJ3gnKSkoeyB4OiAzIH0pIC8vPT4gNFxuICovXG5cblxudmFyIHByb3AgPVxuLyojX19QVVJFX18qL1xuX2N1cnJ5MihmdW5jdGlvbiBwcm9wKHAsIG9iaikge1xuICByZXR1cm4gcGF0aChbcF0sIG9iaik7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBwcm9wOyIsInZhciBfY3VycnkzID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL19jdXJyeTNcIik7XG5cbnZhciBfcmVkdWNlID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL19yZWR1Y2VcIik7XG4vKipcbiAqIFJldHVybnMgYSBzaW5nbGUgaXRlbSBieSBpdGVyYXRpbmcgdGhyb3VnaCB0aGUgbGlzdCwgc3VjY2Vzc2l2ZWx5IGNhbGxpbmdcbiAqIHRoZSBpdGVyYXRvciBmdW5jdGlvbiBhbmQgcGFzc2luZyBpdCBhbiBhY2N1bXVsYXRvciB2YWx1ZSBhbmQgdGhlIGN1cnJlbnRcbiAqIHZhbHVlIGZyb20gdGhlIGFycmF5LCBhbmQgdGhlbiBwYXNzaW5nIHRoZSByZXN1bHQgdG8gdGhlIG5leHQgY2FsbC5cbiAqXG4gKiBUaGUgaXRlcmF0b3IgZnVuY3Rpb24gcmVjZWl2ZXMgdHdvIHZhbHVlczogKihhY2MsIHZhbHVlKSouIEl0IG1heSB1c2VcbiAqIFtgUi5yZWR1Y2VkYF0oI3JlZHVjZWQpIHRvIHNob3J0Y3V0IHRoZSBpdGVyYXRpb24uXG4gKlxuICogVGhlIGFyZ3VtZW50cycgb3JkZXIgb2YgW2ByZWR1Y2VSaWdodGBdKCNyZWR1Y2VSaWdodCkncyBpdGVyYXRvciBmdW5jdGlvblxuICogaXMgKih2YWx1ZSwgYWNjKSouXG4gKlxuICogTm90ZTogYFIucmVkdWNlYCBkb2VzIG5vdCBza2lwIGRlbGV0ZWQgb3IgdW5hc3NpZ25lZCBpbmRpY2VzIChzcGFyc2VcbiAqIGFycmF5cyksIHVubGlrZSB0aGUgbmF0aXZlIGBBcnJheS5wcm90b3R5cGUucmVkdWNlYCBtZXRob2QuIEZvciBtb3JlIGRldGFpbHNcbiAqIG9uIHRoaXMgYmVoYXZpb3IsIHNlZTpcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L3JlZHVjZSNEZXNjcmlwdGlvblxuICpcbiAqIERpc3BhdGNoZXMgdG8gdGhlIGByZWR1Y2VgIG1ldGhvZCBvZiB0aGUgdGhpcmQgYXJndW1lbnQsIGlmIHByZXNlbnQuIFdoZW5cbiAqIGRvaW5nIHNvLCBpdCBpcyB1cCB0byB0aGUgdXNlciB0byBoYW5kbGUgdGhlIFtgUi5yZWR1Y2VkYF0oI3JlZHVjZWQpXG4gKiBzaG9ydGN1dGluZywgYXMgdGhpcyBpcyBub3QgaW1wbGVtZW50ZWQgYnkgYHJlZHVjZWAuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuMS4wXG4gKiBAY2F0ZWdvcnkgTGlzdFxuICogQHNpZyAoKGEsIGIpIC0+IGEpIC0+IGEgLT4gW2JdIC0+IGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBpdGVyYXRvciBmdW5jdGlvbi4gUmVjZWl2ZXMgdHdvIHZhbHVlcywgdGhlIGFjY3VtdWxhdG9yIGFuZCB0aGVcbiAqICAgICAgICBjdXJyZW50IGVsZW1lbnQgZnJvbSB0aGUgYXJyYXkuXG4gKiBAcGFyYW0geyp9IGFjYyBUaGUgYWNjdW11bGF0b3IgdmFsdWUuXG4gKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBsaXN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEByZXR1cm4geyp9IFRoZSBmaW5hbCwgYWNjdW11bGF0ZWQgdmFsdWUuXG4gKiBAc2VlIFIucmVkdWNlZCwgUi5hZGRJbmRleCwgUi5yZWR1Y2VSaWdodFxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIucmVkdWNlKFIuc3VidHJhY3QsIDAsIFsxLCAyLCAzLCA0XSkgLy8gPT4gKCgoKDAgLSAxKSAtIDIpIC0gMykgLSA0KSA9IC0xMFxuICogICAgICAvLyAgICAgICAgICAtICAgICAgICAgICAgICAgLTEwXG4gKiAgICAgIC8vICAgICAgICAgLyBcXCAgICAgICAgICAgICAgLyBcXFxuICogICAgICAvLyAgICAgICAgLSAgIDQgICAgICAgICAgIC02ICAgNFxuICogICAgICAvLyAgICAgICAvIFxcICAgICAgICAgICAgICAvIFxcXG4gKiAgICAgIC8vICAgICAgLSAgIDMgICA9PT4gICAgIC0zICAgM1xuICogICAgICAvLyAgICAgLyBcXCAgICAgICAgICAgICAgLyBcXFxuICogICAgICAvLyAgICAtICAgMiAgICAgICAgICAgLTEgICAyXG4gKiAgICAgIC8vICAgLyBcXCAgICAgICAgICAgICAgLyBcXFxuICogICAgICAvLyAgMCAgIDEgICAgICAgICAgICAwICAgMVxuICpcbiAqIEBzeW1iIFIucmVkdWNlKGYsIGEsIFtiLCBjLCBkXSkgPSBmKGYoZihhLCBiKSwgYyksIGQpXG4gKi9cblxuXG52YXIgcmVkdWNlID1cbi8qI19fUFVSRV9fKi9cbl9jdXJyeTMoX3JlZHVjZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVkdWNlOyIsInZhciBfY2hlY2tGb3JNZXRob2QgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vaW50ZXJuYWwvX2NoZWNrRm9yTWV0aG9kXCIpO1xuXG52YXIgX2N1cnJ5MyA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9fY3VycnkzXCIpO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBlbGVtZW50cyBvZiB0aGUgZ2l2ZW4gbGlzdCBvciBzdHJpbmcgKG9yIG9iamVjdCB3aXRoIGEgYHNsaWNlYFxuICogbWV0aG9kKSBmcm9tIGBmcm9tSW5kZXhgIChpbmNsdXNpdmUpIHRvIGB0b0luZGV4YCAoZXhjbHVzaXZlKS5cbiAqXG4gKiBEaXNwYXRjaGVzIHRvIHRoZSBgc2xpY2VgIG1ldGhvZCBvZiB0aGUgdGhpcmQgYXJndW1lbnQsIGlmIHByZXNlbnQuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuMS40XG4gKiBAY2F0ZWdvcnkgTGlzdFxuICogQHNpZyBOdW1iZXIgLT4gTnVtYmVyIC0+IFthXSAtPiBbYV1cbiAqIEBzaWcgTnVtYmVyIC0+IE51bWJlciAtPiBTdHJpbmcgLT4gU3RyaW5nXG4gKiBAcGFyYW0ge051bWJlcn0gZnJvbUluZGV4IFRoZSBzdGFydCBpbmRleCAoaW5jbHVzaXZlKS5cbiAqIEBwYXJhbSB7TnVtYmVyfSB0b0luZGV4IFRoZSBlbmQgaW5kZXggKGV4Y2x1c2l2ZSkuXG4gKiBAcGFyYW0geyp9IGxpc3RcbiAqIEByZXR1cm4geyp9XG4gKiBAZXhhbXBsZVxuICpcbiAqICAgICAgUi5zbGljZSgxLCAzLCBbJ2EnLCAnYicsICdjJywgJ2QnXSk7ICAgICAgICAvLz0+IFsnYicsICdjJ11cbiAqICAgICAgUi5zbGljZSgxLCBJbmZpbml0eSwgWydhJywgJ2InLCAnYycsICdkJ10pOyAvLz0+IFsnYicsICdjJywgJ2QnXVxuICogICAgICBSLnNsaWNlKDAsIC0xLCBbJ2EnLCAnYicsICdjJywgJ2QnXSk7ICAgICAgIC8vPT4gWydhJywgJ2InLCAnYyddXG4gKiAgICAgIFIuc2xpY2UoLTMsIC0xLCBbJ2EnLCAnYicsICdjJywgJ2QnXSk7ICAgICAgLy89PiBbJ2InLCAnYyddXG4gKiAgICAgIFIuc2xpY2UoMCwgMywgJ3JhbWRhJyk7ICAgICAgICAgICAgICAgICAgICAgLy89PiAncmFtJ1xuICovXG5cblxudmFyIHNsaWNlID1cbi8qI19fUFVSRV9fKi9cbl9jdXJyeTMoXG4vKiNfX1BVUkVfXyovXG5fY2hlY2tGb3JNZXRob2QoJ3NsaWNlJywgZnVuY3Rpb24gc2xpY2UoZnJvbUluZGV4LCB0b0luZGV4LCBsaXN0KSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChsaXN0LCBmcm9tSW5kZXgsIHRvSW5kZXgpO1xufSkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNsaWNlOyIsInZhciBfY3VycnkyID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL19jdXJyeTJcIik7XG5cbnZhciBlcXVhbHMgPVxuLyojX19QVVJFX18qL1xucmVxdWlyZShcIi4vZXF1YWxzXCIpO1xuXG52YXIgdGFrZSA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi90YWtlXCIpO1xuLyoqXG4gKiBDaGVja3MgaWYgYSBsaXN0IHN0YXJ0cyB3aXRoIHRoZSBwcm92aWRlZCBzdWJsaXN0LlxuICpcbiAqIFNpbWlsYXJseSwgY2hlY2tzIGlmIGEgc3RyaW5nIHN0YXJ0cyB3aXRoIHRoZSBwcm92aWRlZCBzdWJzdHJpbmcuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuMjQuMFxuICogQGNhdGVnb3J5IExpc3RcbiAqIEBzaWcgW2FdIC0+IFthXSAtPiBCb29sZWFuXG4gKiBAc2lnIFN0cmluZyAtPiBTdHJpbmcgLT4gQm9vbGVhblxuICogQHBhcmFtIHsqfSBwcmVmaXhcbiAqIEBwYXJhbSB7Kn0gbGlzdFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBzZWUgUi5lbmRzV2l0aFxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIuc3RhcnRzV2l0aCgnYScsICdhYmMnKSAgICAgICAgICAgICAgICAvLz0+IHRydWVcbiAqICAgICAgUi5zdGFydHNXaXRoKCdiJywgJ2FiYycpICAgICAgICAgICAgICAgIC8vPT4gZmFsc2VcbiAqICAgICAgUi5zdGFydHNXaXRoKFsnYSddLCBbJ2EnLCAnYicsICdjJ10pICAgIC8vPT4gdHJ1ZVxuICogICAgICBSLnN0YXJ0c1dpdGgoWydiJ10sIFsnYScsICdiJywgJ2MnXSkgICAgLy89PiBmYWxzZVxuICovXG5cblxudmFyIHN0YXJ0c1dpdGggPVxuLyojX19QVVJFX18qL1xuX2N1cnJ5MihmdW5jdGlvbiAocHJlZml4LCBsaXN0KSB7XG4gIHJldHVybiBlcXVhbHModGFrZShwcmVmaXgubGVuZ3RoLCBsaXN0KSwgcHJlZml4KTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXJ0c1dpdGg7IiwidmFyIF9jaGVja0Zvck1ldGhvZCA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9fY2hlY2tGb3JNZXRob2RcIik7XG5cbnZhciBfY3VycnkxID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL19jdXJyeTFcIik7XG5cbnZhciBzbGljZSA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9zbGljZVwiKTtcbi8qKlxuICogUmV0dXJucyBhbGwgYnV0IHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBnaXZlbiBsaXN0IG9yIHN0cmluZyAob3Igb2JqZWN0XG4gKiB3aXRoIGEgYHRhaWxgIG1ldGhvZCkuXG4gKlxuICogRGlzcGF0Y2hlcyB0byB0aGUgYHNsaWNlYCBtZXRob2Qgb2YgdGhlIGZpcnN0IGFyZ3VtZW50LCBpZiBwcmVzZW50LlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjEuMFxuICogQGNhdGVnb3J5IExpc3RcbiAqIEBzaWcgW2FdIC0+IFthXVxuICogQHNpZyBTdHJpbmcgLT4gU3RyaW5nXG4gKiBAcGFyYW0geyp9IGxpc3RcbiAqIEByZXR1cm4geyp9XG4gKiBAc2VlIFIuaGVhZCwgUi5pbml0LCBSLmxhc3RcbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBSLnRhaWwoWzEsIDIsIDNdKTsgIC8vPT4gWzIsIDNdXG4gKiAgICAgIFIudGFpbChbMSwgMl0pOyAgICAgLy89PiBbMl1cbiAqICAgICAgUi50YWlsKFsxXSk7ICAgICAgICAvLz0+IFtdXG4gKiAgICAgIFIudGFpbChbXSk7ICAgICAgICAgLy89PiBbXVxuICpcbiAqICAgICAgUi50YWlsKCdhYmMnKTsgIC8vPT4gJ2JjJ1xuICogICAgICBSLnRhaWwoJ2FiJyk7ICAgLy89PiAnYidcbiAqICAgICAgUi50YWlsKCdhJyk7ICAgIC8vPT4gJydcbiAqICAgICAgUi50YWlsKCcnKTsgICAgIC8vPT4gJydcbiAqL1xuXG5cbnZhciB0YWlsID1cbi8qI19fUFVSRV9fKi9cbl9jdXJyeTEoXG4vKiNfX1BVUkVfXyovXG5fY2hlY2tGb3JNZXRob2QoJ3RhaWwnLFxuLyojX19QVVJFX18qL1xuc2xpY2UoMSwgSW5maW5pdHkpKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gdGFpbDsiLCJ2YXIgX2N1cnJ5MiA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9fY3VycnkyXCIpO1xuXG52YXIgX2Rpc3BhdGNoYWJsZSA9XG4vKiNfX1BVUkVfXyovXG5yZXF1aXJlKFwiLi9pbnRlcm5hbC9fZGlzcGF0Y2hhYmxlXCIpO1xuXG52YXIgX3h0YWtlID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL194dGFrZVwiKTtcblxudmFyIHNsaWNlID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL3NsaWNlXCIpO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCBgbmAgZWxlbWVudHMgb2YgdGhlIGdpdmVuIGxpc3QsIHN0cmluZywgb3JcbiAqIHRyYW5zZHVjZXIvdHJhbnNmb3JtZXIgKG9yIG9iamVjdCB3aXRoIGEgYHRha2VgIG1ldGhvZCkuXG4gKlxuICogRGlzcGF0Y2hlcyB0byB0aGUgYHRha2VgIG1ldGhvZCBvZiB0aGUgc2Vjb25kIGFyZ3VtZW50LCBpZiBwcmVzZW50LlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjEuMFxuICogQGNhdGVnb3J5IExpc3RcbiAqIEBzaWcgTnVtYmVyIC0+IFthXSAtPiBbYV1cbiAqIEBzaWcgTnVtYmVyIC0+IFN0cmluZyAtPiBTdHJpbmdcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcGFyYW0geyp9IGxpc3RcbiAqIEByZXR1cm4geyp9XG4gKiBAc2VlIFIuZHJvcFxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIudGFrZSgxLCBbJ2ZvbycsICdiYXInLCAnYmF6J10pOyAvLz0+IFsnZm9vJ11cbiAqICAgICAgUi50YWtlKDIsIFsnZm9vJywgJ2JhcicsICdiYXonXSk7IC8vPT4gWydmb28nLCAnYmFyJ11cbiAqICAgICAgUi50YWtlKDMsIFsnZm9vJywgJ2JhcicsICdiYXonXSk7IC8vPT4gWydmb28nLCAnYmFyJywgJ2JheiddXG4gKiAgICAgIFIudGFrZSg0LCBbJ2ZvbycsICdiYXInLCAnYmF6J10pOyAvLz0+IFsnZm9vJywgJ2JhcicsICdiYXonXVxuICogICAgICBSLnRha2UoMywgJ3JhbWRhJyk7ICAgICAgICAgICAgICAgLy89PiAncmFtJ1xuICpcbiAqICAgICAgY29uc3QgcGVyc29ubmVsID0gW1xuICogICAgICAgICdEYXZlIEJydWJlY2snLFxuICogICAgICAgICdQYXVsIERlc21vbmQnLFxuICogICAgICAgICdFdWdlbmUgV3JpZ2h0JyxcbiAqICAgICAgICAnSm9lIE1vcmVsbG8nLFxuICogICAgICAgICdHZXJyeSBNdWxsaWdhbicsXG4gKiAgICAgICAgJ0JvYiBCYXRlcycsXG4gKiAgICAgICAgJ0pvZSBEb2RnZScsXG4gKiAgICAgICAgJ1JvbiBDcm90dHknXG4gKiAgICAgIF07XG4gKlxuICogICAgICBjb25zdCB0YWtlRml2ZSA9IFIudGFrZSg1KTtcbiAqICAgICAgdGFrZUZpdmUocGVyc29ubmVsKTtcbiAqICAgICAgLy89PiBbJ0RhdmUgQnJ1YmVjaycsICdQYXVsIERlc21vbmQnLCAnRXVnZW5lIFdyaWdodCcsICdKb2UgTW9yZWxsbycsICdHZXJyeSBNdWxsaWdhbiddXG4gKiBAc3ltYiBSLnRha2UoLTEsIFthLCBiXSkgPSBbYSwgYl1cbiAqIEBzeW1iIFIudGFrZSgwLCBbYSwgYl0pID0gW11cbiAqIEBzeW1iIFIudGFrZSgxLCBbYSwgYl0pID0gW2FdXG4gKiBAc3ltYiBSLnRha2UoMiwgW2EsIGJdKSA9IFthLCBiXVxuICovXG5cblxudmFyIHRha2UgPVxuLyojX19QVVJFX18qL1xuX2N1cnJ5Mihcbi8qI19fUFVSRV9fKi9cbl9kaXNwYXRjaGFibGUoWyd0YWtlJ10sIF94dGFrZSwgZnVuY3Rpb24gdGFrZShuLCB4cykge1xuICByZXR1cm4gc2xpY2UoMCwgbiA8IDAgPyBJbmZpbml0eSA6IG4sIHhzKTtcbn0pKTtcblxubW9kdWxlLmV4cG9ydHMgPSB0YWtlOyIsInZhciBfY3VycnkxID1cbi8qI19fUFVSRV9fKi9cbnJlcXVpcmUoXCIuL2ludGVybmFsL19jdXJyeTFcIik7XG4vKipcbiAqIEdpdmVzIGEgc2luZ2xlLXdvcmQgc3RyaW5nIGRlc2NyaXB0aW9uIG9mIHRoZSAobmF0aXZlKSB0eXBlIG9mIGEgdmFsdWUsXG4gKiByZXR1cm5pbmcgc3VjaCBhbnN3ZXJzIGFzICdPYmplY3QnLCAnTnVtYmVyJywgJ0FycmF5Jywgb3IgJ051bGwnLiBEb2VzIG5vdFxuICogYXR0ZW1wdCB0byBkaXN0aW5ndWlzaCB1c2VyIE9iamVjdCB0eXBlcyBhbnkgZnVydGhlciwgcmVwb3J0aW5nIHRoZW0gYWxsIGFzXG4gKiAnT2JqZWN0Jy5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC44LjBcbiAqIEBjYXRlZ29yeSBUeXBlXG4gKiBAc2lnICgqIC0+IHsqfSkgLT4gU3RyaW5nXG4gKiBAcGFyYW0geyp9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIudHlwZSh7fSk7IC8vPT4gXCJPYmplY3RcIlxuICogICAgICBSLnR5cGUoMSk7IC8vPT4gXCJOdW1iZXJcIlxuICogICAgICBSLnR5cGUoZmFsc2UpOyAvLz0+IFwiQm9vbGVhblwiXG4gKiAgICAgIFIudHlwZSgncycpOyAvLz0+IFwiU3RyaW5nXCJcbiAqICAgICAgUi50eXBlKG51bGwpOyAvLz0+IFwiTnVsbFwiXG4gKiAgICAgIFIudHlwZShbXSk7IC8vPT4gXCJBcnJheVwiXG4gKiAgICAgIFIudHlwZSgvW0Etel0vKTsgLy89PiBcIlJlZ0V4cFwiXG4gKiAgICAgIFIudHlwZSgoKSA9PiB7fSk7IC8vPT4gXCJGdW5jdGlvblwiXG4gKiAgICAgIFIudHlwZSh1bmRlZmluZWQpOyAvLz0+IFwiVW5kZWZpbmVkXCJcbiAqL1xuXG5cbnZhciB0eXBlID1cbi8qI19fUFVSRV9fKi9cbl9jdXJyeTEoZnVuY3Rpb24gdHlwZSh2YWwpIHtcbiAgcmV0dXJuIHZhbCA9PT0gbnVsbCA/ICdOdWxsJyA6IHZhbCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKS5zbGljZSg4LCAtMSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSB0eXBlOyIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5HRU5FU0lTX1RZUEUgPSAxO1xuZXhwb3J0cy5QQVlNRU5UX1RZUEUgPSAyO1xuZXhwb3J0cy5JU1NVRV9UWVBFID0gMztcbmV4cG9ydHMuVFJBTlNGRVJfVFlQRSA9IDQ7XG5leHBvcnRzLlJFSVNTVUVfVFlQRSA9IDU7XG5leHBvcnRzLkJVUk5fVFlQRSA9IDY7XG5leHBvcnRzLkVYQ0hBTkdFX1RZUEUgPSA3O1xuZXhwb3J0cy5MRUFTRV9UWVBFID0gODtcbmV4cG9ydHMuQ0FOQ0VMX0xFQVNFX1RZUEUgPSA5O1xuZXhwb3J0cy5BTElBU19UWVBFID0gMTA7XG5leHBvcnRzLk1BU1NfVFJBTlNGRVJfVFlQRSA9IDExO1xuZXhwb3J0cy5EQVRBX1RZUEUgPSAxMjtcbmV4cG9ydHMuU0VUX1NDUklQVF9UWVBFID0gMTM7XG5leHBvcnRzLlNQT05TT1JTSElQX1RZUEUgPSAxNDtcbmV4cG9ydHMuU0VUX0FTU0VUX1NDUklQVF9UWVBFID0gMTU7XG5leHBvcnRzLklOVk9LRV9TQ1JJUFRfVFlQRSA9IDE2O1xuZXhwb3J0cy5VUERBVEVfQVNTRVRfSU5GT19UWVBFID0gMTc7XG5leHBvcnRzLklOVEVHRVJfREFUQV9UWVBFID0gJ2ludGVnZXInO1xuZXhwb3J0cy5CT09MRUFOX0RBVEFfVFlQRSA9ICdib29sZWFuJztcbmV4cG9ydHMuU1RSSU5HX0RBVEFfVFlQRSA9ICdzdHJpbmcnO1xuZXhwb3J0cy5CSU5BUllfREFUQV9UWVBFID0gJ2JpbmFyeSc7XG5leHBvcnRzLlRSQU5TQUNUSU9OX1RZUEUgPSB7XG4gICAgR0VORVNJUzogZXhwb3J0cy5HRU5FU0lTX1RZUEUsXG4gICAgUEFZTUVOVDogZXhwb3J0cy5QQVlNRU5UX1RZUEUsXG4gICAgSVNTVUU6IGV4cG9ydHMuSVNTVUVfVFlQRSxcbiAgICBUUkFOU0ZFUjogZXhwb3J0cy5UUkFOU0ZFUl9UWVBFLFxuICAgIFJFSVNTVUU6IGV4cG9ydHMuUkVJU1NVRV9UWVBFLFxuICAgIEJVUk46IGV4cG9ydHMuQlVSTl9UWVBFLFxuICAgIEVYQ0hBTkdFOiBleHBvcnRzLkVYQ0hBTkdFX1RZUEUsXG4gICAgTEVBU0U6IGV4cG9ydHMuTEVBU0VfVFlQRSxcbiAgICBDQU5DRUxfTEVBU0U6IGV4cG9ydHMuQ0FOQ0VMX0xFQVNFX1RZUEUsXG4gICAgQUxJQVM6IGV4cG9ydHMuQUxJQVNfVFlQRSxcbiAgICBNQVNTX1RSQU5TRkVSOiBleHBvcnRzLk1BU1NfVFJBTlNGRVJfVFlQRSxcbiAgICBEQVRBOiBleHBvcnRzLkRBVEFfVFlQRSxcbiAgICBTRVRfU0NSSVBUOiBleHBvcnRzLlNFVF9TQ1JJUFRfVFlQRSxcbiAgICBTUE9OU09SU0hJUDogZXhwb3J0cy5TUE9OU09SU0hJUF9UWVBFLFxuICAgIFNFVF9BU1NFVF9TQ1JJUFQ6IGV4cG9ydHMuU0VUX0FTU0VUX1NDUklQVF9UWVBFLFxuICAgIElOVk9LRV9TQ1JJUFQ6IGV4cG9ydHMuSU5WT0tFX1NDUklQVF9UWVBFLFxuICAgIFVQREFURV9BU1NFVF9JTkZPOiBleHBvcnRzLlVQREFURV9BU1NFVF9JTkZPX1RZUEUsXG59O1xuZXhwb3J0cy5EQVRBX0ZJRUxEX1RZUEUgPSB7XG4gICAgSU5URUdFUjogZXhwb3J0cy5JTlRFR0VSX0RBVEFfVFlQRSxcbiAgICBCT09MRUFOOiBleHBvcnRzLkJPT0xFQU5fREFUQV9UWVBFLFxuICAgIFNUUklORzogZXhwb3J0cy5TVFJJTkdfREFUQV9UWVBFLFxuICAgIEJJTkFSWTogZXhwb3J0cy5CSU5BUllfREFUQV9UWVBFLFxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIEFkYXB0ZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQWRhcHRlcigpIHtcbiAgICB9XG4gICAgcmV0dXJuIEFkYXB0ZXI7XG59KCkpO1xuZXhwb3J0cy5BZGFwdGVyID0gQWRhcHRlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX19hc3NpZ24gPSAodGhpcyAmJiB0aGlzLl9fYXNzaWduKSB8fCBmdW5jdGlvbiAoKSB7XG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKVxuICAgICAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH07XG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIEFkYXB0ZXJfMSA9IHJlcXVpcmUoXCIuL0FkYXB0ZXJcIik7XG52YXIgX18xID0gcmVxdWlyZShcIi4uXCIpO1xudmFyIFdpbmRvd1Byb3RvY29sXzEgPSByZXF1aXJlKFwiLi4vcHJvdG9jb2xzL1dpbmRvd1Byb3RvY29sXCIpO1xudmFyIHV0aWxzXzEgPSByZXF1aXJlKFwiLi4vdXRpbHMvdXRpbHNcIik7XG52YXIgRU1QVFlfT1BUSU9OUyA9IHsgb3JpZ2luczogW10sIGF2YWlsYWJsZUNoYW5lbElkOiBbXSB9O1xudmFyIFdpbmRvd0FkYXB0ZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFdpbmRvd0FkYXB0ZXIsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gV2luZG93QWRhcHRlcihsaXN0ZW4sIGRpc3BhdGNoLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmlkID0gX18xLnVuaXF1ZUlkKCd3YScpO1xuICAgICAgICBfdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICAgICAgX3RoaXMub3B0aW9ucyA9IFdpbmRvd0FkYXB0ZXIucHJlcGFyZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIF90aGlzLmxpc3RlbiA9IGxpc3RlbjtcbiAgICAgICAgX3RoaXMuZGlzcGF0Y2ggPSBkaXNwYXRjaDtcbiAgICAgICAgX3RoaXMubGlzdGVuLmZvckVhY2goZnVuY3Rpb24gKHByb3RvY29sKSB7IHJldHVybiBwcm90b2NvbC5vbignbWVzc2FnZScsIF90aGlzLm9uTWVzc2FnZSwgX3RoaXMpOyB9KTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBXaW5kb3dBZGFwdGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIChjYikge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNiKTtcbiAgICAgICAgX18xLmNvbnNvbGUuaW5mbygnV2luZG93QWRhcHRlcjogQWRkIGlmcmFtZSBtZXNzYWdlIGxpc3RlbmVyJyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgV2luZG93QWRhcHRlci5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciBtZXNzYWdlID0gX19hc3NpZ24oe30sIGRhdGEsIHsgY2hhbmVsSWQ6IHRoaXMub3B0aW9ucy5jaGFuZWxJZCB9KTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaC5mb3JFYWNoKGZ1bmN0aW9uIChwcm90b2NvbCkgeyByZXR1cm4gcHJvdG9jb2wuZGlzcGF0Y2gobWVzc2FnZSk7IH0pO1xuICAgICAgICBfXzEuY29uc29sZS5pbmZvKCdXaW5kb3dBZGFwdGVyOiBTZW5kIG1lc3NhZ2UnLCBtZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBXaW5kb3dBZGFwdGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxpc3Rlbi5mb3JFYWNoKGZ1bmN0aW9uIChwcm90b2NvbCkgeyByZXR1cm4gcHJvdG9jb2wuZGVzdHJveSgpOyB9KTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaC5mb3JFYWNoKGZ1bmN0aW9uIChwcm90b2NvbCkgeyByZXR1cm4gcHJvdG9jb2wuZGVzdHJveSgpOyB9KTtcbiAgICAgICAgX18xLmNvbnNvbGUuaW5mbygnV2luZG93QWRhcHRlcjogRGVzdHJveScpO1xuICAgIH07XG4gICAgV2luZG93QWRhcHRlci5wcm90b3R5cGUub25NZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmFjY2Vzc0V2ZW50KGV2ZW50KSkge1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MuZm9yRWFjaChmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjYihldmVudC5kYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgX18xLmNvbnNvbGUud2FybignV2luZG93QWRhcHRlcjogVW5oYW5kbGVkIGV4Y2VwdGlvbiEnLCBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgV2luZG93QWRhcHRlci5wcm90b3R5cGUuYWNjZXNzRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBldmVudC5kYXRhICE9PSAnb2JqZWN0JyB8fCBldmVudC5kYXRhLnR5cGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgX18xLmNvbnNvbGUuaW5mbygnV2luZG93QWRhcHRlcjogQmxvY2sgZXZlbnQuIFdyb25nIGV2ZW50IGZvcm1hdCEnLCBldmVudC5kYXRhKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5vcmlnaW5zLmhhcygnKicpICYmICF0aGlzLm9wdGlvbnMub3JpZ2lucy5oYXMoZXZlbnQub3JpZ2luKSkge1xuICAgICAgICAgICAgX18xLmNvbnNvbGUuaW5mbyhcIlNpbXBsZVdpbmRvd0FkYXB0ZXI6IEJsb2NrIGV2ZW50IGJ5IG9yaWdpbiBcXFwiXCIgKyBldmVudC5vcmlnaW4gKyBcIlxcXCJcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuYXZhaWxhYmxlQ2hhbmVsSWQuc2l6ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFjY2VzcyA9ICEhKGV2ZW50LmRhdGEuY2hhbmVsSWQgJiYgdGhpcy5vcHRpb25zLmF2YWlsYWJsZUNoYW5lbElkLmhhcyhldmVudC5kYXRhLmNoYW5lbElkKSk7XG4gICAgICAgIGlmICghYWNjZXNzKSB7XG4gICAgICAgICAgICBfXzEuY29uc29sZS5pbmZvKFwiU2ltcGxlV2luZG93QWRhcHRlcjogQmxvY2sgZXZlbnQgYnkgY2hhbmVsIGlkIFxcXCJcIiArIGV2ZW50LmRhdGEuY2hhbmVsSWQgKyBcIlxcXCJcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjY2VzcztcbiAgICB9O1xuICAgIFdpbmRvd0FkYXB0ZXIuY3JlYXRlU2ltcGxlV2luZG93QWRhcHRlciA9IGZ1bmN0aW9uIChpZnJhbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIG9yaWdpbiA9IHRoaXMuZ2V0Q29udGVudE9yaWdpbihpZnJhbWUpO1xuICAgICAgICB2YXIgbXlPcHRpb25zID0gdGhpcy5wcmVwYXJlT3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgdmFyIGV2ZW50cyA9IFtdO1xuICAgICAgICBpZiAob3JpZ2luKSB7XG4gICAgICAgICAgICBteU9wdGlvbnMub3JpZ2lucy5hZGQob3JpZ2luKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbGlzdGVuID0gbmV3IFdpbmRvd1Byb3RvY29sXzEuV2luZG93UHJvdG9jb2wod2luZG93LCBXaW5kb3dQcm90b2NvbF8xLldpbmRvd1Byb3RvY29sLlBST1RPQ09MX1RZUEVTLkxJU1RFTik7XG4gICAgICAgIHZhciBoYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG4gICAgICAgIH07XG4gICAgICAgIGxpc3Rlbi5vbignbWVzc2FnZScsIGhhbmRsZXIpO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRJZnJhbWVDb250ZW50KGlmcmFtZSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3aW4pIHtcbiAgICAgICAgICAgIHZhciBkaXNwYXRjaCA9IG5ldyBXaW5kb3dQcm90b2NvbF8xLldpbmRvd1Byb3RvY29sKHdpbi53aW4sIFdpbmRvd1Byb3RvY29sXzEuV2luZG93UHJvdG9jb2wuUFJPVE9DT0xfVFlQRVMuRElTUEFUQ0gpO1xuICAgICAgICAgICAgdmFyIGFkYXB0ZXIgPSBuZXcgV2luZG93QWRhcHRlcihbbGlzdGVuXSwgW2Rpc3BhdGNoXSwgX3RoaXMudW5QcmVwYXJlT3B0aW9ucyhteU9wdGlvbnMpKTtcbiAgICAgICAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIGFkYXB0ZXIub25NZXNzYWdlKGV2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGlzdGVuLm9mZignbWVzc2FnZScsIGhhbmRsZXIpO1xuICAgICAgICAgICAgcmV0dXJuIGFkYXB0ZXI7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgV2luZG93QWRhcHRlci5wcmVwYXJlT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IEVNUFRZX09QVElPTlM7IH1cbiAgICAgICAgdmFyIGNvbmNhdCA9IGZ1bmN0aW9uIChpbml0aWFsVmFsdWUpIHsgcmV0dXJuIGZ1bmN0aW9uIChsaXN0KSB7IHJldHVybiBsaXN0LnJlZHVjZShmdW5jdGlvbiAoc2V0LCBpdGVtKSB7IHJldHVybiBzZXQuYWRkKGl0ZW0pOyB9LCBpbml0aWFsVmFsdWUpOyB9OyB9O1xuICAgICAgICB2YXIgZ2V0Q29sbGVjdGlvbiA9IGZ1bmN0aW9uIChkYXRhLCBpbml0aWFsKSB7IHJldHVybiB1dGlsc18xLnBpcGUoX18xLnRvQXJyYXksIGNvbmNhdChpbml0aWFsKSkoZGF0YSk7IH07XG4gICAgICAgIHZhciBvcmlnaW5zID0gZ2V0Q29sbGVjdGlvbihvcHRpb25zLm9yaWdpbnMgfHwgW10sIG5ldyBfXzEuVW5pcVByaW1pdGl2ZUNvbGxlY3Rpb24oW3dpbmRvdy5sb2NhdGlvbi5vcmlnaW5dKSk7XG4gICAgICAgIHZhciBjaGFuZWxJZCA9IGdldENvbGxlY3Rpb24ob3B0aW9ucy5hdmFpbGFibGVDaGFuZWxJZCB8fCBbXSwgbmV3IF9fMS5VbmlxUHJpbWl0aXZlQ29sbGVjdGlvbigpKTtcbiAgICAgICAgcmV0dXJuIF9fYXNzaWduKHt9LCBvcHRpb25zLCB7IG9yaWdpbnM6IG9yaWdpbnMsIGF2YWlsYWJsZUNoYW5lbElkOiBjaGFuZWxJZCB9KTtcbiAgICB9O1xuICAgIFdpbmRvd0FkYXB0ZXIudW5QcmVwYXJlT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBvcmlnaW5zOiBvcHRpb25zLm9yaWdpbnMudG9BcnJheSgpLFxuICAgICAgICAgICAgYXZhaWxhYmxlQ2hhbmVsSWQ6IG9wdGlvbnMuYXZhaWxhYmxlQ2hhbmVsSWQudG9BcnJheSgpLFxuICAgICAgICAgICAgY2hhbmVsSWQ6IG9wdGlvbnMuY2hhbmVsSWRcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFdpbmRvd0FkYXB0ZXIuZ2V0SWZyYW1lQ29udGVudCA9IGZ1bmN0aW9uIChjb250ZW50KSB7XG4gICAgICAgIGlmICghY29udGVudCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IHdpbjogd2luZG93Lm9wZW5lciB8fCB3aW5kb3cucGFyZW50IH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKGNvbnRlbnQgaW5zdGFuY2VvZiBIVE1MSUZyYW1lRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyB3aW46IGNvbnRlbnQgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbnRlbnQuY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7IHdpbjogY29udGVudC5jb250ZW50V2luZG93IH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBjb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7IHJldHVybiByZXNvbHZlKHsgd2luOiBjb250ZW50LmNvbnRlbnRXaW5kb3cgfSk7IH0sIGZhbHNlKTtcbiAgICAgICAgICAgIGNvbnRlbnQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCByZWplY3QsIGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBXaW5kb3dBZGFwdGVyLmdldENvbnRlbnRPcmlnaW4gPSBmdW5jdGlvbiAoY29udGVudCkge1xuICAgICAgICBpZiAoIWNvbnRlbnQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVUkwoZG9jdW1lbnQucmVmZXJyZXIpLm9yaWdpbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoY29udGVudCBpbnN0YW5jZW9mIEhUTUxJRnJhbWVFbGVtZW50KSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LnRvcC5vcmlnaW47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFVSTChjb250ZW50LnNyYykub3JpZ2luIHx8IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gV2luZG93QWRhcHRlcjtcbn0oQWRhcHRlcl8xLkFkYXB0ZXIpKTtcbmV4cG9ydHMuV2luZG93QWRhcHRlciA9IFdpbmRvd0FkYXB0ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciB1dGlsc18xID0gcmVxdWlyZShcIi4uL3V0aWxzXCIpO1xudmFyIEV2ZW50VHlwZTtcbihmdW5jdGlvbiAoRXZlbnRUeXBlKSB7XG4gICAgRXZlbnRUeXBlW0V2ZW50VHlwZVtcIkV2ZW50XCJdID0gMF0gPSBcIkV2ZW50XCI7XG4gICAgRXZlbnRUeXBlW0V2ZW50VHlwZVtcIkFjdGlvblwiXSA9IDFdID0gXCJBY3Rpb25cIjtcbiAgICBFdmVudFR5cGVbRXZlbnRUeXBlW1wiUmVzcG9uc2VcIl0gPSAyXSA9IFwiUmVzcG9uc2VcIjtcbn0pKEV2ZW50VHlwZSA9IGV4cG9ydHMuRXZlbnRUeXBlIHx8IChleHBvcnRzLkV2ZW50VHlwZSA9IHt9KSk7XG52YXIgUmVzcG9uc2VTdGF0dXM7XG4oZnVuY3Rpb24gKFJlc3BvbnNlU3RhdHVzKSB7XG4gICAgUmVzcG9uc2VTdGF0dXNbUmVzcG9uc2VTdGF0dXNbXCJTdWNjZXNzXCJdID0gMF0gPSBcIlN1Y2Nlc3NcIjtcbiAgICBSZXNwb25zZVN0YXR1c1tSZXNwb25zZVN0YXR1c1tcIkVycm9yXCJdID0gMV0gPSBcIkVycm9yXCI7XG59KShSZXNwb25zZVN0YXR1cyA9IGV4cG9ydHMuUmVzcG9uc2VTdGF0dXMgfHwgKGV4cG9ydHMuUmVzcG9uc2VTdGF0dXMgPSB7fSkpO1xudmFyIEJ1cyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBCdXMoYWRhcHRlciwgZGVmYXVsdFRpbWVvdXQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5pZCA9IHV0aWxzXzEudW5pcXVlSWQoJ2J1cycpO1xuICAgICAgICB0aGlzLl90aW1lb3V0ID0gZGVmYXVsdFRpbWVvdXQgfHwgNTAwMDtcbiAgICAgICAgdGhpcy5fYWRhcHRlciA9IGFkYXB0ZXI7XG4gICAgICAgIHRoaXMuX2FkYXB0ZXIuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKGRhdGEpIHsgcmV0dXJuIF90aGlzLl9vbk1lc3NhZ2UoZGF0YSk7IH0pO1xuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXJzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlUmVxdWVzdEhhc2ggPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9yZXF1ZXN0SGFuZGxlcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB1dGlsc18xLmNvbnNvbGUuaW5mbyhcIkNyZWF0ZSBCdXMgd2l0aCBpZCBcXFwiXCIgKyB0aGlzLmlkICsgXCJcXFwiXCIpO1xuICAgIH1cbiAgICBCdXMucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbiAobmFtZSwgZGF0YSkge1xuICAgICAgICB0aGlzLl9hZGFwdGVyLnNlbmQoQnVzLl9jcmVhdGVFdmVudChuYW1lLCBkYXRhKSk7XG4gICAgICAgIHV0aWxzXzEuY29uc29sZS5pbmZvKFwiRGlzcGF0Y2ggZXZlbnQgXFxcIlwiICsgbmFtZSArIFwiXFxcIlwiLCBkYXRhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBCdXMucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiAobmFtZSwgZGF0YSwgdGltZW91dCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIGlkID0gdXRpbHNfMS51bmlxdWVJZChfdGhpcy5pZCArIFwiLWFjdGlvblwiKTtcbiAgICAgICAgICAgIHZhciB3YWl0ID0gdGltZW91dCB8fCBfdGhpcy5fdGltZW91dDtcbiAgICAgICAgICAgIHZhciB0aW1lcjtcbiAgICAgICAgICAgIGlmICgodGltZW91dCB8fCBfdGhpcy5fdGltZW91dCkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIF90aGlzLl9hY3RpdmVSZXF1ZXN0SGFzaFtpZF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcihcIlRpbWVvdXQgZXJyb3IgZm9yIHJlcXVlc3Qgd2l0aCBuYW1lIFxcXCJcIiArIG5hbWUgKyBcIlxcXCIgYW5kIHRpbWVvdXQgXCIgKyB3YWl0ICsgXCIhXCIpO1xuICAgICAgICAgICAgICAgICAgICB1dGlsc18xLmNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0sIHdhaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGNhbmNlbFRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIF90aGlzLl9hY3RpdmVSZXF1ZXN0SGFzaFtpZF0gPSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0OiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsVGltZW91dCgpO1xuICAgICAgICAgICAgICAgICAgICB1dGlsc18xLmNvbnNvbGUuZXJyb3IoXCJFcnJvciByZXF1ZXN0IHdpdGggbmFtZSBcXFwiXCIgKyBuYW1lICsgXCJcXFwiXCIsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlc29sdmU6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbFRpbWVvdXQoKTtcbiAgICAgICAgICAgICAgICAgICAgdXRpbHNfMS5jb25zb2xlLmluZm8oXCJSZXF1ZXN0IHdpdGggbmFtZSBcXFwiXCIgKyBuYW1lICsgXCJcXFwiIHN1Y2Nlc3MgcmVzb2x2ZWQhXCIsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy5fYWRhcHRlci5zZW5kKHsgaWQ6IGlkLCB0eXBlOiAxIC8qIEFjdGlvbiAqLywgbmFtZTogbmFtZSwgZGF0YTogZGF0YSB9KTtcbiAgICAgICAgICAgIHV0aWxzXzEuY29uc29sZS5pbmZvKFwiUmVxdWVzdCB3aXRoIG5hbWUgXFxcIlwiICsgbmFtZSArIFwiXFxcIlwiLCBkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBCdXMucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKG5hbWUsIGhhbmRsZXIsIGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZEV2ZW50SGFuZGxlcihuYW1lLCBoYW5kbGVyLCBjb250ZXh0LCBmYWxzZSk7XG4gICAgfTtcbiAgICBCdXMucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiAobmFtZSwgaGFuZGxlciwgY29udGV4dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkRXZlbnRIYW5kbGVyKG5hbWUsIGhhbmRsZXIsIGNvbnRleHQsIHRydWUpO1xuICAgIH07XG4gICAgQnVzLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAobmFtZSwgaGFuZGxlcikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuX2V2ZW50SGFuZGxlcnMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIF90aGlzLm9mZihuYW1lLCBoYW5kbGVyKTsgfSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50SGFuZGxlcnNbbmFtZV0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tuYW1lXS5zbGljZSgpLmZvckVhY2goZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5vZmYobmFtZSwgaW5mby5oYW5kbGVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tuYW1lXSA9IHRoaXMuX2V2ZW50SGFuZGxlcnNbbmFtZV0uZmlsdGVyKGZ1bmN0aW9uIChpbmZvKSB7IHJldHVybiBpbmZvLmhhbmRsZXIgIT09IGhhbmRsZXI7IH0pO1xuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50SGFuZGxlcnNbbmFtZV0ubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRIYW5kbGVyc1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIEJ1cy5wcm90b3R5cGUucmVnaXN0ZXJSZXF1ZXN0SGFuZGxlciA9IGZ1bmN0aW9uIChuYW1lLCBoYW5kbGVyKSB7XG4gICAgICAgIGlmICh0aGlzLl9yZXF1ZXN0SGFuZGxlcnNbbmFtZV0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRHVwbGljYXRlIHJlcXVlc3QgaGFuZGxlciEnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZXF1ZXN0SGFuZGxlcnNbbmFtZV0gPSBoYW5kbGVyO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIEJ1cy5wcm90b3R5cGUudW5yZWdpc3RlckhhbmRsZXIgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICBpZiAodGhpcy5fcmVxdWVzdEhhbmRsZXJzW25hbWVdKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fcmVxdWVzdEhhbmRsZXJzW25hbWVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgQnVzLnByb3RvdHlwZS5jaGFuZ2VBZGFwdGVyID0gZnVuY3Rpb24gKGFkYXB0ZXIpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIGJ1cyA9IG5ldyBCdXMoYWRhcHRlciwgdGhpcy5fdGltZW91dCk7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuX2V2ZW50SGFuZGxlcnMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIF90aGlzLl9ldmVudEhhbmRsZXJzW25hbWVdLmZvckVhY2goZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5mby5vbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1cy5vbmNlKG5hbWUsIGluZm8uaGFuZGxlciwgaW5mby5jb250ZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1cy5vbihuYW1lLCBpbmZvLmhhbmRsZXIsIGluZm8uY29udGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLl9yZXF1ZXN0SGFuZGxlcnMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIGJ1cy5yZWdpc3RlclJlcXVlc3RIYW5kbGVyKG5hbWUsIF90aGlzLl9yZXF1ZXN0SGFuZGxlcnNbbmFtZV0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJ1cztcbiAgICB9O1xuICAgIEJ1cy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdXRpbHNfMS5jb25zb2xlLmluZm8oJ0Rlc3Ryb3kgQnVzJyk7XG4gICAgICAgIHRoaXMub2ZmKCk7XG4gICAgICAgIHRoaXMuX2FkYXB0ZXIuZGVzdHJveSgpO1xuICAgIH07XG4gICAgQnVzLnByb3RvdHlwZS5fYWRkRXZlbnRIYW5kbGVyID0gZnVuY3Rpb24gKG5hbWUsIGhhbmRsZXIsIGNvbnRleHQsIG9uY2UpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9ldmVudEhhbmRsZXJzW25hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXJzW25hbWVdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tuYW1lXS5wdXNoKHsgaGFuZGxlcjogaGFuZGxlciwgb25jZTogb25jZSwgY29udGV4dDogY29udGV4dCB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBCdXMucHJvdG90eXBlLl9vbk1lc3NhZ2UgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAwIC8qIEV2ZW50ICovOlxuICAgICAgICAgICAgICAgIHV0aWxzXzEuY29uc29sZS5pbmZvKFwiSGFzIGV2ZW50IHdpdGggbmFtZSBcXFwiXCIgKyBTdHJpbmcobWVzc2FnZS5uYW1lKSArIFwiXFxcIlwiLCBtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZpcmVFdmVudChTdHJpbmcobWVzc2FnZS5uYW1lKSwgbWVzc2FnZS5kYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMSAvKiBBY3Rpb24gKi86XG4gICAgICAgICAgICAgICAgdXRpbHNfMS5jb25zb2xlLmluZm8oXCJTdGFydCBhY3Rpb24gd2l0aCBpZCBcXFwiXCIgKyBtZXNzYWdlLmlkICsgXCJcXFwiIGFuZCBuYW1lIFxcXCJcIiArIFN0cmluZyhtZXNzYWdlLm5hbWUpICsgXCJcXFwiXCIsIG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlUmVzcG9uc2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDIgLyogUmVzcG9uc2UgKi86XG4gICAgICAgICAgICAgICAgdXRpbHNfMS5jb25zb2xlLmluZm8oXCJTdGFydCByZXNwb25zZSB3aXRoIG5hbWUgXFxcIlwiICsgbWVzc2FnZS5pZCArIFwiXFxcIiBhbmQgc3RhdHVzIFxcXCJcIiArIG1lc3NhZ2Uuc3RhdHVzICsgXCJcXFwiXCIsIG1lc3NhZ2UuY29udGVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmlyZUVuZEFjdGlvbihtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG4gICAgQnVzLnByb3RvdHlwZS5fY3JlYXRlUmVzcG9uc2UgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgc2VuZEVycm9yID0gZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICB1dGlsc18xLmNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgX3RoaXMuX2FkYXB0ZXIuc2VuZCh7XG4gICAgICAgICAgICAgICAgaWQ6IG1lc3NhZ2UuaWQsXG4gICAgICAgICAgICAgICAgdHlwZTogMiAvKiBSZXNwb25zZSAqLyxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IDEgLyogRXJyb3IgKi8sXG4gICAgICAgICAgICAgICAgY29udGVudDogU3RyaW5nKGVycm9yKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmICghdGhpcy5fcmVxdWVzdEhhbmRsZXJzW1N0cmluZyhtZXNzYWdlLm5hbWUpXSkge1xuICAgICAgICAgICAgc2VuZEVycm9yKG5ldyBFcnJvcihcIkhhcyBubyBoYW5kbGVyIGZvciBcXFwiXCIgKyBTdHJpbmcobWVzc2FnZS5uYW1lKSArIFwiXFxcIiBhY3Rpb24hXCIpKTtcbiAgICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9yZXF1ZXN0SGFuZGxlcnNbU3RyaW5nKG1lc3NhZ2UubmFtZSldKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgICAgICBpZiAoQnVzLl9pc1Byb21pc2UocmVzdWx0KSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLl9hZGFwdGVyLnNlbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IG1lc3NhZ2UuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAyIC8qIFJlc3BvbnNlICovLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAwIC8qIFN1Y2Nlc3MgKi8sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBkYXRhXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIHNlbmRFcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGFwdGVyLnNlbmQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogbWVzc2FnZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogMiAvKiBSZXNwb25zZSAqLyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAwIC8qIFN1Y2Nlc3MgKi8sXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHJlc3VsdFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBzZW5kRXJyb3IoZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEJ1cy5wcm90b3R5cGUuX2ZpcmVFbmRBY3Rpb24gPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICBpZiAodGhpcy5fYWN0aXZlUmVxdWVzdEhhc2hbbWVzc2FnZS5pZF0pIHtcbiAgICAgICAgICAgIHN3aXRjaCAobWVzc2FnZS5zdGF0dXMpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDEgLyogRXJyb3IgKi86XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FjdGl2ZVJlcXVlc3RIYXNoW21lc3NhZ2UuaWRdLnJlamVjdChtZXNzYWdlLmNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDAgLyogU3VjY2VzcyAqLzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWN0aXZlUmVxdWVzdEhhc2hbbWVzc2FnZS5pZF0ucmVzb2x2ZShtZXNzYWdlLmNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9hY3RpdmVSZXF1ZXN0SGFzaFttZXNzYWdlLmlkXTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQnVzLnByb3RvdHlwZS5fZmlyZUV2ZW50ID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVyc1tuYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXJzW25hbWVdID0gdGhpcy5fZXZlbnRIYW5kbGVyc1tuYW1lXVxuICAgICAgICAgICAgLnNsaWNlKClcbiAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKGhhbmRsZXJJbmZvKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXJJbmZvLmhhbmRsZXIuY2FsbChoYW5kbGVySW5mby5jb250ZXh0LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHV0aWxzXzEuY29uc29sZS53YXJuKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICFoYW5kbGVySW5mby5vbmNlO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCF0aGlzLl9ldmVudEhhbmRsZXJzW25hbWVdLmxlbmd0aCkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50SGFuZGxlcnNbbmFtZV07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEJ1cy5fY3JlYXRlRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiAwIC8qIEV2ZW50ICovLFxuICAgICAgICAgICAgbmFtZTogZXZlbnROYW1lLFxuICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICB9O1xuICAgIH07XG4gICAgQnVzLl9pc1Byb21pc2UgPSBmdW5jdGlvbiAoc29tZSkge1xuICAgICAgICByZXR1cm4gc29tZSAmJiBzb21lLnRoZW4gJiYgdHlwZW9mIHNvbWUudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9O1xuICAgIHJldHVybiBCdXM7XG59KCkpO1xuZXhwb3J0cy5CdXMgPSBCdXM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBjb25maWc7XG4oZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIHZhciBjb25zb2xlO1xuICAgIChmdW5jdGlvbiAoY29uc29sZSkge1xuICAgICAgICBjb25zb2xlLkxPR19MRVZFTCA9IHtcbiAgICAgICAgICAgIFBST0RVQ1RJT046IDAsXG4gICAgICAgICAgICBFUlJPUlM6IDEsXG4gICAgICAgICAgICBWRVJCT1NFOiAyXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nTGV2ZWwgPSBjb25zb2xlLkxPR19MRVZFTC5QUk9EVUNUSU9OO1xuICAgICAgICBjb25zb2xlLm1ldGhvZHNEYXRhID0ge1xuICAgICAgICAgICAgbG9nOiB7IHNhdmU6IGZhbHNlLCBsb2dMZXZlbDogY29uc29sZS5MT0dfTEVWRUwuVkVSQk9TRSB9LFxuICAgICAgICAgICAgaW5mbzogeyBzYXZlOiBmYWxzZSwgbG9nTGV2ZWw6IGNvbnNvbGUuTE9HX0xFVkVMLlZFUkJPU0UgfSxcbiAgICAgICAgICAgIHdhcm46IHsgc2F2ZTogZmFsc2UsIGxvZ0xldmVsOiBjb25zb2xlLkxPR19MRVZFTC5WRVJCT1NFIH0sXG4gICAgICAgICAgICBlcnJvcjogeyBzYXZlOiB0cnVlLCBsb2dMZXZlbDogY29uc29sZS5MT0dfTEVWRUwuRVJST1JTIH1cbiAgICAgICAgfTtcbiAgICB9KShjb25zb2xlID0gY29uZmlnLmNvbnNvbGUgfHwgKGNvbmZpZy5jb25zb2xlID0ge30pKTtcbn0pKGNvbmZpZyA9IGV4cG9ydHMuY29uZmlnIHx8IChleHBvcnRzLmNvbmZpZyA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmZ1bmN0aW9uIF9fZXhwb3J0KG0pIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XG59XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9idXMvQnVzXCIpKTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2FkYXB0ZXJzL0FkYXB0ZXJcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vYWRhcHRlcnMvV2luZG93QWRhcHRlclwiKSk7XG5fX2V4cG9ydChyZXF1aXJlKFwiLi9wcm90b2NvbHMvV2luZG93UHJvdG9jb2xcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vY29uZmlnXCIpKTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3V0aWxzXCIpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdHlwZWRfdHNfZXZlbnRzXzEgPSByZXF1aXJlKFwidHlwZWQtdHMtZXZlbnRzXCIpO1xudmFyIFdpbmRvd1Byb3RvY29sID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhXaW5kb3dQcm90b2NvbCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBXaW5kb3dQcm90b2NvbCh3aW4sIHR5cGUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcbiAgICAgICAgX3RoaXMud2luID0gd2luO1xuICAgICAgICBfdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgX3RoaXMuaGFuZGxlciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgX3RoaXMudHJpZ2dlcignbWVzc2FnZScsIGV2ZW50KTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGUgPT09IFdpbmRvd1Byb3RvY29sLlBST1RPQ09MX1RZUEVTLkxJU1RFTikge1xuICAgICAgICAgICAgX3RoaXMud2luLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBfdGhpcy5oYW5kbGVyLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBXaW5kb3dQcm90b2NvbC5wcm90b3R5cGUuZGlzcGF0Y2ggPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICB0aGlzLndpbi5wb3N0TWVzc2FnZShkYXRhLCAnKicpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFdpbmRvd1Byb3RvY29sLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSBXaW5kb3dQcm90b2NvbC5QUk9UT0NPTF9UWVBFUy5MSVNURU4pIHtcbiAgICAgICAgICAgIHRoaXMud2luLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLmhhbmRsZXIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndpbiA9IFdpbmRvd1Byb3RvY29sLl9mYWtlV2luO1xuICAgIH07XG4gICAgV2luZG93UHJvdG9jb2wuX2Zha2VXaW4gPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZW1wdHkgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBudWxsOyB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcG9zdE1lc3NhZ2U6IGVtcHR5LFxuICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcjogZW1wdHksXG4gICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyOiBlbXB0eVxuICAgICAgICB9O1xuICAgIH0pKCk7XG4gICAgcmV0dXJuIFdpbmRvd1Byb3RvY29sO1xufSh0eXBlZF90c19ldmVudHNfMS5FdmVudEVtaXR0ZXIpKTtcbmV4cG9ydHMuV2luZG93UHJvdG9jb2wgPSBXaW5kb3dQcm90b2NvbDtcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4oZnVuY3Rpb24gKFdpbmRvd1Byb3RvY29sKSB7XG4gICAgV2luZG93UHJvdG9jb2wuUFJPVE9DT0xfVFlQRVMgPSB7XG4gICAgICAgIExJU1RFTjogJ2xpc3RlbicsXG4gICAgICAgIERJU1BBVENIOiAnZGlzcGF0Y2gnXG4gICAgfTtcbn0pKFdpbmRvd1Byb3RvY29sID0gZXhwb3J0cy5XaW5kb3dQcm90b2NvbCB8fCAoZXhwb3J0cy5XaW5kb3dQcm90b2NvbCA9IHt9KSk7XG5leHBvcnRzLldpbmRvd1Byb3RvY29sID0gV2luZG93UHJvdG9jb2w7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBVbmlxUHJpbWl0aXZlQ29sbGVjdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBVbmlxUHJpbWl0aXZlQ29sbGVjdGlvbihsaXN0KSB7XG4gICAgICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgICAgIHRoaXMuaGFzaCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIGlmIChsaXN0KSB7XG4gICAgICAgICAgICBsaXN0LmZvckVhY2godGhpcy5hZGQsIHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFVuaXFQcmltaXRpdmVDb2xsZWN0aW9uLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICB0aGlzLmhhc2hbaXRlbV0gPSB0cnVlO1xuICAgICAgICB0aGlzLnNpemUgPSBPYmplY3Qua2V5cyh0aGlzLmhhc2gpLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBVbmlxUHJpbWl0aXZlQ29sbGVjdGlvbi5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4ga2V5IGluIHRoaXMuaGFzaDtcbiAgICB9O1xuICAgIFVuaXFQcmltaXRpdmVDb2xsZWN0aW9uLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5oYXNoKTtcbiAgICB9O1xuICAgIHJldHVybiBVbmlxUHJpbWl0aXZlQ29sbGVjdGlvbjtcbn0oKSk7XG5leHBvcnRzLlVuaXFQcmltaXRpdmVDb2xsZWN0aW9uID0gVW5pcVByaW1pdGl2ZUNvbGxlY3Rpb247XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgY29uZmlnXzEgPSByZXF1aXJlKFwiLi4vLi4vY29uZmlnXCIpO1xudmFyIHV0aWxzXzEgPSByZXF1aXJlKFwiLi4vdXRpbHNcIik7XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xudmFyIGNvbnNvbGVNb2R1bGUgPSAoZnVuY3Rpb24gKHJvb3QpIHtcbiAgICByZXR1cm4gcm9vdC5jb25zb2xlO1xufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IGdsb2JhbCk7XG52YXIgc3RvcmFnZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5mdW5jdGlvbiBhZGROYW1lc3BhY2UodHlwZSkge1xuICAgIGlmICghc3RvcmFnZVt0eXBlXSkge1xuICAgICAgICBzdG9yYWdlW3R5cGVdID0gW107XG4gICAgfVxufVxuZnVuY3Rpb24gc2F2ZUV2ZW50KHR5cGUsIGFyZ3MpIHtcbiAgICBzdG9yYWdlW3R5cGVdLnB1c2goYXJncyk7XG59XG5mdW5jdGlvbiBnZW5lcmF0ZUNvbnNvbGUoKSB7XG4gICAgcmV0dXJuIHV0aWxzXzEua2V5cyhjb25maWdfMS5jb25maWcuY29uc29sZS5tZXRob2RzRGF0YSkucmVkdWNlKGZ1bmN0aW9uIChhcGksIG1ldGhvZCkge1xuICAgICAgICBhcGlbbWV0aG9kXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb25maWdfMS5jb25maWcuY29uc29sZS5sb2dMZXZlbCA8IGNvbmZpZ18xLmNvbmZpZy5jb25zb2xlLm1ldGhvZHNEYXRhW21ldGhvZF0ubG9nTGV2ZWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlnXzEuY29uZmlnLmNvbnNvbGUubWV0aG9kc0RhdGFbbWV0aG9kXS5zYXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZE5hbWVzcGFjZShtZXRob2QpO1xuICAgICAgICAgICAgICAgICAgICBzYXZlRXZlbnQobWV0aG9kLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlTW9kdWxlW21ldGhvZF0uYXBwbHkoY29uc29sZU1vZHVsZSwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBhcGk7XG4gICAgfSwgT2JqZWN0LmNyZWF0ZShudWxsKSk7XG59XG5leHBvcnRzLmNvbnNvbGUgPSBfX2Fzc2lnbih7fSwgZ2VuZXJhdGVDb25zb2xlKCksIHsgZ2V0U2F2ZWRNZXNzYWdlczogZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHN0b3JhZ2VbdHlwZV0gfHwgW107XG4gICAgfSB9KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuZnVuY3Rpb24gX19leHBvcnQobSkge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcbn1cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3V0aWxzXCIpKTtcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL2NvbnNvbGVcIikpO1xuX19leHBvcnQocmVxdWlyZShcIi4vVW5pcVByaW1pdGl2ZUNvbGxlY3Rpb25cIikpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBrZXlzKG8pIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMobyk7XG59XG5leHBvcnRzLmtleXMgPSBrZXlzO1xudmFyIHNhbHQgPSBNYXRoLmZsb29yKERhdGUubm93KCkgKiBNYXRoLnJhbmRvbSgpKTtcbnZhciBjb3VudGVyID0gMDtcbmZ1bmN0aW9uIHVuaXF1ZUlkKHByZWZpeCkge1xuICAgIHJldHVybiBwcmVmaXggKyBcIi1cIiArIHNhbHQgKyBcIi1cIiArIGNvdW50ZXIrKztcbn1cbmV4cG9ydHMudW5pcXVlSWQgPSB1bmlxdWVJZDtcbmZ1bmN0aW9uIHRvQXJyYXkoc29tZSkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHNvbWUpID8gc29tZSA6IFtzb21lXTtcbn1cbmV4cG9ydHMudG9BcnJheSA9IHRvQXJyYXk7XG5mdW5jdGlvbiBwaXBlKCkge1xuICAgIHZhciBhcmdzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKGRhdGEpIHsgcmV0dXJuIGFyZ3MucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGNiKSB7IHJldHVybiBjYihhY2MpOyB9LCBkYXRhKTsgfTtcbn1cbmV4cG9ydHMucGlwZSA9IHBpcGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy8gcmVmOiBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1nbG9iYWxcbnZhciBnZXRHbG9iYWwgPSBmdW5jdGlvbiAoKSB7XG5cdC8vIHRoZSBvbmx5IHJlbGlhYmxlIG1lYW5zIHRvIGdldCB0aGUgZ2xvYmFsIG9iamVjdCBpc1xuXHQvLyBgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKWBcblx0Ly8gSG93ZXZlciwgdGhpcyBjYXVzZXMgQ1NQIHZpb2xhdGlvbnMgaW4gQ2hyb21lIGFwcHMuXG5cdGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHsgcmV0dXJuIHNlbGY7IH1cblx0aWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7IHJldHVybiB3aW5kb3c7IH1cblx0aWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7IHJldHVybiBnbG9iYWw7IH1cblx0dGhyb3cgbmV3IEVycm9yKCd1bmFibGUgdG8gbG9jYXRlIGdsb2JhbCBvYmplY3QnKTtcbn1cblxudmFyIGdsb2JhbCA9IGdldEdsb2JhbCgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBnbG9iYWwuZmV0Y2g7XG5cbi8vIE5lZWRlZCBmb3IgVHlwZVNjcmlwdCBhbmQgV2VicGFjay5cbmlmIChnbG9iYWwuZmV0Y2gpIHtcblx0ZXhwb3J0cy5kZWZhdWx0ID0gZ2xvYmFsLmZldGNoLmJpbmQoZ2xvYmFsKTtcbn1cblxuZXhwb3J0cy5IZWFkZXJzID0gZ2xvYmFsLkhlYWRlcnM7XG5leHBvcnRzLlJlcXVlc3QgPSBnbG9iYWwuUmVxdWVzdDtcbmV4cG9ydHMuUmVzcG9uc2UgPSBnbG9iYWwuUmVzcG9uc2U7IiwiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19jcmVhdGVCaW5kaW5nID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcclxufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBvKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIHApKSBfX2NyZWF0ZUJpbmRpbmcobywgbSwgcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXkodG8sIGZyb20sIHBhY2spIHtcclxuICAgIGlmIChwYWNrIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIGZvciAodmFyIGkgPSAwLCBsID0gZnJvbS5sZW5ndGgsIGFyOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGFyIHx8ICEoaSBpbiBmcm9tKSkge1xyXG4gICAgICAgICAgICBpZiAoIWFyKSBhciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20sIDAsIGkpO1xyXG4gICAgICAgICAgICBhcltpXSA9IGZyb21baV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRvLmNvbmNhdChhciB8fCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcclxufSkgOiBmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcclxuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHN0YXRlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBnZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCByZWFkIHByaXZhdGUgbWVtYmVyIGZyb20gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcclxuICAgIHJldHVybiBraW5kID09PSBcIm1cIiA/IGYgOiBraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlcikgOiBmID8gZi52YWx1ZSA6IHN0YXRlLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBzdGF0ZSwgdmFsdWUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcIm1cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgbWV0aG9kIGlzIG5vdCB3cml0YWJsZVwiKTtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIHNldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHdyaXRlIHByaXZhdGUgbWVtYmVyIHRvIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4gKGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyLCB2YWx1ZSkgOiBmID8gZi52YWx1ZSA9IHZhbHVlIDogc3RhdGUuc2V0KHJlY2VpdmVyLCB2YWx1ZSkpLCB2YWx1ZTtcclxufVxyXG4iLCIhZnVuY3Rpb24odCxlKXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz1lKCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXSxlKTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9leHBvcnRzLkV2ZW50RW1pdHRlcj1lKCk6dC5FdmVudEVtaXR0ZXI9ZSgpfSh0aGlzLChmdW5jdGlvbigpe3JldHVybigoKT0+e1widXNlIHN0cmljdFwiO3ZhciB0PXs2NjA6KHQsZSk9PntlLl9fZXNNb2R1bGU9ITAsZS5FdmVudEVtaXR0ZXI9dm9pZCAwO3ZhciBuPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0KXt0aGlzLl9ldmVudHM9T2JqZWN0LmNyZWF0ZShudWxsKSx0aGlzLmNhdGNoSGFuZGxlcj10fHxmdW5jdGlvbigpe319cmV0dXJuIHQucHJvdG90eXBlLmhhc0xpc3RlbmVycz1mdW5jdGlvbih0KXtyZXR1cm4hKCF0aGlzLl9ldmVudHNbdF18fCF0aGlzLl9ldmVudHNbdF0ubGVuZ3RoKX0sdC5wcm90b3R5cGUuZ2V0QWN0aXZlRXZlbnRzPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcztyZXR1cm4gT2JqZWN0LmtleXModGhpcy5fZXZlbnRzKS5maWx0ZXIoKGZ1bmN0aW9uKGUpe3JldHVybiB0Lmhhc0xpc3RlbmVycyhlKX0pKX0sdC5wcm90b3R5cGUudHJpZ2dlcj1mdW5jdGlvbih0LGUpe3ZhciBuPXRoaXM7dGhpcy5fZXZlbnRzW3RdJiYodGhpcy5fZXZlbnRzW3RdLnNsaWNlKCkuZm9yRWFjaCgoZnVuY3Rpb24obyl7dHJ5e28uaGFuZGxlci5jYWxsKG8uY29udGV4dCxlKX1jYXRjaCh0KXtuLmNhdGNoSGFuZGxlcih0KX1vLm9uY2UmJm4ub2ZmKHQsby5oYW5kbGVyKX0pKSx0aGlzLl9ldmVudHNbdF0ubGVuZ3RofHxkZWxldGUgdGhpcy5fZXZlbnRzW3RdKX0sdC5wcm90b3R5cGUub249ZnVuY3Rpb24odCxlLG4pe3RoaXMuX29uKHQsZSxuLCExKX0sdC5wcm90b3R5cGUub25jZT1mdW5jdGlvbih0LGUsbil7dGhpcy5fb24odCxlLG4sITApfSx0LnByb3RvdHlwZS5vZmY9ZnVuY3Rpb24odCxlKXt2YXIgbj10aGlzLG89XCJzdHJpbmdcIj09dHlwZW9mIHQ/dDpudWxsLGk9XCJmdW5jdGlvblwiPT10eXBlb2YgZT9lOlwiZnVuY3Rpb25cIj09dHlwZW9mIHQ/dDpudWxsO2lmKG8paWYoaSl7aWYobyBpbiB0aGlzLl9ldmVudHMpe3ZhciByPXRoaXMuX2V2ZW50c1tvXS5tYXAoKGZ1bmN0aW9uKHQpe3JldHVybiB0LmhhbmRsZXJ9KSkuaW5kZXhPZihpKTt0aGlzLl9ldmVudHNbb10uc3BsaWNlKHIsMSl9fWVsc2UgZGVsZXRlIHRoaXMuX2V2ZW50c1tvXTtlbHNlIE9iamVjdC5rZXlzKHRoaXMuX2V2ZW50cykuZm9yRWFjaCgoZnVuY3Rpb24odCl7bi5vZmYodCxpKX0pKX0sdC5wcm90b3R5cGUuX29uPWZ1bmN0aW9uKHQsZSxuLG8pe3RoaXMuX2V2ZW50c1t0XXx8KHRoaXMuX2V2ZW50c1t0XT1bXSksdGhpcy5fZXZlbnRzW3RdLnB1c2goe2hhbmRsZXI6ZSxjb250ZXh0Om4sb25jZTpvfSl9LHR9KCk7ZS5FdmVudEVtaXR0ZXI9bn0sNjA3OmZ1bmN0aW9uKHQsZSxuKXt2YXIgbz10aGlzJiZ0aGlzLl9fY3JlYXRlQmluZGluZ3x8KE9iamVjdC5jcmVhdGU/ZnVuY3Rpb24odCxlLG4sbyl7dm9pZCAwPT09byYmKG89biksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsbyx7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gZVtuXX19KX06ZnVuY3Rpb24odCxlLG4sbyl7dm9pZCAwPT09byYmKG89biksdFtvXT1lW25dfSksaT10aGlzJiZ0aGlzLl9fZXhwb3J0U3Rhcnx8ZnVuY3Rpb24odCxlKXtmb3IodmFyIG4gaW4gdClcImRlZmF1bHRcIj09PW58fE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLG4pfHxvKGUsdCxuKX07ZS5fX2VzTW9kdWxlPSEwO3ZhciByPW4oNjYwKTtpKG4oNjYwKSxlKSxlLmRlZmF1bHQ9ci5FdmVudEVtaXR0ZXJ9fSxlPXt9O3JldHVybiBmdW5jdGlvbiBuKG8pe2lmKGVbb10pcmV0dXJuIGVbb10uZXhwb3J0czt2YXIgaT1lW29dPXtleHBvcnRzOnt9fTtyZXR1cm4gdFtvXS5jYWxsKGkuZXhwb3J0cyxpLGkuZXhwb3J0cyxuKSxpLmV4cG9ydHN9KDYwNyl9KSgpfSkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXZlbnRzLm1pbi5qcy5tYXAiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCJpbXBvcnQgeyBTaWduZXIgfSBmcm9tICdAd2F2ZXMvc2lnbmVyJztcbmltcG9ydCB7IFByb3ZpZGVyV2ViIH0gZnJvbSAnQHdhdmVzLmV4Y2hhbmdlL3Byb3ZpZGVyLXdlYic7XG5cbmNvbnN0IHNpZ25lciA9IG5ldyBTaWduZXIoe1xuICAvLyBTcGVjaWZ5IFVSTCBvZiB0aGUgbm9kZSBvbiBUZXN0bmV0XG4gIE5PREVfVVJMOiAnaHR0cHM6Ly9ub2Rlcy10ZXN0bmV0LndhdmVzbm9kZXMuY29tJ1xufSk7XG5zaWduZXIuc2V0UHJvdmlkZXIobmV3IFByb3ZpZGVyV2ViKCdodHRwczovL3Rlc3RuZXQud2F2ZXMuZXhjaGFuZ2Uvc2lnbmVyLycpKVxuXG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuanMtbG9naW5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jIGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHVzZXJEYXRhID0gYXdhaXQgd2F2ZXMubG9naW4oKTtcbiAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5hZGQoXCJjbGlja2VkXCIpO1xuICAgICAgICBldmVudC50YXJnZXQuaW5uZXJIVE1MID0gYFxuICAgICAgICAgICAgYXV0aG9yaXplZCBhcyA8YnI+XG4gICAgICAgICAgICAke3VzZXJEYXRhLmFkZHJlc3N9YDtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5leHBsb3Jlci1saW5rXCIpLmlubmVySFRNTCA9IGA8YSBocmVmPVwiaHR0cHM6Ly93YXZlc2V4cGxvcmVyLmNvbS90ZXN0bmV0L2FkZHJlc3MvJHt1c2VyRGF0YS5hZGRyZXNzfVwiIHRhcmdldD1cIl9ibGFua1wiPkNoZWNrIHRoZSBFeHBsb3JlcjwvYT5gO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignbG9naW4gcmVqZWN0ZWQnKVxuICAgIH1cbn0pO1xuXG5cbi8vIGNhbGxpbmcgYSBcImZhdWNldFwiIHNjcmlwdCB3YXZlc2V4cGxvcmVyLmNvbS90ZXNuZXQvYWRkcmVzcy8zTXVON0Q4cjE5emR2U3BBZDFMOTFHczg4YmNnd1VGeTJtbi9zY3JpcHRcbi8vIHRoaXMgd2lsbCB0b3AgdXAgdGhlIGFjY291bnQgYmFsYW5jZSwgYnV0IG9ubHkgb25jZVxuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy1pbnZva2VcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICB3YXZlcy5pbnZva2Uoe1xuICAgICAgICBkQXBwOiBcIjNNdU43RDhyMTl6ZHZTcEFkMUw5MUdzODhiY2d3VUZ5Mm1uXCIsXG4gICAgICAgIGNhbGw6IHtcbiAgICAgICAgICAgIGZ1bmN0aW9uOiBcImZhdWNldFwiXG4gICAgICAgIH1cbiAgICB9KS5icm9hZGNhc3QoKS50aGVuKGNvbnNvbGUubG9nKVxufSk7XG5cblxuLy8ganVzdCBwdXR0aW5nIHNvbWUgZGF0YSBpbnRvIGFjY291bnQgc3RvcmFnZVxuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy1kYXRhXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgd2F2ZXMuZGF0YSh7XG4gICAgICAgIGRhdGE6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwibGFzdENhbGxcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogYCR7ZGF0ZS5nZXREYXRlKCl9LiR7ZGF0ZS5nZXRNb250aCgpICsgMX0uJHtkYXRlLmdldEZ1bGxZZWFyKCl9ICR7ZGF0ZS5nZXRIb3VycygpfToke2RhdGUuZ2V0TWludXRlcygpfToke2RhdGUuZ2V0U2Vjb25kcygpfWAsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0pLmJyb2FkY2FzdCgpLnRoZW4oY29uc29sZS5sb2cpXG59KTtcblxuXG4vLyBqdXN0IHRyYW5zZmVycmluZyBzb21lIFdBVkVTIHRva2VuIHRvIEFsaWNlXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXRyYW5zZmVyXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgd2F2ZXMudHJhbnNmZXIoe1xuICAgICAgICByZWNpcGllbnQ6IFwiM011TjdEOHIxOXpkdlNwQWQxTDkxR3M4OGJjZ3dVRnkybW5cIixcbiAgICAgICAgYW1vdW50OiAxXG4gICAgfSkuYnJvYWRjYXN0KCkudGhlbihjb25zb2xlLmxvZylcbn0pO1xuXG5cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==