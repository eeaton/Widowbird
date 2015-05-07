/*
 * sc_abtest v2.0.1 "Widowbird"
 * @author Elliot Eaton
 */
(function() {
    'use strict';
    var WB = {};
    WB.getCookie = function(name) {
        var cookieValue, cookies, cookie, i, len;
        if (document.cookie && document.cookie !== '') {
            cookies = document.cookie.split('; ');
            for (i = 0, len = cookies.length; i < len; i++) {
                cookie = cookies[i];
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };
    WB.getCookieRemainder = function() {
        var rp, rpLastThree, decimalRp;
        rp = WB.getCookie('Rp');
        if (!rp) {
            return -1;
        }
        rpLastThree = rp.substr(rp.length - 3);
        decimalRp = parseInt(rpLastThree, 16);
        return decimalRp % 100;
    };
    WB.doAutoRedirect = function(i) {
        var redirectURL = WB.urlArray[i],
            param;
        param = location.search;
        if (param) {
            location.href = redirectURL + param + '&l2-id=WB';
        } else {
            location.href = redirectURL + '?l2-id=WB';
        }
    };
    WB.replaceContents = function(i, j) {
        WB.replaceFlag = true;
        var len = WB.selectorArray.length;
        var loadAjax = function(tempUrl, tempSelector, async) {
            var xmlhttp;
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            } else {
                try {
                    xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
                } catch (e2) {
                    return;
                }
            }
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    var testArea = document.getElementById(tempSelector);
                    if (testArea && xmlhttp.responseText) {
                        testArea.innerHTML = xmlhttp.responseText;
                    }
                }
            };
            xmlhttp.open('GET', tempUrl, false);
            xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xmlhttp.send();
        };
        try {
            if (WB.urlArray[i * len + j]) {
                loadAjax(WB.urlArray[i * len + j], WB.selectorArray[j] || 'wb_testarea', true);
            }
        } catch (e) {
            WB.setProp34('WB_error');
            return;
        }
    };
    WB.setProp34 = function(testPattern) {
        var input1 = document.createElement('input');
        input1.setAttribute('type', 'hidden');
        input1.setAttribute('id', 'scABTest');
        input1.setAttribute('value', testPattern);
        document.body.appendChild(input1);
    };
    WB.checkPattern = function(func) {
        var lent = WB.targetArray.length,
            lens = WB.selectorArray.length,
            i = 0,
            j = 0;
        for (i; i < lent; i++) {
            if ((WB.abTestCheckValue - (WB.targetArray[i - 1] || 0)) * (WB.abTestCheckValue - WB.targetArray[i + 1] || 100 - 0) < 0) {
                if (lens > 0) {
                    for (j; j < lens; j++) {
                        func(i, j);
                    }
                } else {
                    func(i, i);
                }
                WB.setProp34('WB_testpattern' + (i + 1));
                break;
            }
        }
    };
    WB.getDataAttributes = function(script) {
        WB.targetArray = [];
        WB.urlArray = [];
        WB.selectorArray = [];
        var getCustomAttribute = function(dataType, dataArray) {
            var attribute, i = 1;
            do {
                attribute = script.getAttribute(dataType + i);
                if (attribute) {
                    dataArray.push(attribute);
                }
                i++;
            } while (attribute);
            return;
        };
        getCustomAttribute('data-target', WB.targetArray);
        getCustomAttribute('data-url', WB.urlArray);
        getCustomAttribute('data-selector', WB.selectorArray);
    };
    WB.getABMethod = function() {
        var scripts, script;
        scripts = document.getElementsByTagName('script');
        script = scripts[scripts.length - 1];

        WB.dataReplace = script.getAttribute('data-replace');
        window.abTestCheckValue = WB.abTestCheckValue = WB.getCookieRemainder();
        WB.getDataAttributes(script);
        //console.log(WB.targetArray[0] + ':' + WB.urlArray[0]);
        if (!WB.targetArray[0] || !WB.urlArray[0]) {
            return;
        }
        if (WB.abTestCheckValue > -1) {
            if (WB.dataReplace) {
                WB.checkPattern(WB.replaceContents);
                if (!WB.replaceFlag) {
                    WB.setProp34('WB_default');
                    return;
                }
            } else {
                WB.checkPattern(WB.doAutoRedirect);
            }
        }
    };
    WB.getABMethod();
}());