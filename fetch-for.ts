import {
    Actions, Methods, AllProps, loadEventName, ProPP, PP,
    ForData, EventForFetch, inputEventName, EventName
} from './types';
import {XE, ActionOnEventConfigs} from 'xtal-element/XE.js';

export class FetchFor extends HTMLElement implements Actions, Methods{
    
    #abortController: AbortController | undefined;

    async parseFor(self: this){
        const {for: f, } = self;
        const split = f!.split(' ').filter(x => !!x); // remove white spaces
        const {findRealm} = await import('trans-render/lib/findRealm.js');
        const {prsElO} = await import('trans-render/lib/prs/prsElO.js');
        const forRefs: Map<string, [WeakRef<HTMLInputElement>, EventName]> = new Map();
        for(const token of split){
            const parsed = prsElO(token);
            const {elType, prop, event, scope} = parsed;
            if(scope === undefined || prop === undefined) throw 'NI';
            const inputEl = await findRealm(self, scope);
            if(!(inputEl instanceof EventTarget)) throw 404;
            forRefs.set(prop, [new WeakRef(inputEl as HTMLInputElement), event || 'input']);
        }
        return {
            forRefs
        };
    }

    #whenController: AbortController | undefined;
    async initializeWhen(self: this){
        const {when, nextWhenCount} = self;
        if(!when){
            return {
                whenCount: nextWhenCount
            } as PP
        }
        if(this.#whenController !== undefined) this.#whenController.abort();
        this.#whenController = new AbortController();
        const {prsElO} = await import('trans-render/lib/prs/prsElO.js');
        const elo = prsElO(when);
        const {event, scope} = elo;
        if(scope === undefined) throw 'NI';
        const {findRealm} = await import('trans-render/lib/findRealm.js');
        const srcEl = await findRealm(self, scope);
        if(!srcEl) throw 404;
        srcEl.addEventListener(event || 'click', e => {
            self.whenCount = self.nextWhenCount;
        }, {signal: this.#whenController.signal});
    }

    async parseTarget(self: this){
        const {target} = self;
        if(!target){
            return {
                targetElO: undefined,
                targetSelf: true,
            } as PP
        }
        const {prsElO} = await import('trans-render/lib/prs/prsElO.js');
        const targetElO = prsElO(target);
        return {
            targetSelf: false,
            targetElO    
        } as PP;
    }

    async onForm(self: this): ProPP {
        const {form} = self;
        const {prsElO} = await import('trans-render/lib/prs/prsElO.js');
        return {
            formElO: prsElO(form!)
        }
    }

    async onFormElO(self: this): ProPP {
        const {findRealm} = await import('trans-render/lib/findRealm.js');
        const {formElO} = self;
        const form = await findRealm(self, formElO!.scope!);
        if(!(form instanceof HTMLFormElement)) throw 404;
        return {
            formData: new FormData(form),
            formRef: new WeakRef(form)
        }
    }
    #formAbortController : AbortController | undefined;
    async onFormRef(self: this){
        const {formData, formElO, formRef} = self;
        const form = formRef?.deref();
        if(!(form instanceof HTMLFormElement)) throw 404;
        if(this.#formAbortController !== undefined){
            this.#formAbortController.abort();
        }
        this.#formAbortController = new AbortController();
        form.addEventListener(formElO?.event || 'input', e => {
            if(!form.checkValidity()) return;
            this.passForData(self, e.target as HTMLFormElement);
        })
        if(form.checkValidity()){
            this.doInitialLoad(self);
        }
    }

    async do(self: this){
        try{
            self.nextWhenCount = self.whenCount! + 1;
            const {href} = self;
            if(!self.validateOn()) {
                console.error('on* required');
                return;
            }
            const {noCache, as, stream} = self;
            const resolvedTarget = await self.resolveTarget(self);
            if(resolvedTarget && resolvedTarget.ariaLive === null) resolvedTarget.ariaLive = 'polite';
            let data: any;
            if(!noCache) {
                data = cache.get(this.localName)?.get(href!);
            } 
            if(data === undefined){
                if(resolvedTarget){
                    resolvedTarget.ariaBusy = 'true';
                }
                if(this.#abortController !== undefined){
                    this.#abortController.abort();
                    this.#abortController = new AbortController();
                }
                this.#abortController = new AbortController();
                this.init.signal = this.#abortController?.signal;
                if(as === 'html' && stream){
                    const {streamOrator} = await import('stream-orator/StreamOrator.js');
                    const {target} = self;
                    const targetEl = (this.getRootNode() as DocumentFragment).querySelector(target!) as HTMLElement;
                    streamOrator(href!, this.init, targetEl);
                    return;
                }
                const resp = await fetch(href!, this.init);
                if(!this.validateResp(resp)) {
                    throw [resp.statusText, resp.status]
                };
                //TODO - validate
                switch(as){
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
                if(!noCache && !cache.has(this.localName)){
                    cache.set(this.localName, new Map());
                }
                //TODO increment ariaBusy / decrement in case other components are affecting
                if(resolvedTarget) resolvedTarget.ariaBusy = 'false';
            }
            
            switch(as){
                case 'text':
                case 'json':
                    this.hidden = true;
                    this.value = data;
                    this.dispatchEvent(new Event('change'));
                    await this.setTargetProp(self, resolvedTarget, data);
                    break;
                case 'html':
                    const {shadow} = this;
                    if(this.target){
                        this.hidden = true;
                        await this.setTargetProp(self, resolvedTarget, data, shadow);
                    }else{
                        const target = this.target || this;
                        let root : Element | ShadowRoot = this;
                        if(shadow !== undefined){
                            if(this.shadowRoot === null) this.attachShadow({mode: shadow});
                            root = this.shadowRoot!;
                        }
                        root.innerHTML = data;
                    }

                    break;
            }
        }catch(e){
            const err = e as Error
            this.dispatchEvent(new ErrorEvent('error', err));
        }
    }

    get init(){
        return {
            method: this.method,
            headers: {
                'Accept': this.accept,
            },
            credentials: this.credentials,
            body: typeof this.body === 'object' ? JSON.stringify(this.body) : this.body,
        } as RequestInit;
    }
    #forData(self: this): ForData{
        const {forRefs} = self;
        const returnObj: ForData = {};
        if(forRefs === undefined) return returnObj;
        for(const [key, value] of forRefs.entries()){
            const [forRef, eventName] = value;
            const inputEl = forRef.deref();
            if(inputEl === undefined){
                forRefs.delete(key);
                continue;
            }
            returnObj[key] = inputEl as HTMLInputElement;
        }
        return returnObj;
    }
    #abortControllers: Array<AbortController> = [];


    disconnectedCallback(){
        for(const ac of this.#abortControllers){
            ac.abort();
        }
        if(this.#whenController !== undefined) this.#whenController.abort();
        if(this.#formAbortController !== undefined) this.#formAbortController.abort();
    }

    async passForData(self: this, trigger: Element){
        const forData = this.#forData(self);
        for(const key in forData){
            const otherInputEl= forData[key];
            if(otherInputEl.checkValidity && !otherInputEl.checkValidity()) return;
        }
        const eventForFetch: Event & EventForFetch = new InputEvent(forData, trigger);
        self.dispatchEvent(eventForFetch);
        if(eventForFetch.href){
            self.href = eventForFetch.href;
        }
    }

    async listenForX(self: this){
        const {forRefs} = self;
        for(const [key, value] of forRefs!.entries()){
            const [forRef, eventName] = value;
            const inputEl = forRef.deref() as HTMLInputElement;
            const ac = new AbortController();
            inputEl.addEventListener(eventName, async e => {
                const inputEl = e.target as HTMLInputElement;
                if(inputEl.checkValidity && !inputEl.checkValidity()) return;
                await self.passForData(self, inputEl);
            }, {signal: ac.signal});
            this.#abortControllers.push(ac)
        }
    }

    async listenForInput(self: this): ProPP {
        await self.listenForX(self);
        return {

        }
    }


    async doInitialLoad(self: this): ProPP {
        const {oninput} = self;
        if(oninput){
            self.passForData(self, self)
        }
        return {

        }
    }

    get accept(){
        if(this.hasAttribute('accept')) return this.getAttribute('accept')!;
        const as = this.as;
        let defaultVal = 'application/json';
        switch(as){
            case 'html':
                defaultVal = 'text/html';
        }
        return defaultVal;
    }

    validateResp(resp: Response){
        return true;
    }
    validateOn(){
        return this.onerror !== null || this.onload !== null || this.oninput !== null;
    }

    async setTargetProp(self: this, resolvedTarget: Element | null | undefined, data: any, shadow?: ShadowRootMode){
        if(!resolvedTarget) return;
        const {targetElO} = self;
        if(targetElO === undefined) return;
        const {prop} = targetElO;
        if(prop === undefined) throw 'NI';
        console.log({targetElO});
        if(shadow !== undefined && prop === 'innerHTML'){
            let root = resolvedTarget.shadowRoot;
            if(root === null) {
                root = resolvedTarget.attachShadow({mode: shadow});
            }
            root.innerHTML = data;
        }else{
            (<any>resolvedTarget)[prop] = data;
        }
        
    }

    async resolveTarget(self: this): Promise<Element | null>{
        const {targetSelf, targetElO} = this;
        if(targetSelf) return null;
        if(targetElO?.scope === undefined) throw 'NI';
        const {findRealm} = await import('trans-render/lib/findRealm.js')
        return await findRealm(self, targetElO.scope) as Element | null;
    }
}


export interface FetchFor extends AllProps{}

const cache: Map<string, Map<string, any>> = new Map();

const xe = new XE<AllProps & HTMLElement, Actions>({
    config:{
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
            href:{
                type: 'String',
            },
            shadow:{
                type: 'String',
            },
            for: {
                type: 'String',
            },
            form: {
                type: 'String'
            },
            targetElO: {
                type: 'Object'
            },
            target:{
                type: 'String'
            },
            

        },
        actions:{
            initializeWhen: {
                ifAllOf: ['isAttrParsed'],
                ifKeyIn: ['when']
            },
            do: {
                ifAllOf: ['isAttrParsed', 'href'],
                ifAtLeastOneOf: ['targetElO', 'targetSelf'],
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
            listenForInput:{
                ifAllOf: ['isAttrParsed', 'forRefs', 'oninput']
            },
            doInitialLoad:{
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

export class LoadEvent extends Event{

    static EventName: loadEventName = 'load';

    constructor(public data: any){
        super(LoadEvent.EventName);
    }
}

export class InputEvent extends Event implements EventForFetch{

    static EventName: inputEventName = 'input';

    constructor(public forData: ForData, public trigger: Element){
        super(InputEvent.EventName);
    }
}

export interface InputEvent extends EventForFetch{}
