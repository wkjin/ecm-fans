/* 页面公共类 */
var commonPage = {
    _options: {
        //引入类
        commonEnv: null,//环境类（从./common.js中导入）
        server: null,//服务类（从 ./server.js中导入）
        storage: null,//使用的仓库（从./storage.js中引入）

        layoutDataName: 'layoutData',//布局数据名字
        layoutVersionName: 'layoutDataVersion',//布局数据变化版本变化（用于监控）

        categoryDataName: 'categoryData',//栏目数据保存名字
        categoryVersionName: 'categoryDataVesion',//栏目数据版本变化（用于监控）

        fragmentDataName: 'fragmentData',//碎片数据保存名字
        fragmentVersionName: 'fragmentDataVesion',//碎片数据版本变化（用于监控）
        
        //内部使用配置
        isCache: true,//是否缓存
    },

    commonEnv: null,//环境类
    server: null,//使用的服务类
    storage: null,//仓库变量
    _isHasInit: false,//是否已经初始化

    //监听队列
    _listenQueueLayout: [],//布局的监听队列
    _listenQueueCategory: [],//栏目的监听队列
    _listenQueueFragment: [],//碎片的监听队列

    _initData: function(){
        var self = this;
        //检查是否已经初始化
        if(self._isHasInit){//只进行一次初始化
            return self;
        }else{
            self._isHasInit = true;
        }
        
        //公共变量环境类
        var _commonEnv = self._options.commonEnv;
        if(typeof _commonEnv !== 'object' || _commonEnv === null){
            _commonEnv = commonEnv;//环境类直接赋值
            if(_commonEnv.language === null){//未初始化，那么就初始化
                _commonEnv = _commonEnv.init();
            }
        }
        self.commonEnv = _commonEnv;
        
        //对服务类初始化
        var _server = self._options.server;
        if(typeof _server !== 'object' || _server === null){
            _server = server.init();//赋值给服务类
        }
        self.server = _server;
        
        //对仓库类初始化
        var _storage = self._options.storage;
        if(typeof _storage !== 'object' || _storage === null){
            _storage = storage.init();//赋值给仓库
        }
        self.storage = _storage;
  
        //添加语言监听
        self.commonEnv.addListenLanguageChange(function(language){
            //通知所有的数据进行改变
            console.log('这是commonPage添加监听语言变化', language);
            //通知数据变化
            self.storage.set(self._options.layoutVersionName, '++');
            self.storage.set(self._options.categoryVersionName, '++');
            self.storage.set(self._options.fragmentVersionName, '++');
        });

        //添加监控
        var saveKeyList = [
            self._options.categoryDataName,
            self._options.fragmentDataName,
            self._options.layoutDataName
        ];
        var initData = {};
        initData[self._options.layoutVersionName] = 1;
        initData[self._options.categoryVersionName] = 1;
        initData[self._options.fragmentVersionName] = 1;
        var watch = {};
        watch[self._options.layoutVersionName] = function(value){//布局变化监听
            var listenList = self._listenQueueLayout;
            var data = self.storage.get(self._options.layoutDataName);
            for(var i = 0; i< listenList.length; i++){
                listenList[i](data, value);
            }
        };
        watch[self._options.categoryVersionName] = function(value){//栏目变化监听
            var listenList = self._listenQueueCategory;
            var data = self.storage.get(self._options.categoryDataName);
            for(var i = 0; i< listenList.length; i++){
                listenList[i](data, value);
            }
        };
        watch[self._options.fragmentVersionName] = function(value){//碎片变化监听
            var listenList = self._listenQueueFragment;
            var fragmentData = self.storage.get(self._options.fragmentDataName);
            var _fragmentData = {};//去掉多余的信息
            Object.keys(fragmentData).forEach(function(key){
                _fragmentData[key] = fragmentData[key].value;
            });
            var layoutData = self.storage.get(self._options.layoutDataName);
            for(var i = 0; i< listenList.length; i++){
                listenList[i](_fragmentData, value, layoutData, fragmentData);
            }
        };
        //添加仓库监控
        self.storage.init({
            saveKeyList: saveKeyList,
            initData: initData,
            watch: watch
        });

        
        //获取初始值
        self.getLayoutData();
        self.getCategoryData(); 
        self.getFragmentData();
        return self;
    },

    //获取布局数据
    getLayoutData: function(){
        var self = this;
        var layoutDataName = self._options.layoutDataName;
        var layoutData = self.storage.get(layoutDataName);
        if(typeof layoutData !== 'object' || layoutData === null){
            $.getJSON('../data/layout.json?id=' + Math.random(),function(data){
                self.storage.set(layoutDataName, data, true).set(self._options.layoutVersionName, '++');
            });
        }else{
            //如果已经有值就可以通知布局数据修改
            setTimeout(function(){//等待主线程加载完毕
                self.storage.set(self._options.layoutVersionName, '++');
            }, 0);
        }
    },
    //添加栏目监听
    addListenLayout: function(func){
        var self = this;
        if(typeof func === 'function'){
            self._listenQueueLayout.push(func);
            return true;
        }else{
            return false;
        }
    },

    //获取栏目数据
    getCategoryData: function(){//如果没有保存数据，那么就获取，如果有就直接获取缓存
        var self = this;
        var categoryName = self._options.categoryDataName;
        var categoryData = self.storage.get(categoryName);
        if(!Array.isArray(categoryData)){
            self.server.init().getCategorys(function(res){
                if(res.status === 1){//获取数据成功
                    //设置数据到仓库，并通知改变数据
                    self.storage.set(categoryName, res.data, true).set(self._options.categoryVersionName, '++');
                }else{
                    console.error(res.message);
                }
            });
        }else{
            //如果已经有值就可以通知栏目修改
            setTimeout(function(){//等待主线程加载完毕
                self.storage.set(self._options.categoryVersionName, '++');
            }, 0);
        }
    },
    //添加栏目监听
    addListenCategory: function(func){
        var self = this;
        if(typeof func === 'function'){
            self._listenQueueCategory.push(func);
            return true;
        }else{
            return false;
        }
    },
    
    //获取碎片数据：如果没有保存数据，那么就获取，如果有就直接获取缓存
    getFragmentData: function(){
        var self = this;
        //查看碎片是否加载
        var fragmentDataName = self._options.fragmentDataName;
        var fragmentData = self.storage.get(fragmentDataName);
        if(typeof fragmentData !== 'object' || fragmentData === null){
            server.getFragments(function(res){
                if(res.status === 1){//获取数据成功
                    //设置数据到仓库，并通知改变数据
                    self.storage.set(fragmentDataName, res.data, true).set(self._options.fragmentVersionName, '++');
                }else{
                    console.error(res.message);
                }
            });
        }else{
            setTimeout(function(){//等待主线程加载完毕
                self.storage.set(self._options.fragmentVersionName, '++');
            }, 0);
        }
    },
    //添加碎片监听
    addListenFragment: function(func){
        var self = this;
        if(typeof func === 'function'){
            self._listenQueueFragment.push(func);
            return true;
        }else{
            return false;
        }
    },
    //把碎片数据分隔
    splitFragment: function(name, delimiter, fullIndex, isInsertBefore){
        var self = this;
        fullIndex = typeof fullIndex !== 'string'?'请选择':fullIndex;
        isInsertBefore = typeof isInsertBefore === 'undefined'?true: !!isInsertBefore;
        delimiter = typeof delimiter === 'string'?delimiter: '|';
        var fragmentData = self.storage.get(self._options.fragmentDataName);
        if(typeof fragmentData !== 'object' || fragmentData === null){
            console.error('碎片获取失败');
            return null;
        }
        var v = fragmentData[name];
        if(typeof v === 'object' && v !== null){
            vv = v.value;
            var res = vv.split(delimiter);
            var va = [];
            for(var i=0,item=null;i<res.length;i++){
                item = res[i];
                va.push({name: item, value: item});
            }
            if(va[0].name === ''){
                va[0].value = fullIndex;
            }else if(isInsertBefore){
                va.splice(0, 0, {name: '', value: fullIndex});
            }
            return va;
        }else{
            return null;
        }
    },

    //初始化
    init: function(options){
        var self = this;
        Object.assign(self._options, options);
        self._initData();
        return self;
    }
}