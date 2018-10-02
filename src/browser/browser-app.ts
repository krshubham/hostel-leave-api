import p,{Browser, Page, Response, Dialog} from 'puppeteer';
import axios from 'axios';
import qs from 'qs';
import ILeaveForm from '../interfaces/leave-form';
import errors from '../errors/error-strings';
import config from '../config/config';


export default class App {
    private browserInstance: Browser;
    private page: Page;
    private regno: string;
    private password: string;
    
    /**
    * Returns a new instance of the App
    * @param instance {Browser}
    * @param page {Page}
    */
    public constructor(instance: Browser, page: Page, registrationNumber: string, password: string){
        if(!instance){
            throw new Error(errors.ERR_PUPPETEER_FAIL);
        }
        if(!page){
            throw new Error(errors.ERR_PUPPETEER_PAGE);
        }
        if(!registrationNumber || !password){
            throw new Error(errors.ERR_NO_CREDENTIALS);
        }
        this.browserInstance = instance;
        this.page = page;
        this.regno = registrationNumber;
        this.password = password;
    }
    
    /**
    * Returns a new puppeteer instance
    */
    private async _getBrowserInstance(): Promise<Browser> {
        return await p.launch();
    }
    
    /**
    * Adds the captcha auto solver js script
    */
    private async _addCaptcha(): Promise<void> {
        await this.page.addScriptTag({
            path: '../captcha/captcha.js'
        });
    }
    
    /**
    * App initializer
    */
    public static async init(registrationNumber: string, password: string): Promise<App>{
        let instance:Browser = await p.launch();
        let page:Page = await instance.newPage();
        return new App(instance,page,registrationNumber,password);
    }
    
    /**
    * Attach event listener for internal console
    */
    private async _attachConsoleListener(): Promise<void>{
        this.page.on('dialog', async (data: Dialog) => {
            console.log(data);
        });
    }
    

    /**
    * Fill the credentials on the page
    */
    private async _fillDetails(): Promise<void> {
        const name = await this.page.$('[name="regno"]');
        const password = await this.page.$('[name="passwd"]');
        if(!name || !password){
            throw new Error('Something went wrong!')
        }
        await name.type(this.regno);
        await password.type(this.password);
    }

    /**
     * Submits the outing form, given all the details
     * @param cookies {Array<p.Cookie>}
     */
    private async _submitOutingRequest(cookies: string, formData: ILeaveForm){
        const axiosOptions:any = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookies
            },
            withCredentials: true
        };
        return await axios.post(config.FFCS_WEEKEND_OUTING_SUBMIT_URL,qs.stringify(formData),axiosOptions);
    }

    /**
     * 
     */
    public async run(formData: ILeaveForm): Promise<any> {
        try {
            if(!this.browserInstance){
                this.browserInstance = await p.launch();
            }
            if(!this.page){
                this.page = await this.browserInstance.newPage();
            }

            // Open the FFCS page.
            await this.page.goto(config.FFCS_URL);
            // Fill the user auth credentials
            await this._fillDetails();
            // Fill the captcha in the page
            await this._addCaptcha();
            // Click on the submit button after attaching the captcha script
            await this.page.click('input[type="submit"]');
            
            // TODO: Remove this line after completion
            await this.page.screenshot({path: 'example.png'});

            // Fetch the cookies from the page.
            const cookies = await this.page.cookies();
            
            let cookieString = ``;
            // Generate the string for the cookies.
            for(let cookie of cookies){
                cookieString += `${cookie.name}=${cookie.value}; `;
            }
            // Make the request with the cookies to the FFCS server
            const res = await this._submitOutingRequest(cookieString,formData);
            return res.data;
        }
        catch(err){
            return err;
        }
        finally {
            this.browserInstance.close();
        }
    }
};