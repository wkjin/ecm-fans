var headerObj = {
    _options: {
        //数据层面
        commonPage: null,//公共页面对象（从 ./common-page.js提供）

        //页面选项
        headerSelector: '.header',//头部选择器
        navSelectedClass: 'nav-selected',//栏目选中的id
        navDropDownSelector: '.nav-drop-down',//栏目下拉的容器
        navULSelector: '.nav-list',//导航ul的li列表的容器ul
        navTextContainerSelector: '.nav-bottom',//文字导航的文字
        navLogoContainerSelector: '.logo-area',//logo图片的选择器
        categoryData: null,//栏目信息
        fragmentData: null,//碎片信息

        headerLogoTemplateId: 'js-header-logo',//头部logo模板id
        headerLiTemplateId: 'js-header-category',//头部nav的li的模板id
    
        //语言栏
        enButtonSelector: '.js-language-en',//英文按钮选择器
        cnButtonSelector: '.js-language-cn',//中文按钮选择器
    },

    commonPage: null,//公共页面对象
    _parentObj: null,//父容器的对象

    _initData: function(){
        var self = this;
        //=============  数据初始化 ======================
        //对公共页面对象初始化
        var _commonPage = self._options.commonPage;
        if(typeof _commonPage !== 'object' || _commonPage === null){
            _commonPage = commonPage.init();//赋值给服务类
        }
        self.commonPage = _commonPage;

        //添加栏目监听事件
        self.commonPage.addListenCategory(function(data){
            self._fullNavListHtml(data);
        });
        //添加碎片监听事件
        self.commonPage.addListenFragment(function(data){
            self._fullLogoHtml(data);
        });

        //============== 对页面初始化 ======================
        this._parentObj = $(self._options.headerSelector);
    }, 

    //填充html
    _fullHtml: function(data){
        var self = this;
        self._fullNavListHtml();
        self._fullLogoHtml();
    },

    //填充导航列表的html
    _fullNavListHtml: function(data){
        var self = this;
        var data = (typeof data !== 'undefined' && Array.isArray(data)) ? data: self._options.categoryData;
        self._options.categoryData = data;//保存数据最新
        if(Array.isArray(data)){
            var html = template(self._options.headerLiTemplateId, {listData: data});
            this._parentObj.find(self._options.navULSelector).html(html);

            //菜单下拉绑定
            self._parentObj.find(self._options.navULSelector).find('li').hover(function(){
                var $this = $(this);
                $this.addClass(self._options.navSelectedClass);
                $this.find(self._options.navDropDownSelector).stop().slideDown();
            },function(){
                var $this = $(this);
                $this.find(self._options.navDropDownSelector).stop().slideUp(function(){
                $this.removeClass(self._options.navSelectedClass); 
                });
            });
        }
    },
    //填充logo的html
    _fullLogoHtml: function(fragmentData){
        var self = this;
        var fragmentData = (typeof fragmentData === 'object' && fragmentData !== null) ? fragmentData: self._options.fragmentData;
        self._options.fragmentData = fragmentData;//保存数据最新
        if(typeof fragmentData === 'object' && fragmentData !== null){
            var html = template(self._options.headerLogoTemplateId, {logo: fragmentData.company_logo});
            console.log(html);
            this._parentObj.find(self._options.navLogoContainerSelector).html(html);
        }
    },

    _initEven: function(){
        var self = this;
        //语言变换
        self._parentObj.find(self._options.enButtonSelector + ' , ' + self._options.cnButtonSelector).off('click').on('click', function(){
            var $this = $(this);
            var languageStr = $this.data('language');
            if(languageStr !== storage.language){
                commonEnv.changeLanguage($this.data('language'),function(language){
                    storage.language = language;//对语言手动修改
                });
            }
        });
    },


    init: function(options){
        var self = this;
        Object.assign(self._options, options);
        self._initData();
        self._fullHtml();
        self._initEven();
        console.log('头部初始化完毕');
    }
}
$(function(){
    $('.header').load('./tpl/common-header.html', function(){
        headerObj.init();
    });
});