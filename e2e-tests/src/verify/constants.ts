import { CodeCategory, TestCase } from "./types";

export const VALID_FISCAL_CODE = String(process.env.VALID_FISCAL_CODE);
export const EMAIL = String(process.env.EMAIL);
export const NAV_PREFIX = "302";

export const PAA_PAGAMENTO_SCONOSCIUTO_END = "409999999999999";
export const PAA_PAGAMENTO_SCONOSCIUTO_START = "400000000000000";

export const PAA_PAGAMENTO_SCADUTO_END = "999999999999999";
export const PAA_PAGAMENTO_SCADUTO_START = "990000000000000";

export const PPT_STAZIONE_INT_PA_TIMEOUT_END = "989999999999999";
export const PPT_STAZIONE_INT_PA_TIMEOUT_START = "980000000000000";

export const PPT_STAZIONE_INT_PA_IRRAGGIUNGIBILE_END = "979999999999999";
export const PPT_STAZIONE_INT_PA_IRRAGGIUNGIBILE_START = "970000000000000";

export const NAV_PAA_PAGAMENTO_DUPLICATO = "302950100443009424";

export const TEST_CASES: TestCase[] = [
    {
        category: {
            codeCategory: CodeCategory.PAA_PAGAMENTO_SCONOSCIUTO,
            rangeStart: Number(String(NAV_PREFIX).concat(PAA_PAGAMENTO_SCONOSCIUTO_START)),
            rangeEnd: Number(String(NAV_PREFIX).concat(PAA_PAGAMENTO_SCONOSCIUTO_END))
        },
        header: {
            message: "Non riusciamo a trovare l’avviso",
            selector: "#verifyPaymentTitleError"
        },
        body: {
            message: "L'avviso potrebbe essere stato già pagato. Per ricevere assistenza, contatta l’Ente Creditore.",
            selector: "#verifyPaymentBodyError"
        },
        errorCodeXpath: undefined,
        skipTest: false
    },
    {
        category: {
            codeCategory: CodeCategory.PAA_PAGAMENTO_SCADUTO,
            rangeStart: Number(String(NAV_PREFIX).concat(PAA_PAGAMENTO_SCADUTO_START)),
            rangeEnd: Number(String(NAV_PREFIX).concat(PAA_PAGAMENTO_SCADUTO_END))
        },
        header: {
            message: "L’avviso è scaduto e non è più possibile pagarlo",
            selector: "#verifyPaymentTitleError"
        },
        body: {
            message: "Contatta l’Ente per maggiori informazioni.",
            selector: "#verifyPaymentBodyError"
        },
        errorCodeXpath: undefined,
        skipTest: false
    },
    {
        category: {
            codeCategory: CodeCategory.PPT_STAZIONE_INT_PA_TIMEOUT,
            rangeStart: Number(String(NAV_PREFIX).concat(PPT_STAZIONE_INT_PA_TIMEOUT_START)),
            rangeEnd: Number(String(NAV_PREFIX).concat(PPT_STAZIONE_INT_PA_TIMEOUT_END))
        },
        header: {
            message: "Si è verificato un errore imprevisto",
            selector: "#verifyPaymentTitleError"
        },
        body: {
            message: "Riprova, oppure contatta l’assistenza",
            selector: "#verifyPaymentBodyError"
        },
        errorCodeXpath: undefined,
        skipTest: false
    },
    {
        category: {
            codeCategory: CodeCategory.PPT_STAZIONE_INT_PA_IRRAGGIUNGIBILE,
            rangeStart: Number(String(NAV_PREFIX).concat(PPT_STAZIONE_INT_PA_IRRAGGIUNGIBILE_START)),
            rangeEnd: Number(String(NAV_PREFIX).concat(PPT_STAZIONE_INT_PA_IRRAGGIUNGIBILE_END))
        },
        header: {
            message: "L’Ente Creditore sta avendo problemi nella risposta",
            selector: "#verifyPaymentTitleError"
        },
        body: {
            message: "Codice di errore per l'assistenza",
            selector: "#verifyPaymentBodyError"
        },
        errorCodeXpath: "//*[@id=\"verifyPaymentErrorId\"]",
        skipTest: false
    },
    {
        category: {
            codeCategory: CodeCategory.PAA_PAGAMENTO_DUPLICATO,
            rangeStart: 0,
            rangeEnd: 0
        },
        header: {
            message: "Questo avviso è stato già pagato!",
            selector: "#verifyPaymentTitleError"
        },
        body: undefined,
        errorCodeXpath: undefined,
        skipTest: false
    }
];