var os = require('os');

function external_serverip(){
    var interfaces = os.networkInterfaces();
    //iterate through server interface info. returns first IPV4 ip taht is not internal
     for(var i in interfaces){
         for(var interface in interfaces[i]){
             var address = interfaces[i][interface];
             if(address.family.toUpperCase() === 'IPV4' && !address.internal){
                 return address.address;
             }
         }
     }

}
exports.external_serverip = external_serverip;