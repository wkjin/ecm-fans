var headerObj = {
    _options: {
        navSelectedClass: 'nav-selected',//栏目选中的id
        navDropDownSelector: '.nav-drop-down',//栏目下拉的容器
        navULSelector: '.nav-list',//导航ul的li列表的容器ul
        navTextContainerSelector: '.nav-header',//文字导航的文字
        navLogoSelector: '.logo-area > img',//logo图片的选择器
    },

    _parentObj: null,//父容器的对象

    _initData: function(){
        var self = this;
        this._parentObj = $(self._options.navTextContainerSelector);
    }, 

    _initEven: function(){
        var self = this;
        this._parentObj.find(self._options.navULSelector).find('li').hover(function(){
            var $this = $(this);
            $this.addClass(self._options.navSelectedClass);
            $this.find(self._options.navDropDownSelector).stop().slideDown();
        },function(){
            var $this = $(this);
            $this.find(self._options.navDropDownSelector).stop().slideUp(function(){
               $this.removeClass(self._options.navSelectedClass); 
            });
        });
    },


    init: function(options){
        this._initData();
        this._initEven();
    }
}
$(function(){
    $('.header').load('./tpl/header.html', function(){
        headerObj.init();
    });
});