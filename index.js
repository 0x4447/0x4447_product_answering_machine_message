exports.handler = async (event) => {

    //
    //  1.  Set a default message so even if we get nothing back we have
    //      a default mesage
    //
    let message = "No message left";

    //
    //  2.  Check to see what did Lex hear from the user
    //
    if(event.inputTranscript)
    {
        message = event.inputTranscript;
    }

    //
    //  3.  Create a variable that will hold the response
    //
    let res = {};

    //
    //  4.  This is ran from 'Lambda initialization and validation'
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
    //  This is ran from 'Fulfillment'
    //
    if(event.invocationSource === 'FulfillmentCodeHook')
    {
        //
        //  Close our intent
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
    //  ->  Stop lambda and send back the response
    //
    return res;

};
