export const mixin = (...classes) => {
    class _mixin {}
    let proto = _mixin.prototype

    classes.map(({prototype:p}) => {
        Object.getOwnPropertyNames(p).map(key => {
            let oldFn = proto[key] || (() => {})
            proto[key] = (...args) => {
                oldFn(...args)
                return p[key](...args)
            }
        })
    })

    return _mixin
}