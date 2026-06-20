// @ts-check
import { propInfo, rejected, resolved } from 'be-enhanced/cc.js';
import { BE } from 'be-enhanced/BE.js';
import {dispatchEvent as de} from 'trans-render/positractions/dispatchEvent.js';
import {FetchReadyEvent} from 'fetch-ready/FetchReadyEvent.js';
/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP, AllProps, AP, BAP, FetchReadyEvent as FRE} from './ts-refs/fetch-for/types' */;

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
            fetchForParams: {},
            fetchReadyEvent: {},
        },
        positractions: [resolved, rejected],
        compacts: {
            when_fetchForParams_changes_call_hydrate: 0,
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
        const {url, options} = e;
        /**
         * @type {FRE}
         */
        const fetchReadyEvent ={url, options};
        self.fetchReadyEvent = fetchReadyEvent;
    }

    /**
     * 
     * @param {BAP} self 
     */
    async doFetch(self) {
        const {fetchReadyEvent, fetchForParams, enhancedElement} = self;
        const {url, options} = fetchReadyEvent;
        const response = await fetch(url, options);
        const result = await response.json();
        const {find} = await import('trans-render/dss/find.js');
        for(const fetchForParam of fetchForParams){
            const {remoteSpecifier} = fetchForParam;
            const {prop} = remoteSpecifier;
            if(prop === undefined) throw 'NI';
            const targetEl = /** @type {any} */ (await find(enhancedElement, remoteSpecifier));
            targetEl[prop] = result;
        }
        
    }
}

await FetchFor.bootUp();
export {FetchFor};