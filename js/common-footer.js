var footerObj = {
    _options: {
        fragmentData: null,//碎片信息
        layoutData: null,//布局信息
        commonPage: null,//公共页面数据

        footerSelector: '.footer',//页脚的选择器
        footerInfoTemplateId: 'js-footer-info',//页脚信息模板id
    },

    commonPage: null,//公共页面

    _initData: function(){
        var self = this;
        //=============  数据初始化 ======================
        //对公共页面对象初始化
        var _commonPage = self._options.commonPage;
        if(typeof _commonPage !== 'object' || _commonPage === null){
            _commonPage = commonPage.init();//赋值给服务类
        }
        self.commonPage = _commonPage;

        //添加碎片监听事件
        self.commonPage.addListenFragment(function(fragmentValueData, version, layoutData, fragmentData){
            self._fullHtml(fragmentValueData, layoutData);
        });

        //============== 对页面初始化 ======================
        this._parentObj = $(self._options.footerSelector);
    },

    _fullHtml: function(fragmentData, layoutData){
        var self = this;
        if(typeof fragmentData === 'object' && fragmentData !== null){
            self._options.fragmentData = fragmentData;
        }else{
            fragmentData = self._options.fragmentData;
        }
        if(typeof layoutData === 'object' && layoutData !== null){
            self._options.layoutData = layoutData;
        }else{
            layoutData = self._options.layoutData;
        }
        if(typeof fragmentData !== 'object' || fragmentData === null || typeof layoutData !== 'object' || layoutData === null ){
            return self;
        }
        var html = template(self._options.footerInfoTemplateId, {
            year: new Date().getFullYear(),
            company_name: fragmentData['company_name'],
            company_copyright: fragmentData['company_copyright'],
            company_address: fragmentData['company_address'],
            telephone: fragmentData['telephone'],
            fax: fragmentData['fax'],
            layout: layoutData
        });
        this._parentObj.html(html);
    },
    
    init: function(){
        var self = this;
        self._initData();
        console.log('页脚加载完毕');
        return self;
    }
}
$(function(){
    $('.footer').load('./tpl/common-footer.html', function(){
        footerObj.init();
    });
});