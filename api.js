var rest = require('restler');
var isValidDateStr = require('./date_validator');

var self = module.exports = {

	ver001: (data, res) => {

		if (!data.base) {
			self.sendResponse(res, 403, 'Please supply a base currency symbol');
			return;
		}

		const base = data.base.toUpperCase();

    let date, symbols;
		let url = 'https://api.fixer.io/latest?symbols=' + data.symbol.from + ',' + data.symbol.to;

		if (!data.symbol) {
			self.sendResponse(res, 403, 'Please supply a currency symbol to convert to');
			return;
		}

		if (!data.amount) {
			self.sendResponse(res, 403, 'Please supply an amount to convert');
			return;
		}

		if (Array.isArray(data.symbol)) {

			let str = '';
			const symbolArray = data.symbol;

			for (let i = symbolArray.length - 1; i >= 0; i--) {
				str += symbolArray[i].toUpperCase() + ',';
			}

			symbols = str;

		} else {

			symbols = data.symbol.toUpperCase();

		}

		if (!data.date) {
			if (typeof data.date !== 'string') {
				self.sendResponse(res, 403, 'Please provide the date as a string');
				return;
			}
     
			if (isValidDateStr(data.date)) {
        date = data.date;
      } else {

        self.sendResponse(res, 403, 'Please provide valid date as a string in the form yyyy-mm-dd\n');
        return;
      }

		} else {
			date = 'latest';
		}

		url = 'http://api.fixer.io/' + date + '?base=' + base + '&symbols=' + symbols;

        rest.get(url).on('complete', function(err, response) {

            if (response.statusCode == 200) {

            	const returns = {
            		base: data.base,
            		amount: data.amount,
            		results: self.convertAmount(data.amount, JSON.parse(response.rawEncoded)),
            		dated: data.date
            	};

            	self.sendResponse(res, 200, returns);
            }
            if (response.statusCode == 401) {
                callback('Not Authorized');
            }
            if (response.statusCode == 502) {
                callback('API Error');
            }

        });

	},

	convertAmount: (amount, data) => {

		const rates = data.rates;
		const returns = [];

		for (let r in rates) {

			if (rates.hasOwnProperty(r)) {

				const convert = (amount * rates[r]);
				returns.push({
          from:           data.base,
          to:             r,
          roundedResult:  convert.toFixed(2),
          fullResult:     convert,
          rate:           rates[r]
        });

			}

		}

		return returns;
	},

	sendResponse: (res, status, response) => {

        if(typeof response === 'object'){
            response = JSON.stringify(response) + '\n';
        }
	    res.status(status);
	    res.write(response);
	    res.end();
	    return

	}
}