// @ts-check
import { propInfo, rejected, resolved } from 'be-enhanced/cc.js';
import { BE } from 'be-enhanced/BE.js';
import {dispatchEvent as de} from 'trans-render/positractions/dispatchEvent.js';
/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP, AllProps, AP, BAP} from './ts-refs/fetch-for/types' */;

/**
 * @implements {Actions}
 * @implements {EventListenerObject}
 * 
 */
class FetchFor extends BE {
    /** @type {AbortController | undefined} */
    #abortController;
    /**
     * 
     * @param {BAP} self 
     */
    hydrate(self) {
        let abortController = this.#abortController;
        if(abortController === undefined){
            abortController = new AbortController();
        }else{
            abortController.abort();
            abortController = new AbortController();
        }
        this.#abortController = abortController;
        const {fetchReadyEventName, enhancedElement} = self;
        enhancedElement.addEventListener(fetchReadyEventName, this, {signal: abortController.signal});
        this.handleEvent();
        return /** @type {PAP} */ ({
            resolved: true,
        });
    }
    /**
     * 
     * 
     */
    handleEvent() {
        const self = /** @type {BAP} */ (/** @type {any} */ (this));
        const {enhancedElement, fetchReadyCss} = self;
        if(enhancedElement.matches(fetchReadyCss)) return;
        self.evtCount++;
    }
    /**
     * @type {BEConfig<BAP, Actions & IEnhancement>}
     */
    static config = {
        propDefaults:{
            fetchReadyCss: '.fetch-ready',
            fetchReadyEventName: 'fetch-ready',
            evtCount: 0
        },
        propInfo: {
            ...propInfo,
        },
        positractions: [resolved, rejected],
    };

    de = de;

    
}

await FetchFor.bootUp();
export {FetchFor};