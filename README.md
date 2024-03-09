# fetch-for [TODO]

<a href="https://nodei.co/npm/fetch-for/"><img src="https://nodei.co/npm/p-fetch.png"></a>
# fetch-for

[![NPM version](https://badge.fury.io/js/fetch-for.png)](http://badge.fury.io/js/fetch-for)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/fetch-for?style=for-the-badge)](https://bundlephobia.com/result?p=fetch-for)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/fetch-for?compression=gzip">
<!--[![Playwright Tests](https://github.com/bahrus/fetch-for/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/fetch-for/actions/workflows/CI.yml)-->


## [Demo](https://jsfiddle.net/bahrus/ma0vtbnx/1/)

fetch-for is a small, bare-bones simple fetch web component.  For more features (but larger footprint), see [xtal-fetch](https://www.npmjs.com/package/xtal-fetch). fetch-for provides no support for rendering while streaming.  For such support, see alternatives, such as [be-written](https://github.com/bahrus/be-written).

fetch-for can act as a base web component for "web components as a service".  [be-fetching](https://github.com/bahrus/be-fetching) [TODO] actually does just that - it can dynamically create such a web component on the fly, declaratively, that extends this base class.

Markup:

```html
<fetch-for 
href=https://cors-anywhere.herokuapp.com/https://www.theonion.com/ 
as=html shadow=open onerror="console.error(href)"></fetch-for>
    
```

For this very specific example shown above, due to restrictions of the cors-anywhere utility the link above uses, you will first need to go to https://cors-anywhere.herokuapp.com/corsdemo to unlock the service for a limited amount of time.

Required attributes are href and at least one of these attributes: onerror, oninput, onload, onchange.  The reason for insisting on at least one of these on* attributes is this:  Since these attributes can't pass through any decent sanitizer that prevents xss attacks, the presence of one or more of them indicates that the web site trusts the content from which the data is being retrieved.

When the fetch is complete, event "load" is fired, which can allow for manipulation of the data.  The (modified) data is then stored in the "value" field of the fetch-for (or subclassed) instance. Also, event "change" is fired. 

If as=html, the response is inserted into the innerHTML of the fetch-for element, unless attribute shadow is present, in which case it will first create a shadowRoot, then insert the innerHTML.

fetch-for has no support for "href" or "as" properties, only attributes.

fetch-for caches get's based on the localName of the custom element as the base key of the cache. 

## Sending data to a target:

```html
<fetch-for 
    href=https://newton.now.sh/api/v2/integrate/x^2 
    target=json-viewer[-object]
    onerror=console.error(href)
>
</fetch-for>
...
<json-viewer -object></json-viewer>
```

fetch-for will set aria-busy to true while fetch is in progress, and also set aria-live=polite if no aria-live value is found.

## Specifying dependencies

Like the built-in Form and Output elements, fetch-for supports integrating input from peer elements (form elements, form associated elements, contenteditable elements) by [id](https://github.com/whatwg/html/issues/10143), name, itemprop, class and part.  We can also specify the event(s) to listen for:

```html
<other-stuff>
    <input name=greeting>
    <span itemprop=surname contenteditable></span>
    <div part=my-part contenteditable></div>
    <my-form-associated-custom-element></my-form-associated-custom-element>
</other-stuff>
<form itemscope>
    <section>
        <input id=isVegetarian type=checkbox switch>
        <input name=greeting>
        <span itemprop=surname contenteditable></span>
        <div part=my-part contenteditable></div>
        <my-form-associated-custom-element></my-form-associated-custom-element>
        <div itemscope>
            <fetch-for 
                href=https://newton.now.sh/api/v2/integrate/x^2 
                target=json-viewer[-object]
                onerror=console.error(href)
                for="#isVegetarian /myHostElementEventTargetSubObject @greeting! |surname %my-part ~my-form-associated-custom-element"
                oninput=...
                onchange
            >
            </fetch-for>
        </div>
    </section>
</form>
```

Be default, event "input" is used, and the value of the element is obtained by using "value" if value is in the element definition.  Only one other event is supported:  "change" - to specify that, add an exclamation at the end, as is done for @greeting.

Be default, @ is used within the closest "form" element, | within the closest itemscope.  All the others are searched within the root node by default.  This is problematic for surname, my-part, my-form-associated-custom-element due to the presence of elements with the same attribute values / names.

To specify the closest element to search within, use the ^ character:


```html
<other-stuff>
    <input name=greeting>
    <span itemprop=surname contenteditable></span>
    <div part=my-part contenteditable></div>
    <my-form-associated-custom-element></my-form-associated-custom-element>
</other-stuff>
<form itemscope>
    <section>
        <input id=isVegetarian type=checkbox switch>
        <input name=greeting>
        <span itemprop=surname contenteditable></span>
        <div part=my-part contenteditable></div>
        <my-form-associated-custom-element></my-form-associated-custom-element>
        <div itemscope>
            <fetch-for 
                href=https://newton.now.sh/api/v2/integrate/x^2 
                target=json-viewer[-object]
                onerror=console.error(href)
                for="#isVegetarian /myHostElementEventTargetSubObject @greeting! |surname^section %my-part^section ~my-form-associated-custom-element^section"
                oninput=...
                onchange
            >
            </fetch-for>
        </div>
    </section>
</form>
```





## Viewing Demos Locally

Any web server that can serve static files will do, but...

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.js.
4.  Open command window to folder where you cloned this repo.
5.  > npm install
6.  > npm run serve
7.  Open http://localhost:3030/demo/ in a modern browser.

<!--## Running Tests

```
> npm run test
```
-->
## Using from ESM Module:

```JavaScript
import 'fetch-for/fetch-for.js';
```

## Using from CDN:

```html
<script type=module crossorigin=anonymous>
    import 'https://esm.run/fetch-for';
</script>
```


