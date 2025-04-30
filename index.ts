import { authenticator } from 'otplib';
import express from 'express';
import { YemotRouter } from 'yemot-router2';
import { Call } from 'yemot-router2';

const app = express();

const router = YemotRouter({
    printLog: true,
    uncaughtErrorHandler: (error: any, call: Call) => {
        console.log(`Uncaught error in ${call.req.path} from ${call.phone}. error stack: ${error.stack}`);
        // do something with the error - like send email to developer, print details log, etc.
        call.id_list_message([{ type: 'text', data: 'אירעה שגיאה' }]); // play nice error message to the caller
        return;
    }
});

async function callHandler(call: Call) {
    const secret = call.req.query.secret as string;
    if (!secret) {
        call.id_list_message([
            {
                type: 'text',
                data: 'שגיאה שכחת לכתוב את הקוד בהגדרות השלוחה',
            },
        ]);
        return;
    }
    const code = getOTP(secret);
    call.id_list_message([
        {
            type: 'text',
            data: 'הקוד הוא',
        },
        {
            type: 'digits',
            data: code,
        },
        {
            type: 'text',
            data: 'שלום ויום טוב',
        },
    ]);
};

router.get('/', callHandler);

app.use('/', router.asExpressRouter);

const port = 3000;
app.listen(port, () => {
    console.log(`Authenticator-Phone running on port ${port}`);
});

const getOTP = (secret: string) => {
    const token = authenticator.generate(secret);
    return token;
}