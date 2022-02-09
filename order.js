const request = require('request')
const crypto = require('crypto')
const path = require('path')

const express = require('express')

const app = express()




const baseurl = "https://api.coindcx.com"

const timeStamp = Math.floor(Date.now());

// Place your API key and secret below. You can generate it from the website.
const key = "9f3469a4dc9afad025703e18560b071d16e0b1232d0e64e3";
const secret = "d34a19d4c30d14c5977c932a2d70659e1979051596a55c07daa1e9a9029b1247";


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs")


app.get('/neworder/:amount', async (req, res, err) => {
    let {
        amount
    } = req.params;
    const _body = {
        "side": "sell",
        "order_type": "market_order",
        "market": "BTCINR",
        "price_per_unit": "228210.10",
        "total_quantity": 0.00005,
        "timestamp": timeStamp,

    }

    const payload = new Buffer.from(JSON.stringify(_body)).toString();
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const options = {
        url: baseurl + "/exchange/v1/orders/create",
        headers: {
            'X-AUTH-APIKEY': key,
            'X-AUTH-SIGNATURE': signature,

        },
        json: true,
        body: _body
    }
    // console.log(options, '--config--')
    let coindcxResponse;
    let newOrder = request.post(options, function (error, response, body) {
        coindcxResponse = body
        console.log(coindcxResponse, '--response')
        try {
            let results = {};
            
            if (coindcxResponse && coindcxResponse.orders && coindcxResponse.orders.length > 0) {
                
                results = JSON.stringify({
                    id: coindcxResponse.orders[0]["id"],
                    market: coindcxResponse.orders[0]["market"],
                    orderType: coindcxResponse.orders[0]["order_type"],
                    totalQuantity: coindcxResponse.orders[0]["total_quantity"],
                })
                res.render("index", { data: JSON.stringify(results)})
            }else if(coindcxResponse.code == 400){
                console.log('else if--', coindcxResponse)
                res.render("index", {data: JSON.stringify(coindcxResponse.message)})
                // return;
            }else{
                 res.render("index", {data: JSON.stringify(coindcxResponse.message)})
            }
            return null
        } catch (err) {
            console.log(err, "--error--")
            res.render("index", {data: JSON.stringify("Something went wrong")})
        }
    })
})

app.listen(6008, () => console.log('server ready'))


