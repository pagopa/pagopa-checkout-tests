import { CodeCategory, Language, TestCase } from "./types";

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

export const NAV_PAA_PAGAMENTO_DUPLICATO = "302000100443009424";

export const TEST_CASES: TestCase[] = [
    {
        category: {
            codeCategory: CodeCategory.PAA_PAGAMENTO_SCONOSCIUTO,
            rangeStart: Number(String(NAV_PREFIX).concat(PAA_PAGAMENTO_SCONOSCIUTO_START)),
            rangeEnd: Number(String(NAV_PREFIX).concat(PAA_PAGAMENTO_SCONOSCIUTO_END))
        },
        header: {
            message: [
                {
                    language: Language.DE,
                    value: "Der Zahlungsaufforderung konnte nicht gefunden werden"
                },
                {
                    language: Language.EN,
                    value: "We can’t find the notice"
                },
                {
                    language: Language.FR,
                    value: "L'avis est introuvable"
                },
                {
                    language: Language.IT,
                    value: "Non riusciamo a trovare l’avviso"
                },
                {
                    language: Language.SL,
                    value: "Obvestila ni bilo mogoče najti"
                },
            ],
            xpath: "/html/body/div[2]/div[3]/div/h2/div"
        },
        body: {
            message: [
                {
                    language: Language.DE,
                    value: "Die Zahlungsaufforderung könnte bereits bezahlt worden sein. Für Unterstützung kontaktieren Sie bitte die Zahlungsempfänger."
                },
                {
                    language: Language.EN,
                    value: "The notice may have already been paid. To get support, contact the Payee."
                },
                {
                    language: Language.FR,
                    value: "L'avis pourrait déjà avoir été payé. Pour obtenir de l’assistance, contactez l’organisme créancier."
                },
                {
                    language: Language.IT,
                    value: "L'avviso potrebbe essere stato già pagato. Per ricevere assistenza, contatta l’Ente Creditore."
                },
                {
                    language: Language.SL,
                    value: "Obvestilo bi lahko bilo že plačano. Za pomoč se obrnite na Upnika."
                },
            ],
            xpath: "/html/body/div[2]/div[3]/div/div/div[1]"
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
            message: [
                {
                    language: Language.DE,
                    value: "Die Zahlungsaufforderung ist abgelaufen und kann nicht mehr beglichen werden"
                },
                {
                    language: Language.EN,
                    value: "The notice has expired and it can no longer be paid"
                },
                {
                    language: Language.FR,
                    value: "L’avis a expiré et ne peut plus être payé"
                },
                {
                    language: Language.IT,
                    value: "L’avviso è scaduto e non è più possibile pagarlo"
                },
                {
                    language: Language.SL,
                    value: "Obvestilo je poteklo in ga ni več mogoče plačati"
                },
            ],
            xpath: "/html/body/div[2]/div[3]/div/h2/div"
        },
        body: {
            message: [
                {
                    language: Language.DE,
                    value: "Bitte die Behörde um weitere Informationen."
                },
                {
                    language: Language.EN,
                    value: "Contact the payee for more information."
                },
                {
                    language: Language.FR,
                    value: "Contactez l’organisme pour obtenir des informations supplémentaires."
                },
                {
                    language: Language.IT,
                    value: "Contatta l’Ente per maggiori informazioni."
                },
                {
                    language: Language.SL,
                    value: "Za več informacij se obrnite na upnika."
                },
            ],
            xpath: "/html/body/div[2]/div[3]/div/div/div[1]"
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
            message: [
                {
                    language: Language.DE,
                    value: "Ein unvorhergesehener Fehler ist aufgetreten"
                },
                {
                    language: Language.EN,
                    value: "An unexpected error occurred"
                },
                {
                    language: Language.FR,
                    value: "Une erreur inattendue s’est produite"
                },
                {
                    language: Language.IT,
                    value: "Si è verificato un errore imprevisto"
                },
                {
                    language: Language.SL,
                    value: "Prišlo je do nepričakovane napake"
                },
            ],
            xpath: "/html/body/div[2]/div[3]/div/h2/div"
        },
        body: {
            message: [
                {
                    language: Language.DE,
                    value: "Versuche es noch einmal oder wende dich an den Kundendienst."
                },
                {
                    language: Language.EN,
                    value: "Try again or contact support."
                },
                {
                    language: Language.FR,
                    value: "Réessayez ou contactez l'assistance."
                },
                {
                    language: Language.IT,
                    value: "Riprova, oppure contatta l’assistenza."
                },
                {
                    language: Language.SL,
                    value: "Poskusite znova ali se obrnite na podporo."
                },
            ],
            xpath: "/html/body/div[2]/div[3]/div/div/div[1]"
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
            message: [
                {
                    language: Language.DE,
                    value: "Die empfangende Behörde hat Probleme mit der Antwort"
                },
                {
                    language: Language.EN,
                    value: "The payee is having problems with the response"
                },
                {
                    language: Language.FR,
                    value: "La réponse de l’organisme créancier est perturbée"
                },
                {
                    language: Language.IT,
                    value: "L’Ente Creditore sta avendo problemi nella risposta"
                },
                {
                    language: Language.SL,
                    value: "Upnik ima težave z odzivom"
                },
            ],
            xpath: "/html/body/div[2]/div[3]/div/h2/div"
        },
        body: {
            message: [
                {
                    language: Language.DE,
                    value: "Fehlercode für den Kundendienst"
                },
                {
                    language: Language.EN,
                    value: "Error code for support"
                },
                {
                    language: Language.FR,
                    value: "Code erreur pour l’assistance"
                },
                {
                    language: Language.IT,
                    value: "Codice di errore per l'assistenza"
                },
                {
                    language: Language.SL,
                    value: "Koda napake za podporo"
                },
            ],
            xpath: "/html/body/div[2]/div[3]/div/div/div[1]"
        },
        errorCodeXpath: "/html/body/div[2]/div[3]/div/div/div[2]/div[2]/div",
        skipTest: false
    },
    {
        category: {
            codeCategory: CodeCategory.PAA_PAGAMENTO_DUPLICATO,
            rangeStart: 0,
            rangeEnd: 0
        },
        header: {
            message: [
                {
                    language: Language.DE,
                    value: "Diese Zahlungsaufforderung wurde bereits beglichen!"
                },
                {
                    language: Language.EN,
                    value: "This notice was already paid!"
                },
                {
                    language: Language.FR,
                    value: "Cet avis a déjà été payé !"
                },
                {
                    language: Language.IT,
                    value: "Questo avviso è stato già pagato!"
                },
                {
                    language: Language.SL,
                    value: "To obvestilo je že plačano!"
                },
            ],
            xpath: "/html/body/div[2]/div[3]/div/h2/div"
        },
        body: {
            message: [
                {
                    language: Language.DE,
                    value: "Wenn du über diese Website bezahlt hast, wurde der Beleg an die E-Mail-Adresse gesendet, die du bei der Zahlung angegeben hast."
                },
                {
                    language: Language.EN,
                    value: "If you paid on this website, the receipt was sent to the email address you indicated during payment."
                },
                {
                    language: Language.FR,
                    value: "Si vous avez payé sur ce site, le reçu vous sera envoyé à l’adresse e-mail que vous avez donnée pendant l’opération."
                },
                {
                    language: Language.IT,
                    value: "Se hai pagato su questo sito, la ricevuta è stata inviata all'indirizzo email che hai indicato durante il pagamento."
                },
                {
                    language: Language.SL,
                    value: "Če ste plačali na tem spletnem mestu, je bilo potrdilo poslano na elektronski naslov, ki ste ga navedli ob zaključku nakupa."
                },
            ],
            xpath: "/html/body/div[2]/div[3]/div/div/div[1]"
        },
        errorCodeXpath: undefined,
        skipTest: false
    }
];