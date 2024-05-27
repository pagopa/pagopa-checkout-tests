export enum CodeCategory {
    PAA_PAGAMENTO_SCONOSCIUTO = "PAA_PAGAMENTO_SCONOSCIUTO",
    PAA_PAGAMENTO_SCADUTO = "PAA_PAGAMENTO_SCADUTO",
    PPT_STAZIONE_INT_PA_TIMEOUT = "PPT_STAZIONE_INT_PA_TIMEOUT",
    PPT_STAZIONE_INT_PA_IRRAGGIUNGIBILE = "PPT_STAZIONE_INT_PA_IRRAGGIUNGIBILE",
    PAA_PAGAMENTO_DUPLICATO = "PAA_PAGAMENTO_DUPLICATO",
}

interface Box {
    message: string,
    xpath: string
}

export interface Category {
    codeCategory: CodeCategory,
    rangeStart: number, // Indicate the start range for the generation of the noticeCode.
    rangeEnd: number    // Indicate the end range for the generation of the noticeCode.
}

export interface TestCase {
    category: Category,
    header: Box | undefined,
    body: Box | undefined,
    errorCodeXpath: string | undefined,
    skipTest: boolean
}