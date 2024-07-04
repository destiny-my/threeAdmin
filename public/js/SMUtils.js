
    var SMUtils = {
        /**
         * sm3模式加密
         */
        sm3_encrypt: function (str) {
            
            return CryptoJS.SM3.encrypt(str);
        },
		getSm2KeyPair: function(){
			
			let sm2 = CryptoJS.SM2;
			var keyPair = sm2.generateKeyPairHex();	
			return {
				pubkeyhex: keyPair['pubkeyhex'].toUpperCase(),
				privkeyhex: keyPair['privkeyhex'].toUpperCase()
			}
		},
		sm2_encrypt: function(inputtext){
			console.log(CryptoJS,123131213)
			let sm2 = CryptoJS.SM2;
			//以后台公钥加密
			const pubkey = "04F91CE7462C3B2550340D217280D7A391CCE41633A03BFD729A65C216AEEA4B3E654E36CA599DB80406F9795447B7BF424FA1399CF8B1DE5D01485E0622E42894";	
			return sm2.encryptToBase64(pubkey, inputtext);
		},
		sm2_decrypt:function(inputtext){
			
			let sm2 = CryptoJS.SM2;
			//以前端私钥解密
			const privkey = "778F8F9910524011B8318B2E6AA3E737310C50A682804B7B748DBB48612E7960";
			//'04FEE990B8ED3EF514180BDC24A3F61280FA4CBB8C2F3999056DBE77B3153494953285F52111FE6AF5D1AB4C377C4A9B5D1AFA4B3AFD973CBDF122A0D5EAC52B18'
			return sm2.decryptForBase64(privkey, inputtext);
		}
    }


