import {
    Actions, Methods, AllProps, loadEventName, ProPP, 
    ForData, EventForFetch, inputEventName, changeEventName
} from './types';
import {XE, ActionOnEventConfigs} from 'xtal-element/XE.js';

export class FetchFor extends HTMLElement implements Actions, Methods{
    
    #abortController: AbortController | undefined;

    async parseFor(self: this){
        const {for: f, } = self;
        const split = f!.split(' ');
        const {findRealm} = await import('trans-render/lib/findRealm.js');
        const forRefs: Map<string, WeakRef<HTMLInputElement>> = new Map();
        for(const token of split){
            const headChar = token[0];
            const tailStr = token.substring(1);
            let inputEl: EventTarget | null | undefined;
            switch(headChar){
                case '@':
                    inputEl = await findRealm(self, ['wf', tailStr]);
                    break;
                default:
                    throw 'NI';
            }
            if(!(inputEl instanceof HTMLElement)) throw 404;
            forRefs.set(tailStr, new WeakRef(inputEl as HTMLInputElement));
        }
        return {
            forRefs
        };
    }

    async do(self: this){
        try{
            const {href} = self;
            if(!this.validateOn()) {
                console.error('on* required');
                return;
            }
            const {resolvedTarget, noCache} = self;
            if(resolvedTarget && resolvedTarget.ariaLive === null) resolvedTarget.ariaLive = 'polite';
            let data: any;
            if(!noCache) {
                data = cache.get(this.localName)?.get(href!);
            } 
            const as = this.as;
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
                    await this.setTargetProp(resolvedTarget, data);
                    break;
                case 'html':
                    const {shadow} = this;
                    if(this.target){
                        this.hidden = true;
                        await this.setTargetProp(resolvedTarget, data, shadow);
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
            const inputEl = value.deref();
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
    }

    async passForData(self: this, eventType: 'input' | 'change'){
        const forData = this.#forData(self);
        for(const key in forData){
            const otherInputEl= forData[key];
            if(otherInputEl.checkValidity && !otherInputEl.checkValidity()) return;
        }
        let eventForFetch: Event & EventForFetch | undefined;
        switch(eventType){
            case 'change':
                eventForFetch = new ChangeEvent(forData);
                break;
            case 'input':
                eventForFetch = new InputEvent(forData);
                break;
        }
        self.dispatchEvent(eventForFetch);
        if(eventForFetch.href){
            self.href = eventForFetch.href;
        }
    }

    async listenForX(self: this, eventType: 'input' | 'change'){
        const {forRefs} = self;
        for(const [key, value] of forRefs!.entries()){
            const inputEl = value.deref() as HTMLInputElement;
            const ac = new AbortController();
            inputEl.addEventListener(eventType, async e => {
                const inputEl = e.target as HTMLInputElement;
                if(inputEl.checkValidity && !inputEl.checkValidity()) return;
                await self.passForData(self, eventType);
            }, {signal: ac.signal});
            this.#abortControllers.push(ac)
        }
    }

    async listenForInput(self: this): ProPP {
        await self.listenForX(self, 'input');
        return {

        }
    }

    async listenForChange(self: this): ProPP {
        await self.listenForX(self, 'input');
        return {
            
        }
    }

    async doInitialLoad(self: this): ProPP {
        const {oninput, onchange} = self;
        if(oninput){
            self.passForData(self, 'input')
        }else if(onchange){
            self.passForData(self, 'change');
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
        return this.onerror !== null || this.onload !== null || this.oninput !== null || this.onchange !== null;
    }

    async setTargetProp(resolvedTarget: Element | null | undefined, data: any, shadow?: ShadowRootMode){
        if(!resolvedTarget) return;
        const {target} = this;
        if(target === undefined) return;
        const lastPos = target.lastIndexOf('[');
        if(lastPos === -1) throw 'NI'; //Not implemented
        const rawPath =  target.substring(lastPos + 2, target.length - 1);
        const {lispToCamel} = await import('trans-render/lib/lispToCamel.js');
        const propPath = lispToCamel(rawPath);
        if(shadow !== undefined && propPath === 'innerHTML'){
            let root = resolvedTarget.shadowRoot;
            if(root === null) {
                root = resolvedTarget.attachShadow({mode: shadow});
            }
            root.innerHTML = data;
        }else{
            (<any>resolvedTarget)[propPath] = data;
        }
        
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
            target: {
                type: 'String',
            }
        },
        actions:{
            do: {
                ifAllOf: ['isAttrParsed', 'href']
            },
            parseFor: {
                ifAllOf: ['isAttrParsed', 'for'],
                ifAtLeastOneOf: ['oninput', 'onchange']
            },
            listenForInput:{
                ifAllOf: ['isAttrParsed', 'forRefs', 'oninput']
            },
            listenForChange:{
                ifAllOf: ['isAttrParsed', 'forRefs', 'onchange']
            },
            doInitialLoad:{
                ifAllOf: ['isAttrParsed', 'forRefs'],
                ifAtLeastOneOf: ['oninput', 'onchange', 'onload'],
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

    constructor(public forData: ForData){
        super(InputEvent.EventName);
    }
}

export class ChangeEvent extends Event implements EventForFetch{

    static EventName: changeEventName = 'change';

    constructor(public forData: ForData){
        super(ChangeEvent.EventName);
    }
}