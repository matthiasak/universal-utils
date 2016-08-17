/* huge ups to John Buschea (https://github.com/joshbuchea/HEAD) */
import {debounce,m,html,rAF,mount,update,qs,container} from './vdom'
import {router} from './router-alt'

const head = (...c) => {
    let loaded_once = false
    const config = el => loaded_once = true
    return m('head', {config, shouldUpdate: el => !el}, c)
}

// More info: https://developer.chrome.com/multidevice/android/installtohomescreen
const theme = (color='black') => [
    m('meta', {name:'theme-color', content:color}),
    m('meta', {name:'msapplication-TileColor', content:color}),
]

const mobile_metas = (title='', img='icon', manifest='manifest') => [
    m('meta', {charset:'utf8'}),
    m('meta', {'http-equiv':'x-ua-compatible', content:'ie=edge'}),
    m('meta', {name:"viewport", content:"width=device-width, initial-scale=1.0, shrink-to-fit=no"}),
    m('title', title),
    ...([
        'HandheldFriendly,True',
        'MobileOptimized,320',
        'mobile-web-app-capable,yes',
        'apple-mobile-web-app-capable,yes',
        `apple-mobile-web-app-title,${title}`,
        `msapplication-TileImage,/${img}-144x144.png`,
        `msapplication-square70x70logo,/smalltile.png`,
        `msapplication-square150x150logo,/mediumtile.png`,
        `msapplication-wide310x150logo,/widetile.png`,
        `msapplication-square310x310logo,/largetile.png`,
    ].map(x => m('meta', {name: x.split(',')[0], content: x.split(',')[1]}))),
    // ...([512,180,152,144,120,114,76,72].map(x =>
    //     m('link', {rel: 'apple-touch-icon-precomposed', sizes:`${x}x${x}`, href:`/${img}-${x}x${x}.png`}))),
    m('link', {rel: 'apple-touch-icon-precomposed', href:`/${img}-180x180.png`}),
    m('link', {rel: 'apple-touch-startup-image', href:`/${img}-startup.png`}),
    m('link', {rel: 'shortcut icon', href:`/${img}.ico`, type:'image/x-icon'}),
    m('link', {rel: 'manifest', href:`/${manifest}.json`})
]

/**
 * Google Analytics
 */
const googleAnalytics = id => {
    const x = () => {
        window.ga = window.ga || function(){
            window.ga.q = (window.ga.q || []).push(arguments)
        }
        let ga = window.ga
        ga('create', id, 'auto')
        ga('send', 'pageview')
    }
    return m('script', {config: x, src:'https://www.google-analytics.com/analytics.js', l: 1 * new Date, async: 1})
}

// Facebook: https://developers.facebook.com/docs/sharing/webmasters#markup
// Open Graph: http://ogp.me/

const fb_opengraph = (app_id, url, title, img, site_name, author) => [
    `fb:app_id,${app_id}`,
    `og:url,${url}`,
    `og:type,website`,
    `og:title,${title}`,
    `og:image,${img}`,
    `og:description,${description}`,
    `og:site_name,${site_name}`,
    `og:locale,en_US`,
    `article:author,${author}`,
].map((x,i,a,p=x.split(',')) =>
    m('meta', {property:p[0], content:p[1]}))

const fb_instantarticle = (article_url, style) => [
    m('meta', {property:"op:markup_version", content:"v1.0"}),
    m('link', {rel:"canonical", href:article_url}),
    m('meta', {property:"fb:article_style", content:style})
]

// More info: https://dev.twitter.com/cards/getting-started
// Validate: https://dev.twitter.com/docs/cards/validation/validator
const twitter_card = (summary,site_account,individual_account,url,title,description,image) => [
    `twitter:card,${summary}`,
    `twitter:site,@${site_account}`,
    `twitter:creator,@${individual_account}`,
    `twitter:url,${url}`,
    `twitter:title,${title}`,
    `twitter:description,${description}`,
    `twitter:image,${image}`,
].map((x,i,a,n=x.split(',')) => m('meta', {name:n[0], content:n[1]}))

const google_plus = (page, title, desc, img) => [
    m('link', {href:`https://plus.google.com/+${page}`, rel:'publisher'}),
    m('meta', {itemprop:"name", content:title}),
    m('meta', {itemprop:"description", content:desc}),
    m('meta', {itemprop:"image", content:img}),
]

// More info: https://developer.apple.com/safari/library/documentation/appleapplications/reference/safarihtmlref/articles/metatags.html
const iOS = (app_id,affiliate_id, app_arg, telephone='yes', title) =>
[
    // Smart App Banner
    `apple-itunes-app,app-id=${app_id},affiliate-data=${affiliate_id},app-argument=${app_arg}`,

    // Disable automatic detection and formatting of possible phone numbers -->
    `format-detection,telephone=${telephone}`,

    // Add to Home Screen
    `apple-mobile-web-app-capable,yes`,
    `apple-mobile-web-app-status-bar-style,black`,
    `apple-mobile-web-app-title,${title}`,
].map((x,i,a,n=x.split(',')) =>
    m('meta', {name:n[0], content:n[1]}))

// Pinned Site - Safari
const safari = (name='icon',color='red') => m('link', {rel:"mask-icon", href:`${name}.svg`, color})

// Disable translation prompt
const chrome = (app_id) => [
    m('link', {rel:"chrome-webstore-item", href:`https://chrome.google.com/webstore/detail/${app_id}`}),
    m('meta', {name:'google', value:'notranslate'})
]

const applinks = (app_store_id, name, android_pkg, docs_url) => [
    // iOS
    `al:ios:url,applinks://docs`,
    `al:ios:app_store_id,${app_store_id}`,
    `al:ios:app_name,${name}`,
    // Android
    `al:android:url,applinks://docs`,
    `al:android:app_name,${name}`,
    `al:android:package,${android_pkg}`,
    // Web Fallback
    `al:web:url,${docs_url}`,
    // More info: http://applinks.org/documentation/
].map((x,i,a,n=x.split(',')) => m('meta', {property:n[0], content:n[1]}))

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

const viewportHeight = _ => Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

const trackVisibility = component => {
    let el,
        visible = (el.getBoundingClientRect instanceof Function) ? false : true

    const onScroll = debounce(ev => {
        if(!el.getBoundingClientRect instanceof Function) return
        let {top, height} = el.getBoundingClientRect(),
            vh = viewportHeight()
        if(top <= vh && !visible) {
            el.className += ' visible'
            visible = true
        } else if(top > vh && visible) {
            el.className = el.className.replace(/ visible/g, '')
            visible = false
        }
    }, 16.6)

    const startScroll = _el => {
        el = _el
        window.addEventListener('scroll', onScroll)
    }

    const endScroll = _ => window.removeEventListener('scroll', onScroll)

    rAF(onScroll)

    return m('div.invisible', {config: startScroll, unload: endScroll}, component)
}

/**
 * MARKDEEP / MARKDOWN - convert a section with string content
 * into a markdeep/markdown rendered section
*/

const markdown = (content, markdownToHtml=(c => global.markdeep.format(c))) => {
    const config = (element, init) => {
        element.innerHTML = markdownToHtml(content)
    }
    return m('.markdeep', {config})
}

/**
 * scrambled text animation
 *
 * m('span', {config: animatingTextConfig('test me out')})
 */
const chars = '#*^-+=!f0123456789_'
const scramble = (str, from=0) =>
    str.slice(0,from) + str.slice(from).split('').map(x => x === ' ' ? x : chars[range(0,chars.length)]).join('')
const range = (min,max) => Math.floor(Math.random()*(max-min)+min)
const wait = ms => new Promise((res) => setTimeout(res, ms))

const scrambler = (str, interval=33, i=0, delay=0) => el => {
    let start = scramble(str, 0)
    const draw = i => () => el.innerText = str.slice(0,i)+start.slice(i)
    while(i++ < str.length){
        wait(delay+i*interval).then(draw(i))
    }
}

/**
 * load an image in JS, and then animate it in as a background image
 *
 * imageLoader(url, m('div'))
 */
const imageLoader = (url, comp) => {
    let x = comp,
        image,
        loaded = false

    while(x instanceof Function)
        x = x()

    const imgConfig = el => {
        image = new Image()

        el.style.backgroundImage = `url(${url})`

        const done = ev => {
            if(loaded) return
            el.className += ' loaded'
            loaded = true
        }

        image.onload = done
        image.src = url
    }

    x.config = imgConfig
    return x
}

/**
 * load an SVG and inject it onto the page
 */
const loadSVG = url => fetch(url).then(r => r.text())
const injectSVG = url => container(data =>
    m('div', {config: el => el.innerHTML = data.svg}),
    {svg: loadSVG.bind(null, url)})

/**
 * hashroute-driven router
 */
// router implementation
const hashrouter = (
    routes={},
    def='#',
    current
) => {
    let x = router(routes, (el) => {
        current = el
        update()
    })
    x.listen()
    x.trigger((window.location.hash || def).slice(1))
    return () => current
}

/**
 * page component that returns an entire html component
 */
const page = (main, title, css='/style.css', googleAnalyticsId) => [
    head(
        theme(),
        mobile_metas(title),
        m('link', {type:'text/css', rel:'stylesheet', href:css}),
        googleAnalyticsId && googleAnalytics(googleAnalyticsId)
    ),
    m('body', main)
]

/**
 * mount the entire page() component to the DOM
 */
const app = (routes, def, title, css, analyticsId) => {
    const router = hashrouter(routes, def)
    const p = page(router, title, css, analyticsId)
    return () => mount(p, qs('html', document))
}

export {
    head,
    theme,
    mobile_metas,
    googleAnalytics,
    fb_opengraph,
    fb_instantarticle,
    twitter_card,
    google_plus,
    iOS,
    safari,
    chrome,
    applinks,
    trackVisibility,
    markdown,
    scrambler,
    imageLoader,
    injectSVG,
    hashrouter,
    page,
    app,
}