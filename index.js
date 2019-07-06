//
//  This function will grab the raw transcript of what was said in the
//  message from AWS Lex, and pass it over to AWS Connect as text for
//  further processing by Lex.
//
exports.handler = (event) => {

    return new Promise(function(resolve, reject) {

        console.log(event, null, 4);

        //
        //  1.  Set a default message so even if we get nothing back we have
        //      a default message.
        //
        let message = "No message left";

        //
        //  2.  Check to see what did Lex hear from the user.
        //
        if(event.inputTranscript)
        {
            message = event.inputTranscript;
        }

        //
        //  3.  Create a variable that will hold the response.
        //
        let res = {};

        //
        //  4.  This is ran from 'Lambda initialization and validation'.
        //
        if(event.invocationSource === 'DialogCodeHook')
        {
            //
            //  Set the Delegate with our modified slot value
            //
            res = {
                dialogAction: {
                    type: "Delegate",
                    slots: {
                        message: message
                    }
                }
            };
        }

        //
        //  This is ran from 'Fulfillment'.
        //
        if(event.invocationSource === 'FulfillmentCodeHook')
        {
            //
            //  Close our intent.
            //
            res = {
                dialogAction: {
                    type: "Close",
                    fulfillmentState: "Fulfilled",
                    message: {
                        contentType: "PlainText",
                        content: "Perfect."
                    }
                }
            };
        }

        //
        //  ->  Tell Lambda that we are done working.
        //
        return resolve(res);

    });

};
