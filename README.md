# fetch-for (🐶) [TODO]

[![NPM version](https://badge.fury.io/js/fetch-for.png)](http://badge.fury.io/js/fetch-for)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/fetch-for?style=for-the-badge)](https://bundlephobia.com/result?p=fetch-for)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/fetch-for?compression=gzip">
<!--[![Playwright Tests](https://github.com/bahrus/fetch-for/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/fetch-for/actions/workflows/CI.yml)-->

## [API Documentation](https://cf-sw.bahrus.workers.dev/?href=https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Ffetch-for%400.0.9%2Fcustom-elements.json&stylesheet=https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fwc-info%2Fsimple-ce-style.css&embedded=false&tags=&ts=2024-04-14T13%3A35%3A04.990Z&tocXSLT=https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fwc-info%2Ftoc.xsl)

## [Demo](https://jsfiddle.net/bahrus/ma0vtbnx/1/)

*fetch-for* is a small-ish, bare-bones simple fetch web component.  

```html
<div itemscope=prescription-management>
    <form be-reformable='{
        "baseLink": "base-api-services",
        "path": "med_orders/prescriptions/patient?id=zero"
    }'
        fetch-for-target=#prescriptions?.ish
    >
    </form>
    <div id=prescriptions itemscope=prescriptions>

    </div>
</div>
```

*fetch-for* works seamlessly with [be-reformable](https://github.com/bahrus/be-reformable), as illustrated above but can work ith any other component/library that:

1.  Dispatches common event [fetch-ready](https://github.com/bahrus/fetch-ready) from the form element when the form is ready to be invoked on the client side (passes validity tests, has had a "submit" button clicked, etc).
2.  Checks if the form is ready for invoking on any input event ([TODO]: make this configurable)

## Viewing Locally

Any web server that serves static files with server-side includes will do but...

1. Install git
2. Fork/clone this repo
3. Install node.js
4. Open command window to folder where you cloned this repo
5. > git submodule add https://github.com/bahrus/types.git types
6. > git submodule update --init --recursive
7. > npm install
8. > npm run serve
9. Open http://localhost:8000/demo/ in a modern browser