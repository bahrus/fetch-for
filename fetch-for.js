import { XE } from 'xtal-element/XE.js';
export class FetchFor extends HTMLElement {
    #abortController;
    async parseFor(self) {
        const { for: f, } = self;
        const split = f.split(' ');
        const { findRealm } = await import('trans-render/lib/findRealm.js');
        const forRefs = new Map();
        for (const token of split) {
            const headChar = token[0];
            const tailStr = token.substring(1);
            let inputEl;
            switch (headChar) {
                case '@':
                    inputEl = await findRealm(self, ['wf', tailStr]);
                    break;
                default:
                    throw 'NI';
            }
            if (!(inputEl instanceof HTMLElement))
                throw 404;
            forRefs.set(tailStr, new WeakRef(inputEl));
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
            const { target, noCache } = self;
            if (target && target.ariaLive === null)
                target.ariaLive = 'polite';
            let data;
            if (!noCache) {
                data = cache.get(this.localName)?.get(href);
            }
            const as = this.as;
            if (data === undefined) {
                if (target) {
                    target.ariaBusy = 'true';
                }
                if (this.#abortController !== undefined) {
                    this.#abortController.abort();
                    this.#abortController = new AbortController();
                }
                this.#abortController = new AbortController();
                this.init.signal = this.#abortController?.signal;
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
                if (target)
                    target.ariaBusy = 'false';
            }
            switch (as) {
                case 'text':
                case 'json':
                    this.hidden = true;
                    this.value = data;
                    this.dispatchEvent(new Event('change'));
                    await this.setTargetProp(target, data);
                    break;
                case 'html':
                    const { shadow } = this;
                    if (this.target) {
                        this.hidden = true;
                        await this.setTargetProp(target, data, shadow);
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
            const inputEl = value.deref();
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
    async passForData(self, eventType) {
        const forData = this.#forData(self);
        for (const key in forData) {
            const otherInputEl = forData[key];
            if (otherInputEl.checkValidity && !otherInputEl.checkValidity())
                return;
        }
        let eventForFetch;
        switch (eventType) {
            case 'change':
                eventForFetch = new ChangeEvent(forData);
                break;
            case 'input':
                eventForFetch = new InputEvent(forData);
                break;
        }
        self.dispatchEvent(eventForFetch);
        if (eventForFetch.href) {
            self.href = eventForFetch.href;
        }
    }
    async listenForX(self, eventType) {
        const { forRefs } = self;
        for (const [key, value] of forRefs.entries()) {
            const inputEl = value.deref();
            const ac = new AbortController();
            inputEl.addEventListener(eventType, async (e) => {
                const inputEl = e.target;
                if (inputEl.checkValidity && !inputEl.checkValidity())
                    return;
                await self.passForData(self, eventType);
            }, { signal: ac.signal });
            this.#abortControllers.push(ac);
        }
    }
    async listenForInput(self) {
        await self.listenForX(self, 'input');
        return {};
    }
    async listenForChange(self) {
        await self.listenForX(self, 'input');
        return {};
    }
    async doInitialLoad(self) {
        const { oninput, onchange } = self;
        if (oninput) {
            self.passForData(self, 'input');
        }
        else if (onchange) {
            self.passForData(self, 'change');
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
    async setTargetProp(target, data, shadow) {
        if (!target)
            return;
        const { targetSelector } = this;
        if (targetSelector === undefined)
            return;
        const lastPos = targetSelector.lastIndexOf('[');
        if (lastPos === -1)
            throw 'NI'; //Not implemented
        const rawPath = targetSelector.substring(lastPos + 2, targetSelector.length - 1);
        const { lispToCamel } = await import('trans-render/lib/lispToCamel.js');
        const propPath = lispToCamel(rawPath);
        if (shadow !== undefined && propPath === 'innerHTML') {
            let root = target.shadowRoot;
            if (root === null) {
                root = target.attachShadow({ mode: shadow });
            }
            root.innerHTML = data;
        }
        else {
            target[propPath] = data;
        }
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
            }
        },
        actions: {
            do: {
                ifAllOf: ['isAttrParsed', 'href']
            },
            parseFor: {
                ifAllOf: ['isAttrParsed', 'for'],
                ifAtLeastOneOf: ['oninput', 'onchange']
            },
            listenForInput: {
                ifAllOf: ['isAttrParsed', 'forRefs', 'oninput']
            },
            listenForChange: {
                ifAllOf: ['isAttrParsed', 'forRefs', 'onchange']
            },
            doInitialLoad: {
                ifAllOf: ['isAttrParsed', 'forRefs'],
                ifAtLeastOneOf: ['oninput', 'onchange', 'onload'],
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
    static EventName = 'input';
    constructor(forData) {
        super(InputEvent.EventName);
        this.forData = forData;
    }
}
export class ChangeEvent extends Event {
    forData;
    static EventName = 'change';
    constructor(forData) {
        super(ChangeEvent.EventName);
        this.forData = forData;
    }
}
