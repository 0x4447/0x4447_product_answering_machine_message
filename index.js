let AWS = require('aws-sdk');

//
//  Create the DynamoDB object
//
let ddb = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

//
//  This function will grab the raw transcript of what was said in the
//  message from AWS Lex, and pass it over to AWS Connect as text for
//  further processing by Lex.
//
exports.handler = (event) => {

    return new Promise(function(resolve, reject) {

        //
        //  1.  Simplify the variable that we need.
        //
        //let name = event.Details.ContactData.Attributes.first_name
        //let phone_nr = event.Details.ContactData.CustomerEndpoint.Address

        let container = {
            //
            //  Organize all the data that we get so we know what
            //  this code uses.
            //
            req: {
                phone_nr: 'dsdsds',
                source: event.invocationSource
            },
            //
            //  Save the transcript or set a default message.
            //
            message: event.inputTranscript || "No message left";
            //
            //  Hold the response for Connect.
            //
            res: {}
        }

        //
        //  ->  Start the chain.
        //
        process_the_transcript(container)
            .then(function(container) {

                return save_the_message(container);

            }).catch(function(error) {

            });

    });

};

//   _____    _____     ____    __  __   _____    _____   ______    _____
//  |  __ \  |  __ \   / __ \  |  \/  | |_   _|  / ____| |  ____|  / ____|
//  | |__) | | |__) | | |  | | | \  / |   | |   | (___   | |__    | (___
//  |  ___/  |  _  /  | |  | | | |\/| |   | |    \___ \  |  __|    \___ \
//  | |      | | \ \  | |__| | | |  | |  _| |_   ____) | | |____   ____) |
//  |_|      |_|  \_\  \____/  |_|  |_| |_____| |_____/  |______| |_____/
//

//
//  See if we get back a transcript or not. And save the appropriate message.
//
function process_the_transcript(container) {

    return new Promise(function(resolve, reject) {

        //
        //  1.  This is ran from 'Lambda initialization and validation'.
        //
        if(container.req.source === 'DialogCodeHook')
        {
            //
            //  Set the Delegate with our modified slot value
            //
            container.res = {
                dialogAction: {
                    type: "Delegate",
                    slots: {
                        message: container.message
                    }
                }
            };
        }

        //
        //  2.  This is ran from 'Fulfillment'.
        //
        if(container.req.source === 'FulfillmentCodeHook')
        {
            //
            //  Close our intent.
            //
            container.res = {
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
        return resolve(container);

    });

};


//
//  This lambda saves the name that the user over the phone said.
//
function save_the_message(container) {

    return new Promise(function(resolve, reject) {

        //
        //  1.  Prepare the query
        //
        let params = {
            TableName: "0x4447_connect_sessions",
            Item: {
                id: container.req.phone_nr,
                type: 'message',
                message: container.message
            },
        };

        //
        //  2.  Execute the query
        //
        ddb.put(params, function(error, data) {

            //
            //  1.  Check if there were any errors
            //
            if(error)
            {
                console.info(params);
                return reject(error);
            }

            //
            //  ->  Tell Lambda that we are done working.
            //
            return resolve(container);

        });

    });
};
