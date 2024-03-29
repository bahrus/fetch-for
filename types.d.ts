import {ActionOnEventConfigs} from 'trans-render/froop/types';
import { ElO } from '../trans-render/lib/prs/types';
import { JSONObject } from '../trans-render/lib/types';
/**
 * fetch-for props
 */
export interface EndUserProps{
    /**
     * Url to invoke
     */
    href?: string,

    for?: string,
    
    changeFor?: string,

    as?: 'html' | 'json' | 'text',

    method?: string,

    body?: any,

    credentials?: RequestCredentials,

    target?: string,

    shadow?: ShadowRootMode,

    noCache?: boolean,

    stream?: boolean,

    when?: string,

    form?: string,

}

export interface OverridableGetters{
    init: RequestInit,
    accept?: string,
    value?: any,
    isAttrParsed?: boolean,
    targetSelf?: boolean
    targetElO?: ElO,
    whenCount?: number,
    nextWhenCount?: number,
}

export type EventName = string;

export interface AllProps extends EndUserProps, OverridableGetters{
    resolvedTarget?: Element | null,
    forRefs?: Map<string, [WeakRef<HTMLInputElement>, EventName]>,
    formData?: FormData,
    formRef?: WeakRef<HTMLFormElement>,
    formElO?: ElO,
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
    parseTarget(self: this): ProPP;
    listenForInput(self: this): ProPP;
    //listenForSelect(self: this): ProPP;
    doInitialLoad(self: this): ProPP;
    initializeWhen(self: this): Promise<PP | undefined>;
    onForm(self: this): ProPP;
    onFormElO(self: this): ProPP;
    onFormRef(self: this): Promise<void>,
}

// https://github.com/webcomponents-cg/community-protocols/issues/12#issuecomment-872415080
export type loadEventName = 'load';
export type inputEventName = 'input';
export type selectionChangeEventName = 'select';

export interface EventForFetch {
    href?: string;
    trigger?: Element,
    forData: ForData,
    formData: FormData,
    body?: string | JSONObject
}

export type ForData = {[key: string]: HTMLInputElement}

