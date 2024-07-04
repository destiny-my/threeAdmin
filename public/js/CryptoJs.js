
    var CryptoJS = CryptoJS || (function (Math, undefined) {
        var create = Object.create || (function () {
            function F() { }
            return function (obj) { var subtype; F.prototype = obj; subtype = new F(); F.prototype = null; return subtype; };
        })(); var C = {}; var C_lib = (C.lib = {}); var Base = (C_lib.Base = (function () {
            return {
                extend: function (overrides) {
                    var subtype = create(this); if (overrides) { subtype.mixIn(overrides); }
                    if (!subtype.hasOwnProperty("init") || this.init === subtype.init) { subtype.init = function () { subtype.$super.init.apply(this, arguments); }; }
                    subtype.init.prototype = subtype; subtype.$super = this; return subtype;
                }, create: function () { var instance = this.extend(); instance.init.apply(instance, arguments); return instance; }, init: function () { }, mixIn: function (properties) {
                    for (var propertyName in properties) { if (properties.hasOwnProperty(propertyName)) { this[propertyName] = properties[propertyName]; } }
                    if (properties.hasOwnProperty("toString")) { this.toString = properties.toString; }
                }, clone: function () { return this.init.prototype.extend(this); }
            };
        })()); var WordArray = (C_lib.WordArray = Base.extend({
            init: function (words, sigBytes) { words = this.words = words || []; if (sigBytes != undefined) { this.sigBytes = sigBytes; } else { this.sigBytes = words.length * 4; } }, toString: function (encoder) { return (encoder || Hex).stringify(this); }, concat: function (wordArray) {
                var thisWords = this.words; var thatWords = wordArray.words; var thisSigBytes = this.sigBytes; var thatSigBytes = wordArray.sigBytes; this.clamp(); if (thisSigBytes % 4) { for (var i = 0; i < thatSigBytes; i++) { var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff; thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8); } } else { for (var i = 0; i < thatSigBytes; i += 4) { thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2]; } }
                this.sigBytes += thatSigBytes; return this;
            }, clamp: function () { var words = this.words; var sigBytes = this.sigBytes; words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8); words.length = Math.ceil(sigBytes / 4); }, clone: function () { var clone = Base.clone.call(this); clone.words = this.words.slice(0); return clone; }, random: function (nBytes) {
                var words = []; var r = function (m_w) { var m_w = m_w; var m_z = 0x3ade68b1; var mask = 0xffffffff; return function () { m_z = (0x9069 * (m_z & 0xffff) + (m_z >> 0x10)) & mask; m_w = (0x4650 * (m_w & 0xffff) + (m_w >> 0x10)) & mask; var result = ((m_z << 0x10) + m_w) & mask; result /= 0x100000000; result += 0.5; return result * (Math.random() > 0.5 ? 1 : -1); }; }; for (var i = 0, rcache; i < nBytes; i += 4) { var _r = r((rcache || Math.random()) * 0x100000000); rcache = _r() * 0x3ade67b7; words.push((_r() * 0x100000000) | 0); }
                return new WordArray.init(words, nBytes);
            }
        })); var C_enc = (C.enc = {}); var Hex = (C_enc.Hex = {
            stringify: function (wordArray) {
                var words = wordArray.words; var sigBytes = wordArray.sigBytes; var hexChars = []; for (var i = 0; i < sigBytes; i++) { var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff; hexChars.push((bite >>> 4).toString(16)); hexChars.push((bite & 0x0f).toString(16)); }
                return hexChars.join("");
            }, parse: function (hexStr) {
                var hexStrLength = hexStr.length; var words = []; for (var i = 0; i < hexStrLength; i += 2) { words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4); }
                return new WordArray.init(words, hexStrLength / 2);
            }
        }); var Latin1 = (C_enc.Latin1 = {
            stringify: function (wordArray) {
                var words = wordArray.words; var sigBytes = wordArray.sigBytes; var latin1Chars = []; for (var i = 0; i < sigBytes; i++) { var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff; latin1Chars.push(String.fromCharCode(bite)); }
                return latin1Chars.join("");
            }, parse: function (latin1Str) {
                var latin1StrLength = latin1Str.length; var words = []; for (var i = 0; i < latin1StrLength; i++) { words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8); }
                return new WordArray.init(words, latin1StrLength);
            }
        }); var Utf8 = (C_enc.Utf8 = { stringify: function (wordArray) { try { return decodeURIComponent(escape(Latin1.stringify(wordArray))); } catch (e) { throw new Error("Malformed UTF-8 data"); } }, parse: function (utf8Str) { return Latin1.parse(unescape(encodeURIComponent(utf8Str))); } }); var BufferedBlockAlgorithm = (C_lib.BufferedBlockAlgorithm = Base.extend({
            reset: function () { this._data = new WordArray.init(); this._nDataBytes = 0; }, _append: function (data) {
                if (typeof data == "string") { data = Utf8.parse(data); }
                this._data.concat(data); this._nDataBytes += data.sigBytes;
            }, _process: function (doFlush) {
                var data = this._data; var dataWords = data.words; var dataSigBytes = data.sigBytes; var blockSize = this.blockSize; var blockSizeBytes = blockSize * 4; var nBlocksReady = dataSigBytes / blockSizeBytes; if (doFlush) { nBlocksReady = Math.ceil(nBlocksReady); } else { nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0); }
                var nWordsReady = nBlocksReady * blockSize; var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes); if (nWordsReady) {
                    for (var offset = 0; offset < nWordsReady; offset += blockSize) { this._doProcessBlock(dataWords, offset); }
                    var processedWords = dataWords.splice(0, nWordsReady); data.sigBytes -= nBytesReady;
                }
                return new WordArray.init(processedWords, nBytesReady);
            }, clone: function () { var clone = Base.clone.call(this); clone._data = this._data.clone(); return clone; }, _minBufferSize: 0
        })); var Hasher = (C_lib.Hasher = BufferedBlockAlgorithm.extend({
            cfg: Base.extend(), init: function (cfg) { this.cfg = this.cfg.extend(cfg); this.reset(); }, reset: function () { BufferedBlockAlgorithm.reset.call(this); this._doReset(); }, update: function (messageUpdate) { this._append(messageUpdate); this._process(); return this; }, finalize: function (messageUpdate) {
                if (messageUpdate) { this._append(messageUpdate); }
                var hash = this._doFinalize(); return hash;
            }, blockSize: 512 / 32, _createHelper: function (hasher) { return function (message, cfg) { return new hasher.init(cfg).finalize(message); }; }, _createHmacHelper: function (hasher) { return function (message, key) { return new C_algo.HMAC.init(hasher, key).finalize(message); }; }
        })); var C_algo = (C.algo = {}); return C;
    })(Math); (function () {
        var C = CryptoJS; var C_lib = C.lib; var WordArray = C_lib.WordArray; var C_enc = C.enc; var Base64 = (C_enc.Base64 = {
            stringify: function (wordArray) {
                var words = wordArray.words; var sigBytes = wordArray.sigBytes; var map = this._map; wordArray.clamp(); var base64Chars = []; for (var i = 0; i < sigBytes; i += 3) { var byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff; var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff; var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff; var triplet = (byte1 << 16) | (byte2 << 8) | byte3; for (var j = 0; j < 4 && i + j * 0.75 < sigBytes; j++) { base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f)); } }
                var paddingChar = map.charAt(64); if (paddingChar) { while (base64Chars.length % 4) { base64Chars.push(paddingChar); } }
                return base64Chars.join("");
            }, parse: function (base64Str) {
                var base64StrLength = base64Str.length; var map = this._map; var reverseMap = this._reverseMap; if (!reverseMap) { reverseMap = this._reverseMap = []; for (var j = 0; j < map.length; j++) { reverseMap[map.charCodeAt(j)] = j; } }
                var paddingChar = map.charAt(64); if (paddingChar) { var paddingIndex = base64Str.indexOf(paddingChar); if (paddingIndex !== -1) { base64StrLength = paddingIndex; } }
                return parseLoop(base64Str, base64StrLength, reverseMap);
            }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        }); function parseLoop(base64Str, base64StrLength, reverseMap) {
            var words = []; var nBytes = 0; for (var i = 0; i < base64StrLength; i++) { if (i % 4) { var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2); var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2); words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8); nBytes++; } }
            return WordArray.create(words, nBytes);
        }
    })(); (function (Math) {
        var C = CryptoJS; var C_lib = C.lib; var WordArray = C_lib.WordArray; var Hasher = C_lib.Hasher; var C_algo = C.algo; var T = []; (function () { for (var i = 0; i < 64; i++) { T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0; } })(); var MD5 = (C_algo.MD5 = Hasher.extend({
            _doReset: function () { this._hash = new WordArray.init([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476]); }, _doProcessBlock: function (M, offset) {
                for (var i = 0; i < 16; i++) { var offset_i = offset + i; var M_offset_i = M[offset_i]; M[offset_i] = (((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) | (((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00); }
                var H = this._hash.words; var M_offset_0 = M[offset + 0]; var M_offset_1 = M[offset + 1]; var M_offset_2 = M[offset + 2]; var M_offset_3 = M[offset + 3]; var M_offset_4 = M[offset + 4]; var M_offset_5 = M[offset + 5]; var M_offset_6 = M[offset + 6]; var M_offset_7 = M[offset + 7]; var M_offset_8 = M[offset + 8]; var M_offset_9 = M[offset + 9]; var M_offset_10 = M[offset + 10]; var M_offset_11 = M[offset + 11]; var M_offset_12 = M[offset + 12]; var M_offset_13 = M[offset + 13]; var M_offset_14 = M[offset + 14]; var M_offset_15 = M[offset + 15]; var a = H[0]; var b = H[1]; var c = H[2]; var d = H[3]; a = FF(a, b, c, d, M_offset_0, 7, T[0]); d = FF(d, a, b, c, M_offset_1, 12, T[1]); c = FF(c, d, a, b, M_offset_2, 17, T[2]); b = FF(b, c, d, a, M_offset_3, 22, T[3]); a = FF(a, b, c, d, M_offset_4, 7, T[4]); d = FF(d, a, b, c, M_offset_5, 12, T[5]); c = FF(c, d, a, b, M_offset_6, 17, T[6]); b = FF(b, c, d, a, M_offset_7, 22, T[7]); a = FF(a, b, c, d, M_offset_8, 7, T[8]); d = FF(d, a, b, c, M_offset_9, 12, T[9]); c = FF(c, d, a, b, M_offset_10, 17, T[10]); b = FF(b, c, d, a, M_offset_11, 22, T[11]); a = FF(a, b, c, d, M_offset_12, 7, T[12]); d = FF(d, a, b, c, M_offset_13, 12, T[13]); c = FF(c, d, a, b, M_offset_14, 17, T[14]); b = FF(b, c, d, a, M_offset_15, 22, T[15]); a = GG(a, b, c, d, M_offset_1, 5, T[16]); d = GG(d, a, b, c, M_offset_6, 9, T[17]); c = GG(c, d, a, b, M_offset_11, 14, T[18]); b = GG(b, c, d, a, M_offset_0, 20, T[19]); a = GG(a, b, c, d, M_offset_5, 5, T[20]); d = GG(d, a, b, c, M_offset_10, 9, T[21]); c = GG(c, d, a, b, M_offset_15, 14, T[22]); b = GG(b, c, d, a, M_offset_4, 20, T[23]); a = GG(a, b, c, d, M_offset_9, 5, T[24]); d = GG(d, a, b, c, M_offset_14, 9, T[25]); c = GG(c, d, a, b, M_offset_3, 14, T[26]); b = GG(b, c, d, a, M_offset_8, 20, T[27]); a = GG(a, b, c, d, M_offset_13, 5, T[28]); d = GG(d, a, b, c, M_offset_2, 9, T[29]); c = GG(c, d, a, b, M_offset_7, 14, T[30]); b = GG(b, c, d, a, M_offset_12, 20, T[31]); a = HH(a, b, c, d, M_offset_5, 4, T[32]); d = HH(d, a, b, c, M_offset_8, 11, T[33]); c = HH(c, d, a, b, M_offset_11, 16, T[34]); b = HH(b, c, d, a, M_offset_14, 23, T[35]); a = HH(a, b, c, d, M_offset_1, 4, T[36]); d = HH(d, a, b, c, M_offset_4, 11, T[37]); c = HH(c, d, a, b, M_offset_7, 16, T[38]); b = HH(b, c, d, a, M_offset_10, 23, T[39]); a = HH(a, b, c, d, M_offset_13, 4, T[40]); d = HH(d, a, b, c, M_offset_0, 11, T[41]); c = HH(c, d, a, b, M_offset_3, 16, T[42]); b = HH(b, c, d, a, M_offset_6, 23, T[43]); a = HH(a, b, c, d, M_offset_9, 4, T[44]); d = HH(d, a, b, c, M_offset_12, 11, T[45]); c = HH(c, d, a, b, M_offset_15, 16, T[46]); b = HH(b, c, d, a, M_offset_2, 23, T[47]); a = II(a, b, c, d, M_offset_0, 6, T[48]); d = II(d, a, b, c, M_offset_7, 10, T[49]); c = II(c, d, a, b, M_offset_14, 15, T[50]); b = II(b, c, d, a, M_offset_5, 21, T[51]); a = II(a, b, c, d, M_offset_12, 6, T[52]); d = II(d, a, b, c, M_offset_3, 10, T[53]); c = II(c, d, a, b, M_offset_10, 15, T[54]); b = II(b, c, d, a, M_offset_1, 21, T[55]); a = II(a, b, c, d, M_offset_8, 6, T[56]); d = II(d, a, b, c, M_offset_15, 10, T[57]); c = II(c, d, a, b, M_offset_6, 15, T[58]); b = II(b, c, d, a, M_offset_13, 21, T[59]); a = II(a, b, c, d, M_offset_4, 6, T[60]); d = II(d, a, b, c, M_offset_11, 10, T[61]); c = II(c, d, a, b, M_offset_2, 15, T[62]); b = II(b, c, d, a, M_offset_9, 21, T[63]); H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
            }, _doFinalize: function () {
                var data = this._data; var dataWords = data.words; var nBitsTotal = this._nDataBytes * 8; var nBitsLeft = data.sigBytes * 8; dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32)); var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000); var nBitsTotalL = nBitsTotal; dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (((nBitsTotalH << 8) | (nBitsTotalH >>> 24)) & 0x00ff00ff) | (((nBitsTotalH << 24) | (nBitsTotalH >>> 8)) & 0xff00ff00); dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (((nBitsTotalL << 8) | (nBitsTotalL >>> 24)) & 0x00ff00ff) | (((nBitsTotalL << 24) | (nBitsTotalL >>> 8)) & 0xff00ff00); data.sigBytes = (dataWords.length + 1) * 4; this._process(); var hash = this._hash; var H = hash.words; for (var i = 0; i < 4; i++) { var H_i = H[i]; H[i] = (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) | (((H_i << 24) | (H_i >>> 8)) & 0xff00ff00); }
                return hash;
            }, clone: function () { var clone = Hasher.clone.call(this); clone._hash = this._hash.clone(); return clone; }
        })); function FF(a, b, c, d, x, s, t) { var n = a + ((b & c) | (~b & d)) + x + t; return ((n << s) | (n >>> (32 - s))) + b; }
        function GG(a, b, c, d, x, s, t) { var n = a + ((b & d) | (c & ~d)) + x + t; return ((n << s) | (n >>> (32 - s))) + b; }
        function HH(a, b, c, d, x, s, t) { var n = a + (b ^ c ^ d) + x + t; return ((n << s) | (n >>> (32 - s))) + b; }
        function II(a, b, c, d, x, s, t) { var n = a + (c ^ (b | ~d)) + x + t; return ((n << s) | (n >>> (32 - s))) + b; }
        C.MD5 = Hasher._createHelper(MD5); C.HmacMD5 = Hasher._createHmacHelper(MD5);
    })(Math); (function () {
        var C = CryptoJS; var C_lib = C.lib; var WordArray = C_lib.WordArray; var Hasher = C_lib.Hasher; var C_algo = C.algo; var W = []; var SHA1 = (C_algo.SHA1 = Hasher.extend({
            _doReset: function () { this._hash = new WordArray.init([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0]); }, _doProcessBlock: function (M, offset) {
                var H = this._hash.words; var a = H[0]; var b = H[1]; var c = H[2]; var d = H[3]; var e = H[4]; for (var i = 0; i < 80; i++) {
                    if (i < 16) { W[i] = M[offset + i] | 0; } else { var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]; W[i] = (n << 1) | (n >>> 31); }
                    var t = ((a << 5) | (a >>> 27)) + e + W[i]; if (i < 20) { t += ((b & c) | (~b & d)) + 0x5a827999; } else if (i < 40) { t += (b ^ c ^ d) + 0x6ed9eba1; } else if (i < 60) { t += ((b & c) | (b & d) | (c & d)) - 0x70e44324; } else { t += (b ^ c ^ d) - 0x359d3e2a; }
                    e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
                }
                H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0;
            }, _doFinalize: function () { var data = this._data; var dataWords = data.words; var nBitsTotal = this._nDataBytes * 8; var nBitsLeft = data.sigBytes * 8; dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32)); dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000); dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal; data.sigBytes = dataWords.length * 4; this._process(); return this._hash; }, clone: function () { var clone = Hasher.clone.call(this); clone._hash = this._hash.clone(); return clone; }
        })); C.SHA1 = Hasher._createHelper(SHA1); C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
    })(); (function (Math) {
        var C = CryptoJS; var C_lib = C.lib; var WordArray = C_lib.WordArray; var Hasher = C_lib.Hasher; var C_algo = C.algo; var H = []; var K = []; (function () {
            function isPrime(n) {
                var sqrtN = Math.sqrt(n); for (var factor = 2; factor <= sqrtN; factor++) { if (!(n % factor)) { return false; } }
                return true;
            }
            function getFractionalBits(n) { return ((n - (n | 0)) * 0x100000000) | 0; }
            var n = 2; var nPrime = 0; while (nPrime < 64) {
                if (isPrime(n)) {
                    if (nPrime < 8) { H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2)); }
                    K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3)); nPrime++;
                }
                n++;
            }
        })(); var W = []; var SHA256 = (C_algo.SHA256 = Hasher.extend({
            _doReset: function () { this._hash = new WordArray.init(H.slice(0)); }, _doProcessBlock: function (M, offset) {
                var H = this._hash.words; var a = H[0]; var b = H[1]; var c = H[2]; var d = H[3]; var e = H[4]; var f = H[5]; var g = H[6]; var h = H[7]; for (var i = 0; i < 64; i++) {
                    if (i < 16) { W[i] = M[offset + i] | 0; } else { var gamma0x = W[i - 15]; var gamma0 = ((gamma0x << 25) | (gamma0x >>> 7)) ^ ((gamma0x << 14) | (gamma0x >>> 18)) ^ (gamma0x >>> 3); var gamma1x = W[i - 2]; var gamma1 = ((gamma1x << 15) | (gamma1x >>> 17)) ^ ((gamma1x << 13) | (gamma1x >>> 19)) ^ (gamma1x >>> 10); W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]; }
                    var ch = (e & f) ^ (~e & g); var maj = (a & b) ^ (a & c) ^ (b & c); var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22)); var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7) | (e >>> 25)); var t1 = h + sigma1 + ch + K[i] + W[i]; var t2 = sigma0 + maj; h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
                }
                H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
            }, _doFinalize: function () { var data = this._data; var dataWords = data.words; var nBitsTotal = this._nDataBytes * 8; var nBitsLeft = data.sigBytes * 8; dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32)); dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000); dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal; data.sigBytes = dataWords.length * 4; this._process(); return this._hash; }, clone: function () { var clone = Hasher.clone.call(this); clone._hash = this._hash.clone(); return clone; }
        })); C.SHA256 = Hasher._createHelper(SHA256); C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
    })(Math); (function () {
        var C = CryptoJS; var C_lib = C.lib; var WordArray = C_lib.WordArray; var C_enc = C.enc; var Utf16BE = (C_enc.Utf16 = C_enc.Utf16BE = {
            stringify: function (wordArray) {
                var words = wordArray.words; var sigBytes = wordArray.sigBytes; var utf16Chars = []; for (var i = 0; i < sigBytes; i += 2) { var codePoint = (words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff; utf16Chars.push(String.fromCharCode(codePoint)); }
                return utf16Chars.join("");
            }, parse: function (utf16Str) {
                var utf16StrLength = utf16Str.length; var words = []; for (var i = 0; i < utf16StrLength; i++) { words[i >>> 1] |= utf16Str.charCodeAt(i) << (16 - (i % 2) * 16); }
                return WordArray.create(words, utf16StrLength * 2);
            }
        }); C_enc.Utf16LE = {
            stringify: function (wordArray) {
                var words = wordArray.words; var sigBytes = wordArray.sigBytes; var utf16Chars = []; for (var i = 0; i < sigBytes; i += 2) { var codePoint = swapEndian((words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff); utf16Chars.push(String.fromCharCode(codePoint)); }
                return utf16Chars.join("");
            }, parse: function (utf16Str) {
                var utf16StrLength = utf16Str.length; var words = []; for (var i = 0; i < utf16StrLength; i++) { words[i >>> 1] |= swapEndian(utf16Str.charCodeAt(i) << (16 - (i % 2) * 16)); }
                return WordArray.create(words, utf16StrLength * 2);
            }
        }; function swapEndian(word) { return ((word << 8) & 0xff00ff00) | ((word >>> 8) & 0x00ff00ff); }
    })(); (function () {
        if (typeof ArrayBuffer != "function") { return; }
        var C = CryptoJS; var C_lib = C.lib; var WordArray = C_lib.WordArray; var superInit = WordArray.init; var subInit = (WordArray.init = function (typedArray) {
            if (typedArray instanceof ArrayBuffer) { typedArray = new Uint8Array(typedArray); }
            if (typedArray instanceof Int8Array || (typeof Uint8ClampedArray !== "undefined" && typedArray instanceof Uint8ClampedArray) || typedArray instanceof Int16Array || typedArray instanceof Uint16Array || typedArray instanceof Int32Array || typedArray instanceof Uint32Array || typedArray instanceof Float32Array || typedArray instanceof Float64Array) { typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength); }
            if (typedArray instanceof Uint8Array) {
                var typedArrayByteLength = typedArray.byteLength; var words = []; for (var i = 0; i < typedArrayByteLength; i++) { words[i >>> 2] |= typedArray[i] << (24 - (i % 4) * 8); }
                superInit.call(this, words, typedArrayByteLength);
            } else { superInit.apply(this, arguments); }
        }); subInit.prototype = WordArray;
    })(); (function (Math) {
        var C = CryptoJS; var C_lib = C.lib; var WordArray = C_lib.WordArray; var Hasher = C_lib.Hasher; var C_algo = C.algo; var _zl = WordArray.create([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13]); var _zr = WordArray.create([5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11]); var _sl = WordArray.create([11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6]); var _sr = WordArray.create([8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11]); var _hl = WordArray.create([0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e]); var _hr = WordArray.create([0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000]); var RIPEMD160 = (C_algo.RIPEMD160 = Hasher.extend({
            _doReset: function () { this._hash = WordArray.create([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0]); }, _doProcessBlock: function (M, offset) {
                for (var i = 0; i < 16; i++) { var offset_i = offset + i; var M_offset_i = M[offset_i]; M[offset_i] = (((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) | (((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00); }
                var H = this._hash.words; var hl = _hl.words; var hr = _hr.words; var zl = _zl.words; var zr = _zr.words; var sl = _sl.words; var sr = _sr.words; var al, bl, cl, dl, el; var ar, br, cr, dr, er; ar = al = H[0]; br = bl = H[1]; cr = cl = H[2]; dr = dl = H[3]; er = el = H[4]; var t; for (var i = 0; i < 80; i += 1) {
                    t = (al + M[offset + zl[i]]) | 0; if (i < 16) { t += f1(bl, cl, dl) + hl[0]; } else if (i < 32) { t += f2(bl, cl, dl) + hl[1]; } else if (i < 48) { t += f3(bl, cl, dl) + hl[2]; } else if (i < 64) { t += f4(bl, cl, dl) + hl[3]; } else { t += f5(bl, cl, dl) + hl[4]; }
                    t = t | 0; t = rotl(t, sl[i]); t = (t + el) | 0; al = el; el = dl; dl = rotl(cl, 10); cl = bl; bl = t; t = (ar + M[offset + zr[i]]) | 0; if (i < 16) { t += f5(br, cr, dr) + hr[0]; } else if (i < 32) { t += f4(br, cr, dr) + hr[1]; } else if (i < 48) { t += f3(br, cr, dr) + hr[2]; } else if (i < 64) { t += f2(br, cr, dr) + hr[3]; } else { t += f1(br, cr, dr) + hr[4]; }
                    t = t | 0; t = rotl(t, sr[i]); t = (t + er) | 0; ar = er; er = dr; dr = rotl(cr, 10); cr = br; br = t;
                }
                t = (H[1] + cl + dr) | 0; H[1] = (H[2] + dl + er) | 0; H[2] = (H[3] + el + ar) | 0; H[3] = (H[4] + al + br) | 0; H[4] = (H[0] + bl + cr) | 0; H[0] = t;
            }, _doFinalize: function () {
                var data = this._data; var dataWords = data.words; var nBitsTotal = this._nDataBytes * 8; var nBitsLeft = data.sigBytes * 8; dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32)); dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (((nBitsTotal << 8) | (nBitsTotal >>> 24)) & 0x00ff00ff) | (((nBitsTotal << 24) | (nBitsTotal >>> 8)) & 0xff00ff00); data.sigBytes = (dataWords.length + 1) * 4; this._process(); var hash = this._hash; var H = hash.words; for (var i = 0; i < 5; i++) { var H_i = H[i]; H[i] = (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) | (((H_i << 24) | (H_i >>> 8)) & 0xff00ff00); }
                return hash;
            }, clone: function () { var clone = Hasher.clone.call(this); clone._hash = this._hash.clone(); return clone; }
        })); function f1(x, y, z) { return x ^ y ^ z; }
        function f2(x, y, z) { return (x & y) | (~x & z); }
        function f3(x, y, z) { return (x | ~y) ^ z; }
        function f4(x, y, z) { return (x & z) | (y & ~z); }
        function f5(x, y, z) { return x ^ (y | ~z); }
        function rotl(x, n) { return (x << n) | (x >>> (32 - n)); }
        C.RIPEMD160 = Hasher._createHelper(RIPEMD160); C.HmacRIPEMD160 = Hasher._createHmacHelper(RIPEMD160);
    })(Math); (function () {
        var C = CryptoJS; var C_lib = C.lib; var Base = C_lib.Base; var C_enc = C.enc; var Utf8 = C_enc.Utf8; var C_algo = C.algo; var HMAC = (C_algo.HMAC = Base.extend({
            init: function (hasher, key) {
                hasher = this._hasher = new hasher.init(); if (typeof key == "string") { key = Utf8.parse(key); }
                var hasherBlockSize = hasher.blockSize; var hasherBlockSizeBytes = hasherBlockSize * 4; if (key.sigBytes > hasherBlockSizeBytes) { key = hasher.finalize(key); }
                key.clamp(); var oKey = (this._oKey = key.clone()); var iKey = (this._iKey = key.clone()); var oKeyWords = oKey.words; var iKeyWords = iKey.words; for (var i = 0; i < hasherBlockSize; i++) { oKeyWords[i] ^= 0x5c5c5c5c; iKeyWords[i] ^= 0x36363636; }
                oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes; this.reset();
            }, reset: function () { var hasher = this._hasher; hasher.reset(); hasher.update(this._iKey); }, update: function (messageUpdate) { this._hasher.update(messageUpdate); return this; }, finalize: function (messageUpdate) { var hasher = this._hasher; var innerHash = hasher.finalize(messageUpdate); hasher.reset(); var hmac = hasher.finalize(this._oKey.clone().concat(innerHash)); return hmac; }
        }));
    })(); (function () {
        var C = CryptoJS; var C_lib = C.lib; var Base = C_lib.Base; var WordArray = C_lib.WordArray; var C_algo = C.algo; var SHA1 = C_algo.SHA1; var HMAC = C_algo.HMAC; var PBKDF2 = (C_algo.PBKDF2 = Base.extend({
            cfg: Base.extend({ keySize: 128 / 32, hasher: SHA1, iterations: 1 }), init: function (cfg) { this.cfg = this.cfg.extend(cfg); }, compute: function (password, salt) {
                var cfg = this.cfg; var hmac = HMAC.create(cfg.hasher, password); var derivedKey = WordArray.create(); var blockIndex = WordArray.create([0x00000001]); var derivedKeyWords = derivedKey.words; var blockIndexWords = blockIndex.words; var keySize = cfg.keySize; var iterations = cfg.iterations; while (derivedKeyWords.length < keySize) {
                    var block = hmac.update(salt).finalize(blockIndex); hmac.reset(); var blockWords = block.words; var blockWordsLength = blockWords.length; var intermediate = block; for (var i = 1; i < iterations; i++) { intermediate = hmac.finalize(intermediate); hmac.reset(); var intermediateWords = intermediate.words; for (var j = 0; j < blockWordsLength; j++) { blockWords[j] ^= intermediateWords[j]; } }
                    derivedKey.concat(block); blockIndexWords[0]++;
                }
                derivedKey.sigBytes = keySize * 4; return derivedKey;
            }
        })); C.PBKDF2 = function (password, salt, cfg) { return PBKDF2.create(cfg).compute(password, salt); };
    })(); (function () {
        var C = CryptoJS; var C_lib = C.lib; var Base = C_lib.Base; var WordArray = C_lib.WordArray; var C_algo = C.algo; var MD5 = C_algo.MD5; var EvpKDF = (C_algo.EvpKDF = Base.extend({
            cfg: Base.extend({ keySize: 128 / 32, hasher: MD5, iterations: 1 }), init: function (cfg) { this.cfg = this.cfg.extend(cfg); }, compute: function (password, salt) {
                var cfg = this.cfg; var hasher = cfg.hasher.create(); var derivedKey = WordArray.create(); var derivedKeyWords = derivedKey.words; var keySize = cfg.keySize; var iterations = cfg.iterations; while (derivedKeyWords.length < keySize) {
                    if (block) { hasher.update(block); }
                    var block = hasher.update(password).finalize(salt); hasher.reset(); for (var i = 1; i < iterations; i++) { block = hasher.finalize(block); hasher.reset(); }
                    derivedKey.concat(block);
                }
                derivedKey.sigBytes = keySize * 4; return derivedKey;
            }
        })); C.EvpKDF = function (password, salt, cfg) { return EvpKDF.create(cfg).compute(password, salt); };
    })(); (function () { var C = CryptoJS; var C_lib = C.lib; var WordArray = C_lib.WordArray; var C_algo = C.algo; var SHA256 = C_algo.SHA256; var SHA224 = (C_algo.SHA224 = SHA256.extend({ _doReset: function () { this._hash = new WordArray.init([0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939, 0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4]); }, _doFinalize: function () { var hash = SHA256._doFinalize.call(this); hash.sigBytes -= 4; return hash; } })); C.SHA224 = SHA256._createHelper(SHA224); C.HmacSHA224 = SHA256._createHmacHelper(SHA224); })(); (function (undefined) {
        var C = CryptoJS; var C_lib = C.lib; var Base = C_lib.Base; var X32WordArray = C_lib.WordArray; var C_x64 = (C.x64 = {}); var X64Word = (C_x64.Word = Base.extend({ init: function (high, low) { this.high = high; this.low = low; } })); var X64WordArray = (C_x64.WordArray = Base.extend({
            init: function (words, sigBytes) { words = this.words = words || []; if (sigBytes != undefined) { this.sigBytes = sigBytes; } else { this.sigBytes = words.length * 8; } }, toX32: function () {
                var x64Words = this.words; var x64WordsLength = x64Words.length; var x32Words = []; for (var i = 0; i < x64WordsLength; i++) { var x64Word = x64Words[i]; x32Words.push(x64Word.high); x32Words.push(x64Word.low); }
                return X32WordArray.create(x32Words, this.sigBytes);
            }, clone: function () {
                var clone = Base.clone.call(this); var words = (clone.words = this.words.slice(0)); var wordsLength = words.length; for (var i = 0; i < wordsLength; i++) { words[i] = words[i].clone(); }
                return clone;
            }
        }));
    })(); (function (Math) {
        var C = CryptoJS; var C_lib = C.lib; var WordArray = C_lib.WordArray; var Hasher = C_lib.Hasher; var C_x64 = C.x64; var X64Word = C_x64.Word; var C_algo = C.algo; var RHO_OFFSETS = []; var PI_INDEXES = []; var ROUND_CONSTANTS = []; (function () {
            var x = 1, y = 0; for (var t = 0; t < 24; t++) { RHO_OFFSETS[x + 5 * y] = (((t + 1) * (t + 2)) / 2) % 64; var newX = y % 5; var newY = (2 * x + 3 * y) % 5; x = newX; y = newY; }
            for (var x = 0; x < 5; x++) { for (var y = 0; y < 5; y++) { PI_INDEXES[x + 5 * y] = y + ((2 * x + 3 * y) % 5) * 5; } }
            var LFSR = 0x01; for (var i = 0; i < 24; i++) {
                var roundConstantMsw = 0; var roundConstantLsw = 0; for (var j = 0; j < 7; j++) {
                    if (LFSR & 0x01) { var bitPosition = (1 << j) - 1; if (bitPosition < 32) { roundConstantLsw ^= 1 << bitPosition; } else { roundConstantMsw ^= 1 << (bitPosition - 32); } }
                    if (LFSR & 0x80) { LFSR = (LFSR << 1) ^ 0x71; } else { LFSR <<= 1; }
                }
                ROUND_CONSTANTS[i] = X64Word.create(roundConstantMsw, roundConstantLsw);
            }
        })(); var T = []; (function () { for (var i = 0; i < 25; i++) { T[i] = X64Word.create(); } })(); var SHA3 = (C_algo.SHA3 = Hasher.extend({
            cfg: Hasher.cfg.extend({ outputLength: 512 }), _doReset: function () {
                var state = (this._state = []); for (var i = 0; i < 25; i++) { state[i] = new X64Word.init(); }
                this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
            }, _doProcessBlock: function (M, offset) {
                var state = this._state; var nBlockSizeLanes = this.blockSize / 2; for (var i = 0; i < nBlockSizeLanes; i++) { var M2i = M[offset + 2 * i]; var M2i1 = M[offset + 2 * i + 1]; M2i = (((M2i << 8) | (M2i >>> 24)) & 0x00ff00ff) | (((M2i << 24) | (M2i >>> 8)) & 0xff00ff00); M2i1 = (((M2i1 << 8) | (M2i1 >>> 24)) & 0x00ff00ff) | (((M2i1 << 24) | (M2i1 >>> 8)) & 0xff00ff00); var lane = state[i]; lane.high ^= M2i1; lane.low ^= M2i; }
                for (var round = 0; round < 24; round++) {
                    for (var x = 0; x < 5; x++) {
                        var tMsw = 0, tLsw = 0; for (var y = 0; y < 5; y++) { var lane = state[x + 5 * y]; tMsw ^= lane.high; tLsw ^= lane.low; }
                        var Tx = T[x]; Tx.high = tMsw; Tx.low = tLsw;
                    }
                    for (var x = 0; x < 5; x++) { var Tx4 = T[(x + 4) % 5]; var Tx1 = T[(x + 1) % 5]; var Tx1Msw = Tx1.high; var Tx1Lsw = Tx1.low; var tMsw = Tx4.high ^ ((Tx1Msw << 1) | (Tx1Lsw >>> 31)); var tLsw = Tx4.low ^ ((Tx1Lsw << 1) | (Tx1Msw >>> 31)); for (var y = 0; y < 5; y++) { var lane = state[x + 5 * y]; lane.high ^= tMsw; lane.low ^= tLsw; } }
                    for (var laneIndex = 1; laneIndex < 25; laneIndex++) {
                        var lane = state[laneIndex]; var laneMsw = lane.high; var laneLsw = lane.low; var rhoOffset = RHO_OFFSETS[laneIndex]; if (rhoOffset < 32) { var tMsw = (laneMsw << rhoOffset) | (laneLsw >>> (32 - rhoOffset)); var tLsw = (laneLsw << rhoOffset) | (laneMsw >>> (32 - rhoOffset)); } else { var tMsw = (laneLsw << (rhoOffset - 32)) | (laneMsw >>> (64 - rhoOffset)); var tLsw = (laneMsw << (rhoOffset - 32)) | (laneLsw >>> (64 - rhoOffset)); }
                        var TPiLane = T[PI_INDEXES[laneIndex]]; TPiLane.high = tMsw; TPiLane.low = tLsw;
                    }
                    var T0 = T[0]; var state0 = state[0]; T0.high = state0.high; T0.low = state0.low; for (var x = 0; x < 5; x++) { for (var y = 0; y < 5; y++) { var laneIndex = x + 5 * y; var lane = state[laneIndex]; var TLane = T[laneIndex]; var Tx1Lane = T[((x + 1) % 5) + 5 * y]; var Tx2Lane = T[((x + 2) % 5) + 5 * y]; lane.high = TLane.high ^ (~Tx1Lane.high & Tx2Lane.high); lane.low = TLane.low ^ (~Tx1Lane.low & Tx2Lane.low); } }
                    var lane = state[0]; var roundConstant = ROUND_CONSTANTS[round]; lane.high ^= roundConstant.high; lane.low ^= roundConstant.low;
                }
            }, _doFinalize: function () {
                var data = this._data; var dataWords = data.words; var nBitsTotal = this._nDataBytes * 8; var nBitsLeft = data.sigBytes * 8; var blockSizeBits = this.blockSize * 32; dataWords[nBitsLeft >>> 5] |= 0x1 << (24 - (nBitsLeft % 32)); dataWords[((Math.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits) >>> 5) - 1] |= 0x80; data.sigBytes = dataWords.length * 4; this._process(); var state = this._state; var outputLengthBytes = this.cfg.outputLength / 8; var outputLengthLanes = outputLengthBytes / 8; var hashWords = []; for (var i = 0; i < outputLengthLanes; i++) { var lane = state[i]; var laneMsw = lane.high; var laneLsw = lane.low; laneMsw = (((laneMsw << 8) | (laneMsw >>> 24)) & 0x00ff00ff) | (((laneMsw << 24) | (laneMsw >>> 8)) & 0xff00ff00); laneLsw = (((laneLsw << 8) | (laneLsw >>> 24)) & 0x00ff00ff) | (((laneLsw << 24) | (laneLsw >>> 8)) & 0xff00ff00); hashWords.push(laneLsw); hashWords.push(laneMsw); }
                return new WordArray.init(hashWords, outputLengthBytes);
            }, clone: function () {
                var clone = Hasher.clone.call(this); var state = (clone._state = this._state.slice(0)); for (var i = 0; i < 25; i++) { state[i] = state[i].clone(); }
                return clone;
            }
        })); C.SHA3 = Hasher._createHelper(SHA3); C.HmacSHA3 = Hasher._createHmacHelper(SHA3);
    })(Math); (function () {
        var C = CryptoJS; var C_lib = C.lib; var Hasher = C_lib.Hasher; var C_x64 = C.x64; var X64Word = C_x64.Word; var X64WordArray = C_x64.WordArray; var C_algo = C.algo; function X64Word_create() { return X64Word.create.apply(X64Word, arguments); }
        var K = [X64Word_create(0x428a2f98, 0xd728ae22), X64Word_create(0x71374491, 0x23ef65cd), X64Word_create(0xb5c0fbcf, 0xec4d3b2f), X64Word_create(0xe9b5dba5, 0x8189dbbc), X64Word_create(0x3956c25b, 0xf348b538), X64Word_create(0x59f111f1, 0xb605d019), X64Word_create(0x923f82a4, 0xaf194f9b), X64Word_create(0xab1c5ed5, 0xda6d8118), X64Word_create(0xd807aa98, 0xa3030242), X64Word_create(0x12835b01, 0x45706fbe), X64Word_create(0x243185be, 0x4ee4b28c), X64Word_create(0x550c7dc3, 0xd5ffb4e2), X64Word_create(0x72be5d74, 0xf27b896f), X64Word_create(0x80deb1fe, 0x3b1696b1), X64Word_create(0x9bdc06a7, 0x25c71235), X64Word_create(0xc19bf174, 0xcf692694), X64Word_create(0xe49b69c1, 0x9ef14ad2), X64Word_create(0xefbe4786, 0x384f25e3), X64Word_create(0x0fc19dc6, 0x8b8cd5b5), X64Word_create(0x240ca1cc, 0x77ac9c65), X64Word_create(0x2de92c6f, 0x592b0275), X64Word_create(0x4a7484aa, 0x6ea6e483), X64Word_create(0x5cb0a9dc, 0xbd41fbd4), X64Word_create(0x76f988da, 0x831153b5), X64Word_create(0x983e5152, 0xee66dfab), X64Word_create(0xa831c66d, 0x2db43210), X64Word_create(0xb00327c8, 0x98fb213f), X64Word_create(0xbf597fc7, 0xbeef0ee4), X64Word_create(0xc6e00bf3, 0x3da88fc2), X64Word_create(0xd5a79147, 0x930aa725), X64Word_create(0x06ca6351, 0xe003826f), X64Word_create(0x14292967, 0x0a0e6e70), X64Word_create(0x27b70a85, 0x46d22ffc), X64Word_create(0x2e1b2138, 0x5c26c926), X64Word_create(0x4d2c6dfc, 0x5ac42aed), X64Word_create(0x53380d13, 0x9d95b3df), X64Word_create(0x650a7354, 0x8baf63de), X64Word_create(0x766a0abb, 0x3c77b2a8), X64Word_create(0x81c2c92e, 0x47edaee6), X64Word_create(0x92722c85, 0x1482353b), X64Word_create(0xa2bfe8a1, 0x4cf10364), X64Word_create(0xa81a664b, 0xbc423001), X64Word_create(0xc24b8b70, 0xd0f89791), X64Word_create(0xc76c51a3, 0x0654be30), X64Word_create(0xd192e819, 0xd6ef5218), X64Word_create(0xd6990624, 0x5565a910), X64Word_create(0xf40e3585, 0x5771202a), X64Word_create(0x106aa070, 0x32bbd1b8), X64Word_create(0x19a4c116, 0xb8d2d0c8), X64Word_create(0x1e376c08, 0x5141ab53), X64Word_create(0x2748774c, 0xdf8eeb99), X64Word_create(0x34b0bcb5, 0xe19b48a8), X64Word_create(0x391c0cb3, 0xc5c95a63), X64Word_create(0x4ed8aa4a, 0xe3418acb), X64Word_create(0x5b9cca4f, 0x7763e373), X64Word_create(0x682e6ff3, 0xd6b2b8a3), X64Word_create(0x748f82ee, 0x5defb2fc), X64Word_create(0x78a5636f, 0x43172f60), X64Word_create(0x84c87814, 0xa1f0ab72), X64Word_create(0x8cc70208, 0x1a6439ec), X64Word_create(0x90befffa, 0x23631e28), X64Word_create(0xa4506ceb, 0xde82bde9), X64Word_create(0xbef9a3f7, 0xb2c67915), X64Word_create(0xc67178f2, 0xe372532b), X64Word_create(0xca273ece, 0xea26619c), X64Word_create(0xd186b8c7, 0x21c0c207), X64Word_create(0xeada7dd6, 0xcde0eb1e), X64Word_create(0xf57d4f7f, 0xee6ed178), X64Word_create(0x06f067aa, 0x72176fba), X64Word_create(0x0a637dc5, 0xa2c898a6), X64Word_create(0x113f9804, 0xbef90dae), X64Word_create(0x1b710b35, 0x131c471b), X64Word_create(0x28db77f5, 0x23047d84), X64Word_create(0x32caab7b, 0x40c72493), X64Word_create(0x3c9ebe0a, 0x15c9bebc), X64Word_create(0x431d67c4, 0x9c100d4c), X64Word_create(0x4cc5d4be, 0xcb3e42b6), X64Word_create(0x597f299c, 0xfc657e2a), X64Word_create(0x5fcb6fab, 0x3ad6faec), X64Word_create(0x6c44198c, 0x4a475817)]; var W = []; (function () { for (var i = 0; i < 80; i++) { W[i] = X64Word_create(); } })(); var SHA512 = (C_algo.SHA512 = Hasher.extend({
            _doReset: function () { this._hash = new X64WordArray.init([new X64Word.init(0x6a09e667, 0xf3bcc908), new X64Word.init(0xbb67ae85, 0x84caa73b), new X64Word.init(0x3c6ef372, 0xfe94f82b), new X64Word.init(0xa54ff53a, 0x5f1d36f1), new X64Word.init(0x510e527f, 0xade682d1), new X64Word.init(0x9b05688c, 0x2b3e6c1f), new X64Word.init(0x1f83d9ab, 0xfb41bd6b), new X64Word.init(0x5be0cd19, 0x137e2179)]); }, _doProcessBlock: function (M, offset) {
                var H = this._hash.words; var H0 = H[0]; var H1 = H[1]; var H2 = H[2]; var H3 = H[3]; var H4 = H[4]; var H5 = H[5]; var H6 = H[6]; var H7 = H[7]; var H0h = H0.high; var H0l = H0.low; var H1h = H1.high; var H1l = H1.low; var H2h = H2.high; var H2l = H2.low; var H3h = H3.high; var H3l = H3.low; var H4h = H4.high; var H4l = H4.low; var H5h = H5.high; var H5l = H5.low; var H6h = H6.high; var H6l = H6.low; var H7h = H7.high; var H7l = H7.low; var ah = H0h; var al = H0l; var bh = H1h; var bl = H1l; var ch = H2h; var cl = H2l; var dh = H3h; var dl = H3l; var eh = H4h; var el = H4l; var fh = H5h; var fl = H5l; var gh = H6h; var gl = H6l; var hh = H7h; var hl = H7l; for (var i = 0; i < 80; i++) {
                    var Wi = W[i]; if (i < 16) { var Wih = (Wi.high = M[offset + i * 2] | 0); var Wil = (Wi.low = M[offset + i * 2 + 1] | 0); } else { var gamma0x = W[i - 15]; var gamma0xh = gamma0x.high; var gamma0xl = gamma0x.low; var gamma0h = ((gamma0xh >>> 1) | (gamma0xl << 31)) ^ ((gamma0xh >>> 8) | (gamma0xl << 24)) ^ (gamma0xh >>> 7); var gamma0l = ((gamma0xl >>> 1) | (gamma0xh << 31)) ^ ((gamma0xl >>> 8) | (gamma0xh << 24)) ^ ((gamma0xl >>> 7) | (gamma0xh << 25)); var gamma1x = W[i - 2]; var gamma1xh = gamma1x.high; var gamma1xl = gamma1x.low; var gamma1h = ((gamma1xh >>> 19) | (gamma1xl << 13)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>> 6); var gamma1l = ((gamma1xl >>> 19) | (gamma1xh << 13)) ^ ((gamma1xl << 3) | (gamma1xh >>> 29)) ^ ((gamma1xl >>> 6) | (gamma1xh << 26)); var Wi7 = W[i - 7]; var Wi7h = Wi7.high; var Wi7l = Wi7.low; var Wi16 = W[i - 16]; var Wi16h = Wi16.high; var Wi16l = Wi16.low; var Wil = gamma0l + Wi7l; var Wih = gamma0h + Wi7h + (Wil >>> 0 < gamma0l >>> 0 ? 1 : 0); var Wil = Wil + gamma1l; var Wih = Wih + gamma1h + (Wil >>> 0 < gamma1l >>> 0 ? 1 : 0); var Wil = Wil + Wi16l; var Wih = Wih + Wi16h + (Wil >>> 0 < Wi16l >>> 0 ? 1 : 0); Wi.high = Wih; Wi.low = Wil; }
                    var chh = (eh & fh) ^ (~eh & gh); var chl = (el & fl) ^ (~el & gl); var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch); var majl = (al & bl) ^ (al & cl) ^ (bl & cl); var sigma0h = ((ah >>> 28) | (al << 4)) ^ ((ah << 30) | (al >>> 2)) ^ ((ah << 25) | (al >>> 7)); var sigma0l = ((al >>> 28) | (ah << 4)) ^ ((al << 30) | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7)); var sigma1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9)); var sigma1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9)); var Ki = K[i]; var Kih = Ki.high; var Kil = Ki.low; var t1l = hl + sigma1l; var t1h = hh + sigma1h + (t1l >>> 0 < hl >>> 0 ? 1 : 0); var t1l = t1l + chl; var t1h = t1h + chh + (t1l >>> 0 < chl >>> 0 ? 1 : 0); var t1l = t1l + Kil; var t1h = t1h + Kih + (t1l >>> 0 < Kil >>> 0 ? 1 : 0); var t1l = t1l + Wil; var t1h = t1h + Wih + (t1l >>> 0 < Wil >>> 0 ? 1 : 0); var t2l = sigma0l + majl; var t2h = sigma0h + majh + (t2l >>> 0 < sigma0l >>> 0 ? 1 : 0); hh = gh; hl = gl; gh = fh; gl = fl; fh = eh; fl = el; el = (dl + t1l) | 0; eh = (dh + t1h + (el >>> 0 < dl >>> 0 ? 1 : 0)) | 0; dh = ch; dl = cl; ch = bh; cl = bl; bh = ah; bl = al; al = (t1l + t2l) | 0; ah = (t1h + t2h + (al >>> 0 < t1l >>> 0 ? 1 : 0)) | 0;
                }
                H0l = H0.low = H0l + al; H0.high = H0h + ah + (H0l >>> 0 < al >>> 0 ? 1 : 0); H1l = H1.low = H1l + bl; H1.high = H1h + bh + (H1l >>> 0 < bl >>> 0 ? 1 : 0); H2l = H2.low = H2l + cl; H2.high = H2h + ch + (H2l >>> 0 < cl >>> 0 ? 1 : 0); H3l = H3.low = H3l + dl; H3.high = H3h + dh + (H3l >>> 0 < dl >>> 0 ? 1 : 0); H4l = H4.low = H4l + el; H4.high = H4h + eh + (H4l >>> 0 < el >>> 0 ? 1 : 0); H5l = H5.low = H5l + fl; H5.high = H5h + fh + (H5l >>> 0 < fl >>> 0 ? 1 : 0); H6l = H6.low = H6l + gl; H6.high = H6h + gh + (H6l >>> 0 < gl >>> 0 ? 1 : 0); H7l = H7.low = H7l + hl; H7.high = H7h + hh + (H7l >>> 0 < hl >>> 0 ? 1 : 0);
            }, _doFinalize: function () { var data = this._data; var dataWords = data.words; var nBitsTotal = this._nDataBytes * 8; var nBitsLeft = data.sigBytes * 8; dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32)); dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 30] = Math.floor(nBitsTotal / 0x100000000); dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 31] = nBitsTotal; data.sigBytes = dataWords.length * 4; this._process(); var hash = this._hash.toX32(); return hash; }, clone: function () { var clone = Hasher.clone.call(this); clone._hash = this._hash.clone(); return clone; }, blockSize: 1024 / 32
        })); C.SHA512 = Hasher._createHelper(SHA512); C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
    })(); (function () { var C = CryptoJS; var C_x64 = C.x64; var X64Word = C_x64.Word; var X64WordArray = C_x64.WordArray; var C_algo = C.algo; var SHA512 = C_algo.SHA512; var SHA384 = (C_algo.SHA384 = SHA512.extend({ _doReset: function () { this._hash = new X64WordArray.init([new X64Word.init(0xcbbb9d5d, 0xc1059ed8), new X64Word.init(0x629a292a, 0x367cd507), new X64Word.init(0x9159015a, 0x3070dd17), new X64Word.init(0x152fecd8, 0xf70e5939), new X64Word.init(0x67332667, 0xffc00b31), new X64Word.init(0x8eb44a87, 0x68581511), new X64Word.init(0xdb0c2e0d, 0x64f98fa7), new X64Word.init(0x47b5481d, 0xbefa4fa4)]); }, _doFinalize: function () { var hash = SHA512._doFinalize.call(this); hash.sigBytes -= 16; return hash; } })); C.SHA384 = SHA512._createHelper(SHA384); C.HmacSHA384 = SHA512._createHmacHelper(SHA384); })(); CryptoJS.lib.Cipher || (function (undefined) {
        var C = CryptoJS; var C_lib = C.lib; var Base = C_lib.Base; var WordArray = C_lib.WordArray; var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm; var C_enc = C.enc; var Utf8 = C_enc.Utf8; var Base64 = C_enc.Base64; var C_algo = C.algo; var EvpKDF = C_algo.EvpKDF; var Cipher = (C_lib.Cipher = BufferedBlockAlgorithm.extend({
            cfg: Base.extend(), createEncryptor: function (key, cfg) { return this.create(this._ENC_XFORM_MODE, key, cfg); }, createDecryptor: function (key, cfg) { return this.create(this._DEC_XFORM_MODE, key, cfg); }, init: function (xformMode, key, cfg) { this.cfg = this.cfg.extend(cfg); this._xformMode = xformMode; this._key = key; this.reset(); }, reset: function () { BufferedBlockAlgorithm.reset.call(this); this._doReset(); }, process: function (dataUpdate) { this._append(dataUpdate); return this._process(); }, finalize: function (dataUpdate) {
                if (dataUpdate) { this._append(dataUpdate); }
                var finalProcessedData = this._doFinalize(); return finalProcessedData;
            }, keySize: 128 / 32, ivSize: 128 / 32, _ENC_XFORM_MODE: 1, _DEC_XFORM_MODE: 2, _createHelper: (function () {
                function selectCipherStrategy(key) { if (typeof key == "string") { return PasswordBasedCipher; } else { return SerializableCipher; } }
                return function (cipher) { return { encrypt: function (message, key, cfg) { return selectCipherStrategy(key).encrypt(cipher, message, key, cfg); }, decrypt: function (ciphertext, key, cfg) { return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg); } }; };
            })()
        })); var StreamCipher = (C_lib.StreamCipher = Cipher.extend({ _doFinalize: function () { var finalProcessedBlocks = this._process(!!"flush"); return finalProcessedBlocks; }, blockSize: 1 })); var C_mode = (C.mode = {}); var BlockCipherMode = (C_lib.BlockCipherMode = Base.extend({ createEncryptor: function (cipher, iv) { return this.Encryptor.create(cipher, iv); }, createDecryptor: function (cipher, iv) { return this.Decryptor.create(cipher, iv); }, init: function (cipher, iv) { this._cipher = cipher; this._iv = iv; } })); var CBC = (C_mode.CBC = (function () {
            var CBC = BlockCipherMode.extend(); CBC.Encryptor = CBC.extend({ processBlock: function (words, offset) { var cipher = this._cipher; var blockSize = cipher.blockSize; xorBlock.call(this, words, offset, blockSize); cipher.encryptBlock(words, offset); this._prevBlock = words.slice(offset, offset + blockSize); } }); CBC.Decryptor = CBC.extend({ processBlock: function (words, offset) { var cipher = this._cipher; var blockSize = cipher.blockSize; var thisBlock = words.slice(offset, offset + blockSize); cipher.decryptBlock(words, offset); xorBlock.call(this, words, offset, blockSize); this._prevBlock = thisBlock; } }); function xorBlock(words, offset, blockSize) {
                var iv = this._iv; if (iv) { var block = iv; this._iv = undefined; } else { var block = this._prevBlock; }
                for (var i = 0; i < blockSize; i++) { words[offset + i] ^= block[i]; }
            }
            return CBC;
        })()); var C_pad = (C.pad = {}); var Pkcs7 = (C_pad.Pkcs7 = {
            pad: function (data, blockSize) {
                var blockSizeBytes = blockSize * 4; var nPaddingBytes = blockSizeBytes - (data.sigBytes % blockSizeBytes); var paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes; var paddingWords = []; for (var i = 0; i < nPaddingBytes; i += 4) { paddingWords.push(paddingWord); }
                var padding = WordArray.create(paddingWords, nPaddingBytes); data.concat(padding);
            }, unpad: function (data) { var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff; data.sigBytes -= nPaddingBytes; }
        }); var BlockCipher = (C_lib.BlockCipher = Cipher.extend({
            cfg: Cipher.cfg.extend({ mode: CBC, padding: Pkcs7 }), reset: function () {
                Cipher.reset.call(this); var cfg = this.cfg; var iv = cfg.iv; var mode = cfg.mode; if (this._xformMode == this._ENC_XFORM_MODE) { var modeCreator = mode.createEncryptor; } else { var modeCreator = mode.createDecryptor; this._minBufferSize = 1; }
                if (this._mode && this._mode.__creator == modeCreator) { this._mode.init(this, iv && iv.words); } else { this._mode = modeCreator.call(mode, this, iv && iv.words); this._mode.__creator = modeCreator; }
            }, _doProcessBlock: function (words, offset) { this._mode.processBlock(words, offset); }, _doFinalize: function () {
                var padding = this.cfg.padding; if (this._xformMode == this._ENC_XFORM_MODE) { padding.pad(this._data, this.blockSize); var finalProcessedBlocks = this._process(!!"flush"); } else { var finalProcessedBlocks = this._process(!!"flush"); padding.unpad(finalProcessedBlocks); }
                return finalProcessedBlocks;
            }, blockSize: 128 / 32
        })); var CipherParams = (C_lib.CipherParams = Base.extend({ init: function (cipherParams) { this.mixIn(cipherParams); }, toString: function (formatter) { return (formatter || this.formatter).stringify(this); } })); var C_format = (C.format = {}); var OpenSSLFormatter = (C_format.OpenSSL = {
            stringify: function (cipherParams) {
                var ciphertext = cipherParams.ciphertext; var salt = cipherParams.salt; if (salt) { var wordArray = WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext); } else { var wordArray = ciphertext; }
                return wordArray.toString(Base64);
            }, parse: function (openSSLStr) {
                var ciphertext = Base64.parse(openSSLStr); var ciphertextWords = ciphertext.words; if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) { var salt = WordArray.create(ciphertextWords.slice(2, 4)); ciphertextWords.splice(0, 4); ciphertext.sigBytes -= 16; }
                return CipherParams.create({ ciphertext: ciphertext, salt: salt });
            }
        }); var SerializableCipher = (C_lib.SerializableCipher = Base.extend({ cfg: Base.extend({ format: OpenSSLFormatter }), encrypt: function (cipher, message, key, cfg) { cfg = this.cfg.extend(cfg); var encryptor = cipher.createEncryptor(key, cfg); var ciphertext = encryptor.finalize(message); var cipherCfg = encryptor.cfg; return CipherParams.create({ ciphertext: ciphertext, key: key, iv: cipherCfg.iv, algorithm: cipher, mode: cipherCfg.mode, padding: cipherCfg.padding, blockSize: cipher.blockSize, formatter: cfg.format }); }, decrypt: function (cipher, ciphertext, key, cfg) { cfg = this.cfg.extend(cfg); ciphertext = this._parse(ciphertext, cfg.format); var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext); return plaintext; }, _parse: function (ciphertext, format) { if (typeof ciphertext == "string") { return format.parse(ciphertext, this); } else { return ciphertext; } } })); var C_kdf = (C.kdf = {}); var OpenSSLKdf = (C_kdf.OpenSSL = {
            execute: function (password, keySize, ivSize, salt) {
                if (!salt) { salt = WordArray.random(64 / 8); }
                var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt); var iv = WordArray.create(key.words.slice(keySize), ivSize * 4); key.sigBytes = keySize * 4; return CipherParams.create({ key: key, iv: iv, salt: salt });
            }
        }); var PasswordBasedCipher = (C_lib.PasswordBasedCipher = SerializableCipher.extend({ cfg: SerializableCipher.cfg.extend({ kdf: OpenSSLKdf }), encrypt: function (cipher, message, password, cfg) { cfg = this.cfg.extend(cfg); var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize); cfg.iv = derivedParams.iv; var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg); ciphertext.mixIn(derivedParams); return ciphertext; }, decrypt: function (cipher, ciphertext, password, cfg) { cfg = this.cfg.extend(cfg); ciphertext = this._parse(ciphertext, cfg.format); var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt); cfg.iv = derivedParams.iv; var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg); return plaintext; } }));
    })(); CryptoJS.mode.CFB = (function () {
        var CFB = CryptoJS.lib.BlockCipherMode.extend(); CFB.Encryptor = CFB.extend({ processBlock: function (words, offset) { var cipher = this._cipher; var blockSize = cipher.blockSize; generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher); this._prevBlock = words.slice(offset, offset + blockSize); } }); CFB.Decryptor = CFB.extend({ processBlock: function (words, offset) { var cipher = this._cipher; var blockSize = cipher.blockSize; var thisBlock = words.slice(offset, offset + blockSize); generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher); this._prevBlock = thisBlock; } }); function generateKeystreamAndEncrypt(words, offset, blockSize, cipher) {
            var iv = this._iv; if (iv) { var keystream = iv.slice(0); this._iv = undefined; } else { var keystream = this._prevBlock; }
            cipher.encryptBlock(keystream, 0); for (var i = 0; i < blockSize; i++) { words[offset + i] ^= keystream[i]; }
        }
        return CFB;
    })(); CryptoJS.mode.ECB = (function () { var ECB = CryptoJS.lib.BlockCipherMode.extend(); ECB.Encryptor = ECB.extend({ processBlock: function (words, offset) { this._cipher.encryptBlock(words, offset); } }); ECB.Decryptor = ECB.extend({ processBlock: function (words, offset) { this._cipher.decryptBlock(words, offset); } }); return ECB; })(); CryptoJS.pad.AnsiX923 = { pad: function (data, blockSize) { var dataSigBytes = data.sigBytes; var blockSizeBytes = blockSize * 4; var nPaddingBytes = blockSizeBytes - (dataSigBytes % blockSizeBytes); var lastBytePos = dataSigBytes + nPaddingBytes - 1; data.clamp(); data.words[lastBytePos >>> 2] |= nPaddingBytes << (24 - (lastBytePos % 4) * 8); data.sigBytes += nPaddingBytes; }, unpad: function (data) { var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff; data.sigBytes -= nPaddingBytes; } }; CryptoJS.pad.Iso10126 = { pad: function (data, blockSize) { var blockSizeBytes = blockSize * 4; var nPaddingBytes = blockSizeBytes - (data.sigBytes % blockSizeBytes); data.concat(CryptoJS.lib.WordArray.random(nPaddingBytes - 1)).concat(CryptoJS.lib.WordArray.create([nPaddingBytes << 24], 1)); }, unpad: function (data) { var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff; data.sigBytes -= nPaddingBytes; } }; CryptoJS.pad.Iso97971 = { pad: function (data, blockSize) { data.concat(CryptoJS.lib.WordArray.create([0x80000000], 1)); CryptoJS.pad.ZeroPadding.pad(data, blockSize); }, unpad: function (data) { CryptoJS.pad.ZeroPadding.unpad(data); data.sigBytes--; } }; CryptoJS.mode.OFB = (function () {
        var OFB = CryptoJS.lib.BlockCipherMode.extend(); var Encryptor = (OFB.Encryptor = OFB.extend({
            processBlock: function (words, offset) {
                var cipher = this._cipher; var blockSize = cipher.blockSize; var iv = this._iv; var keystream = this._keystream; if (iv) { keystream = this._keystream = iv.slice(0); this._iv = undefined; }
                cipher.encryptBlock(keystream, 0); for (var i = 0; i < blockSize; i++) { words[offset + i] ^= keystream[i]; }
            }
        })); OFB.Decryptor = Encryptor; return OFB;
    })(); CryptoJS.pad.NoPadding = { pad: function () { }, unpad: function () { } }; (function (undefined) { var C = CryptoJS; var C_lib = C.lib; var CipherParams = C_lib.CipherParams; var C_enc = C.enc; var Hex = C_enc.Hex; var C_format = C.format; var HexFormatter = (C_format.Hex = { stringify: function (cipherParams) { return cipherParams.ciphertext.toString(Hex); }, parse: function (input) { var ciphertext = Hex.parse(input); return CipherParams.create({ ciphertext: ciphertext }); } }); })(); (function () {
        var C = CryptoJS; var C_lib = C.lib; var BlockCipher = C_lib.BlockCipher; var C_algo = C.algo; var SBOX = []; var INV_SBOX = []; var SUB_MIX_0 = []; var SUB_MIX_1 = []; var SUB_MIX_2 = []; var SUB_MIX_3 = []; var INV_SUB_MIX_0 = []; var INV_SUB_MIX_1 = []; var INV_SUB_MIX_2 = []; var INV_SUB_MIX_3 = []; (function () {
            var d = []; for (var i = 0; i < 256; i++) { if (i < 128) { d[i] = i << 1; } else { d[i] = (i << 1) ^ 0x11b; } }
            var x = 0; var xi = 0; for (var i = 0; i < 256; i++) { var sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4); sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63; SBOX[x] = sx; INV_SBOX[sx] = x; var x2 = d[x]; var x4 = d[x2]; var x8 = d[x4]; var t = (d[sx] * 0x101) ^ (sx * 0x1010100); SUB_MIX_0[x] = (t << 24) | (t >>> 8); SUB_MIX_1[x] = (t << 16) | (t >>> 16); SUB_MIX_2[x] = (t << 8) | (t >>> 24); SUB_MIX_3[x] = t; var t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100); INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8); INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16); INV_SUB_MIX_2[sx] = (t << 8) | (t >>> 24); INV_SUB_MIX_3[sx] = t; if (!x) { x = xi = 1; } else { x = x2 ^ d[d[d[x8 ^ x2]]]; xi ^= d[d[xi]]; } }
        })(); var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]; var AES = (C_algo.AES = BlockCipher.extend({
            _doReset: function () {
                if (this._nRounds && this._keyPriorReset === this._key) { return; }
                var key = (this._keyPriorReset = this._key); var keyWords = key.words; var keySize = key.sigBytes / 4; var nRounds = (this._nRounds = keySize + 6); var ksRows = (nRounds + 1) * 4; var keySchedule = (this._keySchedule = []); for (var ksRow = 0; ksRow < ksRows; ksRow++) {
                    if (ksRow < keySize) { keySchedule[ksRow] = keyWords[ksRow]; } else {
                        var t = keySchedule[ksRow - 1]; if (!(ksRow % keySize)) { t = (t << 8) | (t >>> 24); t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff]; t ^= RCON[(ksRow / keySize) | 0] << 24; } else if (keySize > 6 && ksRow % keySize == 4) { t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff]; }
                        keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
                    }
                }
                var invKeySchedule = (this._invKeySchedule = []); for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
                    var ksRow = ksRows - invKsRow; if (invKsRow % 4) { var t = keySchedule[ksRow]; } else { var t = keySchedule[ksRow - 4]; }
                    if (invKsRow < 4 || ksRow <= 4) { invKeySchedule[invKsRow] = t; } else { invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^ INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^ INV_SUB_MIX_3[SBOX[t & 0xff]]; }
                }
            }, encryptBlock: function (M, offset) { this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX); }, decryptBlock: function (M, offset) { var t = M[offset + 1]; M[offset + 1] = M[offset + 3]; M[offset + 3] = t; this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX); var t = M[offset + 1]; M[offset + 1] = M[offset + 3]; M[offset + 3] = t; }, _doCryptBlock: function (M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
                var nRounds = this._nRounds; var s0 = M[offset] ^ keySchedule[0]; var s1 = M[offset + 1] ^ keySchedule[1]; var s2 = M[offset + 2] ^ keySchedule[2]; var s3 = M[offset + 3] ^ keySchedule[3]; var ksRow = 4; for (var round = 1; round < nRounds; round++) { var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[(s1 >>> 16) & 0xff] ^ SUB_MIX_2[(s2 >>> 8) & 0xff] ^ SUB_MIX_3[s3 & 0xff] ^ keySchedule[ksRow++]; var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[(s2 >>> 16) & 0xff] ^ SUB_MIX_2[(s3 >>> 8) & 0xff] ^ SUB_MIX_3[s0 & 0xff] ^ keySchedule[ksRow++]; var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[(s3 >>> 16) & 0xff] ^ SUB_MIX_2[(s0 >>> 8) & 0xff] ^ SUB_MIX_3[s1 & 0xff] ^ keySchedule[ksRow++]; var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[(s0 >>> 16) & 0xff] ^ SUB_MIX_2[(s1 >>> 8) & 0xff] ^ SUB_MIX_3[s2 & 0xff] ^ keySchedule[ksRow++]; s0 = t0; s1 = t1; s2 = t2; s3 = t3; }
                var t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 & 0xff]) ^ keySchedule[ksRow++]; var t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 & 0xff]) ^ keySchedule[ksRow++]; var t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 & 0xff]) ^ keySchedule[ksRow++]; var t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 & 0xff]) ^ keySchedule[ksRow++]; M[offset] = t0; M[offset + 1] = t1; M[offset + 2] = t2; M[offset + 3] = t3;
            }, keySize: 256 / 32
        })); C.AES = BlockCipher._createHelper(AES);
    })(); (function () {
        var C = CryptoJS; var C_lib = C.lib; var WordArray = C_lib.WordArray; var BlockCipher = C_lib.BlockCipher; var C_algo = C.algo; var PC1 = [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4]; var PC2 = [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32]; var BIT_SHIFTS = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28]; var SBOX_P = [{ 0x0: 0x808200, 0x10000000: 0x8000, 0x20000000: 0x808002, 0x30000000: 0x2, 0x40000000: 0x200, 0x50000000: 0x808202, 0x60000000: 0x800202, 0x70000000: 0x800000, 0x80000000: 0x202, 0x90000000: 0x800200, 0xa0000000: 0x8200, 0xb0000000: 0x808000, 0xc0000000: 0x8002, 0xd0000000: 0x800002, 0xe0000000: 0x0, 0xf0000000: 0x8202, 0x8000000: 0x0, 0x18000000: 0x808202, 0x28000000: 0x8202, 0x38000000: 0x8000, 0x48000000: 0x808200, 0x58000000: 0x200, 0x68000000: 0x808002, 0x78000000: 0x2, 0x88000000: 0x800200, 0x98000000: 0x8200, 0xa8000000: 0x808000, 0xb8000000: 0x800202, 0xc8000000: 0x800002, 0xd8000000: 0x8002, 0xe8000000: 0x202, 0xf8000000: 0x800000, 0x1: 0x8000, 0x10000001: 0x2, 0x20000001: 0x808200, 0x30000001: 0x800000, 0x40000001: 0x808002, 0x50000001: 0x8200, 0x60000001: 0x200, 0x70000001: 0x800202, 0x80000001: 0x808202, 0x90000001: 0x808000, 0xa0000001: 0x800002, 0xb0000001: 0x8202, 0xc0000001: 0x202, 0xd0000001: 0x800200, 0xe0000001: 0x8002, 0xf0000001: 0x0, 0x8000001: 0x808202, 0x18000001: 0x808000, 0x28000001: 0x800000, 0x38000001: 0x200, 0x48000001: 0x8000, 0x58000001: 0x800002, 0x68000001: 0x2, 0x78000001: 0x8202, 0x88000001: 0x8002, 0x98000001: 0x800202, 0xa8000001: 0x202, 0xb8000001: 0x808200, 0xc8000001: 0x800200, 0xd8000001: 0x0, 0xe8000001: 0x8200, 0xf8000001: 0x808002 }, { 0x0: 0x40084010, 0x1000000: 0x4000, 0x2000000: 0x80000, 0x3000000: 0x40080010, 0x4000000: 0x40000010, 0x5000000: 0x40084000, 0x6000000: 0x40004000, 0x7000000: 0x10, 0x8000000: 0x84000, 0x9000000: 0x40004010, 0xa000000: 0x40000000, 0xb000000: 0x84010, 0xc000000: 0x80010, 0xd000000: 0x0, 0xe000000: 0x4010, 0xf000000: 0x40080000, 0x800000: 0x40004000, 0x1800000: 0x84010, 0x2800000: 0x10, 0x3800000: 0x40004010, 0x4800000: 0x40084010, 0x5800000: 0x40000000, 0x6800000: 0x80000, 0x7800000: 0x40080010, 0x8800000: 0x80010, 0x9800000: 0x0, 0xa800000: 0x4000, 0xb800000: 0x40080000, 0xc800000: 0x40000010, 0xd800000: 0x84000, 0xe800000: 0x40084000, 0xf800000: 0x4010, 0x10000000: 0x0, 0x11000000: 0x40080010, 0x12000000: 0x40004010, 0x13000000: 0x40084000, 0x14000000: 0x40080000, 0x15000000: 0x10, 0x16000000: 0x84010, 0x17000000: 0x4000, 0x18000000: 0x4010, 0x19000000: 0x80000, 0x1a000000: 0x80010, 0x1b000000: 0x40000010, 0x1c000000: 0x84000, 0x1d000000: 0x40004000, 0x1e000000: 0x40000000, 0x1f000000: 0x40084010, 0x10800000: 0x84010, 0x11800000: 0x80000, 0x12800000: 0x40080000, 0x13800000: 0x4000, 0x14800000: 0x40004000, 0x15800000: 0x40084010, 0x16800000: 0x10, 0x17800000: 0x40000000, 0x18800000: 0x40084000, 0x19800000: 0x40000010, 0x1a800000: 0x40004010, 0x1b800000: 0x80010, 0x1c800000: 0x0, 0x1d800000: 0x4010, 0x1e800000: 0x40080010, 0x1f800000: 0x84000 }, { 0x0: 0x104, 0x100000: 0x0, 0x200000: 0x4000100, 0x300000: 0x10104, 0x400000: 0x10004, 0x500000: 0x4000004, 0x600000: 0x4010104, 0x700000: 0x4010000, 0x800000: 0x4000000, 0x900000: 0x4010100, 0xa00000: 0x10100, 0xb00000: 0x4010004, 0xc00000: 0x4000104, 0xd00000: 0x10000, 0xe00000: 0x4, 0xf00000: 0x100, 0x80000: 0x4010100, 0x180000: 0x4010004, 0x280000: 0x0, 0x380000: 0x4000100, 0x480000: 0x4000004, 0x580000: 0x10000, 0x680000: 0x10004, 0x780000: 0x104, 0x880000: 0x4, 0x980000: 0x100, 0xa80000: 0x4010000, 0xb80000: 0x10104, 0xc80000: 0x10100, 0xd80000: 0x4000104, 0xe80000: 0x4010104, 0xf80000: 0x4000000, 0x1000000: 0x4010100, 0x1100000: 0x10004, 0x1200000: 0x10000, 0x1300000: 0x4000100, 0x1400000: 0x100, 0x1500000: 0x4010104, 0x1600000: 0x4000004, 0x1700000: 0x0, 0x1800000: 0x4000104, 0x1900000: 0x4000000, 0x1a00000: 0x4, 0x1b00000: 0x10100, 0x1c00000: 0x4010000, 0x1d00000: 0x104, 0x1e00000: 0x10104, 0x1f00000: 0x4010004, 0x1080000: 0x4000000, 0x1180000: 0x104, 0x1280000: 0x4010100, 0x1380000: 0x0, 0x1480000: 0x10004, 0x1580000: 0x4000100, 0x1680000: 0x100, 0x1780000: 0x4010004, 0x1880000: 0x10000, 0x1980000: 0x4010104, 0x1a80000: 0x10104, 0x1b80000: 0x4000004, 0x1c80000: 0x4000104, 0x1d80000: 0x4010000, 0x1e80000: 0x4, 0x1f80000: 0x10100 }, { 0x0: 0x80401000, 0x10000: 0x80001040, 0x20000: 0x401040, 0x30000: 0x80400000, 0x40000: 0x0, 0x50000: 0x401000, 0x60000: 0x80000040, 0x70000: 0x400040, 0x80000: 0x80000000, 0x90000: 0x400000, 0xa0000: 0x40, 0xb0000: 0x80001000, 0xc0000: 0x80400040, 0xd0000: 0x1040, 0xe0000: 0x1000, 0xf0000: 0x80401040, 0x8000: 0x80001040, 0x18000: 0x40, 0x28000: 0x80400040, 0x38000: 0x80001000, 0x48000: 0x401000, 0x58000: 0x80401040, 0x68000: 0x0, 0x78000: 0x80400000, 0x88000: 0x1000, 0x98000: 0x80401000, 0xa8000: 0x400000, 0xb8000: 0x1040, 0xc8000: 0x80000000, 0xd8000: 0x400040, 0xe8000: 0x401040, 0xf8000: 0x80000040, 0x100000: 0x400040, 0x110000: 0x401000, 0x120000: 0x80000040, 0x130000: 0x0, 0x140000: 0x1040, 0x150000: 0x80400040, 0x160000: 0x80401000, 0x170000: 0x80001040, 0x180000: 0x80401040, 0x190000: 0x80000000, 0x1a0000: 0x80400000, 0x1b0000: 0x401040, 0x1c0000: 0x80001000, 0x1d0000: 0x400000, 0x1e0000: 0x40, 0x1f0000: 0x1000, 0x108000: 0x80400000, 0x118000: 0x80401040, 0x128000: 0x0, 0x138000: 0x401000, 0x148000: 0x400040, 0x158000: 0x80000000, 0x168000: 0x80001040, 0x178000: 0x40, 0x188000: 0x80000040, 0x198000: 0x1000, 0x1a8000: 0x80001000, 0x1b8000: 0x80400040, 0x1c8000: 0x1040, 0x1d8000: 0x80401000, 0x1e8000: 0x400000, 0x1f8000: 0x401040 }, { 0x0: 0x80, 0x1000: 0x1040000, 0x2000: 0x40000, 0x3000: 0x20000000, 0x4000: 0x20040080, 0x5000: 0x1000080, 0x6000: 0x21000080, 0x7000: 0x40080, 0x8000: 0x1000000, 0x9000: 0x20040000, 0xa000: 0x20000080, 0xb000: 0x21040080, 0xc000: 0x21040000, 0xd000: 0x0, 0xe000: 0x1040080, 0xf000: 0x21000000, 0x800: 0x1040080, 0x1800: 0x21000080, 0x2800: 0x80, 0x3800: 0x1040000, 0x4800: 0x40000, 0x5800: 0x20040080, 0x6800: 0x21040000, 0x7800: 0x20000000, 0x8800: 0x20040000, 0x9800: 0x0, 0xa800: 0x21040080, 0xb800: 0x1000080, 0xc800: 0x20000080, 0xd800: 0x21000000, 0xe800: 0x1000000, 0xf800: 0x40080, 0x10000: 0x40000, 0x11000: 0x80, 0x12000: 0x20000000, 0x13000: 0x21000080, 0x14000: 0x1000080, 0x15000: 0x21040000, 0x16000: 0x20040080, 0x17000: 0x1000000, 0x18000: 0x21040080, 0x19000: 0x21000000, 0x1a000: 0x1040000, 0x1b000: 0x20040000, 0x1c000: 0x40080, 0x1d000: 0x20000080, 0x1e000: 0x0, 0x1f000: 0x1040080, 0x10800: 0x21000080, 0x11800: 0x1000000, 0x12800: 0x1040000, 0x13800: 0x20040080, 0x14800: 0x20000000, 0x15800: 0x1040080, 0x16800: 0x80, 0x17800: 0x21040000, 0x18800: 0x40080, 0x19800: 0x21040080, 0x1a800: 0x0, 0x1b800: 0x21000000, 0x1c800: 0x1000080, 0x1d800: 0x40000, 0x1e800: 0x20040000, 0x1f800: 0x20000080 }, { 0x0: 0x10000008, 0x100: 0x2000, 0x200: 0x10200000, 0x300: 0x10202008, 0x400: 0x10002000, 0x500: 0x200000, 0x600: 0x200008, 0x700: 0x10000000, 0x800: 0x0, 0x900: 0x10002008, 0xa00: 0x202000, 0xb00: 0x8, 0xc00: 0x10200008, 0xd00: 0x202008, 0xe00: 0x2008, 0xf00: 0x10202000, 0x80: 0x10200000, 0x180: 0x10202008, 0x280: 0x8, 0x380: 0x200000, 0x480: 0x202008, 0x580: 0x10000008, 0x680: 0x10002000, 0x780: 0x2008, 0x880: 0x200008, 0x980: 0x2000, 0xa80: 0x10002008, 0xb80: 0x10200008, 0xc80: 0x0, 0xd80: 0x10202000, 0xe80: 0x202000, 0xf80: 0x10000000, 0x1000: 0x10002000, 0x1100: 0x10200008, 0x1200: 0x10202008, 0x1300: 0x2008, 0x1400: 0x200000, 0x1500: 0x10000000, 0x1600: 0x10000008, 0x1700: 0x202000, 0x1800: 0x202008, 0x1900: 0x0, 0x1a00: 0x8, 0x1b00: 0x10200000, 0x1c00: 0x2000, 0x1d00: 0x10002008, 0x1e00: 0x10202000, 0x1f00: 0x200008, 0x1080: 0x8, 0x1180: 0x202000, 0x1280: 0x200000, 0x1380: 0x10000008, 0x1480: 0x10002000, 0x1580: 0x2008, 0x1680: 0x10202008, 0x1780: 0x10200000, 0x1880: 0x10202000, 0x1980: 0x10200008, 0x1a80: 0x2000, 0x1b80: 0x202008, 0x1c80: 0x200008, 0x1d80: 0x0, 0x1e80: 0x10000000, 0x1f80: 0x10002008 }, { 0x0: 0x100000, 0x10: 0x2000401, 0x20: 0x400, 0x30: 0x100401, 0x40: 0x2100401, 0x50: 0x0, 0x60: 0x1, 0x70: 0x2100001, 0x80: 0x2000400, 0x90: 0x100001, 0xa0: 0x2000001, 0xb0: 0x2100400, 0xc0: 0x2100000, 0xd0: 0x401, 0xe0: 0x100400, 0xf0: 0x2000000, 0x8: 0x2100001, 0x18: 0x0, 0x28: 0x2000401, 0x38: 0x2100400, 0x48: 0x100000, 0x58: 0x2000001, 0x68: 0x2000000, 0x78: 0x401, 0x88: 0x100401, 0x98: 0x2000400, 0xa8: 0x2100000, 0xb8: 0x100001, 0xc8: 0x400, 0xd8: 0x2100401, 0xe8: 0x1, 0xf8: 0x100400, 0x100: 0x2000000, 0x110: 0x100000, 0x120: 0x2000401, 0x130: 0x2100001, 0x140: 0x100001, 0x150: 0x2000400, 0x160: 0x2100400, 0x170: 0x100401, 0x180: 0x401, 0x190: 0x2100401, 0x1a0: 0x100400, 0x1b0: 0x1, 0x1c0: 0x0, 0x1d0: 0x2100000, 0x1e0: 0x2000001, 0x1f0: 0x400, 0x108: 0x100400, 0x118: 0x2000401, 0x128: 0x2100001, 0x138: 0x1, 0x148: 0x2000000, 0x158: 0x100000, 0x168: 0x401, 0x178: 0x2100400, 0x188: 0x2000001, 0x198: 0x2100000, 0x1a8: 0x0, 0x1b8: 0x2100401, 0x1c8: 0x100401, 0x1d8: 0x400, 0x1e8: 0x2000400, 0x1f8: 0x100001 }, { 0x0: 0x8000820, 0x1: 0x20000, 0x2: 0x8000000, 0x3: 0x20, 0x4: 0x20020, 0x5: 0x8020820, 0x6: 0x8020800, 0x7: 0x800, 0x8: 0x8020000, 0x9: 0x8000800, 0xa: 0x20800, 0xb: 0x8020020, 0xc: 0x820, 0xd: 0x0, 0xe: 0x8000020, 0xf: 0x20820, 0x80000000: 0x800, 0x80000001: 0x8020820, 0x80000002: 0x8000820, 0x80000003: 0x8000000, 0x80000004: 0x8020000, 0x80000005: 0x20800, 0x80000006: 0x20820, 0x80000007: 0x20, 0x80000008: 0x8000020, 0x80000009: 0x820, 0x8000000a: 0x20020, 0x8000000b: 0x8020800, 0x8000000c: 0x0, 0x8000000d: 0x8020020, 0x8000000e: 0x8000800, 0x8000000f: 0x20000, 0x10: 0x20820, 0x11: 0x8020800, 0x12: 0x20, 0x13: 0x800, 0x14: 0x8000800, 0x15: 0x8000020, 0x16: 0x8020020, 0x17: 0x20000, 0x18: 0x0, 0x19: 0x20020, 0x1a: 0x8020000, 0x1b: 0x8000820, 0x1c: 0x8020820, 0x1d: 0x20800, 0x1e: 0x820, 0x1f: 0x8000000, 0x80000010: 0x20000, 0x80000011: 0x800, 0x80000012: 0x8020020, 0x80000013: 0x20820, 0x80000014: 0x20, 0x80000015: 0x8020000, 0x80000016: 0x8000000, 0x80000017: 0x8000820, 0x80000018: 0x8020820, 0x80000019: 0x8000020, 0x8000001a: 0x8000800, 0x8000001b: 0x0, 0x8000001c: 0x20800, 0x8000001d: 0x820, 0x8000001e: 0x20020, 0x8000001f: 0x8020800 }]; var SBOX_MASK = [0xf8000001, 0x1f800000, 0x01f80000, 0x001f8000, 0x0001f800, 0x00001f80, 0x000001f8, 0x8000001f]; var DES = (C_algo.DES = BlockCipher.extend({
            _doReset: function () {
                var key = this._key; var keyWords = key.words; var keyBits = []; for (var i = 0; i < 56; i++) { var keyBitPos = PC1[i] - 1; keyBits[i] = (keyWords[keyBitPos >>> 5] >>> (31 - (keyBitPos % 32))) & 1; }
                var subKeys = (this._subKeys = []); for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
                    var subKey = (subKeys[nSubKey] = []); var bitShift = BIT_SHIFTS[nSubKey]; for (var i = 0; i < 24; i++) { subKey[(i / 6) | 0] |= keyBits[(PC2[i] - 1 + bitShift) % 28] << (31 - (i % 6)); subKey[4 + ((i / 6) | 0)] |= keyBits[28 + ((PC2[i + 24] - 1 + bitShift) % 28)] << (31 - (i % 6)); }
                    subKey[0] = (subKey[0] << 1) | (subKey[0] >>> 31); for (var i = 1; i < 7; i++) { subKey[i] = subKey[i] >>> ((i - 1) * 4 + 3); }
                    subKey[7] = (subKey[7] << 5) | (subKey[7] >>> 27);
                }
                var invSubKeys = (this._invSubKeys = []); for (var i = 0; i < 16; i++) { invSubKeys[i] = subKeys[15 - i]; }
            }, encryptBlock: function (M, offset) { this._doCryptBlock(M, offset, this._subKeys); }, decryptBlock: function (M, offset) { this._doCryptBlock(M, offset, this._invSubKeys); }, _doCryptBlock: function (M, offset, subKeys) {
                this._lBlock = M[offset]; this._rBlock = M[offset + 1]; exchangeLR.call(this, 4, 0x0f0f0f0f); exchangeLR.call(this, 16, 0x0000ffff); exchangeRL.call(this, 2, 0x33333333); exchangeRL.call(this, 8, 0x00ff00ff); exchangeLR.call(this, 1, 0x55555555); for (var round = 0; round < 16; round++) {
                    var subKey = subKeys[round]; var lBlock = this._lBlock; var rBlock = this._rBlock; var f = 0; for (var i = 0; i < 8; i++) { f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0]; }
                    this._lBlock = rBlock; this._rBlock = lBlock ^ f;
                }
                var t = this._lBlock; this._lBlock = this._rBlock; this._rBlock = t; exchangeLR.call(this, 1, 0x55555555); exchangeRL.call(this, 8, 0x00ff00ff); exchangeRL.call(this, 2, 0x33333333); exchangeLR.call(this, 16, 0x0000ffff); exchangeLR.call(this, 4, 0x0f0f0f0f); M[offset] = this._lBlock; M[offset + 1] = this._rBlock;
            }, keySize: 64 / 32, ivSize: 64 / 32, blockSize: 64 / 32
        })); function exchangeLR(offset, mask) { var t = ((this._lBlock >>> offset) ^ this._rBlock) & mask; this._rBlock ^= t; this._lBlock ^= t << offset; }
        function exchangeRL(offset, mask) { var t = ((this._rBlock >>> offset) ^ this._lBlock) & mask; this._lBlock ^= t; this._rBlock ^= t << offset; }
        C.DES = BlockCipher._createHelper(DES); var TripleDES = (C_algo.TripleDES = BlockCipher.extend({ _doReset: function () { var key = this._key; var keyWords = key.words; this._des1 = DES.createEncryptor(WordArray.create(keyWords.slice(0, 2))); this._des2 = DES.createEncryptor(WordArray.create(keyWords.slice(2, 4))); this._des3 = DES.createEncryptor(WordArray.create(keyWords.slice(4, 6))); }, encryptBlock: function (M, offset) { this._des1.encryptBlock(M, offset); this._des2.decryptBlock(M, offset); this._des3.encryptBlock(M, offset); }, decryptBlock: function (M, offset) { this._des3.decryptBlock(M, offset); this._des2.encryptBlock(M, offset); this._des1.decryptBlock(M, offset); }, keySize: 192 / 32, ivSize: 64 / 32, blockSize: 64 / 32 })); C.TripleDES = BlockCipher._createHelper(TripleDES);
    })(); (function () {
        var C = CryptoJS; var C_lib = C.lib; var StreamCipher = C_lib.StreamCipher; var C_algo = C.algo; var RC4 = (C_algo.RC4 = StreamCipher.extend({
            _doReset: function () {
                var key = this._key; var keyWords = key.words; var keySigBytes = key.sigBytes; var S = (this._S = []); for (var i = 0; i < 256; i++) { S[i] = i; }
                for (var i = 0, j = 0; i < 256; i++) { var keyByteIndex = i % keySigBytes; var keyByte = (keyWords[keyByteIndex >>> 2] >>> (24 - (keyByteIndex % 4) * 8)) & 0xff; j = (j + S[i] + keyByte) % 256; var t = S[i]; S[i] = S[j]; S[j] = t; }
                this._i = this._j = 0;
            }, _doProcessBlock: function (M, offset) { M[offset] ^= generateKeystreamWord.call(this); }, keySize: 256 / 32, ivSize: 0
        })); function generateKeystreamWord() {
            var S = this._S; var i = this._i; var j = this._j; var keystreamWord = 0; for (var n = 0; n < 4; n++) { i = (i + 1) % 256; j = (j + S[i]) % 256; var t = S[i]; S[i] = S[j]; S[j] = t; keystreamWord |= S[(S[i] + S[j]) % 256] << (24 - n * 8); }
            this._i = i; this._j = j; return keystreamWord;
        }
        C.RC4 = StreamCipher._createHelper(RC4); var RC4Drop = (C_algo.RC4Drop = RC4.extend({ cfg: RC4.cfg.extend({ drop: 192 }), _doReset: function () { RC4._doReset.call(this); for (var i = this.cfg.drop; i > 0; i--) { generateKeystreamWord.call(this); } } })); C.RC4Drop = StreamCipher._createHelper(RC4Drop);
    })(); CryptoJS.mode.CTRGladman = (function () {
        var CTRGladman = CryptoJS.lib.BlockCipherMode.extend(); function incWord(word) {
            if (((word >> 24) & 0xff) === 0xff) {
                var b1 = (word >> 16) & 0xff; var b2 = (word >> 8) & 0xff; var b3 = word & 0xff; if (b1 === 0xff) { b1 = 0; if (b2 === 0xff) { b2 = 0; if (b3 === 0xff) { b3 = 0; } else { ++b3; } } else { ++b2; } } else { ++b1; }
                word = 0; word += b1 << 16; word += b2 << 8; word += b3;
            } else { word += 0x01 << 24; }
            return word;
        }
        function incCounter(counter) {
            if ((counter[0] = incWord(counter[0])) === 0) { counter[1] = incWord(counter[1]); }
            return counter;
        }
        var Encryptor = (CTRGladman.Encryptor = CTRGladman.extend({
            processBlock: function (words, offset) {
                var cipher = this._cipher; var blockSize = cipher.blockSize; var iv = this._iv; var counter = this._counter; if (iv) { counter = this._counter = iv.slice(0); this._iv = undefined; }
                incCounter(counter); var keystream = counter.slice(0); cipher.encryptBlock(keystream, 0); for (var i = 0; i < blockSize; i++) { words[offset + i] ^= keystream[i]; }
            }
        })); CTRGladman.Decryptor = Encryptor; return CTRGladman;
    })(); (function () {
        var C = CryptoJS; var C_lib = C.lib; var StreamCipher = C_lib.StreamCipher; var C_algo = C.algo; var S = []; var C_ = []; var G = []; var Rabbit = (C_algo.Rabbit = StreamCipher.extend({
            _doReset: function () {
                var K = this._key.words; var iv = this.cfg.iv; for (var i = 0; i < 4; i++) { K[i] = (((K[i] << 8) | (K[i] >>> 24)) & 0x00ff00ff) | (((K[i] << 24) | (K[i] >>> 8)) & 0xff00ff00); }
                var X = (this._X = [K[0], (K[3] << 16) | (K[2] >>> 16), K[1], (K[0] << 16) | (K[3] >>> 16), K[2], (K[1] << 16) | (K[0] >>> 16), K[3], (K[2] << 16) | (K[1] >>> 16)]); var C = (this._C = [(K[2] << 16) | (K[2] >>> 16), (K[0] & 0xffff0000) | (K[1] & 0x0000ffff), (K[3] << 16) | (K[3] >>> 16), (K[1] & 0xffff0000) | (K[2] & 0x0000ffff), (K[0] << 16) | (K[0] >>> 16), (K[2] & 0xffff0000) | (K[3] & 0x0000ffff), (K[1] << 16) | (K[1] >>> 16), (K[3] & 0xffff0000) | (K[0] & 0x0000ffff)]); this._b = 0; for (var i = 0; i < 4; i++) { nextState.call(this); }
                for (var i = 0; i < 8; i++) { C[i] ^= X[(i + 4) & 7]; }
                if (iv) { var IV = iv.words; var IV_0 = IV[0]; var IV_1 = IV[1]; var i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00); var i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00); var i1 = (i0 >>> 16) | (i2 & 0xffff0000); var i3 = (i2 << 16) | (i0 & 0x0000ffff); C[0] ^= i0; C[1] ^= i1; C[2] ^= i2; C[3] ^= i3; C[4] ^= i0; C[5] ^= i1; C[6] ^= i2; C[7] ^= i3; for (var i = 0; i < 4; i++) { nextState.call(this); } }
            }, _doProcessBlock: function (M, offset) { var X = this._X; nextState.call(this); S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16); S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16); S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16); S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16); for (var i = 0; i < 4; i++) { S[i] = (((S[i] << 8) | (S[i] >>> 24)) & 0x00ff00ff) | (((S[i] << 24) | (S[i] >>> 8)) & 0xff00ff00); M[offset + i] ^= S[i]; } }, blockSize: 128 / 32, ivSize: 64 / 32
        })); function nextState() {
            var X = this._X; var C = this._C; for (var i = 0; i < 8; i++) { C_[i] = C[i]; }
            C[0] = (C[0] + 0x4d34d34d + this._b) | 0; C[1] = (C[1] + 0xd34d34d3 + (C[0] >>> 0 < C_[0] >>> 0 ? 1 : 0)) | 0; C[2] = (C[2] + 0x34d34d34 + (C[1] >>> 0 < C_[1] >>> 0 ? 1 : 0)) | 0; C[3] = (C[3] + 0x4d34d34d + (C[2] >>> 0 < C_[2] >>> 0 ? 1 : 0)) | 0; C[4] = (C[4] + 0xd34d34d3 + (C[3] >>> 0 < C_[3] >>> 0 ? 1 : 0)) | 0; C[5] = (C[5] + 0x34d34d34 + (C[4] >>> 0 < C_[4] >>> 0 ? 1 : 0)) | 0; C[6] = (C[6] + 0x4d34d34d + (C[5] >>> 0 < C_[5] >>> 0 ? 1 : 0)) | 0; C[7] = (C[7] + 0xd34d34d3 + (C[6] >>> 0 < C_[6] >>> 0 ? 1 : 0)) | 0; this._b = C[7] >>> 0 < C_[7] >>> 0 ? 1 : 0; for (var i = 0; i < 8; i++) { var gx = X[i] + C[i]; var ga = gx & 0xffff; var gb = gx >>> 16; var gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb; var gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0); G[i] = gh ^ gl; }
            X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0; X[1] = (G[1] + ((G[0] << 8) | (G[0] >>> 24)) + G[7]) | 0; X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0; X[3] = (G[3] + ((G[2] << 8) | (G[2] >>> 24)) + G[1]) | 0; X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0; X[5] = (G[5] + ((G[4] << 8) | (G[4] >>> 24)) + G[3]) | 0; X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0; X[7] = (G[7] + ((G[6] << 8) | (G[6] >>> 24)) + G[5]) | 0;
        }
        C.Rabbit = StreamCipher._createHelper(Rabbit);
    })(); CryptoJS.mode.CTR = (function () {
        var CTR = CryptoJS.lib.BlockCipherMode.extend(); var Encryptor = (CTR.Encryptor = CTR.extend({
            processBlock: function (words, offset) {
                var cipher = this._cipher; var blockSize = cipher.blockSize; var iv = this._iv; var counter = this._counter; if (iv) { counter = this._counter = iv.slice(0); this._iv = undefined; }
                var keystream = counter.slice(0); cipher.encryptBlock(keystream, 0); counter[blockSize - 1] = (counter[blockSize - 1] + 1) | 0; for (var i = 0; i < blockSize; i++) { words[offset + i] ^= keystream[i]; }
            }
        })); CTR.Decryptor = Encryptor; return CTR;
    })(); (function () {
        var C = CryptoJS; var C_lib = C.lib; var StreamCipher = C_lib.StreamCipher; var C_algo = C.algo; var S = []; var C_ = []; var G = []; var RabbitLegacy = (C_algo.RabbitLegacy = StreamCipher.extend({
            _doReset: function () {
                var K = this._key.words; var iv = this.cfg.iv; var X = (this._X = [K[0], (K[3] << 16) | (K[2] >>> 16), K[1], (K[0] << 16) | (K[3] >>> 16), K[2], (K[1] << 16) | (K[0] >>> 16), K[3], (K[2] << 16) | (K[1] >>> 16)]); var C = (this._C = [(K[2] << 16) | (K[2] >>> 16), (K[0] & 0xffff0000) | (K[1] & 0x0000ffff), (K[3] << 16) | (K[3] >>> 16), (K[1] & 0xffff0000) | (K[2] & 0x0000ffff), (K[0] << 16) | (K[0] >>> 16), (K[2] & 0xffff0000) | (K[3] & 0x0000ffff), (K[1] << 16) | (K[1] >>> 16), (K[3] & 0xffff0000) | (K[0] & 0x0000ffff)]); this._b = 0; for (var i = 0; i < 4; i++) { nextState.call(this); }
                for (var i = 0; i < 8; i++) { C[i] ^= X[(i + 4) & 7]; }
                if (iv) { var IV = iv.words; var IV_0 = IV[0]; var IV_1 = IV[1]; var i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00); var i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00); var i1 = (i0 >>> 16) | (i2 & 0xffff0000); var i3 = (i2 << 16) | (i0 & 0x0000ffff); C[0] ^= i0; C[1] ^= i1; C[2] ^= i2; C[3] ^= i3; C[4] ^= i0; C[5] ^= i1; C[6] ^= i2; C[7] ^= i3; for (var i = 0; i < 4; i++) { nextState.call(this); } }
            }, _doProcessBlock: function (M, offset) { var X = this._X; nextState.call(this); S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16); S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16); S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16); S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16); for (var i = 0; i < 4; i++) { S[i] = (((S[i] << 8) | (S[i] >>> 24)) & 0x00ff00ff) | (((S[i] << 24) | (S[i] >>> 8)) & 0xff00ff00); M[offset + i] ^= S[i]; } }, blockSize: 128 / 32, ivSize: 64 / 32
        })); function nextState() {
            var X = this._X; var C = this._C; for (var i = 0; i < 8; i++) { C_[i] = C[i]; }
            C[0] = (C[0] + 0x4d34d34d + this._b) | 0; C[1] = (C[1] + 0xd34d34d3 + (C[0] >>> 0 < C_[0] >>> 0 ? 1 : 0)) | 0; C[2] = (C[2] + 0x34d34d34 + (C[1] >>> 0 < C_[1] >>> 0 ? 1 : 0)) | 0; C[3] = (C[3] + 0x4d34d34d + (C[2] >>> 0 < C_[2] >>> 0 ? 1 : 0)) | 0; C[4] = (C[4] + 0xd34d34d3 + (C[3] >>> 0 < C_[3] >>> 0 ? 1 : 0)) | 0; C[5] = (C[5] + 0x34d34d34 + (C[4] >>> 0 < C_[4] >>> 0 ? 1 : 0)) | 0; C[6] = (C[6] + 0x4d34d34d + (C[5] >>> 0 < C_[5] >>> 0 ? 1 : 0)) | 0; C[7] = (C[7] + 0xd34d34d3 + (C[6] >>> 0 < C_[6] >>> 0 ? 1 : 0)) | 0; this._b = C[7] >>> 0 < C_[7] >>> 0 ? 1 : 0; for (var i = 0; i < 8; i++) { var gx = X[i] + C[i]; var ga = gx & 0xffff; var gb = gx >>> 16; var gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb; var gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0); G[i] = gh ^ gl; }
            X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0; X[1] = (G[1] + ((G[0] << 8) | (G[0] >>> 24)) + G[7]) | 0; X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0; X[3] = (G[3] + ((G[2] << 8) | (G[2] >>> 24)) + G[1]) | 0; X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0; X[5] = (G[5] + ((G[4] << 8) | (G[4] >>> 24)) + G[3]) | 0; X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0; X[7] = (G[7] + ((G[6] << 8) | (G[6] >>> 24)) + G[5]) | 0;
        }
        C.RabbitLegacy = StreamCipher._createHelper(RabbitLegacy);
    })(); CryptoJS.pad.ZeroPadding = {
        pad: function (data, blockSize) { var blockSizeBytes = blockSize * 4; data.clamp(); data.sigBytes += blockSizeBytes - (data.sigBytes % blockSizeBytes || blockSizeBytes); }, unpad: function (data) {
            var dataWords = data.words; var i = data.sigBytes - 1; while (!((dataWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff)) { i--; }
            data.sigBytes = i + 1;
        }
    }; var dbits; var canary = 0xdeadbeefcafe; var j_lm = ((canary & 0xffffff) == 0xefcafe); function BigInteger(a, b, c) {
        if (a != null)
            if ("number" == typeof a) this.fromNumber(a, b, c); else if (b == null && "string" != typeof a) this.fromString(a, 256); else this.fromString(a, b);
    }
    function nbi() { return new BigInteger(null); }
    function am1(i, x, w, j, c, n) {
        while (--n >= 0) { var v = x * this[i++] + w[j] + c; c = Math.floor(v / 0x4000000); w[j++] = v & 0x3ffffff; }
        return c;
    }
    function am2(i, x, w, j, c, n) {
        var xl = x & 0x7fff, xh = x >> 15; while (--n >= 0) { var l = this[i] & 0x7fff; var h = this[i++] >> 15; var m = xh * l + h * xl; l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff); c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30); w[j++] = l & 0x3fffffff; }
        return c;
    }
    function am3(i, x, w, j, c, n) {
        var xl = x & 0x3fff, xh = x >> 14; while (--n >= 0) { var l = this[i] & 0x3fff; var h = this[i++] >> 14; var m = xh * l + h * xl; l = xl * l + ((m & 0x3fff) << 14) + w[j] + c; c = (l >> 28) + (m >> 14) + xh * h; w[j++] = l & 0xfffffff; }
        return c;
    }
    if (j_lm && (navigator.appName == "Microsoft Internet Explorer")) { BigInteger.prototype.am = am2; dbits = 30; }
    else if (j_lm && (navigator.appName != "Netscape")) { BigInteger.prototype.am = am1; dbits = 26; }
    else { BigInteger.prototype.am = am3; dbits = 28; }
    BigInteger.prototype.DB = dbits; BigInteger.prototype.DM = ((1 << dbits) - 1); BigInteger.prototype.DV = (1 << dbits); var BI_FP = 52; BigInteger.prototype.FV = Math.pow(2, BI_FP); BigInteger.prototype.F1 = BI_FP - dbits; BigInteger.prototype.F2 = 2 * dbits - BI_FP; var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz"; var BI_RC = new Array(); var rr, vv; rr = "0".charCodeAt(0); for (vv = 0; vv <= 9; ++vv)BI_RC[rr++] = vv; rr = "a".charCodeAt(0); for (vv = 10; vv < 36; ++vv)BI_RC[rr++] = vv; rr = "A".charCodeAt(0); for (vv = 10; vv < 36; ++vv)BI_RC[rr++] = vv; function int2char(n) { return BI_RM.charAt(n); }
    function intAt(s, i) { var c = BI_RC[s.charCodeAt(i)]; return (c == null) ? -1 : c; }
    function bnpCopyTo(r) { for (var i = this.t - 1; i >= 0; --i)r[i] = this[i]; r.t = this.t; r.s = this.s; }
    function bnpFromInt(x) { this.t = 1; this.s = (x < 0) ? -1 : 0; if (x > 0) this[0] = x; else if (x < -1) this[0] = x + this.DV; else this.t = 0; }
    function nbv(i) { var r = nbi(); r.fromInt(i); return r; }
    function bnpFromString(s, b) {
        var k; if (b == 16) k = 4; else if (b == 8) k = 3; else if (b == 256) k = 8; else if (b == 2) k = 1; else if (b == 32) k = 5; else if (b == 4) k = 2; else { this.fromRadix(s, b); return; }
        this.t = 0; this.s = 0; var i = s.length, mi = false, sh = 0; while (--i >= 0) {
            var x = (k == 8) ? s[i] & 0xff : intAt(s, i); if (x < 0) { if (s.charAt(i) == "-") mi = true; continue; }
            mi = false; if (sh == 0)
                this[this.t++] = x; else if (sh + k > this.DB) { this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh; this[this.t++] = (x >> (this.DB - sh)); }
            else
                this[this.t - 1] |= x << sh; sh += k; if (sh >= this.DB) sh -= this.DB;
        }
        if (k == 8 && (s[0] & 0x80) != 0) { this.s = -1; if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh; }
        this.clamp(); if (mi) BigInteger.ZERO.subTo(this, this);
    }
    function bnpClamp() { var c = this.s & this.DM; while (this.t > 0 && this[this.t - 1] == c) --this.t; }
    function bnToString(b) {
        if (this.s < 0) return "-" + this.negate().toString(b); var k; if (b == 16) k = 4; else if (b == 8) k = 3; else if (b == 2) k = 1; else if (b == 32) k = 5; else if (b == 4) k = 2; else return this.toRadix(b); var km = (1 << k) - 1, d, m = false, r = "", i = this.t; var p = this.DB - (i * this.DB) % k; if (i-- > 0) {
            if (p < this.DB && (d = this[i] >> p) > 0) { m = true; r = int2char(d); }
            while (i >= 0) {
                if (p < k) { d = (this[i] & ((1 << p) - 1)) << (k - p); d |= this[--i] >> (p += this.DB - k); }
                else { d = (this[i] >> (p -= k)) & km; if (p <= 0) { p += this.DB; --i; } }
                if (d > 0) m = true; if (m) r += int2char(d);
            }
        }
        return m ? r : "0";
    }
    function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this, r); return r; }
    function bnAbs() { return (this.s < 0) ? this.negate() : this; }
    function bnCompareTo(a) { var r = this.s - a.s; if (r != 0) return r; var i = this.t; r = i - a.t; if (r != 0) return (this.s < 0) ? -r : r; while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r; return 0; }
    function nbits(x) {
        var r = 1, t; if ((t = x >>> 16) != 0) { x = t; r += 16; }
        if ((t = x >> 8) != 0) { x = t; r += 8; }
        if ((t = x >> 4) != 0) { x = t; r += 4; }
        if ((t = x >> 2) != 0) { x = t; r += 2; }
        if ((t = x >> 1) != 0) { x = t; r += 1; }
        return r;
    }
    function bnBitLength() { if (this.t <= 0) return 0; return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM)); }
    function bnpDLShiftTo(n, r) { var i; for (i = this.t - 1; i >= 0; --i)r[i + n] = this[i]; for (i = n - 1; i >= 0; --i)r[i] = 0; r.t = this.t + n; r.s = this.s; }
    function bnpDRShiftTo(n, r) { for (var i = n; i < this.t; ++i)r[i - n] = this[i]; r.t = Math.max(this.t - n, 0); r.s = this.s; }
    function bnpLShiftTo(n, r) {
        var bs = n % this.DB; var cbs = this.DB - bs; var bm = (1 << cbs) - 1; var ds = Math.floor(n / this.DB), c = (this.s << bs) & this.DM, i; for (i = this.t - 1; i >= 0; --i) { r[i + ds + 1] = (this[i] >> cbs) | c; c = (this[i] & bm) << bs; }
        for (i = ds - 1; i >= 0; --i)r[i] = 0; r[ds] = c; r.t = this.t + ds + 1; r.s = this.s; r.clamp();
    }
    function bnpRShiftTo(n, r) {
        r.s = this.s; var ds = Math.floor(n / this.DB); if (ds >= this.t) { r.t = 0; return; }
        var bs = n % this.DB; var cbs = this.DB - bs; var bm = (1 << bs) - 1; r[0] = this[ds] >> bs; for (var i = ds + 1; i < this.t; ++i) { r[i - ds - 1] |= (this[i] & bm) << cbs; r[i - ds] = this[i] >> bs; }
        if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs; r.t = this.t - ds; r.clamp();
    }
    function bnpSubTo(a, r) {
        var i = 0, c = 0, m = Math.min(a.t, this.t); while (i < m) { c += this[i] - a[i]; r[i++] = c & this.DM; c >>= this.DB; }
        if (a.t < this.t) {
            c -= a.s; while (i < this.t) { c += this[i]; r[i++] = c & this.DM; c >>= this.DB; }
            c += this.s;
        }
        else {
            c += this.s; while (i < a.t) { c -= a[i]; r[i++] = c & this.DM; c >>= this.DB; }
            c -= a.s;
        }
        r.s = (c < 0) ? -1 : 0; if (c < -1) r[i++] = this.DV + c; else if (c > 0) r[i++] = c; r.t = i; r.clamp();
    }
    function bnpMultiplyTo(a, r) { var x = this.abs(), y = a.abs(); var i = x.t; r.t = i + y.t; while (--i >= 0) r[i] = 0; for (i = 0; i < y.t; ++i)r[i + x.t] = x.am(0, y[i], r, i, 0, x.t); r.s = 0; r.clamp(); if (this.s != a.s) BigInteger.ZERO.subTo(r, r); }
    function bnpSquareTo(r) {
        var x = this.abs(); var i = r.t = 2 * x.t; while (--i >= 0) r[i] = 0; for (i = 0; i < x.t - 1; ++i) { var c = x.am(i, x[i], r, 2 * i, 0, 1); if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) { r[i + x.t] -= x.DV; r[i + x.t + 1] = 1; } }
        if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1); r.s = 0; r.clamp();
    }
    function bnpDivRemTo(m, q, r) {
        var pm = m.abs(); if (pm.t <= 0) return; var pt = this.abs(); if (pt.t < pm.t) { if (q != null) q.fromInt(0); if (r != null) this.copyTo(r); return; }
        if (r == null) r = nbi(); var y = nbi(), ts = this.s, ms = m.s; var nsh = this.DB - nbits(pm[pm.t - 1]); if (nsh > 0) { pm.lShiftTo(nsh, y); pt.lShiftTo(nsh, r); }
        else { pm.copyTo(y); pt.copyTo(r); }
        var ys = y.t; var y0 = y[ys - 1]; if (y0 == 0) return; var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0); var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2; var i = r.t, j = i - ys, t = (q == null) ? nbi() : q; y.dlShiftTo(j, t); if (r.compareTo(t) >= 0) { r[r.t++] = 1; r.subTo(t, r); }
        BigInteger.ONE.dlShiftTo(ys, t); t.subTo(y, y); while (y.t < ys) y[y.t++] = 0; while (--j >= 0) { var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2); if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) { y.dlShiftTo(j, t); r.subTo(t, r); while (r[i] < --qd) r.subTo(t, r); } }
        if (q != null) { r.drShiftTo(ys, q); if (ts != ms) BigInteger.ZERO.subTo(q, q); }
        r.t = ys; r.clamp(); if (nsh > 0) r.rShiftTo(nsh, r); if (ts < 0) BigInteger.ZERO.subTo(r, r);
    }
    function bnMod(a) { var r = nbi(); this.abs().divRemTo(a, null, r); if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r); return r; }
    function Classic(m) { this.m = m; }
    function cConvert(x) { if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m); else return x; }
    function cRevert(x) { return x; }
    function cReduce(x) { x.divRemTo(this.m, null, x); }
    function cMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }
    function cSqrTo(x, r) { x.squareTo(r); this.reduce(r); }
    Classic.prototype.convert = cConvert; Classic.prototype.revert = cRevert; Classic.prototype.reduce = cReduce; Classic.prototype.mulTo = cMulTo; Classic.prototype.sqrTo = cSqrTo; function bnpInvDigit() { if (this.t < 1) return 0; var x = this[0]; if ((x & 1) == 0) return 0; var y = x & 3; y = (y * (2 - (x & 0xf) * y)) & 0xf; y = (y * (2 - (x & 0xff) * y)) & 0xff; y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff; y = (y * (2 - x * y % this.DV)) % this.DV; return (y > 0) ? this.DV - y : -y; }
    function Montgomery(m) { this.m = m; this.mp = m.invDigit(); this.mpl = this.mp & 0x7fff; this.mph = this.mp >> 15; this.um = (1 << (m.DB - 15)) - 1; this.mt2 = 2 * m.t; }
    function montConvert(x) { var r = nbi(); x.abs().dlShiftTo(this.m.t, r); r.divRemTo(this.m, null, r); if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r); return r; }
    function montRevert(x) { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
    function montReduce(x) {
        while (x.t <= this.mt2)
            x[x.t++] = 0; for (var i = 0; i < this.m.t; ++i) { var j = x[i] & 0x7fff; var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM; j = i + this.m.t; x[j] += this.m.am(0, u0, x, i, 0, this.m.t); while (x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; } }
        x.clamp(); x.drShiftTo(this.m.t, x); if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
    }
    function montSqrTo(x, r) { x.squareTo(r); this.reduce(r); }
    function montMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }
    Montgomery.prototype.convert = montConvert; Montgomery.prototype.revert = montRevert; Montgomery.prototype.reduce = montReduce; Montgomery.prototype.mulTo = montMulTo; Montgomery.prototype.sqrTo = montSqrTo; function bnpIsEven() { return ((this.t > 0) ? (this[0] & 1) : this.s) == 0; }
    function bnpExp(e, z) {
        if (e > 0xffffffff || e < 1) return BigInteger.ONE; var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1; g.copyTo(r); while (--i >= 0) { z.sqrTo(r, r2); if ((e & (1 << i)) > 0) z.mulTo(r2, g, r); else { var t = r; r = r2; r2 = t; } }
        return z.revert(r);
    }
    function bnModPowInt(e, m) { var z; if (e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m); return this.exp(e, z); }
    BigInteger.prototype.copyTo = bnpCopyTo; BigInteger.prototype.fromInt = bnpFromInt; BigInteger.prototype.fromString = bnpFromString; BigInteger.prototype.clamp = bnpClamp; BigInteger.prototype.dlShiftTo = bnpDLShiftTo; BigInteger.prototype.drShiftTo = bnpDRShiftTo; BigInteger.prototype.lShiftTo = bnpLShiftTo; BigInteger.prototype.rShiftTo = bnpRShiftTo; BigInteger.prototype.subTo = bnpSubTo; BigInteger.prototype.multiplyTo = bnpMultiplyTo; BigInteger.prototype.squareTo = bnpSquareTo; BigInteger.prototype.divRemTo = bnpDivRemTo; BigInteger.prototype.invDigit = bnpInvDigit; BigInteger.prototype.isEven = bnpIsEven; BigInteger.prototype.exp = bnpExp; BigInteger.prototype.toString = bnToString; BigInteger.prototype.negate = bnNegate; BigInteger.prototype.abs = bnAbs; BigInteger.prototype.compareTo = bnCompareTo; BigInteger.prototype.bitLength = bnBitLength; BigInteger.prototype.mod = bnMod; BigInteger.prototype.modPowInt = bnModPowInt; BigInteger.ZERO = nbv(0); BigInteger.ONE = nbv(1); function bnClone() { var r = nbi(); this.copyTo(r); return r; }
    function bnIntValue() {
        if (this.s < 0) { if (this.t == 1) return this[0] - this.DV; else if (this.t == 0) return -1; }
        else if (this.t == 1) return this[0]; else if (this.t == 0) return 0; return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
    }
    function bnByteValue() { return (this.t == 0) ? this.s : (this[0] << 24) >> 24; }
    function bnShortValue() { return (this.t == 0) ? this.s : (this[0] << 16) >> 16; }
    function bnpChunkSize(r) { return Math.floor(Math.LN2 * this.DB / Math.log(r)); }
    function bnSigNum() { if (this.s < 0) return -1; else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0; else return 1; }
    function bnpToRadix(b) {
        if (b == null) b = 10; if (this.signum() == 0 || b < 2 || b > 36) return "0"; var cs = this.chunkSize(b); var a = Math.pow(b, cs); var d = nbv(a), y = nbi(), z = nbi(), r = ""; this.divRemTo(d, y, z); while (y.signum() > 0) { r = (a + z.intValue()).toString(b).substr(1) + r; y.divRemTo(d, y, z); }
        return z.intValue().toString(b) + r;
    }
    function bnpFromRadix(s, b) {
        this.fromInt(0); if (b == null) b = 10; var cs = this.chunkSize(b); var d = Math.pow(b, cs), mi = false, j = 0, w = 0; for (var i = 0; i < s.length; ++i) {
            var x = intAt(s, i); if (x < 0) { if (s.charAt(i) == "-" && this.signum() == 0) mi = true; continue; }
            w = b * w + x; if (++j >= cs) { this.dMultiply(d); this.dAddOffset(w, 0); j = 0; w = 0; }
        }
        if (j > 0) { this.dMultiply(Math.pow(b, j)); this.dAddOffset(w, 0); }
        if (mi) BigInteger.ZERO.subTo(this, this);
    }
    function bnpFromNumber(a, b, c) {
        if ("number" == typeof b) {
            if (a < 2) this.fromInt(1); else {
                this.fromNumber(a, c); if (!this.testBit(a - 1))
                    this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this); if (this.isEven()) this.dAddOffset(1, 0); while (!this.isProbablePrime(b)) { this.dAddOffset(2, 0); if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this); }
            }
        }
        else { var x = new Array(), t = a & 7; x.length = (a >> 3) + 1; b.nextBytes(x); if (t > 0) x[0] &= ((1 << t) - 1); else x[0] = 0; this.fromString(x, 256); }
    }
    function bnToByteArray() {
        var i = this.t, r = new Array(); r[0] = this.s; var p = this.DB - (i * this.DB) % 8, d, k = 0; if (i-- > 0) {
            if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
                r[k++] = d | (this.s << (this.DB - p)); while (i >= 0) {
                    if (p < 8) { d = (this[i] & ((1 << p) - 1)) << (8 - p); d |= this[--i] >> (p += this.DB - 8); }
                    else { d = (this[i] >> (p -= 8)) & 0xff; if (p <= 0) { p += this.DB; --i; } }
                    if ((d & 0x80) != 0) d |= -256; if (k == 0 && (this.s & 0x80) != (d & 0x80)) ++k; if (k > 0 || d != this.s) r[k++] = d;
                }
        }
        return r;
    }
    function bnEquals(a) { return (this.compareTo(a) == 0); }
    function bnMin(a) { return (this.compareTo(a) < 0) ? this : a; }
    function bnMax(a) { return (this.compareTo(a) > 0) ? this : a; }
    function bnpBitwiseTo(a, op, r) {
        var i, f, m = Math.min(a.t, this.t); for (i = 0; i < m; ++i)r[i] = op(this[i], a[i]); if (a.t < this.t) { f = a.s & this.DM; for (i = m; i < this.t; ++i)r[i] = op(this[i], f); r.t = this.t; }
        else { f = this.s & this.DM; for (i = m; i < a.t; ++i)r[i] = op(f, a[i]); r.t = a.t; }
        r.s = op(this.s, a.s); r.clamp();
    }
    function op_and(x, y) { return x & y; }
    function bnAnd(a) { var r = nbi(); this.bitwiseTo(a, op_and, r); return r; }
    function op_or(x, y) { return x | y; }
    function bnOr(a) { var r = nbi(); this.bitwiseTo(a, op_or, r); return r; }
    function op_xor(x, y) { return x ^ y; }
    function bnXor(a) { var r = nbi(); this.bitwiseTo(a, op_xor, r); return r; }
    function op_andnot(x, y) { return x & ~y; }
    function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a, op_andnot, r); return r; }
    function bnNot() { var r = nbi(); for (var i = 0; i < this.t; ++i)r[i] = this.DM & ~this[i]; r.t = this.t; r.s = ~this.s; return r; }
    function bnShiftLeft(n) { var r = nbi(); if (n < 0) this.rShiftTo(-n, r); else this.lShiftTo(n, r); return r; }
    function bnShiftRight(n) { var r = nbi(); if (n < 0) this.lShiftTo(-n, r); else this.rShiftTo(n, r); return r; }
    function lbit(x) {
        if (x == 0) return -1; var r = 0; if ((x & 0xffff) == 0) { x >>= 16; r += 16; }
        if ((x & 0xff) == 0) { x >>= 8; r += 8; }
        if ((x & 0xf) == 0) { x >>= 4; r += 4; }
        if ((x & 3) == 0) { x >>= 2; r += 2; }
        if ((x & 1) == 0) ++r; return r;
    }
    function bnGetLowestSetBit() {
        for (var i = 0; i < this.t; ++i)
            if (this[i] != 0) return i * this.DB + lbit(this[i]); if (this.s < 0) return this.t * this.DB; return -1;
    }
    function cbit(x) {
        var r = 0; while (x != 0) { x &= x - 1; ++r; }
        return r;
    }
    function bnBitCount() { var r = 0, x = this.s & this.DM; for (var i = 0; i < this.t; ++i)r += cbit(this[i] ^ x); return r; }
    function bnTestBit(n) { var j = Math.floor(n / this.DB); if (j >= this.t) return (this.s != 0); return ((this[j] & (1 << (n % this.DB))) != 0); }
    function bnpChangeBit(n, op) { var r = BigInteger.ONE.shiftLeft(n); this.bitwiseTo(r, op, r); return r; }
    function bnSetBit(n) { return this.changeBit(n, op_or); }
    function bnClearBit(n) { return this.changeBit(n, op_andnot); }
    function bnFlipBit(n) { return this.changeBit(n, op_xor); }
    function bnpAddTo(a, r) {
        var i = 0, c = 0, m = Math.min(a.t, this.t); while (i < m) { c += this[i] + a[i]; r[i++] = c & this.DM; c >>= this.DB; }
        if (a.t < this.t) {
            c += a.s; while (i < this.t) { c += this[i]; r[i++] = c & this.DM; c >>= this.DB; }
            c += this.s;
        }
        else {
            c += this.s; while (i < a.t) { c += a[i]; r[i++] = c & this.DM; c >>= this.DB; }
            c += a.s;
        }
        r.s = (c < 0) ? -1 : 0; if (c > 0) r[i++] = c; else if (c < -1) r[i++] = this.DV + c; r.t = i; r.clamp();
    }
    function bnAdd(a) { var r = nbi(); this.addTo(a, r); return r; }
    function bnSubtract(a) { var r = nbi(); this.subTo(a, r); return r; }
    function bnMultiply(a) { var r = nbi(); this.multiplyTo(a, r); return r; }
    function bnSquare() { var r = nbi(); this.squareTo(r); return r; }
    function bnDivide(a) { var r = nbi(); this.divRemTo(a, r, null); return r; }
    function bnRemainder(a) { var r = nbi(); this.divRemTo(a, null, r); return r; }
    function bnDivideAndRemainder(a) { var q = nbi(), r = nbi(); this.divRemTo(a, q, r); return new Array(q, r); }
    function bnpDMultiply(n) { this[this.t] = this.am(0, n - 1, this, 0, 0, this.t); ++this.t; this.clamp(); }
    function bnpDAddOffset(n, w) { if (n == 0) return; while (this.t <= w) this[this.t++] = 0; this[w] += n; while (this[w] >= this.DV) { this[w] -= this.DV; if (++w >= this.t) this[this.t++] = 0; ++this[w]; } }
    function NullExp() { }
    function nNop(x) { return x; }
    function nMulTo(x, y, r) { x.multiplyTo(y, r); }
    function nSqrTo(x, r) { x.squareTo(r); }
    NullExp.prototype.convert = nNop; NullExp.prototype.revert = nNop; NullExp.prototype.mulTo = nMulTo; NullExp.prototype.sqrTo = nSqrTo; function bnPow(e) { return this.exp(e, new NullExp()); }
    function bnpMultiplyLowerTo(a, n, r) { var i = Math.min(this.t + a.t, n); r.s = 0; r.t = i; while (i > 0) r[--i] = 0; var j; for (j = r.t - this.t; i < j; ++i)r[i + this.t] = this.am(0, a[i], r, i, 0, this.t); for (j = Math.min(a.t, n); i < j; ++i)this.am(0, a[i], r, i, 0, n - i); r.clamp(); }
    function bnpMultiplyUpperTo(a, n, r) {
        --n; var i = r.t = this.t + a.t - n; r.s = 0; while (--i >= 0) r[i] = 0; for (i = Math.max(n - this.t, 0); i < a.t; ++i)
            r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n); r.clamp(); r.drShiftTo(1, r);
    }
    function Barrett(m) { this.r2 = nbi(); this.q3 = nbi(); BigInteger.ONE.dlShiftTo(2 * m.t, this.r2); this.mu = this.r2.divide(m); this.m = m; }
    function barrettConvert(x) { if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m); else if (x.compareTo(this.m) < 0) return x; else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; } }
    function barrettRevert(x) { return x; }
    function barrettReduce(x) {
        x.drShiftTo(this.m.t - 1, this.r2); if (x.t > this.m.t + 1) { x.t = this.m.t + 1; x.clamp(); }
        this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3); this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1); x.subTo(this.r2, x); while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
    }
    function barrettSqrTo(x, r) { x.squareTo(r); this.reduce(r); }
    function barrettMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }
    Barrett.prototype.convert = barrettConvert; Barrett.prototype.revert = barrettRevert; Barrett.prototype.reduce = barrettReduce; Barrett.prototype.mulTo = barrettMulTo; Barrett.prototype.sqrTo = barrettSqrTo; function bnModPow(e, m) {
        var i = e.bitLength(), k, r = nbv(1), z; if (i <= 0) return r; else if (i < 18) k = 1; else if (i < 48) k = 3; else if (i < 144) k = 4; else if (i < 768) k = 5; else k = 6; if (i < 8)
            z = new Classic(m); else if (m.isEven())
            z = new Barrett(m); else
            z = new Montgomery(m); var g = new Array(), n = 3, k1 = k - 1, km = (1 << k) - 1; g[1] = z.convert(this); if (k > 1) { var g2 = nbi(); z.sqrTo(g[1], g2); while (n <= km) { g[n] = nbi(); z.mulTo(g2, g[n - 2], g[n]); n += 2; } }
        var j = e.t - 1, w, is1 = true, r2 = nbi(), t; i = nbits(e[j]) - 1; while (j >= 0) {
            if (i >= k1) w = (e[j] >> (i - k1)) & km; else { w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i); if (j > 0) w |= e[j - 1] >> (this.DB + i - k1); }
            n = k; while ((w & 1) == 0) { w >>= 1; --n; }
            if ((i -= n) < 0) { i += this.DB; --j; }
            if (is1) { g[w].copyTo(r); is1 = false; }
            else {
                while (n > 1) { z.sqrTo(r, r2); z.sqrTo(r2, r); n -= 2; }
                if (n > 0) z.sqrTo(r, r2); else { t = r; r = r2; r2 = t; }
                z.mulTo(r2, g[w], r);
            }
            while (j >= 0 && (e[j] & (1 << i)) == 0) { z.sqrTo(r, r2); t = r; r = r2; r2 = t; if (--i < 0) { i = this.DB - 1; --j; } }
        }
        return z.revert(r);
    }
    function bnGCD(a) {
        var x = (this.s < 0) ? this.negate() : this.clone(); var y = (a.s < 0) ? a.negate() : a.clone(); if (x.compareTo(y) < 0) { var t = x; x = y; y = t; }
        var i = x.getLowestSetBit(), g = y.getLowestSetBit(); if (g < 0) return x; if (i < g) g = i; if (g > 0) { x.rShiftTo(g, x); y.rShiftTo(g, y); }
        while (x.signum() > 0) {
            if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x); if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y); if (x.compareTo(y) >= 0) { x.subTo(y, x); x.rShiftTo(1, x); }
            else { y.subTo(x, y); y.rShiftTo(1, y); }
        }
        if (g > 0) y.lShiftTo(g, y); return y;
    }
    function bnpModInt(n) {
        if (n <= 0) return 0; var d = this.DV % n, r = (this.s < 0) ? n - 1 : 0; if (this.t > 0)
            if (d == 0) r = this[0] % n; else for (var i = this.t - 1; i >= 0; --i)r = (d * r + this[i]) % n; return r;
    }
    function bnModInverse(m) {
        var ac = m.isEven(); if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO; var u = m.clone(), v = this.clone(); var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1); while (u.signum() != 0) {
            while (u.isEven()) {
                u.rShiftTo(1, u); if (ac) {
                    if (!a.isEven() || !b.isEven()) { a.addTo(this, a); b.subTo(m, b); }
                    a.rShiftTo(1, a);
                }
                else if (!b.isEven()) b.subTo(m, b); b.rShiftTo(1, b);
            }
            while (v.isEven()) {
                v.rShiftTo(1, v); if (ac) {
                    if (!c.isEven() || !d.isEven()) { c.addTo(this, c); d.subTo(m, d); }
                    c.rShiftTo(1, c);
                }
                else if (!d.isEven()) d.subTo(m, d); d.rShiftTo(1, d);
            }
            if (u.compareTo(v) >= 0) { u.subTo(v, u); if (ac) a.subTo(c, a); b.subTo(d, b); }
            else { v.subTo(u, v); if (ac) c.subTo(a, c); d.subTo(b, d); }
        }
        if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO; if (d.compareTo(m) >= 0) return d.subtract(m); if (d.signum() < 0) d.addTo(m, d); else return d; if (d.signum() < 0) return d.add(m); else return d;
    }
    var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997]; var lplim = (1 << 26) / lowprimes[lowprimes.length - 1]; function bnIsProbablePrime(t) {
        var i, x = this.abs(); if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
            for (i = 0; i < lowprimes.length; ++i)
                if (x[0] == lowprimes[i]) return true; return false;
        }
        if (x.isEven()) return false; i = 1; while (i < lowprimes.length) { var m = lowprimes[i], j = i + 1; while (j < lowprimes.length && m < lplim) m *= lowprimes[j++]; m = x.modInt(m); while (i < j) if (m % lowprimes[i++] == 0) return false; }
        return x.millerRabin(t);
    }
    function bnpMillerRabin(t) {
        var n1 = this.subtract(BigInteger.ONE); var k = n1.getLowestSetBit(); if (k <= 0) return false; var r = n1.shiftRight(k); t = (t + 1) >> 1; if (t > lowprimes.length) t = lowprimes.length; var a = nbi(); for (var i = 0; i < t; ++i) {
            a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]); var y = a.modPow(r, this); if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
                var j = 1; while (j++ < k && y.compareTo(n1) != 0) { y = y.modPowInt(2, this); if (y.compareTo(BigInteger.ONE) == 0) return false; }
                if (y.compareTo(n1) != 0) return false;
            }
        }
        return true;
    }
    BigInteger.prototype.chunkSize = bnpChunkSize; BigInteger.prototype.toRadix = bnpToRadix; BigInteger.prototype.fromRadix = bnpFromRadix; BigInteger.prototype.fromNumber = bnpFromNumber; BigInteger.prototype.bitwiseTo = bnpBitwiseTo; BigInteger.prototype.changeBit = bnpChangeBit; BigInteger.prototype.addTo = bnpAddTo; BigInteger.prototype.dMultiply = bnpDMultiply; BigInteger.prototype.dAddOffset = bnpDAddOffset; BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo; BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo; BigInteger.prototype.modInt = bnpModInt; BigInteger.prototype.millerRabin = bnpMillerRabin; BigInteger.prototype.clone = bnClone; BigInteger.prototype.intValue = bnIntValue; BigInteger.prototype.byteValue = bnByteValue; BigInteger.prototype.shortValue = bnShortValue; BigInteger.prototype.signum = bnSigNum; BigInteger.prototype.toByteArray = bnToByteArray; BigInteger.prototype.equals = bnEquals; BigInteger.prototype.min = bnMin; BigInteger.prototype.max = bnMax; BigInteger.prototype.and = bnAnd; BigInteger.prototype.or = bnOr; BigInteger.prototype.xor = bnXor; BigInteger.prototype.andNot = bnAndNot; BigInteger.prototype.not = bnNot; BigInteger.prototype.shiftLeft = bnShiftLeft; BigInteger.prototype.shiftRight = bnShiftRight; BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit; BigInteger.prototype.bitCount = bnBitCount; BigInteger.prototype.testBit = bnTestBit; BigInteger.prototype.setBit = bnSetBit; BigInteger.prototype.clearBit = bnClearBit; BigInteger.prototype.flipBit = bnFlipBit; BigInteger.prototype.add = bnAdd; BigInteger.prototype.subtract = bnSubtract; BigInteger.prototype.multiply = bnMultiply; BigInteger.prototype.divide = bnDivide; BigInteger.prototype.remainder = bnRemainder; BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder; BigInteger.prototype.modPow = bnModPow; BigInteger.prototype.modInverse = bnModInverse; BigInteger.prototype.pow = bnPow; BigInteger.prototype.gcd = bnGCD; BigInteger.prototype.isProbablePrime = bnIsProbablePrime; BigInteger.prototype.square = bnSquare; function arrayCopy(src, pos1, dest, pos2, len) {
        var realLen = len; if (pos1 + len > src.length && pos2 + len <= dest.length) { realLen = src.length - pos1; } else if (pos2 + len > dest.length && pos1 + len <= src.length) { realLen = dest.length - pos2; } else if (pos1 + len <= src.length && pos2 + len <= dest.length) { realLen = len; } else if (dest.length < src.length) { realLen = dest.length - pos2; } else { realLen = src.length - pos2; }
        for (var i = 0; i < realLen; i++) { dest[i + pos2] = src[i + pos1]; }
    }
    function longToByte(num) { return new Array(0, 0, 0, 0, (num >> 24) & 0x000000FF, (num >> 16) & 0x000000FF, (num >> 8) & 0x000000FF, (num) & 0x000000FF); }
    function intToByte(num) { return new Array((num >> 24) & 0x000000FF, (num >> 16) & 0x000000FF, (num >> 8) & 0x000000FF, (num) & 0x000000FF); }
    function intArrayToByteArray(nums) {
        var b = new Array(nums.length * 4); for (var i = 0; i < nums.length; i++) { arrayCopy(intToByte(nums[i]), 0, b, i * 4, 4); }
        return b;
    }
    function byteToInt(b, pos) { if (pos + 3 < b.length) { return ((b[pos]) << 24) | ((b[pos + 1]) << 16) | ((b[pos + 2]) << 8) | ((b[pos + 3])); } else if (pos + 2 < b.length) { return ((b[pos + 1]) << 16) | ((b[pos + 2]) << 8) | ((b[pos + 3])); } else if (pos + 1 < b.length) { return ((b[pos]) << 8) | ((b[pos + 1])); } else { return ((b[pos])); } }
    function byteArrayToIntArray(b) {
        var arrLen = Math.ceil(b.length / 4); var out = new Array(arrLen); for (var i = 0; i < b.length; i++) { b[i] = b[i] & 0xFF; }
        for (var i = 0; i < out.length; i++) { out[i] = byteToInt(b, i * 4); }
        return out;
    }
    function sm3HexEncode(b, pos, len) {
        var hexCh = new Array(len * 2); var hexCode = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'); for (var i = pos, j = 0; i < len + pos; i++, j++) { hexCh[j] = hexCode[(b[i] & 0xFF) >> 4]; hexCh[++j] = hexCode[(b[i] & 0x0F)]; }
        return hexCh.join('');
    }
    function utf8StrToBytes(utf8Str) {
        var ens = encodeURIComponent(utf8Str); var es = unescape(ens); var esLen = es.length; var words = []; for (var i = 0; i < esLen; i++) { words[i] = es.charCodeAt(i); }
        return words;
    }
    (function () {
        var C = CryptoJS; var C_lib = C.lib; var WordArray = C_lib.WordArray; var Hasher = C_lib.Hasher; var C_algo = C.algo; var W = []; var SM3 = C_algo.SM3 = Hasher.extend({
            _doReset: function () { this._hash = new WordArray.init([1937774191, 1226093241, 388252375, -628488704, -1452330820, 372324522, -477237683, -1325724082]); }, _doProcessBlock: function (M, offset) {
                var H = this._hash.words; var a = H[0]; var b = H[1]; var c = H[2]; var d = H[3]; var e = H[4]; for (var i = 0; i < 80; i++) {
                    if (i < 16) { W[i] = M[offset + i] | 0 } else { var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]; W[i] = (n << 1) | (n >>> 31) }
                    var t = ((a << 5) | (a >>> 27)) + e + W[i]; if (i < 20) { t += ((b & c) | (~b & d)) + 0x5a827999 } else if (i < 40) { t += (b ^ c ^ d) + 0x6ed9eba1 } else if (i < 60) { t += ((b & c) | (b & d) | (c & d)) - 0x70e44324 } else { t += (b ^ c ^ d) - 0x359d3e2a }
                    e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t
                }
                H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0
            }, _doFinalize: function () { var data = this._data; var dataWords = data.words; var nBitsTotal = this._nDataBytes * 8; var nBitsLeft = data.sigBytes * 8; dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32); dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000); dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal; data.sigBytes = dataWords.length * 4; this._process(); return this._hash }, clone: function () { var clone = Hasher.clone.call(this); clone._hash = this._hash.clone(); return clone }
        }); C.SM3 = Hasher._createHelper(SM3); C.SM3.encrypt = function (message) { var dataBy = utf8StrToBytes(message); var sm3 = new SM3Digest(); sm3.update(dataBy, 0, dataBy.length); var sm3Hash = sm3.doFinal(); var sm3HashHex = sm3HexEncode(sm3Hash, 0, sm3Hash.length); return sm3HashHex; }
        C.HmacSM3 = Hasher._createHmacHelper(SM3)
    }()); function SM3Digest() {
        this.ivByte = new Array(0x73, 0x80, 0x16, 0x6f, 0x49, 0x14, 0xb2, 0xb9, 0x17, 0x24, 0x42, 0xd7, 0xda, 0x8a, 0x06, 0x00, 0xa9, 0x6f, 0x30, 0xbc, 0x16, 0x31, 0x38, 0xaa, 0xe3, 0x8d, 0xee, 0x4d, 0xb0, 0xfb, 0x0e, 0x4e); this.iv = byteArrayToIntArray(this.ivByte); this.tj = new Array(64); this.BLOCK_BYTE_LEN = 64; this.vbuf = new Array(8); this.dataBuf = new Array(64); this.dataBufLen = 0; this.totalLen = 0; for (var i = 0; i < 64; i++) { if (i <= 15) { this.tj[i] = 0x79cc4519; } else { this.tj[i] = 0x7a879d8a; } }
        arrayCopy(this.iv, 0, this.vbuf, 0, this.vbuf.length);
    }
    SM3Digest.prototype = {
        ffj: function (x, y, z, i) {
            var tmp; if (i <= 15) { tmp = x ^ y ^ z; } else { tmp = (x & y) | (x & z) | (y & z); }
            return tmp;
        }, ggj: function (x, y, z, i) {
            var tmp = 0; if (i <= 15) { tmp = x ^ y ^ z; } else { tmp = (x & y) | (~x & z); }
            return tmp;
        }, p0: function (x) { return x ^ (x << 9 | (x >>> (32 - 9))) ^ (x << 17 | (x >>> (32 - 17))); }, p1: function (x) { return x ^ (x << 15 | (x >>> (32 - 15))) ^ (x << 23 | (x >>> (32 - 23))); }, cycleLeft: function (x, moveLen) { return x << moveLen | (x >>> (32 - moveLen)); }, padding: function (data) {
            var k = 0; var len = data.length; var padding; k = 64 - (len + 1 + 8) % 64; if (k >= 64) { k = 0; }
            padding = new Array(k + 1 + len + 8); padding[len] = 1 << 7; arrayCopy(data, 0, padding, 0, len); arrayCopy(longToByte(this.totalLen << 3), 0, padding, len + k + 1, 8); return padding;
        }, iterate: function (message) {
            var len = message.length; var n = parseInt(len / 16); var v, b; var ep; v = this.vbuf; b = new Array(16); for (var i = 0; i < n; i++) { arrayCopy(message, i * 16, b, 0, b.length); ep = this.expand(b); v = this.cf(v, ep[0], ep[1]); }
            arrayCopy(v, 0, this.vbuf, 0, v.length);
        }, expand: function (b) {
            var w1 = new Array(68); var w2 = new Array(64); arrayCopy(b, 0, w1, 0, b.length); for (var i = 16; i < w1.length; i++) { w1[i] = this.p1(w1[i - 16] ^ w1[i - 9] ^ this.cycleLeft(w1[i - 3], 15)) ^ this.cycleLeft(w1[i - 13], 7) ^ w1[i - 6]; }
            for (var i = 0; i < w2.length; i++) { w2[i] = w1[i] ^ w1[i + 4]; }
            return new Array(w1, w2);
        }, cf: function (v, w1, w2) {
            var result; var a, b, c, d, e, f, g, h, ss1, ss2, tt1, tt2; a = v[0]; b = v[1]; c = v[2]; d = v[3]; e = v[4]; f = v[5]; g = v[6]; h = v[7]; for (var i = 0; i < 64; i++) { ss1 = this.cycleLeft(this.cycleLeft(a, 12) + e + this.cycleLeft(this.tj[i], i), 7); ss2 = ss1 ^ this.cycleLeft(a, 12); tt1 = this.ffj(a, b, c, i) + d + ss2 + w2[i]; tt2 = this.ggj(e, f, g, i) + h + ss1 + w1[i]; d = c; c = this.cycleLeft(b, 9); b = a; a = tt1; h = g; g = this.cycleLeft(f, 19); f = e; e = this.p0(tt2); }
            result = new Array(8); result[0] = a ^ v[0]; result[1] = b ^ v[1]; result[2] = c ^ v[2]; result[3] = d ^ v[3]; result[4] = e ^ v[4]; result[5] = f ^ v[5]; result[6] = g ^ v[6]; result[7] = h ^ v[7]; return result;
        }, digest: function (data) { var mac; var padding = this.padding(data); var paddingInt = byteArrayToIntArray(padding); this.iterate(paddingInt); var macInt = this.vbuf; mac = intArrayToByteArray(macInt); return mac; }, update: function (data, pos, len) {
            var loop = parseInt((len + this.dataBufLen) / 64); this.totalLen += len; if (len + this.dataBufLen < this.BLOCK_BYTE_LEN) { arrayCopy(data, 0, this.dataBuf, this.dataBufLen, len); this.dataBufLen = len + this.dataBufLen; } else {
                var dataInt; arrayCopy(data, 0, this.dataBuf, this.dataBufLen, this.BLOCK_BYTE_LEN - this.dataBufLen); dataInt = byteArrayToIntArray(this.dataBuf); this.iterate(dataInt); for (var i = 1; i < loop; i++) { arrayCopy(data, i * this.BLOCK_BYTE_LEN - this.dataBufLen, this.dataBuf, 0, this.BLOCK_BYTE_LEN); dataInt = byteArrayToIntArray(this.dataBuf); this.iterate(dataInt); }
                arrayCopy(data, loop * this.BLOCK_BYTE_LEN - this.dataBufLen, this.dataBuf, 0, len - (loop * this.BLOCK_BYTE_LEN - this.dataBufLen)); this.dataBufLen = len - (loop * this.BLOCK_BYTE_LEN - this.dataBufLen);
            }
        }, doFinal: function () { var mac; var finalData = new Array(this.dataBufLen); arrayCopy(this.dataBuf, 0, finalData, 0, this.dataBufLen); var paddingArr = this.padding(finalData); var paddingInt = byteArrayToIntArray(paddingArr); this.iterate(paddingInt); var macInt = this.vbuf; mac = intArrayToByteArray(macInt); return mac; }
    }; Cipher_SM4 = function () { }
    Cipher_SM4.encrypt_ECB = function (plainText, secretKey) { var sm4 = new SM4Utils(); sm4.Key = secretKey; return sm4.encryptData_ECB(plainText); }
    Cipher_SM4.decrypt_ECB = function (cipherText, secretKey) { var sm4 = new SM4Utils(); sm4.Key = secretKey; return sm4.decryptData_ECB(cipherText); }
    Cipher_SM4.nari = "803dded50d7541c0997c02af16ffcfef"; var SM4Utils = function () { this.Key = ""; this.iv = ""; this.hexString = false; this.secretKey = Cipher_SM4.nari; }
    SM4Utils.prototype = {
        encryptData_ECB: function (plainText) {
            try {
                var ctx = new SM4_Context(); ctx.isPadding = true; ctx.mode = SM4.SM4_ENCRYPT; var keyBytes; if (this.hexString) { keyBytes = hexToBt64(this.secretKey); } else { keyBytes = Util.stringToByte(this.secretKey); }
                var sm4 = new SM4(); sm4.sm4_setkey_enc(ctx, keyBytes); var encrypted = sm4.sm4_crypt_ecb(ctx, Util.stringToByte(plainText)); var cipherText = new Base64().encode(Util.byteToString(encrypted)); if (cipherText != null && cipherText.trim().length > 0) { var p = "\\s*|\t|\r|\n"; cipherText = cipherText.replaceAll(p, ""); }
                return cipherText;
            } catch (e) { console.log(e); }
        }, decryptData_ECB: function (cipherText) {
            try {
                var ctx = new SM4_Context(); ctx.isPadding = true; ctx.mode = SM4.SM4_DECRYPT; var keyBytes; if (this.hexString) { keyBytes = hexToBt64(this.secretKey); } else { keyBytes = Util.stringToByte(this.secretKey); }
                var sm4 = new SM4(); sm4.sm4_setkey_dec(ctx, keyBytes); var decrypted = sm4.sm4_crypt_ecb(ctx, new Base64().decodeBuffer(cipherText)); return Util.byteToString(decrypted);
            } catch (e) { console.log(e); }
        }, encryptData_CBC: function (plainText) {
            try {
                var ctx = new SM4_Context(); ctx.isPadding = true; ctx.mode = SM4.SM4_ENCRYPT; var keyBytes; var ivBytes; if (this.hexString) { keyBytes = hexToBt64(this.secretKey); ivBytes = hexToBt64(iv); } else { keyBytes = Util.stringToByte(this.secretKey); ivBytes = Util.stringToByte(this.iv); }
                var sm4 = new SM4(); sm4.sm4_setkey_enc(ctx, keyBytes); var encrypted = sm4.sm4_crypt_cbc(ctx, ivBytes, Util.stringToByte(plainText)); var cipherText = new Base64().encode(Util.byteToString(encrypted)); if (cipherText != null && cipherText.trim().length > 0) { var p = "\\s*|\t|\r|\n"; cipherText = cipherText.replaceAll(p, ""); }
                return cipherText;
            } catch (e) { console.log(e); }
        }, decryptData_CBC: function (cipherText) {
            try {
                var ctx = new SM4_Context(); ctx.isPadding = true; ctx.mode = SM4.SM4_DECRYPT; var keyBytes; var ivBytes; if (this.hexString) { keyBytes = hexToBt64(this.secretKey); ivBytes = hexToBt64(this.iv); } else { keyBytes = Util.stringToByte(this.secretKey); ivBytes = Util.stringToByte(this.iv); }
                var sm4 = new SM4(); sm4.sm4_setkey_dec(ctx, keyBytes); var decrypted = sm4.sm4_crypt_cbc(ctx, ivBytes, new Base64().decodeBuffer(cipherText)); return Util.byteToString(decrypted);
            } catch (e) { console.log(e); }
        }
    }
    var SM4 = function () {
        var me = this; SM4.KEY_LENGTH = 16; SM4.KEY_INTERVAL = 4; SM4.SM4_ENCRYPT = 1; SM4.SM4_DECRYPT = 0; GET_ULONG_BE = function (b, i) { var n = (b[i] & 0xff) << 24 | ((b[i + 1] & 0xff) << 16) | ((b[i + 2] & 0xff) << 8) | (b[i + 3] & 0xff) & 0xffffffff; return n; }
        PUT_ULONG_BE = function (n, b, i) { b[i] = (0xFF & n >> 24); b[i + 1] = (0xFF & n >> 16); b[i + 2] = (0xFF & n >> 8); b[i + 3] = (0xFF & n); }
        SHL = function (x, n) { return (x & 0xFFFFFFFF) << n; }
        ROTL = function (x, n) { return SHL(x, n) | x >> (32 - n); }
        SWAP = function (sk, i) { var t = sk[i]; sk[i] = sk[(31 - i)]; sk[(31 - i)] = t; }
        me.SboxTable = new Int8Array([0xd6, 0x90, 0xe9, 0xfe, 0xcc, 0xe1, 0x3d, 0xb7, 0x16, 0xb6, 0x14, 0xc2, 0x28, 0xfb, 0x2c, 0x05, 0x2b, 0x67, 0x9a, 0x76, 0x2a, 0xbe, 0x04, 0xc3, 0xaa, 0x44, 0x13, 0x26, 0x49, 0x86, 0x06, 0x99, 0x9c, 0x42, 0x50, 0xf4, 0x91, 0xef, 0x98, 0x7a, 0x33, 0x54, 0x0b, 0x43, 0xed, 0xcf, 0xac, 0x62, 0xe4, 0xb3, 0x1c, 0xa9, 0xc9, 0x08, 0xe8, 0x95, 0x80, 0xdf, 0x94, 0xfa, 0x75, 0x8f, 0x3f, 0xa6, 0x47, 0x07, 0xa7, 0xfc, 0xf3, 0x73, 0x17, 0xba, 0x83, 0x59, 0x3c, 0x19, 0xe6, 0x85, 0x4f, 0xa8, 0x68, 0x6b, 0x81, 0xb2, 0x71, 0x64, 0xda, 0x8b, 0xf8, 0xeb, 0x0f, 0x4b, 0x70, 0x56, 0x9d, 0x35, 0x1e, 0x24, 0x0e, 0x5e, 0x63, 0x58, 0xd1, 0xa2, 0x25, 0x22, 0x7c, 0x3b, 0x01, 0x21, 0x78, 0x87, 0xd4, 0x00, 0x46, 0x57, 0x9f, 0xd3, 0x27, 0x52, 0x4c, 0x36, 0x02, 0xe7, 0xa0, 0xc4, 0xc8, 0x9e, 0xea, 0xbf, 0x8a, 0xd2, 0x40, 0xc7, 0x38, 0xb5, 0xa3, 0xf7, 0xf2, 0xce, 0xf9, 0x61, 0x15, 0xa1, 0xe0, 0xae, 0x5d, 0xa4, 0x9b, 0x34, 0x1a, 0x55, 0xad, 0x93, 0x32, 0x30, 0xf5, 0x8c, 0xb1, 0xe3, 0x1d, 0xf6, 0xe2, 0x2e, 0x82, 0x66, 0xca, 0x60, 0xc0, 0x29, 0x23, 0xab, 0x0d, 0x53, 0x4e, 0x6f, 0xd5, 0xdb, 0x37, 0x45, 0xde, 0xfd, 0x8e, 0x2f, 0x03, 0xff, 0x6a, 0x72, 0x6d, 0x6c, 0x5b, 0x51, 0x8d, 0x1b, 0xaf, 0x92, 0xbb, 0xdd, 0xbc, 0x7f, 0x11, 0xd9, 0x5c, 0x41, 0x1f, 0x10, 0x5a, 0xd8, 0x0a, 0xc1, 0x31, 0x88, 0xa5, 0xcd, 0x7b, 0xbd, 0x2d, 0x74, 0xd0, 0x12, 0xb8, 0xe5, 0xb4, 0xb0, 0x89, 0x69, 0x97, 0x4a, 0x0c, 0x96, 0x77, 0x7e, 0x65, 0xb9, 0xf1, 0x09, 0xc5, 0x6e, 0xc6, 0x84, 0x18, 0xf0, 0x7d, 0xec, 0x3a, 0xdc, 0x4d, 0x20, 0x79, 0xee, 0x5f, 0x3e, 0xd7, 0xcb, 0x39, 0x48]); me.FK = [0xa3b1bac6, 0x56aa3350, 0x677d9197, 0xb27022dc]; me.CK = [0x00070e15, 0x1c232a31, 0x383f464d, 0x545b6269, 0x70777e85, 0x8c939aa1, 0xa8afb6bd, 0xc4cbd2d9, 0xe0e7eef5, 0xfc030a11, 0x181f262d, 0x343b4249, 0x50575e65, 0x6c737a81, 0x888f969d, 0xa4abb2b9, 0xc0c7ced5, 0xdce3eaf1, 0xf8ff060d, 0x141b2229, 0x30373e45, 0x4c535a61, 0x686f767d, 0x848b9299, 0xa0a7aeb5, 0xbcc3cad1, 0xd8dfe6ed, 0xf4fb0209, 0x10171e25, 0x2c333a41, 0x484f565d, 0x646b7279]; me.BK = [0x4e, 0x41, 0x52, 0x49, 0x62, 0x65, 0x69, 0x6A, 0x69, 0x6E, 0x67, 0x2D, 0x32, 0x30, 0x31, 0x38]; sm4Sbox = function (inch) { var i = inch & 0xFF; var retVal = me.SboxTable[i]; return retVal; }
        sm4Lt = function (ka) { var bb = 0; var c = 0; var a = new Int8Array(4); var b = new Int8Array(4); PUT_ULONG_BE(ka, a, 0); b[0] = sm4Sbox(a[0]); b[1] = sm4Sbox(a[1]); b[2] = sm4Sbox(a[2]); b[3] = sm4Sbox(a[3]); bb = GET_ULONG_BE(b, 0); c = bb ^ ROTL(bb, 2) ^ ROTL(bb, 10) ^ ROTL(bb, 18) ^ ROTL(bb, 24); return c; }
        sm4F = function (x0, x1, x2, x3, rk) { return x0 ^ sm4Lt(x1 ^ x2 ^ x3 ^ rk); }
        sm4CalciRK = function (ka) { var bb = 0; var rk = 0; var a = new Int8Array(4); var b = new Int8Array(4); PUT_ULONG_BE(ka, a, 0); b[0] = sm4Sbox(a[0]); b[1] = sm4Sbox(a[1]); b[2] = sm4Sbox(a[2]); b[3] = sm4Sbox(a[3]); bb = GET_ULONG_BE(b, 0); rk = bb ^ ROTL(bb, 13) ^ ROTL(bb, 23); return rk; }
        sm4_setkey = function (SK, key) {
            var MK = new Array(4); var k = new Array(36); var i = 0; for (i = 0; i < MK.length; i++) { MK[i] = GET_ULONG_BE(me.BK, i * SM4.KEY_INTERVAL); }
            k[0] = MK[0] ^ me.FK[0]; k[1] = MK[1] ^ me.FK[1]; k[2] = MK[2] ^ me.FK[2]; k[3] = MK[3] ^ me.FK[3]; i = 0; for (; i < 32; i++) { k[(i + 4)] = (k[i] ^ sm4CalciRK(k[(i + 1)] ^ k[(i + 2)] ^ k[(i + 3)] ^ me.CK[i])); SK[i] = k[(i + 4)]; }
        }
        sm4_one_round = function (sk, input, output) {
            var i = 0; var ulbuf = new Array(36); ulbuf[0] = GET_ULONG_BE(input, 0); ulbuf[1] = GET_ULONG_BE(input, 4); ulbuf[2] = GET_ULONG_BE(input, 8); ulbuf[3] = GET_ULONG_BE(input, 12); while (i < 32) { ulbuf[(i + 4)] = sm4F(ulbuf[i], ulbuf[(i + 1)], ulbuf[(i + 2)], ulbuf[(i + 3)], sk[i]); i++; }
            PUT_ULONG_BE(ulbuf[35], output, 0); PUT_ULONG_BE(ulbuf[34], output, 4); PUT_ULONG_BE(ulbuf[33], output, 8); PUT_ULONG_BE(ulbuf[32], output, 12);
        }
        padding = function (input, mode) {
            if (input == null) { return null; }
            var ret = null; if (mode == SM4.SM4_ENCRYPT) { var p = 16 - input.length % 16; ret = new Int8Array(input.length + p); Util.arraycopy(input, 0, ret, 0, input.length); for (var i = 0; i < p; i++) { ret[input.length + i] = p; } } else { var p = input[input.length - 1]; ret = new Uint8Array(input.length - p); Util.arraycopy(input, 0, ret, 0, input.length - p); }
            return ret;
        }
        me.sm4_setkey_enc = function (ctx, key) {
            if (ctx == null) { return; }
            ctx.mode = SM4.SM4_ENCRYPT; sm4_setkey(ctx.sk, key);
        }
        me.sm4_setkey_dec = function (ctx, key) {
            if (ctx == null) { return; }
            var i = 0; ctx.mode = SM4.SM4_DECRYPT; sm4_setkey(ctx.sk, key); for (i = 0; i < 16; i++) { SWAP(ctx.sk, i); }
        }
        me.sm4_crypt_ecb = function (ctx, input) {
            if (input == null) { throw "input is null!"; }
            if ((ctx.isPadding) && (ctx.mode == SM4.SM4_ENCRYPT)) { input = padding(input, SM4.SM4_ENCRYPT); }
            var length = input.length; var bins = new ByteArrayInputStream(input); var bous = new ByteArrayOutputStream(); for (; length > 0; length -= 16) { var _in = new Int8Array(16); var out = new Int8Array(16); bins.read(_in); sm4_one_round(ctx.sk, _in, out); bous.write(out); }
            var output = bous.toByteArray(); if (ctx.isPadding && ctx.mode == SM4.SM4_DECRYPT) { output = padding(output, SM4.SM4_DECRYPT); }
            return output;
        }
        me.sm4_crypt_cbc = function (ctx, iv, input) {
            if (iv == null || iv.length != 16) { throw "iv error!"; }
            if (input == null) { throw "input is null!"; }
            if (ctx.isPadding && ctx.mode == SM4.SM4_ENCRYPT) { input = padding(input, SM4.SM4_ENCRYPT); }
            var i = 0; var length = input.length; var bins = new ByteArrayInputStream(input); var bous = new ByteArrayOutputStream(); if (ctx.mode == SM4.SM4_ENCRYPT) {
                for (; length > 0; length -= 16) {
                    var _in = new Int8Array(16); var out = new Int8Array(16); var out1 = new Int8Array(16); bins.read(_in); for (i = 0; i < 16; i++) { out[i] = (_in[i] ^ iv[i]); }
                    sm4_one_round(ctx.sk, out, out1); Util.arraycopy(out1, 0, iv, 0, 16); bous.write(out1);
                }
            } else {
                var temp = new Int8Array(16); for (; length > 0; length -= 16) {
                    var _in = new Int8Array(16); var out = new Int8Array(16); var out1 = new Int8Array(16); bins.read(_in); Util.arraycopy(_in, 0, temp, 0, 16); sm4_one_round(ctx.sk, _in, out); for (i = 0; i < 16; i++) { out1[i] = (out[i] ^ iv[i]); }
                    Util.arraycopy(temp, 0, iv, 0, 16); bous.write(out1);
                }
            }
            var output = bous.toByteArray(); if (ctx.isPadding && ctx.mode == SM4.SM4_DECRYPT) { output = padding(output, SM4.SM4_DECRYPT); }
            return output;
        }
        return me;
    }; var SM4_Context = function () { this.mode = 1; this.sk = new Array(32); this.isPadding = true; }
    var ByteArrayOutputStream = function () { this._output = new Array(); }
    ByteArrayOutputStream.prototype = { write: function (outbyte) { for (var i = 0; i < outbyte.length; i++) { this._output.push(outbyte[i]); } }, toByteArray: function () { return this._output; } }
    var ByteArrayInputStream = function (input) { this.inputLength = 0; this._input = input; }
    ByteArrayInputStream.prototype = { read: function (inbyte) { for (var i = 0; i < inbyte.length; i++) { inbyte[i] = this._input[this.inputLength]; this.inputLength++; if (this.inputLength > this._input.length) { break; } } } }
    function Base64() {
        var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; var base64DecodeChars = new Int8Array([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1]); this.encode = function (str) {
            var out, i, len; var c1, c2, c3; len = str.length; i = 0; out = ""; while (i < len) {
                c1 = str.charCodeAt(i++) & 0xff; if (i == len) { out += base64EncodeChars.charAt(c1 >> 2); out += base64EncodeChars.charAt((c1 & 0x3) << 4); out += "=="; break; }
                c2 = str.charCodeAt(i++); if (i == len) { out += base64EncodeChars.charAt(c1 >> 2); out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)); out += base64EncodeChars.charAt((c2 & 0xF) << 2); out += "="; break; }
                c3 = str.charCodeAt(i++); out += base64EncodeChars.charAt(c1 >> 2); out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)); out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6)); out += base64EncodeChars.charAt(c3 & 0x3F);
            }
            return out;
        }
        this.decodeBuffer = function (str) {
            var c1, c2, c3, c4; var i, len, out; len = str.length; i = 0; var out = new Array(); while (i < len) {
                do { c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff]; } while (i < len && c1 == -1); if (c1 == -1)
                    break; do { c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff]; } while (i < len && c2 == -1); if (c2 == -1)
                    break; out.push(new Int8Array([(c1 << 2) | ((c2 & 0x30) >> 4)])[0]); do {
                        c3 = str.charCodeAt(i++) & 0xff; if (c3 == 61) { return out; }
                        c3 = base64DecodeChars[c3];
                    } while (i < len && c3 == -1); if (c3 == -1)
                    break; out.push(new Int8Array([((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2)])[0]); do {
                        c4 = str.charCodeAt(i++) & 0xff; if (c4 == 61) { return out; }
                        c4 = base64DecodeChars[c4];
                    } while (i < len && c4 == -1); if (c4 == -1)
                    break; out.push(new Int8Array([((c3 & 0x03) << 6) | c4])[0]);
            }
            return out;
        }
    }
    function Util() { }
    Util.stringToByte2 = function (p_real) { return Util.stringToByte(real); }
    Util.stringToByte = function (str) {
        var bytes = new Array(); var len, c; len = str.length; var j = 0; for (var i = 0; i < len; i++) { c = str.charCodeAt(i); if (c >= 0x010000 && c <= 0x10FFFF) { bytes.push(((c >> 18) & 0x07) | 0xF0); bytes.push(((c >> 12) & 0x3F) | 0x80); bytes.push(((c >> 6) & 0x3F) | 0x80); bytes.push((c & 0x3F) | 0x80); } else if (c >= 0x000800 && c <= 0x00FFFF) { bytes.push(((c >> 12) & 0x0F) | 0xE0); bytes.push(((c >> 6) & 0x3F) | 0x80); bytes.push((c & 0x3F) | 0x80); } else if (c >= 0x000080 && c <= 0x0007FF) { bytes.push(((c >> 6) & 0x1F) | 0xC0); bytes.push((c & 0x3F) | 0x80); } else { bytes.push(c & 0xFF); } }
        return bytes;
    }
    Util.byteToString = function (arr) {
        if (typeof arr === 'string') { return arr; }
        var str = '', _arr = arr; for (var i = 0; i < _arr.length; i++) {
            var one = _arr[i].toString(2), v = one.match(/^1+?(?=0)/); if (v && one.length == 8) {
                var bytesLength = v[0].length; var store = _arr[i].toString(2).slice(7 - bytesLength); for (var st = 1; st < bytesLength; st++) { store += _arr[st + i].toString(2).slice(2); }
                str += String.fromCharCode(parseInt(store, 2)); i += bytesLength - 1;
            } else { str += String.fromCharCode(_arr[i]); }
        }
        return str;
    }
    Util.arraycopy = function (from, from_start, to, to_start, length) { for (var i = 0; i < length; i++) { to[to_start + i] = from[from_start + i]; } }
        (function () {
            var C = CryptoJS; var debug = false; function Hex() { }
            Hex.encode = function (b, pos, len) {
                var hexCh = new Array(len * 2); var hexCode = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'); for (var i = pos, j = 0; i < len + pos; i++, j++) { hexCh[j] = hexCode[(b[i] & 0xFF) >> 4]; hexCh[++j] = hexCode[(b[i] & 0x0F)]; }
                return hexCh.join('');
            }
            Hex.decode = function (hex) {
                if (hex == null || hex == '') { return null; }
                if (hex.length % 2 != 0) { return null; }
                var ascLen = hex.length / 2; var hexCh = this.toCharCodeArray(hex); var asc = new Array(ascLen); for (var i = 0; i < ascLen; i++) {
                    if (hexCh[2 * i] >= 0x30 && hexCh[2 * i] <= 0x39) { asc[i] = ((hexCh[2 * i] - 0x30) << 4); } else if (hexCh[2 * i] >= 0x41 && hexCh[2 * i] <= 0x46) { asc[i] = ((hexCh[2 * i] - 0x41 + 10) << 4); } else if (hexCh[2 * i] >= 0x61 && hexCh[2 * i] <= 0x66) { asc[i] = ((hexCh[2 * i] - 0x61 + 10) << 4); } else { return null; }
                    if (hexCh[2 * i + 1] >= 0x30 && hexCh[2 * i + 1] <= 0x39) { asc[i] = (asc[i] | (hexCh[2 * i + 1] - 0x30)); } else if (hexCh[2 * i + 1] >= 0x41 && hexCh[2 * i + 1] <= 0x46) { asc[i] = (asc[i] | (hexCh[2 * i + 1] - 0x41 + 10)); } else if (hexCh[2 * i + 1] >= 0x61 && hexCh[2 * i + 1] <= 0x66) { asc[i] = (asc[i] | (hexCh[2 * i + 1] - 0x61 + 10)); } else { return null; }
                }
                return asc;
            }
            Hex.utf8StrToHex = function (utf8Str) {
                var ens = encodeURIComponent(utf8Str); var es = unescape(ens); var esLen = es.length; var words = []; for (var i = 0; i < esLen; i++) { words[i] = (es.charCodeAt(i).toString(16)); }
                return words.join('');
            }
            Hex.utf8StrToBytes = function (utf8Str) {
                var ens = encodeURIComponent(utf8Str); var es = unescape(ens); var esLen = es.length; var words = []; for (var i = 0; i < esLen; i++) { words[i] = es.charCodeAt(i); }
                return words;
            }
            Hex.hexToUtf8Str = function (utf8Str) {
                var utf8Byte = Hex.decode(utf8Str); var latin1Chars = []; for (var i = 0; i < utf8Byte.length; i++) { latin1Chars.push(String.fromCharCode(utf8Byte[i])); }
                return decodeURIComponent(escape(latin1Chars.join('')));
            }
            Hex.bytesToUtf8Str = function (bytesArray) {
                var utf8Byte = bytesArray; var latin1Chars = []; for (var i = 0; i < utf8Byte.length; i++) { latin1Chars.push(String.fromCharCode(utf8Byte[i])); }
                return decodeURIComponent(escape(latin1Chars.join('')));
            }
            Hex.toCharCodeArray = function (chs) {
                var chArr = new Array(chs.length); for (var i = 0; i < chs.length; i++) { chArr[i] = chs.charCodeAt(i); }
                return chArr;
            }
            Hex.bufferToString = function (buffer) {
                var binary = ''; var bytes = new Uint8Array(buffer);
                var len = bytes.byteLength;
                for (var i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
                return binary;
            }
            Hex.decodeForBase64 = function (str) {
                var binary = atob(str); var buffer = this.toCharCodeArray(binary); var result = this.encode(buffer, 0, buffer.length)
                return result;
            }
            Hex.encodeForBase64 = function (str) {
                var buffer = this.decode(str)
                var binary = this.bufferToString(buffer); var result = btoa(binary); return result;
            }
            function arrayCopy(src, pos1, dest, pos2, len) {
                var realLen = len; if (pos1 + len > src.length && pos2 + len <= dest.length) { realLen = src.length - pos1; } else if (pos2 + len > dest.length && pos1 + len <= src.length) { realLen = dest.length - pos2; } else if (pos1 + len <= src.length && pos2 + len <= dest.length) { realLen = len; } else if (dest.length < src.length) { realLen = dest.length - pos2; } else { realLen = src.length - pos2; }
                for (var i = 0; i < realLen; i++) { dest[i + pos2] = src[i + pos1]; }
            }
            function longToByte(num) { return new Array(0, 0, 0, 0, (num >> 24) & 0x000000FF, (num >> 16) & 0x000000FF, (num >> 8) & 0x000000FF, (num) & 0x000000FF); }
            function intToByte(num) { return new Array((num >> 24) & 0x000000FF, (num >> 16) & 0x000000FF, (num >> 8) & 0x000000FF, (num) & 0x000000FF); }
            function intArrayToByteArray(nums) {
                var b = new Array(nums.length * 4); for (var i = 0; i < nums.length; i++) { arrayCopy(intToByte(nums[i]), 0, b, i * 4, 4); }
                return b;
            }
            function byteToInt(b, pos) { if (pos + 3 < b.length) { return ((b[pos]) << 24) | ((b[pos + 1]) << 16) | ((b[pos + 2]) << 8) | ((b[pos + 3])); } else if (pos + 2 < b.length) { return ((b[pos + 1]) << 16) | ((b[pos + 2]) << 8) | ((b[pos + 3])); } else if (pos + 1 < b.length) { return ((b[pos]) << 8) | ((b[pos + 1])); } else { return ((b[pos])); } }
            function byteArrayToIntArray(b) {
                var arrLen = Math.ceil(b.length / 4); var out = new Array(arrLen); for (var i = 0; i < b.length; i++) { b[i] = b[i] & 0xFF; }
                for (var i = 0; i < out.length; i++) { out[i] = byteToInt(b, i * 4); }
                return out;
            }
            var dbits; var canary = 0xdeadbeefcafe; var j_lm = ((canary & 0xffffff) == 0xefcafe); function BigInteger(a, b, c) {
                if (a != null)
                    if ("number" == typeof a) this.fromNumber(a, b, c); else if (b == null && "string" != typeof a) this.fromString(a, 256); else this.fromString(a, b);
            }
            function nbi() { return new BigInteger(null); }
            function am1(i, x, w, j, c, n) {
                while (--n >= 0) { var v = x * this[i++] + w[j] + c; c = Math.floor(v / 0x4000000); w[j++] = v & 0x3ffffff; }
                return c;
            }
            function am2(i, x, w, j, c, n) {
                var xl = x & 0x7fff, xh = x >> 15; while (--n >= 0) { var l = this[i] & 0x7fff; var h = this[i++] >> 15; var m = xh * l + h * xl; l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff); c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30); w[j++] = l & 0x3fffffff; }
                return c;
            }
            function am3(i, x, w, j, c, n) {
                var xl = x & 0x3fff, xh = x >> 14; while (--n >= 0) { var l = this[i] & 0x3fff; var h = this[i++] >> 14; var m = xh * l + h * xl; l = xl * l + ((m & 0x3fff) << 14) + w[j] + c; c = (l >> 28) + (m >> 14) + xh * h; w[j++] = l & 0xfffffff; }
                return c;
            }
            if (j_lm && (navigator.appName == "Microsoft Internet Explorer")) { BigInteger.prototype.am = am2; dbits = 30; }
            else if (j_lm && (navigator.appName != "Netscape")) { BigInteger.prototype.am = am1; dbits = 26; }
            else { BigInteger.prototype.am = am3; dbits = 28; }
            BigInteger.prototype.DB = dbits; BigInteger.prototype.DM = ((1 << dbits) - 1); BigInteger.prototype.DV = (1 << dbits); var BI_FP = 52; BigInteger.prototype.FV = Math.pow(2, BI_FP); BigInteger.prototype.F1 = BI_FP - dbits; BigInteger.prototype.F2 = 2 * dbits - BI_FP; var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz"; var BI_RC = new Array(); var rr, vv; rr = "0".charCodeAt(0); for (vv = 0; vv <= 9; ++vv)BI_RC[rr++] = vv; rr = "a".charCodeAt(0); for (vv = 10; vv < 36; ++vv)BI_RC[rr++] = vv; rr = "A".charCodeAt(0); for (vv = 10; vv < 36; ++vv)BI_RC[rr++] = vv; function int2char(n) { return BI_RM.charAt(n); }
            function intAt(s, i) { var c = BI_RC[s.charCodeAt(i)]; return (c == null) ? -1 : c; }
            function bnpCopyTo(r) { for (var i = this.t - 1; i >= 0; --i)r[i] = this[i]; r.t = this.t; r.s = this.s; }
            function bnpFromInt(x) { this.t = 1; this.s = (x < 0) ? -1 : 0; if (x > 0) this[0] = x; else if (x < -1) this[0] = x + this.DV; else this.t = 0; }
            function nbv(i) { var r = nbi(); r.fromInt(i); return r; }
            function bnpFromString(s, b) {
                var k; if (b == 16) k = 4; else if (b == 8) k = 3; else if (b == 256) k = 8; else if (b == 2) k = 1; else if (b == 32) k = 5; else if (b == 4) k = 2; else { this.fromRadix(s, b); return; }
                this.t = 0; this.s = 0; var i = s.length, mi = false, sh = 0; while (--i >= 0) {
                    var x = (k == 8) ? s[i] & 0xff : intAt(s, i); if (x < 0) { if (s.charAt(i) == "-") mi = true; continue; }
                    mi = false; if (sh == 0)
                        this[this.t++] = x; else if (sh + k > this.DB) { this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh; this[this.t++] = (x >> (this.DB - sh)); }
                    else
                        this[this.t - 1] |= x << sh; sh += k; if (sh >= this.DB) sh -= this.DB;
                }
                if (k == 8 && (s[0] & 0x80) != 0) { this.s = -1; if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh; }
                this.clamp(); if (mi) BigInteger.ZERO.subTo(this, this);
            }
            function bnpClamp() { var c = this.s & this.DM; while (this.t > 0 && this[this.t - 1] == c) --this.t; }
            function bnToString(b) {
                if (this.s < 0) return "-" + this.negate().toString(b); var k; if (b == 16) k = 4; else if (b == 8) k = 3; else if (b == 2) k = 1; else if (b == 32) k = 5; else if (b == 4) k = 2; else return this.toRadix(b); var km = (1 << k) - 1, d, m = false, r = "", i = this.t; var p = this.DB - (i * this.DB) % k; if (i-- > 0) {
                    if (p < this.DB && (d = this[i] >> p) > 0) { m = true; r = int2char(d); }
                    while (i >= 0) {
                        if (p < k) { d = (this[i] & ((1 << p) - 1)) << (k - p); d |= this[--i] >> (p += this.DB - k); }
                        else { d = (this[i] >> (p -= k)) & km; if (p <= 0) { p += this.DB; --i; } }
                        if (d > 0) m = true; if (m) r += int2char(d);
                    }
                }
                return m ? r : "0";
            }
            function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this, r); return r; }
            function bnAbs() { return (this.s < 0) ? this.negate() : this; }
            function bnCompareTo(a) { var r = this.s - a.s; if (r != 0) return r; var i = this.t; r = i - a.t; if (r != 0) return (this.s < 0) ? -r : r; while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r; return 0; }
            function nbits(x) {
                var r = 1, t; if ((t = x >>> 16) != 0) { x = t; r += 16; }
                if ((t = x >> 8) != 0) { x = t; r += 8; }
                if ((t = x >> 4) != 0) { x = t; r += 4; }
                if ((t = x >> 2) != 0) { x = t; r += 2; }
                if ((t = x >> 1) != 0) { x = t; r += 1; }
                return r;
            }
            function bnBitLength() { if (this.t <= 0) return 0; return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM)); }
            function bnpDLShiftTo(n, r) { var i; for (i = this.t - 1; i >= 0; --i)r[i + n] = this[i]; for (i = n - 1; i >= 0; --i)r[i] = 0; r.t = this.t + n; r.s = this.s; }
            function bnpDRShiftTo(n, r) { for (var i = n; i < this.t; ++i)r[i - n] = this[i]; r.t = Math.max(this.t - n, 0); r.s = this.s; }
            function bnpLShiftTo(n, r) {
                var bs = n % this.DB; var cbs = this.DB - bs; var bm = (1 << cbs) - 1; var ds = Math.floor(n / this.DB), c = (this.s << bs) & this.DM, i; for (i = this.t - 1; i >= 0; --i) { r[i + ds + 1] = (this[i] >> cbs) | c; c = (this[i] & bm) << bs; }
                for (i = ds - 1; i >= 0; --i)r[i] = 0; r[ds] = c; r.t = this.t + ds + 1; r.s = this.s; r.clamp();
            }
            function bnpRShiftTo(n, r) {
                r.s = this.s; var ds = Math.floor(n / this.DB); if (ds >= this.t) { r.t = 0; return; }
                var bs = n % this.DB; var cbs = this.DB - bs; var bm = (1 << bs) - 1; r[0] = this[ds] >> bs; for (var i = ds + 1; i < this.t; ++i) { r[i - ds - 1] |= (this[i] & bm) << cbs; r[i - ds] = this[i] >> bs; }
                if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs; r.t = this.t - ds; r.clamp();
            }
            function bnpSubTo(a, r) {
                var i = 0, c = 0, m = Math.min(a.t, this.t); while (i < m) { c += this[i] - a[i]; r[i++] = c & this.DM; c >>= this.DB; }
                if (a.t < this.t) {
                    c -= a.s; while (i < this.t) { c += this[i]; r[i++] = c & this.DM; c >>= this.DB; }
                    c += this.s;
                }
                else {
                    c += this.s; while (i < a.t) { c -= a[i]; r[i++] = c & this.DM; c >>= this.DB; }
                    c -= a.s;
                }
                r.s = (c < 0) ? -1 : 0; if (c < -1) r[i++] = this.DV + c; else if (c > 0) r[i++] = c; r.t = i; r.clamp();
            }
            function bnpMultiplyTo(a, r) { var x = this.abs(), y = a.abs(); var i = x.t; r.t = i + y.t; while (--i >= 0) r[i] = 0; for (i = 0; i < y.t; ++i)r[i + x.t] = x.am(0, y[i], r, i, 0, x.t); r.s = 0; r.clamp(); if (this.s != a.s) BigInteger.ZERO.subTo(r, r); }
            function bnpSquareTo(r) {
                var x = this.abs(); var i = r.t = 2 * x.t; while (--i >= 0) r[i] = 0; for (i = 0; i < x.t - 1; ++i) { var c = x.am(i, x[i], r, 2 * i, 0, 1); if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) { r[i + x.t] -= x.DV; r[i + x.t + 1] = 1; } }
                if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1); r.s = 0; r.clamp();
            }
            function bnpDivRemTo(m, q, r) {
                var pm = m.abs(); if (pm.t <= 0) return; var pt = this.abs(); if (pt.t < pm.t) { if (q != null) q.fromInt(0); if (r != null) this.copyTo(r); return; }
                if (r == null) r = nbi(); var y = nbi(), ts = this.s, ms = m.s; var nsh = this.DB - nbits(pm[pm.t - 1]); if (nsh > 0) { pm.lShiftTo(nsh, y); pt.lShiftTo(nsh, r); }
                else { pm.copyTo(y); pt.copyTo(r); }
                var ys = y.t; var y0 = y[ys - 1]; if (y0 == 0) return; var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0); var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2; var i = r.t, j = i - ys, t = (q == null) ? nbi() : q; y.dlShiftTo(j, t); if (r.compareTo(t) >= 0) { r[r.t++] = 1; r.subTo(t, r); }
                BigInteger.ONE.dlShiftTo(ys, t); t.subTo(y, y); while (y.t < ys) y[y.t++] = 0; while (--j >= 0) { var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2); if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) { y.dlShiftTo(j, t); r.subTo(t, r); while (r[i] < --qd) r.subTo(t, r); } }
                if (q != null) { r.drShiftTo(ys, q); if (ts != ms) BigInteger.ZERO.subTo(q, q); }
                r.t = ys; r.clamp(); if (nsh > 0) r.rShiftTo(nsh, r); if (ts < 0) BigInteger.ZERO.subTo(r, r);
            }
            function bnMod(a) { var r = nbi(); this.abs().divRemTo(a, null, r); if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r); return r; }
            function Classic(m) { this.m = m; }
            function cConvert(x) { if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m); else return x; }
            function cRevert(x) { return x; }
            function cReduce(x) { x.divRemTo(this.m, null, x); }
            function cMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }
            function cSqrTo(x, r) { x.squareTo(r); this.reduce(r); }
            Classic.prototype.convert = cConvert; Classic.prototype.revert = cRevert; Classic.prototype.reduce = cReduce; Classic.prototype.mulTo = cMulTo; Classic.prototype.sqrTo = cSqrTo; function bnpInvDigit() { if (this.t < 1) return 0; var x = this[0]; if ((x & 1) == 0) return 0; var y = x & 3; y = (y * (2 - (x & 0xf) * y)) & 0xf; y = (y * (2 - (x & 0xff) * y)) & 0xff; y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff; y = (y * (2 - x * y % this.DV)) % this.DV; return (y > 0) ? this.DV - y : -y; }
            function Montgomery(m) { this.m = m; this.mp = m.invDigit(); this.mpl = this.mp & 0x7fff; this.mph = this.mp >> 15; this.um = (1 << (m.DB - 15)) - 1; this.mt2 = 2 * m.t; }
            function montConvert(x) { var r = nbi(); x.abs().dlShiftTo(this.m.t, r); r.divRemTo(this.m, null, r); if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r); return r; }
            function montRevert(x) { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
            function montReduce(x) {
                while (x.t <= this.mt2)
                    x[x.t++] = 0; for (var i = 0; i < this.m.t; ++i) { var j = x[i] & 0x7fff; var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM; j = i + this.m.t; x[j] += this.m.am(0, u0, x, i, 0, this.m.t); while (x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; } }
                x.clamp(); x.drShiftTo(this.m.t, x); if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
            }
            function montSqrTo(x, r) { x.squareTo(r); this.reduce(r); }
            function montMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }
            Montgomery.prototype.convert = montConvert; Montgomery.prototype.revert = montRevert; Montgomery.prototype.reduce = montReduce; Montgomery.prototype.mulTo = montMulTo; Montgomery.prototype.sqrTo = montSqrTo; function bnpIsEven() { return ((this.t > 0) ? (this[0] & 1) : this.s) == 0; }
            function bnpExp(e, z) {
                if (e > 0xffffffff || e < 1) return BigInteger.ONE; var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1; g.copyTo(r); while (--i >= 0) { z.sqrTo(r, r2); if ((e & (1 << i)) > 0) z.mulTo(r2, g, r); else { var t = r; r = r2; r2 = t; } }
                return z.revert(r);
            }
            function bnModPowInt(e, m) { var z; if (e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m); return this.exp(e, z); }
            BigInteger.prototype.copyTo = bnpCopyTo; BigInteger.prototype.fromInt = bnpFromInt; BigInteger.prototype.fromString = bnpFromString; BigInteger.prototype.clamp = bnpClamp; BigInteger.prototype.dlShiftTo = bnpDLShiftTo; BigInteger.prototype.drShiftTo = bnpDRShiftTo; BigInteger.prototype.lShiftTo = bnpLShiftTo; BigInteger.prototype.rShiftTo = bnpRShiftTo; BigInteger.prototype.subTo = bnpSubTo; BigInteger.prototype.multiplyTo = bnpMultiplyTo; BigInteger.prototype.squareTo = bnpSquareTo; BigInteger.prototype.divRemTo = bnpDivRemTo; BigInteger.prototype.invDigit = bnpInvDigit; BigInteger.prototype.isEven = bnpIsEven; BigInteger.prototype.exp = bnpExp; BigInteger.prototype.toString = bnToString; BigInteger.prototype.negate = bnNegate; BigInteger.prototype.abs = bnAbs; BigInteger.prototype.compareTo = bnCompareTo; BigInteger.prototype.bitLength = bnBitLength; BigInteger.prototype.mod = bnMod; BigInteger.prototype.modPowInt = bnModPowInt; BigInteger.ZERO = nbv(0); BigInteger.ONE = nbv(1); function bnClone() { var r = nbi(); this.copyTo(r); return r; }
            function bnIntValue() {
                if (this.s < 0) { if (this.t == 1) return this[0] - this.DV; else if (this.t == 0) return -1; }
                else if (this.t == 1) return this[0]; else if (this.t == 0) return 0; return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
            }
            function bnByteValue() { return (this.t == 0) ? this.s : (this[0] << 24) >> 24; }
            function bnShortValue() { return (this.t == 0) ? this.s : (this[0] << 16) >> 16; }
            function bnpChunkSize(r) { return Math.floor(Math.LN2 * this.DB / Math.log(r)); }
            function bnSigNum() { if (this.s < 0) return -1; else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0; else return 1; }
            function bnpToRadix(b) {
                if (b == null) b = 10; if (this.signum() == 0 || b < 2 || b > 36) return "0"; var cs = this.chunkSize(b); var a = Math.pow(b, cs); var d = nbv(a), y = nbi(), z = nbi(), r = ""; this.divRemTo(d, y, z); while (y.signum() > 0) { r = (a + z.intValue()).toString(b).substr(1) + r; y.divRemTo(d, y, z); }
                return z.intValue().toString(b) + r;
            }
            function bnpFromRadix(s, b) {
                this.fromInt(0); if (b == null) b = 10; var cs = this.chunkSize(b); var d = Math.pow(b, cs), mi = false, j = 0, w = 0; for (var i = 0; i < s.length; ++i) {
                    var x = intAt(s, i); if (x < 0) { if (s.charAt(i) == "-" && this.signum() == 0) mi = true; continue; }
                    w = b * w + x; if (++j >= cs) { this.dMultiply(d); this.dAddOffset(w, 0); j = 0; w = 0; }
                }
                if (j > 0) { this.dMultiply(Math.pow(b, j)); this.dAddOffset(w, 0); }
                if (mi) BigInteger.ZERO.subTo(this, this);
            }
            function bnpFromNumber(a, b, c) {
                if ("number" == typeof b) {
                    if (a < 2) this.fromInt(1); else {
                        this.fromNumber(a, c); if (!this.testBit(a - 1))
                            this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this); if (this.isEven()) this.dAddOffset(1, 0); while (!this.isProbablePrime(b)) { this.dAddOffset(2, 0); if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this); }
                    }
                }
                else { var x = new Array(), t = a & 7; x.length = (a >> 3) + 1; b.nextBytes(x); if (t > 0) x[0] &= ((1 << t) - 1); else x[0] = 0; this.fromString(x, 256); }
            }
            function bnToByteArray() {
                var i = this.t, r = new Array(); r[0] = this.s; var p = this.DB - (i * this.DB) % 8, d, k = 0; if (i-- > 0) {
                    if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
                        r[k++] = d | (this.s << (this.DB - p)); while (i >= 0) {
                            if (p < 8) { d = (this[i] & ((1 << p) - 1)) << (8 - p); d |= this[--i] >> (p += this.DB - 8); }
                            else { d = (this[i] >> (p -= 8)) & 0xff; if (p <= 0) { p += this.DB; --i; } }
                            if ((d & 0x80) != 0) d |= -256; if (k == 0 && (this.s & 0x80) != (d & 0x80)) ++k; if (k > 0 || d != this.s) r[k++] = d;
                        }
                }
                return r;
            }
            function bnEquals(a) { return (this.compareTo(a) == 0); }
            function bnMin(a) { return (this.compareTo(a) < 0) ? this : a; }
            function bnMax(a) { return (this.compareTo(a) > 0) ? this : a; }
            function bnpBitwiseTo(a, op, r) {
                var i, f, m = Math.min(a.t, this.t); for (i = 0; i < m; ++i)r[i] = op(this[i], a[i]); if (a.t < this.t) { f = a.s & this.DM; for (i = m; i < this.t; ++i)r[i] = op(this[i], f); r.t = this.t; }
                else { f = this.s & this.DM; for (i = m; i < a.t; ++i)r[i] = op(f, a[i]); r.t = a.t; }
                r.s = op(this.s, a.s); r.clamp();
            }
            function op_and(x, y) { return x & y; }
            function bnAnd(a) { var r = nbi(); this.bitwiseTo(a, op_and, r); return r; }
            function op_or(x, y) { return x | y; }
            function bnOr(a) { var r = nbi(); this.bitwiseTo(a, op_or, r); return r; }
            function op_xor(x, y) { return x ^ y; }
            function bnXor(a) { var r = nbi(); this.bitwiseTo(a, op_xor, r); return r; }
            function op_andnot(x, y) { return x & ~y; }
            function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a, op_andnot, r); return r; }
            function bnNot() { var r = nbi(); for (var i = 0; i < this.t; ++i)r[i] = this.DM & ~this[i]; r.t = this.t; r.s = ~this.s; return r; }
            function bnShiftLeft(n) { var r = nbi(); if (n < 0) this.rShiftTo(-n, r); else this.lShiftTo(n, r); return r; }
            function bnShiftRight(n) { var r = nbi(); if (n < 0) this.lShiftTo(-n, r); else this.rShiftTo(n, r); return r; }
            function lbit(x) {
                if (x == 0) return -1; var r = 0; if ((x & 0xffff) == 0) { x >>= 16; r += 16; }
                if ((x & 0xff) == 0) { x >>= 8; r += 8; }
                if ((x & 0xf) == 0) { x >>= 4; r += 4; }
                if ((x & 3) == 0) { x >>= 2; r += 2; }
                if ((x & 1) == 0) ++r; return r;
            }
            function bnGetLowestSetBit() {
                for (var i = 0; i < this.t; ++i)
                    if (this[i] != 0) return i * this.DB + lbit(this[i]); if (this.s < 0) return this.t * this.DB; return -1;
            }
            function cbit(x) {
                var r = 0; while (x != 0) { x &= x - 1; ++r; }
                return r;
            }
            function bnBitCount() { var r = 0, x = this.s & this.DM; for (var i = 0; i < this.t; ++i)r += cbit(this[i] ^ x); return r; }
            function bnTestBit(n) { var j = Math.floor(n / this.DB); if (j >= this.t) return (this.s != 0); return ((this[j] & (1 << (n % this.DB))) != 0); }
            function bnpChangeBit(n, op) { var r = BigInteger.ONE.shiftLeft(n); this.bitwiseTo(r, op, r); return r; }
            function bnSetBit(n) { return this.changeBit(n, op_or); }
            function bnClearBit(n) { return this.changeBit(n, op_andnot); }
            function bnFlipBit(n) { return this.changeBit(n, op_xor); }
            function bnpAddTo(a, r) {
                var i = 0, c = 0, m = Math.min(a.t, this.t); while (i < m) { c += this[i] + a[i]; r[i++] = c & this.DM; c >>= this.DB; }
                if (a.t < this.t) {
                    c += a.s; while (i < this.t) { c += this[i]; r[i++] = c & this.DM; c >>= this.DB; }
                    c += this.s;
                }
                else {
                    c += this.s; while (i < a.t) { c += a[i]; r[i++] = c & this.DM; c >>= this.DB; }
                    c += a.s;
                }
                r.s = (c < 0) ? -1 : 0; if (c > 0) r[i++] = c; else if (c < -1) r[i++] = this.DV + c; r.t = i; r.clamp();
            }
            function bnAdd(a) { var r = nbi(); this.addTo(a, r); return r; }
            function bnSubtract(a) { var r = nbi(); this.subTo(a, r); return r; }
            function bnMultiply(a) { var r = nbi(); this.multiplyTo(a, r); return r; }
            function bnSquare() { var r = nbi(); this.squareTo(r); return r; }
            function bnDivide(a) { var r = nbi(); this.divRemTo(a, r, null); return r; }
            function bnRemainder(a) { var r = nbi(); this.divRemTo(a, null, r); return r; }
            function bnDivideAndRemainder(a) { var q = nbi(), r = nbi(); this.divRemTo(a, q, r); return new Array(q, r); }
            function bnpDMultiply(n) { this[this.t] = this.am(0, n - 1, this, 0, 0, this.t); ++this.t; this.clamp(); }
            function bnpDAddOffset(n, w) { if (n == 0) return; while (this.t <= w) this[this.t++] = 0; this[w] += n; while (this[w] >= this.DV) { this[w] -= this.DV; if (++w >= this.t) this[this.t++] = 0; ++this[w]; } }
            function NullExp() { }
            function nNop(x) { return x; }
            function nMulTo(x, y, r) { x.multiplyTo(y, r); }
            function nSqrTo(x, r) { x.squareTo(r); }
            NullExp.prototype.convert = nNop; NullExp.prototype.revert = nNop; NullExp.prototype.mulTo = nMulTo; NullExp.prototype.sqrTo = nSqrTo; function bnPow(e) { return this.exp(e, new NullExp()); }
            function bnpMultiplyLowerTo(a, n, r) { var i = Math.min(this.t + a.t, n); r.s = 0; r.t = i; while (i > 0) r[--i] = 0; var j; for (j = r.t - this.t; i < j; ++i)r[i + this.t] = this.am(0, a[i], r, i, 0, this.t); for (j = Math.min(a.t, n); i < j; ++i)this.am(0, a[i], r, i, 0, n - i); r.clamp(); }
            function bnpMultiplyUpperTo(a, n, r) {
                --n; var i = r.t = this.t + a.t - n; r.s = 0; while (--i >= 0) r[i] = 0; for (i = Math.max(n - this.t, 0); i < a.t; ++i)
                    r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n); r.clamp(); r.drShiftTo(1, r);
            }
            function Barrett(m) { this.r2 = nbi(); this.q3 = nbi(); BigInteger.ONE.dlShiftTo(2 * m.t, this.r2); this.mu = this.r2.divide(m); this.m = m; }
            function barrettConvert(x) { if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m); else if (x.compareTo(this.m) < 0) return x; else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; } }
            function barrettRevert(x) { return x; }
            function barrettReduce(x) {
                x.drShiftTo(this.m.t - 1, this.r2); if (x.t > this.m.t + 1) { x.t = this.m.t + 1; x.clamp(); }
                this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3); this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1); x.subTo(this.r2, x); while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
            }
            function barrettSqrTo(x, r) { x.squareTo(r); this.reduce(r); }
            function barrettMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }
            Barrett.prototype.convert = barrettConvert; Barrett.prototype.revert = barrettRevert; Barrett.prototype.reduce = barrettReduce; Barrett.prototype.mulTo = barrettMulTo; Barrett.prototype.sqrTo = barrettSqrTo; function bnModPow(e, m) {
                var i = e.bitLength(), k, r = nbv(1), z; if (i <= 0) return r; else if (i < 18) k = 1; else if (i < 48) k = 3; else if (i < 144) k = 4; else if (i < 768) k = 5; else k = 6; if (i < 8)
                    z = new Classic(m); else if (m.isEven())
                    z = new Barrett(m); else
                    z = new Montgomery(m); var g = new Array(), n = 3, k1 = k - 1, km = (1 << k) - 1; g[1] = z.convert(this); if (k > 1) { var g2 = nbi(); z.sqrTo(g[1], g2); while (n <= km) { g[n] = nbi(); z.mulTo(g2, g[n - 2], g[n]); n += 2; } }
                var j = e.t - 1, w, is1 = true, r2 = nbi(), t; i = nbits(e[j]) - 1; while (j >= 0) {
                    if (i >= k1) w = (e[j] >> (i - k1)) & km; else { w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i); if (j > 0) w |= e[j - 1] >> (this.DB + i - k1); }
                    n = k; while ((w & 1) == 0) { w >>= 1; --n; }
                    if ((i -= n) < 0) { i += this.DB; --j; }
                    if (is1) { g[w].copyTo(r); is1 = false; }
                    else {
                        while (n > 1) { z.sqrTo(r, r2); z.sqrTo(r2, r); n -= 2; }
                        if (n > 0) z.sqrTo(r, r2); else { t = r; r = r2; r2 = t; }
                        z.mulTo(r2, g[w], r);
                    }
                    while (j >= 0 && (e[j] & (1 << i)) == 0) { z.sqrTo(r, r2); t = r; r = r2; r2 = t; if (--i < 0) { i = this.DB - 1; --j; } }
                }
                return z.revert(r);
            }
            function bnGCD(a) {
                var x = (this.s < 0) ? this.negate() : this.clone(); var y = (a.s < 0) ? a.negate() : a.clone(); if (x.compareTo(y) < 0) { var t = x; x = y; y = t; }
                var i = x.getLowestSetBit(), g = y.getLowestSetBit(); if (g < 0) return x; if (i < g) g = i; if (g > 0) { x.rShiftTo(g, x); y.rShiftTo(g, y); }
                while (x.signum() > 0) {
                    if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x); if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y); if (x.compareTo(y) >= 0) { x.subTo(y, x); x.rShiftTo(1, x); }
                    else { y.subTo(x, y); y.rShiftTo(1, y); }
                }
                if (g > 0) y.lShiftTo(g, y); return y;
            }
            function bnpModInt(n) {
                if (n <= 0) return 0; var d = this.DV % n, r = (this.s < 0) ? n - 1 : 0; if (this.t > 0)
                    if (d == 0) r = this[0] % n; else for (var i = this.t - 1; i >= 0; --i)r = (d * r + this[i]) % n; return r;
            }
            function bnModInverse(m) {
                var ac = m.isEven(); if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO; var u = m.clone(), v = this.clone(); var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1); while (u.signum() != 0) {
                    while (u.isEven()) {
                        u.rShiftTo(1, u); if (ac) {
                            if (!a.isEven() || !b.isEven()) { a.addTo(this, a); b.subTo(m, b); }
                            a.rShiftTo(1, a);
                        }
                        else if (!b.isEven()) b.subTo(m, b); b.rShiftTo(1, b);
                    }
                    while (v.isEven()) {
                        v.rShiftTo(1, v); if (ac) {
                            if (!c.isEven() || !d.isEven()) { c.addTo(this, c); d.subTo(m, d); }
                            c.rShiftTo(1, c);
                        }
                        else if (!d.isEven()) d.subTo(m, d); d.rShiftTo(1, d);
                    }
                    if (u.compareTo(v) >= 0) { u.subTo(v, u); if (ac) a.subTo(c, a); b.subTo(d, b); }
                    else { v.subTo(u, v); if (ac) c.subTo(a, c); d.subTo(b, d); }
                }
                if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO; if (d.compareTo(m) >= 0) return d.subtract(m); if (d.signum() < 0) d.addTo(m, d); else return d; if (d.signum() < 0) return d.add(m); else return d;
            }
            var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997]; var lplim = (1 << 26) / lowprimes[lowprimes.length - 1]; function bnIsProbablePrime(t) {
                var i, x = this.abs(); if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
                    for (i = 0; i < lowprimes.length; ++i)
                        if (x[0] == lowprimes[i]) return true; return false;
                }
                if (x.isEven()) return false; i = 1; while (i < lowprimes.length) { var m = lowprimes[i], j = i + 1; while (j < lowprimes.length && m < lplim) m *= lowprimes[j++]; m = x.modInt(m); while (i < j) if (m % lowprimes[i++] == 0) return false; }
                return x.millerRabin(t);
            }
            function bnpMillerRabin(t) {
                var n1 = this.subtract(BigInteger.ONE); var k = n1.getLowestSetBit(); if (k <= 0) return false; var r = n1.shiftRight(k); t = (t + 1) >> 1; if (t > lowprimes.length) t = lowprimes.length; var a = nbi(); for (var i = 0; i < t; ++i) {
                    a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]); var y = a.modPow(r, this); if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
                        var j = 1; while (j++ < k && y.compareTo(n1) != 0) { y = y.modPowInt(2, this); if (y.compareTo(BigInteger.ONE) == 0) return false; }
                        if (y.compareTo(n1) != 0) return false;
                    }
                }
                return true;
            }
            BigInteger.prototype.chunkSize = bnpChunkSize; BigInteger.prototype.toRadix = bnpToRadix; BigInteger.prototype.fromRadix = bnpFromRadix; BigInteger.prototype.fromNumber = bnpFromNumber; BigInteger.prototype.bitwiseTo = bnpBitwiseTo; BigInteger.prototype.changeBit = bnpChangeBit; BigInteger.prototype.addTo = bnpAddTo; BigInteger.prototype.dMultiply = bnpDMultiply; BigInteger.prototype.dAddOffset = bnpDAddOffset; BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo; BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo; BigInteger.prototype.modInt = bnpModInt; BigInteger.prototype.millerRabin = bnpMillerRabin; BigInteger.prototype.clone = bnClone; BigInteger.prototype.intValue = bnIntValue; BigInteger.prototype.byteValue = bnByteValue; BigInteger.prototype.shortValue = bnShortValue; BigInteger.prototype.signum = bnSigNum; BigInteger.prototype.toByteArray = bnToByteArray; BigInteger.prototype.equals = bnEquals; BigInteger.prototype.min = bnMin; BigInteger.prototype.max = bnMax; BigInteger.prototype.and = bnAnd; BigInteger.prototype.or = bnOr; BigInteger.prototype.xor = bnXor; BigInteger.prototype.andNot = bnAndNot; BigInteger.prototype.not = bnNot; BigInteger.prototype.shiftLeft = bnShiftLeft; BigInteger.prototype.shiftRight = bnShiftRight; BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit; BigInteger.prototype.bitCount = bnBitCount; BigInteger.prototype.testBit = bnTestBit; BigInteger.prototype.setBit = bnSetBit; BigInteger.prototype.clearBit = bnClearBit; BigInteger.prototype.flipBit = bnFlipBit; BigInteger.prototype.add = bnAdd; BigInteger.prototype.subtract = bnSubtract; BigInteger.prototype.multiply = bnMultiply; BigInteger.prototype.divide = bnDivide; BigInteger.prototype.remainder = bnRemainder; BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder; BigInteger.prototype.modPow = bnModPow; BigInteger.prototype.modInverse = bnModInverse; BigInteger.prototype.pow = bnPow; BigInteger.prototype.gcd = bnGCD; BigInteger.prototype.isProbablePrime = bnIsProbablePrime; BigInteger.prototype.square = bnSquare; var rng_state; var rng_pool; var rng_pptr; function rng_seed_int(x) { rng_pool[rng_pptr++] ^= x & 255; rng_pool[rng_pptr++] ^= (x >> 8) & 255; rng_pool[rng_pptr++] ^= (x >> 16) & 255; rng_pool[rng_pptr++] ^= (x >> 24) & 255; if (rng_pptr >= rng_psize) rng_pptr -= rng_psize; }
            function rng_seed_time() { rng_seed_int(new Date().getTime()); }
            if (rng_pool == null) {
                rng_pool = new Array(); rng_pptr = 0; var t; if (navigator.appName == "Netscape" && navigator.appVersion < "5" && window.crypto) {
                    var z = window.crypto.random(32); for (t = 0; t < z.length; ++t)
                        rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
                }
                while (rng_pptr < rng_psize) { t = Math.floor(65536 * Math.random()); rng_pool[rng_pptr++] = t >>> 8; rng_pool[rng_pptr++] = t & 255; }
                rng_pptr = 0; rng_seed_time();
            }
            function rng_get_byte() {
                if (rng_state == null) {
                    rng_seed_time(); rng_state = prng_newstate(); rng_state.init(rng_pool); for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
                        rng_pool[rng_pptr] = 0; rng_pptr = 0;
                }
                return rng_state.next();
            }
            function rng_get_bytes(ba) { var i; for (i = 0; i < ba.length; ++i)ba[i] = rng_get_byte(); }
            function SecureRandom() { }
            SecureRandom.prototype.nextBytes = rng_get_bytes; function ECFieldElementFp(q, x) { this.x = x; this.q = q; }
            function feFpEquals(other) { if (other == this) return true; return (this.q.equals(other.q) && this.x.equals(other.x)); }
            function feFpToBigInteger() { return this.x; }
            function feFpNegate() { return new ECFieldElementFp(this.q, this.x.negate().mod(this.q)); }
            function feFpAdd(b) { return new ECFieldElementFp(this.q, this.x.add(b.toBigInteger()).mod(this.q)); }
            function feFpSubtract(b) { return new ECFieldElementFp(this.q, this.x.subtract(b.toBigInteger()).mod(this.q)); }
            function feFpMultiply(b) { return new ECFieldElementFp(this.q, this.x.multiply(b.toBigInteger()).mod(this.q)); }
            function feFpSquare() { return new ECFieldElementFp(this.q, this.x.square().mod(this.q)); }
            function feFpDivide(b) { return new ECFieldElementFp(this.q, this.x.multiply(b.toBigInteger().modInverse(this.q)).mod(this.q)); }
            ECFieldElementFp.prototype.equals = feFpEquals; ECFieldElementFp.prototype.toBigInteger = feFpToBigInteger; ECFieldElementFp.prototype.negate = feFpNegate; ECFieldElementFp.prototype.add = feFpAdd; ECFieldElementFp.prototype.subtract = feFpSubtract; ECFieldElementFp.prototype.multiply = feFpMultiply; ECFieldElementFp.prototype.square = feFpSquare; ECFieldElementFp.prototype.divide = feFpDivide; function ECPointFp(curve, x, y, z) {
                this.curve = curve; this.x = x; this.y = y; if (z == null) { this.z = BigInteger.ONE; }
                else { this.z = z; }
                this.zinv = null;
            }
            function pointFpGetX() {
                if (this.zinv == null) { this.zinv = this.z.modInverse(this.curve.q); }
                return this.curve.fromBigInteger(this.x.toBigInteger().multiply(this.zinv).mod(this.curve.q));
            }
            function pointFpGetY() {
                if (this.zinv == null) { this.zinv = this.z.modInverse(this.curve.q); }
                return this.curve.fromBigInteger(this.y.toBigInteger().multiply(this.zinv).mod(this.curve.q));
            }
            function pointFpEquals(other) { if (other == this) return true; if (this.isInfinity()) return other.isInfinity(); if (other.isInfinity()) return this.isInfinity(); var u, v; u = other.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(other.z)).mod(this.curve.q); if (!u.equals(BigInteger.ZERO)) return false; v = other.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(other.z)).mod(this.curve.q); return v.equals(BigInteger.ZERO); }
            function pointFpIsInfinity() { if ((this.x == null) && (this.y == null)) return true; return this.z.equals(BigInteger.ZERO) && !this.y.toBigInteger().equals(BigInteger.ZERO); }
            function pointFpNegate() { return new ECPointFp(this.curve, this.x, this.y.negate(), this.z); }
            function pointFpAdd(b) {
                if (this.isInfinity()) return b; if (b.isInfinity()) return this; var u = b.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(b.z)).mod(this.curve.q); var v = b.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(b.z)).mod(this.curve.q); if (BigInteger.ZERO.equals(v)) {
                    if (BigInteger.ZERO.equals(u)) { return this.twice(); }
                    return this.curve.getInfinity();
                }
                var THREE = new BigInteger("3"); var x1 = this.x.toBigInteger(); var y1 = this.y.toBigInteger(); var x2 = b.x.toBigInteger(); var y2 = b.y.toBigInteger(); var v2 = v.square(); var v3 = v2.multiply(v); var x1v2 = x1.multiply(v2); var zu2 = u.square().multiply(this.z); var x3 = zu2.subtract(x1v2.shiftLeft(1)).multiply(b.z).subtract(v3).multiply(v).mod(this.curve.q); var y3 = x1v2.multiply(THREE).multiply(u).subtract(y1.multiply(v3)).subtract(zu2.multiply(u)).multiply(b.z).add(u.multiply(v3)).mod(this.curve.q); var z3 = v3.multiply(this.z).multiply(b.z).mod(this.curve.q); return new ECPointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3), z3);
            }
            function pointFpTwice() {
                if (this.isInfinity()) return this; if (this.y.toBigInteger().signum() == 0) return this.curve.getInfinity(); var THREE = new BigInteger("3"); var x1 = this.x.toBigInteger(); var y1 = this.y.toBigInteger(); var y1z1 = y1.multiply(this.z); var y1sqz1 = y1z1.multiply(y1).mod(this.curve.q); var a = this.curve.a.toBigInteger(); var w = x1.square().multiply(THREE); if (!BigInteger.ZERO.equals(a)) { w = w.add(this.z.square().multiply(a)); }
                w = w.mod(this.curve.q); var x3 = w.square().subtract(x1.shiftLeft(3).multiply(y1sqz1)).shiftLeft(1).multiply(y1z1).mod(this.curve.q); var y3 = w.multiply(THREE).multiply(x1).subtract(y1sqz1.shiftLeft(1)).shiftLeft(2).multiply(y1sqz1).subtract(w.square().multiply(w)).mod(this.curve.q); var z3 = y1z1.square().multiply(y1z1).shiftLeft(3).mod(this.curve.q); return new ECPointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3), z3);
            }
            function pointFpMultiply(k) {
                if (this.isInfinity()) return this; if (k.signum() == 0) return this.curve.getInfinity(); var e = k; var h = e.multiply(new BigInteger("3")); var neg = this.negate(); var R = this; var i; for (i = h.bitLength() - 2; i > 0; --i) { R = R.twice(); var hBit = h.testBit(i); var eBit = e.testBit(i); if (hBit != eBit) { R = R.add(hBit ? this : neg); } }
                return R;
            }
            function pointFpMultiplyTwo(j, x, k) {
                var i; if (j.bitLength() > k.bitLength())
                    i = j.bitLength() - 1; else
                    i = k.bitLength() - 1; var R = this.curve.getInfinity(); var both = this.add(x); while (i >= 0) {
                        R = R.twice(); if (j.testBit(i)) {
                            if (k.testBit(i)) { R = R.add(both); }
                            else { R = R.add(this); }
                        }
                        else { if (k.testBit(i)) { R = R.add(x); } }
                        --i;
                    }
                return R;
            }
            ECPointFp.prototype.getX = pointFpGetX; ECPointFp.prototype.getY = pointFpGetY; ECPointFp.prototype.equals = pointFpEquals; ECPointFp.prototype.isInfinity = pointFpIsInfinity; ECPointFp.prototype.negate = pointFpNegate; ECPointFp.prototype.add = pointFpAdd; ECPointFp.prototype.twice = pointFpTwice; ECPointFp.prototype.multiply = pointFpMultiply; ECPointFp.prototype.multiplyTwo = pointFpMultiplyTwo; function ECCurveFp(q, a, b) { this.q = q; this.a = this.fromBigInteger(a); this.b = this.fromBigInteger(b); this.infinity = new ECPointFp(this, null, null); }
            function curveFpGetQ() { return this.q; }
            function curveFpGetA() { return this.a; }
            function curveFpGetB() { return this.b; }
            function curveFpEquals(other) { if (other == this) return true; return (this.q.equals(other.q) && this.a.equals(other.a) && this.b.equals(other.b)); }
            function curveFpGetInfinity() { return this.infinity; }
            function curveFpFromBigInteger(x) { return new ECFieldElementFp(this.q, x); }
            function curveFpDecodePointHex(s) { switch (parseInt(s.substr(0, 2), 16)) { case 0: return this.infinity; case 2: case 3: return null; case 4: case 6: case 7: var len = (s.length - 2) / 2; var xHex = s.substr(2, len); var yHex = s.substr(len + 2, len); return new ECPointFp(this, this.fromBigInteger(new BigInteger(xHex, 16)), this.fromBigInteger(new BigInteger(yHex, 16))); default: return null; } }
            ECCurveFp.prototype.getQ = curveFpGetQ; ECCurveFp.prototype.getA = curveFpGetA; ECCurveFp.prototype.getB = curveFpGetB; ECCurveFp.prototype.equals = curveFpEquals; ECCurveFp.prototype.getInfinity = curveFpGetInfinity; ECCurveFp.prototype.fromBigInteger = curveFpFromBigInteger; ECCurveFp.prototype.decodePointHex = curveFpDecodePointHex; ECFieldElementFp.prototype.getByteLength = function () { return Math.floor((this.toBigInteger().bitLength() + 7) / 8); }; ECPointFp.prototype.getEncoded = function (compressed) {
                var integerToBytes = function (i, len) {
                    var bytes = i.toByteArrayUnsigned(); if (len < bytes.length) { bytes = bytes.slice(bytes.length - len); } else while (len > bytes.length) { bytes.unshift(0); }
                    return bytes;
                }; var x = this.getX().toBigInteger(); var y = this.getY().toBigInteger(); var enc = integerToBytes(x, 32); if (compressed) { if (y.isEven()) { enc.unshift(0x02); } else { enc.unshift(0x03); } } else { enc.unshift(0x04); enc = enc.concat(integerToBytes(y, 32)); }
                return enc;
            }; ECPointFp.decodeFrom = function (curve, enc) { var type = enc[0]; var dataLen = enc.length - 1; var xBa = enc.slice(1, 1 + dataLen / 2); var yBa = enc.slice(1 + dataLen / 2, 1 + dataLen); xBa.unshift(0); yBa.unshift(0); var x = new BigInteger(xBa); var y = new BigInteger(yBa); return new ECPointFp(curve, curve.fromBigInteger(x), curve.fromBigInteger(y)); }; ECPointFp.decodeFromHex = function (curve, encHex) { var type = encHex.substr(0, 2); var dataLen = encHex.length - 2; var xHex = encHex.substr(2, dataLen / 2); var yHex = encHex.substr(2 + dataLen / 2, dataLen / 2); var x = new BigInteger(xHex, 16); var y = new BigInteger(yHex, 16); return new ECPointFp(curve, curve.fromBigInteger(x), curve.fromBigInteger(y)); }; ECPointFp.prototype.add2D = function (b) {
                if (this.isInfinity()) return b; if (b.isInfinity()) return this; if (this.x.equals(b.x)) {
                    if (this.y.equals(b.y)) { return this.twice(); }
                    return this.curve.getInfinity();
                }
                var x_x = b.x.subtract(this.x); var y_y = b.y.subtract(this.y); var gamma = y_y.divide(x_x); var x3 = gamma.square().subtract(this.x).subtract(b.x); var y3 = gamma.multiply(this.x.subtract(x3)).subtract(this.y); return new ECPointFp(this.curve, x3, y3);
            }; ECPointFp.prototype.twice2D = function () {
                if (this.isInfinity()) return this; if (this.y.toBigInteger().signum() == 0) { return this.curve.getInfinity(); }
                var TWO = this.curve.fromBigInteger(BigInteger.valueOf(2)); var THREE = this.curve.fromBigInteger(BigInteger.valueOf(3)); var gamma = this.x.square().multiply(THREE).add(this.curve.a).divide(this.y.multiply(TWO)); var x3 = gamma.square().subtract(this.x.multiply(TWO)); var y3 = gamma.multiply(this.x.subtract(x3)).subtract(this.y); return new ECPointFp(this.curve, x3, y3);
            }; ECPointFp.prototype.multiply2D = function (k) {
                if (this.isInfinity()) return this; if (k.signum() == 0) return this.curve.getInfinity(); var e = k; var h = e.multiply(new BigInteger("3")); var neg = this.negate(); var R = this; var i; for (i = h.bitLength() - 2; i > 0; --i) { R = R.twice(); var hBit = h.testBit(i); var eBit = e.testBit(i); if (hBit != eBit) { R = R.add2D(hBit ? this : neg); } }
                return R;
            }; ECPointFp.prototype.isOnCurve = function () { var x = this.getX().toBigInteger(); var y = this.getY().toBigInteger(); var a = this.curve.getA().toBigInteger(); var b = this.curve.getB().toBigInteger(); var n = this.curve.getQ(); var lhs = y.multiply(y).mod(n); var rhs = x.multiply(x).multiply(x).add(a.multiply(x)).add(b).mod(n); return lhs.equals(rhs); }; ECPointFp.prototype.toString = function () { return '(' + this.getX().toBigInteger().toString() + ',' + this.getY().toBigInteger().toString() + ')'; }; ECPointFp.prototype.validate = function () {
                var n = this.curve.getQ(); if (this.isInfinity()) { throw new Error("Point is at infinity."); }
                var x = this.getX().toBigInteger(); var y = this.getY().toBigInteger(); if (x.compareTo(BigInteger.ONE) < 0 || x.compareTo(n.subtract(BigInteger.ONE)) > 0) { throw new Error('x coordinate out of bounds'); }
                if (y.compareTo(BigInteger.ONE) < 0 || y.compareTo(n.subtract(BigInteger.ONE)) > 0) { throw new Error('y coordinate out of bounds'); }
                if (!this.isOnCurve()) { throw new Error("Point is not on the curve."); }
                if (this.multiply(n).isInfinity()) { throw new Error("Point is not a scalar multiple of G."); }
                return true;
            }; function Arcfour() { this.i = 0; this.j = 0; this.S = new Array(); }
            function ARC4init(key) {
                var i, j, t; for (i = 0; i < 256; ++i)
                    this.S[i] = i; j = 0; for (i = 0; i < 256; ++i) { j = (j + this.S[i] + key[i % key.length]) & 255; t = this.S[i]; this.S[i] = this.S[j]; this.S[j] = t; }
                this.i = 0; this.j = 0;
            }
            function ARC4next() { var t; this.i = (this.i + 1) & 255; this.j = (this.j + this.S[this.i]) & 255; t = this.S[this.i]; this.S[this.i] = this.S[this.j]; this.S[this.j] = t; return this.S[(t + this.S[this.i]) & 255]; }
            Arcfour.prototype.init = ARC4init; Arcfour.prototype.next = ARC4next; function prng_newstate() { return new Arcfour(); }
            var rng_psize = 256; var sm2_ecParams = { "p": "FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF", "a": "FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC", "b": "28E9FA9E9D9F5E344D5A9E4BCF6509A7F39789F515AB8F92DDBCBD414D940E93", "n": "FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFF7203DF6B21C6052B53BBF40939D54123", "gx": "32C4AE2C1F1981195F9904466A39C9948FE30BBFF2660BE1715A4589334C74C7", "gy": "BC3736A2F4F6779C59BDCEE36B692153D0A9877CC62A474002DF32E52139F0A0", "keylen": 256 }; C.SM2 = {}; C.SM2.ecc_p = new BigInteger(sm2_ecParams['p'], 16); C.SM2.ecc_a = new BigInteger(sm2_ecParams['a'], 16); C.SM2.ecc_b = new BigInteger(sm2_ecParams['b'], 16); C.SM2.ecc_n = new BigInteger(sm2_ecParams['n'], 16); C.SM2.ecc_gx = new BigInteger(sm2_ecParams['gx'], 16); C.SM2.ecc_gy = new BigInteger(sm2_ecParams['gy'], 16); C.SM2.rng = new SecureRandom(); C.SM2.ecCurve = new ECCurveFp(C.SM2.ecc_p, C.SM2.ecc_a, C.SM2.ecc_b); C.SM2.ecPointG = ECPointFp.decodeFromHex(C.SM2.ecCurve, "04" + sm2_ecParams['gx'] + sm2_ecParams['gy']); C.SM2.encryptToBase64 = function (pubkey, plainText) { var sm2DataHex = Hex.utf8StrToHex(plainText); var cipher = this.encrypt(pubkey, sm2DataHex); var binary = Hex.bufferToString(cipher); var result = btoa(binary); return result; }, C.SM2.decryptForBase64 = function (privkey, cipherHex) { var inputtext = atob(cipherHex); var cipher = Hex.toCharCodeArray(inputtext); var plain = this.decrypt(privkey, cipher); var utf8Str = Hex.hexToUtf8Str(plain); return utf8Str; }, C.SM2.getBigRandom = function (limit) { return new BigInteger(limit.bitLength(), this.rng).mod(limit.subtract(BigInteger.ONE)).add(BigInteger.ONE); }, C.SM2.generateKeyPairHex = function () { var key = this.generateKeyPairBigInteger(); var biX = key['pubkey'].getX().toBigInteger(); var biY = key['pubkey'].getY().toBigInteger(); var charlen = sm2_ecParams['keylen'] / 4; var hPrv = ("0000000000" + key['privkey'].toString(16)).slice(-charlen); var hX = ("0000000000" + biX.toString(16)).slice(-charlen); var hY = ("0000000000" + biY.toString(16)).slice(-charlen); var hPub = "04" + hX + hY; return { 'privkeyhex': hPrv, 'pubkeyhex': hPub }; }, C.SM2.generateKeyPairBigInteger = function () {
                var biN = this.ecc_n; var biPrv = null; var epPub = null; while (true) {
                    do { biPrv = this.getBigRandom(biN); }
                    while (biPrv.equals(BigInteger.ZERO) || biPrv.compareTo(biN) >= 0 || biPrv.bitLength() < 249); epPub = this.ecPointG.multiply(biPrv); if (epPub.getX().toBigInteger().bitLength() >= 249 && epPub.getY().toBigInteger().bitLength() >= 249) { break; }
                }
                return { 'privkey': biPrv, "pubkey": epPub };
            }, C.SM2.formartXY = function (bg, needLength) {
                var tmp = new Array(needLength); for (var i = 0; i < tmp.length; i++) { tmp[i] = 0; }
                var bgByte = bg.toByteArray(); if (bgByte == null) { return null; }
                if (bgByte.length > needLength) { arrayCopy(bgByte, bgByte.length - needLength, tmp, 0, needLength); } else if (bgByte.length == needLength) { tmp = bgByte; } else { arrayCopy(bgByte, 0, tmp, needLength - bgByte.length, bgByte.length); }
                return tmp;
            }, C.SM2.kdf = function (xy, data) {
                var loop = Math.ceil(data.length / 32); var sm3; var hash = new Array(32); for (var i = 0; i < loop; i++) { sm3 = new SM3Digest(); sm3.update(xy, 0, xy.length); sm3.update(intToByte(i + 1), 0, 4); hash = sm3.doFinal(); for (var j = 0; j < hash.length && (i * 32 + j) < data.length; j++) { data[i * 32 + j] ^= hash[j]; } }
                return 0;
            }, C.SM2.arrayCompare = function (src1, pos1, src2, pos2, len) {
                if (src1.length - pos1 < len) { return -1; }
                if (src2.length - pos2 < len) { return -1; }
                for (var i = 0; i < len; i++) { if (src1[pos1++] != src2[pos2++]) { return -1; } }
                return 0;
            }, C.SM2.encrypt = function (pubkey, dataHex) {
                var cipher; if (pubkey == null || pubkey.length == 0 || dataHex == null || dataHex.length == 0) { return null; }
                if (pubkey.length == 128) { pubkey = "04" + pubkey; }
                var data = Hex.decode(dataHex); var userKey = ECPointFp.decodeFromHex(this.ecCurve, pubkey); var c2 = null; var c1 = null; var x2 = null; var y2 = null; var loop = 0; do {
                    var kp = this.generateKeyPairBigInteger(); if (debug == true) { console.log("priv" + kp['privkey'].toString(16)); console.log("x1=" + kp['pubkey'].getX().toBigInteger().toString(16)); console.log("y1=" + kp['pubkey'].getY().toBigInteger().toString(16)); }
                    c1 = kp['pubkey']; var x2y2 = userKey.multiply(kp['privkey']); x2 = this.formartXY(x2y2.getX().toBigInteger(), 32); y2 = this.formartXY(x2y2.getY().toBigInteger(), 32); if (debug == true) { console.log("x2=" + x2); console.log("y2=" + y2); console.log("x2=" + Hex.encode(x2, 0, x2.length)); console.log("y2=" + Hex.encode(y2, 0, y2.length)); }
                    c2 = new Array(data.length); arrayCopy(data, 0, c2, 0, data.length); var xy = new Array(x2.length + y2.length); arrayCopy(x2, 0, xy, 0, x2.length); arrayCopy(y2, 0, xy, x2.length, y2.length); this.kdf(xy, c2); loop++;
                } while (this.arrayCompare(c2, 0, data, 0, data.length) == 0 && loop < 10); if (loop >= 10) { return null; }
                var sm3 = new SM3Digest(); sm3.update(x2, 0, x2.length); sm3.update(data, 0, data.length); sm3.update(y2, 0, y2.length); var c3 = sm3.doFinal(); if (debug == true) { console.log("data=" + Hex.encode(data, 0, data.length)); console.log("c3=" + Hex.encode(c3, 0, c3.length)); }
                var c1x = c1.getX().toBigInteger().toByteArray(); var c1y = c1.getY().toBigInteger().toByteArray(); var cipher = this.cipherToDer(c1x, c1y, c2, c3); return cipher;
            }, C.SM2.decrypt = function (privkey, cipher) {
                var dec = this.derDecode(cipher); var c1 = new Array(64 + 1); var c2 = new Array(dec["c2"].length); var c3 = new Array(32); for (var i = 0; i < c1.length; i++) { c1[i] = 0; }
                if (dec["c1x"].length <= 32) { arrayCopy(dec["c1x"], 0, c1, 1 + (32 - dec["c1x"].length), dec["c1x"].length); } else { arrayCopy(dec["c1x"], dec["c1x"].length - 32, c1, 1, 32); }
                if (dec["c1y"].length <= 32) { arrayCopy(dec["c1y"], 0, c1, 1 + 32 + (32 - dec["c1y"].length), dec["c1y"].length); } else { arrayCopy(dec["c1y"], dec["c1y"].length - 32, c1, 1 + 32, 32); }
                c1[0] = 0x04; var c1Point = ECPointFp.decodeFromHex(this.ecCurve, Hex.encode(c1, 0, c1.length)); var x2y2Point = c1Point.multiply(new BigInteger(privkey, 16)); var x2 = this.formartXY(x2y2Point.getX().toBigInteger(), 32); var y2 = this.formartXY(x2y2Point.getY().toBigInteger(), 32); var xy = new Array(x2.length + y2.length); arrayCopy(x2, 0, xy, 0, x2.length); arrayCopy(y2, 0, xy, x2.length, y2.length); arrayCopy(dec["c2"], 0, c2, 0, c2.length); var c2Copy = new Array(c2.length); arrayCopy(c2, 0, c2Copy, 0, c2.length); this.kdf(xy, c2); if (this.arrayCompare(c2Copy, 0, c2, 0, c2.length) == 0) { console.log("t is all 0 and decrypt is failed!"); return null; }
                var sm3 = new SM3Digest(); var hash = new Array(32); sm3.update(x2, 0, x2.length); sm3.update(c2, 0, c2.length); sm3.update(y2, 0, y2.length); hash = sm3.doFinal(); if (this.arrayCompare(hash, 0, dec["c3"], 0, 32) != 0) { return null; }
                return Hex.encode(c2, 0, c2.length);
            }, C.SM2.cipherToDer = function (c1x, c1y, c2, c3) {
                var c2Len = c2.length; var c2Tag = []; if (c2Len < 0x80) { c2Tag[0] = 0x04; c2Tag[1] = c2Len; } else {
                    c2Tag[0] = 0x04; var c2LenBytes = intToByte(c2Len); var i = 0; while (c2LenBytes[i] == 0 && i < c2LenBytes.length) { i++; }
                    c2Tag[1] = 0x80 | (c2LenBytes.length - i); for (var j = 2; i < c2LenBytes.length; i++, j++) { c2Tag[j] = c2LenBytes[i]; }
                }
                var totalTagLen = c1x.length + c1y.length + c2.length + c3.length + 6 + c2Tag.length; var totalTag = []; totalTag[0] = 0x30; if (totalTagLen < 0x80) { totalTag[1] = totalTagLen; } else {
                    var totalTagLenBytes = intToByte(totalTagLen); var i = 0; while (totalTagLenBytes[i] == 0 && i < totalTagLenBytes.length) { i++; }
                    totalTag[1] = 0x80 | (totalTagLenBytes.length - i); for (var j = 2; i < totalTagLenBytes.length; i++, j++) { totalTag[j] = totalTagLenBytes[i]; }
                }
                var der = new Array(totalTagLen + totalTag.length); var derLen = 0; arrayCopy(totalTag, 0, der, 0, totalTag.length); derLen += totalTag.length; der[derLen++] = 0x02; der[derLen++] = c1x.length; arrayCopy(c1x, 0, der, derLen, c1x.length); derLen += c1x.length; der[derLen++] = 0x02; der[derLen++] = c1y.length; arrayCopy(c1y, 0, der, derLen, c1y.length); derLen += c1y.length; der[derLen++] = 0x04; der[derLen++] = c3.length; arrayCopy(c3, 0, der, derLen, c3.length); derLen += c3.length; arrayCopy(c2Tag, 0, der, derLen, c2Tag.length); derLen += c2Tag.length; arrayCopy(c2, 0, der, derLen, c2.length); return der;
            }, C.SM2.derDecode = function (der) {
                var pos = 0; var totalLen = 0; if (der[pos++] != 0x30) { return null; }
                if ((der[pos] & 0xFF) <= 0x7F) { pos++; } else { pos += (der[pos] & 0x7F) + 1; }
                pos++; var c1xLen = der[pos]; var c1x = new Array(c1xLen); arrayCopy(der, ++pos, c1x, 0, c1xLen); pos += c1xLen; pos++; var c1yLen = der[pos]; var c1y = new Array(c1yLen); arrayCopy(der, ++pos, c1y, 0, c1yLen); pos += c1yLen; pos++; var c3Len = der[pos]; var c3 = new Array(c3Len); arrayCopy(der, ++pos, c3, 0, c3Len); pos += c3Len; pos++; var c2Len = 0; if ((der[pos] & 0xFF) <= 0x7F) { c2Len = der[pos] & 0xFF; } else {
                    for (var i = 0, j = (der[pos] & 0x7F) - 1; i < (der[pos] & 0x7F); i++, j--) { c2Len = c2Len | ((der[pos + i + 1] & 0xFF) << (j * 8)); }
                    pos += (der[pos] & 0x7F);
                }
                var c2 = new Array(c2Len); arrayCopy(der, ++pos, c2, 0, c2Len); pos += c2Len; return { 'c1x': c1x, "c1y": c1y, "c2": c2, "c3": c3 };
            }
        }())