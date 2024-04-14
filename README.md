# fetch-for [WIP]

[![NPM version](https://badge.fury.io/js/fetch-for.png)](http://badge.fury.io/js/fetch-for)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/fetch-for?style=for-the-badge)](https://bundlephobia.com/result?p=fetch-for)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/fetch-for?compression=gzip">
<!--[![Playwright Tests](https://github.com/bahrus/fetch-for/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/fetch-for/actions/workflows/CI.yml)-->

## [API Documentation](https://cf-sw.bahrus.workers.dev/?href=https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Ffetch-for%2Fcustom-elements.json&stylesheet=https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fwc-info%2Fsimple-ce-style.css&embedded=false&tags=&ts=2024-04-14T00%3A43%3A06.732Z&tocXSLT=https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fwc-info%2Ftoc.xsl)

## [Demo](https://jsfiddle.net/bahrus/ma0vtbnx/1/)

fetch-for is a small-ish, bare-bones simple fetch web component.  

Like [*k-fetch*](https://github.com/bahrus/k-fetch), *fetch-for* can act as a base web component for "web components as a service".  [be-fetching](https://github.com/bahrus/be-fetching) [TODO] actually does just that - it can dynamically create such a web component on the fly, declaratively, that extends this base class.

## Example 1 -- Simple html include

Markup:

```html
<fetch-for 
href=https://cors-anywhere.herokuapp.com/https://www.theonion.com/ 
as=html shadow=open onerror="console.error(href)"></fetch-for>
    
```

For this very specific example shown above, due to restrictions of the cors-anywhere utility the link above uses, you will first need to go to https://cors-anywhere.herokuapp.com/corsdemo to unlock the service for a limited amount of time.

Required attributes/properties are href and at least one of these attributes/properties being set: onerror, oninput, onload.  The reason for insisting on at least one of these on* attributes/properties is this:  Since these attributes can't pass through any decent sanitizer that prevents xss attacks, the presence of one or more of them indicates that the web site trusts the content from which the data is being retrieved.

At the risk of getting ahead of ourselves, I want to summarize what this is doing.  Plenty of examples that follow will illustrate  what I mean:  

When the fetch is complete, event "load" is fired (exception -- if stream is enabled, that is not the case), which can allow for manipulation of the data.  The (modified) data is then stored in the "value" field of the fetch-for (or subclassed) instance. 

If as=html, the response is inserted into the innerHTML of the fetch-for element, unless attribute shadow is present, in which case it will first attach a shadowRoot, then insert the innerHTML.

fetch-for automatically caches, in memory, "get's", not POSTS or other HTTP methods, based on the localName of the custom element as the base key of the cache, and of course on the exact string of the href property. To disable this feature, specify attribute/property: no-cache/noCache

## Example 2 - Stream HTML to a target

```html
<fetch-for
    stream
    href=https://html.spec.whatwg.org/ 
    as=html shadow=open
    target=#target
    onerror="console.error(event.message, href)">
</fetch-for>
<div id=target></div>
    
```

## Example 3 - Sending data to a target:

```html
<fetch-for 
    href=https://newton.now.sh/api/v2/integrate/x^2 
    target=-object
    onerror=console.error(href)
>
</fetch-for>
...
<json-viewer -object></json-viewer>
```

fetch-for passes the results of the fetch to camel cased property obtained from the attribute marker, i.e. it will set:

```JavaScript
oJsonViewer.object = ...
```

What this example illustrates is that the target attribute is *not* using simple css selectors to find the target.  Rather it is using a custom syntax that is optimized for creating linkages between elements of peer elements, and/or between elements and its custom element host container.

It uses a custom syntax for describing, as concisely as possible and optimized for common scenarios, how to search for a nearby element, and also what event to respond to if applicable.  This syntax is referred to as "directed scoping specifiers" (DSS).

## Specifying dependencies

Like the built-in Form and Output elements, fetch-for supports integrating input from peer elements (form elements, form associated elements, contenteditable elements) by [id](https://github.com/whatwg/html/issues/10143), name, itemprop, class and part.  This also uses "directed scoped specifier" syntax (or DSS). We can formulate the href to use for the fetch request:

## Specify dynamic href in oninput event

```html
<input name=op value=integrate>
<input name=expr value=x^2>
<fetch-for
    for="@op::change @expr"
    oninput="event.href=`https://newton.now.sh/api/v2/${event.forData.op.value}/${event.forData.expr.value}`"
    target=-object
    onerror=console.error(href)
>
</fetch-for>
...
<json-viewer -object></json-viewer>
```

By default, oninput will be called on the *input* event of the element being observed.  But this can be overridden by specifying the name of the event after two colons (::) as shown above.

## Block fetch without user interaction

```html
<button type=button name=submit>Submit</button>
<fetch-for when=@submit::click></fetch-for>
```

The click event is assumed if not specified.

## Progressively routing the form element

```html
<form name=newtonService>
    <input name=op value=integrate>
    <input name=expr value=x^2>
    <noscript>
        <button name=submit>Submit</button>
    </noscript>
    
</form>

<fetch-for
    form="@newtonService"
    oninput="event.href=`https://newton.now.sh/api/v2/${formData.get('op')}/${formData.get('expr')}`"
    target=-object
    onerror=console.error(href)
>
</fetch-for>
...
<json-viewer -object></json-viewer>
```

Only submits when the form is valid

## Showcasing all the bells and whistles [TODO]

```html
<other-stuff>
    <input name=greeting>
    <span itemprop=surname contenteditable></span>
    <div part=myPart contenteditable></div>
    <my-form-associated-custom-element></my-form-associated-custom-element>
</other-stuff>
<form itemscope>
    <section>
        <input id=isVegetarian type=checkbox switch>
        <sl-input></sl-input>
        <input name=greeting>
        <span itemprop=surname contenteditable></span>
        <div part=myPart contenteditable></div>
        <my-form-associated-custom-element></my-form-associated-custom-element>
        <div itemscope>
            <fetch-for 
                href=https://newton.now.sh/api/v2/integrate/x^2 
                target=json-viewer[-object]
                onerror=console.error(href)
                for="#isVegetarian /myHostElementEventTargetSubObject @greeting! |surname %myPart ~myFormAssociatedCustomElement ~sl-input::sl-input"
                oninput=...
            >
            </fetch-for>
        </div>
    </section>
</form>
```


To specify the closest element to search within, use the ^ character:


```html
<other-stuff>
    <input name=greeting>
    <span itemprop=surname contenteditable></span>
    <div part=myPart contenteditable></div>
    <my-form-associated-custom-element></my-form-associated-custom-element>
</other-stuff>
<form itemscope>
    <section>
        <input id=isVegetarian type=checkbox switch>
        <input name=greeting>
        <span itemprop=surname contenteditable></span>
        <div part=myPart contenteditable></div>
        <my-form-associated-custom-element></my-form-associated-custom-element>
        <div itemscope>
            <fetch-for 
                href=https://newton.now.sh/api/v2/integrate/x^2 
                target=-object
                onerror=console.error(href)
                for="#isVegetarian /myHostElementEventTargetSubObject @greeting! ^section|surname ^section%myPart ^section~myFormAssociatedCustomElement"
                oninput=...
                
            >
            </fetch-for>
        </div>
    </section>
</form>
```

## Progressively routing the hyperlink [TODO]

This may be an invalid use case, better handled with the Navigation api, this might just get in the way of that.

```html
<div>I don't care if <a itemprop=monday href="https://example.org/Monday">Monday</a>'s blue</div>
<div>
    <a itemprop=tuesday href=https://example.org/Tuesday>Tuesday</a>'s gray and 
    <a itemprop=wednesday href=https://example.org/Wednsday>Wednesday</a> too.
    
</div>
<div><a itemprop=thursday href=https://example.org/Thursday>Thursday</a> I don't care about you</div>
<div>It's <a itemprop=friday href=https://example.org/Friday>Friday</a> I'm in love</div>

...

<fetch-for
    for="|monday::click |tuesday::click |wednesday::click |thursday::click |friday::click"
    prevent-default
    once
    stream
    as=html
    oninput="
        const dayOfWeek = event.trigger.getAttribute('itemprop');
        event.target = `${dayOfWeek}-tab`;
        event.href = event.trigger.href;
        querySelector('my-tabs').selectedTab = event.target;
    "
></fetch-for>

<my-tabs>
    <monday-tab></monday-tab>
    <tuesday-tab></tuesday-tab>
    <wednesday-tab></wednesday-tab>
    <thursday-tab></thursday-tab>
    <friday-tab></friday-tab>
</my-tabs>
```

This will create a separate fetch-for tag (or whatever the superclass localName is) with the actual href.  This instance won't actually do the fetching.



## Specify location of cache [TODO]

We can specify to cache the results of the fetch in indexeddb instead of in the more expensive RAM:

```html
<fetch-for cache-to=indexedDB store-name=myStore></fetch-for>
```


## Filtering the data [TODO]

Ideally, to [utilize the platform most effectively](https://dassur.ma/things/react-redux-comlink/), and serve the user better, this component would integrate with a service worker, which could:

1.  Do the fetch, 
2.  Parse the results, 
3.  Cache the parsed full results in indexedDB, 
4.  Filter the full results in the service worker.
5.  Store the filtered results, also in indexedDB, in another location.
6.  Return a key identifier to indexDB, rather than the object.

Since, to my knowledge, there isn't a standard for doing this, or even a widely used library that follows this pattern, we are opting not to make this web component tightly coupled to such a service worker.  Instead, the focus is on making sure this component provides all the support that is needed to make such a solution work with a minimum of fuss.

Being that this class is specifically intended to be extended, we could certainly envision such a sub-classing web component adopting some sort of convention to do exactly what is described above, in partnership with an associated service worker.

The way I could see that working is if this web component added an http header in the request, which the service worker watches for, and acts accordingly when it encounters the header, removing the header before it passes through to the final end point.

Then the service worker could add a special header in the response indicating where to find the results in indexedDB.

This web component already does support headers, but perhaps some better visibility could be added for this functionality.

## Filtering with the onload event

However, for the less ambitious, the way we can do filtering or other manipulation of the results in the main thread is via the onload event:

```html
<input name=op value=integrate>
<input name=expr value=x^2>
<fetch-for
    for="@op @expr"
    oninput="event.href=`https://newton.now.sh/api/v2/${event.forData.op.value}/${event.forData.expr.value}`"
    onload="
        console.log(event);
        event.data.iah = true;
    "
    target=json-viewer[-object]
    onerror=console.error(href)
>
</fetch-for>
...
<json-viewer -object></json-viewer>
```

## Connecting to indexed db in the filter code [TODO]

*fetch-for* provides easy access to indexed db in the onload event, via the popular [idb-keyval](https://www.npmjs.com/package/idb-keyval) package.  This would help significantly with achieving the goals set out earlier of integrating fetch-for with a smart service worker.

To opt-in (which imposes a small cost due to needing to load the library first):

```html
<fetch-for use-idb
    onload="
    event.idb.set('hello', 'world')
        .then(() => console.log('It worked!'))
        .catch((err) => console.log('It failed!', err));
    "
></fetch-for>
```

> [!NOTE]
> This package uses the built-in support for oninput and onload.  It allows the browser to parse the JS, and simply dispatches events "load" and "input" to integrate with the custom code.  One current limitation is that the code inside doesn't assume it is asynchronous.  It is possible to wrap the code in an async IIFE block to achieve this, which could be worth while for particularly complex manipulations.

## Alternatives

For fewer features, but a smaller foot print, consider using [https://github.com/k-fetch].  What k-fetch lacks which this component adopts is form-like support.

 For more features (but larger footprint), see [xtal-fetch](https://www.npmjs.com/package/xtal-fetch), that is in serious need for an update [TODO]. 

fetch-for hopes to be "just the right amount" of size for many purposes. It *may* provide support for streaming HTML.  If not, or for other scenarios where it might work better, see alternatives that focus on that scenario, such as [be-written](https://github.com/bahrus/be-written).

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


