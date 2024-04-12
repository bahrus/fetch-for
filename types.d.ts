import { JSONObject } from '../trans-render/lib/types';
import { Specifier } from '../trans-render/dss/types';
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
    //isAttrParsed?: boolean,
    targetSelf?: boolean
    targetSpecifier?: Specifier
    whenCount?: number,
    nextWhenCount?: number,


}

export type EventName = string;

export interface AllProps extends EndUserProps, OverridableGetters{
    resolvedTarget?: Element | null,
    forRefs?: Map<string, [WeakRef<HTMLInputElement>, EventName]>,
    formData?: FormData,
    formRef?: WeakRef<HTMLFormElement>,
    formSpecifier?: Specifier,
}

export type PP = Partial<AllProps>;

export type ProPP = Promise<PP>



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
    onFormSpecifier(self: this): ProPP;
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

