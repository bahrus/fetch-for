import {ActionOnEventConfigs} from 'trans-render/froop/types';
/**
 * fetch-for props
 */
export interface EndUserProps{
    /**
     * Url to invoke
     */
    href?: string,

    for?: string, 

    as?: 'html' | 'json' | 'text',

    method?: string,

    body?: any,

    credentials?: RequestCredentials,

    targetSelector?: string,

    shadow?: ShadowRootMode,

    noCache?: boolean,

}

export interface OverridableGetters{
    init: RequestInit,
    accept?: string,
    value?: any,
    isAttrParsed?: boolean,
}

export interface AllProps extends EndUserProps, OverridableGetters{
    target?: Element | null,
    forRefs?: Map<string, WeakRef<HTMLInputElement>>,
}

export type PP = Partial<AllProps>;

export type ProPP = Promise<PP>

export type PPE = [PP, ActionOnEventConfigs<AllProps, Actions>];

export interface Methods{
    validateResp(resp: Response): boolean,
    validateOn(): boolean,
    setTargetProp(target: Element | null, data: any, shadow?: ShadowRootMode): void,
}

export interface Actions{
    do(self: this): Promise<void>;
    parseFor(self: this): ProPP;
    listenForInput(self: this): ProPP;
    listenForChange(self: this): ProPP;
    doInitialLoad(self: this): ProPP;
}

// https://github.com/webcomponents-cg/community-protocols/issues/12#issuecomment-872415080
export type loadEventName = 'load';
export type inputEventName = 'input';
export type changeEventName = 'change';

export interface EventForFetch {
    href?: string;
    forData: {[key: string]: HTMLInputElement}
}

export type ForData = {[key: string]: HTMLInputElement}

