import { O } from 'trans-render/froop/O.js';
export class FetchFor extends O {
    static config = {
        name: 'fetch-for',
        propDefaults: {
            credentials: 'omit',
            method: 'GET',
            as: 'json',
            noCache: false,
            stream: false,
            targetSelf: false,
            whenCount: 0,
            nextWhenCount: 1,
            target: '',
            when: '',
        },
        propInfo: {
            for: {
                type: 'String',
                parse: true,
                attrName: 'for',
            },
            forRefs: {
                type: 'Object',
                ro: true,
            },
            form: {
                type: 'String',
                parse: true,
                attrName: 'form'
            },
            formData: {
                type: 'Object',
                ro: true,
            },
            formRef: {
                type: 'Object',
                ro: true,
            },
            formSpecifier: {
                type: 'String',
                ro: true,
            },
            href: {
                type: 'String',
                parse: true,
                attrName: 'href'
            },
            shadow: {
                type: 'String',
            },
            targetSpecifier: {
                type: 'Object'
            },
            target: {
                type: 'String',
                parse: true,
                attrName: 'target'
            },
            when: {
                type: 'String',
                parse: true,
                attrName: 'when'
            }
        },
        actions: {
            initializeWhen: {
                ifKeyIn: ['when']
            },
            do: {
                ifAllOf: ['href'],
                ifAtLeastOneOf: ['targetSpecifier', 'targetSelf'],
                ifEquals: ['whenCount', 'nextWhenCount']
            },
            parseTarget: {
                ifKeyIn: ['target']
            },
            parseFor: {
                ifAllOf: ['for'],
                ifAtLeastOneOf: ['oninput', 'onselect'],
            },
            listenForInput: {
                ifAllOf: ['forRefs', 'oninput']
            },
            doInitialLoad: {
                ifAllOf: ['forRefs'],
                ifAtLeastOneOf: ['oninput', 'onselect'],
            },
            onForm: {
                ifAllOf: ['form'],
            },
            onFormSpecifier: {
                ifAllOf: ['formSpecifier']
            },
            onFormRef: {
                ifAllOf: ['formRef']
            }
        }
    };
    #abortController;
    #abortControllers = [];
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
    disconnectedCallback() {
        super.disconnectedCallback();
        for (const ac of this.#abortControllers) {
            ac.abort();
        }
        if (this.#whenController !== undefined)
            this.#whenController.abort();
        if (this.#formAbortController !== undefined)
            this.#formAbortController.abort();
    }
    async do(self) {
        try {
            const { whenCount } = self;
            super.covertAssignment({
                nextWhenCount: whenCount + 1
            });
            if (!self.validateOn()) {
                console.error('on* required');
                return;
            }
            const { noCache, as, stream, href } = self;
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
    async doInitialLoad(self) {
        const { oninput } = self;
        if (oninput) {
            self.passForData(self, self);
        }
        return {};
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
    #formAbortController;
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
    async onForm(self) {
        const { form } = self;
        const { parse } = await import('trans-render/dss/parse.js');
        return {
            formSpecifier: await parse(form)
        };
    }
    async onFormRef(self) {
        const { formData, formSpecifier, formRef } = self;
        const form = formRef?.deref();
        if (!(form instanceof HTMLFormElement))
            throw 404;
        if (this.#formAbortController !== undefined) {
            this.#formAbortController.abort();
        }
        this.#formAbortController = new AbortController();
        form.addEventListener(formSpecifier?.evt || 'input', e => {
            if (!form.checkValidity())
                return;
            this.passForData(self, e.target);
        });
        if (form.checkValidity()) {
            this.doInitialLoad(self);
        }
    }
    async onFormSpecifier(self) {
        const { find } = await import('trans-render/dss/find.js');
        const { formSpecifier } = self;
        const form = await find(self, formSpecifier);
        if (!(form instanceof HTMLFormElement))
            throw 404;
        return {
            formData: new FormData(form),
            formRef: new WeakRef(form)
        };
    }
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
    async parseTarget(self) {
        const { target } = self;
        if (!target) {
            return {
                targetSelf: true,
            };
        }
        const { parse } = await import('trans-render/dss/parse.js');
        const targetSpecifier = await parse(target);
        return {
            targetSelf: false,
            targetSpecifier
        };
    }
    async passForData(self, trigger) {
        const forData = this.#forData(self);
        for (const key in forData) {
            const otherInputEl = forData[key];
            if (otherInputEl.checkValidity && !otherInputEl.checkValidity())
                return;
        }
        const eventForFetch = new InputEvent(forData, trigger);
        const form = self.formRef?.deref();
        if (form !== undefined) {
            this.covertAssignment({
                formData: new FormData(form)
            });
            //self.formData = new FormData(form);
        }
        self.dispatchEvent(eventForFetch);
        if (eventForFetch.href) {
            self.href = eventForFetch.href;
            if (!self.when) {
                self.whenCount = self.nextWhenCount;
            }
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
    async setTargetProp(self, resolvedTarget, data, shadow) {
        if (!resolvedTarget)
            return;
        const { targetSpecifier } = self;
        if (targetSpecifier === undefined)
            return;
        const { prop } = targetSpecifier;
        if (prop === undefined)
            throw 'NI';
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
    validateResp(resp) {
        return true;
    }
    validateOn() {
        return this.onerror !== null || this.onload !== null || this.oninput !== null;
    }
    #whenController;
}
const cache = new Map();
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
