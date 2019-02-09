var storage = {
    _options: {
        //语言后缀（也就是分开的数组）样例：名称_cn， 比如： content_cn content_en
        languageSuffix: {
            cn: 'cn',
            en: 'en'
        },
        saveKeyList: [],//保存数据的item的键值数组
        commonTools: null,//公共工具对象（./common.js提供）
        commonEnv: null,//公共的环境对象（./common.js提供）
 
        //初始化数据
        initData: {},
        //监控
        watch: {},
        //方法
        methods: {},
        storageType: 'sessionStorage',//存储方式
    },

    language: 'EN',//语言
    commonTools: null,//公共工具类
    commonEnv: null,//运行的环境函数
    
    //保存运行的数据（一般的数据区）
    _data: {},

    //监控数据区
    _wd: {},

    //合并对象，并监听对象
    _mergeOptions: function(options){
        var self = this;
        if(typeof options !== 'object' ||  options === null){
            return;
        }
        //设置初始化数据
        if(typeof options.initData === 'object' && options.initData !== null ){
            Object.assign(self._data, options.initData);
            delete options.initData;
        }

        //处理方法合并
        if(typeof options.methods === 'object' && options.methods !== null){
            var item = null;//临时数据
            for(var i in options.methods){
                var item = options.methods[i];
                if(typeof item === 'function'){
                    self[i] = item;
                }
            }
            delete options.methods;
        }

        //处理监听区数据
        if(typeof options.watch === 'object' && options.watch !== null){
            var watch = options.watch;
            if(typeof watch === 'object' && watch !== null){
                for(var i in watch){
                    self._watchData(i, watch[i]);
                }
            } 
            Object.assign(self._options.watch, options.watch);
            delete options.watch;
        }

        //处理saveKeyList保存列表
        if(typeof options.saveKeyList !== 'undefined' && Array.isArray(options.saveKeyList)){
            for(var i=0,item=null;i< options.saveKeyList.length;i++){
                item = options.saveKeyList[i];
                if(!self._options.saveKeyList.includes(item)){
                    self._options.saveKeyList.push(item);
                }
            }
        }
        delete options.saveKeyList;

        //合并其他选项
        Object.assign(self._options, options);
    },

    _watchData: function(attribute, setFunc){
        if(typeof attribute !== 'string' || attribute.replace(/\s*/g,'') === ''){
            return;
        }
        var self = this;
        var obj = self._wd;
        try{
            self._wd[attribute] = self._data[attribute];//初始化
            Object.defineProperty(obj, attribute, {
                set: function(newValue) {
                    self._data[attribute] = newValue;
                    setFunc(newValue);//设置值监听
                }
            });
        }catch(e){
            console.log('监听的值重复');
        }
        return self;
    },

    //初始化数据
    _initData: function(){
        var self = this;
        //公共变量环境类
        var _commonEnv = self._options.commonEnv;
        if(typeof _commonEnv !== 'object' || _commonEnv === null){
            _commonEnv = commonEnv.init();//赋值给环境变量 
        }
        self.commonEnv = _commonEnv;

        //定义公共的工具类
        var _commonTools = self._options.commonTools;
        if(typeof _commonTools !== 'object' || _commonTools === null){
            //定义公共的工具类（使用外部依赖注入）
            _commonTools = commonTools.init();
        }
        self.commonTools = _commonTools;

        //站点语言类型
        self.language = self.commonEnv.language;

        //读取静态区的数据
        Object.assign(self._data, self.readData(self._options.saveKeyList));
    },

    //设置数据
    set: function(item, value, isSaveToStorage){
        //设置进来的值，进行语言处理，在保存
        var self = this;
        if(typeof item !== 'string' || item.replace(/\s+/, '') === ''){
            throw new Error('保存数据错误，键值是必须的');
        }
        //检查是否在监控区，如果在监控区，就直接改变值
        if(typeof self._options.watch[item] === 'function'){
            var temp = self._data[item];
            //对监控区的数字支持++、--运算
            if(typeof temp === 'number'){
                if(value === '++'){
                    temp ++;
                }else if(value === '--'){
                    temp --;
                }else{
                    temp = value;
                }
            }else{
                temp = value;
            }
            self._wd[item] = temp;
            return self;
        }
        if(typeof value !== 'undefined'){
            self._data[item] = self._classifyData(value);
        }else{
            throw new Error('保存数据错误， 数据没定义');
        }
        if(typeof isSaveToStorage === 'boolean' && isSaveToStorage === true){
            console.log('将要保存到静态区');
            if(!self._options.saveKeyList.includes(item)){
                self._options.saveKeyList.push(item);
            }
            //设置完数据，保存到静态区
            return self.saveData();
        }else{
            return self;
        }
    },

    //获取数据（通过语言进行获取）
    get: function(item, language){
        var self = this;
        //检查是否在监控区，如果在监控区，就直接获取值
        if(typeof self._options.watch[item] === 'function'){
            return self._data[item];
        }

        if(typeof language !== 'string' || language === null){
            language = self.language;//使用默认的语言
        }
        language = language.toLowerCase();//统一对语言小写
        var val = self._data[item];
        if(typeof val === null || typeof val === 'undefined' || typeof val[language] === 'undefined'){
            return null;
        }else{
            return val[language];
        }
    },

    //保存数据为静态数据
    saveData: function(saveKeyList){
        var self = this;
        if(typeof saveKeyList === 'undefined' || !Array.isArray(saveKeyList)){
            saveKeyList = self._options.saveKeyList;
        }
        console.log('保存数据到静态区',saveKeyList, self._data);
        self.commonTools.saveData(saveKeyList, self._data, self._options.storageType);
        return self;
    },
    
    //读取静态数据
    readData: function(saveKeyList){
        var self = this;
        if(typeof saveKeyList === 'undefined' || !Array.isArray(saveKeyList)){
            saveKeyList = self._options.saveKeyList;
        }
        console.log('读取静态资源列表：', saveKeyList);
        return self.commonTools.readData(saveKeyList, self._options.storageType); 
    },
    
    //根据语言进行分类数据(中英文转换)
    _classifyData: function(data){
        var self = this;
        var _classifyData = null;
        if(typeof data === 'object' && data !== null){
            if(Array.isArray(data)){//数组的时候
                _classifyData = {
                    en: [],
                    cn: []
                };
                for(var i=0,item=null;i<data.length;i++){
                    item = data[i];
                    if(typeof item === 'object' && item !== null){
                        //对象（一般的对象与数组的时候需要递归接续）
                        var solveItem = self._classifyData(item);
                        _classifyData.cn.push(solveItem.cn);
                        _classifyData.en.push(solveItem.en);
                    }else{
                        //如果是直接的值类型，那么就直接赋值
                        _classifyData.push(item);
                    }
                }
            }else{//一般的对象的时候
                _classifyData = {
                    en: {},//英文
                    cn: {}//中文
                };
                var item = null;
                var cnItem = null;
                var enItem = null;
                /* var cnRe= /(.*?)\_cn$/i;
                var enRe = /(.*?)\_en$/i */;
                var cnRe= new RegExp('(.*?)\_' + self._options.languageSuffix.cn + '$', 'i');
                var enRe= new RegExp('(.*?)\_' + self._options.languageSuffix.en + '$', 'i');
                for(var i in data){
                    item = data[i];
                    if(typeof item === 'object' && item !== null){
                        item = self._classifyData(item); 
                        if(typeof item === 'object'  && item !== null){
                            cnItem = item.cn;
                            enItem = item.en;
                        }
                        cnItem =  item.en;
                    }else{
                        cnItem = enItem = item;
                    }
                    if(cnRe.test(i) && typeof cnItem !== 'undefined' && cnItem !== null){
                        _classifyData.cn[i.replace(cnRe, "$1")] = cnItem;
                    }else if(enRe.test(i) && typeof enItem !== 'undefined' && cnItem !== null){
                        _classifyData.en[i.replace(enRe, "$1")] = enItem;
                    }else if(!enRe.test(i) && !cnRe.test(i)){//没有匹配的键名
                        if(typeof item === 'object'  && item !== null){
                            if(typeof item.cn !== 'undefined' && item.cn !== null){
                                _classifyData.cn[i] = item.cn;
                            }
                            if(typeof item.en !== 'undefined' && item.en !== null){
                                _classifyData.en[i] = item.en;
                            }
                        }else{
                            _classifyData.cn[i] = item;
                        }
                    }
                }
                //没有的字段使用其他的语言补充完整
                _classifyData.cn = Object.assign({}, _classifyData.en, _classifyData.cn);
                _classifyData.en = Object.assign({}, _classifyData.cn, _classifyData.en);
            }    
        }else{
            _classifyData = {
                en: data,
                cn: data,
            };
        }
        return _classifyData;
    },

    init: function(options){
        var self = this;
        self._mergeOptions(options);
        self._initData();
        return self;
    }
}