import { generateRandomNoticeCode, payNotice } from "./helpers"

export interface TestData {
    skipTest: string
    testingPsp: string
    fiscalCodePrefix: string
    pspAbi: string
    pan: string
    expirationDate: string
    cvv: string
};

export enum CodeCategory {
    PAYMENT_OK,
    PAYMENT_UNAVAILABLE,
    PAYMENT_UNKNOWN,
    PAYMENT_DATA_ERROR,
    DOMAIN_UNKNOWN,
    PAYMENT_ONGOING,
    PAYMENT_EXPIRED,
    PAYMENT_CANCELED,
    PAYMENT_DUPLICATED,
    GENERIC_ERROR
}

export const VALID_FISCAL_CODE = String(process.env.VALID_FISCAL_CODE);
export const EMAIL = String(process.env.EMAIL);

export class TestExecutor{

    private _testData:TestData;
    private _testCases:Map<CodeCategory, Promise<void>>;

    get testCases(){
        return this._testCases;
    }

    constructor(testData:TestData){
        this._testData = testData;
        this._testCases = new Map([[CodeCategory.PAYMENT_OK, this.paymentOk()]]);
    }


    runTests(testData:TestData, cat:CodeCategory): Promise<void>{
        this._testData = testData;
        return this._testCases.get(cat) as Promise<void>;
    }


    async paymentOk(): Promise<void>{
        /*
        * 1. Payment with valid notice code
        */
            const resultMessage = await payNotice(
                generateRandomNoticeCode(this._testData.fiscalCodePrefix),
                VALID_FISCAL_CODE,
                EMAIL,
                {
                number: String(this._testData.pan),
                expirationDate: String(this._testData.expirationDate),
                ccv: String(this._testData.cvv),
                holderName: "Test test"
                },
                this._testData.pspAbi
            );
        
            expect(resultMessage).toContain("Grazie, hai pagato");
    }
}