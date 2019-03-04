//对环境处理

//做Object.assign的兼容
if(typeof(Object.assign) != 'function'){
    Object.assign = function(targetObj){
        if(!targetObj){
            return null;
        }
        for(var i=1;i<arguments.length;i++){
            var tempObj = arguments[i];
            if(tempObj && typeof(tempObj) == 'object'){
                for(var key in tempObj){
                    targetObj[key] = tempObj[key];
                }
            }
        }
        return targetObj;
    }
}

if(typeof(Array.prototype.includes) !== 'function'){
    Array.prototype.includes = function(item){
        var arr = this;
        for(var i=0;i< arr.length;i++){
            if(arr[i] === item){
                return true;
            }
        }
        return false;
    }
}

//common工具类
var commonTools = {
    _options: {
        storageType: 'localStorage',//使用localStorage或者sessionStorage
    },

    //保存数据到localStorage中
    saveData: function(saveKeyList, data, storageType){
        var self = this;
        if(!Array.isArray(saveKeyList) || typeof data !== 'object' || data === null){
            throw new Error('存储错误');
        }
        var storageT = self._defineStorageType(storageType);
        for(var i=0,item = null, saveStr = '';i < saveKeyList.length; i++){
            item = saveKeyList[i];
            saveStr = JSON.stringify(data[item]);
            if(storageT === 1){
                localStorage.setItem(item, saveStr);
            }else if(storageT === 3){
                sessionStorage.setItem(item, saveStr);
            }else if(storageT == 2){
                self.setCookie(item, saveStr);
            }else{
                throw new Error('存储错误');
            }
        }
        return self;
    },

    //读取保存的数据到对象
    readData: function(saveKeyList, storageType){
        var self = this;
        if(!Array.isArray(saveKeyList)){
            return null;
        }
        var storageT = self._defineStorageType(storageType);
        var data = {};//获取到的数据通过对象返回
        for(var i=0,item = null, temp = null;i < saveKeyList.length; i++){
            item = saveKeyList[i];
            if(storageT === 1){
                temp = localStorage.getItem(item);
            }else if(storageT == 3){
                temp = sessionStorage.getItem(item);
            }else if(storage === 2){
                temp = self.getCookie(item);
            }else{
                throw new Error('存储错误');
            }
            if(typeof temp === 'string' && temp !== '' && temp !== "" && typeof temp !== 'undefined'){
                try{
                    data[item] = JSON.parse(temp);
                }catch(e){
                    console.log(item + '转json错误');
                }
            }
        }
        return data;
    },

    //定义存储方式（l、localStorage 2、cookie 3、sessionStorage）
    _defineStorageType: function(storageType){
        var self = this;
        if(typeof storageType !== 'string' || storageType === null || storageType.replace(/\s+/, '') === ''){
            storageType = self._options.storageType;
        }
        var storageT = 0;//存储方式（l、localStorage 2、cookie 3、sessionStorage）
        storageType = storageType.toUpperCase();
        if(storageType === 'COOKIE'){
            storageT = 2;//使用cookie
        }else if(storageType === 'SESSIONSTORAGE'){
            storageT = 3;//使用sessionStorage
        }else{
            storageT = 1;//默认localStorage
        }
        return storageT;
    },

    //写cookies 
    setCookie: function(name,value) { 
        var Days = 30; 
        var exp = new Date(); 
        exp.setTime(exp.getTime() + Days*24*60*60*1000); 
        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString(); 
    },

    //读取cookies 
    getCookie: function(name){ 
        var arr,reg=new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if(arr = document.cookie.match(reg)){
            return unescape(arr[2]); 
        }else{
            return null; 
        }
    }, 

    //删除cookies
    delCookie: function(name){ 
        var exp = new Date(); 
        exp.setTime(exp.getTime() - 1); 
        var cval=getCookie(name); 
        if(cval!=null){
            document.cookie= name + "="+cval+";expires="+exp.toGMTString(); 
        }
    },

    //获取请求参数
    getRequestParam: function(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    },

    init: function(options){
        var self = this;
        Object.assign(self._options, options);
        return self;
    }
}

//创建公共环境类
var commonEnv = {
    _options: {
        defaultLanguage: 'CN',//默认语言（中文）(大写)
        saveDataList: [
            'language',//语言
        ],
        commonTools: null,//工具函数
    },
    
    language: null,//默认的语言cn：cn中文，en英文
    commonTools: null,//公共工具类
    languageChangeCallBackArr: [],//语言改变的回调数组
    _isHasInit: false,//是否初始化

    _initData: function(){
        var self = this;
        //获取站点类型（中英文），默认中文（在url后面添加#en）
        var languageRe = /\#EN$/i;
        if(languageRe.test(window.location.href)){
            self.language = 'EN';
        }else{
            var _language = self._language;
            //读取缓存
            if(_language === null){
                _language = self._options.defaultLanguage;
            }else if(typeof _language === 'string'){
                if(_language !== 'EN' && _language !== 'CN'){
                    _language = self._options.defaultLanguage;
                }
            }else{
                _language = self._options.defaultLanguage;
            }
            self.language = _language;
        }

        //定义公共的工具类
        var _commonTools = self._options.commonTools;
        if(typeof _commonTools !== 'object' || _commonTools === null){
            //定义公共的工具类（使用外部依赖注入）
            _commonTools = commonTools.init({
                storageType: 'localStorage'
            });
        }
        self.commonTools = _commonTools;
    },

    //改变语言
    changeLanguage: function(languageStr, callback){
        var self = this;
        if(typeof languageStr === 'string'){
            languageStr = languageStr.toUpperCase();
            if(languageStr !== 'EN' && languageStr !== 'CN'){
                console.log('修改语言失败');
            }else{
                self.language = languageStr;
                self.commonTools.saveData(self._options.saveDataList, JSON.parse(JSON.stringify(self)));//保存到静态区
                if(typeof callback === 'function'){
                    callback(self.language);
                }
                //广播通知语言更新
                var languageChangeCallBackArr = self.languageChangeCallBackArr;
                for(var i=0;i<languageChangeCallBackArr.length;i++){
                    languageChangeCallBackArr[i](self.language);
                }
                return;
            }
        }else{
            console.log('语言的不是字符串，请核对，切换语言失败');
        }
        if(typeof callback === 'function'){
            callback();
        }
    },

    //添加语言改变监听
    addListenLanguageChange: function(func){
      if(typeof func !== 'function'){
          return false;
      }else{
          this.languageChangeCallBackArr.push(func);
          return true;
      }
    },
    
    init: function(options){
        var self = this;
        //检查是否已经初始化
        if(self._isHasInit){//只进行一次初始化
            return self;
        }else{
            self._isHasInit = true;
        }
        //1、合并参数
        Object.assign(self._options, options);
        //2、初始化数据
        self._initData();
        //3、读取静态数据（读取静态区的数据保存到对象中）
        Object.assign(self, self.commonTools.readData(self._options.saveDataList));

        //4、保存基本数据为静态数据
        self.commonTools.saveData(self._options.saveDataList, JSON.parse(JSON.stringify(self)));
        return self;
    }
}