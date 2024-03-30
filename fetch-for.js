import { XE } from 'xtal-element/XE.js';
export class FetchFor extends HTMLElement {
    #abortController;
    async parseFor(self) {
        const { for: f, } = self;
        const split = f.split(' ').filter(x => !!x); // remove white spaces
        //const {findRealm} = await import('trans-render/lib/findRealm.js');
        //const {prsElO} = await import('trans-render/lib/prs/prsElO.js');
        const { parse } = await import('trans-render/dss/parse.js');
        const { find } = await import('trans-render/dss/find.js');
        const forRefs = new Map();
        for (const token of split) {
            const parsed = await parse(token);
            const { evt, prop } = parsed;
            //if(scope === undefined || prop === undefined) throw 'NI';
            const inputEl = await find(self, parsed);
            if (!(inputEl instanceof EventTarget))
                throw 404;
            forRefs.set(prop, [new WeakRef(inputEl), evt || 'input']);
        }
        return {
            forRefs
        };
    }
    #whenController;
    async initializeWhen(self) {
        const { when, nextWhenCount } = self;
        if (!when) {
            return {
                whenCount: nextWhenCount
            };
        }
        if (this.#whenController !== undefined)
            this.#whenController.abort();
        this.#whenController = new AbortController();
        const { parse } = await import('trans-render/dss/parse.js');
        const specifier = await parse(when);
        const { evt } = specifier;
        const { find } = await import('trans-render/dss/find.js');
        const srcEl = await find(self, specifier);
        if (!srcEl)
            throw 404;
        srcEl.addEventListener(evt || 'click', e => {
            self.whenCount = self.nextWhenCount;
        }, { signal: this.#whenController.signal });
    }
    async parseTarget(self) {
        const { target } = self;
        if (!target) {
            return {
                targetElO: undefined,
                targetSelf: true,
            };
        }
        const { parse } = await import('trans-render/dss/parse.js');
        const targetSpecifier = await parse(target);
        // const {prsElO} = await import('trans-render/lib/prs/prsElO.js');
        // const targetElO = prsElO(target);
        return {
            targetSelf: false,
            targetSpecifier
        };
    }
    async onForm(self) {
        const { form } = self;
        const { prsElO } = await import('trans-render/lib/prs/prsElO.js');
        return {
            formElO: prsElO(form)
        };
    }
    async onFormElO(self) {
        const { findRealm } = await import('trans-render/lib/findRealm.js');
        const { formElO } = self;
        const form = await findRealm(self, formElO.scope);
        if (!(form instanceof HTMLFormElement))
            throw 404;
        return {
            formData: new FormData(form),
            formRef: new WeakRef(form)
        };
    }
    #formAbortController;
    async onFormRef(self) {
        const { formData, formElO, formRef } = self;
        const form = formRef?.deref();
        if (!(form instanceof HTMLFormElement))
            throw 404;
        if (this.#formAbortController !== undefined) {
            this.#formAbortController.abort();
        }
        this.#formAbortController = new AbortController();
        form.addEventListener(formElO?.event || 'input', e => {
            if (!form.checkValidity())
                return;
            this.passForData(self, e.target);
        });
        if (form.checkValidity()) {
            this.doInitialLoad(self);
        }
    }
    async do(self) {
        try {
            self.nextWhenCount = self.whenCount + 1;
            const { href } = self;
            if (!self.validateOn()) {
                console.error('on* required');
                return;
            }
            const { noCache, as, stream } = self;
            const resolvedTarget = await self.resolveTarget(self);
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
                    await this.setTargetProp(self, resolvedTarget, data);
                    break;
                case 'html':
                    const { shadow } = this;
                    if (this.target) {
                        this.hidden = true;
                        await this.setTargetProp(self, resolvedTarget, data, shadow);
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
        if (this.#whenController !== undefined)
            this.#whenController.abort();
        if (this.#formAbortController !== undefined)
            this.#formAbortController.abort();
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
            self.whenCount = self.nextWhenCount;
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
        const { oninput } = self;
        if (oninput) {
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
        return this.onerror !== null || this.onload !== null || this.oninput !== null;
    }
    async setTargetProp(self, resolvedTarget, data, shadow) {
        if (!resolvedTarget)
            return;
        const { targetSpecifier } = self;
        if (targetSpecifier === undefined)
            return;
        const { prop } = targetSpecifier;
        if (prop === undefined)
            throw 'NI';
        console.log({ targetSpecifier });
        if (shadow !== undefined && prop === 'innerHTML') {
            let root = resolvedTarget.shadowRoot;
            if (root === null) {
                root = resolvedTarget.attachShadow({ mode: shadow });
            }
            root.innerHTML = data;
        }
        else {
            resolvedTarget[prop] = data;
        }
    }
    async resolveTarget(self) {
        const { targetSelf, targetSpecifier } = this;
        if (targetSelf)
            return null;
        //if(targetElO?.scope === undefined) throw 'NI';
        const { find } = await import('trans-render/dss/find.js');
        return await find(self, targetSpecifier);
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
            targetSelf: false,
            whenCount: 0,
            nextWhenCount: 1,
            when: '',
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
            form: {
                type: 'String'
            },
            targetSpecifier: {
                type: 'Object'
            },
            target: {
                type: 'String'
            },
        },
        actions: {
            initializeWhen: {
                ifAllOf: ['isAttrParsed'],
                ifKeyIn: ['when']
            },
            do: {
                ifAllOf: ['isAttrParsed', 'href'],
                ifAtLeastOneOf: ['targetSpecifier', 'targetSelf'],
                ifEquals: ['whenCount', 'nextWhenCount']
            },
            parseTarget: {
                ifAllOf: ['isAttrParsed'],
                ifKeyIn: ['target']
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
            },
            onForm: {
                ifAllOf: ['isAttrParsed', 'form'],
            },
            onFormElO: {
                ifAllOf: ['isAttrParsed', 'formElO']
            },
            onFormRef: {
                ifAllOf: ['isAttrParsed', 'formRef']
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
