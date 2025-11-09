// @ts-check
import { propInfo, rejected, resolved } from 'be-enhanced/cc.js';
import { BE } from 'be-enhanced/BE.js';
import {dispatchEvent as de} from 'trans-render/positractions/dispatchEvent.js';
import {FetchReadyEvent} from 'fetch-ready/FetchReadyEvent.js';
/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP, AllProps, AP, BAP} from './ts-refs/fetch-for/types' */;

/**
 * @implements {Actions}
 * @implements {EventListenerObject}
 * 
 */
class FetchFor extends BE {



    /**
     * @type {BEConfig<BAP, Actions & IEnhancement>}
     */
    static config = {
        propInfo: {
            ...propInfo,
            target: {},
            fetchReadyEvent: {},
        },
        positractions: [resolved, rejected],
        compacts: {
            when_target_changes_call_hydrate: 0,
            when_fetchReadyEvent_changes_call_doFetch: 0,
        }
    };

    de = de;

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
        const {enhancedElement} = self;
        enhancedElement.addEventListener(FetchReadyEvent.eventName, this, {signal: abortController.signal});
        enhancedElement.dispatchEvent(new Event('input'));
        return /** @type {PAP} */ ({
            resolved: true,
        });
    }

    /**
     * 
     * @param {FetchReadyEvent} e 
     */
    handleEvent(e) {
        const self = /** @type {BAP} */ (/** @type {any} */ (this));
        const {enhancedElement} = self;
        self.fetchReadyEvent = e;
        //self.evtCount++;
    }

    /**
     * 
     * @param {BAP} self 
     */
    doFetch(self) {
        debugger;
    }
}

await FetchFor.bootUp();
export {FetchFor};