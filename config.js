export const config = {
    propDefaults: {
        accept: '',
        /**
         * this is a test
         */
        credentials: 'omit',
        method: 'GET',
        as: 'json',
        noCache: false,
        stream: false,
        targetSelf: false,
        whenCount: 0,
        nextWhenCount: 1,
        target: '',
        when: '',
    },
    propInfo: {
        accept: {
            type: 'String',
            parse: true,
            attrName: 'accept'
        },
        for: {
            type: 'String',
            parse: true,
            attrName: 'for',
        },
        forRefs: {
            type: 'Object',
            ro: true,
        },
        form: {
            type: 'String',
            parse: true,
            attrName: 'form'
        },
        formData: {
            type: 'Object',
            ro: true,
        },
        formRef: {
            type: 'Object',
            ro: true,
        },
        formSpecifier: {
            type: 'String',
            ro: true,
        },
        href: {
            type: 'String',
            parse: true,
            attrName: 'href'
        },
        shadow: {
            type: 'String',
        },
        targetSpecifier: {
            type: 'Object'
        },
        target: {
            type: 'String',
            parse: true,
            attrName: 'target'
        },
        when: {
            type: 'String',
            parse: true,
            attrName: 'when'
        }
    },
    actions: {
        initializeWhen: {
            ifKeyIn: ['when']
        },
        do: {
            ifAllOf: ['href'],
            ifAtLeastOneOf: ['targetSpecifier', 'targetSelf'],
            ifEquals: ['whenCount', 'nextWhenCount']
        },
        parseTarget: {
            ifKeyIn: ['target']
        },
        parseFor: {
            ifAllOf: ['for'],
            ifAtLeastOneOf: ['oninput', 'onselect'],
        },
        listenForInput: {
            ifAllOf: ['forRefs', 'oninput']
        },
        doInitialLoad: {
            ifAllOf: ['forRefs'],
            ifAtLeastOneOf: ['oninput', 'onselect'],
        },
        onForm: {
            ifAllOf: ['form'],
        },
        onFormSpecifier: {
            ifAllOf: ['formSpecifier']
        },
        onFormRef: {
            ifAllOf: ['formRef']
        }
    }
};
