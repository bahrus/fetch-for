// @ts-check
/** @import {Actions, PAP, AllProps, AP} from './types/fetch-for/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway, SpawnContext} from './types/assign-gingerly/types' */;
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;

/**
 * @implements {Actions}
 * @implements {EventListenerObject}
 */
class FetchFor {

    /**
     * @this {AllProps & Actions}
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {SpawnContext} ctx 
     * @param {PAP} initVals 
     */
    constructor(enhancedElement, ctx, initVals){
        this.init(this, enhancedElement, ctx, initVals);
    }

    /**
     * @param {AllProps} self 
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {SpawnContext} ctx 
     * @param {PAP} initVals 
     */
    async init(self, enhancedElement, ctx, initVals){
        const {customData} = /** @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>} */ (ctx.emc);
        /**
         * @type {RoundaboutOptions}
         */
        const raOptions = {
            ...customData,
            vm: self,
            initialPropVals: {
                enhancedElement,
                ...customData?.defaultPropVals,
                ...initVals
            }
        };
        (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
    }

    /** @type {AbortController | undefined} */
    #abortController;

    /**
     * @param {AP} self 
     */
    hydrate(self) {
        let abortController = this.#abortController;
        if(abortController === undefined){
            abortController = new AbortController();
        } else {
            abortController.abort();
            abortController = new AbortController();
        }
        this.#abortController = abortController;
        const {enhancedElement} = self;
        const {FetchReadyEvent} = /** @type {any} */ (globalThis).__fetchReady || {};
        if(FetchReadyEvent){
            enhancedElement.addEventListener(FetchReadyEvent.eventName, this, {signal: abortController.signal});
        } else {
            import('fetch-ready/FetchReadyEvent.js').then(m => {
                enhancedElement.addEventListener(m.FetchReadyEvent.eventName, this, {signal: abortController.signal});
            });
        }
        enhancedElement.dispatchEvent(new Event('input'));
        return /** @type {PAP} */ ({
            resolved: true,
        });
    }

    /**
     * @param {Event} e 
     */
    handleEvent(e) {
        const self = /** @type {AP} */ (/** @type {any} */ (this));
        const {url, options} = /** @type {any} */ (e);
        self.fetchReadyEvent = {url, options};
    }

    /**
     * @param {AP} self 
     */
    async doFetch(self) {
        const {fetchReadyEvent, fetchForParams, enhancedElement} = self;
        const {url, options} = fetchReadyEvent;
        const response = await fetch(url, options);
        const result = await response.json();
        const {find} = await import('mount-observer/find.js');
        const statements = fetchForParams?.statements || [];
        for(const statement of statements){
            const {value} = statement;
            if(!value) continue;
            const {remoteSpecifier} = value;
            if(!remoteSpecifier){
                // fallback: use targetPart directly
                const {targetPart} = value;
                if(targetPart){
                    const targetEl = /** @type {any} */ (await find(enhancedElement, {prop: targetPart}));
                    if(targetEl) targetEl[targetPart] = result;
                }
                continue;
            }
            const {prop} = remoteSpecifier;
            if(prop === undefined) throw 'NI';
            const targetEl = /** @type {any} */ (await find(enhancedElement, remoteSpecifier));
            targetEl[prop] = result;
        }
    }
}

export { FetchFor };
