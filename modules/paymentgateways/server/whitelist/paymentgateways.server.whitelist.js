'user strict';

//stripe servers IPs list
var stripe_whiteilst_IPs =['54.187.174.169',
                    '54.187.205.235',
                    '54.187.216.72',
                    '54.241.31.99',
                    '54.241.31.102',
                    '54.241.34.107'];

exports.stripe_isAllowed = function(req, res, next) {

    var reqip = req.ip.replace('::ffff:', '');

    if (stripe_whiteilst_IPs.indexOf(req) === -1) {
        //IP not found
        res.send('error')
    }
    else {
        //ipfound on list
        next();
    }
};