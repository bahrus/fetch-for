import {O, OConfig} from 'trans-render/froop/O.js';
import {
    Actions, AllProps, loadEventName, ProPP, PP,
    ForData, EventForFetch, inputEventName, EventName, EndUserProps
} from './types';
import {config} from './config.js';

export class FetchFor extends O implements Actions, AllProps{



    static override config = config;

        
    #abortController: AbortController | undefined;

    #abortControllers: Array<AbortController> = [];

    accept$(self: this){
        const {accept, as} = self;
        if(accept !== undefined) return accept;
        return as === 'html' ? 'text/html' : 'application/json';
    
    }


    disconnectedCallback(){
        super.disconnectedCallback();
        for(const ac of this.#abortControllers){
            ac.abort();
        }
        if(this.#whenController !== undefined) this.#whenController.abort();
        if(this.#formAbortController !== undefined) this.#formAbortController.abort();
    }

    async do(self: this){
        try{
            const {whenCount} = self;
            super.covertAssignment({
                nextWhenCount: whenCount! + 1
            } as PP);
            if(!self.validateOn()) {
                console.error('on* required');
                return;
            }
            const {noCache, as, stream, href} = self;
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
                this.request$(self).signal = this.#abortController?.signal;
                if(as === 'html' && stream){
                    const {streamOrator} = await import('stream-orator/StreamOrator.js');
                    const {target} = self;
                    const targetEl = (this.getRootNode() as DocumentFragment).querySelector(target!) as HTMLElement;
                    streamOrator(href!, this.request$, targetEl);
                    return;
                }
                const resp = await fetch(href!, this.request$);
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

    async doInitialLoad(self: this): ProPP {
        const {oninput} = self;
        if(oninput){
            self.passForData(self, self)
        }
        return {

        }
    }


    request$(self: this){
        const {method, body, credentials} = self;
        return {
            method: method,
            headers: {
                'Accept': self.accept$(this),
            },
            credentials: credentials,
            body: typeof body === 'object' ? JSON.stringify(body) : body,
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

    #formAbortController : AbortController | undefined;

    async initializeWhen(self: this){
        const {when, nextWhenCount} = self;
        if(!when){
            return {
                whenCount: nextWhenCount
            } as PP
        }
        if(this.#whenController !== undefined) this.#whenController.abort();
        this.#whenController = new AbortController();
        const {parse} = await import('trans-render/dss/parse.js');
        const specifier = await parse(when);
        const {evt} = specifier;
        const {find} = await import('trans-render/dss/find.js');
        const srcEl = await find(self, specifier);
        if(!srcEl) throw 404;
        srcEl.addEventListener(evt || 'click', e => {
            self.whenCount = self.nextWhenCount;
        }, {signal: this.#whenController.signal});
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
    
    async onForm(self: this): ProPP {
        const {form} = self;
        const {parse} = await import('trans-render/dss/parse.js');
        return {
            formSpecifier: await parse(form!)
        } as PP
    }

    async onFormRef(self: this){
        const {formData, formSpecifier, formRef} = self;
        const form = formRef?.deref();
        if(!(form instanceof HTMLFormElement)) throw 404;
        if(this.#formAbortController !== undefined){
            this.#formAbortController.abort();
        }
        this.#formAbortController = new AbortController();
        form.addEventListener(formSpecifier?.evt || 'input', e => {
            if(!form.checkValidity()) return;
            this.passForData(self, e.target as HTMLFormElement);
        })
        if(form.checkValidity()){
            this.doInitialLoad(self);
        }
    }

    async onFormSpecifier(self: this): ProPP {
        const {find} = await import('trans-render/dss/find.js');
        const {formSpecifier} = self;
        const form = await find(self, formSpecifier!);
        if(!(form instanceof HTMLFormElement)) throw 404;
        return {
            formData: new FormData(form),
            formRef: new WeakRef(form)
        }
    }
    


    async parseFor(self: this){
        const {for: f, } = self;
        const split = f!.split(' ').filter(x => !!x); // remove white spaces
        //const {findRealm} = await import('trans-render/lib/findRealm.js');
        //const {prsElO} = await import('trans-render/lib/prs/prsElO.js');
        const {parse} = await import('trans-render/dss/parse.js');
        const {find} = await import('trans-render/dss/find.js');
        const forRefs: Map<string, [WeakRef<HTMLInputElement>, EventName]> = new Map();
        for(const token of split){
            const parsed = await parse(token);
            const {evt, prop} = parsed;
            //if(scope === undefined || prop === undefined) throw 'NI';
            const inputEl = await find(self, parsed);
            if(!(inputEl instanceof EventTarget)) throw 404;
            forRefs.set(prop!, [new WeakRef(inputEl as HTMLInputElement), evt || 'input']);
        }
        return {
            forRefs
        };
    }




    async parseTarget(self: this){
        const {target} = self;
        if(!target){
            return {
                targetSelf: true,
            } as PP
        }
        const {parse} = await import('trans-render/dss/parse.js');
        const targetSpecifier = await parse(target);
        return {
            targetSelf: false,
            targetSpecifier    
        } as PP;
    }





    async passForData(self: this, trigger: Element){
        const forData = this.#forData(self);
        for(const key in forData){
            const otherInputEl= forData[key];
            if(otherInputEl.checkValidity && !otherInputEl.checkValidity()) return;
        }
        const eventForFetch: Event & EventForFetch = new InputEvent(forData, trigger);
        const form = self.formRef?.deref();
        if(form !== undefined){
            this.covertAssignment({
                formData: new FormData(form)
            });
            //self.formData = new FormData(form);
        }
        self.dispatchEvent(eventForFetch);
        if(eventForFetch.href){
            self.href = eventForFetch.href;
            if(!self.when){
                self.whenCount = self.nextWhenCount;
            }
            
        }
    }

    async resolveTarget(self: this): Promise<Element | null>{
        const {targetSelf, targetSpecifier} = this;
        if(targetSelf) return null;
        //if(targetElO?.scope === undefined) throw 'NI';
        const {find} = await import('trans-render/dss/find.js')
        return await find(self, targetSpecifier!) as Element | null;
    }

    async setTargetProp(self: this, resolvedTarget: Element | null | undefined, data: any, shadow?: ShadowRootMode){
        if(!resolvedTarget) return;
        const {targetSpecifier} = self;
        if(targetSpecifier === undefined) return;
        const {prop} = targetSpecifier;
        if(prop === undefined) throw 'NI';
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






    validateResp(resp: Response){
        return true;
    }
    validateOn(){
        return this.onerror !== null || this.onload !== null || this.oninput !== null;
    }

    #whenController: AbortController | undefined;


}

export interface FetchFor extends AllProps{}

const cache: Map<string, Map<string, any>> = new Map();

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