# fetch-for [TODO]

[![NPM version](https://badge.fury.io/js/fetch-for.png)](http://badge.fury.io/js/fetch-for)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/fetch-for?style=for-the-badge)](https://bundlephobia.com/result?p=fetch-for)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/fetch-for?compression=gzip">
<!--[![Playwright Tests](https://github.com/bahrus/fetch-for/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/fetch-for/actions/workflows/CI.yml)-->

## [API Documentation](https://cf-sw.bahrus.workers.dev/?href=https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Ffetch-for%400.0.9%2Fcustom-elements.json&stylesheet=https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fwc-info%2Fsimple-ce-style.css&embedded=false&tags=&ts=2024-04-14T13%3A35%3A04.990Z&tocXSLT=https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fwc-info%2Ftoc.xsl)

## [Demo](https://jsfiddle.net/bahrus/ma0vtbnx/1/)

fetch-for is a small-ish, bare-bones simple fetch web component.  

```html
<div itemscope=prescription-management>
    <form be-reformable='{
        "baseLink": "base-api-services",
        "path": "med_orders/prescriptions/patient?id=zero"
    }'
        #
    >
    </form>
    <fetch-for defer-hydration fetch=#{{form}} for=#{{prescriptions}}></fetch-for>
    <div itemscope=prescriptions #>

    </div>
</div>
```