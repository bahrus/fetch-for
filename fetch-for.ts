import {Actions, Methods, AllProps, PPE, ILoadEvent, loadEventName} from './types';
import {XE, ActionOnEventConfigs} from 'xtal-element/XE.js';

export class FetchFor extends HTMLElement implements Actions, Methods{
    
    #abortController: AbortController | undefined;

    async do(self: this){
        try{
            const {href} = self;
            if(!this.validateOn()) {
                console.error('on* required');
                return;
            }
            const {target, noCache} = self;
            if(target && target.ariaLive === null) target.ariaLive = 'polite';
            let data: any;
            if(!noCache) {
                data = cache.get(this.localName)?.get(href);
            } 
            const as = this.as;
            if(data === undefined){
                if(target){
                    target.ariaBusy = 'true';
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
                if(target) target.ariaBusy = 'false';
            }
            
            switch(as){
                case 'text':
                case 'json':
                    this.hidden = true;
                    this.value = data;
                    this.dispatchEvent(new Event('change'));
                    await this.setTargetProp(target, data);
                    break;
                case 'html':
                    const {shadow} = this;
                    if(this.target){
                        this.hidden = true;
                        await this.setTargetProp(target, data, shadow);
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

    async setTargetProp(target: Element | null | undefined, data: any, shadow?: ShadowRootMode){
        if(!target) return;
        const {targetSelector} = this;
        if(targetSelector === undefined) return;
        const lastPos = targetSelector.lastIndexOf('[');
        if(lastPos === -1) throw 'NI'; //Not implemented
        const rawPath =  targetSelector.substring(lastPos + 2, targetSelector.length - 1);
        const {lispToCamel} = await import('trans-render/lib/lispToCamel.js');
        const propPath = lispToCamel(rawPath);
        if(shadow !== undefined && propPath === 'innerHTML'){
            let root = target.shadowRoot;
            if(root === null) {
                root = target.attachShadow({mode: shadow});
            }
            root.innerHTML = data;
        }else{
            (<any>target)[propPath] = data;
        }
        
    }
}

export interface FetchFor extends AllProps{}

const cache: Map<string, Map<URL, any>> = new Map();

const xe = new XE<AllProps, Actions>({
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
            }
        },
        actions:{
            do: {
                ifAllOf: ['isAttrParsed', 'href']
            },
        }
    },
    superclass: FetchFor
});

export class LoadEvent extends Event implements ILoadEvent{

    static EventName: loadEventName = 'load';

    constructor(public data: any){
        super(LoadEvent.EventName);
    }
}