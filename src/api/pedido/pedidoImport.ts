import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import PedidoService from '../../services/pedidoService';

export default async (req, res, next) => {
  try {

   let sk = "sk_test_KEB42ybcqCNDv1Xq"

    // const lib = require('../../../pagarme-core-api-nodejs/lib');

    // // Configuration parameters and credentials
    // lib.Configuration.basicAuthUserName = "sk_test_KEB42ybcqCNDv1Xq"; // The username to use with basic authentication
    // lib.Configuration.basicAuthPassword = "";

    // console.log("lib.Configuration.basicAuthUserName")
    // console.log(lib.Configuration.basicAuthUserName)
    // console.log("lib.Configuration.basicAuthPassword")
    // console.log(lib.Configuration.basicAuthPassword)

    var fs = require('fs');
    const request = require("request");
    var body =  { User: sk, Password: ''  };

    var options = {                 
        method: 'POST',             
        uri: 'https://api.pagar.me/core/v5/orders',                    
        headers: {               
        'Authorization': 'Basic ' + Buffer.from(`${sk}`).toString('base64'),
        'Content-Type': 'application/json'              
        },
        json : ''
    };    

request(options, function(error, response, body) {  
    console.log(response.body);
});

    await ApiResponseHandler.success(req, res, ' payload');
} catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};