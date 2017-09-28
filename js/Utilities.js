jQuery.fn.highlight = function (str, withTrimming, caseSensitive, isRegularExpression, regularExpressionOptions, className) {
    var regex;
	
	if(isRegularExpression) {
		try {
			regex = new RegExp(str, regularExpressionOptions);
		}
		catch(ex) {
			//left blank intentionally
		}
	}
	else {
		if(withTrimming) {
			str = str.toString().trim();
		}
		
		if(caseSensitive) {
			regex = new RegExp(str, "g");
		}
		else {
			regex = new RegExp(str, "gi");
		}
	}
	
    return this.each(function () {
        $(this).contents().filter(function() {
            return this.nodeType == 3 && regex.test(this.nodeValue);
        }).replaceWith(function() {
            return (this.nodeValue || "").replace(regex, function(match) {
                return "<span class=\"" + className + "\">" + match + "</span>";
            });
        });
    });
};

function Queue() {
	var self = this;
	
	self.Content = [];
	
	self.First = function() {
		if(self.Content.length > 0) {
			return self.Content[0];
		}
	};
	
	self.Last = function() {
		if(self.Content.length > 0) {
			return self.Content[self.Content.length - 1];
		}
	};
	
	self.push = function(item) {
		self.Content.push(item);
		console.log(item);
		return self;
	};
	
	self.pop = function() {
		var result;
		
		if(self.Content.length == 1) {
			result = self.Content[0];
			self.Content = [];
		}
		else if(self.Content.length > 1) {
			result = self.Content[0];
			self.Content = self.Content.slice(1, self.Content.length);
		}
		
		return result;
	};
	
	return self;
};

function Guid() {
	function S4() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	}

	return ((S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase());
};

String.prototype.lpad = function (padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
};

String.prototype.trimStart = function (str, withTrimming, caseSensitive) {
	var result = this;
	
	if(typeof(result) != 'undefined' && null != result && typeof(str) != 'undefined' && null != str && '' != str) {
		if(withTrimming) {
			result = result.toString().trim();
			str = str.toString().trim();
		}
		
		if(!caseSensitive) {
			result = result.toString().toLowerCase();
			str = str.toString().toLowerCase();
		}
		
		if(result.indexOf(str) != -1 && result.length >= str.length) {
			if(result.length == str.length && result == str) {
				result = '';
			}
			else if(result.substring(0, str.length) == str){
				result = result.substring(str.length).trimStart(str, withTrimming, caseSensitive);
			}
		}
	}
	
	return result;
};

String.prototype.trimEnd = function (str, withTrimming, caseSensitive) {
	var result = this;
	
	if(typeof(result) != 'undefined' && null != result && typeof(str) != 'undefined' && null != str && '' != str) {
		if(withTrimming) {
			result = result.toString().trim();
			str = str.toString().trim();
		}
		
		if(!caseSensitive) {
			result = result.toString().toLowerCase();
			str = str.toString().toLowerCase();
		}
		
		if(result.indexOf(str) != -1 && result.length >= str.length) {
			if(result.length == str.length && result == str) {
				result = '';
			}
			else if(result.substring(result.length - str.length) == str){
				result = result.substring(0, result.length - str.length).trimEnd(str, withTrimming, caseSensitive);
			}
		}
	}
	
	return result;
};

String.prototype.repeat = function (numOfTimes) {
	var str = this;
	var result = str;
	
	if(typeof(str) != 'undefined' && null != str && '' != str) {
		if(typeof(numOfTimes) != 'undefined' && null != numOfTimes) {
			if (numOfTimes > 0) {
				for (var i = 0; i < numOfTimes - 1; i++) {
					result += str;
				}
			}
			else {
				result = '';
			}
		}
	}	
	
	return result;
};

Array.prototype.remove = function (delegate, firstOnly) {
	var collection = this;
	var result = null;
	var finalResult = null;
	
	if(typeof(collection) != 'undefined' && null != collection && collection.length > 0) {
		if(typeof(delegate) != 'undefined' && null != delegate) {
			var found = false;
			
			for(var i = 0; i < collection.length; i++) {
				if(true == delegate(collection[i])) {
					found = true;
					collection = collection.splice(i, 1);
					break;
				}
			}
			
			if(found) {
				if(typeof(firstOnly) == 'undefined' || null == firstOnly || true != firstOnly) {
					collection.remove(delegate, firstOnly);
				}
			}
		}
	}
	
	return collection;
};

Array.prototype.where = function (delegate, firstOnly) {
	var collection = this;
	var result = null;
	var finalResult = null;
	
	if(typeof(collection) != 'undefined' && null != collection && collection.length > 0) {
		if(typeof(delegate) != 'undefined' && null != delegate) {
			for(var i = 0; i < collection.length; i++) {
				if(true == delegate(collection[i])) {
					if(typeof(firstOnly) != 'undefined' && null != firstOnly && true == firstOnly) {
						result = collection[i];
						break;
					}
					else {
						if(typeof(result) == 'undefined' || null == result) {
							result = ko.observableArray();
						}
					
						result.push(collection[i]);
					}
				}
			}
		}
	}
	
	return result;
};

Array.prototype.firstOrDefault = function (delegate) {
	var result = this.where(delegate, true);
	
	return result;
};

Array.prototype.distinct = function () {
	var outputArray = [];
    
    for (var i = 0; i < this.length; i++) {
        if (($.inArray(this[i], outputArray)) == -1) {
            outputArray.push(this[i]);
        }
    }
   
    return outputArray;
};

Array.prototype.page = function (pageSize, pageIndex) {
	var resultToken = null;
	
	if(typeof(pageSize) != 'undefined' && null != pageSize) {
		if(pageSize <= 0) {
			pageSize = this.length;
		}
		
		var maxNumberOfPages = Math.max(1, Math.ceil(parseFloat(parseFloat(this.length) / parseFloat(pageSize))));
		
		if(typeof(pageIndex) != 'undefined' && null != pageIndex) {
			if(pageIndex < 0) {
				pageIndex = 0;
			}
			else if(pageIndex > maxNumberOfPages - 1) {
				pageIndex = maxNumberOfPages - 1;
			}
			
			var firstItemIndex = pageIndex * pageSize;
			var lastItemIndex = (pageIndex * pageSize) + (pageSize - 1);
			var actualNumberOfPages = maxNumberOfPages;
			var actualTotalNumberOfRows = this.length;
			var actualCurrentPageNumber = pageIndex + 1;
			
			if(lastItemIndex > this.length) {
				lastItemIndex = this.length - 1;
			}
			
			var actualCurrentPageRowsCount = lastItemIndex - firstItemIndex;
			
			resultToken = new Object();
			resultToken.Items = this.slice(firstItemIndex, lastItemIndex + 1);
			resultToken.ActualNumberOfPages = actualNumberOfPages;
			resultToken.ActualTotalNumberOfRows = actualTotalNumberOfRows;
			resultToken.ActualCurrentPageNumber = actualCurrentPageNumber;
			resultToken.ActualCurrentPageRowsCount = actualCurrentPageRowsCount;
		}
		else {
			resultToken = new Object();
			resultToken.Items = this;
			resultToken.ActualNumberOfPages = maxNumberOfPages;
			resultToken.ActualTotalNumberOfRows = this.length;
			resultToken.ActualCurrentPageNumber = 0;
			resultToken.ActualCurrentPageRowsCount = this.length;
		}
	}
	
	return resultToken;
};

function disableSelection(element) {
	if (typeof element[0].onselectstart != 'undefined') {
		element[0].onselectstart = function() { return false; };
	} else if (typeof element[0].style.MozUserSelect != 'undefined') {
		element[0].style.MozUserSelect = 'none';
	} else {
		element[0].onmousedown = function() { return false; };
	}
}

function isBound(elemenId) {
    var result = false;
    var x = ko.dataFor($("#" + elemenId)[0]);

    if (typeof (x) != 'undefined' & null != x) {
        result = true;
    }

    return result;
};

function IsNullOrUndefinedOrEmpty(obj) {
    return (typeof (obj) == 'undefined' || undefined == obj || null == obj || '' == obj);
}

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function getMaxOccurance(array) {
    if (array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for (var i = 0; i < array.length; i++) {
        var el = array[i];
        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

function isNormalInteger(str) {
    var n = ~~Number(str);
    return String(n) === str && n > 0;
}

function Pause(ms) {
	ms += new Date().getTime();
	while (new Date() < ms){}
}

/*-----------------------------------KO Extenders-------------------------------*/
ko.bindingHandlers.isDecimalSignedTextBoxWithLimit = {
    update: function (element, valueAccessor, allBindings) {
        // First get the latest data that we're bound to
        var value = valueAccessor();

        // Next, whether or not the supplied model property is observable, get its current value
        var valueUnwrapped = ko.unwrap(value);

        // Grab some more data from another binding property
        var noOfDigitsBeforeDecimal = allBindings.get('noOfDigitsBeforeDecimal') || 10;
        var noOfDigitsAfterDecimal = allBindings.get('noOfDigitsAfterDecimal') || 10;
        var defaultValue = allBindings.get('defaultValue') || 0;
        var invalidInputCallack = allBindings.get('invalidInputCallack') || null;

        // Now manipulate the DOM element
        if (valueUnwrapped == true) {
            $(element).on("keypress", function () {
                return checkSignedDecimalWithLimit(this, noOfDigitsBeforeDecimal, noOfDigitsAfterDecimal);
            });

            $(element).on("keyup", function () {
                checkPasteSigned(this, noOfDigitsBeforeDecimal, noOfDigitsAfterDecimal, defaultValue, function (elem) { invalidInputCallack(elem); }, false);
            });

            $(element).on("change", function () {
                checkPasteSigned(this, noOfDigitsBeforeDecimal, noOfDigitsAfterDecimal, defaultValue, function (elem) { invalidInputCallack(elem); }, false);
            });

            $(element).on("blur", function () {
                checkPasteSigned(this, noOfDigitsBeforeDecimal, noOfDigitsAfterDecimal, defaultValue, function (elem) { invalidInputCallack(elem); }, true);
            });
        }
    },
    init: function (element, valueAccessor, allBindings) {
        var noOfDigitsBeforeDecimal = allBindings.get('noOfDigitsBeforeDecimal') || 10; // 10 is default duration unless otherwise specified
        var noOfDigitsAfterDecimal = allBindings.get('noOfDigitsAfterDecimal') || 10; // 10 is default duration unless otherwise specified

        adjustZerosAfterDecimalPoint(element, noOfDigitsAfterDecimal);
        adjustNumbersBeforeDecimalPoint(element, noOfDigitsBeforeDecimal);
    }
};

ko.bindingHandlers.isDecimalUnSignedTextBoxWithLimit = {
    update: function (element, valueAccessor, allBindings) {
        // First get the latest data that we're bound to
        var value = valueAccessor();

        // Next, whether or not the supplied model property is observable, get its current value
        var valueUnwrapped = ko.unwrap(value);

        // Grab some more data from another binding property
        var noOfDigitsBeforeDecimal = allBindings.get('noOfDigitsBeforeDecimal') || 10;
        var noOfDigitsAfterDecimal = allBindings.get('noOfDigitsAfterDecimal') || 10;
        var defaultValue = allBindings.get('defaultValue') || 0;
        var invalidInputCallack = allBindings.get('invalidInputCallack') || null;

        // Now manipulate the DOM element
        if (valueUnwrapped == true) {
            $(element).on("keypress", function () {
                return checkUnSignedDecimalWithLimit(this, noOfDigitsBeforeDecimal, noOfDigitsAfterDecimal);
            });

            $(element).on("keyup", function () {
                checkPasteUnSigned(this, noOfDigitsBeforeDecimal, noOfDigitsAfterDecimal, defaultValue, function (elem) { invalidInputCallack(elem); }, false);
            });

            $(element).on("change", function () {
                checkPasteUnSigned(this, noOfDigitsBeforeDecimal, noOfDigitsAfterDecimal, defaultValue, function (elem) { invalidInputCallack(elem); }, false);
            });

            $(element).on("blur", function () {
                checkPasteUnSigned(this, noOfDigitsBeforeDecimal, noOfDigitsAfterDecimal, defaultValue, function (elem) { invalidInputCallack(elem); }, true);
            });

            $(element).on("focus", function () {
                var value = $(this).val();
                var formattedDefaultValue = formatZerosAfterDecimalPoint(defaultValue.toString(), noOfDigitsAfterDecimal);
                formattedDefaultValue = formatNumbersBeforeDecimalPoint(formattedDefaultValue, noOfDigitsBeforeDecimal);

                if (value == formattedDefaultValue) {
                    $(this).val('');
                }
            });
        }
    },
    init: function (element, valueAccessor, allBindings) {
        var noOfDigitsBeforeDecimal = allBindings.get('noOfDigitsBeforeDecimal') || 10; // 10 is default duration unless otherwise specified
        var noOfDigitsAfterDecimal = allBindings.get('noOfDigitsAfterDecimal') || 10; // 10 is default duration unless otherwise specified

        adjustZerosAfterDecimalPoint(element, noOfDigitsAfterDecimal);
        adjustNumbersBeforeDecimalPoint(element, noOfDigitsBeforeDecimal);
    }
};

ko.bindingHandlers.isUnSignedIntegerTextBox = {
    update: function (element, valueAccessor, allBindings) {
        // First get the latest data that we're bound to
        var value = valueAccessor();

        // Next, whether or not the supplied model property is observable, get its current value
        var valueUnwrapped = ko.unwrap(value);

        // Grab some more data from another binding property
        var defaultValue = allBindings.get('defaultValue') || 0;

        // Now manipulate the DOM element
        if (valueUnwrapped == true) {
            $(element).on("keypress", function (event) {
                return isNumber(event)
            });

            $(element).bind("paste", function (e) {
                e.preventDefault();
            });

            $(element).on("focus", function () {
                var value = $(this).val();

                if (value == defaultValue) {
                    $(this).val('');
                }
            });

            $(element).on("blur", function () {
                var value = $(this).val();

                if (null == value || '' == value) {
                    $(this).val(defaultValue);
                }
            });
        }
    }
};

ko.bindingHandlers.shortenAt = {
    update: function (element, valueAccessor, allBindings) {
        // First get the latest data that we're bound to
        var value = valueAccessor();

        // Next, whether or not the supplied model property is observable, get its current value
        var valueUnwrapped = ko.unwrap(value);

        // Grab some more data from another binding property
        var moreText = allBindings.get('moreText') || "more";
        var lessText = allBindings.get('lessText') || "less";

        // Now manipulate the DOM element
        if (valueUnwrapped > 0) {
            var content = $(element).text();
            if (content.length > valueUnwrapped) {
                var con = content.substr(0, valueUnwrapped);
                var hcon = content.substr(valueUnwrapped, content.length - valueUnwrapped);
                var txt = con + '<span class="dots">...</span><span class="morecontent"><span>' + hcon + '</span>&nbsp;&nbsp;<a href="" class="moretxt">' + moreText + '</a></span>';
                $(element).html(txt);

                $(element).find(".moretxt").click(function () {
                    if ($(this).hasClass("sample")) {
                        $(this).removeClass("sample");
                        $(this).text(moreText);
                    } else {
                        $(this).addClass("sample");
                        $(this).text(lessText);
                    }
                    $(this).parent().prev().toggle();
                    $(this).prev().toggle();
                    return false;
                });
            }
        }
    }
};

ko.bindingHandlers.highlightThis = {
    update: function (element, valueAccessor, allBindings) {
        // First get the latest data that we're bound to
        var value = valueAccessor();

        // Next, whether or not the supplied model property is observable, get its current value
        var valueUnwrapped = ko.utils.unwrapObservable(value);

		// Grab some more data from another binding property
        var highlightThisEnable = allBindings.get('highlightThisEnable') || false;
		var highlightThisWithTrimming = allBindings.get('highlightThisWithTrimming') || false;
		var highlightThisCaseSensitive = allBindings.get('highlightThisCaseSensitive') || false;
		var highlightThisIsRegularExpression = allBindings.get('highlightThisIsRegularExpression') || false;
		var highlightThisRegularExpressionOptions = allBindings.get('highlightThisRegularExpressionOptions') || false;
		
        // Now manipulate the DOM element
        if (highlightThisEnable && typeof(valueUnwrapped) != 'undefined' && null != valueUnwrapped && valueUnwrapped.toString() != '') {
			if (!$(element).is("[backup]")) {
				$(element).attr("backup", $(element).html());
			}
			
			var backup = $(element).attr("backup");
			$(element).html(backup);
			$(element).highlight(valueUnwrapped, highlightThisWithTrimming, highlightThisCaseSensitive, highlightThisIsRegularExpression, highlightThisRegularExpressionOptions, "highlighted-search-text");
        }
		else {
			var backupAttr = $(this).attr('backup');

			if ($(element).is("[backup]")) {
				var backup = $(element).attr("backup");
				$(element).html(backup);
			}
		}
    }
};
/*-----------------------------------KO Extenders-------------------------------*/