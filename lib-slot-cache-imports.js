import { generate_scoped_styles } from "https://cdn.jsdelivr.net/gh/VSADX/scoped-css@main/scoped-css.js"

const promises = new Map()

const autofill = (placeholder, fills) => 
    [...placeholder.getElementsByTagName("slot")]
        .forEach(slot => slot.replaceWith(fills[slot.name]))

void [...document.getElementsByTagName("html-template")].forEach(element => {
    const url = element.getAttribute("href") || element.firstElementChild.href

    /** @type {{[x: string]: HTMLElement}} */
    const fills = {}
    element.querySelectorAll(`[as]`).forEach(el => fills[el.getAttribute("as")] = el)

    if(promises.has(url)) 
        promises.get(url).then(el => {
            el = el()
            element.replaceWith(el)
            autofill(el, fills)
        })
    else promises.set(url, fetch(url).then(r => r.text()).then(html => {

            element.insertAdjacentHTML("afterend", html)
            const realized = element.nextElementSibling

            generate_scoped_styles(realized, true)
            document.body.append(...realized.querySelectorAll("style.scoped"))

            const result = realized.cloneNode(true)

            element.remove()

            autofill(realized, fills)    
            return () => result.cloneNode(true)
        }))
})
