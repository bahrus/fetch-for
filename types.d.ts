import {ActionOnEventConfigs} from 'trans-render/froop/types';
/**
 * fetch-for props
 */
export interface EndUserProps{
    /**
     * Url to invoke
     */
    href: URL,

    as?: 'html' | 'json' | 'text',

    

    method?: string,

    body?: any,

    credentials?: RequestCredentials,

    targetSelector?: string,


}

export interface OverridableGetters{
    init: RequestInit,
    accept?: string,
    value?: any,
}

export interface AllProps extends EndUserProps, OverridableGetters{
    target?: Element | null,
}

export type PP = Partial<AllProps>;

export type PPE = [PP, ActionOnEventConfigs<AllProps, Actions>];

export interface Methods{
    validateResp(resp: Response): boolean,
    validateOn(): boolean,
    setTargetProp(target: Element | null, data: any, shadow: ShadowRootMode | null): void,
}

export interface Actions{
    do(self: this): Promise<void>
}

// https://github.com/webcomponents-cg/community-protocols/issues/12#issuecomment-872415080
export type loadEventName = 'load';
export interface ILoadEvent {
    data: any
}

