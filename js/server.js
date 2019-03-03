var server = {
    _options: {
        commonEnv: null,//公共的环境对象（./common.js提供）
        commonTools:  null,//公共工具对象（.commom.js提供）
        /* host: 'http://api.ecm-fans.com/v1.0/',//请求的根目录 */
        host: 'http://api.ecm-fans.com',//请求的根目录

        //获取信息的api定义
        getCategorysUrl: '/Home/category/getCategorys',//获取栏目列表
        getCategorysByConditionUrl: '/Home/category/getCategorysByCondition',//通过条件获取栏目信息
        getCategorysByOrConditionUrl: '/Home/category/getCategorysByOrCondition',//通过条件获取栏目信息
        getFragmentsUrl: '/Home/fragment/getFragments',//获取碎片
        getArticlesUrl: '/Home/Article/getArticles',//获取文章列表
        getArticleDetailUrl: '/Home/Article/getArticleDetail',//获取文章详情

        getProductsUrl: '/Home/Product/getProducts',//获取产品列表
        getProductDetailUrl: '/Home/Product/getProductDetail',//获取产品详情

        //发送在线留言
        sendOnlineMessageUrl: '/Home/User/onlineMessage',//发送在线留言的url
    },

    commonEnv: null,//公共方法
    language: '',//站点语言类型

    _isHasInit: false,//是否初始化

    //初始化数据
    initData: function(){
        var self = this;
        //检查是否已经初始化
        if(self._isHasInit){//只进行一次初始化
            return self;
        }else{
            self._isHasInit = true;
        }
        //公共变量环境初始化
        var _commonEnv = self._options.common;
        if(typeof _commonEnv === 'object' && _commonEnv !== null){
            self.commonEnv = _commonEnv;
        }else{
            self.commonEnv = commonEnv.init();//赋值给环境变量 
        }

        //站点语言类型
        self.language = self.commonEnv.language;
    },

    //获取栏目信息(头部信息)
    getCategorys: function(callback){
        this.requestAndCallBack(null, this._options.getCategorysUrl, callback);
    },
    //获取栏目信息通过条件
    getCategorysByCondition: function(condition, callback){
        this.requestAndCallBack(condition, this._options.getCategorysByConditionUrl, callback);
    },
    //获取栏目信息通过or条件
    getCategorysByOrConditon: function(condition, callback){
        this.requestAndCallBack(condition, this._options.getCategorysByOrConditionUrl, callback);
    },

    //获取碎片信息
    getFragments: function(callback){
        this.requestAndCallBack(null, this._options.getFragmentsUrl, callback);
    },

    //获取文章列表
    getArticles: function(search, callback){
        this.requestAndCallBack(search, this._options.getArticlesUrl, callback);
    },
    
    //获取文章详情
    getArticleDetail: function(search, callback){
        this.requestAndCallBack(search, this._options.getArticleDetailUrl, callback);
    },

    //获取获取产品列表
    getProducts: function(search, callback){
        this.requestAndCallBack(search, this._options.getProductsUrl, callback);
    },
    
    //获取产品详情
    getProductDetail: function(search, callback){
        this.requestAndCallBack(search, this._options.getProductDetailUrl, callback);
    },

    //发送留言
    sendOnlineMessage: function(data, callback){
        this.requestAndCallBack(data, this._options.sendOnlineMessageUrl, callback, 'post');
    },
    
    //请求并回调
    requestAndCallBack: function(search, url, callback, type){
        var self = this;
        var data = {};
        if(typeof search === 'object'){
            Object.assign(data, search);
        }else if(typeof search === 'string'){
            data = search;
        }
        //发送请求
        self.requestUrl({
            url: url,
            data: data,
            type: (typeof type === undefined)?'get':type,
            callback: function(result){
                if(typeof callback === 'function'){
                    callback(result);
                }
            }
        });
    },

    //统一请求（处理中英文）
    requestUrl: function(requestObj){
        // requestObj = {url, data, callback, type, isToken}
        var self = this;
        var type = requestObj.type;
        type = type?type: 'get';//请求的方式
        //发送请求
        $.ajax({
            data: requestObj.data,
            url: self._options.host + requestObj.url,
            type: type,
            crossDomain: true,
            xhrFields:{
                withCredentials: true
            },//携带身份验证
            success: function(data){
                if(typeof requestObj.callback === 'function'){
                    requestObj.callback(data);
                }
            },
            error: function(XMLHttpRequest){
                console.log('网络错误！！！！');
            }
        });
    },

    //初始化方法
    init: function(options){
        var self = this;
        self.initData();
        return self;
    }
}

