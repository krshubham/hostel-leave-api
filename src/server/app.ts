import browserApp from '../browser/browser-app';
import ILeaveForm from '../interfaces/leave-form';
import express from 'express';
import config from '../config/config';
import bodyParser from 'body-parser';
/**
 * Set this env variable because of FFCS's nice HTTPS implementation :/
 */
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.put('/apply', async(req,res) => {
    try {
        const {regno,password} = req.body;
        const instance = await browserApp.init(regno,password);
        const formData:ILeaveForm = <ILeaveForm>(req.body);
        const data:any = await instance.run(formData);
        if(!data){
            return res.json({data});
        }
        else{
            return res.json({
                success: true,
                message: 'Leave request successfully applied',
                data
            });
        }
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
});

app.all('*', (req,res) => {
    res.json({
        'status': 'Its working'
    });
});

/**
 * Listen on port defined in config
 */
 app.listen(Number(config.SERVER_PORT), () => {
     console.log(`Server is listening on ${config.SERVER_PORT}`);
 });