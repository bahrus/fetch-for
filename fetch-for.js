import { XE } from 'xtal-element/XE.js';
export class FetchFor extends HTMLElement {
    #abortController;
    async parseFor(self) {
        const { for: f, } = self;
        const split = f.split(' ').filter(x => !!x); // remove white spces
        const { findRealm } = await import('trans-render/lib/findRealm.js');
        const { prsElO } = await import('trans-render/lib/prs/prsElO.js');
        const forRefs = new Map();
        for (const token of split) {
            const parsed = prsElO(token);
            let inputEl;
            const { elType, prop, event } = parsed;
            if (prop === undefined)
                throw 'NI';
            switch (elType) {
                case '@':
                    inputEl = await findRealm(self, ['wf', prop]);
                    break;
                default:
                    throw 'NI';
            }
            if (!(inputEl instanceof HTMLElement))
                throw 404;
            forRefs.set(prop, [new WeakRef(inputEl), event || 'input']);
        }
        return {
            forRefs
        };
    }
    async do(self) {
        try {
            const { href } = self;
            if (!this.validateOn()) {
                console.error('on* required');
                return;
            }
            const { resolvedTarget, noCache, as, stream } = self;
            if (resolvedTarget && resolvedTarget.ariaLive === null)
                resolvedTarget.ariaLive = 'polite';
            let data;
            if (!noCache) {
                data = cache.get(this.localName)?.get(href);
            }
            if (data === undefined) {
                if (resolvedTarget) {
                    resolvedTarget.ariaBusy = 'true';
                }
                if (this.#abortController !== undefined) {
                    this.#abortController.abort();
                    this.#abortController = new AbortController();
                }
                this.#abortController = new AbortController();
                this.init.signal = this.#abortController?.signal;
                if (as === 'html' && stream) {
                    const { streamOrator } = await import('stream-orator/StreamOrator.js');
                    const { target } = self;
                    const targetEl = this.getRootNode().querySelector(target);
                    streamOrator(href, this.init, targetEl);
                    return;
                }
                const resp = await fetch(href, this.init);
                if (!this.validateResp(resp)) {
                    throw [resp.statusText, resp.status];
                }
                ;
                //TODO - validate
                switch (as) {
                    case 'text':
                    case 'html':
                        data = await resp.text();
                        break;
                    case 'json':
                        data = await resp.json();
                        break;
                }
                const loadEvent = new LoadEvent(data);
                this.dispatchEvent(loadEvent);
                data = loadEvent.data;
                if (!noCache && !cache.has(this.localName)) {
                    cache.set(this.localName, new Map());
                }
                //TODO increment ariaBusy / decrement in case other components are affecting
                if (resolvedTarget)
                    resolvedTarget.ariaBusy = 'false';
            }
            switch (as) {
                case 'text':
                case 'json':
                    this.hidden = true;
                    this.value = data;
                    this.dispatchEvent(new Event('change'));
                    await this.setTargetProp(resolvedTarget, data);
                    break;
                case 'html':
                    const { shadow } = this;
                    if (this.target) {
                        this.hidden = true;
                        await this.setTargetProp(resolvedTarget, data, shadow);
                    }
                    else {
                        const target = this.target || this;
                        let root = this;
                        if (shadow !== undefined) {
                            if (this.shadowRoot === null)
                                this.attachShadow({ mode: shadow });
                            root = this.shadowRoot;
                        }
                        root.innerHTML = data;
                    }
                    break;
            }
        }
        catch (e) {
            const err = e;
            this.dispatchEvent(new ErrorEvent('error', err));
        }
    }
    get init() {
        return {
            method: this.method,
            headers: {
                'Accept': this.accept,
            },
            credentials: this.credentials,
            body: typeof this.body === 'object' ? JSON.stringify(this.body) : this.body,
        };
    }
    #forData(self) {
        const { forRefs } = self;
        const returnObj = {};
        if (forRefs === undefined)
            return returnObj;
        for (const [key, value] of forRefs.entries()) {
            const [forRef, eventName] = value;
            const inputEl = forRef.deref();
            if (inputEl === undefined) {
                forRefs.delete(key);
                continue;
            }
            returnObj[key] = inputEl;
        }
        return returnObj;
    }
    #abortControllers = [];
    disconnectedCallback() {
        for (const ac of this.#abortControllers) {
            ac.abort();
        }
    }
    async passForData(self, trigger) {
        const forData = this.#forData(self);
        for (const key in forData) {
            const otherInputEl = forData[key];
            if (otherInputEl.checkValidity && !otherInputEl.checkValidity())
                return;
        }
        const eventForFetch = new InputEvent(forData, trigger);
        self.dispatchEvent(eventForFetch);
        if (eventForFetch.href) {
            self.href = eventForFetch.href;
        }
    }
    async listenForX(self) {
        const { forRefs } = self;
        for (const [key, value] of forRefs.entries()) {
            const [forRef, eventName] = value;
            const inputEl = forRef.deref();
            const ac = new AbortController();
            inputEl.addEventListener(eventName, async (e) => {
                const inputEl = e.target;
                if (inputEl.checkValidity && !inputEl.checkValidity())
                    return;
                await self.passForData(self, inputEl);
            }, { signal: ac.signal });
            this.#abortControllers.push(ac);
        }
    }
    async listenForInput(self) {
        await self.listenForX(self);
        return {};
    }
    async doInitialLoad(self) {
        const { oninput, onselect } = self;
        if (oninput) {
            self.passForData(self, self);
        }
        else if (onselect) {
            self.passForData(self, self);
        }
        return {};
    }
    get accept() {
        if (this.hasAttribute('accept'))
            return this.getAttribute('accept');
        const as = this.as;
        let defaultVal = 'application/json';
        switch (as) {
            case 'html':
                defaultVal = 'text/html';
        }
        return defaultVal;
    }
    validateResp(resp) {
        return true;
    }
    validateOn() {
        return this.onerror !== null || this.onload !== null || this.oninput !== null || this.onchange !== null;
    }
    async setTargetProp(resolvedTarget, data, shadow) {
        if (!resolvedTarget)
            return;
        const { target } = this;
        if (target === undefined)
            return;
        const lastPos = target.lastIndexOf('[');
        if (lastPos === -1)
            throw 'NI'; //Not implemented
        const rawPath = target.substring(lastPos + 2, target.length - 1);
        const { lispToCamel } = await import('trans-render/lib/lispToCamel.js');
        const propPath = lispToCamel(rawPath);
        if (shadow !== undefined && propPath === 'innerHTML') {
            let root = resolvedTarget.shadowRoot;
            if (root === null) {
                root = resolvedTarget.attachShadow({ mode: shadow });
            }
            root.innerHTML = data;
        }
        else {
            resolvedTarget[propPath] = data;
        }
    }
    get resolvedTarget() {
        const { target } = this;
        if (!target)
            return null;
        return this.getRootNode().querySelector(target);
    }
}
const cache = new Map();
const xe = new XE({
    config: {
        tagName: 'fetch-for',
        propDefaults: {
            credentials: 'omit',
            method: 'GET',
            as: 'json',
            noCache: false,
            stream: false,
        },
        propInfo: {
            href: {
                type: 'String',
            },
            shadow: {
                type: 'String',
            },
            for: {
                type: 'String',
            },
            target: {
                type: 'String',
            }
        },
        actions: {
            do: {
                ifAllOf: ['isAttrParsed', 'href']
            },
            parseFor: {
                ifAllOf: ['isAttrParsed', 'for'],
                ifAtLeastOneOf: ['oninput', 'onselect']
            },
            listenForInput: {
                ifAllOf: ['isAttrParsed', 'forRefs', 'oninput']
            },
            doInitialLoad: {
                ifAllOf: ['isAttrParsed', 'forRefs'],
                ifAtLeastOneOf: ['oninput', 'onselect'],
            }
        }
    },
    superclass: FetchFor
});
export class LoadEvent extends Event {
    data;
    static EventName = 'load';
    constructor(data) {
        super(LoadEvent.EventName);
        this.data = data;
    }
}
export class InputEvent extends Event {
    forData;
    trigger;
    static EventName = 'input';
    constructor(forData, trigger) {
        super(InputEvent.EventName);
        this.forData = forData;
        this.trigger = trigger;
    }
}
