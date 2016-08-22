'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.app = exports.page = exports.hashrouter = exports.injectSVG = exports.loadSVG = exports.imageLoader = exports.scrambler = exports.wait = exports.range = exports.scramble = exports.chars = exports.markdown = exports.trackVisibility = exports.viewportHeight = exports.applinks = exports.chrome = exports.safari = exports.iOS = exports.google_plus = exports.twitter_card = exports.fb_instantarticle = exports.fb_opengraph = exports.googleAnalytics = exports.mobile_metas = exports.theme = exports.head = undefined;

var _vdom2 = require('./vdom');

var _routerAlt = require('./router-alt');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /* huge ups to John Buschea (https://github.com/joshbuchea/HEAD) */


var head = exports.head = function head() {
    for (var _len = arguments.length, c = Array(_len), _key = 0; _key < _len; _key++) {
        c[_key] = arguments[_key];
    }

    var loaded_once = false;
    var config = function config(el) {
        return loaded_once = true;
    };
    return (0, _vdom2.m)('head', { config: config, shouldUpdate: function shouldUpdate(el) {
            return !el;
        } }, c);
};

// More info: https://developer.chrome.com/multidevice/android/installtohomescreen
var theme = exports.theme = function theme() {
    var color = arguments.length <= 0 || arguments[0] === undefined ? 'black' : arguments[0];
    return [(0, _vdom2.m)('meta', { name: 'theme-color', content: color }), (0, _vdom2.m)('meta', { name: 'msapplication-TileColor', content: color })];
};

var mobile_metas = exports.mobile_metas = function mobile_metas() {
    var title = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var img = arguments.length <= 1 || arguments[1] === undefined ? 'icon' : arguments[1];
    var manifest = arguments.length <= 2 || arguments[2] === undefined ? 'manifest' : arguments[2];
    return [(0, _vdom2.m)('meta', { charset: 'utf8' }), (0, _vdom2.m)('meta', { 'http-equiv': 'x-ua-compatible', content: 'ie=edge' }), (0, _vdom2.m)('meta', { name: "viewport", content: "width=device-width, initial-scale=1.0, shrink-to-fit=no" }), (0, _vdom2.m)('title', title)].concat(_toConsumableArray(['HandheldFriendly,True', 'MobileOptimized,320', 'mobile-web-app-capable,yes', 'apple-mobile-web-app-capable,yes', 'apple-mobile-web-app-title,' + title, 'msapplication-TileImage,/' + img + '-144x144.png', 'msapplication-square70x70logo,/smalltile.png', 'msapplication-square150x150logo,/mediumtile.png', 'msapplication-wide310x150logo,/widetile.png', 'msapplication-square310x310logo,/largetile.png'].map(function (x) {
        return (0, _vdom2.m)('meta', { name: x.split(',')[0], content: x.split(',')[1] });
    })), [
    // ...([512,180,152,144,120,114,76,72].map(x =>
    //     m('link', {rel: 'apple-touch-icon-precomposed', sizes:`${x}x${x}`, href:`/${img}-${x}x${x}.png`}))),
    (0, _vdom2.m)('link', { rel: 'apple-touch-icon-precomposed', href: '/' + img + '-180x180.png' }), (0, _vdom2.m)('link', { rel: 'apple-touch-startup-image', href: '/' + img + '-startup.png' }), (0, _vdom2.m)('link', { rel: 'shortcut icon', href: '/' + img + '.ico', type: 'image/x-icon' }), (0, _vdom2.m)('link', { rel: 'manifest', href: '/' + manifest + '.json' })]);
};

/**
 * Google Analytics
 */
var googleAnalytics = exports.googleAnalytics = function googleAnalytics(id) {
    var x = function x() {
        window.ga = window.ga || function () {
            window.ga.q = (window.ga.q || []).push(arguments);
        };
        var ga = window.ga;
        ga('create', id, 'auto');
        ga('send', 'pageview');
    };
    return (0, _vdom2.m)('script', { config: x, src: 'https://www.google-analytics.com/analytics.js', l: 1 * new Date(), async: 1 });
};

// Facebook: https://developers.facebook.com/docs/sharing/webmasters#markup
// Open Graph: http://ogp.me/

var fb_opengraph = exports.fb_opengraph = function fb_opengraph(app_id, url, title, img, site_name, author) {
    return ['fb:app_id,' + app_id, 'og:url,' + url, 'og:type,website', 'og:title,' + title, 'og:image,' + img, 'og:description,' + description, 'og:site_name,' + site_name, 'og:locale,en_US', 'article:author,' + author].map(function (x, i, a) {
        var p = arguments.length <= 3 || arguments[3] === undefined ? x.split(',') : arguments[3];
        return (0, _vdom2.m)('meta', { property: p[0], content: p[1] });
    });
};

var fb_instantarticle = exports.fb_instantarticle = function fb_instantarticle(article_url, style) {
    return [(0, _vdom2.m)('meta', { property: "op:markup_version", content: "v1.0" }), (0, _vdom2.m)('link', { rel: "canonical", href: article_url }), (0, _vdom2.m)('meta', { property: "fb:article_style", content: style })];
};

// More info: https://dev.twitter.com/cards/getting-started
// Validate: https://dev.twitter.com/docs/cards/validation/validator
var twitter_card = exports.twitter_card = function twitter_card(summary, site_account, individual_account, url, title, description, image) {
    return ['twitter:card,' + summary, 'twitter:site,@' + site_account, 'twitter:creator,@' + individual_account, 'twitter:url,' + url, 'twitter:title,' + title, 'twitter:description,' + description, 'twitter:image,' + image].map(function (x, i, a) {
        var n = arguments.length <= 3 || arguments[3] === undefined ? x.split(',') : arguments[3];
        return (0, _vdom2.m)('meta', { name: n[0], content: n[1] });
    });
};

var google_plus = exports.google_plus = function google_plus(page, title, desc, img) {
    return [(0, _vdom2.m)('link', { href: 'https://plus.google.com/+' + page, rel: 'publisher' }), (0, _vdom2.m)('meta', { itemprop: "name", content: title }), (0, _vdom2.m)('meta', { itemprop: "description", content: desc }), (0, _vdom2.m)('meta', { itemprop: "image", content: img })];
};

// More info: https://developer.apple.com/safari/library/documentation/appleapplications/reference/safarihtmlref/articles/metatags.html
var iOS = exports.iOS = function iOS(app_id, affiliate_id, app_arg) {
    var telephone = arguments.length <= 3 || arguments[3] === undefined ? 'yes' : arguments[3];
    var title = arguments[4];
    return [
    // Smart App Banner
    'apple-itunes-app,app-id=' + app_id + ',affiliate-data=' + affiliate_id + ',app-argument=' + app_arg,

    // Disable automatic detection and formatting of possible phone numbers -->
    'format-detection,telephone=' + telephone,

    // Add to Home Screen
    'apple-mobile-web-app-capable,yes', 'apple-mobile-web-app-status-bar-style,black', 'apple-mobile-web-app-title,' + title].map(function (x, i, a) {
        var n = arguments.length <= 3 || arguments[3] === undefined ? x.split(',') : arguments[3];
        return (0, _vdom2.m)('meta', { name: n[0], content: n[1] });
    });
};

// Pinned Site - Safari
var safari = exports.safari = function safari() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? 'icon' : arguments[0];
    var color = arguments.length <= 1 || arguments[1] === undefined ? 'red' : arguments[1];
    return (0, _vdom2.m)('link', { rel: "mask-icon", href: name + '.svg', color: color });
};

// Disable translation prompt
var chrome = exports.chrome = function chrome(app_id) {
    return [(0, _vdom2.m)('link', { rel: "chrome-webstore-item", href: 'https://chrome.google.com/webstore/detail/' + app_id }), (0, _vdom2.m)('meta', { name: 'google', value: 'notranslate' })];
};

var applinks = exports.applinks = function applinks(app_store_id, name, android_pkg, docs_url) {
    return [
    // iOS
    'al:ios:url,applinks://docs', 'al:ios:app_store_id,' + app_store_id, 'al:ios:app_name,' + name,
    // Android
    'al:android:url,applinks://docs', 'al:android:app_name,' + name, 'al:android:package,' + android_pkg,
    // Web Fallback
    'al:web:url,' + docs_url].map(function (x, i, a) {
        var n = arguments.length <= 3 || arguments[3] === undefined ? x.split(',') : arguments[3];
        return (0, _vdom2.m)('meta', { property: n[0], content: n[1] });
    });
};

/**
 * monitors scrolling to indicate if an element is visible within the viewport
 */

/*
likely include with your SCSS for a project, that makes these styles hide/show the element:
.invisible {
    opacity: 0;
    transition-delay: .5s;
    transition-duration: .5s;
    &.visible {
        opacity: 1;
    }
}
 */

var viewportHeight = exports.viewportHeight = function viewportHeight(_) {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
};

var trackVisibility = exports.trackVisibility = function trackVisibility(component) {
    var el = void 0,
        visible = el.getBoundingClientRect instanceof Function ? false : true;

    var onScroll = (0, _vdom2.debounce)(function (ev) {
        if (!el.getBoundingClientRect instanceof Function) return;

        var _el$getBoundingClient = el.getBoundingClientRect();

        var top = _el$getBoundingClient.top;
        var height = _el$getBoundingClient.height;
        var vh = viewportHeight();
        if (top <= vh && !visible) {
            el.className += ' visible';
            visible = true;
        } else if (top > vh && visible) {
            el.className = el.className.replace(/ visible/g, '');
            visible = false;
        }
    }, 16.6);

    var startScroll = function startScroll(_el) {
        el = _el;
        window.addEventListener('scroll', onScroll);
    };

    var endScroll = function endScroll(_) {
        return window.removeEventListener('scroll', onScroll);
    };

    (0, _vdom2.rAF)(onScroll);

    return (0, _vdom2.m)('div.invisible', { config: startScroll, unload: endScroll }, component);
};

/**
 * MARKDEEP / MARKDOWN - convert a section with string content
 * into a markdeep/markdown rendered section
*/

var markdown = exports.markdown = function markdown(content) {
    var markdownToHtml = arguments.length <= 1 || arguments[1] === undefined ? function (c) {
        return global.markdeep.format(c);
    } : arguments[1];

    var config = function config(element, init) {
        element.innerHTML = markdownToHtml(content);
    };
    return (0, _vdom2.m)('.markdeep', { config: config });
};

/**
 * scrambled text animation
 *
 * m('span', {config: animatingTextConfig('test me out')})
 */
var chars = exports.chars = '#*^-+=!f0123456789_';
var scramble = exports.scramble = function scramble(str) {
    var from = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    return str.slice(0, from) + str.slice(from).split('').map(function (x) {
        return x === ' ' ? x : chars[range(0, chars.length)];
    }).join('');
};
var range = exports.range = function range(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};
var wait = exports.wait = function wait(ms) {
    return new Promise(function (res) {
        return setTimeout(res, ms);
    });
};

var scrambler = exports.scrambler = function scrambler(str) {
    var interval = arguments.length <= 1 || arguments[1] === undefined ? 33 : arguments[1];
    var i = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var delay = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
    return function (el) {
        var start = scramble(str, 0);
        var draw = function draw(i) {
            return function () {
                return el.innerText = str.slice(0, i) + start.slice(i);
            };
        };
        while (i++ < str.length) {
            wait(delay + i * interval).then(draw(i));
        }
    };
};

/**
 * load an image in JS, and then animate it in as a background image
 *
 * imageLoader(url, m('div'))
 */
var imageLoader = exports.imageLoader = function imageLoader(url, comp) {
    var x = comp,
        image = void 0,
        loaded = false;

    while (x instanceof Function) {
        x = x();
    }var imgConfig = function imgConfig(el) {
        image = new Image();

        el.style.backgroundImage = 'url(' + url + ')';

        var done = function done(ev) {
            if (loaded) return;
            el.className += ' loaded';
            loaded = true;
        };

        image.onload = done;
        image.src = url;
    };

    x.config = imgConfig;
    return x;
};

/**
 * load an SVG and inject it onto the page
 */
var loadSVG = exports.loadSVG = function loadSVG(url) {
    return fetch(url).then(function (r) {
        return r.text();
    });
};
var injectSVG = exports.injectSVG = function injectSVG(url) {
    return (0, _vdom2.container)(function (data) {
        return (0, _vdom2.m)('div', { config: function config(el) {
                return el.innerHTML = data.svg;
            } });
    }, { svg: loadSVG.bind(null, url) });
};

/**
 * hashroute-driven router
 */
// router implementation
var hashrouter = exports.hashrouter = function hashrouter() {
    var routes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var def = arguments.length <= 1 || arguments[1] === undefined ? '#' : arguments[1];
    var current = arguments[2];

    var x = (0, _routerAlt.router)(routes, function (_vdom) {
        current = _vdom;
        (0, _vdom2.update)();
    });
    x.listen();
    x.trigger((window.location.hash || def).slice(1));
    return function () {
        return current;
    };
};

/**
 * page component that returns an entire html component
 */
var page = exports.page = function page(main, title) {
    var css = arguments.length <= 2 || arguments[2] === undefined ? '/style.css' : arguments[2];
    var googleAnalyticsId = arguments[3];
    return [head(theme(), mobile_metas(title), (0, _vdom2.m)('link', { type: 'text/css', rel: 'stylesheet', href: css }), googleAnalyticsId && googleAnalytics(googleAnalyticsId)), (0, _vdom2.m)('body', main)];
};

/**
 * mount the entire page() component to the DOM
 */
var app = exports.app = function app(routes, def, title, css, analyticsId) {
    var router = hashrouter(routes, def);
    var p = page(router, title, css, analyticsId);
    return function () {
        return (0, _vdom2.mount)(p, (0, _vdom2.qs)('html', document));
    };
};